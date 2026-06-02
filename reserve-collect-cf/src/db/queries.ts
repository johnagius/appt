import type {
  User, Session, EmailVerification,
  Reservation, ReservationItem, Photo, ReservationEvent,
} from '../types';
import { generateId } from '../services/crypto';

// ─── Data version (dashboard polling) ──────────────────────
export async function getDataVersion(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT version FROM data_version WHERE id = 1').first<{ version: number }>();
  return row?.version ?? 0;
}
export async function bumpVersion(db: D1Database): Promise<void> {
  await db.prepare('UPDATE data_version SET version = version + 1 WHERE id = 1').run();
}

// ─── Config ────────────────────────────────────────────────
export async function getConfigValue(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM config WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}
export async function setConfigValue(db: D1Database, key: string, value: string): Promise<void> {
  await db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').bind(key, value).run();
}

// ─── Users ─────────────────────────────────────────────────
export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
}
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first<User>();
}

/** Insert-or-update a user for the Google sign-in path (email is pre-verified). */
export async function upsertUserGoogle(
  db: D1Database,
  opts: { email: string; googleSub: string; fullName: string; referralCode: string; now: string }
): Promise<User> {
  const existing = await getUserByEmail(db, opts.email);
  if (existing) {
    await db.prepare(
      "UPDATE users SET email_verified = 1, auth_provider = 'google', google_sub = ?, " +
      "full_name = CASE WHEN full_name = '' THEN ? ELSE full_name END, " +
      "updated_at = ?, last_login_at = ? WHERE id = ?"
    ).bind(opts.googleSub, opts.fullName, opts.now, opts.now, existing.id).run();
    return (await getUserById(db, existing.id))!;
  }
  const id = 'U-' + generateId();
  await db.prepare(
    'INSERT INTO users (id, email, email_verified, auth_provider, google_sub, full_name, phone, referral_code, created_at, updated_at, last_login_at) ' +
    "VALUES (?, ?, 1, 'google', ?, ?, '', ?, ?, ?, ?)"
  ).bind(id, opts.email.toLowerCase(), opts.googleSub, opts.fullName, opts.referralCode, opts.now, opts.now, opts.now).run();
  return (await getUserById(db, id))!;
}

/** Insert-or-update a user for the passwordless email path (verified via OTP). */
export async function upsertUserEmail(
  db: D1Database,
  opts: { email: string; referralCode: string; now: string }
): Promise<User> {
  const existing = await getUserByEmail(db, opts.email);
  if (existing) {
    await db.prepare('UPDATE users SET email_verified = 1, updated_at = ?, last_login_at = ? WHERE id = ?')
      .bind(opts.now, opts.now, existing.id).run();
    return (await getUserById(db, existing.id))!;
  }
  const id = 'U-' + generateId();
  await db.prepare(
    'INSERT INTO users (id, email, email_verified, auth_provider, google_sub, full_name, phone, referral_code, created_at, updated_at, last_login_at) ' +
    "VALUES (?, ?, 1, 'email', '', '', '', ?, ?, ?, ?)"
  ).bind(id, opts.email.toLowerCase(), opts.referralCode, opts.now, opts.now, opts.now).run();
  return (await getUserById(db, id))!;
}

/** For staff-created (phone) orders: return the existing user for an email, or
 *  create an UNVERIFIED placeholder user. When the customer later signs in with
 *  the same email (OTP), upsertUserEmail flips email_verified=1 on this same row,
 *  so their phone orders appear under their account automatically. */
export async function getOrCreateUserByEmail(
  db: D1Database,
  opts: { email: string; fullName: string; phone: string; referralCode: string; now: string }
): Promise<User> {
  const existing = await getUserByEmail(db, opts.email);
  if (existing) return existing;
  const id = 'U-' + generateId();
  await db.prepare(
    'INSERT INTO users (id, email, email_verified, auth_provider, google_sub, full_name, phone, referral_code, created_at, updated_at, last_login_at) ' +
    "VALUES (?, ?, 0, 'email', '', ?, ?, ?, ?, ?, '')"
  ).bind(id, opts.email.toLowerCase(), opts.fullName, opts.phone, opts.referralCode, opts.now, opts.now).run();
  return (await getUserById(db, id))!;
}

export async function updateUserProfile(
  db: D1Database, id: string, fullName: string, phone: string, now: string
): Promise<void> {
  await db.prepare('UPDATE users SET full_name = ?, phone = ?, updated_at = ? WHERE id = ?')
    .bind(fullName, phone, now, id).run();
}

// ─── Sessions ──────────────────────────────────────────────
export async function createSession(
  db: D1Database, opts: { userId: string; now: string; expiresAt: string; userAgent: string }
): Promise<string> {
  const id = 'S-' + generateId();
  await db.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, opts.userId, opts.now, opts.expiresAt, '', opts.userAgent).run();
  return id;
}
export async function getSessionById(db: D1Database, id: string): Promise<Session | null> {
  return await db.prepare('SELECT * FROM sessions WHERE id = ?').bind(id).first<Session>();
}
export async function revokeSession(db: D1Database, id: string, now: string): Promise<void> {
  await db.prepare('UPDATE sessions SET revoked_at = ? WHERE id = ?').bind(now, id).run();
}

// ─── Email verification / OTP ──────────────────────────────
export async function putVerification(
  db: D1Database,
  opts: { email: string; codeHash: string; expiresAt: string; now: string; purpose?: string }
): Promise<void> {
  // One active code per email — replace any previous one and reset attempts.
  await db.prepare(
    'INSERT OR REPLACE INTO email_verifications (id, email, code_hash, purpose, attempts, expires_at, consumed_at, created_at) ' +
    "VALUES (?, ?, ?, ?, 0, ?, '', ?)"
  ).bind('EV-' + generateId(), opts.email.toLowerCase(), opts.codeHash, opts.purpose || 'login', opts.expiresAt, opts.now).run();
}
export async function getVerification(db: D1Database, email: string): Promise<EmailVerification | null> {
  return await db.prepare('SELECT * FROM email_verifications WHERE email = ?').bind(email.toLowerCase()).first<EmailVerification>();
}
export async function incrementVerificationAttempts(db: D1Database, email: string): Promise<void> {
  await db.prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE email = ?').bind(email.toLowerCase()).run();
}
export async function consumeVerification(db: D1Database, email: string, now: string): Promise<void> {
  await db.prepare('UPDATE email_verifications SET consumed_at = ? WHERE email = ?').bind(now, email.toLowerCase()).run();
}
export async function purgeExpiredVerifications(db: D1Database, now: string): Promise<void> {
  await db.prepare('DELETE FROM email_verifications WHERE expires_at < ?').bind(now).run();
}

// ─── Reservations ──────────────────────────────────────────
export async function insertReservation(db: D1Database, r: Reservation): Promise<void> {
  await db.prepare(
    'INSERT INTO reservations (id, reference, user_id, customer_name, customer_email, customer_phone, status, notes, staff_note, preferred_day, preferred_time, created_at, updated_at, ready_at, collected_at, notified_ready_at, notified_unavailable_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    r.id, r.reference, r.user_id, r.customer_name, r.customer_email, r.customer_phone,
    r.status, r.notes, r.staff_note, r.preferred_day, r.preferred_time,
    r.created_at, r.updated_at, r.ready_at, r.collected_at, r.notified_ready_at, r.notified_unavailable_at
  ).run();
}
export async function getReservationById(db: D1Database, id: string): Promise<Reservation | null> {
  return await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<Reservation>();
}
export async function getReservationsByUser(db: D1Database, userId: string): Promise<Reservation[]> {
  const res = await db.prepare('SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all<Reservation>();
  return res.results;
}
export async function updateReservationStatus(
  db: D1Database, id: string, status: string, now: string
): Promise<void> {
  await db.prepare('UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id).run();
}
export async function markReservationReady(db: D1Database, id: string, now: string): Promise<void> {
  await db.prepare("UPDATE reservations SET status = 'READY_FOR_COLLECTION', ready_at = ?, updated_at = ? WHERE id = ?")
    .bind(now, now, id).run();
}
export async function markReservationCollected(db: D1Database, id: string, now: string): Promise<void> {
  await db.prepare("UPDATE reservations SET status = 'COLLECTED', collected_at = ?, updated_at = ? WHERE id = ?")
    .bind(now, now, id).run();
}
export async function markNotifiedReady(db: D1Database, id: string, now: string): Promise<void> {
  await db.prepare('UPDATE reservations SET notified_ready_at = ? WHERE id = ?').bind(now, id).run();
}
export async function markNotifiedUnavailable(db: D1Database, id: string, now: string): Promise<void> {
  await db.prepare('UPDATE reservations SET notified_unavailable_at = ? WHERE id = ?').bind(now, id).run();
}
export async function setStaffNote(db: D1Database, id: string, note: string, now: string): Promise<void> {
  await db.prepare('UPDATE reservations SET staff_note = ?, updated_at = ? WHERE id = ?').bind(note, now, id).run();
}

/** Admin list with optional status filter + free-text search over reference/name/email. */
export async function listReservationsForAdmin(
  db: D1Database, opts: { status?: string; q?: string; limit?: number }
): Promise<Reservation[]> {
  const clauses: string[] = [];
  const binds: any[] = [];
  if (opts.status && opts.status !== 'ALL') { clauses.push('status = ?'); binds.push(opts.status); }
  if (opts.q) {
    clauses.push('(reference LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)');
    const like = '%' + opts.q + '%';
    binds.push(like, like, like);
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const limit = Math.min(opts.limit || 200, 500);
  const res = await db.prepare(`SELECT * FROM reservations ${where} ORDER BY created_at DESC LIMIT ${limit}`).bind(...binds).all<Reservation>();
  return res.results;
}

// ─── Reservation items ─────────────────────────────────────
export async function insertReservationItem(db: D1Database, it: ReservationItem): Promise<void> {
  await db.prepare(
    'INSERT INTO reservation_items (id, reservation_id, product_id, item_name, quantity, item_status, staff_note, created_at, updated_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(it.id, it.reservation_id, it.product_id, it.item_name, it.quantity, it.item_status, it.staff_note, it.created_at, it.updated_at).run();
}
export async function getItemsByReservation(db: D1Database, reservationId: string): Promise<ReservationItem[]> {
  const res = await db.prepare('SELECT * FROM reservation_items WHERE reservation_id = ? ORDER BY created_at').bind(reservationId).all<ReservationItem>();
  return res.results;
}
export async function getItemById(db: D1Database, id: string): Promise<ReservationItem | null> {
  return await db.prepare('SELECT * FROM reservation_items WHERE id = ?').bind(id).first<ReservationItem>();
}
export async function updateItemStatus(
  db: D1Database, id: string, status: string, staffNote: string, now: string
): Promise<void> {
  await db.prepare('UPDATE reservation_items SET item_status = ?, staff_note = ?, updated_at = ? WHERE id = ?')
    .bind(status, staffNote, now, id).run();
}

// ─── Photos ────────────────────────────────────────────────
export async function insertPhoto(db: D1Database, p: Photo): Promise<void> {
  await db.prepare(
    'INSERT INTO photos (id, reservation_id, item_id, user_id, r2_key, kind, content_type, size_bytes, created_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(p.id, p.reservation_id, p.item_id, p.user_id, p.r2_key, p.kind, p.content_type, p.size_bytes, p.created_at).run();
}
export async function getPhotoById(db: D1Database, id: string): Promise<Photo | null> {
  return await db.prepare('SELECT * FROM photos WHERE id = ?').bind(id).first<Photo>();
}
export async function getPhotosByReservation(db: D1Database, reservationId: string): Promise<Photo[]> {
  const res = await db.prepare('SELECT * FROM photos WHERE reservation_id = ? ORDER BY created_at').bind(reservationId).all<Photo>();
  return res.results;
}
/** Link an uploaded (orphan) photo to a reservation — ownership-checked. */
export async function linkPhotoToReservation(
  db: D1Database, photoId: string, reservationId: string, userId: string
): Promise<void> {
  await db.prepare("UPDATE photos SET reservation_id = ? WHERE id = ? AND user_id = ? AND reservation_id = ''")
    .bind(reservationId, photoId, userId).run();
}
export async function deletePhotoRow(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM photos WHERE id = ?').bind(id).run();
}
/** Photos belonging to reservations collected/cancelled before `cutoff` (for the purge cron). */
export async function getPhotosToPurge(db: D1Database, cutoff: string): Promise<Photo[]> {
  const res = await db.prepare(
    'SELECT p.* FROM photos p JOIN reservations r ON r.id = p.reservation_id ' +
    "WHERE r.status IN ('COLLECTED','CANCELLED') " +
    "AND COALESCE(NULLIF(r.collected_at,''), r.updated_at) < ?"
  ).bind(cutoff).all<Photo>();
  return res.results;
}

// ─── Events (staff audit trail) ────────────────────────────
export async function insertEvent(
  db: D1Database, opts: { reservationId: string; event: string; actor: string; detail: string; now: string }
): Promise<void> {
  await db.prepare(
    'INSERT INTO reservation_events (reservation_id, event, detail, actor, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(opts.reservationId, opts.event, opts.detail, opts.actor, opts.now).run();
}
export async function getEventsByReservation(db: D1Database, reservationId: string): Promise<ReservationEvent[]> {
  const res = await db.prepare('SELECT * FROM reservation_events WHERE reservation_id = ? ORDER BY created_at').bind(reservationId).all<ReservationEvent>();
  return res.results;
}
/** True if an event of this type was already recorded (e.g. dedup the review email). */
export async function reservationHasEvent(db: D1Database, reservationId: string, event: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 AS x FROM reservation_events WHERE reservation_id = ? AND event = ? LIMIT 1').bind(reservationId, event).first<{ x: number }>();
  return !!row;
}

// ─── Referrals ─────────────────────────────────────────────
export async function insertReferral(
  db: D1Database, opts: { code: string; referredEmail: string; now: string }
): Promise<void> {
  await db.prepare('INSERT INTO referrals (id, code, referred_email, created_at) VALUES (?, ?, ?, ?)')
    .bind('REF-' + generateId(), opts.code, opts.referredEmail.toLowerCase(), opts.now).run();
}

// ─── Stats (dashboard strip) ───────────────────────────────
export interface ReservationStats {
  submitted: number;
  awaiting: number;       // SUBMITTED + ACCEPTED + PARTIALLY_UNAVAILABLE
  ready: number;
  collectedToday: number;
}
export async function getReservationStats(db: D1Database, todayKey: string): Promise<ReservationStats> {
  const counts = await db.prepare('SELECT status, COUNT(*) AS c FROM reservations GROUP BY status').all<{ status: string; c: number }>();
  const map: Record<string, number> = {};
  for (const r of counts.results) map[r.status] = r.c;
  const collected = await db.prepare(
    "SELECT COUNT(*) AS c FROM reservations WHERE status = 'COLLECTED' AND substr(collected_at,1,10) = ?"
  ).bind(todayKey).first<{ c: number }>();
  return {
    submitted: map['SUBMITTED'] || 0,
    awaiting: (map['SUBMITTED'] || 0) + (map['ACCEPTED'] || 0) + (map['PARTIALLY_UNAVAILABLE'] || 0),
    ready: map['READY_FOR_COLLECTION'] || 0,
    collectedToday: collected?.c || 0,
  };
}
