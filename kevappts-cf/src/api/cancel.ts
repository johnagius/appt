/**
 * Cancel & Doctor Action APIs
 */
import type { Env, Appointment } from '../types';
import { nowIso, buildSlotsForDate, parseDateKey, toDateKey, todayLocal, addDays, parseTimeToMinutes, dayOfWeekKey, isSunday, isHolidayOrClosed } from '../services/utils';
import { verifyCancelSig, verifyDocActionSig, verifyRescheduleSig } from '../services/crypto';
import {
  getAppointmentByToken, updateAppointmentStatus, bumpVersion,
  getActiveAppointmentsByDate, insertAppointment, getConfig,
  isSlotTaken, getTakenSlots,
} from '../db/queries';
import {
  sendClientCancelledEmail, sendDoctorCancellationEmail,
  sendRedirectToSpinolaEmail, sendClientConfirmationEmail, sendSpinolaConfirmationEmail, sendDoctorBookingEmail,
} from '../services/email';
import { generateId } from '../services/crypto';
import { deleteCalendarEvent, createCalendarEvent } from '../services/calendar';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function isActive(status: string): boolean {
  return status === 'BOOKED' || status === 'RELOCATED_SPINOLA';
}

// ─── Cancel Info ───────────────────────────────────────────

export async function apiGetCancelInfo(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') || '').trim();
  const sig = (url.searchParams.get('sig') || '').trim();

  if (!await verifyCancelSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired cancel link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  return json({
    ok: true,
    appointment: {
      appointmentId: appt.id,
      dateKey: appt.date_key,
      startTime: appt.start_time,
      endTime: appt.end_time,
      serviceName: appt.service_name,
      fullName: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      status: appt.status,
      location: appt.location,
    },
  });
}

// ─── Cancel Appointment ────────────────────────────────────

export async function apiCancelAppointment(req: Request, env: Env): Promise<Response> {
  const body: { token?: string; sig?: string } = await req.json();
  const token = (body.token || '').trim();
  const sig = (body.sig || '').trim();

  if (!await verifyCancelSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired cancel link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  if (!isActive(appt.status)) {
    return json({ ok: true, alreadyCancelled: true, message: 'This appointment is already cancelled.', appointmentId: appt.id });
  }

  const now = nowIso(env.TIMEZONE);

  await updateAppointmentStatus(env.DB, appt.id, {
    status: 'CANCELLED_CLIENT',
    cancelled_at: now,
    cancel_reason: 'Cancelled by client via email link',
    calendar_event_id: '',
  }, now);
  await bumpVersion(env.DB);

  // Broadcast SYNCHRONOUSLY before returning response
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
    });
  } catch {}

  // Fire-and-forget emails + calendar
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      // Delete Google Calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, appt.clinic as any); } catch {}
      }
      try { await sendClientCancelledEmail(env, appt, 'Your appointment has been cancelled.'); } catch {}
      try { await sendDoctorCancellationEmail(env, appt, 'Client cancelled via email link.'); } catch {}
    })());
  }

  return json({ ok: true, alreadyCancelled: false, message: 'Appointment cancelled successfully.', appointmentId: appt.id });
}

// ─── Doctor Action ─────────────────────────────────────────

export async function apiDoctorAction(req: Request, env: Env): Promise<Response> {
  const body: { token?: string; act?: string; sig?: string } = await req.json();
  const token = (body.token || '').trim();
  const act = (body.act || '').trim();
  const sig = (body.sig || '').trim();

  if (!await verifyDocActionSig(token, act, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  if (!isActive(appt.status)) {
    return json({ ok: true, message: 'This appointment is already cancelled or processed.' });
  }

  const now = nowIso(env.TIMEZONE);
  const cfg = await getConfig(env.DB);

  if (act === 'cancel') {
    await updateAppointmentStatus(env.DB, appt.id, {
      status: 'CANCELLED_DOCTOR',
      cancelled_at: now,
      cancel_reason: 'Cancelled by doctor',
      calendar_event_id: '',
    }, now);
    await bumpVersion(env.DB);

    const ctx = (globalThis as any).__ctx;
    if (ctx?.waitUntil) {
      ctx.waitUntil((async () => {
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, appt.clinic as any); } catch {}
        }
        try { await sendClientCancelledEmail(env, appt, 'Your appointment has been cancelled by the clinic. Please rebook if needed.'); } catch {}
        try { await sendDoctorCancellationEmail(env, appt, 'You cancelled this appointment.'); } catch {}
        try {
          const doId = env.REALTIME.idFromName('global');
          const stub = env.REALTIME.get(doId);
          await stub.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
          });
        } catch {}
      })());
    }

    return json({ ok: true, message: 'Appointment cancelled and patient notified.' });
  }

  if (act === 'redirect') {
    const spinolaLocation = cfg.spinolaLocation;

    // Update original appointment
    await updateAppointmentStatus(env.DB, appt.id, {
      status: 'RELOCATED_SPINOLA',
      location: spinolaLocation,
    }, now);

    // Create mirrored entry in spinola clinic
    const spinolaAppt = {
      id: appt.id, // same ID for traceability
      date_key: appt.date_key,
      start_time: appt.start_time,
      end_time: appt.end_time,
      service_id: appt.service_id,
      service_name: appt.service_name,
      full_name: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      comments: appt.comments,
      status: 'RELOCATED_SPINOLA' as const,
      location: spinolaLocation,
      clinic: 'spinola' as const,
      created_at: appt.created_at,
      updated_at: now,
      token: appt.token,
      calendar_event_id: '',
      cancelled_at: '',
      cancel_reason: '',
    };

    // Use a new ID for the spinola copy to avoid primary key conflict
    const spinolaCopy = { ...spinolaAppt, id: 'A-' + generateId() };
    try { await insertAppointment(env.DB, spinolaCopy); } catch {}

    await bumpVersion(env.DB);

    const ctx = (globalThis as any).__ctx;
    if (ctx?.waitUntil) {
      ctx.waitUntil((async () => {
        // Delete old Potter's calendar event, create new Spinola one
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, 'potters'); } catch {}
        }
        try {
          const eventId = await createCalendarEvent(env, spinolaCopy);
          if (eventId) {
            await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, spinolaCopy.id).run();
          }
        } catch {}
        try { await sendRedirectToSpinolaEmail(env, appt, spinolaLocation); } catch {}
        try { await sendDoctorCancellationEmail(env, appt, 'Appointment redirected to ' + spinolaLocation + '.'); } catch {}
        try {
          const doId = env.REALTIME.idFromName('global');
          const stub = env.REALTIME.get(doId);
          await stub.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
          });
        } catch {}
      })());
    }

    return json({ ok: true, message: 'Appointment redirected to ' + spinolaLocation + ' and patient notified.' });
  }

  return json({ ok: false, reason: 'Unknown action: ' + act }, 400);
}

// ─── Reschedule Info (same as cancel-info but with reschedule sig) ──

export async function apiGetRescheduleInfo(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') || '').trim();
  const sig = (url.searchParams.get('sig') || '').trim();

  if (!await verifyRescheduleSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired reschedule link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  return json({
    ok: true,
    appointment: {
      appointmentId: appt.id,
      dateKey: appt.date_key,
      startTime: appt.start_time,
      endTime: appt.end_time,
      serviceName: appt.service_name,
      fullName: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      status: appt.status,
      location: appt.location,
      clinic: appt.clinic,
    },
  });
}

// ─── Reschedule Available Dates + Slots ─────────────────────

export async function apiGetRescheduleSlots(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') || '').trim();
  const sig = (url.searchParams.get('sig') || '').trim();
  const dateKey = (url.searchParams.get('date') || '').trim();

  if (!await verifyRescheduleSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  const cfg = await getConfig(env.DB);
  const tz = env.TIMEZONE;
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  const clinic = appt.clinic || 'potters';

  // Build date options (next 7 days)
  const dates: any[] = [];
  for (let i = 0; i < cfg.advanceDays; i++) {
    const d = addDays(today, i);
    const dk = toDateKey(d);
    const holiday = isHolidayOrClosed(d);
    let disabled = false;
    if (clinic === 'potters' && holiday.closed) disabled = true;
    dates.push({ dateKey: dk, disabled });
  }

  // If a specific date is requested, return slots for that date
  let slots: any[] = [];
  if (dateKey) {
    const d = parseDateKey(dateKey);
    const hours = clinic === 'spinola' ? cfg.spinolaHours : cfg.workingHours;

    // For Spinola on Sundays/holidays, use 10:00-12:00
    let effectiveHours = hours;
    if (clinic === 'spinola') {
      const holiday = isHolidayOrClosed(d);
      if (holiday.isPublicHoliday || isSunday(d)) {
        effectiveHours = { ...hours, [dayOfWeekKey(d)]: [{ start: '10:00', end: '12:00' }] };
      }
    }

    const baseSlots = buildSlotsForDate(d, cfg.apptDurationMin, null, effectiveHours);
    const taken = await getTakenSlots(env.DB, dateKey, clinic);
    const nowMin = (() => {
      const n = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
      return n.getHours() * 60 + n.getMinutes();
    })();

    slots = baseSlots.map(slot => {
      const startMin = parseTimeToMinutes(slot.start);
      const past = dateKey === todayKey ? startMin < nowMin : false;
      const isTaken = taken.has(slot.start);
      // Allow selecting the patient's current slot (it will be freed)
      const isOwnSlot = dateKey === appt.date_key && slot.start === appt.start_time;
      return {
        start: slot.start,
        end: slot.end,
        available: (!past && !isTaken) || isOwnSlot,
      };
    });
  }

  return json({ ok: true, dates, slots, dateKey: dateKey || todayKey });
}

// ─── Reschedule Appointment ─────────────────────────────────

export async function apiRescheduleAppointment(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const token = (body.token || '').trim();
  const sig = (body.sig || '').trim();
  const newDateKey = (body.dateKey || '').trim();
  const newStartTime = (body.startTime || '').trim();

  if (!await verifyRescheduleSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired reschedule link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });
  if (!isActive(appt.status)) return json({ ok: false, reason: 'This appointment is no longer active.' });

  if (!newDateKey || !newStartTime) return json({ ok: false, reason: 'Please select a date and time.' }, 400);

  const cfg = await getConfig(env.DB);
  const tz = env.TIMEZONE;
  const clinic = appt.clinic || 'potters';

  // Validate the new slot exists and is available
  const d = parseDateKey(newDateKey);
  const hours = clinic === 'spinola' ? cfg.spinolaHours : cfg.workingHours;
  let effectiveHours = hours;
  if (clinic === 'spinola') {
    const holiday = isHolidayOrClosed(d);
    if (holiday.isPublicHoliday || isSunday(d)) {
      effectiveHours = { ...hours, [dayOfWeekKey(d)]: [{ start: '10:00', end: '12:00' }] };
    }
  }

  const allSlots = buildSlotsForDate(d, cfg.apptDurationMin, null, effectiveHours);
  const slotFound = allSlots.find(s => s.start === newStartTime);
  if (!slotFound) return json({ ok: false, reason: 'Invalid time slot.' }, 400);

  // Check slot is free (unless it's the same slot being rescheduled)
  const sameSlot = newDateKey === appt.date_key && newStartTime === appt.start_time;
  if (!sameSlot) {
    const taken = await isSlotTaken(env.DB, newDateKey, newStartTime, clinic);
    if (taken) return json({ ok: false, reason: 'That slot was just taken. Please choose another.' });
  }

  const now = nowIso(tz);

  // 1. Cancel the old appointment
  await updateAppointmentStatus(env.DB, appt.id, {
    status: 'CANCELLED_CLIENT',
    cancelled_at: now,
    cancel_reason: 'Rescheduled by client',
    calendar_event_id: '',
  }, now);

  // 2. Create the new appointment with same patient details
  const newAppt: Appointment = {
    id: 'A-' + generateId(),
    date_key: newDateKey,
    start_time: newStartTime,
    end_time: slotFound.end,
    service_id: appt.service_id,
    service_name: appt.service_name,
    full_name: appt.full_name,
    email: appt.email,
    phone: appt.phone,
    comments: appt.comments || '',
    status: 'BOOKED',
    location: appt.location,
    clinic: clinic,
    token: generateId(),
    created_at: now,
    updated_at: now,
    cancelled_at: '',
    cancel_reason: '',
    calendar_event_id: '',
    reminder_sent: '',
    confirmed: '',
  };

  await insertAppointment(env.DB, newAppt);
  await bumpVersion(env.DB);

  // Broadcast slot updates for both old and new dates
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
    });
    if (newDateKey !== appt.date_key) {
      await stub.fetch('http://internal/broadcast', {
        method: 'POST',
        body: JSON.stringify({ type: 'slots_updated', dateKey: newDateKey }),
      });
    }
  } catch {}

  // Fire-and-forget: calendar + emails
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, clinic as any); } catch {}
      }
      try {
        const calEventId = await createCalendarEvent(env, newAppt);
        if (calEventId) {
          await updateAppointmentStatus(env.DB, newAppt.id, { calendar_event_id: calEventId }, now);
        }
      } catch {}
      try {
        if (clinic === 'spinola') await sendSpinolaConfirmationEmail(env, newAppt);
        else await sendClientConfirmationEmail(env, newAppt);
      } catch {}
      try {
        const dayList = await getActiveAppointmentsByDate(env.DB, newDateKey);
        await sendDoctorBookingEmail(env, newAppt, dayList);
      } catch {}
    })());
  }

  return json({
    ok: true,
    message: 'Appointment rescheduled successfully.',
    serviceName: newAppt.service_name,
    startTime: newAppt.start_time,
    endTime: newAppt.end_time,
    location: newAppt.location,
    dateKey: newDateKey,
  });
}
