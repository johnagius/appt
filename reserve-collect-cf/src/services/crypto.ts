/** HMAC-SHA256 signing using Web Crypto API (Cloudflare Workers).
 *  Copied from kevappts-cf and extended with session/OTP helpers. */

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(sig));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return res === 0;
}

export async function computeSig(payload: string, secret: string): Promise<string> {
  return hmacSign(payload, secret);
}

export async function verifySig(payload: string, sig: string, secret: string): Promise<boolean> {
  if (!payload || !sig) return false;
  const expected = await computeSig(payload, secret);
  return safeEqual(expected, sig);
}

// ── Staff dashboard auth (same scheme as kevappts admin) ──
export async function computeAdminSig(secret: string): Promise<string> {
  return computeSig('admin_access', secret);
}

export async function verifyAdminSig(sig: string, secret: string): Promise<boolean> {
  if (!sig) return false;
  const expected = await computeAdminSig(secret);
  return safeEqual(expected, sig);
}

export function generateId(): string {
  return crypto.randomUUID();
}

/** Random 6-digit numeric code for passwordless email login/verification. */
export function generateOtpCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const n = arr[0] % 1000000;
  return String(n).padStart(6, '0');
}

/** Short, human-friendly collection reference, e.g. "PC-7F3K".
 *  Avoids easily-confused characters (0/O, 1/I). */
export function generateReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let code = '';
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return 'PC-' + code;
}

/** Deterministic share code for the loyalty/referral feature (mirrors kevappts). */
export async function generateReferralCode(email: string, secret: string): Promise<string> {
  const sig = await computeSig('ref|' + email.toLowerCase(), secret);
  return sig.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
}
