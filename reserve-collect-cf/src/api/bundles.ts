/** Promotional bundles — public browse + staff management. */
import type { Env, Bundle } from '../types';
import { json, requireAdmin } from '../services/http';
import { generateId } from '../services/crypto';
import { nowIso, sanitizeName } from '../services/utils';
import { validateUpload, extForType } from '../services/r2';
import { broadcast } from '../services/realtime-client';
import {
  insertBundle, getBundle, getBundleItems, listActiveBundles, listAllBundles,
  updateBundle, deleteBundle, setBundleImage, replaceBundleItems, getConfigValue,
} from '../db/queries';

export function pricing(items: { price_cents: number }[], discountPct: number) {
  const originalCents = items.reduce((s, i) => s + (i.price_cents || 0), 0);
  const pct = Math.max(0, Math.min(100, discountPct || 0));
  const finalCents = Math.round(originalCents * (100 - pct) / 100);
  return { originalCents, finalCents, saveCents: originalCents - finalCents };
}

function parseItems(raw: any): { name: string; priceCents: number }[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((it: any) => ({
      name: sanitizeName(String(it.name || '')).slice(0, 120),
      priceCents: Math.max(0, Math.round((parseFloat(it.price) || 0) * 100)),
    }))
    .filter(it => it.name.length > 0)
    .slice(0, 30);
}

async function bundleWithItems(env: Env, b: Bundle) {
  const items = await getBundleItems(env.DB, b.id);
  const p = pricing(items, b.discount_pct);
  return {
    id: b.id, title: b.title, description: b.description, discount_pct: b.discount_pct,
    active: b.active, sort_order: b.sort_order, hasImage: !!b.image_key,
    items: items.map(i => ({ name: i.item_name, price_cents: i.price_cents })),
    ...p,
  };
}

// ── Public ──
export async function apiListBundles(request: Request, env: Env): Promise<Response> {
  const bundles = await listActiveBundles(env.DB);
  const out = [];
  for (const b of bundles) out.push(await bundleWithItems(env, b));
  return json({ ok: true, bundles: out });
}

export async function apiServeBundleImage(request: Request, env: Env, id: string): Promise<Response> {
  const b = await getBundle(env.DB, id);
  if (!b || !b.image_key) return new Response('Not found', { status: 404 });
  const obj = await env.PHOTOS.get(b.image_key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

// ── Admin ──
export async function apiAdminListBundles(request: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const bundles = await listAllBundles(env.DB);
  const out = [];
  for (const b of bundles) out.push(await bundleWithItems(env, b));
  return json({ ok: true, bundles: out });
}

export async function apiAdminCreateBundle(request: Request, env: Env): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const body: any = await request.json().catch(() => ({}));
  const title = sanitizeName(String(body.title || '')).slice(0, 120);
  if (!title) return json({ ok: false, reason: 'Bundle title required.' }, 400);
  const items = parseItems(body.items);
  if (items.length === 0) return json({ ok: false, reason: 'Add at least one item with a price.' }, 400);
  const now = nowIso(env.TIMEZONE);
  const id = 'B-' + generateId();
  const bundle: Bundle = {
    id, title, description: String(body.description || '').slice(0, 1000), image_key: '',
    discount_pct: Math.max(0, Math.min(100, parseInt(body.discountPct, 10) || 0)),
    active: body.active === false ? 0 : 1, sort_order: parseInt(body.sortOrder, 10) || 0,
    created_at: now, updated_at: now,
  };
  await insertBundle(env.DB, bundle);
  await replaceBundleItems(env.DB, id, items);
  await broadcast(env, { type: 'changed' });
  return json({ ok: true, id });
}

export async function apiAdminUpdateBundle(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const b = await getBundle(env.DB, id);
  if (!b) return json({ ok: false, reason: 'Not found' }, 404);
  const body: any = await request.json().catch(() => ({}));
  const now = nowIso(env.TIMEZONE);
  await updateBundle(env.DB, id, {
    title: sanitizeName(String(body.title ?? b.title)).slice(0, 120) || b.title,
    description: String(body.description ?? b.description).slice(0, 1000),
    discount_pct: Math.max(0, Math.min(100, parseInt(body.discountPct, 10) || 0)),
    active: body.active === false ? 0 : 1,
    sort_order: parseInt(body.sortOrder, 10) || 0,
    now,
  });
  if (Array.isArray(body.items)) {
    const items = parseItems(body.items);
    if (items.length) await replaceBundleItems(env.DB, id, items);
  }
  await broadcast(env, { type: 'changed' });
  return json({ ok: true });
}

export async function apiAdminDeleteBundle(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const b = await getBundle(env.DB, id);
  if (b && b.image_key) { try { await env.PHOTOS.delete(b.image_key); } catch {} }
  await deleteBundle(env.DB, id);
  await broadcast(env, { type: 'changed' });
  return json({ ok: true });
}

export async function apiAdminUploadBundleImage(request: Request, env: Env, id: string): Promise<Response> {
  const deny = await requireAdmin(request, env); if (deny) return deny;
  const b = await getBundle(env.DB, id);
  if (!b) return json({ ok: false, reason: 'Not found' }, 404);
  let form: FormData;
  try { form = await request.formData(); } catch { return json({ ok: false, reason: 'Invalid upload.' }, 400); }
  const file: any = form.get('file');
  if (!file || typeof file === 'string' || typeof file.stream !== 'function') {
    return json({ ok: false, reason: 'No file provided.' }, 400);
  }
  const maxMb = parseInt((await getConfigValue(env.DB, 'MAX_PHOTO_MB')) || '8', 10) || 8;
  const check = validateUpload(file.type, file.size, maxMb * 1048576);
  if (!check.ok) return json({ ok: false, reason: check.reason }, 400);
  const key = 'bundles/' + id + '.' + check.ext;
  try {
    await env.PHOTOS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  } catch (e) {
    console.error('R2 put error (bundle):', e);
    return json({ ok: false, reason: 'Could not store the image.' }, 500);
  }
  await setBundleImage(env.DB, id, key, nowIso(env.TIMEZONE));
  await broadcast(env, { type: 'changed' });
  return json({ ok: true });
}
