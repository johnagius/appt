/** R2 photo storage helpers: validation + key generation.
 *  Images are stored privately; they are only ever streamed back through
 *  auth-gated worker routes, never via public bucket URLs. */
import { generateId } from './crypto';

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export function extForType(contentType: string): string | null {
  return ALLOWED[contentType.toLowerCase()] || null;
}

export interface UploadCheck { ok: boolean; reason?: string; ext?: string; }

export function validateUpload(contentType: string, sizeBytes: number, maxBytes: number): UploadCheck {
  const ext = extForType(contentType || '');
  if (!ext) return { ok: false, reason: 'Only JPG, PNG, WEBP or HEIC images are allowed.' };
  if (sizeBytes <= 0) return { ok: false, reason: 'Empty file.' };
  if (sizeBytes > maxBytes) return { ok: false, reason: 'Image is too large (max ' + Math.round(maxBytes / 1048576) + ' MB).' };
  return { ok: true, ext };
}

/** Per-user namespaced object key, e.g. "users/U-xxx/uuid.jpg". */
export function photoKey(userId: string, ext: string): string {
  return `users/${userId}/${generateId()}.${ext}`;
}
