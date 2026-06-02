/** Staff dashboard API. All routes are HMAC-sig gated (same scheme as kevappts). */
import type { Env, Reservation, ReservationItem } from '../types';
import { json, requireAdmin } from '../services/http';
import { nowIso, sanitizeName, sanitizeEmail, sanitizePhone, isValidEmail } from '../services/utils';
import { generateId, generateReference, generateReferralCode } from '../services/crypto';
import {
  listReservationsForAdmin, getReservationById, getItemsByReservation,
  getPhotosByReservation, getEventsByReservation, getItemById, updateItemStatus,
  updateReservationStatus, markReservationReady, markReservationCollected,
  markNotifiedReady, markNotifiedUnavailable, setStaffNote, insertEvent,
  bumpVersion, getReservationStats, getDataVersion,
  getOrCreateUserByEmail, insertReservation, insertReservationItem, reservationHasEvent,
  promotePendingItemsToAvailable,
} from '../db/queries';
import { deriveOrderStatus, hasCollectable, VALID_ITEM_STATUSES } from '../services/status';
import {
  sendReadyForCollectionEmail, sendUnavailableEmail, sendCustomNotificationEmail,
  sendReviewRequestEmail, sendStaffCreatedReservationEmail,
} from '../services/email';

const MAX_ITEMS = 30;

function todayKey(env: Env): string { return nowIso(env.TIMEZONE).slice(0, 10); }
const TERMINAL = new Set(['READY_FOR_COLLECTION', 'COLLECTED', 'CANCELLED']);

export async function apiPoll(env: Env): Promise<Response> {
  return json({ v: await getDataVersion(env.DB) });
}

export async function apiAdminListReservations(request: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'ALL';
  const q = (url.searchParams.get('q') || '').trim();
  const rows = await listReservationsForAdmin(env.DB, { status, q });
  const out = [];
  for (const r of rows) {
    const items = await getItemsByReservation(env.DB, r.id);
    const photos = await getPhotosByReservation(env.DB, r.id);
    out.push({ ...r, items, photoCount: photos.length });
  }
  return json({ ok: true, reservations: out });
}

/** Staff-create a reservation on behalf of a customer (e.g. a phone order).
 *  Links it to the customer's email account (created unverified if new) so they
 *  see it once they sign in with that email. Emails them the reference + a
 *  sign-in link. */
export async function apiAdminCreateReservation(request: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const body: any = await request.json().catch(() => ({}));

  const email = sanitizeEmail(body.email || '');
  if (!isValidEmail(email)) return json({ ok: false, reason: 'Enter a valid customer email.' }, 400);
  const name = sanitizeName(body.name || '');
  if (!name) return json({ ok: false, reason: 'Enter the customer name.' }, 400);
  const phone = sanitizePhone(body.phone || '');

  const rawItems: any[] = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map(it => ({ name: sanitizeName(String(it.name || '')), quantity: Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1)) }))
    .filter(it => it.name.length > 0)
    .slice(0, MAX_ITEMS);
  if (items.length === 0) return json({ ok: false, reason: 'Add at least one item.' }, 400);

  const now = nowIso(env.TIMEZONE);
  const refCode = await generateReferralCode(email, env.SIGNING_SECRET);
  const user = await getOrCreateUserByEmail(env.DB, { email, fullName: name, phone, referralCode: refCode, now });

  const reservationId = 'R-' + generateId();
  const reference = generateReference();
  const reservation: Reservation = {
    id: reservationId, reference, user_id: user.id,
    customer_name: name, customer_email: email, customer_phone: phone,
    status: 'SUBMITTED', notes: sanitizeName(body.notes || '').slice(0, 1000),
    staff_note: 'Created by staff (phone order)', preferred_day: '', preferred_time: '',
    created_at: now, updated_at: now, ready_at: '', collected_at: '',
    notified_ready_at: '', notified_unavailable_at: '',
  };
  await insertReservation(env.DB, reservation);
  const itemRows: ReservationItem[] = [];
  for (const it of items) {
    const row: ReservationItem = {
      id: 'RI-' + generateId(), reservation_id: reservationId, product_id: '',
      item_name: it.name, quantity: it.quantity, item_status: 'PENDING', staff_note: '',
      created_at: now, updated_at: now,
    };
    await insertReservationItem(env.DB, row);
    itemRows.push(row);
  }
  await insertEvent(env.DB, { reservationId, event: 'SUBMITTED', actor: 'staff', detail: 'phone order', now });
  await bumpVersion(env.DB);
  try { await sendStaffCreatedReservationEmail(env, reservation, itemRows); } catch (e) { console.error('staff-created email', e); }
  return json({ ok: true, reference, id: reservationId });
}

export async function apiAdminGetReservation(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);
  const items = await getItemsByReservation(env.DB, id);
  const photos = (await getPhotosByReservation(env.DB, id)).map(p => ({ id: p.id, kind: p.kind, content_type: p.content_type }));
  const events = await getEventsByReservation(env.DB, id);
  return json({ ok: true, reservation: { ...r, items, photos, events } });
}

/** Set per-item availability (Available / Reserved already / Unavailable) and
 *  recompute the order status (unless it's already in a terminal state). */
export async function apiAdminSetItems(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);

  const body: any = await request.json().catch(() => ({}));
  const updates: any[] = Array.isArray(body.items) ? body.items : [];
  const now = nowIso(env.TIMEZONE);

  for (const u of updates) {
    const item = await getItemById(env.DB, String(u.id || ''));
    if (!item || item.reservation_id !== id) continue;
    const status = VALID_ITEM_STATUSES.includes(u.status) ? u.status : item.item_status;
    const note = String(u.staffNote || item.staff_note || '').slice(0, 500);
    await updateItemStatus(env.DB, item.id, status, note, now);
  }

  if (typeof body.staffNote === 'string') {
    await setStaffNote(env.DB, id, body.staffNote.slice(0, 1000), now);
  }

  const items = await getItemsByReservation(env.DB, id);
  let newStatus = r.status;
  if (!TERMINAL.has(r.status)) {
    newStatus = deriveOrderStatus(items);
    await updateReservationStatus(env.DB, id, newStatus, now);
  }
  await insertEvent(env.DB, { reservationId: id, event: 'ITEMS_REVIEWED', actor: 'staff', detail: newStatus, now });
  await bumpVersion(env.DB);
  return json({ ok: true, status: newStatus, collectable: hasCollectable(items) });
}

export async function apiAdminMarkReady(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);
  const now = nowIso(env.TIMEZONE);
  // Any item not explicitly flagged is treated as available on "ready".
  await promotePendingItemsToAvailable(env.DB, id, now);
  await markReservationReady(env.DB, id, now);
  await insertEvent(env.DB, { reservationId: id, event: 'READY', actor: 'staff', detail: '', now });
  // Send the ready email once.
  if (!r.notified_ready_at) {
    const items = await getItemsByReservation(env.DB, id);
    try {
      await sendReadyForCollectionEmail(env, { ...r, status: 'READY_FOR_COLLECTION', ready_at: now }, items);
      await markNotifiedReady(env.DB, id, now);
    } catch (e) { console.error('ready email', e); }
  }
  await bumpVersion(env.DB);
  return json({ ok: true });
}

export async function apiAdminMarkCollected(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);
  const now = nowIso(env.TIMEZONE);
  await markReservationCollected(env.DB, id, now);
  await insertEvent(env.DB, { reservationId: id, event: 'COLLECTED', actor: 'staff', detail: '', now });
  // Send a review request once, after the order is completed.
  if (r.customer_email && !(await reservationHasEvent(env.DB, id, 'REVIEW_SENT'))) {
    try {
      await sendReviewRequestEmail(env, { ...r, status: 'COLLECTED', collected_at: now });
      await insertEvent(env.DB, { reservationId: id, event: 'REVIEW_SENT', actor: 'system', detail: '', now });
    } catch (e) { console.error('review email', e); }
  }
  await bumpVersion(env.DB);
  return json({ ok: true });
}

export async function apiAdminNotify(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);
  const body: any = await request.json().catch(() => ({}));
  const type = String(body.type || 'custom');
  const items = await getItemsByReservation(env.DB, id);
  const now = nowIso(env.TIMEZONE);
  try {
    if (type === 'ready') {
      await promotePendingItemsToAvailable(env.DB, id, now);
      await sendReadyForCollectionEmail(env, r, await getItemsByReservation(env.DB, id));
      await markNotifiedReady(env.DB, id, now);
    } else if (type === 'unavailable') {
      await sendUnavailableEmail(env, r, items);
      await markNotifiedUnavailable(env.DB, id, now);
    } else {
      const msg = String(body.message || '').trim();
      if (!msg) return json({ ok: false, reason: 'Enter a message.' }, 400);
      await sendCustomNotificationEmail(env, r, msg);
    }
  } catch (e) {
    console.error('notify error', e);
    return json({ ok: false, reason: 'Email failed to send.' }, 500);
  }
  await insertEvent(env.DB, { reservationId: id, event: 'NOTIFIED', actor: 'staff', detail: type, now });
  return json({ ok: true });
}

export async function apiAdminCancel(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const r = await getReservationById(env.DB, id);
  if (!r) return json({ ok: false, reason: 'Not found' }, 404);
  const now = nowIso(env.TIMEZONE);
  await updateReservationStatus(env.DB, id, 'CANCELLED', now);
  await insertEvent(env.DB, { reservationId: id, event: 'CANCELLED', actor: 'staff', detail: '', now });
  await bumpVersion(env.DB);
  return json({ ok: true });
}

export async function apiAdminStats(request: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const stats = await getReservationStats(env.DB, todayKey(env));
  return json({ ok: true, stats });
}
