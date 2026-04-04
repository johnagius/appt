/**
 * Public API: init, dates, availability, booking, poll
 */
import type { Env, Appointment, BookingPayload, Slot, DateOption } from '../types';
import {
  todayLocal, todayKeyLocal, nowMinutesLocal, addDays, toDateKey, parseDateKey,
  dayOfWeekKey, isSunday, formatDateLabel, isHolidayOrClosed, inAdvanceWindow,
  buildSlotsForDate, parseTimeToMinutes, sanitizeName, sanitizeEmail, sanitizePhone,
  nowIso,
} from '../services/utils';
import {
  getConfig, getDataVersion, bumpVersion,
  getAppointmentsByDate, getActiveAppointmentsByDate, getTakenSlots, getCancelledSlots,
  insertAppointment, getOrCreateClient,
  getDoctorOffRows, buildDoctorOffMap, getDoctorExtraRows, buildExtraMap,
  slotBlockedByDoctorOff, doctorOffReason,
  countActiveAppointmentsInWindow, personAlreadyBookedSameSlot, isSlotTaken,
} from '../db/queries';
import { generateId } from '../services/crypto';
import { sendClientConfirmationEmail, sendDoctorBookingEmail } from '../services/email';
import { sendSpinolaConfirmationEmail } from '../services/email';
import { createCalendarEvent } from '../services/calendar';

// ─── Poll ──────────────────────────────────────────────────

export async function apiPoll(env: Env): Promise<Response> {
  const v = await getDataVersion(env.DB);
  return json({ v });
}

// ─── Init ──────────────────────────────────────────────────

export async function apiInit(env: Env): Promise<Response> {
  const cfg = await getConfig(env.DB);
  const tz = env.TIMEZONE;

  const [offRows, extraRows] = await Promise.all([
    getDoctorOffRows(env.DB),
    getDoctorExtraRows(env.DB),
  ]);
  const offMap = buildDoctorOffMap(offRows);
  const extraMap = buildExtraMap(extraRows);

  const dateOptions = buildDateOptions(cfg, offMap, extraMap, tz);

  // Find first enabled date
  const firstDateKey = dateOptions.find(d => !d.disabled)?.dateKey ?? null;

  let initialSlots = null;
  let initialSpinola = null;
  if (firstDateKey) {
    [initialSlots, initialSpinola] = await Promise.all([
      buildAvailabilityResponse(firstDateKey, cfg, offMap, extraMap, tz, 'potters', env),
      buildAvailabilityResponse(firstDateKey, cfg, offMap, extraMap, tz, 'spinola', env),
    ]);
  }

  const v = await getDataVersion(env.DB);

  return json({
    config: {
      doctorName: env.DOCTOR_NAME,
      clinicName: env.CLINIC_NAME,
      apptMinutes: cfg.apptDurationMin,
      services: [{ id: 'clinic', name: 'Clinic Consultation', minutes: cfg.apptDurationMin }],
      timezone: tz,
      bookingPolicy: 'Choose a service and then select your time slot. You will receive confirmation by email. You can CANCEL your appointment from the email.',
      pottersLocation: cfg.pottersLocation,
      spinolaLocation: cfg.spinolaLocation,
      spinolaDoctorName: env.SPINOLA_DOCTOR_NAME,
      spinolaLocationDetails: env.SPINOLA_LOCATION_DETAILS,
      workingHours: cfg.workingHours,
      spinolaHours: cfg.spinolaHours,
    },
    dateOptions,
    initialSlots,
    initialSpinola,
    _v: v,
  });
}

// ─── Dates ─────────────────────────────────────────────────

export async function apiGetDates(env: Env): Promise<Response> {
  const cfg = await getConfig(env.DB);
  const [offRows, extraRows] = await Promise.all([
    getDoctorOffRows(env.DB),
    getDoctorExtraRows(env.DB),
  ]);
  const offMap = buildDoctorOffMap(offRows);
  const extraMap = buildExtraMap(extraRows);
  return json({ dateOptions: buildDateOptions(cfg, offMap, extraMap, env.TIMEZONE) });
}

// ─── Availability ──────────────────────────────────────────

export async function apiGetAvailability(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const dateKey = url.searchParams.get('date') || '';
  if (!dateKey) return json({ ok: false, reason: 'Missing date' }, 400);

  const cfg = await getConfig(env.DB);
  const [offRows, extraRows] = await Promise.all([
    getDoctorOffRows(env.DB),
    getDoctorExtraRows(env.DB),
  ]);
  const offMap = buildDoctorOffMap(offRows);
  const extraMap = buildExtraMap(extraRows);

  const result = await buildAvailabilityResponse(dateKey, cfg, offMap, extraMap, env.TIMEZONE, 'potters', env);
  return json(result);
}

export async function apiGetSpinolaAvailability(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const dateKey = url.searchParams.get('date') || '';
  if (!dateKey) return json({ ok: false, reason: 'Missing date' }, 400);

  const cfg = await getConfig(env.DB);
  const [offRows, extraRows] = await Promise.all([
    getDoctorOffRows(env.DB),
    getDoctorExtraRows(env.DB),
  ]);
  const offMap = buildDoctorOffMap(offRows);
  const extraMap = buildExtraMap(extraRows);

  const result = await buildAvailabilityResponse(dateKey, cfg, offMap, extraMap, env.TIMEZONE, 'spinola', env);
  return json(result);
}

// ─── Book ──────────────────────────────────────────────────

export async function apiBook(req: Request, env: Env): Promise<Response> {
  return doBook(req, env, 'potters');
}

export async function apiBookSpinola(req: Request, env: Env): Promise<Response> {
  return doBook(req, env, 'spinola');
}

async function doBook(req: Request, env: Env, clinic: 'potters' | 'spinola'): Promise<Response> {
  const payload: BookingPayload = await req.json();
  const tz = env.TIMEZONE;
  const cfg = await getConfig(env.DB);

  const dateKey = (payload.dateKey || '').trim();
  const startTime = (payload.startTime || '').trim();
  const serviceId = (payload.serviceId || '').trim();
  const fullName = sanitizeName(payload.fullName);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizePhone(payload.phone);
  const comments = (payload.comments || '').trim();

  if (!dateKey || !startTime || !serviceId || !fullName || !email || !phone) {
    return json({ ok: false, reason: 'Missing required fields' }, 400);
  }

  const d = parseDateKey(dateKey);
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);

  if (d.getTime() < today.getTime()) return json({ ok: false, reason: 'You cannot book a past date.' }, 400);
  if (!inAdvanceWindow(d, today, cfg.advanceDays)) return json({ ok: false, reason: 'You can only book up to 7 days in advance.' }, 400);

  // Holiday checks
  const holiday = isHolidayOrClosed(d);
  if (clinic === 'potters' && holiday.closed) return json({ ok: false, reason: 'Closed: ' + holiday.reason }, 400);
  // Spinola is open every day including Sundays and public holidays (10am-12pm)
  // Only skip Spinola closure check — Spinola is never closed

  // Doctor off (potters only)
  if (clinic === 'potters') {
    const offRows = await getDoctorOffRows(env.DB);
    const offMap = buildDoctorOffMap(offRows);
    const offEntry = offMap[dateKey];
    if (offEntry?.allDay) return json({ ok: false, reason: 'Doctor not available: ' + doctorOffReason(offEntry) }, 400);

    // Check time-block off
    const extraRows = await getDoctorExtraRows(env.DB);
    const extraMap = buildExtraMap(extraRows);
    const extras = extraMap[dateKey] || null;
    const slots = buildSlotsForDate(d, cfg.apptDurationMin, extras, cfg.workingHours);
    const slotFound = slots.find(s => s.start === startTime);
    if (!slotFound) return json({ ok: false, reason: 'Invalid slot' }, 400);

    if (slotBlockedByDoctorOff(offEntry, slotFound.start, slotFound.end)) {
      return json({ ok: false, reason: 'Doctor not available: ' + doctorOffReason(offEntry) }, 400);
    }
  }

  if (clinic === 'spinola') {
    const slots = buildSlotsForDate(d, cfg.apptDurationMin, null, cfg.spinolaHours);
    const slotFound = slots.find(s => s.start === startTime);
    if (!slotFound) return json({ ok: false, reason: 'Invalid slot' }, 400);
  }

  // Past time check
  if (dateKey === todayKey) {
    const nowMin = nowMinutesLocal(tz);
    if (parseTimeToMinutes(startTime) < nowMin) {
      return json({ ok: false, reason: 'That time is already in the past. Please choose a later slot.' }, 400);
    }
  }

  // Max active bookings check
  if (cfg.maxActiveApptsPerPerson > 0) {
    const maxDateKey = toDateKey(addDays(today, cfg.advanceDays));
    const activeCount = await countActiveAppointmentsInWindow(env.DB, email, phone, todayKey, maxDateKey);
    if (activeCount >= cfg.maxActiveApptsPerPerson) {
      return json({ ok: false, reason: `You already have ${activeCount} active appointment(s). Please cancel one before booking another.` }, 400);
    }
  }

  // Duplicate check
  if (await personAlreadyBookedSameSlot(env.DB, dateKey, startTime, email, phone)) {
    return json({ ok: false, reason: 'You already booked this exact time slot.' }, 400);
  }

  // Slot taken check
  if (await isSlotTaken(env.DB, dateKey, startTime, clinic)) {
    return json({ ok: false, reason: 'That slot was just taken. Please pick another.' }, 400);
  }

  // Validate service
  const service = { id: 'clinic', name: 'Clinic Consultation', minutes: cfg.apptDurationMin };
  if (serviceId !== service.id) return json({ ok: false, reason: 'Unknown service' }, 400);

  const endTime = (() => {
    const m = parseTimeToMinutes(startTime) + service.minutes;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  })();

  const now = nowIso(tz);
  const location = clinic === 'potters' ? cfg.pottersLocation : cfg.spinolaLocation;

  await getOrCreateClient(env.DB, fullName, email, phone, now);

  const appt: Appointment = {
    id: 'A-' + generateId(),
    date_key: dateKey,
    start_time: startTime,
    end_time: endTime,
    service_id: service.id,
    service_name: service.name,
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
  };

  await insertAppointment(env.DB, appt);
  await bumpVersion(env.DB);

  // Broadcast SYNCHRONOUSLY before returning response — ensures admin pages update
  try {
    console.log('[BOOKING] Broadcasting slots_updated for', dateKey);
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    const bRes = await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey }),
    });
    const bData = await bRes.json();
    console.log('[BOOKING] Broadcast result:', JSON.stringify(bData));
  } catch (e) { console.error('[BOOKING] Broadcast error:', e); }

  // Fire-and-forget: emails + calendar + push updated slots via WebSocket
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      // Create Google Calendar event (write-only, D1 is source of truth)
      try {
        const eventId = await createCalendarEvent(env, appt);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, appt.id).run();
        }
      } catch (e) { console.error('Calendar create error:', e); }

      // Send emails
      try {
        if (clinic === 'potters') {
          await sendClientConfirmationEmail(env, appt);
        } else {
          await sendSpinolaConfirmationEmail(env, appt);
        }
        const dayList = await getActiveAppointmentsByDate(env.DB, dateKey);
        await sendDoctorBookingEmail(env, appt, dayList);
      } catch (e) {
        console.error('Email send error:', e);
      }

      // Push updated slot data directly to WebSocket clients
      // They receive the new availability WITHOUT making any API call
      try {
        const freshCfg = await getConfig(env.DB);
        const [freshOff, freshExtra] = await Promise.all([getDoctorOffRows(env.DB), getDoctorExtraRows(env.DB)]);
        const freshOffMap = buildDoctorOffMap(freshOff);
        const freshExtraMap = buildExtraMap(freshExtra);
        const slotsData = await buildAvailabilityResponse(dateKey, freshCfg, freshOffMap, freshExtraMap, env.TIMEZONE, clinic, env);

        const doId = env.REALTIME.idFromName('global');
        const stub = env.REALTIME.get(doId);
        await stub.fetch('http://internal/push-data', {
          method: 'POST',
          body: JSON.stringify({ type: 'slots_data', dateKey, data: slotsData }),
        });
        // Also send simple broadcast for admin pages
        await stub.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify({ type: 'slots_updated', dateKey }),
        });
      } catch {}
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
  });
}

// ─── Helpers ───────────────────────────────────────────────

function buildDateOptions(
  cfg: ReturnType<typeof getConfig> extends Promise<infer T> ? T : never,
  offMap: ReturnType<typeof buildDoctorOffMap>,
  extraMap: ReturnType<typeof buildExtraMap>,
  tz: string
): DateOption[] {
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  const nowMin = nowMinutesLocal(tz);
  const out: DateOption[] = [];

  for (let i = 0; i <= cfg.advanceDays; i++) {
    const d = addDays(today, i);
    const dk = toDateKey(d);
    const holiday = isHolidayOrClosed(d);
    let reason = '';
    let disabled = false;
    let spinolaOnly = false;

    const offEntry = offMap[dk];

    if (!inAdvanceWindow(d, today, cfg.advanceDays)) {
      disabled = true;
      reason = 'Outside booking window';
    } else if (holiday.closed) {
      // Potter's closed, but Spinola is open on Sundays and public holidays
      spinolaOnly = true;
      reason = holiday.reason + ' (Spinola open 10:00-12:00)';
    } else if (offEntry?.allDay) {
      // Dr Kevin off — check Spinola
      const spinolaSlots = buildSlotsForDate(d, cfg.apptDurationMin, null, cfg.spinolaHours);
      let spinolaHasRemaining = false;
      if (spinolaSlots.length > 0) {
        if (dk === todayKey) {
          spinolaHasRemaining = spinolaSlots.some(s => parseTimeToMinutes(s.end) > nowMin);
        } else {
          spinolaHasRemaining = true;
        }
      }
      if (spinolaHasRemaining) {
        spinolaOnly = true;
      } else {
        disabled = true;
        reason = doctorOffReason(offEntry);
      }
    } else {
      const extras = extraMap[dk] || null;
      const slots = buildSlotsForDate(d, cfg.apptDurationMin, extras, cfg.workingHours);

      // Check if all Potter's slots are blocked by doctor-off
      const availableSlots = offEntry
        ? slots.filter(s => !slotBlockedByDoctorOff(offEntry, s.start, s.end))
        : slots;

      if (!availableSlots.length && slots.length > 0) {
        // All Potter's slots blocked — check Spinola
        const spinolaSlots = buildSlotsForDate(d, cfg.apptDurationMin, null, cfg.spinolaHours);
        let spinolaHasRemaining = spinolaSlots.length > 0;
        if (dk === todayKey && spinolaHasRemaining) {
          spinolaHasRemaining = spinolaSlots.some(s => parseTimeToMinutes(s.end) > nowMin);
        }
        if (spinolaHasRemaining) {
          spinolaOnly = true;
          reason = 'Dr Kevin not available (Spinola Clinic open)';
        } else {
          disabled = true;
          reason = offEntry ? doctorOffReason(offEntry) : 'Closed';
        }
      } else if (!slots.length) {
        disabled = true;
        reason = 'Closed';
      } else if (dk === todayKey) {
        const lastEnd = Math.max(...slots.map(s => parseTimeToMinutes(s.end)));
        if (nowMin >= lastEnd) {
          disabled = true;
          reason = 'No slots remaining today';
        }
      } else {
        const remaining = slots.filter(s => !slotBlockedByDoctorOff(offEntry, s.start, s.end)).length;
        if (remaining === 0) {
          disabled = true;
          reason = offEntry ? doctorOffReason(offEntry) : 'No slots available';
        }
      }
    }

    out.push({
      dateKey: dk,
      label: formatDateLabel(d, tz),
      disabled,
      reason,
      spinolaOnly,
    });
  }

  return out;
}

async function buildAvailabilityResponse(
  dateKey: string,
  cfg: Awaited<ReturnType<typeof getConfig>>,
  offMap: ReturnType<typeof buildDoctorOffMap>,
  extraMap: ReturnType<typeof buildExtraMap>,
  tz: string,
  clinic: 'potters' | 'spinola',
  env: Env
) {
  const d = parseDateKey(dateKey);
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);

  if (d.getTime() < today.getTime()) return { ok: false, reason: 'Date is in the past', dateKey, slots: [] };
  if (!inAdvanceWindow(d, today, cfg.advanceDays)) return { ok: false, reason: 'Outside booking window', dateKey, slots: [] };

  if (clinic === 'potters') {
    const holiday = isHolidayOrClosed(d);
    if (holiday.closed) return { ok: false, reason: holiday.reason, dateKey, slots: [] };

    const offEntry = offMap[dateKey];
    if (offEntry?.allDay) return { ok: true, reason: doctorOffReason(offEntry), dateKey, slots: [], doctorOff: true };

    const extras = extraMap[dateKey] || null;
    const baseSlots = buildSlotsForDate(d, cfg.apptDurationMin, extras, cfg.workingHours);

    const taken = await getTakenSlots(env.DB, dateKey, 'potters');
    const nowMin = nowMinutesLocal(tz);

    const outSlots = baseSlots.map(slot => {
      const startMin = parseTimeToMinutes(slot.start);
      const past = dateKey === todayKey ? startMin < nowMin : false;
      const isTaken = taken.has(slot.start);
      const isOff = slotBlockedByDoctorOff(offEntry, slot.start, slot.end);
      return { start: slot.start, end: slot.end, available: !past && !isTaken && !isOff };
    });

    return { ok: true, dateKey, slots: outSlots };
  }

  // Spinola is open every day: weekdays use normal spinolaHours,
  // Sundays and public holidays use 10:00-12:00
  const holiday = isHolidayOrClosed(d);
  const isSpinolaSpecialDay = holiday.isPublicHoliday || isSunday(d);
  const spinolaHours = isSpinolaSpecialDay
    ? { ...cfg.spinolaHours, [dayOfWeekKey(d)]: [{ start: '10:00', end: '12:00' }] }
    : cfg.spinolaHours;
  const baseSlots = buildSlotsForDate(d, cfg.apptDurationMin, null, spinolaHours);
  if (!baseSlots.length) return { ok: false, reason: 'Spinola Clinic closed', dateKey, slots: [] };

  const taken = await getTakenSlots(env.DB, dateKey, 'spinola');
  const nowMin = nowMinutesLocal(tz);

  const outSlots = baseSlots.map(slot => {
    const startMin = parseTimeToMinutes(slot.start);
    const past = dateKey === todayKey ? startMin < nowMin : false;
    const isTaken = taken.has(slot.start);
    return { start: slot.start, end: slot.end, available: !past && !isTaken };
  });

  return { ok: true, dateKey, slots: outSlots };
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
