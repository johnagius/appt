/**
 * Blood Tests public APIs — clinic='potters', service_id='blood-test'.
 *
 * Stored in the main `appointments` table so cancel/reschedule/review flows
 * are reused. Independent of Dr Kevin: the admin doctor-off filter excludes
 * service_id='blood-test' and the doctor's taken-slot query is service-aware
 * (see queries.ts), so a blood test and a doctor visit at the same time
 * coexist without interfering.
 */
import type { Env, Appointment, BookingPayload } from '../types';
import {
  nowIso, nowMinutesLocal, parseTimeToMinutes, sanitizeEmail, sanitizeName,
  sanitizePhone, toDateKey, todayKeyLocal, todayLocal,
} from '../services/utils';
import {
  bumpVersion, getActiveAppointmentsByDate, getConfig, getOrCreateClient, getTakenSlots,
  insertAppointment, isSlotTaken, personAlreadyBookedSameSlot,
} from '../db/queries';
import { generateId } from '../services/crypto';
import { sendClientConfirmationEmail, sendDoctorBookingEmail } from '../services/email';
import { createCalendarEvent } from '../services/calendar';
import {
  buildBloodTestDateOptions, buildBloodTestSlots, isBloodTestDayOff,
  loadBloodTestConfig, type BloodTestConfig,
} from '../services/blood-test';
import { buildLabTestDescriptor } from '../services/lab-test';

const BLOOD_TEST_SERVICE_ID = 'blood-test';
const BLOOD_TEST_SERVICE_NAME = 'Blood Test';

/** Resolve the clinic + display location for lab tests from the toggle. */
async function resolveLabLocation(env: Env, cfg: BloodTestConfig): Promise<{ clinic: 'potters' | 'spinola'; location: string }> {
  const clinic = cfg.location === 'potters' ? 'potters' : 'spinola';
  const appCfg = await getConfig(env.DB);
  const location = clinic === 'potters'
    ? (appCfg.pottersLocation || env.CLINIC_NAME || "Potter's Pharmacy Clinic")
    : (appCfg.spinolaLocation || 'Spinola Clinic');
  return { clinic, location };
}

// ─── Init ──────────────────────────────────────────────────

export async function apiBloodTestInit(env: Env): Promise<Response> {
  const tz = env.TIMEZONE;
  const cfg = await loadBloodTestConfig(env.DB);
  const { clinic, location } = await resolveLabLocation(env, cfg);

  if (!cfg.enabled) {
    return json({
      ok: true,
      config: { enabled: false, location, clinic },
      dateOptions: [],
      initialSlots: null,
    });
  }

  const dateOptions = buildBloodTestDateOptions(tz, cfg);
  const firstDateKey = dateOptions.find(d => !d.disabled)?.dateKey ?? null;
  const initialSlots = firstDateKey ? await buildAvailability(firstDateKey, env, cfg) : null;

  return json({
    ok: true,
    config: {
      enabled: true,
      location,
      clinic,
      apptMinutes: cfg.slotMin,
      priceCents: cfg.priceCents,
      priceLabel: cfg.priceCents > 0 ? '€' + (cfg.priceCents / 100).toFixed(2) : '',
      types: cfg.types,
      timezone: tz,
    },
    dateOptions,
    initialSlots,
  });
}

// ─── Availability ──────────────────────────────────────────

export async function apiBloodTestAvailability(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const dateKey = url.searchParams.get('date') || '';
  if (!dateKey) return json({ ok: false, reason: 'Missing date' }, 400);
  const cfg = await loadBloodTestConfig(env.DB);
  if (!cfg.enabled) return json({ ok: false, reason: 'Blood test bookings are not currently open.', dateKey, slots: [] });
  return json(await buildAvailability(dateKey, env, cfg));
}

async function buildAvailability(dateKey: string, env: Env, cfg: BloodTestConfig) {
  const tz = env.TIMEZONE;
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  if (dateKey < todayKey) {
    return { ok: false, reason: 'Date is in the past', dateKey, slots: [] };
  }

  const off = await isBloodTestDayOff(env.DB, dateKey);
  const baseSlots = buildBloodTestSlots(dateKey, cfg, off);
  if (!baseSlots.length) return { ok: false, reason: off ? 'Closed for the day' : 'Closed', dateKey, slots: [] };

  // Taken-slot query is scoped to service_id='blood-test' so a doctor
  // appointment at the same time does NOT block the lab-test slot. Use the
  // configured host clinic (Spinola or Potter's) so the slot pool matches
  // where the tests are actually held.
  const clinic = cfg.location === 'potters' ? 'potters' : 'spinola';
  const taken = await getTakenSlots(env.DB, dateKey, clinic, BLOOD_TEST_SERVICE_ID);
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

export async function apiBloodTestBook(req: Request, env: Env): Promise<Response> {
  const payload: BookingPayload & { testType?: string } = await req.json();
  const tz = env.TIMEZONE;

  const cfg = await loadBloodTestConfig(env.DB);
  if (!cfg.enabled) return json({ ok: false, reason: 'Blood test bookings are not currently open.' }, 400);

  const { clinic, location } = await resolveLabLocation(env, cfg);

  const dateKey = (payload.dateKey || '').trim();
  const startTime = (payload.startTime || '').trim();
  const fullName = sanitizeName(payload.fullName);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizePhone(payload.phone);
  const userComments = (payload.comments || '').trim();
  const testType = (payload.testType || '').trim().slice(0, 120);
  // The new wizard sends a structured selection (category + tests/addons/package);
  // the legacy /blood-tests page sends only testType. Either is accepted.
  const labInfo = buildLabTestDescriptor(payload as any);

  if (!dateKey || !startTime || !fullName || !email || !phone) {
    return json({ ok: false, reason: 'Missing required fields' }, 400);
  }

  const todayKey = todayKeyLocal(tz);
  if (dateKey < todayKey) return json({ ok: false, reason: 'You cannot book a past date.' }, 400);

  const off = await isBloodTestDayOff(env.DB, dateKey);
  if (off) return json({ ok: false, reason: 'Blood tests are not available on that day.' }, 400);

  const slots = buildBloodTestSlots(dateKey, cfg, false);
  const slotFound = slots.find(s => s.start === startTime);
  if (!slotFound) return json({ ok: false, reason: 'Invalid slot' }, 400);

  if (dateKey === todayKey) {
    const nowMin = nowMinutesLocal(tz);
    if (parseTimeToMinutes(startTime) < nowMin) {
      return json({ ok: false, reason: 'That time is already in the past. Please choose a later slot.' }, 400);
    }
  }

  if (await personAlreadyBookedSameSlot(env.DB, dateKey, startTime, email, phone)) {
    return json({ ok: false, reason: 'You already booked this exact time slot.' }, 400);
  }
  if (await isSlotTaken(env.DB, dateKey, startTime, clinic, BLOOD_TEST_SERVICE_ID)) {
    return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 400);
  }

  const now = nowIso(tz);
  await getOrCreateClient(env.DB, fullName, email, phone, now);

  // The wizard's structured selection wins; otherwise fall back to the legacy
  // single test-type label. Details go into comments so they show on the
  // confirmation / admin / calendar without a new column.
  const serviceName = labInfo
    ? labInfo.serviceName
    : (testType ? `${BLOOD_TEST_SERVICE_NAME} — ${testType}` : BLOOD_TEST_SERVICE_NAME);
  const bookingSource = labInfo ? labInfo.category : 'blood-test';
  const comments = labInfo
    ? (userComments ? labInfo.summary + '\n\n' + userComments : labInfo.summary)
    : userComments;

  const appt: Appointment = {
    id: 'A-' + generateId(),
    date_key: dateKey,
    start_time: startTime,
    end_time: slotFound.end,
    service_id: BLOOD_TEST_SERVICE_ID,
    service_name: serviceName,
    full_name: fullName,
    email,
    phone,
    comments,
    status: 'BOOKED',
    location,
    clinic,
    created_at: now,
    updated_at: now,
    token: generateId(),
    calendar_event_id: '',
    cancelled_at: '',
    cancel_reason: '',
    reminder_sent: '',
    confirmed: '',
    booking_source: bookingSource,
    hotel: '',
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

  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey, clinic: 'potters', serviceId: BLOOD_TEST_SERVICE_ID }),
    });
  } catch (e) { console.error('Blood-test broadcast error:', e); }

  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        const eventId = await createCalendarEvent(env, appt);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, appt.id).run();
        }
      } catch (e) { console.error('Blood-test calendar create error:', e); }

      try {
        await sendClientConfirmationEmail(env, appt);
        const dayList = await getActiveAppointmentsByDate(env.DB, dateKey);
        await sendDoctorBookingEmail(env, appt, dayList);
      } catch (e) { console.error('Blood-test email send error:', e); }
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
