/**
 * Admin API endpoints — ported from AdminApi.gs
 */
import type { Env, Appointment } from '../types';
import {
  todayLocal, toDateKey, addDays, nowIso, parseTimeToMinutes, minutesToTime,
  buildSlotsForDate, isHolidayOrClosed, dayOfWeekKey, parseDateKey,
} from '../services/utils';
import {
  getConfig, getDataVersion, bumpVersion,
  getAppointmentsByDate, getActiveAppointmentsByDate, getNonCancelledAppointmentsByDate,
  getAppointmentByToken, getAppointmentById, insertAppointment, updateAppointmentStatus,
  getDoctorOffRows, buildDoctorOffMap, getDoctorExtraRows, buildExtraMap,
  addDoctorOff, deleteDoctorOff, addDoctorExtra, deleteDoctorExtra,
  searchAppointments, getAppointmentsByDateRange, getAllAppointments, getPatientHistory,
  slotBlockedByDoctorOff, doctorOffReason, findNextAvailableDay,
  setConfigValue, getTakenSlots, isReviewSent, markReviewSent,
  insertFollowUp, getFollowUps, isFollowUpSent, getReferrals,
} from '../db/queries';
import { verifyAdminSig, generateId } from '../services/crypto';
import {
  sendClientCancelledEmail, sendRedirectToSpinolaEmail,
  sendAppointmentPushedEmail, sendCustomNotificationEmail, sendReviewRequestEmail,
  sendFollowUpEmail,
} from '../services/email';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendar';
import { loadLindaConfig } from '../services/linda';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function requireAdmin(req: Request, env: Env): Promise<Response | null> {
  const url = new URL(req.url);
  // Check query string sig
  const sig = (url.searchParams.get('sig') || '').trim();
  if (sig && await verifyAdminSig(sig, env.ADMIN_SECRET)) return null;
  // Check cookie
  const cookie = req.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_sig=([^\s;]+)/);
  if (match && await verifyAdminSig(match[1], env.ADMIN_SECRET)) return null;
  return json({ ok: false, reason: 'Access denied.' }, 403);
}

async function broadcast(env: Env, dateKey: string) {
  try {
    const id = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(id);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey }),
    });
  } catch (e) { console.error('Broadcast error:', e); }
}

// ─── Dashboard ─────────────────────────────────────────────

export async function apiAdminGetDashboard(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const cfg = await getConfig(env.DB);
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));

  const [todayAppts, tomorrowAppts, offRows, extraRows] = await Promise.all([
    getNonCancelledAppointmentsByDate(env.DB, todayKey),
    getNonCancelledAppointmentsByDate(env.DB, tomorrowKey),
    getDoctorOffRows(env.DB),
    getDoctorExtraRows(env.DB),
  ]);

  const futureOffRows = offRows.filter(r => r.end_date >= todayKey || r.start_date >= todayKey);
  const futureExtraRows = extraRows.filter(r => r.date_key >= todayKey);

  // Week stats (full Mon-Sun of current week)
  let weekBooked = 0, weekCancelled = 0;
  const todayDow = today.getDay(); // 0=Sun, 1=Mon
  const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow;
  for (let d = mondayOffset; d <= mondayOffset + 6; d++) {
    const dk = toDateKey(addDays(today, d));
    const appts = await getAppointmentsByDate(env.DB, dk);
    for (const a of appts) {
      if (['BOOKED', 'RELOCATED_SPINOLA', 'ATTENDED'].includes(a.status)) weekBooked++;
      if (a.status.includes('CANCELLED')) weekCancelled++;
    }
  }

  // Today capacity
  const offMap = buildDoctorOffMap(offRows);
  const extraMap = buildExtraMap(extraRows);
  const todaySlots = buildSlotsForDate(today, cfg.apptDurationMin, extraMap[todayKey] || null, cfg.workingHours);
  let todayCapacity = todaySlots.length;
  const offEntry = offMap[todayKey];
  if (offEntry) {
    if (offEntry.allDay) todayCapacity = 0;
    else {
      for (const slot of todaySlots) {
        if (slotBlockedByDoctorOff(offEntry, slot.start, slot.end)) todayCapacity--;
      }
    }
  }

  const v = await getDataVersion(env.DB);

  return json({
    ok: true,
    todayKey,
    tomorrowKey,
    todayAppointments: todayAppts.filter(a => a.clinic !== 'spinola' && a.clinic !== 'linda'),
    tomorrowAppointments: tomorrowAppts.filter(a => a.clinic !== 'spinola' && a.clinic !== 'linda'),
    doctorOffEntries: futureOffRows,
    extraSlotEntries: futureExtraRows,
    workingHours: cfg.workingHours,
    stats: { weekBooked, weekCancelled, todayCapacity },
    _v: v,
  });
}

// ─── Date Appointments ─────────────────────────────────────

export async function apiAdminGetDateAppointments(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || '').trim();
  if (!dateKey) return json({ ok: false, reason: 'Missing date.' }, 400);

  const appts = await getNonCancelledAppointmentsByDate(env.DB, dateKey);
  // Doctor page is for Dr Kevin only — exclude Spinola and Linda bookings.
  const pottersOnly = appts.filter(a => a.clinic !== 'spinola' && a.clinic !== 'linda');
  return json({ ok: true, dateKey, appointments: pottersOnly });
}

// ─── Mark Doctor Off ───────────────────────────────────────

export async function apiAdminMarkDoctorOff(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const payload: any = await req.json();
  const startDate = (payload.startDate || '').trim();
  const endDate = (payload.endDate || startDate).trim();
  const startTime = (payload.startTime || '').trim();
  const endTime = (payload.endTime || '').trim();
  const reason = (payload.reason || 'Doctor not available').trim();

  if (!startDate) return json({ ok: false, reason: 'Missing start date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return json({ ok: false, reason: 'Invalid start date format.' }, 400);
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return json({ ok: false, reason: 'Invalid end date format.' }, 400);

  await addDoctorOff(env.DB, { start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime, reason });
  await bumpVersion(env.DB);

  // Find affected appointments
  const affected: Appointment[] = [];
  let sd = parseDateKey(startDate);
  let ed = parseDateKey(endDate || startDate);
  if (ed.getTime() < sd.getTime()) { const tmp = sd; sd = ed; ed = tmp; }

  let d = new Date(sd.getTime());
  while (d.getTime() <= ed.getTime()) {
    const dk = toDateKey(d);
    const appts = await getActiveAppointmentsByDate(env.DB, dk);
    for (const a of appts) {
      if (!startTime && !endTime) {
        affected.push(a);
      } else {
        const aStart = parseTimeToMinutes(a.start_time);
        const aEnd = parseTimeToMinutes(a.end_time);
        const bStart = startTime ? parseTimeToMinutes(startTime) : 0;
        const bEnd = endTime ? parseTimeToMinutes(endTime) : 1440;
        if (aStart < bEnd && aEnd > bStart) affected.push(a);
      }
    }
    d = addDays(d, 1);
  }

  await broadcast(env, startDate);
  return json({ ok: true, message: 'Doctor marked as unavailable.', affectedAppointments: affected });
}

// ─── Add Extra Slots ───────────────────────────────────────

export async function apiAdminAddExtraSlots(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const cfg = await getConfig(env.DB);
  const payload: any = await req.json();
  const date = (payload.date || '').trim();
  const endDate = (payload.endDate || '').trim();
  const startTime = (payload.startTime || '').trim();
  const endTime = (payload.endTime || '').trim();
  const reason = (payload.reason || 'Extra hours').trim();

  if (!date || !startTime || !endTime) return json({ ok: false, reason: 'Missing fields.' }, 400);

  const stMin = parseTimeToMinutes(startTime);
  const enMin = parseTimeToMinutes(endTime);
  if (enMin <= stMin) return json({ ok: false, reason: 'End time must be after start time.' }, 400);

  let startD = parseDateKey(date);
  let endD = endDate ? parseDateKey(endDate) : startD;
  if (endD.getTime() < startD.getTime()) { const tmp = startD; startD = endD; endD = tmp; }

  let daysAdded = 0;
  let cur = new Date(startD.getTime());
  while (cur.getTime() <= endD.getTime()) {
    const key = toDateKey(cur);
    await addDoctorExtra(env.DB, { date_key: key, start_time: startTime, end_time: endTime, reason });
    daysAdded++;
    cur = addDays(cur, 1);
  }

  await bumpVersion(env.DB);
  const slotsPerDay = Math.floor((enMin - stMin) / cfg.apptDurationMin);
  const totalSlots = slotsPerDay * daysAdded;

  await broadcast(env, date);
  return json({ ok: true, message: `Added extra time: ${startTime} - ${endTime} (${totalSlots} slots across ${daysAdded} day(s)).` });
}

// ─── Remove Doctor Off / Extra ─────────────────────────────

export async function apiAdminRemoveDoctorOff(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const idStr = url.pathname.split('/').pop() || '';
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return json({ ok: false, reason: 'Invalid ID.' }, 400);

  await deleteDoctorOff(env.DB, id);
  await bumpVersion(env.DB);
  await broadcast(env, '');
  return json({ ok: true, message: 'Doctor-off entry removed.' });
}

export async function apiAdminRemoveExtraSlots(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const idStr = url.pathname.split('/').pop() || '';
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return json({ ok: false, reason: 'Invalid ID.' }, 400);

  await deleteDoctorExtra(env.DB, id);
  await bumpVersion(env.DB);
  await broadcast(env, '');
  return json({ ok: true, message: 'Extra slots entry removed.' });
}

// ─── Process Appointments ──────────────────────────────────

export async function apiAdminProcessAppointments(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const cfg = await getConfig(env.DB);
  const payload: any = await req.json();
  const dateKey = (payload.dateKey || '').trim();
  const action = (payload.action || '').trim();
  const customMessage = (payload.customMessage || '').trim();
  const appointmentIds: string[] = payload.appointmentIds || [];

  if (!dateKey || !action) return json({ ok: false, reason: 'Missing date or action.' }, 400);

  const validActions = ['cancel', 'redirect_spinola', 'push_next_day', 'push_same_day'];
  if (!validActions.includes(action)) return json({ ok: false, reason: 'Invalid action.' }, 400);

  let allAppts = await getActiveAppointmentsByDate(env.DB, dateKey);
  let appts = appointmentIds.length > 0
    ? allAppts.filter(a => appointmentIds.includes(a.id))
    : allAppts;

  if (!appts.length) return json({ ok: true, message: 'No appointments to process.', processed: 0 });

  const now = nowIso(tz);
  const results: any[] = [];

  if (action === 'cancel') {
    for (const appt of appts) {
      // Delete calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, (appt.clinic as any) || 'potters'); } catch {}
      }
      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'CANCELLED_DOCTOR',
        cancelled_at: now,
        cancel_reason: customMessage || 'Doctor unavailable',
        calendar_event_id: '',
      }, now);

      const msg = customMessage || `We apologise, the doctor is unavailable on ${dateKey}. Your appointment has been cancelled. Please rebook.`;
      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendClientCancelledEmail(env, appt, msg).catch(() => {}));

      results.push({ appointmentId: appt.id, action: 'cancelled', patient: appt.full_name });
    }
  }

  if (action === 'redirect_spinola') {
    const spinolaTaken = await getTakenSlots(env.DB, dateKey, 'spinola');

    for (const appt of appts) {
      // Find available slot at Spinola — try same time first, then next available
      const spinolaDateObj = parseDateKey(dateKey);
      const spinolaSlots = buildSlotsForDate(spinolaDateObj, cfg.apptDurationMin, null, cfg.spinolaHours);
      let spinolaSlot = spinolaSlots.find(s => s.start === appt.start_time && !spinolaTaken.has(s.start));
      if (!spinolaSlot) {
        spinolaSlot = spinolaSlots.find(s => !spinolaTaken.has(s.start));
      }

      if (!spinolaSlot) {
        // No Spinola slots available — cancel instead
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, 'potters'); } catch {}
        }
        await updateAppointmentStatus(env.DB, appt.id, {
          status: 'CANCELLED_DOCTOR', cancelled_at: now,
          cancel_reason: 'No available slot at Spinola', calendar_event_id: '',
        }, now);
        const ctx = (globalThis as any).__ctx;
        if (ctx?.waitUntil) ctx.waitUntil(sendClientCancelledEmail(env, appt, 'No slots available at Spinola Clinic for rescheduling. Please rebook.').catch(() => {}));
        results.push({ appointmentId: appt.id, action: 'cancelled_no_slot', patient: appt.full_name });
        continue;
      }

      // Delete Potter's calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, 'potters'); } catch {}
      }

      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'RELOCATED_SPINOLA',
        location: cfg.spinolaLocation,
        calendar_event_id: '',
      }, now);

      // Create spinola copy with verified available slot
      const spinolaCopyId = 'A-' + generateId();
      const spinolaToken = generateId();
      try {
        await insertAppointment(env.DB, {
          ...appt,
          id: spinolaCopyId,
          token: spinolaToken,
          clinic: 'spinola',
          status: 'RELOCATED_SPINOLA',
          location: cfg.spinolaLocation,
          start_time: spinolaSlot.start,
          end_time: spinolaSlot.end,
          updated_at: now,
          calendar_event_id: '',
        });
      } catch {}
      spinolaTaken.add(spinolaSlot.start);

      // Create Spinola calendar event
      try {
        const spinolaCopy = { ...appt, id: spinolaCopyId, token: spinolaToken, clinic: 'spinola' as const, location: cfg.spinolaLocation };
        const eventId = await createCalendarEvent(env, spinolaCopy);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, spinolaCopyId).run();
        }
      } catch {}

      // Send redirect email with cancel link (using the Spinola copy's token)
      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendRedirectToSpinolaEmail(env, { ...appt, token: spinolaToken }, cfg.spinolaLocation).catch(() => {}));

      results.push({ appointmentId: appt.id, action: 'redirected_spinola', patient: appt.full_name });
    }
  }

  if (action === 'push_next_day') {
    const offRows = await getDoctorOffRows(env.DB);
    const offMap = buildDoctorOffMap(offRows);
    const nextDay = findNextAvailableDay(dateKey, offMap, cfg.apptDurationMin);

    if (!nextDay) return json({ ok: false, reason: 'No available day in the next 30 days.' }, 400);

    const nextDateObj = parseDateKey(nextDay);
    const extraRows = await getDoctorExtraRows(env.DB);
    const extraMap = buildExtraMap(extraRows);
    const availableSlots = buildSlotsForDate(nextDateObj, cfg.apptDurationMin, extraMap[nextDay] || null, cfg.workingHours);

    const takenOnNextDay = await getTakenSlots(env.DB, nextDay, 'potters');

    for (const appt of appts) {
      // Try same time first
      let newSlot = availableSlots.find(s =>
        s.start === appt.start_time && !takenOnNextDay.has(s.start) &&
        !slotBlockedByDoctorOff(offMap[nextDay], s.start, s.end)
      );

      // Fallback: any available
      if (!newSlot) {
        newSlot = availableSlots.find(s =>
          !takenOnNextDay.has(s.start) &&
          !slotBlockedByDoctorOff(offMap[nextDay], s.start, s.end)
        );
      }

      // If no slot on the initial nextDay, cascade through future days
      let pushDay: string = nextDay;
      if (!newSlot) {
        let searchDate = pushDay;
        for (let attempt = 0; attempt < 30 && !newSlot; attempt++) {
          searchDate = toDateKey(addDays(parseDateKey(searchDate), 1));
          const searchDateObj = parseDateKey(searchDate);
          const holiday = isHolidayOrClosed(searchDateObj);
          if (holiday.closed) continue;
          const offEntry = offMap[searchDate];
          if (offEntry?.allDay) continue;

          const daySlots = buildSlotsForDate(searchDateObj, cfg.apptDurationMin, extraMap[searchDate] || null, cfg.workingHours);
          const dayTaken = await getTakenSlots(env.DB, searchDate, 'potters');
          newSlot = daySlots.find(s =>
            !dayTaken.has(s.start) &&
            !slotBlockedByDoctorOff(offMap[searchDate], s.start, s.end)
          );
          if (newSlot) pushDay = searchDate;
        }
      }

      if (!newSlot) {
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, (appt.clinic as any) || 'potters'); } catch {}
        }
        await updateAppointmentStatus(env.DB, appt.id, {
          status: 'CANCELLED_DOCTOR',
          cancelled_at: now,
          cancel_reason: 'No available slot in next 30 days',
          calendar_event_id: '',
        }, now);
        const ctx = (globalThis as any).__ctx;
        if (ctx?.waitUntil) ctx.waitUntil(sendClientCancelledEmail(env, appt, 'We could not find an available slot in the next 30 days. Please rebook at your convenience.').catch(() => {}));
        results.push({ appointmentId: appt.id, action: 'cancelled_no_slot', patient: appt.full_name });
        continue;
      }

      // Delete old calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, (appt.clinic as any) || 'potters'); } catch {}
      }

      // Cancel old
      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'CANCELLED_DOCTOR',
        cancelled_at: now,
        cancel_reason: 'Pushed to ' + pushDay + ' ' + newSlot.start,
        calendar_event_id: '',
      }, now);

      // Create new
      const newAppt: Appointment = {
        id: 'A-' + generateId(),
        date_key: pushDay,
        start_time: newSlot.start,
        end_time: newSlot.end,
        service_id: appt.service_id,
        service_name: appt.service_name,
        full_name: appt.full_name,
        email: appt.email,
        phone: appt.phone,
        comments: appt.comments,
        status: 'BOOKED',
        location: appt.location,
        clinic: appt.clinic,
        created_at: now,
        updated_at: now,
        token: generateId(),
        calendar_event_id: '',
        cancelled_at: '',
        cancel_reason: '',
        booking_source: appt.booking_source || '',
      };

      await insertAppointment(env.DB, newAppt);
      if (pushDay === nextDay) takenOnNextDay.add(newSlot.start);

      // Create new calendar event
      try {
        const eventId = await createCalendarEvent(env, newAppt);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, newAppt.id).run();
        }
      } catch {}

      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendAppointmentPushedEmail(env, appt, pushDay, newSlot.start, newSlot.end).catch(() => {}));

      results.push({ appointmentId: newAppt.id, action: 'pushed', patient: appt.full_name, newDate: pushDay, newTime: newSlot.start });
    }
  }

  if (action === 'push_same_day') {
    const breakEndTime = (payload.breakEndTime || '').trim();
    if (!breakEndTime) return json({ ok: false, reason: 'Missing breakEndTime.' }, 400);
    const breakEndMin = parseTimeToMinutes(breakEndTime);

    const sameDateObj = parseDateKey(dateKey);
    const extraRows = await getDoctorExtraRows(env.DB);
    const extraMap = buildExtraMap(extraRows);
    const offRows2 = await getDoctorOffRows(env.DB);
    const offMap2 = buildDoctorOffMap(offRows2);
    const offEntry = offMap2[dateKey];
    const sameDaySlots = buildSlotsForDate(sameDateObj, cfg.apptDurationMin, extraMap[dateKey] || null, cfg.workingHours);

    const takenSameDay = await getTakenSlots(env.DB, dateKey, 'potters');

    let availableAfterBreak = sameDaySlots.filter(s => {
      const slotStartMin = parseTimeToMinutes(s.start);
      return slotStartMin >= breakEndMin && !takenSameDay.has(s.start) && !slotBlockedByDoctorOff(offEntry, s.start, s.end);
    });

    // Extend if not enough slots
    const shortfall = appts.length - availableAfterBreak.length;
    if (shortfall > 0) {
      let lastSlotEnd = 0;
      for (const s of sameDaySlots) {
        const e = parseTimeToMinutes(s.end);
        if (e > lastSlotEnd) lastSlotEnd = e;
      }
      const extStart = lastSlotEnd;
      const extEnd = extStart + shortfall * cfg.apptDurationMin;
      await addDoctorExtra(env.DB, { date_key: dateKey, start_time: minutesToTime(extStart), end_time: minutesToTime(extEnd), reason: 'Extended for break reschedule' });
      for (let m = extStart; m + cfg.apptDurationMin <= extEnd; m += cfg.apptDurationMin) {
        availableAfterBreak.push({ start: minutesToTime(m), end: minutesToTime(m + cfg.apptDurationMin) });
      }
    }

    for (const appt of appts) {
      const newSlot = availableAfterBreak.shift();
      if (!newSlot) {
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, (appt.clinic as any) || 'potters'); } catch {}
        }
        await updateAppointmentStatus(env.DB, appt.id, {
          status: 'CANCELLED_DOCTOR', cancelled_at: now,
          cancel_reason: 'No available slot on same day', calendar_event_id: '',
        }, now);
        results.push({ appointmentId: appt.id, action: 'cancelled_no_slot', patient: appt.full_name });
        continue;
      }

      // Delete old calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, (appt.clinic as any) || 'potters'); } catch {}
      }

      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'CANCELLED_DOCTOR', cancelled_at: now,
        cancel_reason: 'Pushed to later today ' + newSlot.start, calendar_event_id: '',
      }, now);

      const newAppt: Appointment = {
        id: 'A-' + generateId(),
        date_key: dateKey,
        start_time: newSlot.start,
        end_time: newSlot.end,
        service_id: appt.service_id,
        service_name: appt.service_name,
        full_name: appt.full_name,
        email: appt.email,
        phone: appt.phone,
        comments: appt.comments,
        status: 'BOOKED',
        location: appt.location,
        clinic: appt.clinic,
        created_at: now,
        updated_at: now,
        token: generateId(),
        calendar_event_id: '',
        cancelled_at: '',
        cancel_reason: '',
        booking_source: appt.booking_source || '',
      };

      await insertAppointment(env.DB, newAppt);
      takenSameDay.add(newSlot.start);

      // Create new calendar event
      try {
        const eventId = await createCalendarEvent(env, newAppt);
        if (eventId) {
          await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, newAppt.id).run();
        }
      } catch {}

      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendAppointmentPushedEmail(env, appt, dateKey, newSlot.start, newSlot.end).catch(() => {}));

      results.push({ appointmentId: newAppt.id, action: 'pushed_same_day', patient: appt.full_name, newTime: newSlot.start });
    }
  }

  if (results.length > 0) await bumpVersion(env.DB);
  await broadcast(env, dateKey);

  return json({ ok: true, message: `Processed ${results.length} appointment(s).`, processed: results.length, results });
}

// ─── Notify Patients ───────────────────────────────────────

export async function apiAdminNotifyPatients(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const payload: any = await req.json();
  const dateKey = (payload.dateKey || '').trim();
  const appointmentIds: string[] = payload.appointmentIds || [];
  const message = (payload.message || '').trim();

  if (!dateKey || !message || !appointmentIds.length) return json({ ok: false, reason: 'Missing fields.' }, 400);

  const allAppts = await getActiveAppointmentsByDate(env.DB, dateKey);
  const idSet = new Set(appointmentIds);
  let sent = 0;

  for (const a of allAppts) {
    if (!idSet.has(a.id)) continue;
    try { await sendCustomNotificationEmail(env, a, message); sent++; } catch {}
  }

  return json({ ok: true, message: `Notification sent to ${sent} patient(s).`, sent });
}

// ─── Review Patients ───────────────────────────────────────

export async function apiAdminGetReviewPatients(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || '').trim() || toDateKey(todayLocal(tz));

  const allAppts = await getAppointmentsByDate(env.DB, dateKey);

  const potters: any[] = [];
  const spinola: any[] = [];

  for (const a of allAppts) {
    if (!a.email || a.status.includes('CANCELLED')) continue;
    const reviewSent = await isReviewSent(env.DB, a.id);
    const item = {
      appointmentId: a.id,
      fullName: a.full_name,
      email: a.email,
      startTime: a.start_time,
      serviceName: a.service_name,
      status: a.status,
      reviewSent,
      bookingSource: (a as any).booking_source || '',
    };
    if (a.clinic === 'spinola') {
      spinola.push(item);
    } else if (a.status !== 'RELOCATED_SPINOLA') {
      potters.push(item);
    }
  }

  return json({ ok: true, potters, spinola, dateKey });
}

// ─── Send Review Requests ──────────────────────────────────

export async function apiAdminSendReviewRequests(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const payload: any = await req.json();
  const appointmentIds: string[] = payload.appointmentIds || [];
  const location = payload.location || 'potters';
  const teamNames: string[] = payload.teamNames || [];

  const dateKey = (payload.dateKey || '').trim() || toDateKey(todayLocal(tz));

  if (!appointmentIds.length || !teamNames.length) return json({ ok: false, reason: 'Missing selections.' }, 400);

  const allAppts = await getAppointmentsByDate(env.DB, dateKey);
  const idSet = new Set(appointmentIds);
  let sent = 0;

  for (const a of allAppts) {
    if (!idSet.has(a.id) || !a.email) continue;
    try {
      await sendReviewRequestEmail(env, a, location as any, teamNames);
      await markReviewSent(env.DB, a.id, nowIso(tz));
      sent++;
    } catch {}
  }

  return json({ ok: true, message: `Review request sent to ${sent} patient(s).`, sent });
}

// ─── Week Overview ─────────────────────────────────────────

export async function apiAdminGetWeekOverview(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const weekStart = (url.searchParams.get('week') || '').trim();
  if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return json({ ok: false, reason: 'Invalid week start.' }, 400);

  const cfg = await getConfig(env.DB);
  const offRows = await getDoctorOffRows(env.DB);
  const extraRows = await getDoctorExtraRows(env.DB);
  const days: any[] = [];

  for (let d = 0; d < 7; d++) {
    const dt = addDays(parseDateKey(weekStart), d);
    const dk = toDateKey(dt);

    const appts = await getAppointmentsByDate(env.DB, dk);
    const count = appts.filter(a => a.clinic !== 'spinola' && ['BOOKED', 'RELOCATED_SPINOLA', 'ATTENDED'].includes(a.status)).length;
    const hasBlock = offRows.some(r => r.start_date <= dk && r.end_date >= dk);
    const hasExtra = extraRows.some(r => r.date_key === dk);
    const hasHours = (cfg.workingHours[dayOfWeekKey(dt)] || []).length > 0;

    days.push({ dateKey: dk, count, hasBlock, hasExtra, hasHours });
  }

  return json({ ok: true, days });
}

// ─── Search ────────────────────────────────────────────────

export async function apiAdminSearchAppointments(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const query = (url.searchParams.get('q') || '').trim();
  if (!query || query.length < 2) return json({ ok: false, reason: 'Query too short.' }, 400);

  const results = await searchAppointments(env.DB, query, 50);
  return json({ ok: true, results });
}

// ─── Settings ──────────────────────────────────────────────

export async function apiAdminGetSettings(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const cfg = await getConfig(env.DB);
  return json({
    ok: true,
    settings: {
      doctorEmail: env.DOCTOR_EMAIL,
      timezone: env.TIMEZONE,
      pottersLocation: cfg.pottersLocation,
      spinolaLocation: cfg.spinolaLocation,
      apptDurationMin: cfg.apptDurationMin,
      advanceDays: cfg.advanceDays,
      maxActiveApptsPerPerson: cfg.maxActiveApptsPerPerson,
      workingHours: cfg.workingHours,
      spinolaHours: cfg.spinolaHours,
    },
  });
}

export async function apiAdminSaveSettings(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const payload: any = await req.json();

  if (payload.apptDurationMin !== undefined) await setConfigValue(env.DB, 'APPT_DURATION_MIN', String(payload.apptDurationMin));
  if (payload.advanceDays !== undefined) await setConfigValue(env.DB, 'ADVANCE_DAYS', String(payload.advanceDays));
  if (payload.maxActiveApptsPerPerson !== undefined) await setConfigValue(env.DB, 'MAX_ACTIVE_APPTS_PER_PERSON', String(payload.maxActiveApptsPerPerson));

  if (payload.workingHours !== undefined) await setConfigValue(env.DB, 'WORKING_HOURS', JSON.stringify(payload.workingHours));
  if (payload.spinolaHours !== undefined) await setConfigValue(env.DB, 'SPINOLA_WORKING_HOURS', JSON.stringify(payload.spinolaHours));
  if (payload.pottersLocation !== undefined) await setConfigValue(env.DB, 'POTTERS_LOCATION', payload.pottersLocation);
  if (payload.spinolaLocation !== undefined) await setConfigValue(env.DB, 'SPINOLA_LOCATION', payload.spinolaLocation);

  await bumpVersion(env.DB);
  await broadcast(env, '');

  return json({ ok: true, message: 'Settings saved.' });
}

// ─── Statistics ────────────────────────────────────────────

export async function apiAdminGetStatistics(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const cfg = await getConfig(env.DB);
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '28';

  // Determine date range based on period
  let periodFrom: string;
  let periodLabel: string;
  if (period === 'week') {
    // This week (Monday to Sunday)
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    periodFrom = toDateKey(addDays(today, mondayOffset));
    periodLabel = 'This Week';
  } else if (period === 'all') {
    periodFrom = '2000-01-01';
    periodLabel = 'All Time';
  } else {
    periodFrom = toDateKey(addDays(today, -28));
    periodLabel = 'Last 28 Days';
  }

  const future7 = toDateKey(addDays(today, 7));

  // For week/28: fetch range. For all: fetch everything.
  const rawPeriodAppts = period === 'all'
    ? await getAllAppointments(env.DB)
    : await getAppointmentsByDateRange(env.DB, periodFrom, future7);
  // Exclude Linda's physio bookings from Kevin/Spinola statistics — they have
  // their own admin tab that queries clinic='linda' directly.
  const periodAppts = rawPeriodAppts.filter(a => a.clinic !== 'linda');

  // Helper: compute core stats from any appointment array
  function computeCoreStats(appts: any[]) {
    let _total = 0, _cancelled = 0, _cancelledClient = 0, _cancelledDoctor = 0;
    let _attended = 0, _noShow = 0, _pottersCount = 0, _spinolaCount = 0;
    const _patientCounts: Record<string, number> = {};
    const _cancellerCounts: Record<string, number> = {};
    let _leadTimeSum = 0, _leadTimeCount = 0;

    for (const a of appts) {
      // Skip relocated originals (phantom records) — the spinola copy is the real appointment
      if (a.status === 'RELOCATED_SPINOLA' && a.clinic !== 'spinola') continue;
      _total++;
      if (a.status.includes('CANCELLED')) {
        _cancelled++;
        if (a.status === 'CANCELLED_CLIENT') _cancelledClient++;
        if (a.status === 'CANCELLED_DOCTOR') _cancelledDoctor++;
        const key = a.full_name + '|' + a.email;
        _cancellerCounts[key] = (_cancellerCounts[key] || 0) + 1;
      }
      if (a.status === 'ATTENDED') _attended++;
      if (a.status === 'NO_SHOW') _noShow++;
      if (a.clinic === 'spinola') _spinolaCount++; else _pottersCount++;
      if (!a.status.includes('CANCELLED')) {
        const key = a.full_name + '|' + a.email;
        _patientCounts[key] = (_patientCounts[key] || 0) + 1;
      }
      try {
        const created = new Date(a.created_at.replace(' ', 'T'));
        const apptDate = parseDateKey(a.date_key);
        const diff = (apptDate.getTime() - created.getTime()) / 86400000;
        if (diff >= 0) { _leadTimeSum += diff; _leadTimeCount++; }
      } catch {}
    }

    const _uniqueEmails = new Set(appts.filter((a: any) => !a.status.includes('CANCELLED')).map((a: any) => a.email));
    const _topPatients = Object.entries(_patientCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([k, c]) => ({ name: k.split('|')[0], email: k.split('|')[1], count: c }));
    const _topCancellers = Object.entries(_cancellerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([k, c]) => ({ name: k.split('|')[0], email: k.split('|')[1], count: c }));

    const _sameDayCancels = appts.filter((a: any) => {
      if (!a.status.includes('CANCELLED') || !a.cancelled_at) return false;
      return a.cancelled_at.startsWith(a.date_key);
    }).length;

    // Country
    const _countryCounts: Record<string, number> = {};
    for (const a of appts) {
      if (a.status.includes('CANCELLED')) continue;
      const phone = String(a.phone || '').replace(/[^0-9]/g, '');
      let country = 'Other';
      for (const [prefix, name] of Object.entries(countryMap)) {
        if (phone.startsWith(prefix)) { country = name; break; }
      }
      _countryCounts[country] = (_countryCounts[country] || 0) + 1;
    }

    // Source
    const _sourceCounts: Record<string, number> = {};
    for (const a of appts) {
      if (a.status.includes('CANCELLED')) continue;
      const src = (a as any).booking_source || 'direct';
      _sourceCounts[src] = (_sourceCounts[src] || 0) + 1;
    }

    // Busiest day
    const _dayApptCounts: Record<string, number> = {};
    for (const a of appts) {
      if (!a.status.includes('CANCELLED')) _dayApptCounts[a.date_key] = (_dayApptCounts[a.date_key] || 0) + 1;
    }
    let _busiestDay: { dateKey: string; dayName: string; count: number } | null = null;
    for (const [dk, count] of Object.entries(_dayApptCounts)) {
      if (!_busiestDay || count > _busiestDay.count) {
        try { _busiestDay = { dateKey: dk, dayName: dayOfWeekKey(parseDateKey(dk)), count }; } catch {}
      }
    }

    // Spinola sub-stats
    const _spAppts = appts.filter((a: any) => a.clinic === 'spinola');
    const _spCancelled = _spAppts.filter((a: any) => a.status.includes('CANCELLED')).length;
    const _spNoShow = _spAppts.filter((a: any) => a.status === 'NO_SHOW').length;
    const _spUniqueEmails = new Set(_spAppts.filter((a: any) => !a.status.includes('CANCELLED')).map((a: any) => a.email));
    const _spDirect = _spAppts.filter((a: any) => a.status !== 'RELOCATED_SPINOLA' && !a.status.includes('CANCELLED')).length;
    const _spRedirected = _spAppts.filter((a: any) => a.status === 'RELOCATED_SPINOLA').length;
    const _spCancelledClient = _spAppts.filter((a: any) => a.status === 'CANCELLED_CLIENT').length;
    const _spCancelledDoctor = _spAppts.filter((a: any) => a.status === 'CANCELLED_DOCTOR').length;
    const _spPatCounts: Record<string, number> = {};
    for (const a of _spAppts) { if (!a.status.includes('CANCELLED')) { const k = a.full_name + '|' + a.email; _spPatCounts[k] = (_spPatCounts[k] || 0) + 1; } }
    const _spTopPat = Object.entries(_spPatCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([k, c]) => ({ name: k.split('|')[0], email: k.split('|')[1], count: c }));
    const _spCancellerCounts: Record<string, number> = {};
    for (const a of _spAppts) { if (a.status.includes('CANCELLED')) { const k = a.full_name + '|' + a.email; _spCancellerCounts[k] = (_spCancellerCounts[k] || 0) + 1; } }
    const _spTopCancellers = Object.entries(_spCancellerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([k, c]) => ({ name: k.split('|')[0], email: k.split('|')[1], count: c }));
    const _spCountry: Record<string, number> = {};
    for (const a of _spAppts) {
      if (a.status.includes('CANCELLED')) continue;
      const ph = String(a.phone || '').replace(/[^0-9]/g, '');
      let cn = 'Other';
      for (const [p, n] of Object.entries(countryMap)) { if (ph.startsWith(p)) { cn = n; break; } }
      _spCountry[cn] = (_spCountry[cn] || 0) + 1;
    }

    return {
      totalBooked: _total - _cancelled,
      total: _total,
      cancelled: _cancelled,
      cancelRate: _total > 0 ? (_cancelled / _total * 100).toFixed(1) : '0',
      attended: _attended,
      noShow: _noShow,
      totalUniquePatients: _uniqueEmails.size,
      repeatPatients: Object.values(_patientCounts).filter(c => c > 1).length,
      cancelBreakdown: { byDoctor: _cancelledDoctor, byPatient: _cancelledClient },
      locationSplit: { potters: _pottersCount, spinola: _spinolaCount },
      topPatients: _topPatients,
      topCancellers: _topCancellers,
      avgLeadTimeDays: _leadTimeCount > 0 ? (_leadTimeSum / _leadTimeCount).toFixed(1) : '0',
      sameDayCancels: _sameDayCancels,
      countryBreakdown: Object.entries(_countryCounts).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count })),
      sourceBreakdown: Object.entries(_sourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count })),
      relocatedSpinola: _spRedirected,
      busiestDay: _busiestDay,
      spinola: {
        totalBooked: _spinolaCount - _spCancelled,
        cancelRate: _spinolaCount > 0 ? (_spCancelled / _spinolaCount * 100).toFixed(1) : '0',
        noShowRate: _spinolaCount > 0 ? (_spNoShow / _spinolaCount * 100).toFixed(1) : '0',
        uniquePatients: _spUniqueEmails.size,
        directBookings: _spDirect,
        relocatedBookings: _spRedirected,
        cancelBreakdown: { byDoctor: _spCancelledDoctor, byPatient: _spCancelledClient },
        topCancellers: _spTopCancellers,
        topPatients: _spTopPat,
        countryBreakdown: Object.entries(_spCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count })),
      },
    };
  }

  const countryMap: Record<string, string> = {
    '356':'Malta','44':'UK','33':'France','49':'Germany','39':'Italy','34':'Spain',
    '31':'Netherlands','32':'Belgium','46':'Sweden','47':'Norway','48':'Poland',
    '36':'Hungary','420':'Czech','421':'Slovakia','43':'Austria','41':'Switzerland',
    '351':'Portugal','30':'Greece','353':'Ireland','358':'Finland','45':'Denmark',
    '1':'US/Canada','61':'Australia','81':'Japan','86':'China','91':'India','7':'Russia',
  };

  // Compute core stats for the requested period
  const periodStats = computeCoreStats(periodAppts);

  // Time-bounded stats: only for 28-day period
  let weeklyTrend: any[] | null = null;
  let hourlyDistribution: number[] | null = null;
  let utilization: number | null = null;
  let upcomingLoad: any[] | null = null;
  let trendDirection = '';
  let trendPct = 0;
  let byDay: Record<string, number> | null = null;
  let sWeekly: any[] | null = null;
  let sHourly: number[] | null = null;

  // Utilization + utilization by day — computed for ALL periods
  const offRows = await getDoctorOffRows(env.DB);
  const extraRows = await getDoctorExtraRows(env.DB);
  const extraMap = buildExtraMap(extraRows);
  {
    let totalSlots = 0, bookedSlots = 0;
    const dowSlots: Record<string, number> = {};
    const dowBooked: Record<string, number> = {};

    // Pre-build booked-per-date map to avoid O(n*days) filtering
    const bookedByDate: Record<string, number> = {};
    for (const a of periodAppts) {
      if (!a.status.includes('CANCELLED')) {
        bookedByDate[a.date_key] = (bookedByDate[a.date_key] || 0) + 1;
      }
    }

    // Determine start date for slot iteration
    let iterStart: Date | null = null;
    if (period === 'all') {
      let earliest = todayKey;
      for (const a of periodAppts) {
        if (a.date_key < earliest) earliest = a.date_key;
      }
      if (periodAppts.length > 0) iterStart = parseDateKey(earliest);
    } else if (period === 'week') {
      iterStart = parseDateKey(periodFrom);
    } else {
      iterStart = addDays(today, -28);
    }

    if (iterStart) {
      let iterDate = new Date(iterStart.getTime());
      while (toDateKey(iterDate) <= todayKey) {
        const dk = toDateKey(iterDate);
        const dow = dayOfWeekKey(iterDate);
        const slots = buildSlotsForDate(iterDate, cfg.apptDurationMin, extraMap[dk] || null, cfg.workingHours);
        const dayBooked = bookedByDate[dk] || 0;
        totalSlots += slots.length;
        bookedSlots += dayBooked;
        dowSlots[dow] = (dowSlots[dow] || 0) + slots.length;
        dowBooked[dow] = (dowBooked[dow] || 0) + dayBooked;
        iterDate = addDays(iterDate, 1);
      }
    }
    utilization = totalSlots > 0 ? Math.round(bookedSlots / totalSlots * 100) : 0;

    const _byDay: Record<string, number> = {};
    for (const dow of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']) {
      _byDay[dow] = (dowSlots[dow] || 0) > 0 ? Math.round((dowBooked[dow] || 0) / dowSlots[dow] * 100) : 0;
    }
    byDay = _byDay;
  }

  if (period === '28') {
    // Hourly distribution
    const byHour: Record<number, number> = {};
    for (const a of periodAppts) {
      try { const hour = parseTimeToMinutes(a.start_time) / 60 | 0; byHour[hour] = (byHour[hour] || 0) + 1; } catch {}
    }
    hourlyDistribution = [];
    for (let h = 7; h <= 20; h++) hourlyDistribution.push(byHour[h] || 0);

    // Weekly trend
    weeklyTrend = [];
    for (let w = 3; w >= 0; w--) {
      const wStart = toDateKey(addDays(today, -w * 7 - 6));
      const wEnd = toDateKey(addDays(today, -w * 7));
      const wa = periodAppts.filter(a => a.date_key >= wStart && a.date_key <= wEnd);
      weeklyTrend.push({ label: wStart.slice(5), booked: wa.filter(a => !a.status.includes('CANCELLED')).length, cancelled: wa.filter(a => a.status.includes('CANCELLED')).length });
    }
    const thisWeekBooked = weeklyTrend.length >= 1 ? weeklyTrend[weeklyTrend.length - 1].booked : 0;
    const lastWeekBooked = weeklyTrend.length >= 2 ? weeklyTrend[weeklyTrend.length - 2].booked : 0;
    trendDirection = thisWeekBooked > lastWeekBooked ? 'up' : thisWeekBooked < lastWeekBooked ? 'down' : '';
    trendPct = lastWeekBooked > 0 ? Math.round(Math.abs(thisWeekBooked - lastWeekBooked) / lastWeekBooked * 100) : 0;

    // Upcoming load
    upcomingLoad = [];
    for (let d = 0; d < 7; d++) {
      const dt = addDays(today, d);
      const dk = toDateKey(dt);
      const dow = dayOfWeekKey(dt);
      const slots = buildSlotsForDate(dt, cfg.apptDurationMin, extraMap[dk] || null, cfg.workingHours);
      const dayAppts = periodAppts.filter(a => a.date_key === dk && !a.status.includes('CANCELLED'));
      upcomingLoad.push({ dateKey: dk, dayLabel: dow, booked: dayAppts.length, capacity: slots.length });
    }

    // Spinola weekly + hourly
    const spAppts = periodAppts.filter(a => a.clinic === 'spinola');
    sWeekly = [];
    for (let w = 3; w >= 0; w--) {
      const ws = toDateKey(addDays(today, -w * 7 - 6));
      const we = toDateKey(addDays(today, -w * 7));
      const wa = spAppts.filter(a => a.date_key >= ws && a.date_key <= we);
      sWeekly.push({ label: ws.slice(5), booked: wa.filter(a => !a.status.includes('CANCELLED')).length, cancelled: wa.filter(a => a.status.includes('CANCELLED')).length });
    }
    sHourly = [];
    for (let h = 7; h <= 20; h++) {
      sHourly.push(spAppts.filter(a => !a.status.includes('CANCELLED') && (parseTimeToMinutes(a.start_time) / 60 | 0) === h).length);
    }
  }

  return json({
    ok: true,
    stats: {
      ...periodStats,
      total: periodStats.total,
      cancelRate: periodStats.cancelRate,
      attended: periodStats.attended,
      noShow: periodStats.noShow,
      pottersCount: periodStats.locationSplit.potters,
      spinolaCount: periodStats.locationSplit.spinola,
      totalBooked: periodStats.totalBooked,
      utilization,
      trendDirection,
      trendPct,
      weeklyTrend,
      hourlyDistribution,
      upcomingLoad,
      byDay,
      periodLabel,
      period: { from: periodFrom, to: todayKey },
      generated: nowIso(tz),
      spinola: {
        ...periodStats.spinola,
        weeklyTrend: sWeekly,
        hourlyDistribution: sHourly,
      },
    },
  });
}

// ─── Attendance ────────────────────────────────────────────

export async function apiAdminMarkAttendance(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const payload: any = await req.json();
  const appointmentId = (payload.appointmentId || '').trim();
  const attended = payload.attended;

  if (!appointmentId) return json({ ok: false, reason: 'Missing appointment ID.' }, 400);

  const now = nowIso(env.TIMEZONE);
  await updateAppointmentStatus(env.DB, appointmentId, {
    status: attended ? 'ATTENDED' : 'NO_SHOW',
  }, now);
  await bumpVersion(env.DB);

  return json({ ok: true, message: attended ? 'Marked as attended.' : 'Marked as no-show.' });
}

// ─── Bulk Doctor Off Dates ─────────────────────────────────

export async function apiAdminDoctorOffDates(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const payload: any = await req.json();
  const mode = (payload.mode || '').trim();
  const dateKeys: string[] = payload.dateKeys || [];

  if (!mode || !['cancel', 'reactivate'].includes(mode)) {
    return json({ ok: false, reason: 'Invalid mode. Must be "cancel" or "reactivate".' }, 400);
  }
  if (!dateKeys.length) {
    return json({ ok: false, reason: 'No dates provided.' }, 400);
  }

  // Validate all date keys
  for (const dk of dateKeys) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) {
      return json({ ok: false, reason: `Invalid date format: ${dk}` }, 400);
    }
  }

  if (mode === 'cancel') {
    // Create all-day doctor_off entries for each date
    for (const dk of dateKeys) {
      await addDoctorOff(env.DB, {
        start_date: dk,
        end_date: dk,
        start_time: '',
        end_time: '',
        reason: 'Doctor not available',
      });
    }
  } else {
    // Reactivate: delete all-day doctor_off entries for each date
    const offRows = await getDoctorOffRows(env.DB);
    for (const dk of dateKeys) {
      // Find all-day off entries that cover this specific date
      const matching = offRows.filter(r =>
        r.start_date === dk && r.end_date === dk && !r.start_time && !r.end_time
      );
      for (const row of matching) {
        await deleteDoctorOff(env.DB, row.id);
      }
    }
  }

  await bumpVersion(env.DB);
  if (dateKeys.length > 0) await broadcast(env, dateKeys[0]);

  return json({ ok: true });
}

// ─── Patient History ───────────────────────────────────────

export async function apiAdminGetPatientHistory(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').trim();
  const phone = (url.searchParams.get('phone') || '').trim();

  if (!email && !phone) return json({ ok: false, reason: 'Missing email or phone.' }, 400);

  const history = await getPatientHistory(env.DB, email, phone, 100);

  // Compute summary stats
  const name = history.length > 0 ? history[0].full_name : '';
  const totalVisits = history.filter(a => !a.status.includes('CANCELLED')).length;
  const cancelCount = history.filter(a => a.status.includes('CANCELLED')).length;
  const noShowCount = history.filter(a => a.status === 'NO_SHOW').length;
  const firstSeen = history.length > 0 ? history[history.length - 1].date_key : '';

  return json({
    ok: true,
    patient: { name, email, phone },
    totalVisits,
    cancelCount,
    noShowCount,
    firstSeen,
    appointments: history,
    history,
  });
}

// ─── Test Mode: Create test bookings & purge ──────────────────

export async function apiAdminCreateTestBooking(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const body: any = await req.json();
  const cfg = await getConfig(env.DB);
  const tz = env.TIMEZONE;
  const today = toDateKey(todayLocal(tz));
  const dateKey = body.dateKey || today;
  const clinic = body.clinic || 'potters';
  const startTime = body.startTime || '10:00';
  const endMin = parseTimeToMinutes(startTime) + cfg.apptDurationMin;
  const endTime = minutesToTime(endMin);

  const id = 'TEST-' + generateId();
  const token = generateId();
  const appt: Appointment = {
    id,
    date_key: dateKey,
    start_time: startTime,
    end_time: endTime,
    service_id: 'clinic',
    service_name: 'Clinic Consultation',
    full_name: body.name || 'Test Patient ' + Math.floor(Math.random() * 1000),
    email: body.email || 'test@example.com',
    phone: body.phone || '35699999999',
    comments: 'TEST BOOKING — safe to delete',
    status: 'BOOKED',
    location: clinic === 'spinola' ? (cfg as any).spinolaLocation || 'Spinola Clinic' : (cfg as any).pottersLocation || "Potter's Pharmacy Clinic",
    clinic,
    created_at: nowIso(tz),
    updated_at: nowIso(tz),
    token,
    calendar_event_id: '',
    cancelled_at: '',
    cancel_reason: '',
    booking_source: 'test',
  };

  await insertAppointment(env.DB, appt);
  await bumpVersion(env.DB);
  await broadcast(env, dateKey);

  // Create Google Calendar event
  try {
    const eventId = await createCalendarEvent(env, appt);
    if (eventId) {
      await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, appt.id).run();
    }
  } catch (e) { console.error('Calendar create error:', e); }

  return json({ ok: true, appointment: appt, message: 'Test booking created: ' + id });
}

export async function apiAdminPurgeTestData(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  // Delete calendar events for test appointments first
  const testAppts = await env.DB.prepare("SELECT id, calendar_event_id, clinic FROM appointments WHERE (id LIKE 'TEST-%' OR full_name LIKE 'Test %' OR full_name LIKE 'TEST %') AND calendar_event_id != ''").all();
  for (const row of (testAppts.results || [])) {
    try { await deleteCalendarEvent(env, row.calendar_event_id as string, (row.clinic as string || 'potters') as any); } catch {}
  }

  // Delete all test appointments (by ID prefix OR name starting with Test/TEST)
  const result = await env.DB.prepare("DELETE FROM appointments WHERE id LIKE 'TEST-%' OR full_name LIKE 'Test %' OR full_name LIKE 'TEST %'").run();
  // Also delete test clients
  await env.DB.prepare("DELETE FROM clients WHERE email = 'test@example.com'").run();
  // Delete test referrals
  try { await env.DB.prepare("DELETE FROM referrals WHERE referrer_name LIKE 'Test %' OR referrer_name LIKE 'TEST %' OR referred_name LIKE 'Test %' OR referred_name LIKE 'TEST %'").run(); } catch {}
  // Delete test follow-ups
  try { await env.DB.prepare("DELETE FROM follow_ups WHERE patient_name LIKE 'Test %' OR patient_name LIKE 'TEST %'").run(); } catch {}
  await bumpVersion(env.DB);

  // Broadcast to all WebSocket clients (booking page + admin + doctor)
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: '' }),
    });
  } catch {}

  return json({ ok: true, deleted: result.meta?.changes || 0, message: 'All test data purged.' });
}

// ─── Test Follow-up ──────────────────────────────────────────

export async function apiAdminTestFollowUp(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const tz = env.TIMEZONE;
  const cfg = await getConfig(env.DB);
  const yesterdayKey = toDateKey(addDays(todayLocal(tz), -1));

  // Create a test ATTENDED appointment from yesterday
  const id = 'TEST-' + generateId();
  const token = generateId();
  const appt: Appointment = {
    id,
    date_key: yesterdayKey,
    start_time: '10:00',
    end_time: '10:10',
    service_id: 'clinic',
    service_name: 'Clinic Consultation',
    full_name: 'Test John',
    email: 'labrint@gmail.com',
    phone: '+35679206470',
    comments: 'TEST FOLLOW-UP — safe to delete',
    status: 'ATTENDED',
    location: (cfg as any).pottersLocation || "Potter's Pharmacy Clinic",
    clinic: 'potters',
    created_at: nowIso(tz),
    updated_at: nowIso(tz),
    token,
    calendar_event_id: '',
    cancelled_at: '',
    cancel_reason: '',
    booking_source: 'test',
  };

  try { await insertAppointment(env.DB, appt); } catch {}

  // Send follow-up immediately
  await sendFollowUpEmail(env, appt);
  try {
    await insertFollowUp(env.DB, {
      appointment_id: appt.id,
      clinic: 'potters',
      patient_name: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      date_key: appt.date_key,
      sent_at: nowIso(tz),
    });
  } catch {}

  return json({ ok: true, message: 'Test follow-up email sent to labrint@gmail.com' });
}

// ─── Get Follow-ups ──────────────────────────────────────────

export async function apiAdminGetFollowUps(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const url = new URL(req.url);
  const status = (url.searchParams.get('status') || '').trim() || undefined;
  const all = await getFollowUps(env.DB, status);
  // Kevin's follow-ups tab should not see Linda's physio follow-ups.
  const followUps = all.filter((f: any) => f.clinic !== 'linda');
  return json({ ok: true, followUps });
}

export async function apiAdminGetReferrals(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;
  try {
    const referrals = await getReferrals(env.DB);
    return json({ ok: true, referrals });
  } catch {
    return json({ ok: true, referrals: [] });
  }
}

export async function apiAdminToggleFollowUpHandled(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;
  const body: any = await req.json();
  const id = body.id;
  const handled = body.handled;
  if (!id) return json({ ok: false, reason: 'Missing id.' }, 400);
  const newStatus = handled ? 'handled' : 'responded';
  await env.DB.prepare('UPDATE follow_ups SET status = ? WHERE id = ?').bind(newStatus, id).run();
  return json({ ok: true });
}

// ─── Linda (Physiotherapy) admin ─────────────────────────────
// All four handlers below scope strictly to clinic='linda'. They read only
// from the appointments / follow_ups / review_sent tables and never touch
// Kevin's or Spinola's data or endpoints.

export async function apiAdminGetLindaStats(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const rows = await env.DB.prepare(
    "SELECT status, date_key, start_time, full_name, email, phone FROM appointments WHERE clinic = 'linda' ORDER BY date_key, start_time"
  ).all<{ status: string; date_key: string; start_time: string; full_name: string; email: string; phone: string }>();

  const appts = rows.results;
  let total = 0, booked = 0, cancelled = 0, attended = 0, noShow = 0;
  const byDate: Record<string, number> = {};
  const upcoming: any[] = [];
  const tz = env.TIMEZONE;
  const todayKey = toDateKey(todayLocal(tz));

  for (const a of appts) {
    total++;
    if (a.status === 'BOOKED') booked++;
    if (a.status.includes('CANCELLED')) cancelled++;
    if (a.status === 'ATTENDED') attended++;
    if (a.status === 'NO_SHOW') noShow++;
    if (!a.status.includes('CANCELLED')) {
      byDate[a.date_key] = (byDate[a.date_key] || 0) + 1;
    }
    if (a.status === 'BOOKED' && a.date_key >= todayKey) {
      upcoming.push({
        dateKey: a.date_key, startTime: a.start_time,
        fullName: a.full_name, email: a.email, phone: a.phone,
      });
    }
  }

  return json({
    ok: true,
    totals: { total, booked, cancelled, attended, noShow },
    byDate,
    upcoming,
  });
}

export async function apiAdminGetLindaAppointments(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const rows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE clinic = 'linda' ORDER BY date_key DESC, start_time"
  ).all<Appointment>();
  return json({ ok: true, appointments: rows.results });
}

export async function apiAdminGetLindaReviewPatients(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const tz = env.TIMEZONE;
  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || '').trim() || toDateKey(todayLocal(tz));

  const rows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE clinic = 'linda' AND date_key = ?"
  ).bind(dateKey).all<Appointment>();

  const patients: any[] = [];
  for (const a of rows.results) {
    if (!a.email || a.status.includes('CANCELLED')) continue;
    const reviewSent = await isReviewSent(env.DB, a.id);
    patients.push({
      appointmentId: a.id,
      fullName: a.full_name,
      email: a.email,
      startTime: a.start_time,
      serviceName: a.service_name,
      status: a.status,
      reviewSent,
    });
  }
  return json({ ok: true, patients, dateKey });
}

export async function apiAdminSendLindaReviewRequests(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const tz = env.TIMEZONE;
  const payload: any = await req.json();
  const appointmentIds: string[] = payload.appointmentIds || [];
  const teamNames: string[] = payload.teamNames || [env.LINDA_DOCTOR_NAME || 'Linda'];
  const dateKey = (payload.dateKey || '').trim() || toDateKey(todayLocal(tz));

  if (!appointmentIds.length) return json({ ok: false, reason: 'No patients selected.' }, 400);

  const rows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE clinic = 'linda' AND date_key = ?"
  ).bind(dateKey).all<Appointment>();

  const idSet = new Set(appointmentIds);
  let sent = 0;
  for (const a of rows.results) {
    if (!idSet.has(a.id) || !a.email) continue;
    try {
      await sendReviewRequestEmail(env, a, 'linda', teamNames);
      await markReviewSent(env.DB, a.id, nowIso(tz));
      sent++;
    } catch (e) { console.error('Linda review send error:', a.id, e); }
  }

  return json({ ok: true, message: `Review request sent to ${sent} patient(s).`, sent });
}

export async function apiAdminGetLindaFollowUps(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const url = new URL(req.url);
  const status = (url.searchParams.get('status') || '').trim() || undefined;
  const followUps = await getFollowUps(env.DB, status, 'linda');
  return json({ ok: true, followUps });
}

// ─── Linda Config (availability) ────────────────────────────

export async function apiAdminGetLindaConfig(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;
  const cfg = await loadLindaConfig(env.DB);
  return json({ ok: true, config: cfg });
}

export async function apiAdminSaveLindaConfig(req: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(req, env);
  if (deny) return deny;

  const body: any = await req.json();
  const enabled = body.enabled === true || body.enabled === '1' || body.enabled === 1;
  const windowStart = String(body.windowStart || '').trim();
  const windowEnd = String(body.windowEnd || '').trim();
  const slotMin = parseInt(String(body.slotMin || '30'), 10) || 30;

  // hours: expect a WorkingHours-shaped object; we validate loosely.
  const hoursRaw = body.hours;
  if (!hoursRaw || typeof hoursRaw !== 'object') {
    return json({ ok: false, reason: 'Missing hours object.' }, 400);
  }
  const validDays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const hours: Record<string, any[]> = {};
  for (const d of validDays) {
    const arr = Array.isArray(hoursRaw[d]) ? hoursRaw[d] : [];
    hours[d] = arr.filter((w: any) => w && typeof w.start === 'string' && typeof w.end === 'string')
      .map((w: any) => ({ start: w.start, end: w.end }));
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(windowStart)) return json({ ok: false, reason: 'Invalid start date.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(windowEnd)) return json({ ok: false, reason: 'Invalid end date.' }, 400);
  if (windowEnd < windowStart) return json({ ok: false, reason: 'End date must be on or after start date.' }, 400);
  if (slotMin < 5 || slotMin > 240) return json({ ok: false, reason: 'Slot duration must be 5–240 minutes.' }, 400);

  await setConfigValue(env.DB, 'LINDA_ENABLED', enabled ? '1' : '0');
  await setConfigValue(env.DB, 'LINDA_WINDOW_START', windowStart);
  await setConfigValue(env.DB, 'LINDA_WINDOW_END', windowEnd);
  await setConfigValue(env.DB, 'LINDA_SLOT_MIN', String(slotMin));
  await setConfigValue(env.DB, 'LINDA_HOURS', JSON.stringify(hours));
  await bumpVersion(env.DB);

  return json({ ok: true, message: 'Linda availability saved.', config: await loadLindaConfig(env.DB) });
}
