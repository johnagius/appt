/** Staff dashboard API. All routes are HMAC-sig gated (same scheme as kevappts). */
import type { Env } from '../types';
import { json, requireAdmin } from '../services/http';
import { nowIso } from '../services/utils';
import {
  listReservationsForAdmin, getReservationById, getItemsByReservation,
  getPhotosByReservation, getEventsByReservation, getItemById, updateItemStatus,
  updateReservationStatus, markReservationReady, markReservationCollected,
  markNotifiedReady, markNotifiedUnavailable, setStaffNote, insertEvent,
  bumpVersion, getReservationStats, getDataVersion,
} from '../db/queries';
import { deriveOrderStatus, hasCollectable, VALID_ITEM_STATUSES } from '../services/status';
import {
  sendReadyForCollectionEmail, sendUnavailableEmail, sendCustomNotificationEmail,
} from '../services/email';

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
      await sendReadyForCollectionEmail(env, r, items);
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
