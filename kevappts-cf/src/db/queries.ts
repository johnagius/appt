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

export async function isSlotTaken(db: D1Database, dateKey: string, startTime: string, clinic: string): Promise<boolean> {
  const result = await db.prepare(`
    SELECT COUNT(*) as cnt FROM appointments
    WHERE date_key = ? AND start_time = ? AND clinic = ?
    AND status = 'BOOKED'
  `).bind(dateKey, startTime, clinic).first<{ cnt: number }>();
  return (result?.cnt ?? 0) > 0;
}

export async function getTakenSlots(db: D1Database, dateKey: string, clinic: string): Promise<Set<string>> {
  const result = await db.prepare(`
    SELECT start_time FROM appointments
    WHERE date_key = ? AND clinic = ?
    AND status = 'BOOKED'
  `).bind(dateKey, clinic).all<{ start_time: string }>();
  return new Set(result.results.map(r => r.start_time));
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

export async function markReviewSent(db: D1Database, appointmentId: string, nowStr: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO review_sent (appointment_id, sent_at) VALUES (?, ?)')
    .bind(appointmentId, nowStr).run();
}

// ─── Follow-up Tracking ───────────────────────────────────

export async function isFollowUpSent(db: D1Database, appointmentId: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 FROM follow_ups WHERE appointment_id = ?').bind(appointmentId).first();
  return !!row;
}

export async function insertFollowUp(db: D1Database, data: {
  appointment_id: string; clinic: string; patient_name: string; email: string; phone: string; date_key: string; sent_at: string;
}): Promise<void> {
  await db.prepare(
    'INSERT INTO follow_ups (appointment_id, clinic, patient_name, email, phone, date_key, sent_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(data.appointment_id, data.clinic, data.patient_name, data.email, data.phone, data.date_key, data.sent_at, 'sent').run();
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

export async function getFollowUps(db: D1Database, status?: string): Promise<any[]> {
  if (status) {
    return (await db.prepare('SELECT * FROM follow_ups WHERE status = ? ORDER BY sent_at DESC').bind(status).all()).results;
  }
  return (await db.prepare('SELECT * FROM follow_ups ORDER BY sent_at DESC LIMIT 100').all()).results;
}

export async function getFollowUpByAppointmentId(db: D1Database, appointmentId: string): Promise<any> {
  return db.prepare('SELECT * FROM follow_ups WHERE appointment_id = ?').bind(appointmentId).first();
}

export async function getAttendedAppointmentsByDate(db: D1Database, dateKey: string): Promise<Appointment[]> {
  const result = await db.prepare(
    "SELECT * FROM appointments WHERE date_key = ? AND status = 'ATTENDED' ORDER BY start_time"
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
