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
  const reason = String(body.reason || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (dateKeyEnd && !/^\d{4}-\d{2}-\d{2}$/.test(dateKeyEnd)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return json({ ok: false, reason: 'Invalid time.' }, 400);
  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return json({ ok: false, reason: 'End time must be after start time.' }, 400);

  const endDate = dateKeyEnd && dateKeyEnd >= dateKey ? dateKeyEnd : dateKey;
  const now = nowIso(env.TIMEZONE);

  // Insert one row per day in the range.
  let count = 0;
  const [y0, m0, d0] = dateKey.split('-').map(Number);
  const [y1, m1, d1] = endDate.split('-').map(Number);
  const startD = new Date(y0, m0 - 1, d0);
  const endD = new Date(y1, m1 - 1, d1);
  for (let cur = new Date(startD); cur <= endD; cur.setDate(cur.getDate() + 1)) {
    const dk = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
    await env.DB.prepare(
      'INSERT INTO linda_extra (date_key, start_time, end_time, reason, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(dk, startTime, endTime, reason, now).run();
    count++;
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
    <input type="date" id="dateInput">
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
      <div class="avail-row"><label>From date</label><input type="date" id="avDateFrom"></div>
      <div class="avail-row"><label>To date</label><input type="date" id="avDateTo"></div>
      <div class="avail-row"><label>Start</label><input type="time" id="avStart" step="1800" value="09:00"></div>
      <div class="avail-row"><label>End</label><input type="time" id="avEnd" step="1800" value="13:00"></div>
      <button class="avail-save" onclick="saveAvail()">Open these hours</button>
      <div class="avail-msg" id="avMsg"></div>
    </div>

    <div class="avail-card">
      <h3>Upcoming extra hours</h3>
      <div id="extraList"><div class="empty" style="margin:0;border:none;padding:20px 0;">Loading…</div></div>
    </div>
  </div>
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

  $('dateInput').addEventListener('change', function(e){ setDate(e.target.value); });

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

  // Placeholder — wired in next commit.
  function loadExtras(){ $('extraList').innerHTML = '<div class="empty" style="margin:0;border:none;padding:20px 0;">Coming in next commit…</div>'; }
  window.saveAvail = function(){ alert('Wired in next commit'); };

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
