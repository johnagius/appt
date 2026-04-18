/**
 * Physiotherapy (Linda) public APIs — clinic='linda'.
 *
 * Deliberately parallel to public.ts so nothing in Kevin's or Spinola's paths
 * can be affected. Slot isolation is via getTakenSlots(..., 'linda').
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
  LINDA_SLOT_MIN, buildLindaDateOptions, buildLindaSlots, isInLindaWindow,
} from '../services/linda';

// ─── Init ──────────────────────────────────────────────────

export async function apiPhysioInit(env: Env): Promise<Response> {
  const tz = env.TIMEZONE;
  const dateOptions = buildLindaDateOptions(tz);
  const firstDateKey = dateOptions.find(d => !d.disabled)?.dateKey ?? null;
  const initialSlots = firstDateKey ? await buildLindaAvailability(firstDateKey, env) : null;

  return json({
    config: {
      doctorName: env.LINDA_DOCTOR_NAME || 'Linda',
      location: env.LINDA_LOCATION || "Potter's Clinic",
      apptMinutes: LINDA_SLOT_MIN,
      service: { id: 'physio', name: 'Physiotherapy Consultation', minutes: LINDA_SLOT_MIN },
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
  return json(await buildLindaAvailability(dateKey, env));
}

async function buildLindaAvailability(dateKey: string, env: Env) {
  const tz = env.TIMEZONE;
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);

  if (!isInLindaWindow(dateKey)) {
    return { ok: false, reason: 'Outside booking window', dateKey, slots: [] };
  }
  if (dateKey < todayKey) {
    return { ok: false, reason: 'Date is in the past', dateKey, slots: [] };
  }

  const baseSlots = buildLindaSlots(dateKey);
  if (!baseSlots.length) return { ok: false, reason: 'Closed', dateKey, slots: [] };

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

  const dateKey = (payload.dateKey || '').trim();
  const startTime = (payload.startTime || '').trim();
  const fullName = sanitizeName(payload.fullName);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizePhone(payload.phone);
  const comments = (payload.comments || '').trim();

  if (!dateKey || !startTime || !fullName || !email || !phone) {
    return json({ ok: false, reason: 'Missing required fields' }, 400);
  }

  if (!isInLindaWindow(dateKey)) {
    return json({ ok: false, reason: "Outside Linda's booking window (24 April – 7 May 2026)." }, 400);
  }

  const todayKey = todayKeyLocal(tz);
  if (dateKey < todayKey) return json({ ok: false, reason: 'You cannot book a past date.' }, 400);

  // Validate slot against Linda's hours
  const slots = buildLindaSlots(dateKey);
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

  await insertAppointment(env.DB, appt);
  await bumpVersion(env.DB);

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
        // Doctor notification reused — gives Kevin visibility of Linda bookings too.
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
