/** Photo upload (multipart, Worker-proxied) and strictly auth-gated serving.
 *  Images are never exposed via public R2 URLs. */
import type { Env } from '../types';
import { json, requireUser, isAdmin } from '../services/http';
import { getSessionUser } from '../services/session';
import { validateUpload, photoKey } from '../services/r2';
import { generateId } from '../services/crypto';
import { nowIso } from '../services/utils';
import { insertPhoto, getPhotoById, getConfigValue } from '../db/queries';

export async function apiUploadPhoto(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if ('error' in auth) return auth.error;
  const user = auth.user;

  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ ok: false, reason: 'Invalid upload.' }, 400); }

  // workers-types narrows form.get() to string|null, but at runtime an uploaded
  // file is a File/Blob. Treat as any and guard on the Blob shape.
  const file: any = form.get('file');
  if (!file || typeof file === 'string' || typeof file.stream !== 'function') {
    return json({ ok: false, reason: 'No file provided.' }, 400);
  }
  const kind = String(form.get('kind') || 'item') === 'prescription' ? 'prescription' : 'item';

  const maxMb = parseInt((await getConfigValue(env.DB, 'MAX_PHOTO_MB')) || '8', 10) || 8;
  const check = validateUpload(file.type, file.size, maxMb * 1048576);
  if (!check.ok) return json({ ok: false, reason: check.reason }, 400);

  const key = photoKey(user.id, check.ext!);
  try {
    await env.PHOTOS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  } catch (e) {
    console.error('R2 put error:', e);
    return json({ ok: false, reason: 'Could not store the image. Please try again.' }, 500);
  }

  const photoId = 'P-' + generateId();
  await insertPhoto(env.DB, {
    id: photoId,
    reservation_id: '',
    item_id: '',
    user_id: user.id,
    r2_key: key,
    kind,
    content_type: file.type,
    size_bytes: file.size,
    created_at: nowIso(env.TIMEZONE),
  });
  return json({ ok: true, photoId, kind });
}

/** Stream a photo to its owner (session) or to an authenticated admin. */
export async function apiServePhoto(request: Request, env: Env, id: string): Promise<Response> {
  const photo = await getPhotoById(env.DB, id);
  if (!photo) return new Response('Not found', { status: 404 });

  const admin = await isAdmin(request, env);
  let allowed = admin;
  if (!allowed) {
    const user = await getSessionUser(request, env);
    allowed = !!user && user.id === photo.user_id;
  }
  if (!allowed) return new Response('Forbidden', { status: 403 });

  const obj = await env.PHOTOS.get(photo.r2_key);
  if (!obj) return new Response('Not found', { status: 404 });

  return new Response(obj.body, {
    headers: {
      'Content-Type': photo.content_type || 'application/octet-stream',
      'Cache-Control': 'private, no-store',
    },
  });
}
