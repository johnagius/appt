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
  searchAppointments, getAppointmentsByDateRange, getPatientHistory,
  slotBlockedByDoctorOff, doctorOffReason, findNextAvailableDay,
  setConfigValue, getTakenSlots, isReviewSent, markReviewSent,
} from '../db/queries';
import { verifyAdminSig, generateId } from '../services/crypto';
import {
  sendClientCancelledEmail, sendRedirectToSpinolaEmail,
  sendAppointmentPushedEmail, sendCustomNotificationEmail, sendReviewRequestEmail,
} from '../services/email';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendar';

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

function broadcast(env: Env, dateKey: string) {
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        const id = env.REALTIME.idFromName('global');
        const stub = env.REALTIME.get(id);
        await stub.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify({ type: 'slots_updated', dateKey }),
        });
      } catch {}
    })());
  }
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

  // Week stats
  let weekBooked = 0, weekCancelled = 0;
  for (let d = 0; d <= 6; d++) {
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
    todayAppointments: todayAppts,
    tomorrowAppointments: tomorrowAppts,
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
  return json({ ok: true, dateKey, appointments: appts });
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

  broadcast(env, startDate);
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

  broadcast(env, date);
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
  broadcast(env, '');
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
  broadcast(env, '');
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
    for (const appt of appts) {
      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'RELOCATED_SPINOLA',
        location: cfg.spinolaLocation,
      }, now);

      // Create spinola copy
      try {
        await insertAppointment(env.DB, {
          ...appt,
          id: 'A-' + generateId(),
          clinic: 'spinola',
          status: 'RELOCATED_SPINOLA',
          location: cfg.spinolaLocation,
          updated_at: now,
        });
      } catch {}

      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendRedirectToSpinolaEmail(env, appt, cfg.spinolaLocation).catch(() => {}));

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

      if (!newSlot) {
        await updateAppointmentStatus(env.DB, appt.id, {
          status: 'CANCELLED_DOCTOR',
          cancelled_at: now,
          cancel_reason: 'No available slot on ' + nextDay,
          calendar_event_id: '',
        }, now);
        const ctx = (globalThis as any).__ctx;
        if (ctx?.waitUntil) ctx.waitUntil(sendClientCancelledEmail(env, appt, 'No slots available for rescheduling. Please rebook.').catch(() => {}));
        results.push({ appointmentId: appt.id, action: 'cancelled_no_slot', patient: appt.full_name });
        continue;
      }

      // Cancel old
      await updateAppointmentStatus(env.DB, appt.id, {
        status: 'CANCELLED_DOCTOR',
        cancelled_at: now,
        cancel_reason: 'Pushed to ' + nextDay + ' ' + newSlot.start,
        calendar_event_id: '',
      }, now);

      // Create new
      const newAppt: Appointment = {
        id: 'A-' + generateId(),
        date_key: nextDay,
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
      };

      await insertAppointment(env.DB, newAppt);
      takenOnNextDay.add(newSlot.start);

      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendAppointmentPushedEmail(env, appt, nextDay, newSlot.start, newSlot.end).catch(() => {}));

      results.push({ appointmentId: newAppt.id, action: 'pushed', patient: appt.full_name, newDate: nextDay, newTime: newSlot.start });
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
        await updateAppointmentStatus(env.DB, appt.id, {
          status: 'CANCELLED_DOCTOR', cancelled_at: now,
          cancel_reason: 'No available slot on same day', calendar_event_id: '',
        }, now);
        results.push({ appointmentId: appt.id, action: 'cancelled_no_slot', patient: appt.full_name });
        continue;
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
      };

      await insertAppointment(env.DB, newAppt);
      takenSameDay.add(newSlot.start);

      const ctx = (globalThis as any).__ctx;
      if (ctx?.waitUntil) ctx.waitUntil(sendAppointmentPushedEmail(env, appt, dateKey, newSlot.start, newSlot.end).catch(() => {}));

      results.push({ appointmentId: newAppt.id, action: 'pushed_same_day', patient: appt.full_name, newTime: newSlot.start });
    }
  }

  if (results.length > 0) await bumpVersion(env.DB);
  broadcast(env, dateKey);

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
  const todayKey = toDateKey(todayLocal(tz));

  const allAppts = await getAppointmentsByDate(env.DB, todayKey);

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
    };
    if (a.clinic === 'spinola' || a.location.toLowerCase().includes('spinola') || a.status === 'RELOCATED_SPINOLA') {
      spinola.push(item);
    } else {
      potters.push(item);
    }
  }

  return json({ ok: true, potters, spinola });
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

  if (!appointmentIds.length || !teamNames.length) return json({ ok: false, reason: 'Missing selections.' }, 400);

  const todayKey = toDateKey(todayLocal(tz));
  const allAppts = await getAppointmentsByDate(env.DB, todayKey);
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
    const count = appts.filter(a => ['BOOKED', 'RELOCATED_SPINOLA', 'ATTENDED'].includes(a.status)).length;
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
  broadcast(env, '');

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
  const past28 = toDateKey(addDays(today, -28));
  const future7 = toDateKey(addDays(today, 7));

  const allAppts = await getAppointmentsByDateRange(env.DB, past28, future7);

  let total = 0, cancelled = 0, cancelledClient = 0, cancelledDoctor = 0;
  let attended = 0, noShow = 0, pottersCount = 0, spinolaCount = 0;
  const byDay: Record<string, number> = {};
  const byHour: Record<number, number> = {};
  const patientCounts: Record<string, number> = {};
  const cancellerCounts: Record<string, number> = {};
  let leadTimeSum = 0, leadTimeCount = 0;

  for (const a of allAppts) {
    total++;
    if (a.status.includes('CANCELLED')) {
      cancelled++;
      if (a.status === 'CANCELLED_CLIENT') cancelledClient++;
      if (a.status === 'CANCELLED_DOCTOR') cancelledDoctor++;
      const key = a.full_name + '|' + a.email;
      cancellerCounts[key] = (cancellerCounts[key] || 0) + 1;
    }
    if (a.status === 'ATTENDED') attended++;
    if (a.status === 'NO_SHOW') noShow++;
    if (a.clinic === 'spinola') spinolaCount++; else pottersCount++;

    // Day of week distribution
    try {
      const d = parseDateKey(a.date_key);
      const dow = dayOfWeekKey(d);
      byDay[dow] = (byDay[dow] || 0) + 1;
    } catch {}

    // Hourly distribution
    try {
      const hour = parseTimeToMinutes(a.start_time) / 60 | 0;
      byHour[hour] = (byHour[hour] || 0) + 1;
    } catch {}

    // Patient repeat counts
    if (!a.status.includes('CANCELLED')) {
      const key = a.full_name + '|' + a.email;
      patientCounts[key] = (patientCounts[key] || 0) + 1;
    }

    // Lead time
    try {
      const created = new Date(a.created_at.replace(' ', 'T'));
      const apptDate = parseDateKey(a.date_key);
      const diff = (apptDate.getTime() - created.getTime()) / 86400000;
      if (diff >= 0) { leadTimeSum += diff; leadTimeCount++; }
    } catch {}
  }

  const topPatients = Object.entries(patientCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([key, count]) => ({ name: key.split('|')[0], email: key.split('|')[1], count }));

  const topCancellers = Object.entries(cancellerCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([key, count]) => ({ name: key.split('|')[0], email: key.split('|')[1], count }));

  // Unique patients
  const uniqueEmails = new Set(allAppts.filter(a => !a.status.includes('CANCELLED')).map(a => a.email));
  const totalUniquePatients = uniqueEmails.size;
  const repeatPatients = Object.values(patientCounts).filter(c => c > 1).length;

  // Weekly trend (last 4 weeks)
  const weeklyTrend: { label: string; booked: number; cancelled: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const wStart = toDateKey(addDays(today, -w * 7 - 6));
    const wEnd = toDateKey(addDays(today, -w * 7));
    const weekAppts = allAppts.filter(a => a.date_key >= wStart && a.date_key <= wEnd);
    const booked = weekAppts.filter(a => !a.status.includes('CANCELLED')).length;
    const wCancelled = weekAppts.filter(a => a.status.includes('CANCELLED')).length;
    weeklyTrend.push({ label: wStart.slice(5), booked, cancelled: wCancelled });
  }

  // Trend direction
  const thisWeekBooked = weeklyTrend.length >= 1 ? weeklyTrend[weeklyTrend.length - 1].booked : 0;
  const lastWeekBooked = weeklyTrend.length >= 2 ? weeklyTrend[weeklyTrend.length - 2].booked : 0;
  const trendDirection = thisWeekBooked > lastWeekBooked ? 'up' : thisWeekBooked < lastWeekBooked ? 'down' : '';
  const trendPct = lastWeekBooked > 0 ? Math.round(Math.abs(thisWeekBooked - lastWeekBooked) / lastWeekBooked * 100) : 0;

  // Hourly distribution as array (7am-8pm)
  const hourlyDistribution: number[] = [];
  for (let h = 7; h <= 20; h++) hourlyDistribution.push(byHour[h] || 0);

  // Utilization: booked slots / total available slots
  const offRows = await getDoctorOffRows(env.DB);
  const extraRows = await getDoctorExtraRows(env.DB);
  const extraMap = buildExtraMap(extraRows);
  let totalSlots = 0;
  let bookedSlots = 0;
  for (let d = -28; d <= 0; d++) {
    const dt = addDays(today, d);
    const dk = toDateKey(dt);
    const slots = buildSlotsForDate(dt, cfg.apptDurationMin, extraMap[dk] || null, cfg.workingHours);
    totalSlots += slots.length;
    const dayAppts = allAppts.filter(a => a.date_key === dk && !a.status.includes('CANCELLED'));
    bookedSlots += dayAppts.length;
  }
  const utilization = totalSlots > 0 ? Math.round(bookedSlots / totalSlots * 100) : 0;

  // Upcoming 7-day load
  const upcomingLoad: { dateKey: string; dayLabel: string; booked: number; capacity: number }[] = [];
  for (let d = 0; d < 7; d++) {
    const dt = addDays(today, d);
    const dk = toDateKey(dt);
    const dow = dayOfWeekKey(dt);
    const slots = buildSlotsForDate(dt, cfg.apptDurationMin, extraMap[dk] || null, cfg.workingHours);
    const dayAppts = allAppts.filter(a => a.date_key === dk && !a.status.includes('CANCELLED'));
    upcomingLoad.push({ dateKey: dk, dayLabel: dow, booked: dayAppts.length, capacity: slots.length });
  }

  // Busiest day
  const dayApptCounts: Record<string, number> = {};
  for (const a of allAppts) {
    if (!a.status.includes('CANCELLED')) dayApptCounts[a.date_key] = (dayApptCounts[a.date_key] || 0) + 1;
  }
  let busiestDay: { dateKey: string; dayName: string; count: number } | null = null;
  for (const [dk, count] of Object.entries(dayApptCounts)) {
    if (!busiestDay || count > busiestDay.count) {
      try { busiestDay = { dateKey: dk, dayName: dayOfWeekKey(parseDateKey(dk)), count }; } catch {}
    }
  }

  // Country from phone prefix
  const countryMap: Record<string, string> = {
    '356':'Malta','44':'UK','33':'France','49':'Germany','39':'Italy','34':'Spain',
    '31':'Netherlands','32':'Belgium','46':'Sweden','47':'Norway','48':'Poland',
    '36':'Hungary','420':'Czech','421':'Slovakia','43':'Austria','41':'Switzerland',
    '351':'Portugal','30':'Greece','353':'Ireland','358':'Finland','45':'Denmark',
    '1':'US/Canada','61':'Australia','81':'Japan','86':'China','91':'India','7':'Russia',
  };
  const countryCounts: Record<string, number> = {};
  for (const a of allAppts) {
    if (a.status.includes('CANCELLED')) continue;
    const phone = String(a.phone || '').replace(/[^0-9]/g, '');
    let country = 'Other';
    for (const [prefix, name] of Object.entries(countryMap)) {
      if (phone.startsWith(prefix)) { country = name; break; }
    }
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }
  const countryBreakdown = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));

  // Same-day cancellations
  const sameDayCancels = allAppts.filter(a => {
    if (!a.status.includes('CANCELLED') || !a.cancelled_at) return false;
    return a.cancelled_at.startsWith(a.date_key);
  }).length;

  // Spinola sub-stats
  const spinolaAppts = allAppts.filter(a => a.clinic === 'spinola');
  const spinolaCancelled = spinolaAppts.filter(a => a.status.includes('CANCELLED')).length;
  const spinolaNoShow = spinolaAppts.filter(a => a.status === 'NO_SHOW').length;
  const spinolaUniqueEmails = new Set(spinolaAppts.filter(a => !a.status.includes('CANCELLED')).map(a => a.email));
  const spinolaDirect = spinolaAppts.filter(a => a.status !== 'RELOCATED_SPINOLA' && !a.status.includes('CANCELLED')).length;
  const spinolaRedirected = spinolaAppts.filter(a => a.status === 'RELOCATED_SPINOLA').length;

  return json({
    ok: true,
    stats: {
      total,
      cancelled,
      cancelledClient,
      cancelledDoctor,
      cancelRate: total > 0 ? (cancelled / total * 100).toFixed(1) : '0',
      attended,
      noShow,
      pottersCount,
      spinolaCount,
      byDay,
      byHour,
      topPatients,
      topCancellers,
      avgLeadTimeDays: leadTimeCount > 0 ? (leadTimeSum / leadTimeCount).toFixed(1) : '0',
      totalUniquePatients,
      repeatPatients,
      totalBooked: total - cancelled,
      utilization,
      trendDirection,
      trendPct,
      weeklyTrend,
      hourlyDistribution,
      upcomingLoad,
      busiestDay,
      countryBreakdown,
      sameDayCancels,
      locationSplit: { potters: pottersCount, spinola: spinolaCount },
      cancelBreakdown: { byDoctor: cancelledDoctor, byPatient: cancelledClient },
      period: { from: past28, to: todayKey },
      generated: nowIso(tz),
      spinola: (() => {
        // Spinola weekly trend
        const sWeekly: { label: string; booked: number; cancelled: number }[] = [];
        for (let w = 3; w >= 0; w--) {
          const ws = toDateKey(addDays(today, -w * 7 - 6));
          const we = toDateKey(addDays(today, -w * 7));
          const wa = spinolaAppts.filter(a => a.date_key >= ws && a.date_key <= we);
          sWeekly.push({ label: ws.slice(5), booked: wa.filter(a => !a.status.includes('CANCELLED')).length, cancelled: wa.filter(a => a.status.includes('CANCELLED')).length });
        }
        // Spinola hourly
        const sHourly: number[] = [];
        for (let h = 7; h <= 20; h++) {
          sHourly.push(spinolaAppts.filter(a => !a.status.includes('CANCELLED') && (parseTimeToMinutes(a.start_time) / 60 | 0) === h).length);
        }
        // Spinola top patients
        const sPat: Record<string, number> = {};
        for (const a of spinolaAppts) {
          if (!a.status.includes('CANCELLED')) sPat[a.full_name + '|' + a.email] = (sPat[a.full_name + '|' + a.email] || 0) + 1;
        }
        const sTopPat = Object.entries(sPat).sort((a, b) => b[1] - a[1]).slice(0, 10)
          .map(([k, c]) => ({ name: k.split('|')[0], email: k.split('|')[1], count: c }));
        // Spinola country
        const sCountry: Record<string, number> = {};
        for (const a of spinolaAppts) {
          if (a.status.includes('CANCELLED')) continue;
          const ph = String(a.phone || '').replace(/[^0-9]/g, '');
          let cn = 'Other';
          for (const [p, n] of Object.entries(countryMap)) { if (ph.startsWith(p)) { cn = n; break; } }
          sCountry[cn] = (sCountry[cn] || 0) + 1;
        }
        return {
          totalBooked: spinolaCount - spinolaCancelled,
          cancelRate: spinolaCount > 0 ? (spinolaCancelled / spinolaCount * 100).toFixed(1) : '0',
          noShowRate: spinolaCount > 0 ? (spinolaNoShow / spinolaCount * 100).toFixed(1) : '0',
          uniquePatients: spinolaUniqueEmails.size,
          directBookings: spinolaDirect,
          relocatedBookings: spinolaRedirected,
          weeklyTrend: sWeekly,
          hourlyDistribution: sHourly,
          topPatients: sTopPat,
          countryBreakdown: Object.entries(sCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count })),
        };
      })(),
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
  if (dateKeys.length > 0) broadcast(env, dateKeys[0]);

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
  return json({ ok: true, history });
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
  };

  await insertAppointment(env.DB, appt);
  await bumpVersion(env.DB);
  broadcast(env, dateKey);

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
  const testAppts = await env.DB.prepare("SELECT id, calendar_event_id, clinic FROM appointments WHERE id LIKE 'TEST-%' AND calendar_event_id != ''").all();
  for (const row of (testAppts.results || [])) {
    try { await deleteCalendarEvent(env, row.calendar_event_id as string, (row.clinic as string || 'potters') as any); } catch {}
  }

  // Delete all appointments with ID starting with 'TEST-'
  const result = await env.DB.prepare("DELETE FROM appointments WHERE id LIKE 'TEST-%'").run();
  // Also delete test clients
  await env.DB.prepare("DELETE FROM clients WHERE email = 'test@example.com'").run();
  await bumpVersion(env.DB);

  return json({ ok: true, deleted: result.meta?.changes || 0, message: 'All test data purged.' });
}
