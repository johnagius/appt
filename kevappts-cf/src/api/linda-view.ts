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
import { sendAppointmentPushedEmail, sendLindaConfirmationEmail, sendDoctorBookingEmail } from '../services/email';

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
  return json({ ok: true, dateKey, todayKey });
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

  // Insert one row per range per day.
  let count = 0;
  const [y0, m0, d0] = dateKey.split('-').map(Number);
  const [y1, m1, d1] = endDate.split('-').map(Number);
  const startD = new Date(y0, m0 - 1, d0);
  const endD = new Date(y1, m1 - 1, d1);
  for (let cur = new Date(startD); cur <= endD; cur.setDate(cur.getDate() + 1)) {
    const dk = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
    for (const r of ranges) {
      await env.DB.prepare(
        'INSERT INTO linda_extra (date_key, start_time, end_time, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(dk, r.start, r.end, reason, now).run();
      count++;
    }
  }

  await bumpVersion(env.DB);
  return json({ ok: true, added: count });
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
  if (!slotFound) return json({ ok: false, reason: 'That slot is not in Linda\u2019s hours for this date.' }, 400);

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
  if (!slotFound) return json({ ok: false, reason: 'Not a valid slot for this date. Open availability first.' }, 400);

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
  :root{--accent:#10b981;--text:#111827;--muted:#6b7280;--line:#e5e7eb;--bg:#f6f7fb;--bad:#ef4444;}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.4;-webkit-font-smoothing:antialiased;}
  .topbar{position:sticky;top:0;background:#fff;border-bottom:1px solid var(--line);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;z-index:5;}
  .topbar h1{margin:0;font-size:17px;font-weight:900;}
  .liveDot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#9ca3af;margin-left:6px;vertical-align:middle;}
  .liveDot.on{background:#10b981;box-shadow:0 0 6px #10b981;}
  .logout{background:none;border:none;color:#ef4444;font-size:13px;cursor:pointer;padding:4px 8px;font-weight:700;}

  .dateBar{background:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);position:sticky;top:41px;z-index:4;}
  .dateBar button.nav{flex:0 0 auto;min-width:44px;height:44px;border:1px solid var(--line);background:#fff;border-radius:10px;font-size:20px;font-weight:800;cursor:pointer;color:var(--text);}
  .dateBar button.nav:active{background:#f3f4f6;}
  .dateBar input[type=date]{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:16px;font-family:inherit;background:#fff;min-height:44px;}
  .dateBar .today-btn{flex:0 0 auto;height:44px;padding:0 12px;border:1px solid var(--accent);background:#ecfdf5;color:#065f46;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;}

  .dayLabel{padding:10px 14px 4px;font-size:14px;color:var(--muted);font-weight:700;}
  .summary{padding:0 14px 10px;font-size:13px;color:var(--muted);}

  .list{padding:0 12px 80px;}
  .appt{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.03);}
  .appt-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;}
  .appt-time{font-weight:900;font-size:17px;color:var(--text);}
  .appt-status{font-size:11px;font-weight:800;text-transform:uppercase;padding:3px 8px;border-radius:999px;letter-spacing:.4px;}
  .status-BOOKED{background:#ecfdf5;color:#065f46;}
  .status-ATTENDED{background:#e0e7ff;color:#3730a3;}
  .status-NO_SHOW{background:#fff7ed;color:#9a3412;}
  .status-CANCELLED{background:#fef2f2;color:#991b1b;text-decoration:line-through;}
  .appt-name{font-size:16px;font-weight:700;margin:0 0 6px 0;}
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

  .empty{padding:30px 20px;text-align:center;color:var(--muted);font-size:15px;background:#fff;border-radius:14px;margin:0 12px;border:1px dashed var(--line);}
  .emptyEmoji{font-size:40px;margin-bottom:8px;}
  .err{padding:14px;margin:10px 12px;background:#fef2f2;color:#991b1b;border-radius:10px;font-size:14px;}

  /* Tabs */
  .tabBar{display:flex;gap:4px;padding:6px;background:#fff;border-bottom:1px solid var(--line);position:sticky;top:41px;z-index:4;}
  .tabBtn{flex:1 1 0;padding:12px 8px;background:#f3f4f6;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;color:var(--muted);min-height:44px;}
  .tabBtn.active{background:var(--accent);color:#fff;}

  /* Availability tab */
  .avail-wrap{padding:12px;padding-bottom:80px;}
  .avail-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px;}
  .avail-card h3{margin:0 0 8px 0;font-size:15px;font-weight:900;}
  .avail-card .hint{margin:0 0 12px 0;font-size:13px;color:var(--muted);line-height:1.5;}
  .avail-row{display:flex;gap:8px;align-items:center;margin-bottom:8px;}
  .avail-row label{flex:0 0 80px;font-size:13px;color:var(--muted);font-weight:700;}
  .avail-row input{flex:1 1 auto;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:15px;min-height:44px;background:#fff;color:var(--text);}
  .avail-save{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:999px;font-size:15px;font-weight:800;cursor:pointer;min-height:48px;margin-top:6px;}
  .avail-save:active{background:#059669;}
  .extra-row{display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f9fafb;border-radius:10px;margin-bottom:8px;gap:10px;}
  .extra-when{font-size:14px;font-weight:700;}
  .extra-dim{font-size:12px;color:var(--muted);margin-top:2px;}
  .extra-del{background:#fef2f2;color:#991b1b;border:none;padding:10px 14px;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;min-height:40px;}
  .extra-del:active{background:#fee2e2;}
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

  /* FAB */
  .fab{position:fixed;right:16px;bottom:16px;background:var(--accent);color:#fff;border:none;border-radius:999px;padding:14px 20px;font-size:15px;font-weight:800;box-shadow:0 6px 20px rgba(16,185,129,0.4);cursor:pointer;z-index:20;min-height:52px;}
  .fab:active{background:#059669;}

  /* Modal / sheet */
  .sheet-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.6);display:none;z-index:60;}
  .sheet-overlay.show{display:block;}
  .sheet{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:18px 18px 0 0;max-height:92vh;overflow-y:auto;padding:16px 14px 24px;z-index:61;transform:translateY(100%);transition:transform .25s ease;box-shadow:0 -8px 30px rgba(0,0,0,0.2);}
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
  .slot-btn.chosen{background:var(--accent);color:#fff;border-color:var(--accent);}
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

  /* Inline calendar (replaces ugly dd/mm/yyyy native input) */
  .date-btn{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--text);font-size:15px;font-family:inherit;text-align:left;min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;}
  .date-btn:active{background:#f3f4f6;}
  .date-btn .date-icon{font-size:17px;}
  .date-btn .date-val{flex:1 1 auto;font-weight:600;}
  .date-btn.empty .date-val{color:var(--muted);font-weight:400;}
  .cal-sheet{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:18px 18px 0 0;padding:14px 12px 20px;z-index:71;transform:translateY(100%);transition:transform .25s ease;box-shadow:0 -8px 30px rgba(0,0,0,0.2);max-height:92vh;overflow-y:auto;}
  .cal-sheet.show{transform:translateY(0);}
  .cal-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.6);display:none;z-index:70;}
  .cal-overlay.show{display:block;}
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
  .cal-cell.sel{background:var(--accent);color:#fff;}
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
  .idle-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.92);color:#fff;display:none;align-items:center;justify-content:center;flex-direction:column;z-index:50;padding:20px;text-align:center;cursor:pointer;}
  .idle-overlay.show{display:flex;}
  .idle-emoji{font-size:80px;margin-bottom:14px;}
  .idle-title{font-size:22px;font-weight:800;margin-bottom:10px;}
  .idle-sub{font-size:14px;color:#9ca3af;margin-bottom:18px;max-width:280px;}
  .idle-cta{background:var(--accent);color:#fff;padding:14px 28px;border-radius:999px;font-weight:800;font-size:16px;}

  /* Live toast for incoming bookings */
  .live-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(100px);background:#10b981;color:#fff;padding:12px 20px;border-radius:999px;font-weight:800;font-size:14px;box-shadow:0 6px 20px rgba(16,185,129,0.4);transition:transform .3s ease;z-index:40;}
  .live-toast.show{transform:translateX(-50%) translateY(0);}

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
  <button class="tabBtn active" id="tabDayBtn" onclick="setTab('day')">📅 My Day</button>
  <button class="tabBtn" id="tabAvailBtn" onclick="setTab('avail')">🗓 Availability</button>
</div>

<div id="pane-day">
  <div class="dateBar">
    <button class="nav" onclick="navDay(-1)" aria-label="Previous day">&#x25C0;</button>
    <button type="button" class="date-btn" id="dateInputBtn" onclick="pickDate('dateInput', function(dk){ setDate(dk); })" style="flex:1 1 auto;"><span class="date-icon">📅</span><span class="date-val" id="dateInputLabel">Today</span></button>
    <input type="hidden" id="dateInput">
    <button class="nav" onclick="navDay(1)" aria-label="Next day">&#x25B6;</button>
    <button class="today-btn" onclick="goToday()">Today</button>
  </div>
  <div class="dayLabel" id="dayLabel"></div>
  <div class="summary" id="summary"></div>
  <div class="list" id="list"><div class="empty">Loading…</div></div>
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
      <div class="avail-row"><label>Start</label><input type="time" id="avEveningStart" step="1800" placeholder="e.g. 16:00"></div>
      <div class="avail-row"><label>End</label><input type="time" id="avEveningEnd" step="1800" placeholder="e.g. 18:30"></div>
      <button class="avail-save" onclick="saveAvail()">Open these hours</button>
      <div class="avail-msg" id="avMsg"></div>
    </div>

    <div class="avail-card">
      <h3>Upcoming extra hours</h3>
      <div id="extraList"><div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div></div>
    </div>
  </div>
</div>

<button class="fab" id="fabBook" onclick="openBookSheet()">+ Book</button>

<div class="sheet-overlay" id="sheetOverlay" onclick="closeSheet()"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true">
  <div class="sheet-head">
    <h3 class="sheet-title" id="sheetTitle">Book appointment</h3>
    <button class="sheet-close" onclick="closeSheet()" aria-label="Close">×</button>
  </div>

  <div class="sheet-section" id="sheetPatientSection">
    <div class="sheet-label">Patient</div>
    <input class="sheet-input" id="bfName" placeholder="Full name" style="margin-bottom:8px;">
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
        <input class="sheet-input" type="time" id="bfOpenEveningStart" step="1800" placeholder="16:00">
        <input class="sheet-input" type="time" id="bfOpenEveningEnd" step="1800" placeholder="18:30">
      </div>
      <button onclick="quickOpenDate()" style="margin-top:10px;">Open this day</button>
    </div>
  </div>

  <button class="sheet-submit" id="bfSubmit" onclick="submitSheet()" disabled>Book</button>
  <div id="bfMsg"></div>
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
  var IDLE_MS = 120000; // 2 min
  var state = { dateKey: '', idle: false };
  var idleTimer = null;

  function $(id){ return document.getElementById(id); }

  function pad(n){ return String(n).padStart(2,'0'); }
  function today(){
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }
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
  function statusLabel(s){
    if (!s) return 'Booked';
    if (s.indexOf('CANCELLED') >= 0) return 'Cancelled';
    if (s === 'ATTENDED') return 'Attended';
    if (s === 'NO_SHOW') return 'No-show';
    return 'Booked';
  }

  function renderAppts(list){
    var el = $('list');
    $('summary').textContent = list.length + ' appointment' + (list.length === 1 ? '' : 's');
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
      html +=   '<div class="appt-name">' + esc(a.full_name || 'No name') + '</div>';
      if (a.service_name) html += '<div style="font-size:13px;color:var(--muted);">' + esc(a.service_name) + '</div>';
      html +=   '<div class="contact-row">';
      if (tel) html += '<a class="contact-btn call" href="tel:' + esc(tel) + '"><span class="icon">📞</span><span class="val">' + esc(a.phone) + '</span></a>';
      if (email) html += '<a class="contact-btn email" href="mailto:' + esc(email) + '"><span class="icon">✉️</span><span class="val">' + esc(email) + '</span></a>';
      html +=   '</div>';
      if (a.comments && a.comments.trim()){
        html += '<div class="comments"><div class="comments-label">Note from patient</div>' + esc(a.comments) + '</div>';
      }
      if (!a.status || a.status.indexOf('CANCELLED') < 0){
        var payload = JSON.stringify({ id: a.id, fullName: a.full_name, email: a.email, phone: a.phone, comments: a.comments || '' }).replace(/'/g, '&#39;');
        html += '<div class="action-row">';
        html +=   '<button class="action-btn reschedule" onclick="openReschedule(\\'' + esc(a.id) + '\\')">Reschedule</button>';
        html +=   "<button class=\\"action-btn next-session\\" onclick='openScheduleNext(" + payload + ")'>Schedule Next Session</button>";
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

  window.logout = function(){
    document.cookie = 'linda_sig=; Path=/; Max-Age=0';
    window.location.href = '/linda';
  };

  // ── Tab switching ──
  window.setTab = function(which){
    var isDay = which === 'day';
    $('pane-day').style.display = isDay ? '' : 'none';
    $('pane-avail').style.display = isDay ? 'none' : '';
    $('tabDayBtn').classList.toggle('active', isDay);
    $('tabAvailBtn').classList.toggle('active', !isDay);
    if (!isDay) { loadExtras(); }
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
        html += '<div class="extra-row">';
        html +=   '<div>';
        html +=     '<div class="extra-when">' + esc(formatNiceShort(x.date_key)) + ' · ' + esc(x.start_time) + '–' + esc(x.end_time) + '</div>';
        if (x.reason) html += '<div class="extra-dim">' + esc(x.reason) + '</div>';
        html +=   '</div>';
        html +=   '<button class="extra-del" onclick="deleteExtra(' + x.id + ')">Remove</button>';
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

  window.deleteExtra = async function(id){
    if (!confirm('Remove this extra availability?')) return;
    try {
      var res = await fetch('/api/linda-extras?id=' + id, { method: 'DELETE' });
      if (res.status === 403) { window.location.reload(); return; }
      loadExtras();
    } catch(e){}
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

  function renderCalGrid(){
    $('calTitle').textContent = MONTH_NAMES[cal.month] + ' ' + cal.year;
    var first = new Date(cal.year, cal.month, 1);
    // Convert JS Sunday-first (0=Sun) to Mon-first index.
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();
    var daysInPrev = new Date(cal.year, cal.month, 0).getDate();
    var todayK = today();
    var selK = cal.targetHidden ? $(cal.targetHidden).value : '';
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
      html += '<button class="' + classes + '" onclick="calPick(\\'' + dk + '\\')">' + d + '</button>';
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
          setDate(dk);
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

  // ── Idle overlay: hides content + stops network after 2 min inactivity ──
  function resetIdle(){
    if (state.idle){
      state.idle = false;
      $('idleOverlay').classList.remove('show');
      load();
      connectWS();
    }
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){
      state.idle = true;
      $('idleOverlay').classList.add('show');
      if (_ws) { try { _ws.close(); } catch(e) {} _ws = null; }
    }, IDLE_MS);
  }
  ['touchstart','mousedown','keydown','scroll','visibilitychange'].forEach(function(ev){
    document.addEventListener(ev, resetIdle, { passive: true });
  });
  $('idleOverlay').addEventListener('click', resetIdle);

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
          // Only refresh if the update is for the day we're viewing (or unknown)
          if (!msg.dateKey || msg.dateKey === state.dateKey){
            showToast();
            load();
          }
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
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && !state.idle && (!_ws || _ws.readyState !== 1)){
      _wsDelay = 1000;
      connectWS();
    }
  });

  // Initial — land on today if she has appointments today, otherwise on the
  // next upcoming day that has a booking, so she doesn't have to flip through
  // empty days.
  async function initialLand(){
    try {
      var r = await fetch('/api/linda-next-day');
      if (r.status === 403) { window.location.reload(); return; }
      var d = await r.json();
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
