/**
 * Linda's private day-view page at /linda.
 *
 * Mobile-first UI so she can use it on her phone: calendar date picker,
 * prev/next day buttons, appointment list with tap-to-call / tap-to-email.
 * Idle overlay pauses background polling after 2 minutes of no activity;
 * WebSocket subscription pushes new bookings in real time so no polling
 * is needed at all while she's on the page.
 *
 * Auth is a separate password (env.LINDA_PASSWORD) stored in a
 * `linda_sig` cookie. Admin sig also grants access.
 */
import type { Env, Appointment } from '../types';
import { computeLindaSig, verifyLindaSig, verifyAdminSig } from '../services/crypto';
import { todayKeyLocal, nowIso, nowMinutesLocal, parseTimeToMinutes, toDateKey, todayLocal } from '../services/utils';
import { buildLindaSlots, getLindaExtrasForDate, loadLindaConfig } from '../services/linda';
import { getTakenSlots, bumpVersion, getAppointmentById, isSlotTaken, updateAppointmentStatus, insertAppointment, getOrCreateClient } from '../db/queries';
import { generateId } from '../services/crypto';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendar';
import { sendAppointmentPushedEmail, sendLindaConfirmationEmail, sendDoctorBookingEmail, sendClientCancelledEmail, sendCustomNotificationEmail } from '../services/email';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function readCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^\\s;]+)'));
  return m ? m[1] : null;
}

async function isLindaAuthed(req: Request, env: Env): Promise<boolean> {
  const linda = readCookie(req, 'linda_sig');
  if (linda && await verifyLindaSig(linda, env.ADMIN_SECRET)) return true;
  const admin = readCookie(req, 'admin_sig');
  if (admin && await verifyAdminSig(admin, env.ADMIN_SECRET)) return true;
  return false;
}

// ─── /api/linda-day ────────────────────────────────────────

export async function apiLindaGetDay(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);

  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);

  const rows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time, service_name, full_name, email, phone, comments, status " +
    "FROM appointments WHERE clinic = 'linda' AND date_key = ? ORDER BY start_time"
  ).bind(dateKey).all<Appointment>();

  return json({ ok: true, dateKey, appointments: rows.results });
}

// ─── /api/linda-next-day ───────────────────────────────────
// Returns the first date >= today that has a non-cancelled Linda appointment.
// If today has any, returns today. If none anywhere in the future, returns today.

export async function apiLindaNextDay(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);

  const todayKey = todayKeyLocal(env.TIMEZONE);
  const row = await env.DB.prepare(
    "SELECT MIN(date_key) AS dk FROM appointments " +
    "WHERE clinic = 'linda' AND date_key >= ? AND status NOT LIKE '%CANCELLED%'"
  ).bind(todayKey).first<{ dk: string | null }>();

  const dateKey = row?.dk || todayKey;
  return json({ ok: true, dateKey, todayKey, timezone: env.TIMEZONE });
}

// ─── /api/linda-search ─────────────────────────────────────
// Matches name/phone/email across all Linda appointments. Limit 20.

export async function apiLindaSearch(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return json({ ok: true, results: [] });
  const pat = '%' + q + '%';
  const rows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time, full_name, email, phone, status " +
    "FROM appointments WHERE clinic = 'linda' AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?) " +
    "ORDER BY date_key DESC, start_time DESC LIMIT 20"
  ).bind(pat, pat, pat).all<any>();
  return json({ ok: true, results: rows.results });
}

// ─── /api/linda-week ───────────────────────────────────────
// Returns all Linda appointments + extra-hours for the 7 days
// starting at `start` (ISO date). Used by the Week tab.

export async function apiLindaWeek(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const start = (url.searchParams.get('start') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return json({ ok: false, reason: 'Invalid start.' }, 400);

  // Compute end = start + 6 days.
  const [y, m, d] = start.split('-').map(Number);
  const startD = new Date(y, m - 1, d);
  const endD = new Date(y, m - 1, d + 6);
  const end = endD.getFullYear() + '-' + String(endD.getMonth() + 1).padStart(2, '0') + '-' + String(endD.getDate()).padStart(2, '0');

  const cfg = await loadLindaConfig(env.DB);

  const apptRows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time, full_name, email, phone, comments, status " +
    "FROM appointments WHERE clinic = 'linda' AND date_key >= ? AND date_key <= ? ORDER BY date_key, start_time"
  ).bind(start, end).all<any>();

  const extraRows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time FROM linda_extra " +
    "WHERE date_key >= ? AND date_key <= ? ORDER BY date_key, start_time"
  ).bind(start, end).all<any>();

  // Base weekly hours (JSON) passed through so the client can shade working windows.
  return json({
    ok: true,
    start, end,
    appointments: apptRows.results,
    extras: extraRows.results,
    baseHours: cfg.hours,
    slotMin: cfg.slotMin,
    enabled: cfg.enabled,
  });
}

// ─── /api/linda-clients-autocomplete ───────────────────────
// Returns up to 8 distinct patients (from appointments.clinic='linda')
// matching the query across name/email/phone.

export async function apiLindaClientsAutocomplete(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return json({ ok: true, results: [] });
  const pat = '%' + q + '%';
  const rows = await env.DB.prepare(
    "SELECT full_name, email, phone FROM appointments " +
    "WHERE clinic = 'linda' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?) " +
    "GROUP BY email, phone " +
    "ORDER BY MAX(date_key) DESC LIMIT 8"
  ).bind(pat, pat, pat).all<{ full_name: string; email: string; phone: string }>();

  return json({ ok: true, results: rows.results.map(r => ({ fullName: r.full_name, email: r.email, phone: r.phone })) });
}

// ─── /api/linda-patient-history ────────────────────────────
// All Linda appointments for a given patient (keyed by email OR phone),
// plus simple stats. Limit 200.

export async function apiLindaPatientHistory(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').trim();
  const phone = (url.searchParams.get('phone') || '').trim();
  if (!email && !phone) return json({ ok: false, reason: 'Missing email or phone.' }, 400);

  const rows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time, full_name, email, phone, comments, status " +
    "FROM appointments WHERE clinic = 'linda' AND (email = ? OR phone = ?) " +
    "ORDER BY date_key DESC, start_time DESC LIMIT 200"
  ).bind(email, phone).all<any>();

  const appts = rows.results;
  let total = 0, attended = 0, noShow = 0, cancelled = 0, upcoming = 0;
  const todayKey = todayKeyLocal(env.TIMEZONE);
  let lastVisit = '';
  for (const a of appts) {
    total++;
    if (a.status === 'ATTENDED') attended++;
    else if (a.status === 'NO_SHOW') noShow++;
    else if (String(a.status).includes('CANCELLED')) cancelled++;
    if (a.date_key >= todayKey && !String(a.status).includes('CANCELLED')) upcoming++;
    if (a.date_key < todayKey && a.status === 'ATTENDED' && (!lastVisit || a.date_key > lastVisit)) lastVisit = a.date_key;
  }

  return json({ ok: true, appointments: appts, stats: { total, attended, noShow, cancelled, upcoming, lastVisit } });
}

// ─── /api/linda-slots ──────────────────────────────────────
// Returns all slots for a date with availability + whether the date is
// "working" (base hours or extras). Used by the Book and Reschedule modals.

export async function apiLindaSlots(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);

  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);

  const cfg = await loadLindaConfig(env.DB);
  const extras = await getLindaExtrasForDate(env.DB, dateKey);
  const baseSlots = buildLindaSlots(dateKey, cfg, extras);

  const tz = env.TIMEZONE;
  const todayKey = todayKeyLocal(tz);
  const nowMin = nowMinutesLocal(tz);

  const taken = await getTakenSlots(env.DB, dateKey, 'linda');
  const slots = baseSlots.map(s => {
    const startMin = parseTimeToMinutes(s.start);
    const past = dateKey === todayKey ? startMin < nowMin : false;
    const isTaken = taken.has(s.start);
    return { start: s.start, end: s.end, available: !past && !isTaken, taken: isTaken, past };
  });

  const isWorkingDay = baseSlots.length > 0;
  return json({ ok: true, dateKey, slots, isWorkingDay, extras });
}

// ─── /api/linda-extras ─────────────────────────────────────
// List upcoming ad-hoc availability Linda has added.

export async function apiLindaListExtras(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const todayKey = todayKeyLocal(env.TIMEZONE);
  const rows = await env.DB.prepare(
    'SELECT id, date_key, start_time, end_time, reason FROM linda_extra WHERE date_key >= ? ORDER BY date_key, start_time'
  ).bind(todayKey).all<{ id: number; date_key: string; start_time: string; end_time: string; reason: string }>();
  return json({ ok: true, extras: rows.results });
}

// Add an extra availability window. Body: { dateKey, startTime, endTime, reason? }
// If dateKey is a date range (dateKeyEnd provided), inserts one row per day.

export async function apiLindaAddExtra(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const dateKey = String(body.dateKey || '').trim();
  const dateKeyEnd = String(body.dateKeyEnd || '').trim();
  const startTime = String(body.startTime || '').trim();
  const endTime = String(body.endTime || '').trim();
  const eveningStart = String(body.eveningStart || '').trim();
  const eveningEnd = String(body.eveningEnd || '').trim();
  const reason = String(body.reason || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (dateKeyEnd && !/^\d{4}-\d{2}-\d{2}$/.test(dateKeyEnd)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return json({ ok: false, reason: 'Invalid time.' }, 400);
  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return json({ ok: false, reason: 'End time must be after start time.' }, 400);

  // Build the list of time ranges to insert per day (morning always, evening optional).
  const ranges: { start: string; end: string }[] = [{ start: startTime, end: endTime }];
  const hasEvening = eveningStart && eveningEnd;
  if (hasEvening) {
    if (!/^\d{2}:\d{2}$/.test(eveningStart) || !/^\d{2}:\d{2}$/.test(eveningEnd)) {
      return json({ ok: false, reason: 'Invalid evening time.' }, 400);
    }
    if (parseTimeToMinutes(eveningEnd) <= parseTimeToMinutes(eveningStart)) {
      return json({ ok: false, reason: 'Evening end must be after evening start.' }, 400);
    }
    if (parseTimeToMinutes(eveningStart) < parseTimeToMinutes(endTime)) {
      return json({ ok: false, reason: "Evening start must be after the morning end." }, 400);
    }
    ranges.push({ start: eveningStart, end: eveningEnd });
  }

  const endDate = dateKeyEnd && dateKeyEnd >= dateKey ? dateKeyEnd : dateKey;
  const now = nowIso(env.TIMEZONE);

  // Insert one row per range per day, skipping any that would collide
  // with an existing extra for the same day (overlap or exact duplicate).
  let count = 0, skipped = 0;
  const [y0, m0, d0] = dateKey.split('-').map(Number);
  const [y1, m1, d1] = endDate.split('-').map(Number);
  const startD = new Date(y0, m0 - 1, d0);
  const endD = new Date(y1, m1 - 1, d1);
  for (let cur = new Date(startD); cur <= endD; cur.setDate(cur.getDate() + 1)) {
    const dk = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
    const existingRows = await env.DB.prepare(
      'SELECT start_time, end_time FROM linda_extra WHERE date_key = ?'
    ).bind(dk).all<{ start_time: string; end_time: string }>();
    for (const r of ranges) {
      const newStart = parseTimeToMinutes(r.start);
      const newEnd = parseTimeToMinutes(r.end);
      const overlap = existingRows.results.some(row => {
        const es = parseTimeToMinutes(row.start_time), ee = parseTimeToMinutes(row.end_time);
        return newStart < ee && newEnd > es;
      });
      if (overlap) { skipped++; continue; }
      await env.DB.prepare(
        'INSERT INTO linda_extra (date_key, start_time, end_time, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(dk, r.start, r.end, reason, now).run();
      count++;
    }
  }

  await bumpVersion(env.DB);
  if (count === 0 && skipped > 0) {
    return json({ ok: false, reason: "Those hours overlap with existing availability on " + (skipped === 1 ? 'that day' : 'those days') + '. Edit or remove existing rows first.' }, 409);
  }
  return json({ ok: true, added: count, skipped });
}

// Copy a day's extras forward to one or more future dates.
// Body: { fromDateKey, toDateKeys: [...] }
// Skips duplicates (same date_key + start_time + end_time already exists).

export async function apiLindaCopyDay(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const fromDateKey = String(body.fromDateKey || '').trim();
  const toDateKeys = Array.isArray(body.toDateKeys) ? body.toDateKeys.map((d: any) => String(d).trim()).filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDateKey)) return json({ ok: false, reason: 'Invalid source date.' }, 400);
  if (!toDateKeys.length) return json({ ok: false, reason: 'Pick at least one target date.' }, 400);

  const sourceRows = await env.DB.prepare(
    'SELECT start_time, end_time, reason FROM linda_extra WHERE date_key = ? ORDER BY start_time'
  ).bind(fromDateKey).all<{ start_time: string; end_time: string; reason: string }>();
  if (!sourceRows.results.length) return json({ ok: false, reason: 'Source day has no extra hours to copy.' }, 400);

  const now = nowIso(env.TIMEZONE);
  let inserted = 0, skipped = 0;
  for (const dk of toDateKeys) {
    for (const r of sourceRows.results) {
      const existing = await env.DB.prepare(
        'SELECT 1 FROM linda_extra WHERE date_key = ? AND start_time = ? AND end_time = ?'
      ).bind(dk, r.start_time, r.end_time).first();
      if (existing) { skipped++; continue; }
      await env.DB.prepare(
        'INSERT INTO linda_extra (date_key, start_time, end_time, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(dk, r.start_time, r.end_time, r.reason || '', now).run();
      inserted++;
    }
  }
  await bumpVersion(env.DB);
  return json({ ok: true, inserted, skipped });
}

// Edit an existing extra row. Body: { id, startTime, endTime, reason? }

export async function apiLindaUpdateExtra(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const id = parseInt(String(body.id || '0'), 10);
  const startTime = String(body.startTime || '').trim();
  const endTime = String(body.endTime || '').trim();
  const reason = String(body.reason || '').trim();
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return json({ ok: false, reason: 'Invalid time.' }, 400);
  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return json({ ok: false, reason: 'End must be after start.' }, 400);

  const existing = await env.DB.prepare('SELECT date_key FROM linda_extra WHERE id = ?').bind(id).first<{ date_key: string }>();
  if (!existing) return json({ ok: false, reason: 'Extra not found.' }, 404);

  await env.DB.prepare(
    'UPDATE linda_extra SET start_time = ?, end_time = ?, reason = ? WHERE id = ?'
  ).bind(startTime, endTime, reason, id).run();
  await bumpVersion(env.DB);
  return json({ ok: true, dateKey: existing.date_key });
}

// Delete an extra by id. ?id=123

export async function apiLindaDeleteExtra(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  await env.DB.prepare('DELETE FROM linda_extra WHERE id = ?').bind(id).run();
  await bumpVersion(env.DB);
  return json({ ok: true });
}

// ─── POST /api/linda-reschedule ────────────────────────────
// Body: { appointmentId, dateKey, startTime }
// Moves a Linda appointment to a new date/time; updates calendar + emails patient.

export async function apiLindaReschedule(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const appointmentId = String(body.appointmentId || '').trim();
  const dateKey = String(body.dateKey || '').trim();
  const startTime = String(body.startTime || '').trim();

  if (!appointmentId || !dateKey || !startTime) return json({ ok: false, reason: 'Missing fields.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);
  if (!/^\d{2}:\d{2}$/.test(startTime)) return json({ ok: false, reason: 'Invalid time.' }, 400);

  const appt = await getAppointmentById(env.DB, appointmentId);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' }, 404);
  if (appt.clinic !== 'linda') return json({ ok: false, reason: "Not a Linda appointment." }, 400);
  if (appt.status.includes('CANCELLED')) return json({ ok: false, reason: 'Appointment is cancelled.' }, 400);

  const cfg = await loadLindaConfig(env.DB);
  const extras = await getLindaExtrasForDate(env.DB, dateKey);
  const slots = buildLindaSlots(dateKey, cfg, extras);
  const slotFound = slots.find(s => s.start === startTime);
  if (!slotFound) return json({ ok: false, reason: "No hours set for this date \u2014 open availability for it first." }, 400);

  // Don't bump into the same appointment itself; only reject if a DIFFERENT booking has it.
  if (await isSlotTaken(env.DB, dateKey, startTime, 'linda')) {
    const existing = await env.DB.prepare(
      "SELECT id FROM appointments WHERE clinic='linda' AND date_key=? AND start_time=? AND status='BOOKED'"
    ).bind(dateKey, startTime).first<{ id: string }>();
    if (existing && existing.id !== appointmentId) {
      return json({ ok: false, reason: 'That slot is already taken.' }, 400);
    }
  }

  const now = nowIso(env.TIMEZONE);
  const oldCalEventId = appt.calendar_event_id;
  const oldDate = appt.date_key;

  await env.DB.prepare(
    'UPDATE appointments SET date_key = ?, start_time = ?, end_time = ?, updated_at = ?, calendar_event_id = ? WHERE id = ?'
  ).bind(dateKey, startTime, slotFound.end, now, '', appointmentId).run();
  await bumpVersion(env.DB);

  // Broadcast so the /linda page and public physio page refresh.
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
    if (oldDate !== dateKey) {
      await stub.fetch('http://internal/broadcast', {
        method: 'POST',
        body: JSON.stringify({ type: 'slots_updated', dateKey: oldDate, clinic: 'linda' }),
      });
    }
  } catch {}

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      if (oldCalEventId) {
        try { await deleteCalendarEvent(env, oldCalEventId, 'linda'); } catch {}
      }
      const updated = { ...appt, date_key: dateKey, start_time: startTime, end_time: slotFound.end };
      try {
        const newEventId = await createCalendarEvent(env, updated);
        if (newEventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(newEventId, appointmentId).run();
        }
      } catch (e) { console.error('Linda reschedule cal error:', e); }
      try { await sendAppointmentPushedEmail(env, appt, dateKey, startTime, slotFound.end); } catch (e) { console.error('Linda reschedule email error:', e); }
    })());
  }

  return json({ ok: true, appointmentId, dateKey, startTime, endTime: slotFound.end });
}

// ─── POST /api/linda-new-booking ───────────────────────────
// Linda creates a booking on behalf of a patient (walk-in, phone booking,
// or "clone" of an existing appointment's patient into a future slot).
// Body: { dateKey, startTime, fullName, email, phone, comments? }

export async function apiLindaNewBooking(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const dateKey = String(body.dateKey || '').trim();
  const startTime = String(body.startTime || '').trim();
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const comments = String(body.comments || '').trim();

  if (!dateKey || !startTime || !fullName || (!email && !phone)) {
    return json({ ok: false, reason: 'Name and at least one of email or phone are required.' }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);

  const cfg = await loadLindaConfig(env.DB);
  const extras = await getLindaExtrasForDate(env.DB, dateKey);
  const slots = buildLindaSlots(dateKey, cfg, extras);
  const slotFound = slots.find(s => s.start === startTime);
  if (!slotFound) return json({ ok: false, reason: "No hours set for this date \u2014 open availability for it first." }, 400);

  if (await isSlotTaken(env.DB, dateKey, startTime, 'linda')) {
    return json({ ok: false, reason: 'That slot is already taken.' }, 400);
  }

  const now = nowIso(env.TIMEZONE);
  if (email) await getOrCreateClient(env.DB, fullName, email, phone, now);

  const appt: Appointment = {
    id: 'A-' + generateId(),
    date_key: dateKey,
    start_time: startTime,
    end_time: slotFound.end,
    service_id: 'physio',
    service_name: 'Physiotherapy Consultation',
    full_name: fullName,
    email: email || '',
    phone: phone || '',
    comments,
    status: 'BOOKED',
    location: env.LINDA_LOCATION || "Potter's Clinic",
    clinic: 'linda',
    created_at: now,
    updated_at: now,
    token: generateId(),
    calendar_event_id: '',
    cancelled_at: '',
    cancel_reason: '',
    reminder_sent: '',
    confirmed: '',
    booking_source: 'linda-internal',
  };

  await insertAppointment(env.DB, appt);
  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
  } catch {}

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        const eventId = await createCalendarEvent(env, appt);
        if (eventId) await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, appt.id).run();
      } catch (e) { console.error('Linda new-booking cal error:', e); }
      try { if (email) await sendLindaConfirmationEmail(env, appt); } catch (e) { console.error('Linda new-booking confirm email error:', e); }
      try {
        const day = await env.DB.prepare("SELECT * FROM appointments WHERE date_key = ? AND status IN ('BOOKED','RELOCATED_SPINOLA') ORDER BY start_time").bind(dateKey).all<Appointment>();
        await sendDoctorBookingEmail(env, appt, day.results);
      } catch (e) { console.error('Linda new-booking doctor email error:', e); }
    })());
  }

  return json({ ok: true, appointmentId: appt.id, dateKey, startTime, endTime: slotFound.end });
}

// ─── POST /api/linda-mark-status ───────────────────────────
// Body: { appointmentId, status: 'ATTENDED' | 'NO_SHOW' | 'BOOKED' }
// Lets Linda mark a past appointment's outcome without leaving /linda.

export async function apiLindaMarkStatus(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const appointmentId = String(body.appointmentId || '').trim();
  const status = String(body.status || '').trim();
  if (!appointmentId) return json({ ok: false, reason: 'Missing id.' }, 400);
  if (!['ATTENDED','NO_SHOW','BOOKED'].includes(status)) return json({ ok: false, reason: 'Invalid status.' }, 400);

  const appt = await getAppointmentById(env.DB, appointmentId);
  if (!appt) return json({ ok: false, reason: 'Not found.' }, 404);
  if (appt.clinic !== 'linda') return json({ ok: false, reason: 'Not a Linda appointment.' }, 400);

  const now = nowIso(env.TIMEZONE);
  await updateAppointmentStatus(env.DB, appt.id, { status }, now);
  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key, clinic: 'linda' }),
    });
  } catch {}
  return json({ ok: true });
}

// ─── POST /api/linda-cancel ────────────────────────────────
// Cancels one Linda appointment. Body: { appointmentId, reason?, rebook? }
// If rebook=true, the patient email invites them to book a new time;
// otherwise a standard cancellation.

export async function apiLindaCancel(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const appointmentId = String(body.appointmentId || '').trim();
  const reason = String(body.reason || '').trim() || 'Cancelled by Linda';
  const rebook = body.rebook === true;
  if (!appointmentId) return json({ ok: false, reason: 'Missing id.' }, 400);

  const appt = await getAppointmentById(env.DB, appointmentId);
  if (!appt) return json({ ok: false, reason: 'Not found.' }, 404);
  if (appt.clinic !== 'linda') return json({ ok: false, reason: 'Not a Linda appointment.' }, 400);
  if (String(appt.status).includes('CANCELLED')) return json({ ok: true, alreadyCancelled: true });

  const now = nowIso(env.TIMEZONE);
  await updateAppointmentStatus(env.DB, appt.id, {
    status: 'CANCELLED_DOCTOR',
    cancelled_at: now,
    cancel_reason: reason,
    calendar_event_id: '',
  }, now);
  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key, clinic: 'linda' }),
    });
  } catch {}

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, 'linda'); } catch {}
      }
      try {
        if (rebook) {
          await sendCustomNotificationEmail(env, appt,
            'Linda needs to reschedule this appointment. Please book a new time via ' +
            'https://kevappts.labrint.workers.dev/physio — sorry for any inconvenience.');
        } else {
          await sendClientCancelledEmail(env, appt, reason);
        }
      } catch (e) { console.error('Linda cancel email error:', e); }
    })());
  }
  return json({ ok: true });
}

// ─── POST /api/linda-cancel-day ────────────────────────────
// Cancels every non-cancelled Linda appointment on a given date.
// Body: { dateKey, reason?, rebook? }

export async function apiLindaCancelDay(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const dateKey = String(body.dateKey || '').trim();
  const reason = String(body.reason || '').trim() || 'Linda is not available that day';
  const rebook = body.rebook === true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);

  const rows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE clinic='linda' AND date_key=? AND status NOT LIKE '%CANCELLED%'"
  ).bind(dateKey).all<Appointment>();

  const now = nowIso(env.TIMEZONE);
  let count = 0;
  const toNotify: { appt: Appointment; calEventId: string }[] = [];
  for (const appt of rows.results) {
    await updateAppointmentStatus(env.DB, appt.id, {
      status: 'CANCELLED_DOCTOR',
      cancelled_at: now,
      cancel_reason: reason,
      calendar_event_id: '',
    }, now);
    toNotify.push({ appt, calEventId: appt.calendar_event_id });
    count++;
  }
  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
  } catch {}

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      for (const t of toNotify) {
        if (t.calEventId) {
          try { await deleteCalendarEvent(env, t.calEventId, 'linda'); } catch {}
        }
        try {
          if (rebook) {
            await sendCustomNotificationEmail(env, t.appt,
              'Linda needs to reschedule this appointment. Please book a new time via ' +
              'https://kevappts.labrint.workers.dev/physio — sorry for any inconvenience.');
          } else {
            await sendClientCancelledEmail(env, t.appt, reason);
          }
        } catch (e) { console.error('Linda bulk-cancel email error:', e); }
      }
    })());
  }
  return json({ ok: true, cancelled: count });
}

// ─── POST /linda/login ─────────────────────────────────────

export async function handleLindaLogin(req: Request, env: Env): Promise<Response> {
  const form = await req.formData();
  const password = String(form.get('password') || '').trim();
  const redirect = String(form.get('redirect') || '/linda');

  // Accept Linda's dedicated password OR the admin password for fallback access.
  const okPassword = env.LINDA_PASSWORD && password === env.LINDA_PASSWORD;
  const okAdmin = env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD;

  if (okPassword || okAdmin) {
    const sig = await computeLindaSig(env.ADMIN_SECRET);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirect,
        'Set-Cookie': `linda_sig=${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`,
      },
    });
  }
  return html(lindaLoginPage(redirect, 'Wrong password. Try again.'));
}

// ─── GET /linda ────────────────────────────────────────────

export async function lindaRoute(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return html(lindaLoginPage('/linda'));
  return html(lindaMainPage(env));
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// ─── Pages ─────────────────────────────────────────────────

function lindaLoginPage(redirect: string, error?: string): string {
  const errHtml = error ? `<div class="err">${error}</div>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Linda — Login</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f6f7fb;padding:16px;}
  .box{background:#fff;padding:28px 22px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);width:100%;max-width:360px;text-align:center;}
  .emoji{font-size:40px;margin-bottom:6px;}
  h2{margin:0 0 6px;color:#111827;font-size:22px;font-weight:800;}
  p.sub{margin:0 0 20px;color:#6b7280;font-size:14px;}
  input[type=password]{width:100%;padding:14px;border:1px solid #e5e7eb;border-radius:12px;font-size:16px;margin-bottom:14px;}
  button{width:100%;padding:14px;background:#10b981;color:#fff;border:none;border-radius:999px;font-size:16px;font-weight:800;cursor:pointer;}
  button:active{background:#059669}
  .err{color:#dc2626;font-size:14px;margin-bottom:10px;background:#fef2f2;padding:8px;border-radius:8px;}
</style></head><body>
<div class="box">
  <div class="emoji">🧘</div>
  <h2>Linda's Diary</h2>
  <p class="sub">Enter your password to continue</p>
  ${errHtml}
  <form method="POST" action="/linda/login">
    <input type="hidden" name="redirect" value="${redirect}">
    <input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password">
    <button type="submit">Log in</button>
  </form>
</div>
</body></html>`;
}

function lindaMainPage(env: Env): string {
  const name = env.LINDA_DOCTOR_NAME || 'Linda';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="theme-color" content="#10b981">
<title>${name} — My Day</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%2310b981'/%3E%3Ctext x='50' y='68' font-size='50' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'%3EL%3C/text%3E%3C/svg%3E">
<style>
  :root{
    --accent:#10b981;--text:#111827;--muted:#6b7280;--line:#e5e7eb;--bg:#f6f7fb;--bad:#ef4444;
    --ease:cubic-bezier(.22,1,.36,1);         /* "standard" ease-out */
    --ease-spring:cubic-bezier(.34,1.56,.64,1);/* overshoot spring */
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}

  /* ── Keyframes ───────────────────────────────────────── */
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bounceIn{0%{opacity:0;transform:translate(-50%,100px) scale(.9)}60%{opacity:1;transform:translate(-50%,-6px) scale(1.02)}100%{transform:translate(-50%,0) scale(1)}}
  @keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}100%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}
  @keyframes pulseSoft{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes sheetIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
  @keyframes scalePop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}

  /* Global smooth transitions on interactive elements */
  button,.date-btn,.srow,.extra-row,.ac-item,.slot-btn,.cal-cell,.tabBtn,.appt,.ph-item,.slot,.contact-btn{
    transition:transform .18s var(--ease),background-color .18s ease,box-shadow .18s ease,opacity .18s ease;
  }
  button:not(:disabled):active,.date-btn:active,.srow:active,.slot-btn:active,.ac-item:active,.cal-cell:active{
    transform:scale(.97);
  }

  /* Respect accessibility: honour user preference for reduced motion */
  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;}
  }
  html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.4;-webkit-font-smoothing:antialiased;}
  .topbar{position:sticky;top:0;background:#fff;border-bottom:1px solid var(--line);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;z-index:5;}
  .topbar h1{margin:0;font-size:17px;font-weight:900;}
  .liveDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#9ca3af;margin-left:6px;vertical-align:middle;transition:background-color .3s ease;}
  .liveDot.on{background:#10b981;animation:pulseDot 1.8s ease-out infinite;}
  .logout{background:none;border:none;color:#ef4444;font-size:13px;cursor:pointer;padding:4px 8px;font-weight:700;}

  .dateBar{background:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);position:sticky;top:41px;z-index:4;}
  .dateBar button.nav{flex:0 0 auto;min-width:44px;height:44px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:20px;font-weight:800;cursor:pointer;color:var(--text);}
  .dateBar button.nav:active{background:#f3f4f6;}
  .dateBar input[type=date]{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:16px;font-family:inherit;background:#fff;min-height:44px;}
  .dateBar .today-btn{flex:0 0 auto;height:44px;padding:0 12px;border:1px solid var(--accent);background:#ecfdf5;color:#065f46;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;}

  .dayLabel{padding:10px 14px 4px;font-size:14px;color:var(--muted);font-weight:700;}
  .summary{padding:0 14px 10px;font-size:13px;color:var(--muted);}

  /* Next-up banner */
  .next-up{margin:8px 12px 4px;padding:12px 14px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:14px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 14px rgba(16,185,129,0.3);animation:fadeUp .35s var(--ease) both;transition:background .3s ease,box-shadow .3s ease;}
  .next-up.soon,.next-up.now{animation:fadeUp .35s var(--ease) both,pulseSoft 2s ease-in-out infinite .5s;}
  .next-up .icon{font-size:28px;}
  .next-up .meta{flex:1 1 auto;min-width:0;}
  .next-up .line1{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;opacity:.9;}
  .next-up .line2{font-size:15px;font-weight:800;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .next-up .line3{font-size:12px;font-weight:700;margin-top:2px;opacity:.9;}
  .next-up.soon{background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 4px 14px rgba(245,158,11,0.35);}
  .next-up.now{background:linear-gradient(135deg,#dc2626,#b91c1c);box-shadow:0 4px 14px rgba(220,38,38,0.35);}

  .list{padding:0 12px 110px;}
  .appt{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.03);animation:fadeUp .32s var(--ease) both;}
  .list .appt:nth-child(1){animation-delay:.02s}
  .list .appt:nth-child(2){animation-delay:.05s}
  .list .appt:nth-child(3){animation-delay:.08s}
  .list .appt:nth-child(4){animation-delay:.11s}
  .list .appt:nth-child(5){animation-delay:.14s}
  .list .appt:nth-child(n+6){animation-delay:.17s}
  .appt-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;}
  .appt-time{font-weight:900;font-size:17px;color:var(--text);}
  .appt-status{font-size:11px;font-weight:800;text-transform:uppercase;padding:3px 8px;border-radius:999px;letter-spacing:.4px;}
  .status-BOOKED{background:#ecfdf5;color:#065f46;}
  .status-ATTENDED{background:#e0e7ff;color:#3730a3;}
  .status-NO_SHOW{background:#fff7ed;color:#9a3412;}
  .status-CANCELLED{background:#fef2f2;color:#991b1b;text-decoration:line-through;}
  .appt-name{font-size:16px;font-weight:700;margin:0 0 6px 0;color:var(--accent);text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
  .appt-name:active{opacity:.7;}
  .contact-row{display:flex;flex-direction:column;gap:8px;margin-top:10px;}
  .contact-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;min-height:48px;word-break:break-all;line-height:1.3;}
  .contact-btn .icon{flex:0 0 auto;font-size:18px;}
  .contact-btn .val{flex:1 1 auto;text-align:left;}
  .call{background:#10b981;color:#fff;}
  .call:active{background:#059669;}
  .email{background:#2563eb;color:#fff;}
  .email:active{background:#1d4ed8;}
  .comments{margin-top:10px;padding:10px;background:#f9fafb;border-radius:10px;font-size:13px;color:var(--text);white-space:pre-wrap;border-left:3px solid var(--accent);}
  .comments-label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;}

  .action-row{display:flex;gap:8px;margin-top:10px;}
  .action-btn{flex:1 1 0;padding:10px;border:1px solid var(--line);background:#fff;color:var(--text);border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;min-height:40px;}
  .action-btn:active{background:#f3f4f6;}
  .action-btn.reschedule{border-color:#f59e0b;color:#92400e;background:#fffbeb;}
  .action-btn.clone,.action-btn.next-session{border-color:#2563eb;color:#1e40af;background:#eff6ff;}
  .action-btn.cancel{border-color:#ef4444;color:#991b1b;background:#fef2f2;}
  .action-btn.attended{border-color:#3730a3;color:#312e81;background:#eef2ff;}
  .action-btn.noshow{border-color:#9a3412;color:#7c2d12;background:#fff7ed;}
  .action-btn.reopen{border-color:#6b7280;color:#374151;background:#f9fafb;}

  /* Day-wide actions row */
  .day-actions{display:flex;gap:8px;padding:0 12px 6px;flex-wrap:wrap;}
  .day-action-btn{flex:1 1 0;min-width:140px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--text);font-weight:800;font-size:13px;cursor:pointer;transition:background .18s ease,transform .18s var(--ease);}
  .day-action-btn:active{transform:scale(.97);}
  .day-action-btn.warn{border-color:#f59e0b;color:#92400e;background:#fffbeb;}
  .day-action-btn.danger{border-color:#ef4444;color:#991b1b;background:#fef2f2;}
  @media (prefers-color-scheme: dark){
    .day-action-btn{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .day-action-btn.warn{background:#422006;color:#fde68a;border-color:#92400e;}
    .day-action-btn.danger{background:#450a0a;color:#fecaca;border-color:#991b1b;}
  }

  .empty{padding:30px 20px;text-align:center;color:var(--muted);font-size:15px;background:#fff;border-radius:14px;margin:0 12px;border:1px dashed var(--line);}
  .emptyEmoji{font-size:40px;margin-bottom:8px;}
  .err{padding:14px;margin:10px 12px;background:#fef2f2;color:#991b1b;border-radius:10px;font-size:14px;}

  /* Search */
  .searchBar{padding:10px 12px;background:#fff;border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;}
  .searchBar input{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:15px;min-height:44px;background:#fff;color:var(--text);}
  .searchBar .clear{background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;padding:4px 8px;min-width:32px;}
  .searchResults{padding:0 12px 110px;}
  .srow{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;animation:fadeUp .25s var(--ease) both;}
  .srow:active{background:#f3f4f6;}
  .srow-main{font-size:15px;font-weight:800;}
  .srow-dim{font-size:13px;color:var(--muted);margin-top:2px;}

  /* Tabs */
  .tabBar{display:flex;gap:4px;padding:6px;background:#fff;border-bottom:1px solid var(--line);position:sticky;top:41px;z-index:4;}
  .tabBtn{flex:1 1 0;padding:12px 8px;background:#f3f4f6;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;color:var(--muted);min-height:44px;transition:background-color .22s ease,color .22s ease,transform .22s var(--ease);}
  .tabBtn.active{background:var(--accent);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3);}
  #pane-day,#pane-week,#pane-avail{animation:fadeIn .22s ease both;}

  /* Availability tab */
  .avail-wrap{padding:12px;padding-bottom:110px;}
  .avail-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px;}
  .avail-card h3{margin:0 0 8px 0;font-size:15px;font-weight:900;}
  .avail-card .hint{margin:0 0 12px 0;font-size:13px;color:var(--muted);line-height:1.5;}
  .avail-row{display:flex;gap:8px;align-items:center;margin-bottom:8px;}
  .avail-row label{flex:0 0 80px;font-size:13px;color:var(--muted);font-weight:700;}
  .avail-row input{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:15px;min-height:44px;background:#fff;color:var(--text);}
  .avail-save{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:999px;font-size:15px;font-weight:800;cursor:pointer;min-height:48px;margin-top:6px;}
  .avail-save:active{background:#059669;}
  .extra-row{display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f9fafb;border-radius:10px;margin-bottom:8px;gap:10px;animation:fadeUp .25s var(--ease) both;}
  .extra-when{font-size:14px;font-weight:700;}
  .extra-dim{font-size:12px;color:var(--muted);margin-top:2px;}
  .extra-del{background:#fef2f2;color:#991b1b;border:none;padding:10px 14px;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;min-height:40px;}
  .extra-del:active{background:#fee2e2;}
  .extra-edit{background:#fffbeb;color:#92400e;border:none;padding:10px 14px;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;min-height:40px;margin-right:6px;}
  .extra-edit:active{background:#fef3c7;}
  .extra-edit-panel{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;}
  .extra-edit-panel input[type=time]{padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px;min-height:36px;background:#fff;color:var(--text);}
  .extra-edit-panel button{padding:8px 12px;border-radius:8px;font-weight:800;font-size:13px;border:none;cursor:pointer;}
  .extra-edit-panel .save{background:var(--accent);color:#fff;}
  .extra-edit-panel .cancel{background:#f3f4f6;color:var(--text);}
  .avail-msg{font-size:13px;margin-top:8px;}
  .avail-msg.ok{color:#059669;}
  .avail-msg.bad{color:#dc2626;}

  @media (prefers-color-scheme: dark){
    .tabBar{background:#1e293b;border-color:#334155;}
    .tabBtn{background:#0f172a;color:#94a3b8;}
    .avail-card{background:#1e293b;border-color:#334155;}
    .avail-row input{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .extra-row{background:#0f172a;}
  }

  /* Week time-grid */
  .weekBar{background:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);position:sticky;top:85px;z-index:3;}
  .weekBar .nav{min-width:40px;height:40px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:18px;font-weight:800;cursor:pointer;color:var(--text);}
  .weekBar .weekLabel{flex:1 1 auto;text-align:center;font-size:14px;font-weight:800;}
  .weekBar .today-btn{height:40px;padding:0 12px;border:1px solid var(--accent);background:#ecfdf5;color:#065f46;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;}
  .wg-wrap{overflow-x:auto;overflow-y:auto;max-height:calc(100vh - 160px);padding-bottom:110px;}
  .wg-grid{display:grid;grid-template-columns:44px repeat(7, minmax(100px, 1fr));position:relative;background:#fff;}
  .wg-head{position:sticky;top:0;background:#fff;z-index:2;border-bottom:1px solid var(--line);padding:6px 4px;text-align:center;font-size:12px;font-weight:800;color:var(--text);}
  .wg-head .dnum{font-size:16px;}
  .wg-head .dname{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;}
  .wg-head.today-col{background:#ecfdf5;color:#065f46;}
  .wg-hour-lbl{font-size:10px;color:var(--muted);text-align:right;padding:0 4px;border-right:1px solid var(--line);height:32px;line-height:32px;}
  .wg-cell{position:relative;border-right:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;height:32px;cursor:pointer;}
  .wg-cell.avail{background:#f0fdf4;}
  .wg-cell:active{background:#e5e7eb;}
  .wg-block{position:absolute;left:2px;right:2px;background:var(--accent);color:#fff;border-radius:6px;padding:3px 5px;font-size:11px;font-weight:700;cursor:pointer;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.15);z-index:1;animation:fadeIn .3s ease both;transition:transform .18s var(--ease),box-shadow .18s ease;}
  .wg-block:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(0,0,0,0.2);}
  .wg-block:active{transform:scale(.96);}
  .wg-block.cancelled{background:#fef2f2;color:#991b1b;text-decoration:line-through;}
  .wg-block.attended{background:#3730a3;}
  .wg-block.no_show{background:#9a3412;}
  .wg-block .bt{font-size:10px;opacity:.85;}
  @media (prefers-color-scheme: dark){
    .weekBar{background:#1e293b;border-color:#334155;}
    .weekBar .nav{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .wg-grid{background:#1e293b;}
    .wg-head{background:#1e293b;border-color:#334155;}
    .wg-cell{border-color:#334155;}
    .wg-cell.avail{background:#064e3b;}
    .wg-hour-lbl{border-color:#334155;}
  }

  /* FAB — prominent, bottom-right, subtly breathing so it's easy to spot */
  @keyframes fabBreathe{
    0%,100%{box-shadow:0 8px 28px rgba(16,185,129,0.55),0 0 0 0 rgba(16,185,129,0.55);}
    50%{box-shadow:0 10px 32px rgba(16,185,129,0.65),0 0 0 10px rgba(16,185,129,0);}
  }
  .fab{
    position:fixed;right:20px;bottom:20px;
    background:linear-gradient(135deg,#10b981,#059669);
    color:#fff;border:none;border-radius:999px;
    padding:16px 26px;font-size:17px;font-weight:900;letter-spacing:.3px;
    cursor:pointer;z-index:20;min-height:60px;
    display:inline-flex;align-items:center;gap:8px;
    animation:scalePop .35s var(--ease-spring) both,fabBreathe 2.6s ease-in-out .4s infinite;
    transition:transform .2s var(--ease),box-shadow .2s ease,background-color .2s ease;
  }
  .fab .fab-plus{font-size:22px;line-height:1;margin-right:2px;}
  .fab:hover{transform:translateY(-2px) scale(1.03);}
  .fab:active{transform:scale(.95);}

  /* Modal / sheet */
  .sheet-overlay{position:fixed;inset:0;background:rgba(17,24,39,0);display:none;z-index:60;transition:background-color .28s ease;}
  .sheet-overlay.show{display:block;background:rgba(17,24,39,0.6);animation:fadeIn .22s ease both;}
  .sheet{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:18px 18px 0 0;max-height:92vh;overflow-y:auto;padding:16px 14px 24px;z-index:61;transform:translateY(100%);transition:transform .32s var(--ease-spring),opacity .2s ease;box-shadow:0 -10px 40px rgba(0,0,0,0.25);}
  .sheet.show{transform:translateY(0);}
  .sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .sheet-title{margin:0;font-size:18px;font-weight:900;}
  .sheet-close{background:none;border:none;font-size:26px;line-height:1;color:var(--muted);cursor:pointer;padding:4px 8px;}
  .sheet-section{margin-bottom:14px;}
  .sheet-label{font-size:12px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;}
  .sheet-input{width:100%;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:16px;font-family:inherit;min-height:44px;background:#fff;color:var(--text);}
  .sheet-row{display:flex;gap:8px;}
  .sheet-row .sheet-input{flex:1 1 0;}
  .slot-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;}
  .slot-btn{padding:12px 6px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;color:var(--text);min-height:44px;}
  .slot-btn:active{background:#f3f4f6;}
  .slot-btn.chosen{background:var(--accent);color:#fff;border-color:var(--accent);animation:scalePop .22s var(--ease-spring);box-shadow:0 4px 12px rgba(16,185,129,0.35);}
  .slot-btn.dis{color:#9ca3af;background:#f9fafb;cursor:not-allowed;text-decoration:line-through;}
  .sheet-submit{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:999px;font-size:16px;font-weight:800;cursor:pointer;min-height:50px;margin-top:6px;}
  .sheet-submit:disabled{background:#9ca3af;}
  .sheet-msg{padding:10px;border-radius:8px;font-size:13px;margin-top:8px;}
  .sheet-msg.ok{background:#ecfdf5;color:#065f46;}
  .sheet-msg.bad{background:#fef2f2;color:#991b1b;}
  .open-prompt{background:#fef3c7;border:1px solid #fde68a;padding:12px;border-radius:10px;margin-top:8px;font-size:13px;color:#78350f;}
  .open-prompt button{margin-top:8px;background:#f59e0b;color:#fff;border:none;padding:10px 14px;border-radius:8px;font-weight:800;cursor:pointer;width:100%;}

  @media (prefers-color-scheme: dark){
    .sheet{background:#1e293b;color:#e2e8f0;}
    .sheet-input,.slot-btn{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .slot-btn.dis{background:#0f172a;color:#475569;}
    .open-prompt{background:#422006;border-color:#92400e;color:#fde68a;}
  }

  /* Autocomplete dropdown */
  .ac-wrap{position:relative;}
  .ac-list{position:absolute;left:0;right:0;top:100%;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:10;max-height:240px;overflow-y:auto;margin-top:4px;display:none;}
  .ac-list.show{display:block;animation:slideDown .22s var(--ease) both;}
  .ac-item{padding:10px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;}
  .ac-item:last-child{border-bottom:none;}
  .ac-item:active{background:#f3f4f6;}
  .ac-item .name{font-weight:700;font-size:14px;}
  .ac-item .dim{font-size:12px;color:var(--muted);margin-top:2px;}
  @media (prefers-color-scheme: dark){
    .ac-list{background:#1e293b;border-color:#334155;}
    .ac-item{border-color:#334155;}
  }

  /* Patient history drawer */
  .ph-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
  .ph-name{margin:0;font-size:18px;font-weight:900;}
  .ph-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;}
  .ph-stat{background:#f3f4f6;border-radius:10px;padding:10px;text-align:center;}
  .ph-stat .num{font-size:18px;font-weight:900;}
  .ph-stat .label{font-size:10px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-top:2px;}
  .ph-last{font-size:13px;color:var(--muted);margin-bottom:10px;}
  .ph-item{background:#f9fafb;border-radius:10px;padding:10px 12px;margin-bottom:6px;font-size:14px;display:flex;justify-content:space-between;gap:10px;animation:fadeUp .25s var(--ease) both;transition:background-color .15s ease;cursor:pointer;}
  .ph-item:hover{background:#f3f4f6;}
  .ph-item .when{font-weight:700;}
  .ph-item .st{font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap;}
  @media (prefers-color-scheme: dark){
    .ph-stat{background:#0f172a;}
    .ph-item{background:#0f172a;}
  }

  /* Inline calendar (replaces ugly dd/mm/yyyy native input) */
  .date-btn{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--text);font-size:15px;font-family:inherit;text-align:left;min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;}
  .date-btn:active{background:#f3f4f6;}
  .date-btn .date-icon{font-size:17px;}
  .date-btn .date-val{flex:1 1 auto;font-weight:600;}
  .date-btn.empty .date-val{color:var(--muted);font-weight:400;}
  .cal-sheet{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:18px 18px 0 0;padding:14px 12px 20px;z-index:71;transform:translateY(100%);transition:transform .32s var(--ease-spring);box-shadow:0 -10px 40px rgba(0,0,0,0.25);max-height:92vh;overflow-y:auto;}
  .cal-sheet.show{transform:translateY(0);}
  .cal-overlay{position:fixed;inset:0;background:rgba(17,24,39,0);display:none;z-index:70;transition:background-color .28s ease;}
  .cal-overlay.show{display:block;background:rgba(17,24,39,0.6);animation:fadeIn .22s ease both;}
  .cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 4px;}
  .cal-title{margin:0;font-size:17px;font-weight:900;}
  .cal-nav{background:#f3f4f6;border:none;border-radius:8px;width:40px;height:40px;font-size:20px;font-weight:800;cursor:pointer;color:var(--text);}
  .cal-nav:active{background:#e5e7eb;}
  .cal-dows{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;}
  .cal-dow{text-align:center;font-size:11px;color:var(--muted);font-weight:800;padding:6px 0;text-transform:uppercase;letter-spacing:.4px;}
  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
  .cal-cell{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;border-radius:10px;cursor:pointer;color:var(--text);background:transparent;border:none;min-height:40px;}
  .cal-cell:active{background:#f3f4f6;}
  .cal-cell.other-month{color:var(--muted);opacity:.4;}
  .cal-cell.today{outline:2px solid var(--accent);}
  .cal-cell.sel{background:var(--accent);color:#fff;animation:scalePop .22s var(--ease-spring) both;}
  .cal-cell.disabled{color:#d1d5db;cursor:not-allowed;background:transparent;}
  .cal-cell.weekend{color:#6b7280;}

  @media (prefers-color-scheme: dark){
    .date-btn{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .cal-sheet{background:#1e293b;color:#e2e8f0;}
    .cal-nav{background:#0f172a;color:#e2e8f0;}
    .cal-cell{color:#e2e8f0;}
    .cal-cell.other-month{color:#475569;}
  }

  /* Idle overlay pauses network activity */
  .idle-overlay{position:fixed;inset:0;background:rgba(17,24,39,0);color:#fff;display:none;align-items:center;justify-content:center;flex-direction:column;z-index:50;padding:20px;text-align:center;cursor:pointer;backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);transition:background-color .35s ease,backdrop-filter .35s ease;}
  .idle-overlay.show{display:flex;background:rgba(17,24,39,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:fadeIn .35s ease both;}
  .idle-overlay.show > *{animation:fadeUp .45s var(--ease) both;}
  .idle-overlay.show .idle-emoji{animation-delay:.05s;}
  .idle-overlay.show .idle-title{animation-delay:.12s;}
  .idle-overlay.show .idle-sub{animation-delay:.19s;}
  .idle-overlay.show .idle-cta{animation-delay:.26s;}
  .idle-emoji{font-size:80px;margin-bottom:14px;animation-iteration-count:1;}
  .idle-title{font-size:22px;font-weight:800;margin-bottom:10px;}
  .idle-sub{font-size:14px;color:#9ca3af;margin-bottom:18px;max-width:280px;}
  .idle-cta{background:var(--accent);color:#fff;padding:14px 28px;border-radius:999px;font-weight:800;font-size:16px;box-shadow:0 8px 24px rgba(16,185,129,0.4);transition:transform .2s var(--ease),box-shadow .2s ease;}
  .idle-overlay.show .idle-cta:hover{transform:scale(1.05);}

  /* Live toast for incoming bookings */
  .live-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(100px);opacity:0;background:#10b981;color:#fff;padding:12px 20px;border-radius:999px;font-weight:800;font-size:14px;box-shadow:0 8px 28px rgba(16,185,129,0.5);z-index:40;pointer-events:none;}
  .live-toast.show{animation:bounceIn .45s var(--ease-spring) both;opacity:1;transform:translateX(-50%) translateY(0);}

  @media (prefers-color-scheme: dark){
    body{background:#0f172a;color:#e2e8f0;}
    .topbar,.dateBar,.appt{background:#1e293b;border-color:#334155;}
    .empty{background:#1e293b;border-color:#334155;}
    .comments{background:#0f172a;}
    .dateBar input[type=date]{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .dateBar button.nav{background:#1e293b;color:#e2e8f0;border-color:#334155;}
  }
</style></head>
<body>
<div class="topbar">
  <h1>${name}'s Diary <span class="liveDot" id="liveDot" title="Live status"></span></h1>
  <button class="logout" onclick="logout()">Log out</button>
</div>
<div class="tabBar">
  <button class="tabBtn active" id="tabDayBtn" onclick="setTab('day')">📅 Day</button>
  <button class="tabBtn" id="tabWeekBtn" onclick="setTab('week')">📆 Week</button>
  <button class="tabBtn" id="tabAvailBtn" onclick="setTab('avail')">🗓 Availability</button>
</div>

<div id="pane-day">
  <div class="searchBar">
    <input type="search" id="searchInput" placeholder="Search name, phone or email…" autocomplete="off">
    <button class="clear" id="searchClear" onclick="clearSearch()" style="display:none;" aria-label="Clear">&times;</button>
  </div>
  <div id="searchResults" class="searchResults" style="display:none;"></div>
  <div id="dayContent">
  <div class="dateBar">
    <button class="nav" onclick="navDay(-1)" aria-label="Previous day">&#x25C0;</button>
    <button type="button" class="date-btn" id="dateInputBtn" onclick="pickDate('dateInput', function(dk){ setDate(dk); })" style="flex:1 1 auto;"><span class="date-icon">📅</span><span class="date-val" id="dateInputLabel">Today</span></button>
    <input type="hidden" id="dateInput">
    <button class="nav" onclick="navDay(1)" aria-label="Next day">&#x25B6;</button>
    <button class="today-btn" onclick="goToday()">Today</button>
  </div>
  <div class="dayLabel" id="dayLabel"></div>
  <div id="nextUp"></div>
  <div class="summary" id="summary"></div>
  <div class="day-actions" id="dayActions" style="display:none;">
    <button class="day-action-btn warn" onclick="rescheduleAllDay()">🔄 Reschedule all</button>
    <button class="day-action-btn danger" onclick="cancelAllDay()">✖ Cancel all</button>
  </div>
  <div class="list" id="list"><div class="empty">Loading…</div></div>
  </div>
</div>

<div id="pane-week" style="display:none;">
  <div class="weekBar">
    <button class="nav" onclick="navWeek(-1)" aria-label="Previous week">&#x25C0;</button>
    <div class="weekLabel" id="weekLabel">—</div>
    <button class="nav" onclick="navWeek(1)" aria-label="Next week">&#x25B6;</button>
    <button class="today-btn" onclick="goThisWeek()">This</button>
  </div>
  <div id="weekGrid" class="wg-wrap"><div class="empty" style="margin:20px 12px;">Loading…</div></div>
</div>

<div id="pane-avail" style="display:none;">
  <div class="avail-wrap">
    <div class="avail-card">
      <h3>Open extra availability</h3>
      <p class="hint">Add a date (or date range) and the hours you'll be there. Patients can then book these slots. Your weekly schedule stays as-is.</p>
      <div class="avail-row"><label>From date</label><button type="button" class="date-btn empty" id="avDateFromBtn" onclick="pickDate('avDateFrom')"><span class="date-icon">📅</span><span class="date-val" id="avDateFromLabel">Pick a date</span></button><input type="hidden" id="avDateFrom"></div>
      <div class="avail-row"><label>To date</label><button type="button" class="date-btn empty" id="avDateToBtn" onclick="pickDate('avDateTo')"><span class="date-icon">📅</span><span class="date-val" id="avDateToLabel">Same day</span></button><input type="hidden" id="avDateTo"></div>
      <div style="font-size:12px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin:8px 0 4px;">Morning</div>
      <div class="avail-row"><label>Start</label><input type="time" id="avStart" step="1800" value="09:30"></div>
      <div class="avail-row"><label>End</label><input type="time" id="avEnd" step="1800" value="13:00"></div>
      <div style="font-size:12px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin:12px 0 4px;">Evening (optional)</div>
      <div class="avail-row"><label>Start</label><input type="time" id="avEveningStart" step="1800" value="16:00"></div>
      <div class="avail-row"><label>End</label><input type="time" id="avEveningEnd" step="1800" value="19:00"></div>
      <button class="avail-save" onclick="saveAvail()">Open these hours</button>
      <div class="avail-msg" id="avMsg"></div>
    </div>

    <div class="avail-card">
      <h3>Copy a day's hours</h3>
      <p class="hint">Pick a day that already has hours opened, then pick one or more future dates to clone those hours to.</p>
      <div class="avail-row">
        <label>From</label>
        <button type="button" class="date-btn empty" id="cdFromBtn" onclick="pickDate('cdFrom')"><span class="date-icon">📅</span><span class="date-val" id="cdFromLabel">Pick source day</span></button>
        <input type="hidden" id="cdFrom">
      </div>
      <div style="font-size:12px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 6px;">Copy to</div>
      <div id="cdTargetChips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;"></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn" type="button" onclick="addCopyTargetPreset('next-week')" style="padding:10px 12px;border:1px solid var(--line);border-radius:999px;background:#f3f4f6;font-weight:700;font-size:13px;cursor:pointer;">+ Same day next week</button>
        <button class="btn" type="button" onclick="addCopyTargetPreset('next-4-weeks')" style="padding:10px 12px;border:1px solid var(--line);border-radius:999px;background:#f3f4f6;font-weight:700;font-size:13px;cursor:pointer;">+ Same day × 4 weeks</button>
        <button class="btn" type="button" onclick="addCopyTargetCustom()" style="padding:10px 12px;border:1px solid var(--line);border-radius:999px;background:#f3f4f6;font-weight:700;font-size:13px;cursor:pointer;">+ Pick a date</button>
      </div>
      <button class="avail-save" style="margin-top:12px;" onclick="submitCopyDay()">Copy hours</button>
      <div class="avail-msg" id="cdMsg"></div>
    </div>

    <div class="avail-card">
      <h3>Upcoming extra hours</h3>
      <div id="extraList"><div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div></div>
    </div>
  </div>
</div>

<button class="fab" id="fabBook" onclick="openBookSheet()"><span class="fab-plus">＋</span>New Booking</button>

<div class="sheet-overlay" id="sheetOverlay" onclick="closeSheet()"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="sheet-title" id="sheetTitle">Book appointment</h3>
    <button class="sheet-close" onclick="closeSheet()" aria-label="Close">×</button>
  </div>

  <div class="sheet-section" id="sheetPatientSection">
    <div class="sheet-label">Patient</div>
    <div class="ac-wrap">
      <input class="sheet-input" id="bfName" placeholder="Full name (start typing to match)" autocomplete="off" style="margin-bottom:8px;">
      <div class="ac-list" id="bfAcList"></div>
    </div>
    <div class="sheet-row">
      <input class="sheet-input" id="bfPhone" type="tel" placeholder="Phone" inputmode="tel">
      <input class="sheet-input" id="bfEmail" type="email" placeholder="Email" inputmode="email">
    </div>
    <textarea class="sheet-input" id="bfComments" placeholder="Comments (optional)" style="margin-top:8px;min-height:60px;"></textarea>
  </div>

  <div class="sheet-section">
    <div class="sheet-label">Date</div>
    <button type="button" class="date-btn empty" id="bfDateBtn" onclick="pickDate('bfDate', function(){ loadSheetSlots(); updateSheetSubmit(); })"><span class="date-icon">📅</span><span class="date-val" id="bfDateLabel">Pick a date</span></button>
    <input type="hidden" id="bfDate">
  </div>

  <div class="sheet-section">
    <div class="sheet-label">Time</div>
    <div id="bfSlots"><div class="sheet-msg">Pick a date first.</div></div>
    <div id="bfOpenPrompt" class="open-prompt" style="display:none;">
      <b>Not a working day yet.</b><br>
      Open these hours quickly so you can book:
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;margin-top:8px;opacity:.8;">Morning</div>
      <div class="sheet-row" style="margin-top:4px;">
        <input class="sheet-input" type="time" id="bfOpenStart" step="1800" value="09:30">
        <input class="sheet-input" type="time" id="bfOpenEnd" step="1800" value="13:00">
      </div>
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;margin-top:8px;opacity:.8;">Evening (optional)</div>
      <div class="sheet-row" style="margin-top:4px;">
        <input class="sheet-input" type="time" id="bfOpenEveningStart" step="1800" value="16:00">
        <input class="sheet-input" type="time" id="bfOpenEveningEnd" step="1800" value="19:00">
      </div>
      <button onclick="quickOpenDate()" style="margin-top:10px;">Open this day</button>
    </div>
  </div>

  <button class="sheet-submit" id="bfSubmit" onclick="submitSheet()" disabled>Book</button>
  <div id="bfMsg"></div>
</div>

<div class="sheet-overlay" id="phOverlay" onclick="closePatientHistory()"></div>
<div class="sheet" id="phSheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="ph-name" id="phName">Patient</h3>
    <button class="sheet-close" onclick="closePatientHistory()" aria-label="Close">×</button>
  </div>
  <div class="ph-last" id="phLast"></div>
  <div class="ph-stats" id="phStats"></div>
  <div id="phAppts"></div>
</div>

<div class="cal-overlay" id="calOverlay" onclick="closeCal()"></div>
<div class="cal-sheet" id="calSheet" role="dialog" aria-modal="true">
  <div class="cal-head">
    <button class="cal-nav" onclick="calStep(-1)" aria-label="Previous month">‹</button>
    <h3 class="cal-title" id="calTitle">Month YYYY</h3>
    <button class="cal-nav" onclick="calStep(1)" aria-label="Next month">›</button>
  </div>
  <div class="cal-dows">
    <div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div>
    <div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div><div class="cal-dow">Sun</div>
  </div>
  <div class="cal-grid" id="calGrid"></div>
</div>

<div class="idle-overlay" id="idleOverlay">
  <div class="idle-emoji">🧘</div>
  <div class="idle-title">Taking a break?</div>
  <div class="idle-sub">Tap anywhere to wake up and see the latest appointments.</div>
  <div class="idle-cta">Tap to resume</div>
</div>

<div class="live-toast" id="liveToast">New booking — refreshing…</div>

<script>
(function(){
  var IDLE_MS = 90000; // 1.5 min of no interaction before the splash appears.
  var state = { dateKey: '', idle: false, appointments: [], tz: 'Europe/Malta' };
  var idleTimer = null;

  function $(id){ return document.getElementById(id); }

  function pad(n){ return String(n).padStart(2,'0'); }

  // "Today" and "now in minutes since midnight" in Malta (server) time, not
  // whatever timezone Linda's phone is in. Intl.DateTimeFormat is well
  // supported on mobile browsers.
  function todayMalta(){
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: state.tz }); // YYYY-MM-DD
    } catch(e){
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
    }
  }
  function nowMinutesMalta(){
    try {
      var s = new Date().toLocaleTimeString('en-GB', { timeZone: state.tz, hour12: false, hour: '2-digit', minute: '2-digit' });
      var p = s.split(':');
      return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    } catch(e){
      var d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }
  function today(){ return todayMalta(); }
  function parseKey(k){
    var p = k.split('-');
    return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  }
  function toKey(d){
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }
  function formatNice(k){
    try {
      var d = parseKey(k);
      return d.toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    } catch(e){ return k; }
  }

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function statusClass(s){
    if (!s) return 'status-BOOKED';
    if (s.indexOf('CANCELLED') >= 0) return 'status-CANCELLED';
    return 'status-' + s;
  }
  function renderNextUp(){
    var el = $('nextUp');
    if (!el) return;
    // Only show when viewing today.
    if (state.dateKey !== today()){
      el.innerHTML = '';
      return;
    }
    var nowMin = nowMinutesMalta();
    var next = null;
    for (var i = 0; i < (state.appointments || []).length; i++){
      var a = state.appointments[i];
      if (!a.status || String(a.status).indexOf('CANCELLED') >= 0) continue;
      var p = a.start_time.split(':');
      var mins = parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
      if (mins + 15 < nowMin) continue; // 15-min grace after start
      if (!next || mins < next._mins) { next = a; next._mins = mins; }
    }
    if (!next){ el.innerHTML = ''; return; }
    var delta = next._mins - nowMin;
    var label, cls = 'next-up';
    if (delta <= 0) { label = 'happening now'; cls += ' now'; }
    else if (delta < 60) { label = 'in ' + delta + ' min'; if (delta <= 30) cls += ' soon'; }
    else { var h = Math.floor(delta/60), m = delta%60; label = 'in ' + h + 'h' + (m ? ' ' + m + 'm' : ''); }
    el.innerHTML = '<div class="' + cls + '"><div class="icon">\u23F1</div><div class="meta">' +
      '<div class="line1">Next up</div>' +
      '<div class="line2">' + esc(next.start_time) + ' \u2014 ' + esc(next.full_name || 'No name') + '</div>' +
      '<div class="line3">' + esc(label) + '</div>' +
    '</div></div>';
  }

  // Re-render the next-up banner every 30s so the countdown ticks.
  setInterval(function(){ if (!state.idle) renderNextUp(); }, 30000);

  function statusLabel(s){
    if (!s) return 'Booked';
    if (s.indexOf('CANCELLED') >= 0) return 'Cancelled';
    if (s === 'ATTENDED') return 'Attended';
    if (s === 'NO_SHOW') return 'No-show';
    return 'Booked';
  }

  function renderAppts(list){
    state.appointments = list;
    var el = $('list');
    $('summary').textContent = list.length + ' appointment' + (list.length === 1 ? '' : 's');
    // Day-wide buttons only make sense when there's at least one active booking.
    var activeCount = 0;
    for (var j = 0; j < list.length; j++){
      if (!list[j].status || String(list[j].status).indexOf('CANCELLED') < 0) activeCount++;
    }
    $('dayActions').style.display = activeCount > 0 ? '' : 'none';
    renderNextUp();
    if (!list.length){
      el.innerHTML = '<div class="empty"><div class="emptyEmoji">🌿</div>No appointments on this day.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++){
      var a = list[i];
      var tel = (a.phone || '').replace(/\\s+/g,'');
      var email = a.email || '';
      var time = esc(a.start_time) + ' – ' + esc(a.end_time);
      var statusCls = statusClass(a.status);
      var statusTxt = statusLabel(a.status);
      html += '<div class="appt">';
      html +=   '<div class="appt-head">';
      html +=     '<div class="appt-time">' + time + '</div>';
      html +=     '<div class="appt-status ' + statusCls + '">' + statusTxt + '</div>';
      html +=   '</div>';
      var patientPayload = esc(JSON.stringify({ email: a.email || '', phone: a.phone || '', name: a.full_name || '' }));
      html +=   '<div class="appt-name" data-patient="' + patientPayload + '" onclick="openPatientHistoryFromEl(this)">' + esc(a.full_name || 'No name') + '</div>';
      if (a.service_name) html += '<div style="font-size:13px;color:var(--muted);">' + esc(a.service_name) + '</div>';
      html +=   '<div class="contact-row">';
      if (tel) html += '<a class="contact-btn call" href="tel:' + esc(tel) + '"><span class="icon">📞</span><span class="val">' + esc(a.phone) + '</span></a>';
      if (email) html += '<a class="contact-btn email" href="mailto:' + esc(email) + '"><span class="icon">✉️</span><span class="val">' + esc(email) + '</span></a>';
      html +=   '</div>';
      if (a.comments && a.comments.trim()){
        html += '<div class="comments"><div class="comments-label">Note from patient</div>' + esc(a.comments) + '</div>';
      }
      var cancelled = a.status && a.status.indexOf('CANCELLED') >= 0;
      if (!cancelled){
        var nextPayload = esc(JSON.stringify({ id: a.id, fullName: a.full_name, email: a.email, phone: a.phone, comments: a.comments || '' }));
        html += '<div class="action-row">';
        html +=   '<button class="action-btn reschedule" onclick="openReschedule(\\'' + esc(a.id) + '\\')">Reschedule</button>';
        html +=   '<button class="action-btn next-session" data-patient="' + nextPayload + '" onclick="openScheduleNextFromEl(this)">Schedule Next Session</button>';
        html += '</div>';
        // Attended / No-show — hide once already marked; show a tiny Reopen
        // link instead so she can undo if she tapped by mistake.
        if (a.status === 'ATTENDED' || a.status === 'NO_SHOW'){
          html += '<div class="action-row" style="margin-top:6px;">';
          html +=   '<button class="action-btn reopen" onclick="markStatus(\\'' + esc(a.id) + '\\',\\'BOOKED\\')">Undo \u2014 reopen booking</button>';
          html += '</div>';
        } else {
          html += '<div class="action-row" style="margin-top:6px;">';
          html +=   '<button class="action-btn attended" onclick="markStatus(\\'' + esc(a.id) + '\\',\\'ATTENDED\\')">\u2713 Attended</button>';
          html +=   '<button class="action-btn noshow" onclick="markStatus(\\'' + esc(a.id) + '\\',\\'NO_SHOW\\')">No-show</button>';
          html += '</div>';
        }
        var cancelInfo = esc(JSON.stringify({ id: a.id, name: a.full_name || 'this patient', dateKey: a.date_key, startTime: a.start_time }));
        html += '<div class="action-row" style="margin-top:6px;">';
        html +=   '<button class="action-btn cancel" data-appt="' + cancelInfo + '" onclick="cancelOneFromEl(this)">Cancel</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    el.innerHTML = html;
  }

  async function load(){
    if (state.idle) return;
    var el = $('list');
    try {
      var res = await fetch('/api/linda-day?date=' + encodeURIComponent(state.dateKey));
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok){ el.innerHTML = '<div class="err">' + esc(data.reason || 'Failed to load.') + '</div>'; return; }
      renderAppts(data.appointments || []);
    } catch (e) {
      el.innerHTML = '<div class="err">Network error — pull down to retry.</div>';
    }
  }

  // ── Search across all Linda appointments ──
  var searchTimer = null;
  function runSearch(q){
    var rEl = $('searchResults'), dEl = $('dayContent');
    if (!q || q.length < 2){
      rEl.style.display = 'none';
      rEl.innerHTML = '';
      dEl.style.display = '';
      $('searchClear').style.display = 'none';
      return;
    }
    dEl.style.display = 'none';
    rEl.style.display = '';
    rEl.innerHTML = '<div class="empty" style="margin:16px 0;border:none;">Searching…</div>';
    $('searchClear').style.display = '';
    fetch('/api/linda-search?q=' + encodeURIComponent(q)).then(function(r){
      if (r.status === 403) { window.location.reload(); return null; }
      return r.json();
    }).then(function(data){
      if (!data || !data.ok) return;
      if (!data.results.length){
        rEl.innerHTML = '<div class="empty" style="margin:16px 0;border:none;">No matches.</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < data.results.length; i++){
        var r = data.results[i];
        html += '<div class="srow" onclick="jumpToDate(\\'' + esc(r.date_key) + '\\')">';
        html +=   '<div class="srow-main">' + esc(r.full_name || 'No name') + ' <span style="color:var(--muted);font-weight:600;">· ' + esc(r.start_time) + '</span></div>';
        html +=   '<div class="srow-dim">' + esc(formatNiceShort(r.date_key)) + (r.phone ? ' · ' + esc(r.phone) : '') + (r.status ? ' · ' + esc(statusLabel(r.status)) : '') + '</div>';
        html += '</div>';
      }
      rEl.innerHTML = html;
    }).catch(function(){
      rEl.innerHTML = '<div class="err" style="margin:16px 0;">Search failed.</div>';
    });
  }
  window.clearSearch = function(){
    $('searchInput').value = '';
    runSearch('');
  };
  window.jumpToDate = function(dk){
    $('searchInput').value = '';
    runSearch('');
    setDate(dk);
  };

  function setDate(k){
    state.dateKey = k;
    $('dateInput').value = k;
    var btnLabel = $('dateInputLabel');
    if (btnLabel) btnLabel.textContent = fmtDay(k);
    $('dayLabel').textContent = formatNice(k);
    load();
  }
  function navDay(delta){
    var d = parseKey(state.dateKey);
    d.setDate(d.getDate() + delta);
    setDate(toKey(d));
  }
  function goToday(){ setDate(today()); }
  window.navDay = navDay;
  window.goToday = goToday;

  // dateInput is now a hidden field driven by the calendar picker; no change listener needed.

  $('searchInput').addEventListener('input', function(e){
    var q = e.target.value.trim();
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function(){ runSearch(q); }, 220);
  });

  window.logout = function(){
    document.cookie = 'linda_sig=; Path=/; Max-Age=0';
    window.location.href = '/linda';
  };

  // ── Tab switching ──
  window.setTab = function(which){
    // Switching tabs clears any in-flight search so panes don't render on top
    // of each other and the Day list isn't hidden behind search results.
    if ($('searchInput').value){
      $('searchInput').value = '';
      runSearch('');
    }
    $('pane-day').style.display = which === 'day' ? '' : 'none';
    $('pane-week').style.display = which === 'week' ? '' : 'none';
    $('pane-avail').style.display = which === 'avail' ? '' : 'none';
    $('tabDayBtn').classList.toggle('active', which === 'day');
    $('tabWeekBtn').classList.toggle('active', which === 'week');
    $('tabAvailBtn').classList.toggle('active', which === 'avail');
    if (which === 'avail') loadExtras();
    if (which === 'week') loadWeek();
  };

  // ── Availability tab: load, add, delete ──
  function formatNiceShort(k){
    try {
      var d = parseKey(k);
      return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
    } catch(e){ return k; }
  }

  async function loadExtras(){
    var el = $('extraList');
    el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div>';
    try {
      var res = await fetch('/api/linda-extras');
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok) { el.innerHTML = '<div class="err" style="margin:0;">' + esc(data.reason || 'Failed') + '</div>'; return; }
      if (!data.extras || !data.extras.length) {
        el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:20px 0;">🌱 Nothing extra open yet. Use the form above to add hours.</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < data.extras.length; i++){
        var x = data.extras[i];
        html += '<div class="extra-row" id="extra-row-' + x.id + '">';
        html +=   '<div style="flex:1 1 auto;min-width:0;">';
        html +=     '<div class="extra-when">' + esc(formatNiceShort(x.date_key)) + ' · <span id="extra-time-' + x.id + '">' + esc(x.start_time) + '–' + esc(x.end_time) + '</span></div>';
        if (x.reason) html += '<div class="extra-dim">' + esc(x.reason) + '</div>';
        html +=     '<div class="extra-edit-panel" id="extra-edit-' + x.id + '" style="display:none;">';
        html +=       '<input type="time" step="1800" id="extra-s-' + x.id + '" value="' + esc(x.start_time) + '">';
        html +=       '<span>→</span>';
        html +=       '<input type="time" step="1800" id="extra-e-' + x.id + '" value="' + esc(x.end_time) + '">';
        html +=       '<button class="save" onclick="saveExtraEdit(' + x.id + ')">Save</button>';
        html +=       '<button class="cancel" onclick="toggleExtraEdit(' + x.id + ',false)">Cancel</button>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div>';
        html +=     '<button class="extra-edit" onclick="toggleExtraEdit(' + x.id + ',true)">Edit</button>';
        html +=     '<button class="extra-del" onclick="deleteExtra(' + x.id + ')">Remove</button>';
        html +=   '</div>';
        html += '</div>';
      }
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }

  function setAvMsg(text, kind){
    var m = $('avMsg');
    m.textContent = text || '';
    m.className = 'avail-msg' + (kind ? ' ' + kind : '');
  }

  window.saveAvail = async function(){
    var dateFrom = $('avDateFrom').value;
    var dateTo = $('avDateTo').value;
    var start = $('avStart').value;
    var end = $('avEnd').value;
    var evStart = $('avEveningStart').value;
    var evEnd = $('avEveningEnd').value;
    if (!dateFrom) { setAvMsg('Pick a start date.', 'bad'); return; }
    if (!start || !end) { setAvMsg('Pick a morning start and end time.', 'bad'); return; }
    if ((evStart && !evEnd) || (!evStart && evEnd)) { setAvMsg('Evening needs both a start and end time.', 'bad'); return; }
    setAvMsg('Saving…', '');
    var body = { dateKey: dateFrom, dateKeyEnd: dateTo || undefined, startTime: start, endTime: end };
    if (evStart && evEnd) { body.eveningStart = evStart; body.eveningEnd = evEnd; }
    try {
      var res = await fetch('/api/linda-extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok) {
        setAvMsg('Opened ' + data.added + ' row' + (data.added === 1 ? '' : 's') + '.', 'ok');
        loadExtras();
      } else {
        setAvMsg(data.reason || 'Failed', 'bad');
      }
    } catch (e) {
      setAvMsg('Network error', 'bad');
    }
  };

  window.toggleExtraEdit = function(id, on){
    var p = document.getElementById('extra-edit-' + id);
    if (p) p.style.display = on ? '' : 'none';
  };
  window.saveExtraEdit = async function(id){
    var s = (document.getElementById('extra-s-' + id) || {}).value || '';
    var e = (document.getElementById('extra-e-' + id) || {}).value || '';
    if (!s || !e) { alert('Pick start and end times.'); return; }
    try {
      var res = await fetch('/api/linda-extras', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, startTime: s, endTime: e }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok) { loadExtras(); }
      else alert(data.reason || 'Failed');
    } catch(err){ alert('Network error'); }
  };

  window.deleteExtra = async function(id){
    if (!confirm('Remove this extra availability?')) return;
    try {
      var res = await fetch('/api/linda-extras?id=' + id, { method: 'DELETE' });
      if (res.status === 403) { window.location.reload(); return; }
      loadExtras();
    } catch(e){}
  };

  // ── Patient history drawer ──
  window.closePatientHistory = function(){
    $('phOverlay').classList.remove('show');
    $('phSheet').classList.remove('show');
  };
  window.openPatientHistory = async function(patient){
    $('phName').textContent = patient.name || 'Patient';
    $('phStats').innerHTML = '';
    $('phLast').textContent = 'Loading…';
    $('phAppts').innerHTML = '';
    $('phOverlay').classList.add('show');
    $('phSheet').classList.add('show');
    try {
      var url = '/api/linda-patient-history?email=' + encodeURIComponent(patient.email || '') + '&phone=' + encodeURIComponent(patient.phone || '');
      var res = await fetch(url);
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok) { $('phLast').textContent = data.reason || 'Failed to load.'; return; }
      var s = data.stats;
      $('phStats').innerHTML =
        '<div class="ph-stat"><div class="num">' + s.total + '</div><div class="label">Total</div></div>' +
        '<div class="ph-stat"><div class="num">' + s.attended + '</div><div class="label">Attended</div></div>' +
        '<div class="ph-stat"><div class="num">' + s.noShow + '</div><div class="label">No-show</div></div>' +
        '<div class="ph-stat"><div class="num">' + s.upcoming + '</div><div class="label">Upcoming</div></div>';
      $('phLast').textContent = s.lastVisit ? 'Last visit: ' + fmtDay(s.lastVisit) : (s.upcoming ? 'No past visits yet.' : 'No visits on record.');
      var html = '';
      for (var i = 0; i < data.appointments.length; i++){
        var a = data.appointments[i];
        var cls = statusClass(a.status);
        var lbl = statusLabel(a.status);
        html += '<div class="ph-item" onclick="closePatientHistory();jumpToDate(\\'' + esc(a.date_key) + '\\')">';
        html +=   '<div><div class="when">' + esc(formatNiceShort(a.date_key)) + '</div><div style="font-size:12px;color:var(--muted);">' + esc(a.start_time) + '</div></div>';
        html +=   '<div class="st ' + cls + '">' + esc(lbl) + '</div>';
        html += '</div>';
      }
      $('phAppts').innerHTML = html || '<div style="color:var(--muted);font-size:13px;text-align:center;padding:12px;">No appointments.</div>';
    } catch (e) {
      $('phLast').textContent = 'Network error.';
    }
  };

  // ── Copy day hours to future dates ──
  var cdTargets = [];
  function renderCopyChips(){
    var el = $('cdTargetChips');
    if (!cdTargets.length) { el.innerHTML = '<span style="font-size:12px;color:var(--muted);">No targets yet.</span>'; return; }
    var html = '';
    for (var i = 0; i < cdTargets.length; i++){
      html += '<span style="display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;color:#065f46;padding:6px 10px;border-radius:999px;font-size:13px;font-weight:700;">';
      html +=   esc(formatNiceShort(cdTargets[i]));
      html +=   ' <button type="button" onclick="removeCopyTarget(' + i + ')" style="background:none;border:none;color:#065f46;font-size:16px;cursor:pointer;line-height:1;padding:0;">&times;</button>';
      html += '</span>';
    }
    el.innerHTML = html;
  }
  window.removeCopyTarget = function(idx){ cdTargets.splice(idx, 1); renderCopyChips(); };
  window.addCopyTargetPreset = function(which){
    var from = $('cdFrom').value;
    if (!from) { alert('Pick a source date first.'); return; }
    if (which === 'next-week'){
      cdTargets.push(shiftDays(from, 7));
    } else if (which === 'next-4-weeks'){
      for (var i = 1; i <= 4; i++) cdTargets.push(shiftDays(from, 7 * i));
    }
    // dedupe
    cdTargets = Array.from(new Set(cdTargets));
    renderCopyChips();
  };
  window.addCopyTargetCustom = function(){
    pickDate('cdCustomTmp', function(dk){
      cdTargets.push(dk);
      cdTargets = Array.from(new Set(cdTargets));
      renderCopyChips();
    });
  };

  window.submitCopyDay = async function(){
    var from = $('cdFrom').value;
    if (!from) { $('cdMsg').textContent = 'Pick a source date first.'; $('cdMsg').className = 'avail-msg bad'; return; }
    if (!cdTargets.length) { $('cdMsg').textContent = 'Add at least one target date.'; $('cdMsg').className = 'avail-msg bad'; return; }
    $('cdMsg').textContent = 'Copying…'; $('cdMsg').className = 'avail-msg';
    try {
      var res = await fetch('/api/linda-copy-day', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDateKey: from, toDateKeys: cdTargets }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        $('cdMsg').textContent = 'Copied ' + data.inserted + ' row(s)' + (data.skipped ? ' (' + data.skipped + ' duplicate' + (data.skipped === 1 ? '' : 's') + ' skipped)' : '') + '.';
        $('cdMsg').className = 'avail-msg ok';
        cdTargets = [];
        renderCopyChips();
        loadExtras();
      } else {
        $('cdMsg').textContent = data.reason || 'Failed';
        $('cdMsg').className = 'avail-msg bad';
      }
    } catch(e){
      $('cdMsg').textContent = 'Network error';
      $('cdMsg').className = 'avail-msg bad';
    }
  };

  // Create a hidden input for the ad-hoc target picker used by Copy Day.
  var cdCustomTmp = document.createElement('input');
  cdCustomTmp.type = 'hidden';
  cdCustomTmp.id = 'cdCustomTmp';
  document.body.appendChild(cdCustomTmp);
  // Matching label + button elements so pickDate() has something to update.
  ['cdCustomTmpLabel','cdCustomTmpBtn'].forEach(function(id){
    var el = document.createElement('span'); el.id = id; el.style.display = 'none'; document.body.appendChild(el);
  });

  // Paint the empty-state on first load.
  renderCopyChips();

  // ── Inline calendar picker (replaces dd/mm/yyyy native inputs) ──
  var cal = { month: null, year: null, onPick: null, targetHidden: null, targetLabel: null, targetBtn: null };
  var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function fmtDay(k){
    try {
      var d = parseKey(k);
      return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    } catch(e){ return k; }
  }

  // Cap the picker to a sane range so Linda can't accidentally pick 2050.
  function calBounds(){
    var now = new Date();
    var min = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    var max = new Date(now.getFullYear() + 2, now.getMonth(), 1);
    return { minK: toKey(min), maxK: toKey(max) };
  }

  function renderCalGrid(){
    $('calTitle').textContent = MONTH_NAMES[cal.month] + ' ' + cal.year;
    var first = new Date(cal.year, cal.month, 1);
    // Convert JS Sunday-first (0=Sun) to Mon-first index.
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();
    var daysInPrev = new Date(cal.year, cal.month, 0).getDate();
    var todayK = today();
    var selK = cal.targetHidden ? $(cal.targetHidden).value : '';
    var bounds = calBounds();
    var html = '';
    // Previous-month trailing days
    for (var i = 0; i < startOffset; i++){
      var d = daysInPrev - startOffset + i + 1;
      html += '<button class="cal-cell other-month" disabled>' + d + '</button>';
    }
    // This month
    for (var d = 1; d <= daysInMonth; d++){
      var dk = cal.year + '-' + pad(cal.month + 1) + '-' + pad(d);
      var classes = 'cal-cell';
      var dayOfWeek = new Date(cal.year, cal.month, d).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
      if (dk === todayK) classes += ' today';
      if (dk === selK) classes += ' sel';
      var outOfBounds = dk < bounds.minK || dk > bounds.maxK;
      if (outOfBounds) classes += ' disabled';
      var onclick = outOfBounds ? '' : ' onclick="calPick(\\'' + dk + '\\')"';
      html += '<button class="' + classes + '"' + onclick + (outOfBounds ? ' disabled' : '') + '>' + d + '</button>';
    }
    // Fill trailing cells to complete the 6-row grid (optional tidy).
    var total = startOffset + daysInMonth;
    var rem = (7 - (total % 7)) % 7;
    for (var i = 0; i < rem; i++){
      html += '<button class="cal-cell other-month" disabled>' + (i + 1) + '</button>';
    }
    $('calGrid').innerHTML = html;
  }

  window.calStep = function(delta){
    cal.month += delta;
    if (cal.month < 0) { cal.month = 11; cal.year--; }
    else if (cal.month > 11) { cal.month = 0; cal.year++; }
    renderCalGrid();
  };

  window.closeCal = function(){
    $('calOverlay').classList.remove('show');
    $('calSheet').classList.remove('show');
  };

  window.calPick = function(dk){
    if (cal.targetHidden) $(cal.targetHidden).value = dk;
    if (cal.targetLabel) $(cal.targetLabel).textContent = fmtDay(dk);
    if (cal.targetBtn) $(cal.targetBtn).classList.remove('empty');
    var fn = cal.onPick;
    closeCal();
    if (typeof fn === 'function') fn(dk);
  };

  // pickDate(hiddenInputId) — opens the calendar targeting <input type="hidden" id="...">
  // and updates its matching label (id+"Label") and button (id+"Btn") classes.
  window.pickDate = function(hiddenId, onPick){
    var existing = $(hiddenId).value;
    var d = existing ? parseKey(existing) : new Date();
    cal.month = d.getMonth();
    cal.year = d.getFullYear();
    cal.targetHidden = hiddenId;
    cal.targetLabel = hiddenId + 'Label';
    cal.targetBtn = hiddenId + 'Btn';
    cal.onPick = onPick || null;
    renderCalGrid();
    $('calOverlay').classList.add('show');
    $('calSheet').classList.add('show');
  };

  // ── Booking sheet (used for new booking; reschedule extension in next commit) ──
  var sheet = { mode: 'new', slot: '', apptId: '' };

  function openSheet(){ $('sheetOverlay').classList.add('show'); $('sheet').classList.add('show'); }
  window.closeSheet = function(){ $('sheetOverlay').classList.remove('show'); $('sheet').classList.remove('show'); };

  function setBfDate(k){
    $('bfDate').value = k;
    $('bfDateLabel').textContent = fmtDay(k);
    $('bfDateBtn').classList.remove('empty');
  }

  function resetSheet(){
    $('bfName').value = ''; $('bfPhone').value = ''; $('bfEmail').value = ''; $('bfComments').value = '';
    setBfDate(state.dateKey || today());
    $('bfSlots').innerHTML = '<div class="sheet-msg">Pick a date first.</div>';
    $('bfOpenPrompt').style.display = 'none';
    $('bfMsg').innerHTML = '';
    sheet.slot = '';
    updateSheetSubmit();
  }

  window.openBookSheet = function(prefill){
    sheet.mode = 'new'; sheet.apptId = '';
    $('sheetTitle').textContent = 'Book appointment';
    $('sheetPatientSection').style.display = '';
    $('bfSubmit').textContent = 'Book';
    resetSheet();
    if (prefill){
      if (prefill.fullName) $('bfName').value = prefill.fullName;
      if (prefill.phone) $('bfPhone').value = prefill.phone;
      if (prefill.email) $('bfEmail').value = prefill.email;
      if (prefill.comments) $('bfComments').value = prefill.comments;
    }
    openSheet();
    loadSheetSlots();
  };

  function renderSheetSlots(data){
    var el = $('bfSlots');
    $('bfOpenPrompt').style.display = 'none';
    if (!data.ok){ el.innerHTML = '<div class="sheet-msg bad">' + esc(data.reason || 'Failed') + '</div>'; return; }
    if (!data.isWorkingDay){
      el.innerHTML = '<div class="sheet-msg bad">Not a working day yet for this date.</div>';
      $('bfOpenPrompt').style.display = '';
      return;
    }
    if (!data.slots || !data.slots.length){
      el.innerHTML = '<div class="sheet-msg">No slots on this date.</div>';
      return;
    }
    var html = '<div class="slot-grid">';
    for (var i = 0; i < data.slots.length; i++){
      var s = data.slots[i];
      var cls = 'slot-btn' + (s.available ? '' : ' dis');
      var click = s.available ? ' onclick="pickSlot(\\'' + s.start + '\\')"' : '';
      html += '<button class="' + cls + '" data-slot="' + esc(s.start) + '"' + click + (s.available ? '' : ' disabled') + '>' + esc(s.start) + '</button>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  window.pickSlot = function(startTime){
    sheet.slot = startTime;
    var btns = document.querySelectorAll('#bfSlots .slot-btn');
    for (var i = 0; i < btns.length; i++){
      btns[i].classList.toggle('chosen', btns[i].getAttribute('data-slot') === startTime);
    }
    updateSheetSubmit();
  };

  async function loadSheetSlots(){
    var dk = $('bfDate').value;
    if (!dk) { $('bfSlots').innerHTML = '<div class="sheet-msg">Pick a date first.</div>'; return; }
    $('bfSlots').innerHTML = '<div class="sheet-msg">Loading…</div>';
    try {
      var res = await fetch('/api/linda-slots?date=' + encodeURIComponent(dk));
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      sheet.slot = '';
      renderSheetSlots(data);
      updateSheetSubmit();
    } catch(e){
      $('bfSlots').innerHTML = '<div class="sheet-msg bad">Network error.</div>';
    }
  }
  // bfDate is now a hidden field set via pickDate + setBfDate; the picker's
  // onPick callback handles loading slots.

  window.quickOpenDate = async function(){
    var dk = $('bfDate').value;
    var s = $('bfOpenStart').value, e = $('bfOpenEnd').value;
    var evS = $('bfOpenEveningStart').value, evE = $('bfOpenEveningEnd').value;
    if (!dk || !s || !e) return;
    if ((evS && !evE) || (!evS && evE)) { alert('Evening needs both a start and end.'); return; }
    var body = { dateKey: dk, startTime: s, endTime: e };
    if (evS && evE) { body.eveningStart = evS; body.eveningEnd = evE; }
    try {
      var res = await fetch('/api/linda-extras', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.ok) { loadSheetSlots(); }
      else { alert(data.reason || 'Failed to open day.'); }
    } catch(e){}
  };

  function updateSheetSubmit(){
    var dk = $('bfDate').value;
    var hasSlot = !!sheet.slot;
    var hasPatient = sheet.mode === 'reschedule' || ($('bfName').value.trim() && ($('bfPhone').value.trim() || $('bfEmail').value.trim()));
    $('bfSubmit').disabled = !(dk && hasSlot && hasPatient);
  }
  ['bfName','bfPhone','bfEmail'].forEach(function(id){ $(id).addEventListener('input', updateSheetSubmit); });

  // ── Patient autocomplete on the Name input ──
  var acTimer = null;
  function closeAc(){ $('bfAcList').classList.remove('show'); $('bfAcList').innerHTML = ''; }
  $('bfName').addEventListener('input', function(e){
    var q = e.target.value.trim();
    if (acTimer) clearTimeout(acTimer);
    if (q.length < 2) { closeAc(); return; }
    acTimer = setTimeout(async function(){
      try {
        var res = await fetch('/api/linda-clients-autocomplete?q=' + encodeURIComponent(q));
        if (res.status === 403) { window.location.reload(); return; }
        var data = await res.json();
        if (!data.ok || !data.results || !data.results.length) { closeAc(); return; }
        var html = '';
        for (var i = 0; i < data.results.length; i++){
          var r = data.results[i];
          var p = esc(JSON.stringify(r));
          html += '<div class="ac-item" data-patient="' + p + '" onclick="pickAcFromEl(this)">';
          html +=   '<div class="name">' + esc(r.fullName || 'Unknown') + '</div>';
          html +=   '<div class="dim">' + [r.phone, r.email].filter(Boolean).map(esc).join(' · ') + '</div>';
          html += '</div>';
        }
        $('bfAcList').innerHTML = html;
        $('bfAcList').classList.add('show');
      } catch(e){}
    }, 220);
  });
  window.pickAc = function(r){
    $('bfName').value = r.fullName || '';
    $('bfPhone').value = r.phone || '';
    $('bfEmail').value = r.email || '';
    closeAc();
    updateSheetSubmit();
  };
  // Close autocomplete when user leaves the name field.
  $('bfName').addEventListener('blur', function(){ setTimeout(closeAc, 150); });

  function setBfMsg(text, kind){
    $('bfMsg').innerHTML = text ? ('<div class="sheet-msg ' + (kind || '') + '">' + esc(text) + '</div>') : '';
  }

  window.openReschedule = function(appointmentId){
    sheet.mode = 'reschedule';
    sheet.apptId = appointmentId;
    $('sheetTitle').textContent = 'Reschedule appointment';
    $('sheetPatientSection').style.display = 'none';
    $('bfSubmit').textContent = 'Reschedule';
    resetSheet();
    openSheet();
    loadSheetSlots();
  };

  // Schedule Next Session — prefills the Book sheet with this patient's
  // details and defaults to tomorrow, so Linda can quickly book their
  // follow-up appointment.
  // ── Cancel handlers (per appointment + whole day) ──
  function readJsonAttr(el, attr){
    try { return JSON.parse(el.getAttribute(attr) || '{}'); } catch(e){ return {}; }
  }
  window.cancelOneFromEl = async function(el){
    var info = readJsonAttr(el, 'data-appt');
    var rebook = confirm('Cancel ' + (info.name || 'this appointment') + ' at ' + info.startTime + '?\\n\\n[OK] Cancel — email them the cancellation.\\n[Cancel] Back out.');
    if (!rebook) return;
    var invite = confirm('Also invite them to book a new time?\\n\\n[OK] Yes, send "please rebook" email.\\n[Cancel] No, standard cancellation email.');
    try {
      var res = await fetch('/api/linda-cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: info.id, rebook: invite, reason: 'Cancelled by Linda' }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok) { load(); if ($('pane-week').style.display !== 'none') loadWeek(); }
      else alert(data.reason || 'Failed');
    } catch(e){ alert('Network error'); }
  };
  window.markStatus = async function(id, status){
    try {
      var res = await fetch('/api/linda-mark-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: status }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok) { load(); if ($('pane-week').style.display !== 'none') loadWeek(); }
      else alert(data.reason || 'Failed');
    } catch(e){ alert('Network error'); }
  };
  window.cancelAllDay = function(){ bulkCancelDay(false); };
  window.rescheduleAllDay = function(){ bulkCancelDay(true); };
  async function bulkCancelDay(rebook){
    var verb = rebook ? 'Reschedule all' : 'Cancel all';
    var msg = rebook
      ? 'Send every patient on this day a "please rebook" email and clear your calendar for the day?'
      : 'Cancel every booking on this day and email each patient?';
    if (!confirm(verb + ' — ' + msg)) return;
    try {
      var res = await fetch('/api/linda-cancel-day', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: state.dateKey, rebook: rebook, reason: rebook ? 'Linda needs to reschedule' : 'Cancelled by Linda' }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        alert(verb + ' — ' + data.cancelled + ' appointment' + (data.cancelled === 1 ? '' : 's') + ' processed.');
        load();
        if ($('pane-week').style.display !== 'none') loadWeek();
      } else {
        alert(data.reason || 'Failed');
      }
    } catch(e){ alert('Network error'); }
  }

  // Safe wrappers: read data-patient JSON from the clicked element and parse.
  // The raw JSON is HTML-escaped at render time (no inline JS eval), so a
  // stray quote can't break out and inject script.
  function readPatientAttr(el){
    try { return JSON.parse(el.getAttribute('data-patient') || '{}'); } catch(e){ return {}; }
  }
  window.openPatientHistoryFromEl = function(el){ openPatientHistory(readPatientAttr(el)); };
  window.openScheduleNextFromEl = function(el){ openScheduleNext(readPatientAttr(el)); };
  window.pickAcFromEl = function(el){ pickAc(readPatientAttr(el)); };

  window.openScheduleNext = function(patient){
    var d = parseKey(state.dateKey);
    d.setDate(d.getDate() + 1);
    openBookSheet({ fullName: patient.fullName, email: patient.email, phone: patient.phone, comments: '' });
    setBfDate(toKey(d));
    $('sheetTitle').textContent = 'Schedule next session';
    loadSheetSlots();
  };

  window.submitSheet = async function(){
    $('bfSubmit').disabled = true;
    $('bfSubmit').textContent = sheet.mode === 'reschedule' ? 'Rescheduling…' : 'Booking…';
    setBfMsg('', '');
    var dk = $('bfDate').value;
    try {
      var endpoint = sheet.mode === 'reschedule' ? '/api/linda-reschedule' : '/api/linda-new-booking';
      var body = sheet.mode === 'reschedule'
        ? { appointmentId: sheet.apptId, dateKey: dk, startTime: sheet.slot }
        : {
            dateKey: dk,
            startTime: sheet.slot,
            fullName: $('bfName').value.trim(),
            email: $('bfEmail').value.trim(),
            phone: $('bfPhone').value.trim(),
            comments: $('bfComments').value.trim(),
          };
      var res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      var data = await res.json();
      if (data.ok){
        setBfMsg(sheet.mode === 'reschedule' ? 'Rescheduled.' : 'Booked!', 'ok');
        setTimeout(function(){
          window.closeSheet();
          setDate(dk);  // reloads the day list + triggers renderNextUp once appointments arrive
          if ($('pane-week').style.display !== 'none') loadWeek(); // keep week grid fresh when she's on it
        }, 700);
      } else {
        setBfMsg(data.reason || 'Failed', 'bad');
        $('bfSubmit').disabled = false;
        $('bfSubmit').textContent = sheet.mode === 'reschedule' ? 'Reschedule' : 'Book';
      }
    } catch(e){
      setBfMsg('Network error', 'bad');
      $('bfSubmit').disabled = false;
      $('bfSubmit').textContent = sheet.mode === 'reschedule' ? 'Reschedule' : 'Book';
    }
  };

  // ── Idle overlay ──
  // Behaviour: shows after IDLE_MS of real interaction-free time, AND
  // immediately whenever the tab is hidden (so coming back from another
  // app always lands on the splash). Tap anywhere to resume.
  function goIdle(){
    if (state.idle) return;
    state.idle = true;
    $('idleOverlay').classList.add('show');
    if (_ws) { try { _ws.close(); } catch(e) {} _ws = null; }
  }
  function resetIdle(){
    if (state.idle){
      state.idle = false;
      $('idleOverlay').classList.remove('show');
      load();
      connectWS();
    }
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  // Interaction events only — visibilitychange is handled separately below.
  ['touchstart','mousedown','keydown','scroll'].forEach(function(ev){
    document.addEventListener(ev, resetIdle, { passive: true });
  });
  $('idleOverlay').addEventListener('click', resetIdle);

  // When the tab becomes hidden (home-button press, app switch, screen lock),
  // immediately show the splash so the next time Linda opens the app she sees
  // it and can tap to wake. When she comes back, we leave the splash visible
  // until she actually taps — matches the rest of the app's pages.
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) goIdle();
  });

  // ── WebSocket for live booking notifications ──
  var _ws = null, _wsDelay = 1000, _wsTimer = null;
  function connectWS(){
    if (state.idle) return;
    if (_wsTimer) { clearTimeout(_wsTimer); _wsTimer = null; }
    var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    try { _ws = new WebSocket(proto + '//' + location.host + '/api/ws'); } catch(e) { scheduleWS(); return; }
    _ws.onopen = function(){
      _wsDelay = 1000;
      try { _ws.send(JSON.stringify({ subscribe: 'linda' })); } catch(e){}
      $('liveDot').classList.add('on');
    };
    _ws.onmessage = function(ev){
      try {
        if (ev.data === 'pong' || ev.data === 'ping') return;
        var msg = JSON.parse(ev.data);
        if (msg.type === 'slots_updated' || msg.type === 'appointment_changed'){
          // Refresh the Day list when the change is for the date we're viewing
          // (or unknown), and refresh the Week grid whenever it's the visible pane.
          if (!msg.dateKey || msg.dateKey === state.dateKey){
            showToast();
            load();
          }
          if ($('pane-week').style.display !== 'none') loadWeek();
        }
      } catch(e){}
    };
    _ws.onclose = function(){ $('liveDot').classList.remove('on'); scheduleWS(); };
    _ws.onerror = function(){ try { _ws.close(); } catch(e){} };
  }
  function scheduleWS(){
    if (_wsTimer || state.idle) return;
    _wsTimer = setTimeout(function(){ _wsTimer = null; connectWS(); }, _wsDelay);
    _wsDelay = Math.min(_wsDelay * 2, 30000);
  }
  function showToast(){
    var t = $('liveToast');
    t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 2500);
  }
  // Note: the primary visibilitychange handler (idle-overlay side) runs first
  // and sets state.idle = true when the tab hides. This second handler only
  // reconnects the WebSocket when we come back AND we're not in the idle
  // state — so the splash stays put until the user taps resume.
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && !state.idle && (!_ws || _ws.readyState !== 1)){
      _wsDelay = 1000;
      connectWS();
    }
  });

  // ── Week tab ──
  var week = { start: '', data: null };
  var DOW_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var DOW_KEYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var WG_HOUR_START = 7;   // first hour shown
  var WG_HOUR_END = 21;    // last hour shown (exclusive)
  var WG_PX_PER_HALF = 32; // px per 30 min row (matches CSS height:32px)

  function mondayOf(dk){
    var d = parseKey(dk);
    // JS: Sun=0 .. Sat=6. Shift to Mon=0 .. Sun=6.
    var shift = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - shift);
    return toKey(d);
  }
  function shiftDays(dk, n){
    var d = parseKey(dk);
    d.setDate(d.getDate() + n);
    return toKey(d);
  }

  window.navWeek = function(delta){
    week.start = shiftDays(week.start || mondayOf(today()), delta * 7);
    loadWeek();
  };
  window.goThisWeek = function(){ week.start = mondayOf(today()); loadWeek(); };

  async function loadWeek(){
    if (!week.start) week.start = mondayOf(today());
    var grid = $('weekGrid');
    grid.innerHTML = '<div class="empty" style="margin:20px 12px;">Loading…</div>';
    try {
      var res = await fetch('/api/linda-week?start=' + encodeURIComponent(week.start));
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok){ grid.innerHTML = '<div class="err">' + esc(data.reason || 'Failed') + '</div>'; return; }
      week.data = data;
      renderWeek();
    } catch(e){
      grid.innerHTML = '<div class="err">Network error.</div>';
    }
  }

  function weekLabelText(start){
    var d1 = parseKey(start);
    var d2 = parseKey(shiftDays(start, 6));
    var fmt = function(d){ return d.toLocaleDateString(undefined, { day:'numeric', month:'short' }); };
    return fmt(d1) + ' — ' + fmt(d2);
  }

  function timeToMin(hhmm){
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function renderWeek(){
    if (!week.data) return;
    $('weekLabel').textContent = weekLabelText(week.start);
    var todayK = today();
    var appts = week.data.appointments || [];
    var extras = week.data.extras || [];
    var baseHours = week.data.baseHours || {};

    // Build per-day working windows (base hours for that weekday + any extras).
    var byDay = {};
    for (var i = 0; i < 7; i++){
      var dk = shiftDays(week.start, i);
      var dowIdx = (parseKey(dk).getDay() + 6) % 7;
      var windows = [].concat(baseHours[DOW_KEYS[dowIdx]] || []);
      for (var j = 0; j < extras.length; j++){
        if (extras[j].date_key === dk) windows.push({ start: extras[j].start_time, end: extras[j].end_time });
      }
      byDay[dk] = { windows: windows, appts: [] };
    }
    for (var i = 0; i < appts.length; i++){
      var a = appts[i];
      if (byDay[a.date_key]) byDay[a.date_key].appts.push(a);
    }

    var html = '<div class="wg-grid">';
    // Header row
    html += '<div class="wg-head"></div>';
    for (var i = 0; i < 7; i++){
      var dk = shiftDays(week.start, i);
      var isToday = dk === todayK;
      var d = parseKey(dk);
      html += '<div class="wg-head' + (isToday ? ' today-col' : '') + '">';
      html +=   '<div class="dname">' + DOW_NAMES[i] + '</div>';
      html +=   '<div class="dnum">' + d.getDate() + '</div>';
      html += '</div>';
    }
    // Body rows: 30-min increments from WG_HOUR_START to WG_HOUR_END.
    for (var h = WG_HOUR_START; h < WG_HOUR_END; h++){
      for (var hm = 0; hm < 2; hm++){
        // Left column hour label (only on the :00 row)
        html += '<div class="wg-hour-lbl">' + (hm === 0 ? pad(h) + ':00' : '') + '</div>';
        for (var i = 0; i < 7; i++){
          var dk = shiftDays(week.start, i);
          var min = h * 60 + hm * 30;
          // Mark cell as available if within a working window.
          var avail = false;
          var ws = byDay[dk].windows;
          for (var k = 0; k < ws.length; k++){
            if (min >= timeToMin(ws[k].start) && min < timeToMin(ws[k].end)) { avail = true; break; }
          }
          var cls = 'wg-cell' + (avail ? ' avail' : '');
          // Only the :00 cell carries the tap; the :30 cell would double-book.
          var slotTime = pad(h) + ':' + pad(hm * 30);
          html += '<div class="' + cls + '" onclick="bookAtCell(\\'' + dk + '\\',\\'' + slotTime + '\\')">';
          // Render blocks starting exactly at this half-hour.
          var col = byDay[dk].appts;
          for (var b = 0; b < col.length; b++){
            var a = col[b];
            if (timeToMin(a.start_time) !== min) continue;
            var durMin = Math.max(timeToMin(a.end_time) - timeToMin(a.start_time), 15);
            var heightPx = (durMin / 30) * WG_PX_PER_HALF - 2;
            var bcls = 'wg-block';
            if (String(a.status).indexOf('CANCELLED') >= 0) bcls += ' cancelled';
            else if (a.status === 'ATTENDED') bcls += ' attended';
            else if (a.status === 'NO_SHOW') bcls += ' no_show';
            html += '<div class="' + bcls + '" style="top:1px;height:' + heightPx + 'px;" onclick="event.stopPropagation();openWeekAppt(\\'' + esc(a.id) + '\\',\\'' + dk + '\\')">';
            html +=   esc(a.start_time) + ' ' + esc(a.full_name || '').split(' ')[0];
            html +=   '<div class="bt">' + esc((a.full_name || '').split(' ').slice(1).join(' ')) + '</div>';
            html += '</div>';
          }
          html += '</div>';
        }
      }
    }
    html += '</div>';
    $('weekGrid').innerHTML = html;
  }

  window.bookAtCell = function(dk, startTime){
    openBookSheet();
    setBfDate(dk);
    $('sheetTitle').textContent = 'Book at ' + startTime;
    // Don't require an EXACT slot match — Linda's slot length might not
    // align with the 30-min grid (e.g. 60-min slots). Pick the first
    // available slot at or after the clicked cell-time.
    loadSheetSlots().then(function(){
      setTimeout(function(){
        var cellMin = parseInt(startTime.slice(0,2), 10) * 60 + parseInt(startTime.slice(3,5), 10);
        var btns = document.querySelectorAll('#bfSlots .slot-btn:not(.dis)');
        var chosen = null, chosenMin = null;
        for (var i = 0; i < btns.length; i++){
          var st = btns[i].getAttribute('data-slot') || '';
          if (!/^\\d{2}:\\d{2}$/.test(st)) continue;
          var m = parseInt(st.slice(0,2), 10) * 60 + parseInt(st.slice(3,5), 10);
          if (m >= cellMin && (chosenMin === null || m < chosenMin)) { chosen = btns[i]; chosenMin = m; }
        }
        if (chosen) chosen.click();
      }, 80);
    });
  };
  window.openWeekAppt = function(_apptId, dk){
    // Simplest: jump to that day in the Day tab so the full appointment
    // card with its Reschedule / Schedule-Next buttons is visible.
    setTab('day');
    setDate(dk);
  };

  // Initial — land on today if she has appointments today, otherwise on the
  // next upcoming day that has a booking, so she doesn't have to flip through
  // empty days.
  async function initialLand(){
    try {
      var r = await fetch('/api/linda-next-day');
      if (r.status === 403) { window.location.reload(); return; }
      var d = await r.json();
      if (d && d.timezone) state.tz = d.timezone;
      if (d.ok && d.dateKey) { setDate(d.dateKey); return; }
    } catch(e){}
    setDate(today());
  }
  initialLand();
  connectWS();
  resetIdle();
})();
</script>
</body></html>`;
}
