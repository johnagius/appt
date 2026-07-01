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
import { buildLindaSlots, getLindaBlocksForDate, getLindaExtrasForDate, isLindaDayOff, loadLindaConfig, ensureWindowHoursColumn } from '../services/linda';

// Validate + serialise a per-stint hours payload {days:[DOW], ranges:[{start,end}]}
// into a JSON string for the linda_windows.hours column ('' when none/invalid).
const DOW_SET = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
function serializeWindowHours(raw: any): string {
  if (!raw || typeof raw !== 'object') return '';
  const days = Array.isArray(raw.days) ? raw.days.filter((d: any) => DOW_SET.includes(d)) : [];
  const ranges = Array.isArray(raw.ranges)
    ? raw.ranges
        .filter((r: any) => r && /^\d{2}:\d{2}$/.test(r.start) && /^\d{2}:\d{2}$/.test(r.end) && r.start < r.end)
        .map((r: any) => ({ start: r.start, end: r.end }))
    : [];
  if (!ranges.length || !days.length) return '';
  return JSON.stringify({ days, ranges });
}
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
  // One suggestion per person (deduped by name, case-insensitive). SQLite returns
  // the bare columns from the row holding MAX(date_key), so each person surfaces
  // their MOST RECENT email/phone — meaning a corrected detail on a new booking
  // automatically becomes the suggestion next time.
  const rows = await env.DB.prepare(
    "SELECT full_name, email, phone, MAX(date_key) AS md FROM appointments " +
    "WHERE clinic = 'linda' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?) " +
    "GROUP BY lower(full_name) " +
    "ORDER BY md DESC LIMIT 8"
  ).bind(pat, pat, pat).all<{ full_name: string; email: string; phone: string; md: string }>();

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

  // Match ONLY on the identifiers we actually have. A blank email/phone must
  // never be used as a match key — binding `email = ''` would pull in every
  // other patient whose email is also blank (a cross-listing / data-protection
  // bug that looked like "double listed" history). Build the OR dynamically.
  const conds: string[] = [];
  const binds: string[] = [];
  if (email) { conds.push('email = ?'); binds.push(email); }
  if (phone) { conds.push('phone = ?'); binds.push(phone); }

  const rows = await env.DB.prepare(
    "SELECT id, date_key, start_time, end_time, full_name, email, phone, comments, status " +
    "FROM appointments WHERE clinic = 'linda' AND (" + conds.join(' OR ') + ") " +
    "ORDER BY date_key DESC, start_time DESC LIMIT 200"
  ).bind(...binds).all<any>();

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
  const off = await isLindaDayOff(env.DB, dateKey);
  const blocks = await getLindaBlocksForDate(env.DB, dateKey);
  const baseSlots = buildLindaSlots(dateKey, cfg, extras, off, blocks);

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
  return json({ ok: true, dateKey, slots, isWorkingDay, extras, dayOff: off, blocks });
}

// ─── /api/linda-off ────────────────────────────────────────
// Days off — overrides base hours and any extras for that date so no new
// bookings can happen. Existing bookings on that date are left alone; Linda
// will Reschedule them manually.

export async function apiLindaListOff(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const todayKey = todayKeyLocal(env.TIMEZONE);
  const rows = await env.DB.prepare(
    'SELECT id, date_key, reason FROM linda_off WHERE date_key >= ? ORDER BY date_key'
  ).bind(todayKey).all<{ id: number; date_key: string; reason: string }>();
  return json({ ok: true, off: rows.results });
}

// POST: mark a date off (single date or inclusive range).
// Body: { dateKey, dateKeyEnd?, reason? }
export async function apiLindaAddOff(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const dateKey = String(body.dateKey || '').trim();
  const dateKeyEnd = String(body.dateKeyEnd || '').trim() || dateKey;
  const reason = String(body.reason || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKeyEnd)) return json({ ok: false, reason: 'Invalid end date.' }, 400);

  const [y0, m0, d0] = dateKey.split('-').map(Number);
  const [y1, m1, d1] = dateKeyEnd.split('-').map(Number);
  const startD = new Date(y0, m0 - 1, d0);
  const endD = new Date(y1, m1 - 1, d1);
  if (endD < startD) return json({ ok: false, reason: 'End must be on or after start.' }, 400);

  const now = nowIso(env.TIMEZONE);
  // Count bookings that would be affected so the UI can show a warning.
  const rangeRows = await env.DB.prepare(
    "SELECT date_key, COUNT(*) AS n FROM appointments " +
    "WHERE clinic='linda' AND date_key >= ? AND date_key <= ? AND status NOT LIKE '%CANCELLED%' " +
    "GROUP BY date_key"
  ).bind(dateKey, dateKeyEnd).all<{ date_key: string; n: number }>();
  const affected = rangeRows.results.reduce((sum, r) => sum + (r.n || 0), 0);

  let added = 0;
  for (let cur = new Date(startD); cur <= endD; cur.setDate(cur.getDate() + 1)) {
    const dk = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
    const res = await env.DB.prepare(
      'INSERT OR IGNORE INTO linda_off (date_key, reason, created_at) VALUES (?, ?, ?)'
    ).bind(dk, reason, now).run();
    if ((res.meta?.changes ?? 0) > 0) added++;
  }

  await bumpVersion(env.DB);

  // Broadcast so the public physio page's slot grid refreshes if it was open.
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
  } catch {}

  return json({ ok: true, added, affectedBookings: affected });
}

// DELETE /api/linda-off?id=123
export async function apiLindaDeleteOff(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  await env.DB.prepare('DELETE FROM linda_off WHERE id = ?').bind(id).run();
  await bumpVersion(env.DB);
  return json({ ok: true });
}

// ─── /api/linda-blocks ─────────────────────────────────────
// Partial-day blocks: ranges within a day where new bookings are blocked.
// Distinct from linda_off (which blocks the entire date).

export async function apiLindaListBlocks(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const todayKey = todayKeyLocal(env.TIMEZONE);
  const rows = await env.DB.prepare(
    'SELECT id, date_key, start_time, end_time, reason FROM linda_block WHERE date_key >= ? ORDER BY date_key, start_time'
  ).bind(todayKey).all<{ id: number; date_key: string; start_time: string; end_time: string; reason: string }>();
  return json({ ok: true, blocks: rows.results });
}

// POST /api/linda-blocks { dateKey, startTime, endTime, reason? }
export async function apiLindaAddBlock(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const dateKey = String(body.dateKey || '').trim();
  const startTime = String(body.startTime || '').trim();
  const endTime = String(body.endTime || '').trim();
  const reason = String(body.reason || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid date.' }, 400);
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return json({ ok: false, reason: 'Invalid time.' }, 400);
  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return json({ ok: false, reason: 'End must be after start.' }, 400);

  // Count bookings that fall inside the blocked range so the UI can warn.
  const apptRows = await env.DB.prepare(
    "SELECT start_time FROM appointments WHERE clinic = 'linda' AND date_key = ? AND status NOT LIKE '%CANCELLED%'"
  ).bind(dateKey).all<{ start_time: string }>();
  const blockStart = parseTimeToMinutes(startTime);
  const blockEnd = parseTimeToMinutes(endTime);
  const affected = apptRows.results.filter(r => {
    const m = parseTimeToMinutes(r.start_time);
    return m >= blockStart && m < blockEnd;
  }).length;

  const now = nowIso(env.TIMEZONE);
  const res = await env.DB.prepare(
    'INSERT INTO linda_block (date_key, start_time, end_time, reason, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(dateKey, startTime, endTime, reason, now).run();

  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
  } catch {}

  return json({ ok: true, id: res.meta?.last_row_id, affectedBookings: affected });
}

// DELETE /api/linda-blocks?id=123
export async function apiLindaDeleteBlock(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  await env.DB.prepare('DELETE FROM linda_block WHERE id = ?').bind(id).run();
  await bumpVersion(env.DB);
  return json({ ok: true });
}

// ─── /api/linda-windows ────────────────────────────────────
// CRUD for Linda's booking periods. She can have multiple disjoint stints
// (she lives abroad and visits for weeks at a time).

export async function apiLindaListWindows(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  // Just return whatever loadLindaConfig surfaces — keeps legacy-migration in one place.
  const cfg = await loadLindaConfig(env.DB);
  return json({ ok: true, windows: cfg.windows });
}

// POST /api/linda-windows { startDate, endDate, note? }
export async function apiLindaAddWindow(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const startDate = String(body.startDate || '').trim();
  const endDate = String(body.endDate || '').trim();
  const note = String(body.note || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
  if (endDate < startDate) return json({ ok: false, reason: 'End must be on or after start.' }, 400);

  const hours = serializeWindowHours(body.hours);
  await ensureWindowHoursColumn(env.DB);
  const res = await env.DB.prepare(
    "INSERT INTO linda_windows (start_date, end_date, note, hours, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
  ).bind(startDate, endDate, note, hours).run();
  await bumpVersion(env.DB);
  return json({ ok: true, id: res.meta?.last_row_id });
}

// PUT /api/linda-windows { id, startDate, endDate, note? }
export async function apiLindaUpdateWindow(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const id = parseInt(String(body.id || '0'), 10);
  const startDate = String(body.startDate || '').trim();
  const endDate = String(body.endDate || '').trim();
  const note = String(body.note || '').trim();
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
  if (endDate < startDate) return json({ ok: false, reason: 'End must be on or after start.' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM linda_windows WHERE id = ?').bind(id).first();
  if (!existing) return json({ ok: false, reason: 'Window not found.' }, 404);

  const hours = serializeWindowHours(body.hours);
  await ensureWindowHoursColumn(env.DB);
  await env.DB.prepare(
    'UPDATE linda_windows SET start_date=?, end_date=?, note=?, hours=? WHERE id=?'
  ).bind(startDate, endDate, note, hours, id).run();
  await bumpVersion(env.DB);
  return json({ ok: true });
}

// DELETE /api/linda-windows?id=N
export async function apiLindaDeleteWindow(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  await env.DB.prepare('DELETE FROM linda_windows WHERE id = ?').bind(id).run();
  await bumpVersion(env.DB);
  return json({ ok: true });
}

// ─── /api/linda-base-schedule ──────────────────────────────
// Returns Linda's weekly template hours + window dates + slot duration
// so the Availability tab can show her planned schedule as well as the
// ad-hoc extras she's opened.

export async function apiLindaBaseSchedule(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const cfg = await loadLindaConfig(env.DB);
  return json({
    ok: true,
    enabled: cfg.enabled,
    windowStart: cfg.windowStart,
    windowEnd: cfg.windowEnd,
    slotMin: cfg.slotMin,
    hours: cfg.hours,
  });
}

// POST /api/linda-base-schedule — save slot duration and/or weekly hours.
// Booking periods are now edited via /api/linda-windows (the multi-row
// table). windowStart / windowEnd are still accepted here for legacy
// callers but are optional; when sent, they update the legacy config
// pair — useful as a compatibility shim only.
export async function apiLindaSaveBaseSchedule(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const windowStart = String(body.windowStart || '').trim();
  const windowEnd = String(body.windowEnd || '').trim();
  const slotMinRaw = body.slotMin;
  const hoursRaw = body.hours;

  // Only validate window fields if BOTH were sent (legacy compat path).
  if (windowStart || windowEnd) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(windowStart)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(windowEnd)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
    if (windowEnd < windowStart) return json({ ok: false, reason: 'End date must be on or after start date.' }, 400);
    await env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .bind('LINDA_WINDOW_START', windowStart).run();
    await env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .bind('LINDA_WINDOW_END', windowEnd).run();
  }

  if (slotMinRaw !== undefined && slotMinRaw !== null && slotMinRaw !== '') {
    const slotMin = parseInt(String(slotMinRaw), 10);
    if (!Number.isFinite(slotMin) || slotMin < 5 || slotMin > 240) {
      return json({ ok: false, reason: 'Slot duration must be between 5 and 240 minutes.' }, 400);
    }
    await env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .bind('LINDA_SLOT_MIN', String(slotMin)).run();
  }

  if (hoursRaw && typeof hoursRaw === 'object') {
    const validDays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
    const clean: Record<string, { start: string; end: string }[]> = {};
    for (const d of validDays) {
      const arr = Array.isArray(hoursRaw[d]) ? hoursRaw[d] : [];
      clean[d] = arr
        .filter((w: any) => w && typeof w.start === 'string' && typeof w.end === 'string'
          && /^\d{2}:\d{2}$/.test(w.start) && /^\d{2}:\d{2}$/.test(w.end))
        .map((w: any) => ({ start: w.start, end: w.end }));
      // Reject zero- or negative-width ranges.
      for (const w of clean[d]) {
        if (parseTimeToMinutes(w.end) <= parseTimeToMinutes(w.start)) {
          return json({ ok: false, reason: 'Each time range must end after it starts.' }, 400);
        }
      }
    }
    await env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .bind('LINDA_HOURS', JSON.stringify(clean)).run();
  }

  await bumpVersion(env.DB);
  return json({ ok: true });
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
  const off = await isLindaDayOff(env.DB, dateKey);
  if (off) return json({ ok: false, reason: "That date is marked as a day off — remove the day-off first or pick another date." }, 400);
  const blocks = await getLindaBlocksForDate(env.DB, dateKey);
  const slots = buildLindaSlots(dateKey, cfg, extras, false, blocks);
  const slotFound = slots.find(s => s.start === startTime);
  if (!slotFound) return json({ ok: false, reason: "No hours set for this time \u2014 open availability or remove a block first." }, 400);

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

  try {
    await env.DB.prepare(
      'UPDATE appointments SET date_key = ?, start_time = ?, end_time = ?, updated_at = ?, calendar_event_id = ? WHERE id = ?'
    ).bind(dateKey, startTime, slotFound.end, now, '', appointmentId).run();
  } catch (e: any) {
    if (String(e?.message || '').toLowerCase().includes('unique')) {
      return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 409);
    }
    throw e;
  }
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
  const off = await isLindaDayOff(env.DB, dateKey);
  if (off) return json({ ok: false, reason: "That date is marked as a day off — remove the day-off first or pick another date." }, 400);
  const blocks = await getLindaBlocksForDate(env.DB, dateKey);
  // Custom time: staff can book an off-grid time (e.g. 18:15) that isn't a normal
  // slot. Skips the in-hours check; day-off + clash checks still apply.
  const customTime = body.customTime === true || body.force === true;
  let slotFound: { start: string; end: string } | undefined;
  if (customTime) {
    if (!/^\d{2}:\d{2}$/.test(startTime)) return json({ ok: false, reason: 'Enter a time as HH:MM (e.g. 18:15).' }, 400);
    const em = parseTimeToMinutes(startTime) + (cfg.slotMin || 30);
    slotFound = { start: startTime, end: String(Math.floor(em / 60)).padStart(2, '0') + ':' + String(em % 60).padStart(2, '0') };
  } else {
    const slots = buildLindaSlots(dateKey, cfg, extras, false, blocks);
    slotFound = slots.find(s => s.start === startTime);
  }
  if (!slotFound) return json({ ok: false, reason: 'No hours set for this time - open availability, tick custom time, or remove a block.' }, 400);

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

  try {
    await insertAppointment(env.DB, appt);
  } catch (e: any) {
    // The (clinic, date_key, start_time) WHERE status='BOOKED' partial unique
    // index catches simultaneous-book races after our isSlotTaken check passed.
    if (String(e?.message || '').toLowerCase().includes('unique')) {
      return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 409);
    }
    throw e;
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

// ─── POST /api/linda-bulk-booking ──────────────────────────
// Staff bulk-entry: create many bookings at once from a pasted table.
// Body: { rows: [{ dateKey, startTime, fullName, phone?, email?, comments? }] }
// Dates/times are parsed leniently (accepts DD/MM/YYYY and 9:00 / 9am etc.) so a
// spreadsheet paste just works. Force-creates regardless of set hours (staff
// know what they're entering) but still respects the one-booking-per-slot index.
// No confirmation emails are sent for bulk imports.

function bulkNormDate(s: string): string | null {
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let d = parseInt(m[1], 10), mo = parseInt(m[2], 10), y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    }
  }
  return null;
}
function bulkNormTime(s: string): string | null {
  s = String(s || '').trim().toLowerCase().replace(/\s+/g, '');
  let ap: string | null = null;
  const a = s.match(/(am|pm)$/);
  if (a) { ap = a[1]; s = s.replace(/(am|pm)$/, ''); }
  let h: number, mi: number;
  const t = s.match(/^(\d{1,2}):(\d{2})$/);
  if (t) { h = parseInt(t[1], 10); mi = parseInt(t[2], 10); }
  else { const t2 = s.match(/^(\d{1,2})$/); if (!t2) return null; h = parseInt(t2[1], 10); mi = 0; }
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || mi > 59) return null;
  return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
}

export async function apiLindaBulkBooking(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return json({ ok: false, reason: 'No rows provided.' }, 400);
  if (rows.length > 200) return json({ ok: false, reason: 'Too many rows at once (max 200).' }, 400);

  const cfg = await loadLindaConfig(env.DB);
  const slotMin = cfg.slotMin || 30;
  const now = nowIso(env.TIMEZONE);
  const results: any[] = [];
  const datesTouched = new Set<string>();
  let created = 0;

  for (const r of rows) {
    const dateKey = bulkNormDate(r.dateKey);
    const startTime = bulkNormTime(r.startTime);
    const fullName = String(r.fullName || '').trim();
    const email = String(r.email || '').trim().toLowerCase();
    const phone = String(r.phone || '').trim();
    const comments = String(r.comments || '').trim();

    if (!dateKey) { results.push({ ok: false, reason: 'Bad date' }); continue; }
    if (!startTime) { results.push({ ok: false, reason: 'Bad time' }); continue; }
    if (!fullName || (!email && !phone)) { results.push({ ok: false, reason: 'Need name + phone or email' }); continue; }

    const endMin = parseTimeToMinutes(startTime) + slotMin;
    const endTime = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');

    if (await isSlotTaken(env.DB, dateKey, startTime, 'linda')) { results.push({ ok: false, reason: 'Slot already taken', dateKey, startTime }); continue; }

    const appt: Appointment = {
      id: 'A-' + generateId(), date_key: dateKey, start_time: startTime, end_time: endTime,
      service_id: 'physio', service_name: 'Physiotherapy Consultation', full_name: fullName,
      email: email || '', phone: phone || '', comments, status: 'BOOKED',
      location: env.LINDA_LOCATION || "Potter's Clinic", clinic: 'linda',
      created_at: now, updated_at: now, token: generateId(), calendar_event_id: '',
      cancelled_at: '', cancel_reason: '', reminder_sent: '', confirmed: '',
      booking_source: 'linda-bulk', hotel: '',
    };
    try {
      if (email) await getOrCreateClient(env.DB, fullName, email, phone, now);
      await insertAppointment(env.DB, appt);
      created++; datesTouched.add(dateKey);
      results.push({ ok: true, dateKey, startTime, name: fullName });
    } catch (e: any) {
      results.push({ ok: false, reason: String(e?.message || '').toLowerCase().includes('unique') ? 'Slot already taken' : 'Could not save', dateKey, startTime });
    }
  }

  await bumpVersion(env.DB);
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    for (const dk of datesTouched) {
      await stub.fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify({ type: 'slots_updated', dateKey: dk, clinic: 'linda' }) });
    }
  } catch {}

  return json({ ok: true, created, total: rows.length, results });
}

// ─── POST /api/linda-edit-appointment ──────────────────────
// Correct a booking's contact details (name / phone / email / comments).
// Body: { appointmentId, fullName, phone?, email?, comments?, applyToFuture? }
// With applyToFuture, the same correction is applied to every upcoming
// non-cancelled Linda booking for that person (matched by their OLD email+phone),
// and the client record is refreshed — so the fix sticks going forward.

export async function apiLindaEditAppointment(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const id = String(body.appointmentId || '').trim();
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const comments = String(body.comments || '').trim();
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  if (!fullName || (!email && !phone)) return json({ ok: false, reason: 'Name and at least one of phone or email are required.' }, 400);

  const appt = await getAppointmentById(env.DB, id);
  if (!appt || appt.clinic !== 'linda') return json({ ok: false, reason: 'Appointment not found.' }, 404);

  const oldEmail = appt.email || '', oldPhone = appt.phone || '';
  const now = nowIso(env.TIMEZONE);
  await env.DB.prepare('UPDATE appointments SET full_name = ?, email = ?, phone = ?, comments = ?, updated_at = ? WHERE id = ?')
    .bind(fullName, email, phone, comments, now, id).run();

  let updatedFuture = 0;
  if (body.applyToFuture === true) {
    const todayKey = todayKeyLocal(env.TIMEZONE);
    const res = await env.DB.prepare(
      "UPDATE appointments SET full_name = ?, email = ?, phone = ?, updated_at = ? " +
      "WHERE clinic = 'linda' AND date_key >= ? AND status NOT LIKE '%CANCELLED%' AND email = ? AND phone = ? AND id != ?"
    ).bind(fullName, email, phone, now, todayKey, oldEmail, oldPhone, id).run();
    updatedFuture = res.meta?.changes || 0;
  }

  try { if (email) await getOrCreateClient(env.DB, fullName, email, phone, now); } catch {}
  await bumpVersion(env.DB);
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key, clinic: 'linda' }) });
  } catch {}

  return json({ ok: true, updatedFuture });
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

// ─── POST /api/linda-reschedule-day ────────────────────────
// Move every non-cancelled booking from one date to another, keeping
// each patient's start time. Returns moved count + any conflicts that
// Linda needs to handle manually.
// Body: { fromDateKey, toDateKey }

export async function apiLindaRescheduleDay(req: Request, env: Env): Promise<Response> {
  if (!await isLindaAuthed(req, env)) return json({ ok: false, reason: 'Access denied.' }, 403);
  const body: any = await req.json();
  const fromDateKey = String(body.fromDateKey || '').trim();
  const toDateKey = String(body.toDateKey || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDateKey)) return json({ ok: false, reason: 'Invalid source date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(toDateKey)) return json({ ok: false, reason: 'Invalid target date.' }, 400);
  if (fromDateKey === toDateKey) return json({ ok: false, reason: 'Target must be a different date.' }, 400);

  const cfg = await loadLindaConfig(env.DB);
  if (await isLindaDayOff(env.DB, toDateKey)) {
    return json({ ok: false, reason: 'Target date is marked as a day off.' }, 400);
  }

  const extras = await getLindaExtrasForDate(env.DB, toDateKey);
  const targetBlocks = await getLindaBlocksForDate(env.DB, toDateKey);
  const targetSlots = buildLindaSlots(toDateKey, cfg, extras, false, targetBlocks);
  if (!targetSlots.length) {
    return json({ ok: false, reason: 'Target date has no working hours. Open availability for it first.' }, 400);
  }
  const targetByStart: Record<string, { start: string; end: string }> = {};
  for (const s of targetSlots) targetByStart[s.start] = s;

  const takenOnTarget = await getTakenSlots(env.DB, toDateKey, 'linda');

  const rows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE clinic='linda' AND date_key=? AND status NOT LIKE '%CANCELLED%' ORDER BY start_time"
  ).bind(fromDateKey).all<Appointment>();

  const now = nowIso(env.TIMEZONE);
  const moved: Appointment[] = [];
  const origsByNewId: Record<string, Appointment> = {};
  const conflicts: { id: string; name: string; startTime: string; reason: string }[] = [];

  for (const appt of rows.results) {
    const target = targetByStart[appt.start_time];
    if (!target) {
      conflicts.push({ id: appt.id, name: appt.full_name, startTime: appt.start_time, reason: 'No matching slot on target date.' });
      continue;
    }
    if (takenOnTarget.has(appt.start_time)) {
      conflicts.push({ id: appt.id, name: appt.full_name, startTime: appt.start_time, reason: 'Target slot already taken.' });
      continue;
    }
    try {
      await env.DB.prepare(
        'UPDATE appointments SET date_key=?, start_time=?, end_time=?, updated_at=?, calendar_event_id=? WHERE id=?'
      ).bind(toDateKey, target.start, target.end, now, '', appt.id).run();
      takenOnTarget.add(target.start);
      const updated: Appointment = { ...appt, date_key: toDateKey, start_time: target.start, end_time: target.end, calendar_event_id: '' };
      moved.push(updated);
      origsByNewId[appt.id] = appt;
    } catch (e: any) {
      if (String(e?.message || '').toLowerCase().includes('unique')) {
        conflicts.push({ id: appt.id, name: appt.full_name, startTime: appt.start_time, reason: 'Target slot just taken.' });
      } else {
        conflicts.push({ id: appt.id, name: appt.full_name, startTime: appt.start_time, reason: 'Database error.' });
      }
    }
  }

  await bumpVersion(env.DB);

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify({ type: 'slots_updated', dateKey: fromDateKey, clinic: 'linda' }) });
    await stub.fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify({ type: 'slots_updated', dateKey: toDateKey, clinic: 'linda' }) });
  } catch {}

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      for (const updated of moved) {
        const orig = origsByNewId[updated.id];
        if (orig?.calendar_event_id) {
          try { await deleteCalendarEvent(env, orig.calendar_event_id, 'linda'); } catch {}
        }
        try {
          const newEventId = await createCalendarEvent(env, updated);
          if (newEventId) {
            await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(newEventId, updated.id).run();
          }
        } catch (e) { console.error('Linda reschedule-day cal error:', e); }
        try {
          // sendAppointmentPushedEmail takes the ORIGINAL appointment + new date/time
          // so "Previous: X → New: Y" renders correctly in the email.
          await sendAppointmentPushedEmail(env, orig, updated.date_key, updated.start_time, updated.end_time);
        } catch (e) { console.error('Linda reschedule-day email error:', e); }
      }
    })());
  }

  return json({ ok: true, moved: moved.length, conflicts });
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

// ─── GET /linda/logout ─────────────────────────────────────
// Clears BOTH linda_sig and admin_sig cookies — the /linda auth check
// accepts either, so dropping just one would leave the session alive
// whenever the user happens to also have admin_sig (from visiting /admin
// on the same device).

export function handleLindaLogout(): Response {
  const headers = new Headers();
  headers.set('Location', '/linda');
  const attrs = 'Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
  headers.append('Set-Cookie', 'linda_sig=; ' + attrs);
  headers.append('Set-Cookie', 'admin_sig=; ' + attrs);
  return new Response(null, { status: 302, headers });
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
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root{
    --accent:#10b981;--accent-2:#059669;--accent-ink:#065f46;
    --text:#0f172a;--muted:#64748b;--line:#e6e8ee;--bg:#f4f6fa;--bad:#ef4444;
    --card:#ffffff;
    --font:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    --sh-sm:0 1px 2px rgba(16,24,40,.06);
    --sh-md:0 4px 12px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.05);
    --sh-lg:0 12px 30px rgba(16,24,40,.10),0 4px 10px rgba(16,24,40,.05);
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
  html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.45;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;letter-spacing:-.01em;}
  .topbar{position:sticky;top:0;background:rgba(255,255,255,.85);backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;z-index:5;}
  .topbar h1{margin:0;font-size:18px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:9px;}
  .topbar h1::before{content:"";width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 2px 6px rgba(16,185,129,.4);flex:0 0 auto;}
  .liveDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#cbd5e1;vertical-align:middle;transition:background-color .3s ease;}
  .liveDot.on{background:#10b981;animation:pulseDot 1.8s ease-out infinite;}
  .logout{background:none;border:1px solid var(--line);color:var(--muted);font-size:12.5px;cursor:pointer;padding:7px 13px;font-weight:600;border-radius:9px;transition:background .18s ease,color .18s ease,border-color .18s ease;}
  .logout:hover{background:#fef2f2;color:#dc2626;border-color:#fecaca;}

  .dateBar{padding:6px 12px 8px;display:flex;align-items:center;gap:8px;}
  .dateBar button.nav{flex:0 0 auto;min-width:46px;height:46px;border:1px solid var(--line);background:#fff;border-radius:12px;font-size:18px;font-weight:800;cursor:pointer;color:var(--text);box-shadow:var(--sh-sm);transition:background .16s ease,border-color .16s ease;}
  .dateBar button.nav:hover{background:#f8fafc;border-color:#d7dbe4;}
  .dateBar button.nav:active{background:#f1f5f9;}
  .dateBar input[type=date]{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:16px;font-family:inherit;background:#fff;min-height:44px;}
  .dateBar .today-btn{flex:0 0 auto;height:46px;padding:0 15px;border:1px solid #6ee7b7;background:#ecfdf5;color:var(--accent-ink);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:var(--sh-sm);transition:background .16s ease;}
  .dateBar .today-btn:hover{background:#d1fae5;}

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

  .list{padding:4px 12px 110px;}
  /* ── Appointment card — clean clinical diary style ── */
  .appt{position:relative;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px 15px 20px;margin-bottom:12px;box-shadow:var(--sh-md);animation:fadeUp .32s var(--ease) both;transition:transform .2s var(--ease),box-shadow .2s ease,border-color .2s ease;}
  .appt::before{content:"";position:absolute;left:7px;top:16px;bottom:16px;width:4px;border-radius:999px;background:linear-gradient(180deg,#34d399,#059669);}
  .appt.is-attended::before{background:linear-gradient(180deg,#818cf8,#4f46e5);}
  .appt.is-noshow::before{background:linear-gradient(180deg,#fbbf24,#d97706);}
  .appt.is-cancelled::before{background:linear-gradient(180deg,#f87171,#dc2626);}
  .appt.is-cancelled{opacity:.66;}
  @media (hover:hover){.appt:hover{transform:translateY(-2px);box-shadow:var(--sh-lg);border-color:#d7dbe4;}}
  .list .appt:nth-child(1){animation-delay:.02s}
  .list .appt:nth-child(2){animation-delay:.05s}
  .list .appt:nth-child(3){animation-delay:.08s}
  .list .appt:nth-child(4){animation-delay:.11s}
  .list .appt:nth-child(5){animation-delay:.14s}
  .list .appt:nth-child(n+6){animation-delay:.17s}
  /* Header: monogram avatar + time eyebrow + name, with status & overflow menu */
  .ac-top{display:flex;align-items:flex-start;gap:13px;}
  .ac-avatar{flex:0 0 auto;width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;letter-spacing:.5px;box-shadow:0 4px 10px rgba(16,24,40,.18);user-select:none;}
  .ac-id{flex:1 1 auto;min-width:0;}
  .ac-eyebrow{font-size:12px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em;margin-bottom:1px;}
  .appt-status{font-size:10px;font-weight:800;text-transform:uppercase;padding:4px 9px;border-radius:999px;letter-spacing:.5px;white-space:nowrap;}
  .status-BOOKED{background:#ecfdf5;color:#065f46;}
  .status-ATTENDED{background:#eef2ff;color:#4338ca;}
  .status-NO_SHOW{background:#fff7ed;color:#9a3412;}
  .status-CANCELLED{background:#fef2f2;color:#991b1b;text-decoration:line-through;}
  .appt-name{font-size:18px;font-weight:800;color:var(--text);letter-spacing:-.3px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;max-width:100%;}
  .appt-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .appt-name::after{content:"✎";font-size:12px;color:#cbd5e1;flex:0 0 auto;}
  .appt-name:active{opacity:.6;}
  .ac-top-right{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
  .ac-kebab{background:#fff;border:1px solid var(--line);color:var(--muted);border-radius:9px;width:34px;height:28px;font-size:17px;line-height:1;cursor:pointer;transition:background .16s ease,border-color .16s ease;}
  .ac-kebab:hover{background:#f8fafc;border-color:#d7dbe4;color:var(--text);}
  .appt-svc{font-size:12px;color:var(--muted);margin-top:3px;}
  /* Overflow menu */
  .ac-menu{position:absolute;top:58px;right:16px;min-width:210px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--sh-lg);padding:6px;display:none;z-index:40;transform-origin:top right;animation:scalePop .13s var(--ease) both;}
  .appt.menu-open{z-index:30;}
  .appt.menu-open .ac-menu{display:block;}
  .ac-menu button{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:none;border:none;padding:10px 11px;border-radius:9px;font-size:13.5px;font-weight:600;color:#334155;cursor:pointer;}
  .ac-menu button:hover{background:#f5f7fa;}
  .ac-menu button.danger{color:#b91c1c;}
  .ac-menu button.danger:hover{background:#fef2f2;}
  .ac-menu .mi-ico{font-size:14px;width:18px;text-align:center;flex:0 0 auto;}
  .ac-menu-sep{height:1px;background:var(--line);margin:5px 6px;}
  .contact-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
  .contact-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13.5px;border:1px solid var(--line);background:#fff;color:var(--text);line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .contact-btn .icon{flex:0 0 auto;font-size:13px;}
  .contact-btn.call{border-color:#a7f3d0;background:#ecfdf5;color:#065f46;}
  .contact-btn.call:active{background:#d1fae5;}
  .contact-btn.email{border-color:#bfdbfe;background:#eff6ff;color:#1e40af;}
  .contact-btn.email:active{background:#dbeafe;}
  .comments{margin-top:12px;padding:10px 12px;background:#f9fafb;border-radius:10px;font-size:13px;color:var(--text);white-space:pre-wrap;border-left:3px solid var(--accent);}
  .comments-label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;}

  /* ── Card action toolbar ── */
  .appt-actions{margin-top:13px;padding-top:12px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px;}
  .btn-row{display:flex;gap:8px;}
  .act{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1px solid var(--line);background:#fff;color:#334155;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;min-height:42px;transition:background .16s ease,border-color .16s ease,transform .16s var(--ease),box-shadow .16s ease;}
  .act:active{background:#f1f5f9;}
  @media (hover:hover){.act:hover{background:#f8fafc;border-color:#d7dbe4;}}
  .act .act-ico{font-size:14px;}
  .act.primary{border:none;background:linear-gradient(135deg,#34d399,#059669);color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(16,185,129,.35);}
  .act.primary:active{background:linear-gradient(135deg,#10b981,#047857);}
  @media (hover:hover){.act.primary:hover{background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 4px 14px rgba(16,185,129,.45);transform:translateY(-1px);}}
  .seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;}
  .seg .act{border:none;border-right:1px solid var(--line);border-radius:0;}
  .seg .act:last-child{border-right:none;}
  .act.attended{color:#4338ca;}
  .act.attended:active{background:#eef2ff;}
  .act.noshow{color:#9a3412;}
  .act.noshow:active{background:#fff7ed;}
  .foot-row{display:flex;justify-content:flex-end;}
  .act.link-danger{flex:0 0 auto;border:none;background:none;color:#94a3b8;min-height:0;padding:6px 4px;font-size:12.5px;font-weight:600;transition:color .16s ease;}
  .act.link-danger:hover{color:#dc2626;}
  .act.link-danger:active{background:none;color:#7f1d1d;}

  /* Day-wide actions row — quiet neutral chips so they don't dominate */
  .day-actions{display:flex;gap:8px;padding:0 12px 8px;flex-wrap:wrap;}
  .day-action-btn{flex:1 1 0;min-width:140px;padding:9px 12px;border-radius:11px;border:1px solid var(--line);background:#fff;color:var(--muted);font-weight:600;font-size:12.5px;cursor:pointer;box-shadow:var(--sh-sm);transition:background .18s ease,color .18s ease,border-color .18s ease,transform .18s var(--ease);}
  .day-action-btn:active{transform:scale(.98);}
  .day-action-btn.warn:hover{border-color:#fcd34d;color:#92400e;background:#fffbeb;}
  .day-action-btn.danger:hover{border-color:#fca5a5;color:#991b1b;background:#fef2f2;}
  @media (prefers-color-scheme: dark){
    .day-action-btn{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .day-action-btn.warn{background:#422006;color:#fde68a;border-color:#92400e;}
    .day-action-btn.danger{background:#450a0a;color:#fecaca;border-color:#991b1b;}
  }

  .empty{padding:30px 20px;text-align:center;color:var(--muted);font-size:15px;background:#fff;border-radius:14px;margin:0 12px;border:1px dashed var(--line);}
  .emptyEmoji{font-size:40px;margin-bottom:8px;}
  .err{padding:14px;margin:10px 12px;background:#fef2f2;color:#991b1b;border-radius:10px;font-size:14px;}

  /* Search */
  .searchBar{padding:8px 12px 4px;display:flex;gap:8px;align-items:center;}
  .searchBar input{flex:1 1 auto;padding:12px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px;min-height:46px;background:#fff;color:var(--text);box-shadow:var(--sh-sm);transition:border-color .16s ease,box-shadow .16s ease;}
  .searchBar input:focus{outline:none;border-color:#6ee7b7;box-shadow:0 0 0 3px rgba(16,185,129,.15);}
  .searchBar .clear{background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;padding:4px 8px;min-width:32px;}
  .searchResults{padding:0 12px 110px;}
  .srow{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;animation:fadeUp .25s var(--ease) both;}
  .srow:active{background:#f3f4f6;}
  .srow-main{font-size:15px;font-weight:800;}
  .srow-dim{font-size:13px;color:var(--muted);margin-top:2px;}

  /* Tabs */
  .tabBar{display:flex;gap:4px;padding:6px;margin:10px 14px 4px;background:#eef1f6;border:1px solid var(--line);border-radius:14px;position:sticky;top:52px;z-index:4;box-shadow:inset 0 1px 2px rgba(16,24,40,.03);}
  .tabBtn{flex:1 1 0;padding:11px 8px;background:transparent;border:none;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;color:var(--muted);min-height:42px;transition:background-color .22s ease,color .22s ease,box-shadow .22s ease,transform .22s var(--ease);}
  .tabBtn:hover:not(.active){color:var(--text);}
  .tabBtn.active{background:#fff;color:var(--accent-ink);box-shadow:var(--sh-sm);}
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

  /* Availability timeline (inspired by the admin-page bar) */
  .tl-date-nav{display:flex;gap:6px;align-items:center;margin-bottom:4px;}
  .tl-nav-btn{flex:0 0 auto;width:40px;min-height:44px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:20px;font-weight:800;cursor:pointer;color:var(--text);}
  .tl-nav-btn:active{background:#f3f4f6;}
  .tl-today-btn{flex:0 0 auto;height:44px;padding:0 12px;border:1px solid var(--accent);background:#ecfdf5;color:#065f46;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;}
  .tl-today-btn:active{background:#d1fae5;}
  .tl-bar{position:relative;height:64px;background:#f3f4f6;border-radius:12px;border:1px solid var(--line);overflow:hidden;cursor:crosshair;touch-action:none;user-select:none;-webkit-user-select:none;}
  .tl-seg{position:absolute;top:0;bottom:0;pointer-events:none;}
  .tl-seg.base{background:var(--accent);opacity:0.55;}
  .tl-seg.extra{background:var(--accent);opacity:0.85;background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.28) 5px,rgba(255,255,255,0.28) 10px);}
  .tl-seg.booked{background:#3730a3;opacity:0.9;}
  .tl-seg.off{background:var(--bad);opacity:0.65;background-image:repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(255,255,255,0.35) 4px,rgba(255,255,255,0.35) 8px);}
  .tl-seg.block{background:var(--bad);opacity:0.78;background-image:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.32) 4px,rgba(255,255,255,0.32) 8px);}
  .tl-seg.sel{background:#0ea5e9;opacity:0.8;border:2px solid #0369a1;border-radius:4px;z-index:5;}
  /* Existing extras/blocks are tappable so they can be selected & removed right on the bar. */
  .tl-seg.extra,.tl-seg.block{pointer-events:auto;cursor:pointer;}
  .tl-seg.picked{outline:3px solid #0369a1;outline-offset:-1px;z-index:6;box-shadow:0 0 0 3px rgba(3,105,161,.25);}
  /* Live time tooltip shown while dragging a selection. */
  .tl-tip{position:absolute;top:5px;transform:translateX(-50%);background:#0f172a;color:#fff;font-size:12px;font-weight:800;padding:3px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:9;box-shadow:0 2px 8px rgba(0,0,0,.35);}
  .tl-picked-bar{display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:10px;animation:fadeUp .2s var(--ease) both;}
  @media (prefers-color-scheme: dark){ .tl-picked-bar{background:#0c2a3a;border-color:#0369a1;} }

  /* Stint list rows */
  .stint-row{background:#f9fafb;border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px;animation:fadeUp .25s var(--ease) both;}
  .stint-when{font-size:14px;font-weight:800;}
  .stint-hours{font-size:13px;color:#065f46;font-weight:700;margin-top:3px;}
  .stint-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:8px;}
  @media (prefers-color-scheme: dark){ .stint-row{background:#0f172a;} }

  /* Stint editor sheet */
  .se-daterow{display:flex;align-items:center;gap:8px;}
  .se-daterow .sheet-input{flex:1 1 0;}
  .se-arrow{color:var(--muted);font-weight:800;flex:0 0 auto;}
  .se-pills{display:flex;gap:6px;flex-wrap:wrap;}
  .se-pill{width:42px;height:42px;border-radius:50%;border:1.5px solid var(--line);background:#fff;font-size:14px;font-weight:800;color:var(--muted);cursor:pointer;transition:transform .15s var(--ease),background .15s,border-color .15s,color .15s;}
  .se-pill:active{transform:scale(.92);}
  .se-pill.on{background:#ecfdf5;border-color:var(--accent);color:#065f46;}
  .se-seg{position:absolute;top:0;bottom:0;background:var(--accent);opacity:.62;pointer-events:none;}
  .se-seg.preview{opacity:.85;background:#0ea5e9;}
  .se-grip{position:absolute;top:0;bottom:0;width:5px;background:#065f46;opacity:.65;border-radius:2px;pointer-events:none;}
  .se-summary{font-size:13px;font-weight:700;color:var(--text);margin-top:9px;line-height:1.5;}
  @media (prefers-color-scheme: dark){ .se-pill{background:#0f172a;color:#94a3b8;} .se-pill.on{background:#022c22;color:#6ee7b7;} }
  .tl-action-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
  .tl-action-btn{flex:1 1 0;min-width:130px;padding:13px 12px;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .18s var(--ease),opacity .18s ease;}
  .tl-action-btn:active{transform:scale(.97);}
  .tl-action-btn:disabled{opacity:.45;cursor:not-allowed;}
  .tl-action-btn .tl-icon{font-size:16px;font-weight:900;}
  .tl-action-btn.add{background:var(--accent);color:#fff;}
  .tl-action-btn.add:active{background:#059669;}
  .tl-action-btn.block{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;}
  .tl-action-btn.block:active{background:#fecaca;}
  .tl-action-btn.block-full{background:var(--bad);color:#fff;flex:1 1 100%;}
  .tl-action-btn.block-full:active{background:#b91c1c;}
  .ovr-row{display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f9fafb;border-radius:10px;margin-bottom:8px;gap:10px;animation:fadeUp .25s var(--ease) both;}
  .ovr-tag{flex:0 0 auto;font-size:11px;font-weight:800;text-transform:uppercase;padding:4px 8px;border-radius:999px;letter-spacing:.4px;}
  .ovr-tag.extra{background:#ecfdf5;color:#065f46;}
  .ovr-tag.block{background:#fef2f2;color:#991b1b;}
  .ovr-when{flex:1 1 auto;min-width:0;}
  .ovr-when .top{font-size:14px;font-weight:800;}
  .ovr-when .sub{font-size:12px;color:var(--muted);margin-top:2px;}
  @media (prefers-color-scheme: dark){
    .tl-nav-btn{background:#0f172a;color:#e2e8f0;border-color:#334155;}
    .tl-today-btn{background:#022c22;color:#6ee7b7;border-color:#10b981;}
    .ovr-row{background:#0f172a;}
    .tl-action-btn.block{background:#450a0a;color:#fecaca;border-color:#7f1d1d;}
  }
  /* Ticks are absolutely positioned at their true time %, so the labels line up
     exactly with the bar (a flex row put them ~8% off, which made the drag
     tooltip look like it disagreed with the scale). */
  .tl-ticks{position:relative;height:14px;margin-top:2px;}
  .tl-tick{position:absolute;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.4px;white-space:nowrap;}
  .tl-legend{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--muted);}
  .tl-legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:middle;}
  .tl-sel-txt{font-size:13px;font-weight:700;margin-top:8px;color:var(--text);}
  .tl-sel-txt.muted{color:var(--muted);font-weight:500;}

  .base-row{display:flex;align-items:center;padding:8px 10px;background:#f9fafb;border-radius:8px;margin-bottom:6px;font-size:14px;gap:10px;}
  .base-row .d{flex:0 0 48px;font-weight:800;color:var(--text);text-transform:uppercase;font-size:12px;letter-spacing:.4px;}
  .base-row .h{flex:1 1 auto;color:var(--text);}
  .base-row.closed .h{color:var(--muted);font-style:italic;}
  @media (prefers-color-scheme: dark){ .base-row{background:#0f172a;} }

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
  .wg-block{position:absolute;left:2px;right:2px;background:linear-gradient(135deg,#34d399,#059669);color:#fff;border-radius:7px;padding:3px 5px;font-size:11px;font-weight:600;line-height:1.25;cursor:pointer;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,0.18);z-index:1;animation:fadeIn .3s ease both;transition:transform .18s var(--ease),box-shadow .18s ease,filter .18s ease;}
  .wg-block:hover{filter:brightness(1.05);box-shadow:0 5px 14px rgba(16,24,40,0.22);z-index:3;}
  .wg-block:active{transform:scale(.96);}
  .wg-block.cancelled{background:#fecdd3;background:linear-gradient(135deg,#fecaca,#fca5a5);color:#7f1d1d;text-decoration:line-through;}
  .wg-block.attended{background:linear-gradient(135deg,#818cf8,#4f46e5);}
  .wg-block.no_show{background:linear-gradient(135deg,#fbbf24,#d97706);}
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
  .date-btn{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--text);font-size:15px;font-family:inherit;text-align:left;min-height:46px;display:flex;align-items:center;gap:8px;cursor:pointer;box-shadow:var(--sh-sm);transition:border-color .16s ease,box-shadow .16s ease;}
  .dateBar .date-btn:hover{border-color:#d7dbe4;}
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

  /* ── Desktop shell ──────────────────────────────────────
     The diary is mobile-first, so on a wide screen everything used to stretch
     full-bleed and read as a stretched phone page. On larger viewports we
     centre the whole thing into a designed column on a soft canvas, and lay
     the day out as a responsive card grid so it feels like a real product. */
  @media (min-width:760px){
    html{background:#e9edf3;}
    body{max-width:1120px;margin:0 auto;background:var(--bg);min-height:100vh;box-shadow:0 0 0 1px rgba(16,24,40,.06),0 24px 70px rgba(16,24,40,.10);}
    .topbar{padding:14px 22px;}
    .topbar h1{font-size:19px;}
    .tabBar{padding:8px 18px;gap:8px;}
    .searchBar{padding:12px 18px;}
    .dateBar{padding:12px 18px;}
    .dayLabel{padding:12px 22px 2px;font-size:15px;}
    .summary{padding:0 22px 12px;}
    .day-actions{padding:0 18px 8px;}
    .list{padding:6px 18px 130px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start;}
    .list .appt{margin-bottom:0;}
    .empty{grid-column:1 / -1;}
    .next-up{margin:10px 18px 4px;}
  }
  @media (min-width:1180px){
    .list{grid-template-columns:repeat(3,minmax(0,1fr));}
  }

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
    <button onclick="openBulkSheet()" title="Bulk add bookings" style="flex:0 0 auto;background:#ecfdf5;border:1px solid var(--accent);color:#065f46;border-radius:10px;font-weight:800;font-size:13px;padding:0 12px;min-height:44px;cursor:pointer;">⇊ Bulk</button>
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
      <h3>Your booking periods</h3>
      <p class="hint">Each visit in one place: pick the dates, the working days, and drag the hours — that stint's hours apply to every day it covers, so you set a whole visit in seconds. Tap Edit to change dates or hours anytime.</p>
      <div id="winList"><div class="empty" style="margin:0;border:none;padding:12px 0;">Loading…</div></div>
      <button class="avail-save" style="margin-top:8px;" onclick="openAddWindow()">+ Add a stint</button>
      <div class="avail-msg" id="winListMsg"></div>

      <h3 style="margin-top:18px;">Slot duration</h3>
      <div class="avail-row"><label>Slots</label><select id="winSlotMin" onchange="saveSlotMin()"><option value="15">15 min</option><option value="20">20 min</option><option value="30" selected>30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div>
      <div class="avail-msg" id="slotMinMsg"></div>

      <h3 style="margin-top:16px;">Hours</h3>
      <p class="hint">Hours live on each stint above — open a stint and drag the bar. Every visit can have its own hours, and you can do <b>evenings-only</b> or <b>mornings-only</b> just by dragging that one block.</p>
      <!-- Legacy weekly-hours inputs kept hidden so existing load/save code stays safe; hours are now per stint. -->
      <input type="hidden" id="wsMorningStart"><input type="hidden" id="wsMorningEnd">
      <input type="hidden" id="wsEveningStart"><input type="hidden" id="wsEveningEnd">
      <input type="hidden" id="wsIncludeSat">
      <button id="wsSaveBtn" style="display:none;" onclick="saveWeeklyHours()"></button>
      <div class="avail-msg" id="wsMsg" style="display:none;"></div>
      <div id="baseSchedule" style="display:none;"></div>
    </div>

    <div class="avail-card">
      <h3>Days off</h3>
      <p class="hint">Mark a date (or date range) you're not working. Patients won't be offered those days. Any bookings already on the date are left untouched — use Reschedule on each card to shift them.</p>
      <div class="avail-row">
        <label>From</label>
        <button type="button" class="date-btn empty" id="offFromBtn" onclick="pickDate('offFrom')"><span class="date-icon">📅</span><span class="date-val" id="offFromLabel">Pick a date</span></button>
        <input type="hidden" id="offFrom">
      </div>
      <div class="avail-row">
        <label>To</label>
        <button type="button" class="date-btn empty" id="offToBtn" onclick="pickDate('offTo')"><span class="date-icon">📅</span><span class="date-val" id="offToLabel">Same day</span></button>
        <input type="hidden" id="offTo">
      </div>
      <div class="avail-row"><label>Reason</label><input type="text" id="offReason" placeholder="Optional note, e.g. conference, sick"></div>
      <button class="avail-save" onclick="saveOff()">Mark days off</button>
      <div class="avail-msg" id="offMsg"></div>
      <div id="offList" style="margin-top:10px;"><div class="empty" style="margin:0;border:none;padding:12px 0;">Loading…</div></div>
    </div>

    <div class="avail-card">
      <h3>Daily availability</h3>
      <p class="hint">Pick a day, then drag on the bar to pick a time range. Tap <b>Add extra time</b> to open extra hours, or <b>Block this time</b> to close just those hours. <b>Block full day</b> closes the whole day with no selection needed.</p>
      <div class="tl-date-nav">
        <button class="tl-nav-btn" onclick="navTimelineDay(-1)" aria-label="Previous day">‹</button>
        <button type="button" class="date-btn empty" id="tlDateBtn" onclick="pickDate('tlDate', function(dk){ loadTimeline(); })" style="flex:1 1 auto;"><span class="date-icon">📅</span><span class="date-val" id="tlDateLabel">Pick a date</span></button>
        <button class="tl-nav-btn" onclick="navTimelineDay(1)" aria-label="Next day">›</button>
        <button class="tl-today-btn" onclick="goTimelineToday()">Today</button>
        <input type="hidden" id="tlDate">
      </div>
      <div id="tlContainer" style="margin-top:10px;"></div>
      <div class="tl-action-row">
        <button class="tl-action-btn add" id="tlAddBtn" onclick="saveTimelineRange()" disabled><span class="tl-icon">＋</span>Add extra time</button>
        <button class="tl-action-btn block" id="tlBlockBtn" onclick="saveTimelineBlock()" disabled><span class="tl-icon">⏸</span>Block this time</button>
        <button class="tl-action-btn block-full" onclick="blockTimelineDay()"><span class="tl-icon">✕</span>Block full day</button>
      </div>
      <div class="avail-msg" id="tlMsg"></div>
    </div>

    <div class="avail-card">
      <h3>Active overrides</h3>
      <p class="hint">All upcoming extras and partial-day blocks for Linda. Tap <b>Remove</b> to undo any of them.</p>
      <div id="overridesList"><div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div></div>
    </div>
  </div>
</div>

<!-- Stint editor: date range + weekday pills + compose-hours bar -->
<div class="sheet-overlay" id="seOverlay" onclick="closeStintEditor()"></div>
<div class="sheet" id="seSheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="sheet-title" id="seTitle">Add a stint</h3>
    <button class="sheet-close" onclick="closeStintEditor()" aria-label="Close">×</button>
  </div>
  <div class="sheet-section">
    <div class="sheet-label">Dates Linda is here</div>
    <div class="se-daterow">
      <input class="sheet-input" type="date" id="seFrom">
      <span class="se-arrow">→</span>
      <input class="sheet-input" type="date" id="seTo">
    </div>
  </div>
  <div class="sheet-section">
    <div class="sheet-label">Working days</div>
    <div class="se-pills" id="sePills"></div>
  </div>
  <div class="sheet-section">
    <div class="sheet-label">Hours (drag the bar)</div>
    <div class="tl-bar" id="seBar" style="height:60px;"></div>
    <div class="tl-ticks" style="margin-top:3px;"><div class="tl-tick" style="left:0;">07</div><div class="tl-tick" style="left:20%;transform:translateX(-50%);">10</div><div class="tl-tick" style="left:40%;transform:translateX(-50%);">13</div><div class="tl-tick" style="left:60%;transform:translateX(-50%);">16</div><div class="tl-tick" style="left:80%;transform:translateX(-50%);">19</div><div class="tl-tick" style="right:0;">22</div></div>
    <div class="se-summary" id="seSummary"></div>
  </div>
  <div class="sheet-section">
    <input class="sheet-input" type="text" id="seNote" placeholder="Note (optional) — e.g. 'summer visit'">
  </div>
  <button class="sheet-submit" onclick="saveStint()">Save stint</button>
  <div class="avail-msg" id="seMsg" style="margin-top:8px;"></div>
</div>

<!-- Bulk booking sheet: paste a Date/Time/Name/Phone/Email table -->
<div class="sheet-overlay" id="bulkOverlay" onclick="closeBulkSheet()"></div>
<div class="sheet" id="bulkSheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="sheet-title">Bulk add bookings</h3>
    <button class="sheet-close" onclick="closeBulkSheet()" aria-label="Close">×</button>
  </div>
  <div class="sheet-section">
    <div class="sheet-label">Paste rows — Date, Time, Name, Phone, Email (one per line)</div>
    <textarea class="sheet-input" id="bulkText" oninput="bulkParse()" placeholder="2026-07-06, 16:30, Maria Camilleri, +35679123456, maria@example.com&#10;06/07/2026, 5:00pm, John Grech, +35699887766, john@example.com" style="min-height:120px;font-family:monospace;white-space:pre;"></textarea>
    <p class="hint" style="margin-top:6px;">Copy straight from a spreadsheet. Dates like 2026-07-06 or 06/07/2026, times like 16:30 or 4:30pm. Phone or email — at least one.</p>
  </div>
  <div id="bulkPreview" class="sheet-section"></div>
  <button class="sheet-submit" id="bulkBtn" onclick="bulkSubmit()" disabled>Book all</button>
  <div class="avail-msg" id="bulkMsg" style="margin-top:8px;"></div>
</div>

<!-- Edit appointment / client details -->
<div class="sheet-overlay" id="editOverlay" onclick="closeEditSheet()"></div>
<div class="sheet" id="editSheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="sheet-title">Edit details</h3>
    <button class="sheet-close" onclick="closeEditSheet()" aria-label="Close">×</button>
  </div>
  <div class="sheet-section">
    <div class="sheet-label" id="editWhen"></div>
    <input class="sheet-input" id="editName" placeholder="Full name" style="margin-bottom:8px;" oninput="editAutosave()" onchange="editAutosave()">
    <div class="sheet-row">
      <input class="sheet-input" id="editPhone" type="tel" placeholder="Phone" inputmode="tel" oninput="editAutosave()" onchange="editAutosave()">
      <input class="sheet-input" id="editEmail" type="email" placeholder="Email" inputmode="email" oninput="editAutosave()" onchange="editAutosave()">
    </div>
    <textarea class="sheet-input" id="editComments" placeholder="Comments (optional)" style="margin-top:8px;min-height:56px;" oninput="editAutosave()" onchange="editAutosave()"></textarea>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin-top:10px;cursor:pointer;"><input type="checkbox" id="editApply" onchange="editAutosave()"> Also fix all their <b>upcoming</b> appointments</label>
    <p class="hint" style="margin-top:8px;">Changes save automatically as you type.</p>
  </div>
  <button class="sheet-submit" onclick="submitEdit()">Done</button>
  <div id="editMsg" class="sheet-msg" style="display:none;"></div>
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
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <div class="sheet-label" style="margin-bottom:0;">Time</div>
      <label id="bfCustomLabel" style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:#065f46;cursor:pointer;"><input type="checkbox" id="bfCustomToggle" onchange="toggleCustomTime()"> Custom time</label>
    </div>
    <div id="bfSlots" style="margin-top:6px;"><div class="sheet-msg">Pick a date first.</div></div>
    <div id="bfCustomWrap" style="display:none;margin-top:6px;">
      <input class="sheet-input" type="time" id="bfCustomTime" step="300" oninput="updateSheetSubmit()">
      <p class="hint" style="margin-top:5px;">Any time — e.g. 18:15. Books off-grid regardless of the usual slots.</p>
    </div>
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
    <h3 class="ph-name" id="phName" style="flex:1 1 auto;">Patient</h3>
    <button onclick="editFromHistory()" style="background:#f5f3ff;color:#5b21b6;border:1px solid #ddd6fe;border-radius:8px;font-weight:800;font-size:13px;padding:7px 12px;margin-right:8px;cursor:pointer;">✎ Edit</button>
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
  // Initials + a stable colour derived from the name, for the card avatar.
  function monogram(name){
    var p = (name || '').trim().split(/\\s+/);
    var a = (p[0] && p[0][0]) || '?';
    var b = (p.length > 1 && p[p.length - 1][0]) || '';
    return (a + b).toUpperCase();
  }
  function avatarStyle(name){
    var s = name || '', h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return 'background:linear-gradient(135deg,hsl(' + h + ',62%,58%),hsl(' + ((h + 26) % 360) + ',64%,46%));';
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
      var cancelled = a.status && a.status.indexOf('CANCELLED') >= 0;
      var marked = (a.status === 'ATTENDED' || a.status === 'NO_SHOW');
      var cardCls = 'appt';
      if (a.status === 'ATTENDED') cardCls += ' is-attended';
      else if (a.status === 'NO_SHOW') cardCls += ' is-noshow';
      else if (cancelled) cardCls += ' is-cancelled';
      var patientPayload = esc(JSON.stringify({ email: a.email || '', phone: a.phone || '', name: a.full_name || '' }));
      var nameEditPayload = esc(JSON.stringify({ id: a.id, fullName: a.full_name, email: a.email, phone: a.phone, comments: a.comments || '', dateKey: a.date_key, startTime: a.start_time }));
      var nextPayload = esc(JSON.stringify({ id: a.id, fullName: a.full_name, email: a.email, phone: a.phone, comments: a.comments || '' }));
      var cancelInfo = esc(JSON.stringify({ id: a.id, name: a.full_name || 'this patient', dateKey: a.date_key, startTime: a.start_time }));
      html += '<div class="' + cardCls + '">';
      // Header — monogram avatar, time eyebrow, tappable name, status + overflow menu
      html +=   '<div class="ac-top">';
      html +=     '<div class="ac-avatar" style="' + avatarStyle(a.full_name) + '">' + esc(monogram(a.full_name)) + '</div>';
      html +=     '<div class="ac-id">';
      html +=       '<div class="ac-eyebrow">' + time + '</div>';
      html +=       '<div class="appt-name" data-edit="' + nameEditPayload + '" onclick="editApptFromEl(this)"><span>' + esc(a.full_name || 'No name') + '</span></div>';
      if (a.service_name) html += '<div class="appt-svc">' + esc(a.service_name) + '</div>';
      html +=     '</div>';
      html +=     '<div class="ac-top-right">';
      html +=       '<div class="appt-status ' + statusCls + '">' + statusTxt + '</div>';
      if (!cancelled) html += '<button class="ac-kebab" onclick="toggleApptMenu(this)" aria-label="More actions">⋮</button>';
      html +=     '</div>';
      html +=   '</div>';
      html +=   '<div class="contact-row">';
      if (tel) html += '<a class="contact-btn call" href="tel:' + esc(tel) + '"><span class="icon">📞</span>' + esc(a.phone) + '</a>';
      if (email) html += '<a class="contact-btn email" href="mailto:' + esc(email) + '"><span class="icon">✉️</span>' + esc(email) + '</a>';
      html +=   '</div>';
      if (a.comments && a.comments.trim()){
        html += '<div class="comments"><div class="comments-label">Note from patient</div>' + esc(a.comments) + '</div>';
      }
      if (!cancelled){
        // Card face only carries the two things Linda actually does day to day.
        html += '<div class="appt-actions"><div class="btn-row">';
        html +=     '<button class="act primary" onclick="openReschedule(\\'' + esc(a.id) + '\\')"><span class="act-ico">🔄</span>Reschedule</button>';
        html +=     '<button class="act" data-patient="' + nextPayload + '" onclick="openScheduleNextFromEl(this)"><span class="act-ico">＋</span>Next session</button>';
        html +=   '</div></div>';
        // Attended / No-show — hide once already marked; show a tiny Reopen
        // link instead so she can undo if she tapped by mistake.
        // Everything secondary / rarely-used lives in the overflow menu.
        html += '<div class="ac-menu">';
        html +=   '<button data-edit="' + nameEditPayload + '" onclick="editApptFromEl(this)"><span class="mi-ico">\u270e</span>Edit details</button>';
        html +=   '<button data-patient="' + patientPayload + '" onclick="openPatientHistoryFromEl(this)"><span class="mi-ico">\ud83d\udd53</span>Patient history</button>';
        html +=   '<div class="ac-menu-sep"></div>';
        if (marked){
          html += '<button onclick="markStatus(\\'' + esc(a.id) + '\\',\\'BOOKED\\')"><span class="mi-ico">\u21a9</span>Reopen booking</button>';
        } else {
          html += '<button onclick="markStatus(\\'' + esc(a.id) + '\\',\\'ATTENDED\\')"><span class="mi-ico">\u2713</span>Mark attended</button>';
          html += '<button onclick="markStatus(\\'' + esc(a.id) + '\\',\\'NO_SHOW\\')"><span class="mi-ico">\u2715</span>Mark no-show</button>';
        }
        html +=   '<div class="ac-menu-sep"></div>';
        html +=   '<button class="danger" data-appt="' + cancelInfo + '" onclick="cancelOneFromEl(this)"><span class="mi-ico">\ud83d\uddd1</span>Cancel appointment</button>';
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
    // The cookie is HttpOnly, so we can't erase it from JS. Hit the server
    // logout route which clears it via Set-Cookie and redirects back here.
    window.location.href = '/linda/logout';
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
    if (which === 'avail') { loadWindows(); loadBaseSchedule(); loadOverrides(); loadOff(); initTimeline(); }
    if (which === 'week') loadWeek();
  };

  // ── Availability tab: load, add, delete ──
  function formatNiceShort(k){
    try {
      var d = parseKey(k);
      return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
    } catch(e){ return k; }
  }

  var DOW_LABELS = [
    { key: 'MON', label: 'Mon' },
    { key: 'TUE', label: 'Tue' },
    { key: 'WED', label: 'Wed' },
    { key: 'THU', label: 'Thu' },
    { key: 'FRI', label: 'Fri' },
    { key: 'SAT', label: 'Sat' },
    { key: 'SUN', label: 'Sun' },
  ];

  function setHiddenDate(id, dk){
    $(id).value = dk;
    var lbl = $(id + 'Label');
    var btn = $(id + 'Btn');
    if (lbl) lbl.textContent = dk ? fmtDay(dk) : (id === 'winEnd' ? 'Loading…' : 'Pick a date');
    if (btn) btn.classList.remove('empty');
  }

  // ── Booking windows (stints) ──
  function setStintMsg(txt, kind){
    var m = $('winListMsg');
    m.textContent = txt || '';
    m.className = 'avail-msg' + (kind ? ' ' + kind : '');
  }

  // Each stint now carries its own hours (days + time ranges), composed on a
  // drag bar. winCache holds the last-loaded windows so Edit can reopen the
  // exact stint (objects can't ride in inline onclick, so we pass an index).
  var winCache = [];
  var DOW_ORDER = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var DOW_ONE = { MON:'M', TUE:'T', WED:'W', THU:'T', FRI:'F', SAT:'S', SUN:'S' };

  function stintHoursSummary(w){
    if (!w.hours || !w.hours.ranges || !w.hours.ranges.length) return 'Uses default weekly hours';
    var days = (w.hours.days || []);
    var dayTxt = days.length === 7 ? 'Every day'
      : days.slice().sort(function(a,b){return DOW_ORDER.indexOf(a)-DOW_ORDER.indexOf(b);})
          .map(function(k){ return k.charAt(0)+k.slice(1).toLowerCase(); }).join(', ');
    var rTxt = w.hours.ranges.map(function(r){ return r.start+'–'+r.end; }).join(' & ');
    return dayTxt + ' · ' + rTxt;
  }

  async function loadWindows(){
    var el = $('winList');
    try {
      var res = await fetch('/api/linda-windows');
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok){ el.innerHTML = '<div class="err" style="margin:0;">' + esc(data.reason || 'Failed') + '</div>'; return; }
      winCache = data.windows || [];
      if (!winCache.length){
        el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:12px 0;">No stints yet. Tap + Add a stint.</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < winCache.length; i++){
        var w = winCache[i];
        html += '<div class="stint-row">';
        html +=   '<div class="stint-when">' + esc(formatNiceShort(w.start)) + ' → ' + esc(formatNiceShort(w.end)) + (w.note ? ' · <span style="color:var(--muted);font-weight:500;">' + esc(w.note) + '</span>' : '') + '</div>';
        html +=   '<div class="stint-hours">' + esc(stintHoursSummary(w)) + '</div>';
        html +=   '<div class="stint-actions">';
        html +=     '<button class="extra-edit" onclick="editStint(' + i + ')">Edit</button>';
        html +=     '<button class="extra-del" onclick="deleteWindow(' + w.id + ')">Remove</button>';
        html +=   '</div>';
        html += '</div>';
      }
      el.innerHTML = html;
    } catch(e){
      el.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }

  window.editStint = function(i){ openStintEditor(winCache[i]); };

  window.deleteWindow = async function(id){
    if (!confirm('Remove this stint? Patients will no longer be able to book within it (existing bookings stay).')) return;
    try {
      var res = await fetch('/api/linda-windows?id=' + id, { method: 'DELETE' });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){ setStintMsg('Removed.', 'ok'); loadWindows(); }
      else setStintMsg(data.reason || 'Failed', 'bad');
    } catch(e){ setStintMsg('Network error', 'bad'); }
  };

  window.openAddWindow = function(){ openStintEditor(null); };

  // ── Stint editor (compose hours on the bar) ──────────────────
  var SE = { id: 0, ranges: [], days: {}, preview: null, mode: null, resizeIdx: -1, resizeEdge: '', insideIdx: -1, moved: false, drag: { active: false, start: 0 } };
  var seWired = false;
  var SE_START = 7 * 60, SE_END = 22 * 60, SE_TOTAL = SE_END - SE_START, SE_SNAP = 15, SE_EDGE_PX = 12;
  function sePct(m){ var c = Math.max(SE_START, Math.min(SE_END, m)); return ((c - SE_START) / SE_TOTAL) * 100; }
  function seXToMin(x){ var bar = $('seBar'); if (!bar) return 0; var r = bar.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (x - r.left) / r.width)); return Math.round((SE_START + p * SE_TOTAL) / SE_SNAP) * SE_SNAP; }
  function seMerge(){
    SE.ranges.sort(function(a,b){ return a.s - b.s; });
    var out = [];
    for (var i = 0; i < SE.ranges.length; i++){ var r = SE.ranges[i]; if (out.length && r.s <= out[out.length-1].e){ out[out.length-1].e = Math.max(out[out.length-1].e, r.e); } else out.push({ s: r.s, e: r.e }); }
    SE.ranges = out;
  }
  function seTip(s, e){ return '<div class="tl-tip" style="left:' + ((sePct(s) + sePct(e)) / 2) + '%;">' + minToTime(s) + ' – ' + minToTime(e) + '</div>'; }
  function seRenderBar(){
    var bar = $('seBar'); if (!bar) return;
    var html = '';
    for (var i = 0; i < SE.ranges.length; i++){
      var r = SE.ranges[i], l = sePct(r.s), w = sePct(r.e) - sePct(r.s);
      html += '<div class="se-seg" style="left:' + l + '%;width:' + w + '%;"><span class="se-grip" style="left:0;"></span><span class="se-grip" style="right:0;"></span></div>';
    }
    if (SE.drag.active && SE.mode === 'create' && SE.preview){
      html += '<div class="se-seg preview" style="left:' + sePct(SE.preview.s) + '%;width:' + (sePct(SE.preview.e) - sePct(SE.preview.s)) + '%;"></div>' + seTip(SE.preview.s, SE.preview.e);
    } else if (SE.drag.active && SE.mode === 'resize' && SE.ranges[SE.resizeIdx]){
      var rr = SE.ranges[SE.resizeIdx]; html += seTip(rr.s, rr.e);
    }
    bar.innerHTML = html;
    seSummary();
  }
  function seSummary(){
    var el = $('seSummary'); if (!el) return;
    var days = DOW_ORDER.filter(function(k){ return SE.days[k]; });
    var rTxt = SE.ranges.length ? SE.ranges.map(function(r){ return minToTime(r.s) + '–' + minToTime(r.e); }).join(' & ') : '—';
    var dTxt = days.length === 7 ? 'Every day' : days.length ? days.map(function(k){ return k.charAt(0)+k.slice(1).toLowerCase(); }).join(', ') : 'No days';
    el.innerHTML = SE.ranges.length ? ('<b>' + esc(dTxt) + '</b> · <b>' + esc(rTxt) + '</b>') : 'Drag across the bar to add hours · drag an edge to resize · tap a block to remove.';
  }
  // Decide what a press at pixel x acts on: a range edge (resize), inside a range
  // (tap-to-remove), or empty space (create).
  function seHit(x){
    var bar = $('seBar'); if (!bar) return null; var rect = bar.getBoundingClientRect();
    for (var i = 0; i < SE.ranges.length; i++){ var r = SE.ranges[i];
      var lpx = rect.left + sePct(r.s) / 100 * rect.width, rpx = rect.left + sePct(r.e) / 100 * rect.width;
      if (Math.abs(x - lpx) <= SE_EDGE_PX) return { i: i, edge: 's' };
      if (Math.abs(x - rpx) <= SE_EDGE_PX) return { i: i, edge: 'e' };
    }
    var m = seXToMin(x);
    for (var j = 0; j < SE.ranges.length; j++){ if (m > SE.ranges[j].s && m < SE.ranges[j].e) return { i: j, edge: 'inside' }; }
    return null;
  }
  function seDown(x){
    if (!$('seBar')) return;
    SE.drag.active = true; SE.moved = false; SE.preview = null;
    var hit = seHit(x);
    if (hit && (hit.edge === 's' || hit.edge === 'e')){ SE.mode = 'resize'; SE.resizeIdx = hit.i; SE.resizeEdge = hit.edge; seRenderBar(); return; }
    if (hit && hit.edge === 'inside'){ SE.mode = 'inside'; SE.insideIdx = hit.i; return; }
    SE.mode = 'create'; SE.drag.start = seXToMin(x); SE.preview = { s: SE.drag.start, e: SE.drag.start + SE_SNAP }; seRenderBar();
  }
  function seMove(x){
    if (!SE.drag.active) return; SE.moved = true; var m = seXToMin(x);
    if (SE.mode === 'resize'){ var r = SE.ranges[SE.resizeIdx]; if (!r) return; if (SE.resizeEdge === 's') r.s = Math.max(SE_START, Math.min(m, r.e - SE_SNAP)); else r.e = Math.min(SE_END, Math.max(m, r.s + SE_SNAP)); seRenderBar(); return; }
    if (SE.mode === 'create'){ var s = Math.min(SE.drag.start, m), e = Math.max(SE.drag.start, m); if (e - s < SE_SNAP) e = s + SE_SNAP; SE.preview = { s: s, e: e }; seRenderBar(); }
  }
  function seUp(){
    if (!SE.drag.active) return; SE.drag.active = false;
    if (SE.mode === 'resize'){ seMerge(); }
    else if (SE.mode === 'inside'){ if (!SE.moved) SE.ranges.splice(SE.insideIdx, 1); }
    else if (SE.mode === 'create'){ if (SE.moved && SE.preview){ SE.ranges.push({ s: SE.preview.s, e: SE.preview.e }); seMerge(); } }
    SE.mode = null; SE.preview = null; SE.resizeIdx = -1; SE.insideIdx = -1;
    seRenderBar();
  }
  function seWire(){
    if (seWired) return; seWired = true;
    window.addEventListener('mousemove', function(e){ seMove(e.clientX); });
    window.addEventListener('mouseup', seUp);
    var bar = $('seBar');
    if (bar){
      bar.addEventListener('mousedown', function(e){ seDown(e.clientX); });
      bar.addEventListener('touchstart', function(e){ if (e.touches.length) seDown(e.touches[0].clientX); }, { passive: true });
      bar.addEventListener('touchmove', function(e){ if (e.touches.length) seMove(e.touches[0].clientX); }, { passive: true });
      bar.addEventListener('touchend', seUp);
    }
  }
  function seRenderPills(){
    var host = $('sePills'); if (!host) return;
    host.innerHTML = DOW_ORDER.map(function(k){ return '<button type="button" class="se-pill' + (SE.days[k] ? ' on' : '') + '" data-k="' + k + '">' + DOW_ONE[k] + '</button>'; }).join('');
    Array.prototype.forEach.call(host.children, function(b){
      b.addEventListener('click', function(){ var k = b.getAttribute('data-k'); SE.days[k] = SE.days[k] ? 0 : 1; b.classList.toggle('on'); seSummary(); });
    });
  }
  function openStintEditor(win){
    seWire();
    SE.id = win ? win.id : 0;
    SE.ranges = []; SE.preview = null; SE.drag.active = false;
    SE.days = { MON:1, TUE:1, WED:1, THU:1, FRI:1, SAT:1, SUN:0 }; // default Mon–Sat
    $('seMsg').textContent = '';
    if (win){
      $('seTitle').textContent = 'Edit stint';
      $('seFrom').value = win.start; $('seTo').value = win.end; $('seNote').value = win.note || '';
      if (win.hours && win.hours.ranges && win.hours.ranges.length){
        SE.ranges = win.hours.ranges.map(function(r){ return { s: timeToMin(r.start), e: timeToMin(r.end) }; });
        var d = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 };
        (win.hours.days || []).forEach(function(k){ d[k] = 1; });
        SE.days = d;
      }
    } else {
      $('seTitle').textContent = 'Add a stint';
      $('seFrom').value = today(); $('seTo').value = ''; $('seNote').value = '';
    }
    seRenderPills(); seRenderBar();
    $('seOverlay').classList.add('show'); $('seSheet').classList.add('show');
  }
  window.closeStintEditor = function(){ $('seOverlay').classList.remove('show'); $('seSheet').classList.remove('show'); };
  window.saveStint = async function(){
    var s = $('seFrom').value, e = $('seTo').value, note = $('seNote').value.trim();
    var msg = $('seMsg');
    if (!s || !e){ msg.textContent = 'Pick both dates.'; msg.className = 'avail-msg bad'; return; }
    if (e < s){ msg.textContent = 'End date is before start.'; msg.className = 'avail-msg bad'; return; }
    var days = DOW_ORDER.filter(function(k){ return SE.days[k]; });
    var ranges = SE.ranges.map(function(r){ return { start: minToTime(r.s), end: minToTime(r.e) }; });
    if (ranges.length && !days.length){ msg.textContent = 'Pick at least one working day (or clear the hours to use default weekly).'; msg.className = 'avail-msg bad'; return; }
    var hours = ranges.length ? { days: days, ranges: ranges } : null;
    var body = { startDate: s, endDate: e, note: note, hours: hours };
    var method = 'POST';
    if (SE.id){ method = 'PUT'; body.id = SE.id; }
    msg.textContent = 'Saving…'; msg.className = 'avail-msg';
    try {
      var res = await fetch('/api/linda-windows', { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){ closeStintEditor(); setStintMsg('Saved.', 'ok'); loadWindows(); }
      else { msg.textContent = data.reason || 'Failed'; msg.className = 'avail-msg bad'; }
    } catch(err){ msg.textContent = 'Network error'; msg.className = 'avail-msg bad'; }
  };

  // Save slot duration in-place (no separate button — change fires save).
  window.saveSlotMin = async function(){
    var sm = parseInt($('winSlotMin').value, 10) || 30;
    $('slotMinMsg').textContent = 'Saving…'; $('slotMinMsg').className = 'avail-msg';
    try {
      var res = await fetch('/api/linda-base-schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotMin: sm }),
      });
      var data = await res.json();
      if (data.ok){ $('slotMinMsg').textContent = 'Saved.'; $('slotMinMsg').className = 'avail-msg ok'; }
      else { $('slotMinMsg').textContent = data.reason || 'Failed'; $('slotMinMsg').className = 'avail-msg bad'; }
    } catch(e){ $('slotMinMsg').textContent = 'Network error'; $('slotMinMsg').className = 'avail-msg bad'; }
  };

  window.markHoursDirty = function(){ $('wsSaveBtn').style.display = ''; };

  async function loadBaseSchedule(){
    var el = $('baseSchedule');
    try {
      var res = await fetch('/api/linda-base-schedule');
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok){ el.innerHTML = '<div class="err" style="margin:0;">' + esc(data.reason || 'Failed') + '</div>'; return; }
      $('winSlotMin').value = String(data.slotMin || 30);

      // Pre-fill the weekly-hours inputs from MON (taken as the canonical
      // weekday template; matches the admin UI's pattern).
      var mon = ((data.hours || {}).MON) || [];
      var morning = mon[0] || { start: '', end: '' };
      var evening = mon[1] || { start: '', end: '' };
      $('wsMorningStart').value = morning.start || '';
      $('wsMorningEnd').value = morning.end || '';
      $('wsEveningStart').value = evening.start || '';
      $('wsEveningEnd').value = evening.end || '';
      var sat = ((data.hours || {}).SAT) || [];
      $('wsIncludeSat').checked = sat.length > 0;
      $('wsSaveBtn').style.display = 'none';

      var html = '';
      for (var i = 0; i < DOW_LABELS.length; i++){
        var d = DOW_LABELS[i];
        var windows = (data.hours || {})[d.key] || [];
        if (!windows.length){
          html += '<div class="base-row closed"><div class="d">' + d.label + '</div><div class="h">Closed</div></div>';
        } else {
          var txt = windows.map(function(w){ return esc(w.start) + '–' + esc(w.end); }).join(' · ');
          html += '<div class="base-row"><div class="d">' + d.label + '</div><div class="h">' + txt + '</div></div>';
        }
      }
      el.innerHTML = html;
    } catch(e){
      el.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }

  window.saveWeeklyHours = async function(){
    var ms = $('wsMorningStart').value, me = $('wsMorningEnd').value;
    var es = $('wsEveningStart').value, ee = $('wsEveningEnd').value;
    var sat = $('wsIncludeSat').checked;
    var blocks = [];
    if (ms && me) blocks.push({ start: ms, end: me });
    if (es && ee) blocks.push({ start: es, end: ee });
    if (!blocks.length){
      $('wsMsg').textContent = 'Set at least one time range (morning or evening).';
      $('wsMsg').className = 'avail-msg bad';
      return;
    }
    // Mon-Fri always, Sat optional, Sun closed.
    var weekday = blocks;
    var hours = {
      MON: weekday, TUE: weekday, WED: weekday,
      THU: weekday, FRI: weekday,
      SAT: sat ? blocks : [], SUN: [],
    };
    $('wsMsg').textContent = 'Saving…'; $('wsMsg').className = 'avail-msg';
    try {
      // Re-use the same endpoint. We have to send the current window fields too
      // because POST treats missing fields as invalid; this keeps everything in sync.
      var res = await fetch('/api/linda-base-schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotMin: parseInt($('winSlotMin').value, 10) || 30,
          hours: hours,
        }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        $('wsMsg').textContent = 'Saved.'; $('wsMsg').className = 'avail-msg ok';
        $('wsSaveBtn').style.display = 'none';
        loadBaseSchedule();
      } else {
        $('wsMsg').textContent = data.reason || 'Failed'; $('wsMsg').className = 'avail-msg bad';
      }
    } catch(e){
      $('wsMsg').textContent = 'Network error'; $('wsMsg').className = 'avail-msg bad';
    }
  };

  // ── Days off ──
  async function loadOff(){
    var el = $('offList');
    try {
      var res = await fetch('/api/linda-off');
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok || !data.off || !data.off.length){
        el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:12px 0;">No days off marked.</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < data.off.length; i++){
        var o = data.off[i];
        html += '<div class="extra-row">';
        html +=   '<div><div class="extra-when">' + esc(formatNiceShort(o.date_key)) + '</div>';
        if (o.reason) html += '<div class="extra-dim">' + esc(o.reason) + '</div>';
        html +=   '</div>';
        html +=   '<button class="extra-del" onclick="deleteOff(' + o.id + ')">Restore</button>';
        html += '</div>';
      }
      el.innerHTML = html;
    } catch(e){
      el.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }

  window.saveOff = async function(){
    var from = $('offFrom').value, to = $('offTo').value, reason = $('offReason').value;
    if (!from) { $('offMsg').textContent = 'Pick a start date.'; $('offMsg').className = 'avail-msg bad'; return; }
    $('offMsg').textContent = 'Saving…'; $('offMsg').className = 'avail-msg';
    try {
      var res = await fetch('/api/linda-off', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: from, dateKeyEnd: to || undefined, reason: reason || '' }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        var msg = 'Marked ' + data.added + ' day' + (data.added === 1 ? '' : 's') + ' off.';
        if (data.affectedBookings) msg += ' ' + data.affectedBookings + ' existing booking' + (data.affectedBookings === 1 ? '' : 's') + ' on those dates — use Reschedule on each to shift.';
        $('offMsg').textContent = msg; $('offMsg').className = 'avail-msg ok';
        $('offReason').value = '';
        loadOff();
      } else {
        $('offMsg').textContent = data.reason || 'Failed'; $('offMsg').className = 'avail-msg bad';
      }
    } catch(e){
      $('offMsg').textContent = 'Network error'; $('offMsg').className = 'avail-msg bad';
    }
  };

  // ── Day timeline (tap-drag to add extra / block full day) ──
  var TL_START_MIN = 7 * 60;   // 07:00
  var TL_END_MIN = 22 * 60;    // 22:00
  var TL_TOTAL_MIN = TL_END_MIN - TL_START_MIN; // 900
  var TL_SNAP_MIN = 15;
  var tl = { sel: null, baseHours: null, extras: [], blocks: [], booked: [], dayOff: false, picked: null };
  // Drag state is shared (not per-render) and the window move/up listeners are
  // bound exactly once — see wireTimelineDrag(). Re-rendering the bar mid-drag
  // used to re-add these listeners every time, leaking handlers and making the
  // selection jump around, which broke "tweak availability on the fly".
  var TL_DRAG = { active: false, startMin: 0 };
  var tlWindowWired = false;

  function minToTime(m){ return pad(Math.floor(m/60)) + ':' + pad(m%60); }
  function timeToMin(s){ var p = String(s).split(':'); return parseInt(p[0],10)*60 + parseInt(p[1],10); }

  function initTimeline(){
    // First-time init: default the date to today.
    if (!$('tlDate').value){
      var t = today();
      setHiddenDate('tlDate', t);
      loadTimeline();
    } else {
      loadTimeline();
    }
  }

  async function loadTimeline(){
    var dk = $('tlDate').value; if (!dk) return;
    $('tlMsg').textContent = '';
    var wrap = $('tlContainer');
    wrap.innerHTML = '<div class="empty" style="margin:0;border:none;padding:14px 0;">Loading…</div>';
    try {
      // One request for hours + extras + existing bookings + off-flag.
      var [slotsRes, dayRes, offRes] = await Promise.all([
        fetch('/api/linda-slots?date=' + encodeURIComponent(dk)).then(function(r){ return r.json(); }),
        fetch('/api/linda-day?date=' + encodeURIComponent(dk)).then(function(r){ return r.json(); }),
        fetch('/api/linda-base-schedule').then(function(r){ return r.json(); }),
      ]);
      if (slotsRes && slotsRes.ok){
        tl.extras = slotsRes.extras || [];
        tl.blocks = slotsRes.blocks || [];
        tl.dayOff = !!slotsRes.dayOff;
      } else {
        tl.extras = []; tl.blocks = []; tl.dayOff = false;
      }
      tl.booked = ((dayRes && dayRes.appointments) || [])
        .filter(function(a){ return !a.status || String(a.status).indexOf('CANCELLED') < 0; })
        .map(function(a){ return { start: a.start_time, end: a.end_time, name: a.full_name }; });
      // Use today's day-of-week to pick base hours.
      var dow = ['SUN','MON','TUE','WED','THU','FRI','SAT'][parseKey(dk).getDay()];
      var hours = ((offRes && offRes.hours) || {})[dow] || [];
      tl.baseHours = hours;

      tl.sel = null;
      renderTimeline();
    } catch(e){
      wrap.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }

  function pctOf(min){
    var clamped = Math.max(TL_START_MIN, Math.min(TL_END_MIN, min));
    return ((clamped - TL_START_MIN) / TL_TOTAL_MIN) * 100;
  }
  function renderTimeline(){
    var wrap = $('tlContainer');
    var html = '<div class="tl-bar" id="tlBar">';
    // Base hours
    for (var i = 0; i < (tl.baseHours || []).length; i++){
      var b = tl.baseHours[i];
      var l = pctOf(timeToMin(b.start));
      var r = pctOf(timeToMin(b.end));
      html += '<div class="tl-seg base" style="left:' + l + '%;width:' + (r - l) + '%;"></div>';
    }
    // Extras (tappable — data attrs let a tap select & remove them)
    for (var i = 0; i < tl.extras.length; i++){
      var e = tl.extras[i];
      var es = e.start || e.start_time, ee = e.end || e.end_time;
      var l = pctOf(timeToMin(es));
      var r = pctOf(timeToMin(ee));
      var epk = (tl.picked && tl.picked.type === 'extra' && tl.picked.id === e.id) ? ' picked' : '';
      html += '<div class="tl-seg extra' + epk + '" data-otype="extra" data-oid="' + (e.id || '') + '" style="left:' + l + '%;width:' + (r - l) + '%;" title="Extra: ' + esc(es + '–' + ee) + '"></div>';
    }
    // Partial blocks (tappable)
    for (var i = 0; i < (tl.blocks || []).length; i++){
      var b2 = tl.blocks[i];
      var bs = b2.start || b2.start_time, be = b2.end || b2.end_time;
      var lb = pctOf(timeToMin(bs));
      var rb = pctOf(timeToMin(be));
      var bpk = (tl.picked && tl.picked.type === 'block' && tl.picked.id === b2.id) ? ' picked' : '';
      html += '<div class="tl-seg block' + bpk + '" data-otype="block" data-oid="' + (b2.id || '') + '" style="left:' + lb + '%;width:' + (rb - lb) + '%;" title="Block: ' + esc(bs + '–' + be) + '"></div>';
    }
    // Bookings
    for (var i = 0; i < tl.booked.length; i++){
      var b = tl.booked[i];
      var l = pctOf(timeToMin(b.start));
      var r = pctOf(timeToMin(b.end));
      html += '<div class="tl-seg booked" style="left:' + l + '%;width:' + (r - l) + '%;" title="' + esc(b.name || '') + '"></div>';
    }
    // Day-off hatch
    if (tl.dayOff){
      html += '<div class="tl-seg off" style="left:0;width:100%;"></div>';
    }
    // Selection + live time tooltip
    if (tl.sel){
      var l = pctOf(tl.sel.start);
      var r = pctOf(tl.sel.end);
      html += '<div class="tl-seg sel" style="left:' + l + '%;width:' + (r - l) + '%;"></div>';
      html += '<div class="tl-tip" id="tlTip" style="left:' + ((l + r) / 2) + '%;">' + minToTime(tl.sel.start) + ' – ' + minToTime(tl.sel.end) + '</div>';
    }
    html += '</div>';
    // Ticks
    html += '<div class="tl-ticks">';
    for (var h = 7; h <= 22; h += 3){
      var lp = pctOf(h * 60);
      var pos = h === 7 ? 'left:0;' : h === 22 ? 'right:0;' : 'left:' + lp + '%;transform:translateX(-50%);';
      html += '<div class="tl-tick" style="' + pos + '">' + pad(h) + ':00</div>';
    }
    html += '</div>';
    html += '<div class="tl-legend">' +
      '<span><span class="tl-legend-dot" style="background:var(--accent);opacity:.55;"></span>Weekly</span>' +
      '<span><span class="tl-legend-dot" style="background:var(--accent);opacity:.85;background-image:repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,.35) 3px,rgba(255,255,255,.35) 6px);"></span>Extra</span>' +
      '<span><span class="tl-legend-dot" style="background:#3730a3;"></span>Booked</span>' +
      '<span><span class="tl-legend-dot" style="background:var(--bad);opacity:.78;background-image:repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,.35) 3px,rgba(255,255,255,.35) 6px);"></span>Block</span>' +
      '<span><span class="tl-legend-dot" style="background:var(--bad);"></span>Day off</span>' +
      '</div>';
    html += '<div class="tl-sel-txt ' + (tl.sel ? '' : 'muted') + '" id="tlSelTxt">' +
      (tl.sel ? 'Selected: ' + minToTime(tl.sel.start) + ' – ' + minToTime(tl.sel.end)
              : (tl.picked ? 'Tap Remove to delete, or drag the bar to add.' : 'Drag on the bar to select a range. Tap an existing extra or block to remove it.')) +
      '</div>';
    // A tapped extra/block shows an inline Remove bar right under the timeline.
    if (tl.picked){
      html += '<div class="tl-picked-bar">'
        + '<span style="flex:1 1 auto;font-size:13px;font-weight:800;color:#0369a1;">' + (tl.picked.type === 'extra' ? '🟢 Extra hours' : '⛔ Block') + ' ' + minToTime(tl.picked.startMin) + ' – ' + minToTime(tl.picked.endMin) + '</span>'
        + '<button id="tlRemoveOvr" class="tl-action-btn block" style="flex:0 0 auto;min-width:auto;padding:8px 16px;min-height:38px;">Remove</button>'
        + '<button id="tlClearOvr" style="flex:0 0 auto;background:none;border:none;font-size:22px;line-height:1;color:#64748b;cursor:pointer;padding:0 4px;">×</button>'
        + '</div>';
    }
    wrap.innerHTML = html;
    var btnAdd = $('tlAddBtn'); if (btnAdd) btnAdd.disabled = !tl.sel;
    var btnBlock = $('tlBlockBtn'); if (btnBlock) btnBlock.disabled = !tl.sel;
    // Wire the tap-to-remove bar + tappable extra/block segments.
    var rmBtn = $('tlRemoveOvr'); if (rmBtn) rmBtn.addEventListener('click', removePickedOverride);
    var clrBtn = $('tlClearOvr'); if (clrBtn) clrBtn.addEventListener('click', function(){ tl.picked = null; renderTimeline(); });

    // Wire drag. The mousedown/touchstart binding is on the freshly-rendered
    // bar (safe: the old bar element is discarded with its listener). The
    // window-level move/up listeners are bound ONCE and read shared state +
    // a fresh #tlBar each time, so re-rendering the bar mid-drag can't leak
    // handlers or make the selection fight itself.
    var bar = $('tlBar');
    if (!bar) return;
    bar.addEventListener('mousedown', function(ev){ tlDragDown(ev.clientX); });
    bar.addEventListener('touchstart', function(ev){ if (ev.touches.length) tlDragDown(ev.touches[0].clientX); }, { passive: true });
    bar.addEventListener('touchmove', function(ev){ if (ev.touches.length) tlDragMove(ev.touches[0].clientX); }, { passive: true });
    bar.addEventListener('touchend', tlDragUp);
    wireTimelineDrag();
    // Tapping an existing extra/block selects it (and stops a drag from starting).
    Array.prototype.forEach.call(bar.querySelectorAll('[data-oid]'), function(seg){
      var stop = function(ev){ ev.stopPropagation(); };
      seg.addEventListener('mousedown', stop);
      seg.addEventListener('touchstart', stop, { passive: true });
      seg.addEventListener('click', function(ev){
        ev.stopPropagation();
        pickTimelineOverride(seg.getAttribute('data-otype'), parseInt(seg.getAttribute('data-oid'), 10));
      });
    });
  }

  // Select an existing extra/block on the bar so it can be removed inline.
  function pickTimelineOverride(type, id){
    if (!id) return;
    var list = type === 'extra' ? tl.extras : tl.blocks;
    var item = null;
    for (var i = 0; i < list.length; i++){ if (list[i].id === id){ item = list[i]; break; } }
    if (!item) return;
    tl.sel = null; TL_DRAG.active = false;
    tl.picked = { type: type, id: id, startMin: timeToMin(item.start || item.start_time), endMin: timeToMin(item.end || item.end_time) };
    renderTimeline();
  }

  async function removePickedOverride(){
    if (!tl.picked) return;
    var p = tl.picked;
    var path = p.type === 'extra' ? '/api/linda-extras?id=' : '/api/linda-blocks?id=';
    var btn = $('tlRemoveOvr'); if (btn){ btn.disabled = true; btn.textContent = 'Removing…'; }
    try {
      var res = await fetch(path + p.id, { method: 'DELETE' }).then(function(r){ return r.json(); });
      if (res && res.ok){
        tl.picked = null;
        setTlMsg(p.type === 'extra' ? 'Extra hours removed.' : 'Block removed.', 'ok');
        loadTimeline();
        if (typeof loadOverrides === 'function') loadOverrides();
      } else {
        setTlMsg((res && res.reason) || 'Could not remove.', 'bad');
        if (btn){ btn.disabled = false; btn.textContent = 'Remove'; }
      }
    } catch(e){
      setTlMsg('Network error.', 'bad');
      if (btn){ btn.disabled = false; btn.textContent = 'Remove'; }
    }
  }

  function tlXToMin(clientX){
    var bar = $('tlBar');
    if (!bar) return 0;
    var rect = bar.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    var m = TL_START_MIN + pct * TL_TOTAL_MIN;
    return Math.round(m / TL_SNAP_MIN) * TL_SNAP_MIN;
  }
  function tlDragDown(x){
    if (!$('tlBar')) return;
    TL_DRAG.active = true;
    tl.picked = null; // starting a fresh selection clears any tapped override
    TL_DRAG.startMin = tlXToMin(x);
    tl.sel = { start: TL_DRAG.startMin, end: TL_DRAG.startMin + TL_SNAP_MIN };
    renderTimeline();
  }
  function tlDragMove(x){
    if (!TL_DRAG.active) return;
    var cur = tlXToMin(x);
    var s = Math.min(TL_DRAG.startMin, cur), e = Math.max(TL_DRAG.startMin, cur);
    if (e - s < TL_SNAP_MIN) e = s + TL_SNAP_MIN;
    tl.sel = { start: s, end: e };
    // Adjust the .sel element in place instead of re-rendering while dragging.
    var bar = $('tlBar');
    var sel = bar ? bar.querySelector('.tl-seg.sel') : null;
    if (sel){
      sel.style.left = pctOf(s) + '%';
      sel.style.width = (pctOf(e) - pctOf(s)) + '%';
      var tip = $('tlTip');
      if (tip){ tip.style.left = ((pctOf(s) + pctOf(e)) / 2) + '%'; tip.textContent = minToTime(s) + ' – ' + minToTime(e); }
      var txt = $('tlSelTxt');
      if (txt){ txt.classList.remove('muted'); txt.textContent = 'Selected: ' + minToTime(s) + ' – ' + minToTime(e); }
    } else {
      renderTimeline();
    }
  }
  function tlDragUp(){
    if (!TL_DRAG.active) return;
    TL_DRAG.active = false;
    var btnAdd = $('tlAddBtn'); if (btnAdd) btnAdd.disabled = !tl.sel;
    var btnBlock = $('tlBlockBtn'); if (btnBlock) btnBlock.disabled = !tl.sel;
  }
  function wireTimelineDrag(){
    if (tlWindowWired) return;
    tlWindowWired = true;
    window.addEventListener('mousemove', function(ev){ tlDragMove(ev.clientX); });
    window.addEventListener('mouseup', tlDragUp);
  }

  function setTlMsg(txt, kind){
    var m = $('tlMsg');
    m.textContent = txt || '';
    m.className = 'avail-msg' + (kind ? ' ' + kind : '');
  }

  window.saveTimelineRange = async function(){
    var dk = $('tlDate').value;
    if (!dk) { setTlMsg('Pick a date first.', 'bad'); return; }
    if (!tl.sel) { setTlMsg('Drag on the bar to select a range.', 'bad'); return; }
    setTlMsg('Saving…', '');
    try {
      var res = await fetch('/api/linda-extras', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: dk, startTime: minToTime(tl.sel.start), endTime: minToTime(tl.sel.end) }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        setTlMsg('Added ' + minToTime(tl.sel.start) + '–' + minToTime(tl.sel.end) + '.', 'ok');
        tl.sel = null;
        loadTimeline(); loadOverrides();
      } else {
        setTlMsg(data.reason || 'Failed', 'bad');
      }
    } catch(e){ setTlMsg('Network error', 'bad'); }
  };

  window.saveTimelineBlock = async function(){
    var dk = $('tlDate').value;
    if (!dk) { setTlMsg('Pick a date first.', 'bad'); return; }
    if (!tl.sel) { setTlMsg('Drag on the bar to select a range.', 'bad'); return; }
    var s = minToTime(tl.sel.start), e = minToTime(tl.sel.end);
    if (!confirm('Block ' + s + '–' + e + ' on ' + dk + '?\\n\\nAny existing bookings inside this range stay — use Reschedule on each card to shift them.')) return;
    setTlMsg('Saving…', '');
    try {
      var res = await fetch('/api/linda-blocks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: dk, startTime: s, endTime: e }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        var msg = 'Blocked ' + s + '–' + e + '.';
        if (data.affectedBookings) msg += ' ' + data.affectedBookings + ' existing booking' + (data.affectedBookings === 1 ? '' : 's') + ' inside the range — reschedule them.';
        setTlMsg(msg, 'ok');
        tl.sel = null;
        loadTimeline(); loadOverrides();
      } else {
        setTlMsg(data.reason || 'Failed', 'bad');
      }
    } catch(err){ setTlMsg('Network error', 'bad'); }
  };

  window.navTimelineDay = function(delta){
    var dk = $('tlDate').value || today();
    var d = parseKey(dk);
    d.setDate(d.getDate() + (delta|0));
    setHiddenDate('tlDate', toKey(d));
    loadTimeline();
  };
  window.goTimelineToday = function(){
    setHiddenDate('tlDate', today());
    loadTimeline();
  };

  window.blockTimelineDay = async function(){
    var dk = $('tlDate').value;
    if (!dk) { setTlMsg('Pick a date first.', 'bad'); return; }
    if (!confirm('Mark ' + dk + ' as a full day off?\\n\\nExisting bookings on this date stay — use Reschedule on each to shift them.')) return;
    setTlMsg('Saving…', '');
    try {
      var res = await fetch('/api/linda-off', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: dk, reason: '' }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (data.ok){
        setTlMsg('Blocked.' + (data.affectedBookings ? ' ' + data.affectedBookings + ' booking(s) still on this date — reschedule them.' : ''), 'ok');
        loadTimeline(); loadOff();
      } else {
        setTlMsg(data.reason || 'Failed', 'bad');
      }
    } catch(e){ setTlMsg('Network error', 'bad'); }
  };

  window.deleteOff = async function(id){
    if (!confirm('Restore this day — make it bookable again?')) return;
    try {
      var res = await fetch('/api/linda-off?id=' + id, { method: 'DELETE' });
      if (res.status === 403) { window.location.reload(); return; }
      loadOff();
    } catch(e){}
  };

  // Unified Active overrides — both extras (linda_extra) and partial blocks
  // (linda_block) shown in chronological order with a kind tag. Full days off
  // (linda_off) stay in their own card above; this list is just the in-day
  // overrides because that's what gets confused most easily.
  async function loadOverrides(){
    var el = $('overridesList');
    if (!el) return;
    el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div>';
    try {
      var [exRes, blRes] = await Promise.all([
        fetch('/api/linda-extras').then(function(r){ return r.json(); }),
        fetch('/api/linda-blocks').then(function(r){ return r.json(); }),
      ]);
      var extras = (exRes && exRes.ok && exRes.extras) ? exRes.extras : [];
      var blocks = (blRes && blRes.ok && blRes.blocks) ? blRes.blocks : [];
      var rows = [];
      for (var i = 0; i < extras.length; i++){
        var x = extras[i];
        rows.push({ kind: 'extra', id: x.id, date_key: x.date_key, start_time: x.start_time, end_time: x.end_time, reason: x.reason || '' });
      }
      for (var j = 0; j < blocks.length; j++){
        var b = blocks[j];
        rows.push({ kind: 'block', id: b.id, date_key: b.date_key, start_time: b.start_time, end_time: b.end_time, reason: b.reason || '' });
      }
      rows.sort(function(a, b){
        if (a.date_key !== b.date_key) return a.date_key < b.date_key ? -1 : 1;
        return a.start_time < b.start_time ? -1 : (a.start_time > b.start_time ? 1 : 0);
      });
      if (!rows.length){
        el.innerHTML = '<div class="empty" style="margin:0;border:none;padding:20px 0;">🌱 Nothing overriding the weekly schedule. Use the timeline above to add an extra slot or block a time.</div>';
        return;
      }
      var html = '';
      for (var k = 0; k < rows.length; k++){
        var r = rows[k];
        var isExtra = r.kind === 'extra';
        var tagLabel = isExtra ? 'Extra' : 'Block';
        html += '<div class="ovr-row" id="ovr-row-' + r.kind + '-' + r.id + '">';
        html +=   '<span class="ovr-tag ' + (isExtra ? 'extra' : 'block') + '">' + tagLabel + '</span>';
        html +=   '<div class="ovr-when">';
        html +=     '<div class="top">' + esc(formatNiceShort(r.date_key)) + ' · <span id="ovr-time-' + r.kind + '-' + r.id + '">' + esc(r.start_time) + '–' + esc(r.end_time) + '</span></div>';
        if (r.reason) html += '<div class="sub">' + esc(r.reason) + '</div>';
        if (isExtra){
          html += '<div class="extra-edit-panel" id="extra-edit-' + r.id + '" style="display:none;">';
          html +=   '<input type="time" step="1800" id="extra-s-' + r.id + '" value="' + esc(r.start_time) + '">';
          html +=   '<span>→</span>';
          html +=   '<input type="time" step="1800" id="extra-e-' + r.id + '" value="' + esc(r.end_time) + '">';
          html +=   '<button class="save" onclick="saveExtraEdit(' + r.id + ')">Save</button>';
          html +=   '<button class="cancel" onclick="toggleExtraEdit(' + r.id + ',false)">Cancel</button>';
          html += '</div>';
        }
        html +=   '</div>';
        html +=   '<div style="flex:0 0 auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">';
        if (isExtra) html += '<button class="extra-edit" onclick="toggleExtraEdit(' + r.id + ',true)">Edit</button>';
        if (isExtra){
          html += '<button class="extra-del" onclick="deleteExtra(' + r.id + ')">Remove</button>';
        } else {
          html += '<button class="extra-del" onclick="deleteBlock(' + r.id + ')">Remove</button>';
        }
        html +=   '</div>';
        html += '</div>';
      }
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="err" style="margin:0;">Network error.</div>';
    }
  }
  // Back-compat alias so any older code paths still work without renaming.
  function loadExtras(){ return loadOverrides(); }

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
      loadOverrides();
      loadTimeline();
    } catch(e){}
  };

  window.deleteBlock = async function(id){
    if (!confirm('Remove this block — re-open these hours for booking?')) return;
    try {
      var res = await fetch('/api/linda-blocks?id=' + id, { method: 'DELETE' });
      if (res.status === 403) { window.location.reload(); return; }
      loadOverrides();
      loadTimeline();
    } catch(e){}
  };

  // ── Patient history drawer ──
  window.closePatientHistory = function(){
    $('phOverlay').classList.remove('show');
    $('phSheet').classList.remove('show');
  };
  var phState = { appts: [] };
  window.editFromHistory = function(){
    var appts = phState.appts || [];
    if (!appts.length){ return; }
    var todayKey = today();
    var up = appts.filter(function(a){ return a.date_key >= todayKey && (!a.status || a.status.indexOf('CANCELLED') < 0); }).sort(function(a,b){ return a.date_key < b.date_key ? -1 : 1; });
    var a = up.length ? up[0] : appts[appts.length - 1];
    closePatientHistory();
    openEditSheet({ id: a.id, fullName: a.full_name, email: a.email, phone: a.phone, comments: a.comments || '', dateKey: a.date_key, startTime: a.start_time });
    $('editApply').checked = true; // from person-level history, default to fixing them everywhere
  };
  window.openPatientHistory = async function(patient){
    phState.appts = [];
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
      phState.appts = data.appointments || [];
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

  // ── Bulk bookings (paste a Date/Time/Name/Phone/Email table) ──
  var bulkRows = [];
  function bulkPDate(s){ s=(s||'').trim(); if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return s; var m=s.match(/^(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})$/); if(m){ var d=+m[1],mo=+m[2],y=+m[3]; if(y<100)y+=2000; if(mo>=1&&mo<=12&&d>=1&&d<=31) return y+'-'+pad(mo)+'-'+pad(d); } return null; }
  function bulkPTime(s){ s=(s||'').trim().toLowerCase().replace(/\\s+/g,''); var ap=null; var a=s.match(/(am|pm)$/); if(a){ap=a[1];s=s.replace(/(am|pm)$/,'');} var h,mi; var t=s.match(/^(\\d{1,2}):(\\d{2})$/); if(t){h=+t[1];mi=+t[2];} else { var t2=s.match(/^(\\d{1,2})$/); if(!t2) return null; h=+t2[1]; mi=0; } if(ap==='pm'&&h<12)h+=12; if(ap==='am'&&h===12)h=0; if(h>23||mi>59) return null; return pad(h)+':'+pad(mi); }
  window.bulkParse = function(){
    var lines = $('bulkText').value.split(/\\r?\\n/).filter(function(l){ return l.trim(); });
    bulkRows = lines.map(function(line){
      var cells = (line.indexOf('\t')>=0 ? line.split('\t') : line.split(',')).map(function(c){ return c.trim(); });
      var r = { dateKey: cells[0]||'', startTime: cells[1]||'', fullName: cells[2]||'', phone: cells[3]||'', email: cells[4]||'' };
      r._d = bulkPDate(r.dateKey); r._t = bulkPTime(r.startTime);
      r._ok = !!r._d && !!r._t && r.fullName.length>1 && (r.phone.length>=6 || r.email.indexOf('@')>0);
      return r;
    });
    var host = $('bulkPreview'), btn = $('bulkBtn');
    if (!bulkRows.length){ host.innerHTML=''; btn.disabled=true; btn.textContent='Book all'; return; }
    var valid = bulkRows.filter(function(r){ return r._ok; }).length;
    var body = bulkRows.map(function(r){
      return '<tr style="background:'+(r._ok?'#f0fdf4':'#fef2f2')+';">'
        + '<td style="padding:5px 6px;">'+(r._ok?'✓':'✕')+'</td>'
        + '<td style="padding:5px 6px;white-space:nowrap;">'+esc(r._d||r.dateKey||'—')+'</td>'
        + '<td style="padding:5px 6px;">'+esc(r._t||r.startTime||'—')+'</td>'
        + '<td style="padding:5px 6px;">'+esc(r.fullName||'—')+'</td></tr>';
    }).join('');
    host.innerHTML = '<div style="max-height:220px;overflow:auto;border:1px solid var(--line);border-radius:8px;"><table style="width:100%;border-collapse:collapse;font-size:13px;">'
      + '<thead><tr style="background:#f9fafb;text-align:left;color:var(--muted);"><th style="padding:6px;"></th><th style="padding:6px;">Date</th><th style="padding:6px;">Time</th><th style="padding:6px;">Name</th></tr></thead><tbody>'+body+'</tbody></table></div>'
      + '<p class="hint" style="margin-top:6px;">'+valid+' of '+bulkRows.length+' valid'+(valid<bulkRows.length?' — red rows skipped':'')+'.</p>';
    btn.disabled = valid===0;
    btn.textContent = valid ? ('Book '+valid+' booking'+(valid===1?'':'s')) : 'Nothing valid to book';
  };
  window.openBulkSheet = function(){ $('bulkText').value=''; $('bulkPreview').innerHTML=''; $('bulkMsg').textContent=''; $('bulkBtn').disabled=true; $('bulkBtn').textContent='Book all'; $('bulkOverlay').classList.add('show'); $('bulkSheet').classList.add('show'); };
  window.closeBulkSheet = function(){ $('bulkOverlay').classList.remove('show'); $('bulkSheet').classList.remove('show'); };
  window.bulkSubmit = async function(){
    var valid = bulkRows.filter(function(r){ return r._ok; });
    if (!valid.length) return;
    var btn = $('bulkBtn'); btn.disabled = true;
    var msg = $('bulkMsg'); msg.className = 'avail-msg'; msg.textContent = 'Booking ' + valid.length + '…';
    var rows = valid.map(function(r){ return { dateKey: r._d, startTime: r._t, fullName: r.fullName, phone: r.phone, email: r.email }; });
    try {
      var res = await (await fetch('/api/linda-bulk-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: rows }) })).json();
      if (res && res.ok){
        var failed = (res.results||[]).filter(function(x){ return !x.ok; });
        msg.className = 'avail-msg ' + (failed.length ? 'bad' : 'ok');
        msg.textContent = 'Created ' + res.created + ' of ' + res.total + '.' + (failed.length ? (' ' + failed.length + ' skipped.') : '');
        if (!failed.length) setTimeout(function(){ closeBulkSheet(); }, 1200); else btn.disabled = false;
      } else { msg.className='avail-msg bad'; msg.textContent = (res && res.reason) || 'Failed.'; btn.disabled = false; }
    } catch(e){ msg.className='avail-msg bad'; msg.textContent = 'Network error.'; btn.disabled = false; }
  };

  // ── Edit appointment / client details ──
  var editState = {};
  function setEditMsg(t, k){ var m = $('editMsg'); if (!m) return; m.textContent = t || ''; m.className = 'sheet-msg' + (k ? ' ' + k : ''); m.style.display = t ? 'block' : 'none'; }
  window.editApptFromEl = function(el){ openEditSheet(readJsonAttr(el, 'data-edit')); };
  var editSaveTimer = null, editSaving = false;
  function openEditSheet(d){
    editState = d || {};
    $('editWhen').textContent = d && d.dateKey ? (fmtDay(d.dateKey) + ' at ' + d.startTime) : '';
    $('editName').value = (d && d.fullName) || '';
    $('editPhone').value = (d && d.phone) || '';
    $('editEmail').value = (d && d.email) || '';
    $('editComments').value = (d && d.comments) || '';
    $('editApply').checked = false;
    if (editSaveTimer){ clearTimeout(editSaveTimer); editSaveTimer = null; }
    setEditMsg('', '');
    $('editOverlay').classList.add('show'); $('editSheet').classList.add('show');
  }
  window.closeEditSheet = function(){
    if (editSaveTimer){ clearTimeout(editSaveTimer); editSaveTimer = null; }
    $('editOverlay').classList.remove('show'); $('editSheet').classList.remove('show');
  };
  // Shared save core. quiet=true ⇒ auto-save (keep the sheet open, refresh the
  // day list silently, show a subtle "Saved" tick). quiet=false ⇒ the explicit
  // "Done" button (close the sheet after saving).
  async function doEditSave(quiet){
    var name = $('editName').value.trim(), phone = $('editPhone').value.trim(), email = $('editEmail').value.trim();
    if (!name || (!phone && !email)){ if (!quiet) setEditMsg('Name and phone or email required.', 'bad'); return false; }
    editSaving = true;
    setEditMsg('Saving…', '');
    try {
      var res = await (await fetch('/api/linda-edit-appointment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        appointmentId: editState.id, fullName: name, phone: phone, email: email,
        comments: $('editComments').value.trim(), applyToFuture: $('editApply').checked,
      }) })).json();
      editSaving = false;
      if (res && res.ok){
        // Keep local state in sync so a subsequent auto-save targets the same row.
        editState.fullName = name; editState.phone = phone; editState.email = email;
        if (quiet){ setEditMsg('Saved ✓', 'ok'); setDate(state.dateKey); }
        else { closeEditSheet(); setDate(state.dateKey); }
        return true;
      }
      setEditMsg((res && res.reason) || 'Failed.', 'bad');
    } catch(e){ editSaving = false; setEditMsg('Network error.', 'bad'); }
    return false;
  }
  // Debounced auto-save fired from field input; no button press needed.
  window.editAutosave = function(){
    if (editSaveTimer) clearTimeout(editSaveTimer);
    setEditMsg('Editing…', '');
    editSaveTimer = setTimeout(function(){ editSaveTimer = null; doEditSave(true); }, 700);
  };
  window.submitEdit = function(){
    if (editSaveTimer){ clearTimeout(editSaveTimer); editSaveTimer = null; }
    doEditSave(false);
  };

  window.openBookSheet = function(prefill){
    sheet.mode = 'new'; sheet.apptId = '';
    $('sheetTitle').textContent = 'Book appointment';
    $('sheetPatientSection').style.display = '';
    $('bfSubmit').textContent = 'Book';
    resetSheet();
    resetCustomTime(true);
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

  window.toggleCustomTime = function(){
    sheet.custom = $('bfCustomToggle').checked;
    $('bfSlots').style.display = sheet.custom ? 'none' : '';
    $('bfCustomWrap').style.display = sheet.custom ? 'block' : 'none';
    var op = $('bfOpenPrompt'); if (op && sheet.custom) op.style.display = 'none';
    sheet.slot = '';
    updateSheetSubmit();
  };
  function resetCustomTime(showToggle){
    sheet.custom = false;
    if ($('bfCustomToggle')) $('bfCustomToggle').checked = false;
    if ($('bfCustomTime')) $('bfCustomTime').value = '';
    $('bfSlots').style.display = '';
    $('bfCustomWrap').style.display = 'none';
    if ($('bfCustomLabel')) $('bfCustomLabel').style.display = showToggle ? 'flex' : 'none';
  }
  function updateSheetSubmit(){
    var dk = $('bfDate').value;
    var hasTime = sheet.custom ? !!$('bfCustomTime').value : !!sheet.slot;
    var hasPatient = sheet.mode === 'reschedule' || ($('bfName').value.trim() && ($('bfPhone').value.trim() || $('bfEmail').value.trim()));
    $('bfSubmit').disabled = !(dk && hasTime && hasPatient);
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
    resetCustomTime(false);
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
  window.rescheduleAllDay = function(){
    // Open the reusable calendar picker; on pick, ask for confirmation and
    // call the new /api/linda-reschedule-day endpoint.
    pickDate('rdTarget', function(targetDate){
      if (!targetDate) return;
      if (!confirm('Move every booking on ' + state.dateKey + ' to ' + targetDate + '?\\n\\nPatients will receive an email with the new date and time.')) return;
      doRescheduleDay(targetDate);
    });
  };
  // Hidden input + label/button stubs so pickDate has targets to update.
  (function ensureRdTargets(){
    ['rdTarget','rdTargetLabel','rdTargetBtn'].forEach(function(id){
      if ($(id)) return;
      var el = id === 'rdTarget' ? document.createElement('input') : document.createElement('span');
      if (id === 'rdTarget') el.type = 'hidden';
      el.id = id;
      if (id !== 'rdTarget') el.style.display = 'none';
      document.body.appendChild(el);
    });
  })();

  async function doRescheduleDay(targetDate){
    try {
      var res = await fetch('/api/linda-reschedule-day', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDateKey: state.dateKey, toDateKey: targetDate }),
      });
      if (res.status === 403) { window.location.reload(); return; }
      var data = await res.json();
      if (!data.ok) { alert(data.reason || 'Failed'); return; }
      var msg = 'Moved ' + data.moved + ' booking' + (data.moved === 1 ? '' : 's') + ' to ' + targetDate + '.';
      if (data.conflicts && data.conflicts.length){
        msg += '\\n\\nCould not move (you\\u2019ll need to handle these manually):';
        for (var i = 0; i < data.conflicts.length; i++){
          var c = data.conflicts[i];
          msg += '\\n\\u2022 ' + c.name + ' @ ' + c.startTime + ' \\u2014 ' + c.reason;
        }
      }
      alert(msg);
      load();
      if ($('pane-week').style.display !== 'none') loadWeek();
    } catch(e){ alert('Network error'); }
  }
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
  // ── Appointment card ⋮ overflow menu ──
  function closeApptMenus(){
    var open = document.querySelectorAll('.appt.menu-open');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('menu-open');
  }
  window.toggleApptMenu = function(btn){
    var card = btn.closest ? btn.closest('.appt') : null;
    if (!card) return;
    var wasOpen = card.classList.contains('menu-open');
    closeApptMenus();
    if (!wasOpen) card.classList.add('menu-open');
  };
  // Any click that isn't on a kebab closes open menus (menu-item clicks run
  // their own handler first, then fall through to here and close).
  document.addEventListener('click', function(e){
    var t = e.target;
    if (t && t.closest && t.closest('.ac-kebab')) return;
    closeApptMenus();
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeApptMenus(); });
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
    var startTime = sheet.custom ? $('bfCustomTime').value : sheet.slot;
    try {
      var endpoint = sheet.mode === 'reschedule' ? '/api/linda-reschedule' : '/api/linda-new-booking';
      var body = sheet.mode === 'reschedule'
        ? { appointmentId: sheet.apptId, dateKey: dk, startTime: startTime }
        : {
            dateKey: dk,
            startTime: startTime,
            customTime: !!sheet.custom,
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

  // Greedy interval-partitioning: within each cluster of transitively
  // overlapping appointments, place each in the first free column and record
  // how many columns the cluster needs, so the renderer can size them
  // side-by-side. Annotates each appt with _col (index) and _cols (count).
  function packWeekCols(list){
    if (!list || !list.length) return;
    var items = list.slice().sort(function(a,b){
      var d = timeToMin(a.start_time) - timeToMin(b.start_time);
      return d !== 0 ? d : (timeToMin(a.end_time) - timeToMin(b.end_time));
    });
    var i = 0;
    while (i < items.length){
      var cluster = [items[i]];
      var clusterEnd = Math.max(timeToMin(items[i].end_time), timeToMin(items[i].start_time) + 15);
      var j = i + 1;
      while (j < items.length && timeToMin(items[j].start_time) < clusterEnd){
        cluster.push(items[j]);
        clusterEnd = Math.max(clusterEnd, timeToMin(items[j].end_time), timeToMin(items[j].start_time) + 15);
        j++;
      }
      var colEnds = [];
      for (var c = 0; c < cluster.length; c++){
        var it = cluster[c];
        var s = timeToMin(it.start_time), e = Math.max(timeToMin(it.end_time), s + 15);
        var placed = -1;
        for (var col = 0; col < colEnds.length; col++){
          if (colEnds[col] <= s){ placed = col; colEnds[col] = e; break; }
        }
        if (placed < 0){ placed = colEnds.length; colEnds.push(e); }
        it._col = placed;
      }
      for (var c = 0; c < cluster.length; c++) cluster[c]._cols = colEnds.length;
      i = j;
    }
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
    // Assign side-by-side columns to overlapping appointments per day so that
    // concurrent / off-grid bookings (e.g. 17:00, 17:15, 17:30) all stay
    // visible instead of stacking on top of one another.
    for (var dkey in byDay){ if (byDay.hasOwnProperty(dkey)) packWeekCols(byDay[dkey].appts); }

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
          // Render every appointment whose start falls inside this half-hour
          // cell (not only exact :00/:30 starts), offset within the cell, and
          // lay overlapping bookings out in side-by-side columns.
          var col = byDay[dk].appts;
          for (var b = 0; b < col.length; b++){
            var a = col[b];
            var startMin = timeToMin(a.start_time);
            if (startMin < min || startMin >= min + 30) continue;
            var durMin = Math.max(timeToMin(a.end_time) - startMin, 15);
            var topPx = ((startMin - min) / 30) * WG_PX_PER_HALF + 1;
            var heightPx = (durMin / 30) * WG_PX_PER_HALF - 2;
            var cols = a._cols || 1, ci = a._col || 0;
            var widthPct = 100 / cols, leftPct = ci * widthPct;
            var bcls = 'wg-block';
            if (String(a.status).indexOf('CANCELLED') >= 0) bcls += ' cancelled';
            else if (a.status === 'ATTENDED') bcls += ' attended';
            else if (a.status === 'NO_SHOW') bcls += ' no_show';
            var stylePos = 'top:' + topPx + 'px;height:' + heightPx + 'px;left:calc(' + leftPct + '% + 1px);width:calc(' + widthPct + '% - 2px);right:auto;';
            html += '<div class="' + bcls + '" style="' + stylePos + '" onclick="event.stopPropagation();openWeekAppt(\\'' + esc(a.id) + '\\',\\'' + dk + '\\')">';
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
