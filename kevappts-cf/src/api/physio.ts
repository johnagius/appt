/**
 * Physiotherapy (Linda) public APIs — clinic='linda'.
 *
 * Deliberately parallel to public.ts so nothing in Kevin's or Spinola's paths
 * can be affected. Slot isolation is via getTakenSlots(..., 'linda').
 * Config (enabled/window/hours/slot-min) is loaded from the `config` table
 * so the admin panel can edit it without a deploy.
 */
import type { Env, Appointment, BookingPayload } from '../types';
import {
  nowIso, nowMinutesLocal, parseTimeToMinutes, sanitizeEmail, sanitizeName,
  sanitizePhone, toDateKey, todayKeyLocal, todayLocal,
} from '../services/utils';
import {
  bumpVersion, getActiveAppointmentsByDate, getOrCreateClient, getTakenSlots,
  insertAppointment, isSlotTaken, personAlreadyBookedSameSlot,
} from '../db/queries';
import { generateId } from '../services/crypto';
import { sendDoctorBookingEmail, sendLindaConfirmationEmail } from '../services/email';
import { createCalendarEvent } from '../services/calendar';
import {
  buildLindaDateOptions, buildLindaSlots, getLindaExtrasForDate, isInLindaWindow, isLindaDayOff, loadLindaConfig,
  type LindaConfig,
} from '../services/linda';

// ─── Init ──────────────────────────────────────────────────

export async function apiPhysioInit(env: Env): Promise<Response> {
  const tz = env.TIMEZONE;
  const cfg = await loadLindaConfig(env.DB);

  if (!cfg.enabled) {
    return json({
      ok: true,
      config: {
        enabled: false,
        doctorName: env.LINDA_DOCTOR_NAME || 'Linda',
        location: env.LINDA_LOCATION || "Potter's Clinic",
      },
      dateOptions: [],
      initialSlots: null,
    });
  }

  const dateOptions = buildLindaDateOptions(tz, cfg);
  const firstDateKey = dateOptions.find(d => !d.disabled)?.dateKey ?? null;
  const initialSlots = firstDateKey ? await buildLindaAvailability(firstDateKey, env, cfg) : null;

  return json({
    ok: true,
    config: {
      enabled: true,
      doctorName: env.LINDA_DOCTOR_NAME || 'Linda',
      location: env.LINDA_LOCATION || "Potter's Clinic",
      apptMinutes: cfg.slotMin,
      service: { id: 'physio', name: 'Physiotherapy Consultation', minutes: cfg.slotMin },
      windowStart: cfg.windowStart,
      windowEnd: cfg.windowEnd,
      timezone: tz,
    },
    dateOptions,
    initialSlots,
  });
}

// ─── Availability ──────────────────────────────────────────

export async function apiPhysioAvailability(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const dateKey = url.searchParams.get('date') || '';
  if (!dateKey) return json({ ok: false, reason: 'Missing date' }, 400);
  const cfg = await loadLindaConfig(env.DB);
  if (!cfg.enabled) return json({ ok: false, reason: 'Physiotherapy bookings are not currently open.', dateKey, slots: [] });
  return json(await buildLindaAvailability(dateKey, env, cfg));
}

async function buildLindaAvailability(dateKey: string, env: Env, cfg: LindaConfig) {
  const tz = env.TIMEZONE;
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);

  if (!isInLindaWindow(dateKey, cfg)) {
    return { ok: false, reason: 'Outside booking window', dateKey, slots: [] };
  }
  if (dateKey < todayKey) {
    return { ok: false, reason: 'Date is in the past', dateKey, slots: [] };
  }

  const extras = await getLindaExtrasForDate(env.DB, dateKey);
  const off = await isLindaDayOff(env.DB, dateKey);
  const baseSlots = buildLindaSlots(dateKey, cfg, extras, off);
  if (!baseSlots.length) return { ok: false, reason: off ? 'Day off' : 'Closed', dateKey, slots: [] };

  const taken = await getTakenSlots(env.DB, dateKey, 'linda');
  const nowMin = nowMinutesLocal(tz);

  const outSlots = baseSlots.map(slot => {
    const startMin = parseTimeToMinutes(slot.start);
    const past = dateKey === todayKey ? startMin < nowMin : false;
    const isTaken = taken.has(slot.start);
    return { start: slot.start, end: slot.end, available: !past && !isTaken };
  });

  return { ok: true, dateKey, slots: outSlots };
}

// ─── Book ──────────────────────────────────────────────────

export async function apiPhysioBook(req: Request, env: Env): Promise<Response> {
  const payload: BookingPayload = await req.json();
  const tz = env.TIMEZONE;

  const cfg = await loadLindaConfig(env.DB);
  if (!cfg.enabled) return json({ ok: false, reason: 'Physiotherapy bookings are not currently open.' }, 400);

  const dateKey = (payload.dateKey || '').trim();
  const startTime = (payload.startTime || '').trim();
  const fullName = sanitizeName(payload.fullName);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizePhone(payload.phone);
  const comments = (payload.comments || '').trim();

  if (!dateKey || !startTime || !fullName || !email || !phone) {
    return json({ ok: false, reason: 'Missing required fields' }, 400);
  }

  if (!isInLindaWindow(dateKey, cfg)) {
    return json({ ok: false, reason: `Outside Linda's booking window (${cfg.windowStart} – ${cfg.windowEnd}).` }, 400);
  }

  const todayKey = todayKeyLocal(tz);
  if (dateKey < todayKey) return json({ ok: false, reason: 'You cannot book a past date.' }, 400);

  // Validate slot against Linda's hours (including ad-hoc extras + day-off check)
  const extras = await getLindaExtrasForDate(env.DB, dateKey);
  const off = await isLindaDayOff(env.DB, dateKey);
  if (off) return json({ ok: false, reason: "Linda isn’t working that day." }, 400);
  const slots = buildLindaSlots(dateKey, cfg, extras, false);
  const slotFound = slots.find(s => s.start === startTime);
  if (!slotFound) return json({ ok: false, reason: 'Invalid slot' }, 400);

  // Past-time guard for today
  if (dateKey === todayKey) {
    const nowMin = nowMinutesLocal(tz);
    if (parseTimeToMinutes(startTime) < nowMin) {
      return json({ ok: false, reason: 'That time is already in the past. Please choose a later slot.' }, 400);
    }
  }

  // Duplicate + slot-taken (strictly scoped to clinic='linda')
  if (await personAlreadyBookedSameSlot(env.DB, dateKey, startTime, email, phone)) {
    return json({ ok: false, reason: 'You already booked this exact time slot.' }, 400);
  }
  if (await isSlotTaken(env.DB, dateKey, startTime, 'linda')) {
    return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 400);
  }

  const now = nowIso(tz);
  await getOrCreateClient(env.DB, fullName, email, phone, now);

  const appt: Appointment = {
    id: 'A-' + generateId(),
    date_key: dateKey,
    start_time: startTime,
    end_time: slotFound.end,
    service_id: 'physio',
    service_name: 'Physiotherapy Consultation',
    full_name: fullName,
    email,
    phone,
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
    booking_source: 'physio',
  };

  try {
    await insertAppointment(env.DB, appt);
  } catch (e: any) {
    if (String(e?.message || '').toLowerCase().includes('unique')) {
      return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 409);
    }
    throw e;
  }
  await bumpVersion(env.DB);

  // Broadcast so Linda's /linda page and admin panels refresh immediately.
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'linda' }),
    });
  } catch (e) { console.error('Linda broadcast error:', e); }

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        const eventId = await createCalendarEvent(env, appt);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, appt.id).run();
        }
      } catch (e) { console.error('Linda calendar create error:', e); }

      try {
        await sendLindaConfirmationEmail(env, appt);
        const dayList = await getActiveAppointmentsByDate(env.DB, dateKey);
        await sendDoctorBookingEmail(env, appt, dayList);
      } catch (e) { console.error('Linda email send error:', e); }
    })());
  }

  return json({
    ok: true,
    appointmentId: appt.id,
    dateKey,
    startTime: appt.start_time,
    endTime: appt.end_time,
    serviceName: appt.service_name,
    location: appt.location,
    redirectUrl: '/',
  });
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
