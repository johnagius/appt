/** Saved favourites — a customer's usual items for one-tap re-order. */
import type { Env } from '../types';
import { json, requireUser } from '../services/http';
import { nowIso, sanitizeName } from '../services/utils';
import { addFavourite, listFavourites, deleteFavourite } from '../db/queries';

export async function apiListFavourites(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const favourites = await listFavourites(env.DB, auth.user.id);
  return json({ ok: true, favourites });
}

export async function apiAddFavourite(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const body: any = await request.json().catch(() => ({}));
  const name = sanitizeName(String(body.name || '')).slice(0, 120);
  if (!name) return json({ ok: false, reason: 'Item name required.' }, 400);
  const quantity = Math.max(1, Math.min(99, parseInt(body.quantity, 10) || 1));
  await addFavourite(env.DB, { userId: auth.user.id, itemName: name, quantity, now: nowIso(env.TIMEZONE) });
  return json({ ok: true });
}

export async function apiDeleteFavourite(request: Request, env: Env, id: string): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  await deleteFavourite(env.DB, id, auth.user.id);
  return json({ ok: true });
}
