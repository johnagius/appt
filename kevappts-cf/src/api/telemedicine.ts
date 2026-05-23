/**
 * Telemedicine API — instant phone consultations (€25 flat fee).
 *
 * Bookings are accepted at any time of day: the patient submits and the
 * doctor calls back as soon as possible. The 8pm–midnight window is kept
 * as an informational "live now" banner on the booking page, but it no
 * longer gates the public booking endpoint.
 *
 * Telemedicine is deliberately a separate table from `appointments`:
 *  - no slot, no doctor-off interaction, no calendar event
 *  - flat €25 fee tracked as integer cents to avoid float drift
 *  - doesn't touch the existing booking flow (Potter's / Spinola / Linda).
 *
 * Always emails info@spinolaclinic.com so the doctor sees the request,
 * plus a confirmation to the patient when an email is provided.
 */
import type { Env } from '../types';
import {
  todayKeyLocal, nowMinutesLocal, nowIso,
  sanitizeName, sanitizeEmail, sanitizePhone,
  todayLocal, toDateKey, addDays,
} from '../services/utils';
import { verifyAdminSig, generateId } from '../services/crypto';
import {
  insertTelemedicineCall, getTelemedicineCallsByDate, getTelemedicineCallsByDateRange,
  getTelemedicineCallById, deleteTelemedicineCall, updateTelemedicineCallStatus,
  updateTelemedicineMedicine, updateTelemedicineMedicines, markTelemedicinePrescriptionSent,
  getTelemedicineStats, getRichTelemedicineStats, type TelemedicineCall,
} from '../db/queries';
import {
  sendTelemedicineDoctorEmail, sendTelemedicinePatientEmail,
  sendTelemedicinePrescriptionEmail, sendTelemedicineCancellationEmail,
} from '../services/email';

const TELEMEDICINE_FEE_CENTS = 2500;
// Window starts at 20:00, ends at 24:00 (i.e. before 00:00 the next day).
export const TELEMEDICINE_START_MIN = 20 * 60;
export const TELEMEDICINE_END_MIN = 24 * 60;

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Push a "telemedicine_updated" event over the realtime hub. Admin and doctor
// pages listen for this and refresh their telemedicine sections so a new
// booking from the public page appears live without a manual reload.
async function broadcastTelemedicine(env: Env, dateKey: string): Promise<void> {
  try {
    const id = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(id);
    // Send BOTH a dedicated event (for telemed-aware clients) AND the
    // generic slots_updated event so existing dashboards still know to
    // refresh — they already listen for that.
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'telemedicine_updated', dateKey }),
    });
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey }),
    });
  } catch (e) {
    console.error('Telemedicine broadcast error:', e);
  }
}

// Fire-and-forget cancellation/removal email to the clinic inbox so
// info@spinolaclinic.com always has the up-to-date table + total.
function notifyClinicCancellation(env: Env, call: TelemedicineCall, reason: 'cancelled' | 'removed'): void {
  const ctx = (globalThis as any).__ctx;
  const run = async () => {
    try {
      const dayList = await getTelemedicineCallsByDate(env.DB, call.date_key);
      await sendTelemedicineCancellationEmail(env, call, dayList, reason);
    } catch (e) {
      console.error('Telemedicine cancel email error:', e);
    }
  };
  if (ctx?.waitUntil) ctx.waitUntil(run());
  else run().catch(() => {});
}

// Fire-and-forget wrapper. Uses waitUntil when available so the API
// response is returned immediately and the broadcast runs after.
function pushTelemedicineUpdate(env: Env, dateKey: string): void {
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil(broadcastTelemedicine(env, dateKey));
  } else {
    broadcastTelemedicine(env, dateKey).catch(() => {});
  }
}

async function requireAdmin(req: Request, env: Env): Promise<Response | null> {
  const url = new URL(req.url);
  const sig = (url.searchParams.get('sig') || '').trim();
  if (sig && await verifyAdminSig(sig, env.ADMIN_SECRET)) return null;
  const cookie = req.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_sig=([^\s;]+)/);
  if (match && await verifyAdminSig(match[1], env.ADMIN_SECRET)) return null;
  return json({ ok: false, reason: 'Access denied.' }, 403);
}

export function isInTelemedicineWindow(env: Env): boolean {
  const m = nowMinutesLocal(env.TIMEZONE);
  return m >= TELEMEDICINE_START_MIN && m < TELEMEDICINE_END_MIN;
}

// ─── Public: status (used by booking page to show/hide telemed banner) ─

export async function apiTelemedicineStatus(req: Request, env: Env): Promise<Response> {
  return json({
    ok: true,
    open: isInTelemedicineWindow(env),
    feeCents: TELEMEDICINE_FEE_CENTS,
    feeLabel: '€25',
    windowLabel: '8pm – midnight',
    startMin: TELEMEDICINE_START_MIN,
    endMin: TELEMEDICINE_END_MIN,
  });
}

// ─── Public: book a telemedicine call ─────────────────────

export async function apiBookTelemedicine(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json().catch(() => ({}));
  const fullName = sanitizeName(body.fullName || '');
  const phone = sanitizePhone(body.phone || '');
  const email = sanitizeEmail(body.email || '');
  const comments = (body.comments || '').toString().trim().slice(0, 1000);

  if (!fullName || !phone) {
    return json({ ok: false, reason: 'Please enter your name and phone number.' }, 400);
  }
  if (!email) {
    return json({ ok: false, reason: 'Please enter your email address.' }, 400);
  }

  // Window check intentionally removed — doctor handles instant calls at any
  // time of day. The 8pm–midnight window is retained only as a "live now"
  // banner on the booking page (isInTelemedicineWindow + /api/telemedicine/status).
  return doInsertCall(env, {
    fullName, phone, email, comments,
    source: 'public',
  });
}

// ─── Admin: list, add, delete, stats ──────────────────────

export async function apiAdminListTelemedicineByDate(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const dateKey = (url.searchParams.get('date') || todayKeyLocal(env.TIMEZONE)).trim();
  const calls = await getTelemedicineCallsByDate(env.DB, dateKey);
  let doctorCents = 0;
  let medicineCents = 0;
  for (const c of calls) {
    if (c.status === 'CANCELLED') continue;
    doctorCents += c.fee_cents || 0;
    medicineCents += c.medicine_cents || 0;
  }
  const billable = calls.filter(c => c.status !== 'CANCELLED').length;
  const patientCents = doctorCents + medicineCents;
  return json({
    ok: true,
    dateKey,
    calls,
    count: calls.length,
    billableCount: billable,
    // Doctor's take — number of calls × €25, no medicine.
    totalRevenueCents: doctorCents,
    totalRevenueLabel: '€' + (doctorCents / 100).toFixed(2),
    // Pharmacy total entered by admin for this date.
    totalMedicineCents: medicineCents,
    totalMedicineLabel: '€' + (medicineCents / 100).toFixed(2),
    // Combined patient bill total for the date (medicine + €25 per call).
    totalPatientCents: patientCents,
    totalPatientLabel: '€' + (patientCents / 100).toFixed(2),
    feeCents: TELEMEDICINE_FEE_CENTS,
  });
}

export async function apiAdminAddTelemedicine(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const body: any = await req.json().catch(() => ({}));
  const fullName = sanitizeName(body.patientName || body.fullName || '');
  const phone = sanitizePhone(body.phone || '');
  const email = sanitizeEmail(body.email || '');
  const comments = (body.comments || '').toString().trim().slice(0, 1000);
  // Admin can backdate; default to today in local tz.
  const dateKey = ((body.dateKey || '').toString().trim()) || todayKeyLocal(env.TIMEZONE);

  if (!fullName || !phone) {
    return json({ ok: false, reason: 'Patient name and phone number are required.' }, 400);
  }

  return doInsertCall(env, {
    fullName, phone, email, comments,
    source: 'admin',
    dateKeyOverride: dateKey,
    skipPatientEmail: !email,
  });
}

export async function apiAdminDeleteTelemedicine(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() || '';
  if (!id) return json({ ok: false, reason: 'Missing id' }, 400);

  const existing = await getTelemedicineCallById(env.DB, id);
  if (!existing) return json({ ok: false, reason: 'Call not found' }, 404);

  // Only fire a cancellation/removal email if the row was actually
  // billable — deleting an already-cancelled row doesn't change the
  // doctor's total, so spamming the inbox isn't useful.
  const wasBillable = existing.status !== 'CANCELLED';

  await deleteTelemedicineCall(env.DB, id);
  pushTelemedicineUpdate(env, existing.date_key);

  if (wasBillable) {
    notifyClinicCancellation(env, existing, 'removed');
  }
  return json({ ok: true });
}

export async function apiAdminMarkTelemedicineStatus(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const body: any = await req.json().catch(() => ({}));
  const id = (body.id || '').toString().trim();
  const status = (body.status || '').toString().trim().toUpperCase();
  if (!id || !['BOOKED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return json({ ok: false, reason: 'Invalid id or status' }, 400);
  }
  // Capture pre-update state so we can detect the BOOKED/COMPLETED →
  // CANCELLED transition (the only one that changes the doctor's total).
  const before = await getTelemedicineCallById(env.DB, id);
  await updateTelemedicineCallStatus(env.DB, id, status, nowIso(env.TIMEZONE));
  const updated = await getTelemedicineCallById(env.DB, id);
  if (updated) pushTelemedicineUpdate(env, updated.date_key);

  if (before && status === 'CANCELLED' && before.status !== 'CANCELLED' && updated) {
    notifyClinicCancellation(env, updated, 'cancelled');
  }
  return json({ ok: true });
}

// Admin: save the medicines list (newline-separated names) for a call.
// Used by the prescription editor; doesn't send an email on its own.
export async function apiAdminSetTelemedicineMedicines(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const body: any = await req.json().catch(() => ({}));
  const id = (body.id || '').toString().trim();
  const medicines = (body.medicines || '').toString();
  if (!id) return json({ ok: false, reason: 'Missing id' }, 400);

  const existing = await getTelemedicineCallById(env.DB, id);
  if (!existing) return json({ ok: false, reason: 'Call not found' }, 404);

  await updateTelemedicineMedicines(env.DB, id, medicines, nowIso(env.TIMEZONE));
  pushTelemedicineUpdate(env, existing.date_key);
  return json({ ok: true });
}

// Admin: send prescription/receipt email to the patient. Optionally accepts
// an updated medicines list and medicine total in the same call so the
// admin can finalise everything from one button. Doctor's €25 fee is
// always shown separately on the prescription so insurance can claim it.
export async function apiAdminSendTelemedicinePrescription(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const body: any = await req.json().catch(() => ({}));
  const id = (body.id || '').toString().trim();
  if (!id) return json({ ok: false, reason: 'Missing id' }, 400);

  const existing = await getTelemedicineCallById(env.DB, id);
  if (!existing) return json({ ok: false, reason: 'Call not found' }, 404);
  if (!existing.email) {
    return json({ ok: false, reason: 'This call has no patient email — add an email first.' }, 400);
  }

  const tz = env.TIMEZONE;
  const now = nowIso(tz);

  // Optional in-place updates so the admin can save and send in one click.
  let medicines = existing.medicines || '';
  if (typeof body.medicines === 'string') {
    medicines = body.medicines;
    await updateTelemedicineMedicines(env.DB, id, medicines, now);
  }

  let medicineCents = existing.medicine_cents || 0;
  if (body.medicineEuros != null) {
    const n = Number(body.medicineEuros);
    if (!isFinite(n) || n < 0) return json({ ok: false, reason: 'Invalid medicine amount' }, 400);
    medicineCents = Math.round(n * 100);
    await updateTelemedicineMedicine(env.DB, id, medicineCents, now);
  } else if (typeof body.medicineCents === 'number') {
    medicineCents = Math.max(0, Math.round(body.medicineCents));
    await updateTelemedicineMedicine(env.DB, id, medicineCents, now);
  }

  try {
    await sendTelemedicinePrescriptionEmail(env, {
      id: existing.id,
      date_key: existing.date_key,
      patient_name: existing.patient_name,
      phone: existing.phone,
      email: existing.email,
      fee_cents: existing.fee_cents || 0,
      medicine_cents: medicineCents,
      medicines,
      created_at: existing.created_at,
    });
  } catch (e: any) {
    console.error('Prescription send error:', e);
    return json({ ok: false, reason: 'Could not send prescription email.' }, 500);
  }

  await markTelemedicinePrescriptionSent(env.DB, id, now);
  pushTelemedicineUpdate(env, existing.date_key);

  const fee = existing.fee_cents || 0;
  const patientTotal = fee + medicineCents;
  return json({
    ok: true,
    id,
    medicineCents,
    feeCents: fee,
    patientTotalCents: patientTotal,
    patientTotalLabel: '€' + (patientTotal / 100).toFixed(2),
    medicineLabel: '€' + (medicineCents / 100).toFixed(2),
    feeLabel: '€' + (fee / 100).toFixed(2),
    sentAt: now,
    sentTo: existing.email,
  });
}

// Admin: update the pharmacy/medicine bill on a call. Doctor's flat €25 fee
// is unchanged; the patient bill (medicine + 25) is computed downstream.
export async function apiAdminSetTelemedicineMedicine(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const body: any = await req.json().catch(() => ({}));
  const id = (body.id || '').toString().trim();
  const rawCents = body.medicineCents;
  const rawEuros = body.medicineEuros;

  let cents: number;
  if (typeof rawCents === 'number' && isFinite(rawCents)) {
    cents = Math.max(0, Math.round(rawCents));
  } else if (rawEuros != null) {
    const n = Number(rawEuros);
    if (!isFinite(n) || n < 0) return json({ ok: false, reason: 'Invalid amount' }, 400);
    cents = Math.round(n * 100);
  } else {
    return json({ ok: false, reason: 'Missing medicineCents or medicineEuros' }, 400);
  }
  if (!id) return json({ ok: false, reason: 'Missing id' }, 400);

  const existing = await getTelemedicineCallById(env.DB, id);
  if (!existing) return json({ ok: false, reason: 'Call not found' }, 404);

  await updateTelemedicineMedicine(env.DB, id, cents, nowIso(env.TIMEZONE));
  pushTelemedicineUpdate(env, existing.date_key);
  const fee = existing.fee_cents || 0;
  const patientTotal = fee + cents;
  return json({
    ok: true,
    id,
    medicineCents: cents,
    feeCents: fee,
    patientTotalCents: patientTotal,
    patientTotalLabel: '€' + (patientTotal / 100).toFixed(2),
    medicineLabel: '€' + (cents / 100).toFixed(2),
    feeLabel: '€' + (fee / 100).toFixed(2),
  });
}

export async function apiAdminTelemedicineStats(req: Request, env: Env): Promise<Response> {
  const denied = await requireAdmin(req, env);
  if (denied) return denied;

  const tz = env.TIMEZONE;
  const today = todayLocal(tz);
  const todayKey = toDateKey(today);
  // Monday-of-this-week (matches the Sunday=0/Monday=1 convention used elsewhere).
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekStartKey = toDateKey(addDays(today, mondayOffset));
  const last30StartKey = toDateKey(addDays(today, -29));
  const last14StartKey = toDateKey(addDays(today, -13));
  const last90StartKey = toDateKey(addDays(today, -89));

  const rich = await getRichTelemedicineStats(
    env.DB, todayKey, weekStartKey, last30StartKey, last14StartKey, last90StartKey,
  );

  // Keep legacy `stats` shape too — the top counter on the admin page
  // and the existing schedule subsection both use it. Cheap to derive
  // from the rich result.
  const legacyStats = {
    totalCalls: rich.periods.allTime.calls,
    totalRevenueCents: rich.periods.allTime.doctorRevenueCents,
    totalMedicineCents: rich.periods.allTime.medicineCents,
    todayCalls: rich.periods.today.calls,
    todayRevenueCents: rich.periods.today.doctorRevenueCents,
    todayMedicineCents: rich.periods.today.medicineCents,
    weekCalls: rich.periods.week.calls,
    weekRevenueCents: rich.periods.week.doctorRevenueCents,
    weekMedicineCents: rich.periods.week.medicineCents,
  };

  return json({
    ok: true,
    todayKey,
    weekStartKey,
    last30StartKey,
    last14StartKey,
    last90StartKey,
    stats: legacyStats,
    rich,
    feeCents: TELEMEDICINE_FEE_CENTS,
    open: isInTelemedicineWindow(env),
    windowLabel: '8pm – midnight',
  });
}

// ─── Helper: shared insert path used by public + admin ─────

async function doInsertCall(env: Env, opts: {
  fullName: string;
  phone: string;
  email: string;
  comments: string;
  source: 'public' | 'admin';
  dateKeyOverride?: string;
  skipPatientEmail?: boolean;
}): Promise<Response> {
  const tz = env.TIMEZONE;
  const now = nowIso(tz);
  const dateKey = opts.dateKeyOverride || todayKeyLocal(tz);

  const call: TelemedicineCall = {
    id: 'T-' + generateId(),
    date_key: dateKey,
    patient_name: opts.fullName,
    phone: opts.phone,
    email: opts.email,
    comments: opts.comments,
    fee_cents: TELEMEDICINE_FEE_CENTS,
    medicine_cents: 0,
    medicines: '',
    prescription_sent_at: '',
    status: 'BOOKED',
    source: opts.source,
    created_at: now,
    updated_at: now,
  };

  await insertTelemedicineCall(env.DB, call);
  // Push a realtime update synchronously BEFORE the response is returned
  // so admin and doctor pages already-listening on the WebSocket can
  // refresh as soon as the booking lands. The broadcast itself is small
  // and fast; the email send below is deferred via waitUntil.
  pushTelemedicineUpdate(env, call.date_key);

  // Fire-and-forget email notifications. Use waitUntil so the response is
  // returned immediately, matching the rest of the booking flow. Each
  // notification email includes the full table for the day plus the
  // running doctor's total — so the latest email always shows where the
  // doctor stands for the evening.
  const ctx = (globalThis as any).__ctx;
  const sendEmails = async () => {
    let dayList: TelemedicineCall[] = [];
    try {
      dayList = await getTelemedicineCallsByDate(env.DB, call.date_key);
    } catch (e) { console.error('Telemed day-list fetch error:', e); }
    try {
      await sendTelemedicineDoctorEmail(env, call, dayList);
    } catch (e) { console.error('Telemed doctor email error:', e); }
    if (!opts.skipPatientEmail) {
      try {
        await sendTelemedicinePatientEmail(env, call);
      } catch (e) { console.error('Telemed patient email error:', e); }
    }
  };
  if (ctx?.waitUntil) {
    ctx.waitUntil(sendEmails());
  } else {
    // Fallback when ctx isn't available (shouldn't happen in worker runtime)
    sendEmails().catch(() => {});
  }

  return json({
    ok: true,
    id: call.id,
    dateKey: call.date_key,
    feeCents: call.fee_cents,
    feeLabel: '€25',
    // Don't echo the patient's phone number back on screen — the actual
    // call is placed by the pharmacist, not directly from the doctor to
    // the patient. Tell the patient to speak to the pharmacist instead.
    message: 'Telemedicine booking confirmed. The doctor will call you back as soon as possible. Fee: €25 (paid to the doctor on the call).',
  });
}
