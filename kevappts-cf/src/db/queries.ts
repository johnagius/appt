import type { Appointment, Client, DoctorOff, DoctorExtra, AppConfig, DoctorOffEntry, DoctorOffMap, TimeWindow } from '../types';
import { parseDateKey, toDateKey, addDays, parseTimeToMinutes, minutesToTime, dedupeJoinReasons, isHolidayOrClosed, buildSlotsForDate, DEFAULT_HOURS, DEFAULT_SPINOLA_HOURS } from '../services/utils';

// ─── Data Version ──────────────────────────────────────────

export async function getDataVersion(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT version FROM data_version WHERE id = 1').first<{ version: number }>();
  return row?.version ?? 0;
}

export async function bumpVersion(db: D1Database): Promise<number> {
  await db.prepare('UPDATE data_version SET version = version + 1 WHERE id = 1').run();
  const row = await db.prepare('SELECT version FROM data_version WHERE id = 1').first<{ version: number }>();
  return row?.version ?? 0;
}

// ─── Config ────────────────────────────────────────────────

export async function getConfig(db: D1Database): Promise<AppConfig> {
  const rows = await db.prepare('SELECT key, value FROM config').all<{ key: string; value: string }>();
  const map: Record<string, string> = {};
  for (const r of rows.results) map[r.key] = r.value;

  const dur = parseInt(map['APPT_DURATION_MIN'] || '10', 10) || 10;
  const adv = parseInt(map['ADVANCE_DAYS'] || '7', 10) || 7;
  const maxActive = parseInt(map['MAX_ACTIVE_APPTS_PER_PERSON'] || '0', 10) || 0;

  let workingHours = DEFAULT_HOURS;
  try { if (map['WORKING_HOURS']) workingHours = JSON.parse(map['WORKING_HOURS']); } catch {}

  let spinolaHours = DEFAULT_SPINOLA_HOURS;
  try { if (map['SPINOLA_WORKING_HOURS']) spinolaHours = JSON.parse(map['SPINOLA_WORKING_HOURS']); } catch {}

  return {
    apptDurationMin: dur,
    advanceDays: adv,
    maxActiveApptsPerPerson: maxActive,
    workingHours,
    spinolaHours,
    pottersLocation: map['POTTERS_LOCATION'] || "Potter's Pharmacy Clinic",
    spinolaLocation: map['SPINOLA_LOCATION'] || 'Spinola Clinic',
  };
}

export async function getConfigValue(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM config WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setConfigValue(db: D1Database, key: string, value: string): Promise<void> {
  await db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').bind(key, value).run();
}

// ─── Appointments ──────────────────────────────────────────

export async function getAppointmentsByDate(db: D1Database, dateKey: string): Promise<Appointment[]> {
  const result = await db.prepare(
    'SELECT * FROM appointments WHERE date_key = ? ORDER BY start_time'
  ).bind(dateKey).all<Appointment>();
  return result.results;
}

export async function getActiveAppointmentsByDate(db: D1Database, dateKey: string): Promise<Appointment[]> {
  const result = await db.prepare(
    "SELECT * FROM appointments WHERE date_key = ? AND status IN ('BOOKED', 'RELOCATED_SPINOLA') ORDER BY start_time"
  ).bind(dateKey).all<Appointment>();
  return result.results;
}

export async function getNonCancelledAppointmentsByDate(db: D1Database, dateKey: string): Promise<Appointment[]> {
  const result = await db.prepare(
    "SELECT * FROM appointments WHERE date_key = ? AND status NOT LIKE '%CANCELLED%' ORDER BY start_time"
  ).bind(dateKey).all<Appointment>();
  return result.results;
}

export async function getAppointmentByToken(db: D1Database, token: string): Promise<Appointment | null> {
  return db.prepare('SELECT * FROM appointments WHERE token = ?').bind(token).first<Appointment>();
}

export async function getAppointmentById(db: D1Database, id: string): Promise<Appointment | null> {
  return db.prepare('SELECT * FROM appointments WHERE id = ?').bind(id).first<Appointment>();
}

export async function insertAppointment(db: D1Database, appt: Appointment): Promise<void> {
  await db.prepare(`
    INSERT INTO appointments (id, date_key, start_time, end_time, service_id, service_name,
      full_name, email, phone, comments, status, location, clinic, created_at, updated_at,
      token, calendar_event_id, cancelled_at, cancel_reason, reminder_sent, confirmed, booking_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    appt.id, appt.date_key, appt.start_time, appt.end_time, appt.service_id, appt.service_name,
    appt.full_name, appt.email, appt.phone, appt.comments, appt.status, appt.location, appt.clinic,
    appt.created_at, appt.updated_at, appt.token, appt.calendar_event_id, appt.cancelled_at, appt.cancel_reason,
    appt.reminder_sent || '', appt.confirmed || '', appt.booking_source || ''
  ).run();
}

export async function updateAppointmentStatus(
  db: D1Database,
  id: string,
  updates: Partial<Pick<Appointment, 'status' | 'location' | 'calendar_event_id' | 'cancelled_at' | 'cancel_reason'>>,
  nowStr: string
): Promise<void> {
  const sets: string[] = ['updated_at = ?'];
  const vals: string[] = [nowStr];

  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.location !== undefined) { sets.push('location = ?'); vals.push(updates.location); }
  if (updates.calendar_event_id !== undefined) { sets.push('calendar_event_id = ?'); vals.push(updates.calendar_event_id); }
  if (updates.cancelled_at !== undefined) { sets.push('cancelled_at = ?'); vals.push(updates.cancelled_at); }
  if (updates.cancel_reason !== undefined) { sets.push('cancel_reason = ?'); vals.push(updates.cancel_reason); }

  vals.push(id);
  await db.prepare(`UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
}

// Admin free-form reschedule: move an appointment in place to any date, time,
// clinic and location. Keeps the same id/token (so history, reviews and the
// patient's cancel/reschedule links stay valid) and re-activates the booking
// (clears any prior cancellation). service_id is intentionally untouched so a
// blood-test stays a blood-test wherever it's moved.
export async function rescheduleAppointmentFull(
  db: D1Database,
  id: string,
  fields: {
    date_key: string; start_time: string; end_time: string;
    clinic: string; location: string; status: string; calendar_event_id: string;
  },
  nowStr: string
): Promise<void> {
  await db.prepare(
    `UPDATE appointments
     SET date_key = ?, start_time = ?, end_time = ?, clinic = ?, location = ?,
         status = ?, calendar_event_id = ?, cancelled_at = '', cancel_reason = '',
         updated_at = ?
     WHERE id = ?`
  ).bind(
    fields.date_key, fields.start_time, fields.end_time, fields.clinic, fields.location,
    fields.status, fields.calendar_event_id, nowStr, id
  ).run();
}

export async function countActiveAppointmentsInWindow(
  db: D1Database,
  email: string,
  phone: string,
  todayKey: string,
  maxDateKey: string
): Promise<number> {
  const result = await db.prepare(`
    SELECT COUNT(*) as cnt FROM appointments
    WHERE date_key >= ? AND date_key <= ?
    AND status = 'BOOKED'
    AND (email = ? OR phone = ?)
  `).bind(todayKey, maxDateKey, email, phone).first<{ cnt: number }>();
  return result?.cnt ?? 0;
}

export async function personAlreadyBookedSameSlot(
  db: D1Database,
  dateKey: string,
  startTime: string,
  email: string,
  phone: string
): Promise<boolean> {
  const result = await db.prepare(`
    SELECT COUNT(*) as cnt FROM appointments
    WHERE date_key = ? AND start_time = ?
    AND status = 'BOOKED'
    AND (email = ? OR phone = ?)
  `).bind(dateKey, startTime, email, phone).first<{ cnt: number }>();
  return (result?.cnt ?? 0) > 0;
}

// Optional serviceId scopes the check to a single service so a doctor visit
// at 08:30 and a blood-test at 08:30 (both clinic='potters') can coexist.
// Callers that want the old behaviour (any service) simply omit it.
export async function isSlotTaken(db: D1Database, dateKey: string, startTime: string, clinic: string, serviceId?: string): Promise<boolean> {
  if (serviceId) {
    const r = await db.prepare(`
      SELECT COUNT(*) as cnt FROM appointments
      WHERE date_key = ? AND start_time = ? AND clinic = ? AND service_id = ?
      AND status = 'BOOKED'
    `).bind(dateKey, startTime, clinic, serviceId).first<{ cnt: number }>();
    return (r?.cnt ?? 0) > 0;
  }
  const result = await db.prepare(`
    SELECT COUNT(*) as cnt FROM appointments
    WHERE date_key = ? AND start_time = ? AND clinic = ?
    AND status = 'BOOKED'
  `).bind(dateKey, startTime, clinic).first<{ cnt: number }>();
  return (result?.cnt ?? 0) > 0;
}

export async function getTakenSlots(db: D1Database, dateKey: string, clinic: string, serviceId?: string): Promise<Set<string>> {
  if (serviceId) {
    const r = await db.prepare(`
      SELECT start_time FROM appointments
      WHERE date_key = ? AND clinic = ? AND service_id = ?
      AND status = 'BOOKED'
    `).bind(dateKey, clinic, serviceId).all<{ start_time: string }>();
    return new Set(r.results.map(x => x.start_time));
  }
  const result = await db.prepare(`
    SELECT start_time FROM appointments
    WHERE date_key = ? AND clinic = ?
    AND status = 'BOOKED'
  `).bind(dateKey, clinic).all<{ start_time: string }>();
  return new Set(result.results.map(r => r.start_time));
}

// Blood-test off-day helpers (admin-managed via blood_test_off table).
export async function getBloodTestOffRows(db: D1Database): Promise<{ id: number; date_key: string; reason: string }[]> {
  const r = await db.prepare(
    'SELECT id, date_key, reason FROM blood_test_off ORDER BY date_key'
  ).all<{ id: number; date_key: string; reason: string }>();
  return r.results;
}

export async function addBloodTestOff(db: D1Database, dateKey: string, reason: string, now: string): Promise<void> {
  await db.prepare(
    "INSERT OR REPLACE INTO blood_test_off (date_key, reason, created_at) VALUES (?, ?, ?)"
  ).bind(dateKey, reason, now).run();
}

export async function deleteBloodTestOff(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM blood_test_off WHERE id = ?').bind(id).run();
}

export async function getCancelledSlots(db: D1Database, dateKey: string, clinic: string): Promise<Set<string>> {
  const result = await db.prepare(`
    SELECT start_time FROM appointments
    WHERE date_key = ? AND clinic = ?
    AND status NOT IN ('BOOKED', 'RELOCATED_SPINOLA')
  `).bind(dateKey, clinic).all<{ start_time: string }>();
  return new Set(result.results.map(r => r.start_time));
}

export async function searchAppointments(db: D1Database, query: string, limit = 50): Promise<Appointment[]> {
  const pattern = '%' + query + '%';
  const result = await db.prepare(`
    SELECT * FROM appointments
    WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?
    ORDER BY date_key DESC, start_time
    LIMIT ?
  `).bind(pattern, pattern, pattern, limit).all<Appointment>();
  return result.results;
}

export async function getAppointmentsByDateRange(db: D1Database, fromDate: string, toDate: string): Promise<Appointment[]> {
  const result = await db.prepare(
    'SELECT * FROM appointments WHERE date_key >= ? AND date_key <= ? ORDER BY date_key, start_time'
  ).bind(fromDate, toDate).all<Appointment>();
  return result.results;
}

export async function getAllAppointments(db: D1Database): Promise<Appointment[]> {
  const result = await db.prepare(
    'SELECT * FROM appointments ORDER BY date_key, start_time'
  ).all<Appointment>();
  return result.results;
}

export async function getPatientHistory(db: D1Database, email: string, phone: string, limit = 100): Promise<Appointment[]> {
  const result = await db.prepare(`
    SELECT * FROM appointments
    WHERE email = ? OR phone = ?
    ORDER BY date_key DESC, start_time DESC
    LIMIT ?
  `).bind(email, phone, limit).all<Appointment>();
  return result.results;
}

// ─── Clients ───────────────────────────────────────────────

export async function getOrCreateClient(db: D1Database, fullName: string, email: string, phone: string, nowStr: string): Promise<string> {
  const existing = await db.prepare(
    'SELECT id FROM clients WHERE email = ? AND phone = ?'
  ).bind(email, phone).first<{ id: string }>();

  if (existing) {
    await db.prepare('UPDATE clients SET full_name = ?, updated_at = ? WHERE id = ?')
      .bind(fullName, nowStr, existing.id).run();
    return existing.id;
  }

  // Try match by email alone
  const byEmail = await db.prepare('SELECT id FROM clients WHERE email = ?')
    .bind(email).first<{ id: string }>();
  if (byEmail) {
    await db.prepare('UPDATE clients SET full_name = ?, phone = ?, updated_at = ? WHERE id = ?')
      .bind(fullName, phone, nowStr, byEmail.id).run();
    return byEmail.id;
  }

  const id = 'C-' + crypto.randomUUID();
  await db.prepare('INSERT INTO clients (id, full_name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, fullName, email, phone, nowStr, nowStr).run();
  return id;
}

// ─── Doctor Off ────────────────────────────────────────────

export async function getDoctorOffRows(db: D1Database): Promise<DoctorOff[]> {
  const result = await db.prepare('SELECT * FROM doctor_off ORDER BY start_date').all<DoctorOff>();
  return result.results;
}

export async function addDoctorOff(db: D1Database, row: Omit<DoctorOff, 'id'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO doctor_off (start_date, end_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)'
  ).bind(row.start_date, row.end_date, row.start_time, row.end_time, row.reason).run();
  return result.meta.last_row_id as number;
}

export async function deleteDoctorOff(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM doctor_off WHERE id = ?').bind(id).run();
}

export function buildDoctorOffMap(rows: DoctorOff[]): DoctorOffMap {
  const map: DoctorOffMap = {};

  for (const row of rows) {
    let startDate = parseDateKey(row.start_date);
    const endDate = parseDateKey(row.end_date || row.start_date);

    if (endDate.getTime() < startDate.getTime()) {
      const tmp = startDate;
      startDate = endDate;
      // swap not needed for iteration, just start from earlier
    }

    const actualStart = startDate.getTime() <= endDate.getTime() ? startDate : endDate;
    const actualEnd = startDate.getTime() <= endDate.getTime() ? endDate : startDate;

    const hasTime = !!(row.start_time || row.end_time);
    let blockStartMin = 0;
    let blockEndMin = 1440;

    if (hasTime) {
      blockStartMin = row.start_time ? parseTimeToMinutes(row.start_time) : 0;
      blockEndMin = row.end_time ? parseTimeToMinutes(row.end_time) : 1440;

      if (row.end_time === '00:00' && blockStartMin > 0) blockEndMin = 1440;
      blockStartMin = Math.max(0, Math.min(1440, blockStartMin));
      blockEndMin = Math.max(0, Math.min(1440, blockEndMin));

      if (blockEndMin < blockStartMin) {
        const t = blockStartMin;
        blockStartMin = blockEndMin;
        blockEndMin = t;
      }
      if (blockEndMin === blockStartMin) continue;
    }

    let d = new Date(actualStart.getTime());
    while (d.getTime() <= actualEnd.getTime()) {
      const dk = toDateKey(d);

      if (!map[dk]) {
        map[dk] = { allDay: false, reason: '', blocks: [] };
      }

      const entry = map[dk];
      const isAllDay = !hasTime || (blockStartMin <= 0 && blockEndMin >= 1440);

      if (isAllDay) {
        entry.allDay = true;
        entry.blocks = [{ startMin: 0, endMin: 1440, reason: row.reason }];
      } else if (!entry.allDay) {
        entry.blocks.push({ startMin: blockStartMin, endMin: blockEndMin, reason: row.reason });
      }

      d = addDays(d, 1);
    }
  }

  // Build reason strings and sort blocks
  for (const dk of Object.keys(map)) {
    const entry = map[dk];
    const reasons = entry.blocks.map(b => b.reason).filter(Boolean);
    entry.reason = dedupeJoinReasons(reasons);
    if (entry.blocks.length > 1) {
      entry.blocks.sort((a, b) => a.startMin - b.startMin);
    }
  }

  return map;
}

export function slotBlockedByDoctorOff(offEntry: DoctorOffEntry | undefined, slotStart: string, slotEnd: string): boolean {
  if (!offEntry) return false;
  if (offEntry.allDay) return true;
  if (!offEntry.blocks.length) return false;

  const stMin = parseTimeToMinutes(slotStart);
  const enMin = parseTimeToMinutes(slotEnd);

  for (const b of offEntry.blocks) {
    if (stMin < b.endMin && enMin > b.startMin) return true;
  }
  return false;
}

export function doctorOffReason(offEntry: DoctorOffEntry | undefined): string {
  if (!offEntry) return 'Doctor not available';
  return offEntry.reason || 'Doctor not available';
}

// ─── Doctor Extra ──────────────────────────────────────────

export async function getDoctorExtraRows(db: D1Database): Promise<DoctorExtra[]> {
  const result = await db.prepare('SELECT * FROM doctor_extra ORDER BY date_key, start_time').all<DoctorExtra>();
  return result.results;
}

export function buildExtraMap(rows: DoctorExtra[]): Record<string, TimeWindow[]> {
  const map: Record<string, TimeWindow[]> = {};
  for (const r of rows) {
    if (!map[r.date_key]) map[r.date_key] = [];
    map[r.date_key].push({ start: r.start_time, end: r.end_time });
  }
  return map;
}

export async function addDoctorExtra(db: D1Database, row: Omit<DoctorExtra, 'id'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO doctor_extra (date_key, start_time, end_time, reason) VALUES (?, ?, ?, ?)'
  ).bind(row.date_key, row.start_time, row.end_time, row.reason).run();
  return result.meta.last_row_id as number;
}

export async function deleteDoctorExtra(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM doctor_extra WHERE id = ?').bind(id).run();
}

// ─── Review Tracking ───────────────────────────────────────

export async function isReviewSent(db: D1Database, appointmentId: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 FROM review_sent WHERE appointment_id = ?').bind(appointmentId).first();
  return !!row;
}

export async function markReviewSent(
  db: D1Database,
  appointmentId: string,
  nowStr: string,
  source: 'manual' | 'auto' = 'manual',
): Promise<void> {
  // The source column was added in a later migration. On older DBs that
  // never ran the ALTER, the 3-column INSERT raises "no such column: source"
  // — which previously got swallowed by callers and caused duplicate auto-
  // review sends (every cron tick re-sent because the row was never
  // inserted). Fall back to the pre-migration 2-column insert so the row
  // always lands; source simply isn't recorded for that row.
  try {
    await db.prepare('INSERT OR IGNORE INTO review_sent (appointment_id, sent_at, source) VALUES (?, ?, ?)')
      .bind(appointmentId, nowStr, source).run();
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('no such column') || msg.includes('has no column')) {
      await db.prepare('INSERT OR IGNORE INTO review_sent (appointment_id, sent_at) VALUES (?, ?)')
        .bind(appointmentId, nowStr).run();
      return;
    }
    throw e;
  }
}

export async function getReviewSent(db: D1Database, appointmentId: string): Promise<{ sent_at: string; source: string } | null> {
  try {
    const row = await db.prepare('SELECT sent_at, source FROM review_sent WHERE appointment_id = ?')
      .bind(appointmentId).first<{ sent_at: string; source: string }>();
    return row ? { sent_at: row.sent_at, source: row.source || 'manual' } : null;
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('no such column') || msg.includes('has no column')) {
      const row = await db.prepare('SELECT sent_at FROM review_sent WHERE appointment_id = ?')
        .bind(appointmentId).first<{ sent_at: string }>();
      return row ? { sent_at: row.sent_at, source: 'manual' } : null;
    }
    throw e;
  }
}

// ─── Follow-up Tracking ───────────────────────────────────

export async function isFollowUpSent(db: D1Database, appointmentId: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 FROM follow_ups WHERE appointment_id = ?').bind(appointmentId).first();
  return !!row;
}

export async function insertFollowUp(db: D1Database, data: {
  appointment_id: string; clinic: string; patient_name: string; email: string; phone: string; date_key: string; sent_at: string;
}): Promise<boolean> {
  // INSERT OR IGNORE + UNIQUE index on appointment_id gives us an atomic
  // "claim" — returns true only for the one call that actually inserts the row,
  // false for any concurrent/retry call. The cron uses this to guarantee
  // at-most-one follow-up email per booking.
  const res = await db.prepare(
    'INSERT OR IGNORE INTO follow_ups (appointment_id, clinic, patient_name, email, phone, date_key, sent_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(data.appointment_id, data.clinic, data.patient_name, data.email, data.phone, data.date_key, data.sent_at, 'sent').run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateFollowUpResponse(db: D1Database, appointmentId: string, response: string, responseAt: string, questionText?: string): Promise<void> {
  if (questionText) {
    await db.prepare('UPDATE follow_ups SET response = ?, response_at = ?, question_text = ?, status = ? WHERE appointment_id = ?')
      .bind(response, responseAt, questionText, response === 'question' ? 'needs_reply' : 'responded', appointmentId).run();
  } else {
    await db.prepare('UPDATE follow_ups SET response = ?, response_at = ?, status = ? WHERE appointment_id = ?')
      .bind(response, responseAt, 'responded', appointmentId).run();
  }
}

export async function getFollowUps(db: D1Database, status?: string, clinic?: string): Promise<any[]> {
  const clauses: string[] = [];
  const binds: string[] = [];
  if (status) { clauses.push('status = ?'); binds.push(status); }
  if (clinic) { clauses.push('clinic = ?'); binds.push(clinic); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const limit = clauses.length ? '' : ' LIMIT 100';
  const sql = 'SELECT * FROM follow_ups' + where + ' ORDER BY sent_at DESC' + limit;
  return (await db.prepare(sql).bind(...binds).all()).results;
}

export async function getFollowUpByAppointmentId(db: D1Database, appointmentId: string): Promise<any> {
  return db.prepare('SELECT * FROM follow_ups WHERE appointment_id = ?').bind(appointmentId).first();
}

export async function getFollowUpEligibleAppointmentsByDate(db: D1Database, dateKey: string): Promise<Appointment[]> {
  // Most patients never click "confirm attended", so treat BOOKED as eligible too.
  // Relocations still saw a doctor, so they're included.
  // Exclude CANCELLED_CLIENT, CANCELLED_DOCTOR, NO_SHOW.
  const result = await db.prepare(
    "SELECT * FROM appointments WHERE date_key = ? AND status IN ('BOOKED', 'ATTENDED', 'RELOCATED_SPINOLA') ORDER BY start_time"
  ).bind(dateKey).all<Appointment>();
  return result.results;
}

// ─── Find next available day ───────────────────────────────

export function findNextAvailableDay(
  afterDateKey: string,
  offMap: DoctorOffMap,
  durationMin: number
): string | null {
  let d = parseDateKey(afterDateKey);
  for (let i = 1; i <= 30; i++) {
    d = addDays(d, 1);
    const dk = toDateKey(d);
    const holiday = isHolidayOrClosed(d);
    if (holiday.closed) continue;
    const offEntry = offMap[dk];
    if (offEntry?.allDay) continue;
    const slots = buildSlotsForDate(d, durationMin, null);
    if (slots.length > 0) return dk;
  }
  return null;
}

// ─── Referral Tracking ────────────────────────────────────

export function generateReferralCode(email: string): string {
  // Simple deterministic hash: first 8 chars of base36-encoded hash
  let hash = 0;
  const str = email.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return 'ref-' + Math.abs(hash).toString(36).slice(0, 6);
}

export async function getReferrerByCode(db: D1Database, code: string): Promise<any> {
  // Look up the most recent client who was assigned this code
  return db.prepare(
    "SELECT full_name, email, phone FROM clients WHERE email IN (SELECT referrer_email FROM referrals WHERE referral_code = ? LIMIT 1) LIMIT 1"
  ).bind(code).first();
}

export async function lookupReferrerByCode(db: D1Database, code: string): Promise<any> {
  // Find any patient whose email hashes to this code — check clients first, then appointments
  const clients = await db.prepare("SELECT full_name, email, phone FROM clients ORDER BY created_at DESC LIMIT 500").all();
  for (const c of clients.results) {
    if (generateReferralCode(c.email as string) === code) return c;
  }
  // Fallback: check appointments table
  const appts = await db.prepare("SELECT DISTINCT full_name, email, phone FROM appointments ORDER BY created_at DESC LIMIT 500").all();
  for (const a of appts.results) {
    if (generateReferralCode(a.email as string) === code) return a;
  }
  return null;
}

export async function insertReferral(db: D1Database, data: {
  referrer_email: string; referrer_name: string; referrer_phone: string;
  referred_email: string; referred_name: string; referred_appointment_id: string;
  referral_code: string; created_at: string;
}): Promise<void> {
  await db.prepare(
    'INSERT INTO referrals (referrer_email, referrer_name, referrer_phone, referred_email, referred_name, referred_appointment_id, referral_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(data.referrer_email, data.referrer_name, data.referrer_phone, data.referred_email, data.referred_name, data.referred_appointment_id, data.referral_code, data.created_at).run();
}

export async function markReferralThanked(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE referrals SET thanked = 1 WHERE id = ?').bind(id).run();
}

export async function getReferrals(db: D1Database): Promise<any[]> {
  return (await db.prepare('SELECT * FROM referrals ORDER BY created_at DESC LIMIT 100').all()).results;
}

export async function getUnthankedReferrals(db: D1Database): Promise<any[]> {
  return (await db.prepare('SELECT * FROM referrals WHERE thanked = 0 ORDER BY created_at DESC').all()).results;
}

// ─── Telemedicine Calls ───────────────────────────────────

export interface TelemedicineCall {
  id: string;
  date_key: string;
  patient_name: string;
  phone: string;
  email: string;
  comments: string;
  fee_cents: number;
  // Patient's pharmacy bill for this visit (admin-entered). Kept separate
  // from fee_cents so the doctor's total only counts the €25 fees.
  medicine_cents: number;
  // Newline-separated medicine names entered by admin for the prescription.
  medicines: string;
  // Timestamp the prescription/receipt email was sent — empty if not sent.
  prescription_sent_at: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Older DBs may not have the telemedicine_calls table yet. The migration
// is idempotent; running it on every call lets new deploys pick it up
// without forcing a manual `wrangler d1 execute`. Also adds medicine_cents
// to DBs that were created before the column existed.
async function tryAlter(db: D1Database, sql: string): Promise<void> {
  try { await db.prepare(sql).run(); } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('duplicate column') || msg.includes('already exists') || msg.includes('has no column')) return;
    // Anything else: silently ignore — better than blocking every list query
    // if a future migration runs into a benign issue.
  }
}

async function ensureTelemedicineTable(db: D1Database): Promise<void> {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS telemedicine_calls (" +
    "id TEXT PRIMARY KEY," +
    "date_key TEXT NOT NULL," +
    "patient_name TEXT NOT NULL," +
    "phone TEXT NOT NULL," +
    "email TEXT NOT NULL DEFAULT ''," +
    "comments TEXT DEFAULT ''," +
    "fee_cents INTEGER NOT NULL DEFAULT 2500," +
    "medicine_cents INTEGER NOT NULL DEFAULT 0," +
    "medicines TEXT DEFAULT ''," +
    "prescription_sent_at TEXT DEFAULT ''," +
    "status TEXT NOT NULL DEFAULT 'BOOKED'," +
    "source TEXT NOT NULL DEFAULT 'public'," +
    "created_at TEXT NOT NULL," +
    "updated_at TEXT NOT NULL" +
    ")"
  ).run();
  // Older DBs may pre-date one or more columns. Each ALTER is no-op on the
  // freshly-created table or where the column already exists.
  await tryAlter(db, "ALTER TABLE telemedicine_calls ADD COLUMN medicine_cents INTEGER NOT NULL DEFAULT 0");
  await tryAlter(db, "ALTER TABLE telemedicine_calls ADD COLUMN medicines TEXT DEFAULT ''");
  await tryAlter(db, "ALTER TABLE telemedicine_calls ADD COLUMN prescription_sent_at TEXT DEFAULT ''");
}

export async function insertTelemedicineCall(db: D1Database, call: TelemedicineCall): Promise<void> {
  await ensureTelemedicineTable(db);
  await db.prepare(
    'INSERT INTO telemedicine_calls (id, date_key, patient_name, phone, email, comments, fee_cents, medicine_cents, medicines, prescription_sent_at, status, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    call.id, call.date_key, call.patient_name, call.phone, call.email,
    call.comments, call.fee_cents, call.medicine_cents || 0, call.medicines || '',
    call.prescription_sent_at || '', call.status, call.source, call.created_at, call.updated_at
  ).run();
}

export async function updateTelemedicineMedicines(db: D1Database, id: string, medicines: string, nowStr: string): Promise<void> {
  await ensureTelemedicineTable(db);
  await db.prepare('UPDATE telemedicine_calls SET medicines = ?, updated_at = ? WHERE id = ?').bind(medicines, nowStr, id).run();
}

export async function markTelemedicinePrescriptionSent(db: D1Database, id: string, nowStr: string): Promise<void> {
  await ensureTelemedicineTable(db);
  await db.prepare('UPDATE telemedicine_calls SET prescription_sent_at = ?, updated_at = ? WHERE id = ?').bind(nowStr, nowStr, id).run();
}

export async function getTelemedicineCallsByDate(db: D1Database, dateKey: string): Promise<TelemedicineCall[]> {
  await ensureTelemedicineTable(db);
  const result = await db.prepare(
    'SELECT * FROM telemedicine_calls WHERE date_key = ? ORDER BY created_at'
  ).bind(dateKey).all<TelemedicineCall>();
  return result.results;
}

export async function getTelemedicineCallsByDateRange(db: D1Database, fromDate: string, toDate: string): Promise<TelemedicineCall[]> {
  await ensureTelemedicineTable(db);
  const result = await db.prepare(
    'SELECT * FROM telemedicine_calls WHERE date_key >= ? AND date_key <= ? ORDER BY date_key, created_at'
  ).bind(fromDate, toDate).all<TelemedicineCall>();
  return result.results;
}

export async function getTelemedicineCallById(db: D1Database, id: string): Promise<TelemedicineCall | null> {
  await ensureTelemedicineTable(db);
  return db.prepare('SELECT * FROM telemedicine_calls WHERE id = ?').bind(id).first<TelemedicineCall>();
}

export async function deleteTelemedicineCall(db: D1Database, id: string): Promise<void> {
  await ensureTelemedicineTable(db);
  await db.prepare('DELETE FROM telemedicine_calls WHERE id = ?').bind(id).run();
}

export async function updateTelemedicineCallStatus(db: D1Database, id: string, status: string, nowStr: string): Promise<void> {
  await ensureTelemedicineTable(db);
  await db.prepare('UPDATE telemedicine_calls SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowStr, id).run();
}

export async function updateTelemedicineMedicine(db: D1Database, id: string, medicineCents: number, nowStr: string): Promise<void> {
  await ensureTelemedicineTable(db);
  const safe = Math.max(0, Math.round(medicineCents || 0));
  await db.prepare('UPDATE telemedicine_calls SET medicine_cents = ?, updated_at = ? WHERE id = ?').bind(safe, nowStr, id).run();
}

export interface PeriodStats {
  calls: number;          // billable (status != CANCELLED)
  cancelled: number;
  doctorRevenueCents: number;   // count × 25 EUR
  medicineCents: number;        // pharmacy total
  patientTotalCents: number;    // doctor + medicine
  avgMedicineCents: number;     // mean per billable call
  avgPatientCents: number;      // mean patient bill per call
  prescriptionsSent: number;    // rows with prescription_sent_at != ''
}

async function safePeriod(
  db: D1Database,
  fromKey: string | null,
  toKey: string | null,
): Promise<PeriodStats> {
  await ensureTelemedicineTable(db);
  const where: string[] = [];
  const binds: any[] = [];
  if (fromKey) { where.push('date_key >= ?'); binds.push(fromKey); }
  if (toKey) { where.push('date_key <= ?'); binds.push(toKey); }
  const whereClause = where.length ? ' WHERE ' + where.join(' AND ') : '';

  // Old DBs without medicine_cents → fall back to 0. Same trick used by
  // getTelemedicineStats.
  const safeQuery = async (sql: string): Promise<any> => {
    try {
      return await db.prepare(sql).bind(...binds).first<any>();
    } catch {
      const fallback = sql
        .replace('COALESCE(SUM(medicine_cents), 0) AS m', '0 AS m')
        .replace("SUM(CASE WHEN prescription_sent_at != '' THEN 1 ELSE 0 END) AS p", '0 AS p');
      return await db.prepare(fallback).bind(...binds).first<any>();
    }
  };

  const billable = await safeQuery(
    "SELECT COUNT(*) AS c, COALESCE(SUM(fee_cents), 0) AS r, COALESCE(SUM(medicine_cents), 0) AS m, " +
    "SUM(CASE WHEN prescription_sent_at != '' THEN 1 ELSE 0 END) AS p " +
    "FROM telemedicine_calls" + whereClause + (whereClause ? ' AND ' : ' WHERE ') + "status != 'CANCELLED'"
  );
  const cancelled = await db.prepare(
    'SELECT COUNT(*) AS c FROM telemedicine_calls' + whereClause + (whereClause ? ' AND ' : ' WHERE ') + "status = 'CANCELLED'"
  ).bind(...binds).first<{ c: number }>();

  const calls = billable?.c ?? 0;
  const r = billable?.r ?? 0;
  const m = billable?.m ?? 0;
  return {
    calls,
    cancelled: cancelled?.c ?? 0,
    doctorRevenueCents: r,
    medicineCents: m,
    patientTotalCents: r + m,
    avgMedicineCents: calls > 0 ? Math.round(m / calls) : 0,
    avgPatientCents: calls > 0 ? Math.round((r + m) / calls) : 0,
    prescriptionsSent: billable?.p ?? 0,
  };
}

export interface RichTelemedicineStats {
  periods: {
    today: PeriodStats;
    week: PeriodStats;       // Monday → Sunday of current week
    last30: PeriodStats;     // rolling 30 days
    allTime: PeriodStats;
  };
  weekStartKey: string;
  last30StartKey: string;
  status: { booked: number; completed: number; cancelled: number };
  source: { public: number; admin: number };
  hourly: { '20': number; '21': number; '22': number; '23': number; other: number };
  topPatients: { name: string; phone: string; calls: number; lastCall: string }[];
  dailyTrend: { dateKey: string; calls: number; revenueCents: number }[];
  firstCallDate: string;       // earliest date_key seen, for "all time" label
}

export async function getRichTelemedicineStats(
  db: D1Database,
  todayKey: string,
  weekStartKey: string,
  last30StartKey: string,
  last14StartKey: string,
  last90StartKey: string,
): Promise<RichTelemedicineStats> {
  await ensureTelemedicineTable(db);

  const [today, week, last30, allTime] = await Promise.all([
    safePeriod(db, todayKey, todayKey),
    safePeriod(db, weekStartKey, null),
    safePeriod(db, last30StartKey, null),
    safePeriod(db, null, null),
  ]);

  // Status breakdown (all time)
  const statusRows = await db.prepare(
    'SELECT status, COUNT(*) AS c FROM telemedicine_calls GROUP BY status'
  ).all<{ status: string; c: number }>();
  const status = { booked: 0, completed: 0, cancelled: 0 };
  for (const r of statusRows.results) {
    if (r.status === 'BOOKED') status.booked = r.c;
    else if (r.status === 'COMPLETED') status.completed = r.c;
    else if (r.status === 'CANCELLED') status.cancelled = r.c;
  }

  // Source breakdown (last 30 days, billable only — what's driving traffic recently)
  const sourceRows = await db.prepare(
    "SELECT source, COUNT(*) AS c FROM telemedicine_calls " +
    "WHERE date_key >= ? AND status != 'CANCELLED' GROUP BY source"
  ).bind(last30StartKey).all<{ source: string; c: number }>();
  const source = { public: 0, admin: 0 };
  for (const r of sourceRows.results) {
    if (r.source === 'admin') source.admin = r.c;
    else source.public = r.c;
  }

  // Hourly distribution (last 30 days). created_at is "YYYY-MM-DD HH:MM:SS"
  // in the env timezone, so substring 12-13 is the hour. Buckets are 8pm
  // to 11pm for the 4 active hours, plus "other" for anything outside
  // (admin entries logged the next morning, etc).
  const hourly = { '20': 0, '21': 0, '22': 0, '23': 0, other: 0 };
  const hourRows = await db.prepare(
    "SELECT substr(created_at, 12, 2) AS h, COUNT(*) AS c FROM telemedicine_calls " +
    "WHERE date_key >= ? AND status != 'CANCELLED' GROUP BY h"
  ).bind(last30StartKey).all<{ h: string; c: number }>();
  for (const r of hourRows.results) {
    if (r.h === '20' || r.h === '21' || r.h === '22' || r.h === '23') {
      hourly[r.h as '20' | '21' | '22' | '23'] = r.c;
    } else {
      hourly.other += r.c;
    }
  }

  // Top patients last 90 days. Group by phone (more reliable than name)
  // and break ties by name; cap at 5.
  const topRows = await db.prepare(
    "SELECT patient_name AS name, phone, COUNT(*) AS calls, MAX(date_key) AS last_call " +
    "FROM telemedicine_calls WHERE date_key >= ? AND status != 'CANCELLED' " +
    "GROUP BY phone, patient_name HAVING calls >= 1 ORDER BY calls DESC, last_call DESC LIMIT 5"
  ).bind(last90StartKey).all<{ name: string; phone: string; calls: number; last_call: string }>();
  const topPatients = topRows.results.map(r => ({
    name: r.name || '—',
    phone: r.phone || '',
    calls: r.calls,
    lastCall: r.last_call || '',
  }));

  // Daily trend: last 14 days, filling missing days with zero so the
  // chart always has 14 bars.
  const trendRows = await db.prepare(
    "SELECT date_key, COUNT(*) AS calls, COALESCE(SUM(fee_cents), 0) AS rev " +
    "FROM telemedicine_calls WHERE date_key >= ? AND status != 'CANCELLED' GROUP BY date_key"
  ).bind(last14StartKey).all<{ date_key: string; calls: number; rev: number }>();
  const trendMap = new Map(trendRows.results.map(r => [r.date_key, r]));
  const dailyTrend: { dateKey: string; calls: number; revenueCents: number }[] = [];
  // 14 days ending on todayKey (inclusive). Build by string math to avoid
  // tz drift — date_keys here are already in the env timezone.
  let cursor = last14StartKey;
  while (cursor <= todayKey) {
    const found = trendMap.get(cursor);
    dailyTrend.push({
      dateKey: cursor,
      calls: found?.calls ?? 0,
      revenueCents: found?.rev ?? 0,
    });
    // Advance by 1 day via Date math.
    const [y, m, d] = cursor.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    cursor = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
  }

  const firstRow = await db.prepare(
    'SELECT MIN(date_key) AS d FROM telemedicine_calls'
  ).first<{ d: string }>();

  return {
    periods: { today, week, last30, allTime },
    weekStartKey,
    last30StartKey,
    status,
    source,
    hourly,
    topPatients,
    dailyTrend,
    firstCallDate: firstRow?.d || '',
  };
}

// Legacy shape kept so existing admin code that destructures
// { todayCalls, weekRevenueCents, totalMedicineCents, ... } stays
// working. New UI uses getRichTelemedicineStats directly.
export interface TelemedicineStats {
  totalCalls: number;
  totalRevenueCents: number;
  totalMedicineCents: number;
  todayCalls: number;
  todayRevenueCents: number;
  todayMedicineCents: number;
  weekCalls: number;
  weekRevenueCents: number;
  weekMedicineCents: number;
}

export async function getRecentAppointmentActivity(db: D1Database, limit = 60): Promise<any[]> {
  const res = await db.prepare(
    "SELECT id, full_name, service_name, date_key, start_time, status, clinic, created_at, updated_at, cancelled_at, booking_source " +
    "FROM appointments ORDER BY updated_at DESC LIMIT ?"
  ).bind(limit).all<any>();
  return res.results;
}
export async function getRecentTelemedicineActivity(db: D1Database, limit = 30): Promise<any[]> {
  const res = await db.prepare(
    "SELECT id, patient_name, status, created_at, updated_at FROM telemedicine_calls ORDER BY updated_at DESC LIMIT ?"
  ).bind(limit).all<any>();
  return res.results;
}

export async function getTelemedicineStats(db: D1Database, todayKey: string, weekStartKey: string): Promise<TelemedicineStats> {
  const [today, week, all] = await Promise.all([
    safePeriod(db, todayKey, todayKey),
    safePeriod(db, weekStartKey, null),
    safePeriod(db, null, null),
  ]);
  return {
    totalCalls: all.calls,
    totalRevenueCents: all.doctorRevenueCents,
    totalMedicineCents: all.medicineCents,
    todayCalls: today.calls,
    todayRevenueCents: today.doctorRevenueCents,
    todayMedicineCents: today.medicineCents,
    weekCalls: week.calls,
    weekRevenueCents: week.doctorRevenueCents,
    weekMedicineCents: week.medicineCents,
  };
}
