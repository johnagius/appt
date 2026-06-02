/** Customer-facing reservation endpoints. All require a verified session. */
import type { Env, Reservation, ReservationItem } from '../types';
import { json, requireUser } from '../services/http';
import { generateId, generateReference } from '../services/crypto';
import { nowIso, sanitizeName, sanitizePhone } from '../services/utils';
import {
  insertReservation, insertReservationItem, linkPhotoToReservation,
  getReservationsByUser, getReservationById, getItemsByReservation,
  getPhotosByReservation, getEventsByReservation, updateReservationStatus,
  insertEvent, updateUserProfile, bumpVersion,
} from '../db/queries';
import { sendReservationReceivedEmail, sendStaffNewReservationEmail } from '../services/email';

const MAX_ITEMS = 30;

export async function apiCreateReservation(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const user = auth.user;

  const body: any = await request.json().catch(() => ({}));
  const rawItems: any[] = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map(it => ({ name: sanitizeName(String(it.name || '')), quantity: Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1)) }))
    .filter(it => it.name.length > 0)
    .slice(0, MAX_ITEMS);

  if (items.length === 0) return json({ ok: false, reason: 'Add at least one item to reserve.' }, 400);

  const name = sanitizeName(body.name || user.full_name || '');
  const phone = sanitizePhone(body.phone || user.phone || '');
  if (!name) return json({ ok: false, reason: 'Please enter your name.' }, 400);

  const now = nowIso(env.TIMEZONE);
  const reservationId = 'R-' + generateId();
  const reference = generateReference();

  const reservation: Reservation = {
    id: reservationId,
    reference,
    user_id: user.id,
    customer_name: name,
    customer_email: user.email,
    customer_phone: phone,
    status: 'SUBMITTED',
    notes: sanitizeName(body.notes || '').slice(0, 1000),
    staff_note: '',
    preferred_day: sanitizeName(body.preferredDay || '').slice(0, 60),
    preferred_time: sanitizeName(body.preferredTime || '').slice(0, 60),
    created_at: now,
    updated_at: now,
    ready_at: '',
    collected_at: '',
    notified_ready_at: '',
    notified_unavailable_at: '',
  };
  await insertReservation(env.DB, reservation);

  const itemRows: ReservationItem[] = [];
  for (const it of items) {
    const row: ReservationItem = {
      id: 'RI-' + generateId(),
      reservation_id: reservationId,
      product_id: '',
      item_name: it.name,
      quantity: it.quantity,
      item_status: 'PENDING',
      staff_note: '',
      created_at: now,
      updated_at: now,
    };
    await insertReservationItem(env.DB, row);
    itemRows.push(row);
  }

  // Link any pre-uploaded photos (ownership-checked in the query).
  const photoIds: string[] = Array.isArray(body.photoIds) ? body.photoIds.slice(0, 20) : [];
  for (const pid of photoIds) {
    try { await linkPhotoToReservation(env.DB, String(pid), reservationId, user.id); } catch {}
  }

  // Persist name/phone back onto the profile for next time (saved profile).
  try { await updateUserProfile(env.DB, user.id, name, phone, now); } catch {}

  await insertEvent(env.DB, { reservationId, event: 'SUBMITTED', actor: 'customer', detail: items.length + ' item(s)', now });
  await bumpVersion(env.DB);

  // Notifications (best-effort; don't block the response on email).
  try { await sendReservationReceivedEmail(env, reservation, itemRows); } catch (e) { console.error('received email', e); }
  try { await sendStaffNewReservationEmail(env, reservation, itemRows); } catch (e) { console.error('staff email', e); }

  return json({ ok: true, reference, id: reservationId });
}

export async function apiListMyReservations(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const list = await getReservationsByUser(env.DB, auth.user.id);
  const out = [];
  for (const r of list) {
    const items = await getItemsByReservation(env.DB, r.id);
    out.push({ ...r, items });
  }
  return json({ ok: true, reservations: out });
}

export async function apiGetMyReservation(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const r = await getReservationById(env.DB, id);
  if (!r || r.user_id !== auth.user.id) return json({ ok: false, reason: 'Not found' }, 404);
  const items = await getItemsByReservation(env.DB, id);
  const photos = (await getPhotosByReservation(env.DB, id)).map(p => ({ id: p.id, kind: p.kind }));
  const events = await getEventsByReservation(env.DB, id);
  return json({ ok: true, reservation: { ...r, items, photos, events } });
}

export async function apiCancelMyReservation(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const r = await getReservationById(env.DB, id);
  if (!r || r.user_id !== auth.user.id) return json({ ok: false, reason: 'Not found' }, 404);
  if (r.status === 'COLLECTED' || r.status === 'CANCELLED') {
    return json({ ok: false, reason: 'This reservation can no longer be cancelled.' }, 400);
  }
  const now = nowIso(env.TIMEZONE);
  await updateReservationStatus(env.DB, id, 'CANCELLED', now);
  await insertEvent(env.DB, { reservationId: id, event: 'CANCELLED', actor: 'customer', detail: '', now });
  await bumpVersion(env.DB);
  return json({ ok: true });
}

/** Reorder: create a fresh reservation copying the item names from a past one.
 *  Photos (incl. prescriptions) are NOT copied — they must be re-attached. */
export async function apiReorderReservation(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const user = auth.user;
  const src = await getReservationById(env.DB, id);
  if (!src || src.user_id !== user.id) return json({ ok: false, reason: 'Not found' }, 404);
  const srcItems = await getItemsByReservation(env.DB, id);
  if (srcItems.length === 0) return json({ ok: false, reason: 'Nothing to reorder.' }, 400);

  const now = nowIso(env.TIMEZONE);
  const reservationId = 'R-' + generateId();
  const reference = generateReference();
  const reservation: Reservation = {
    id: reservationId, reference, user_id: user.id,
    customer_name: src.customer_name, customer_email: user.email, customer_phone: src.customer_phone,
    status: 'SUBMITTED', notes: '', staff_note: '', preferred_day: '', preferred_time: '',
    created_at: now, updated_at: now, ready_at: '', collected_at: '',
    notified_ready_at: '', notified_unavailable_at: '',
  };
  await insertReservation(env.DB, reservation);
  const itemRows: ReservationItem[] = [];
  for (const it of srcItems) {
    const row: ReservationItem = {
      id: 'RI-' + generateId(), reservation_id: reservationId, product_id: it.product_id,
      item_name: it.item_name, quantity: it.quantity, item_status: 'PENDING', staff_note: '',
      created_at: now, updated_at: now,
    };
    await insertReservationItem(env.DB, row);
    itemRows.push(row);
  }
  await insertEvent(env.DB, { reservationId, event: 'SUBMITTED', actor: 'customer', detail: 'reorder of ' + src.reference, now });
  await bumpVersion(env.DB);
  try { await sendReservationReceivedEmail(env, reservation, itemRows); } catch {}
  try { await sendStaffNewReservationEmail(env, reservation, itemRows); } catch {}
  return json({ ok: true, reference, id: reservationId });
}
