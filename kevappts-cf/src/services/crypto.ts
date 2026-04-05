/** HMAC-SHA256 signing using Web Crypto API (Cloudflare Workers) */

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

function safeEqual(a: string, b: string): boolean {
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

export async function verifyCancelSig(token: string, sig: string, secret: string): Promise<boolean> {
  if (!token || !sig) return false;

  // Check multiple formats for backwards compatibility with existing signed links
  const candidates = [
    token,
    'cancel|' + token,
    'mode=cancel&token=' + token,
  ];

  for (const c of candidates) {
    const expected = await computeSig(c, secret);
    if (safeEqual(expected, sig)) return true;
  }
  return false;
}

export async function verifyDocActionSig(
  token: string,
  act: string,
  sig: string,
  secret: string
): Promise<boolean> {
  if (!token || !act || !sig) return false;

  const candidates = [
    token + '|' + act,
    'docAction|' + token + '|' + act,
  ];

  for (const c of candidates) {
    const expected = await computeSig(c, secret);
    if (safeEqual(expected, sig)) return true;
  }
  return false;
}

export async function computeAdminSig(secret: string): Promise<string> {
  return computeSig('admin_access', secret);
}

export async function verifyAdminSig(sig: string, secret: string): Promise<boolean> {
  if (!sig) return false;
  const expected = await computeAdminSig(secret);
  return safeEqual(expected, sig);
}

export async function verifyRescheduleSig(token: string, sig: string, secret: string): Promise<boolean> {
  if (!token || !sig) return false;
  const expected = await computeSig('reschedule|' + token, secret);
  return safeEqual(expected, sig);
}

export function generateId(): string {
  return crypto.randomUUID();
}
