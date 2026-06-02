/** Google Sign-In (OAuth 2.0 / OIDC) for the authorization-code flow.
 *  The id_token is fetched server-to-server directly from Google's token
 *  endpoint over TLS using our client secret, so we validate its claims
 *  (iss / aud / exp / email_verified) rather than re-fetching JWKS. */
import type { Env } from '../types';

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

export interface GoogleIdentity {
  email: string;
  emailVerified: boolean;
  sub: string;
  name: string;
}

export function redirectUri(env: Env): string {
  return env.PUBLIC_BASE_URL.replace(/\/$/, '') + '/api/auth/google/callback';
}

export function buildGoogleAuthUrl(env: Env, state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(env),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });
  return GOOGLE_AUTH + '?' + params.toString();
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  // decode UTF-8
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(jwt: string): any {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Malformed id_token');
  return JSON.parse(base64UrlDecode(parts[1]));
}

/** Exchange the authorization code and return the verified Google identity. */
export async function exchangeCodeForIdentity(env: Env, code: string): Promise<GoogleIdentity> {
  const res = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(env),
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('Google token exchange failed: ' + res.status + ' ' + t);
  }
  const tokens: any = await res.json();
  if (!tokens.id_token) throw new Error('No id_token in Google response');

  const claims = decodeJwtPayload(tokens.id_token);

  // Validate claims.
  const validIss = claims.iss === 'https://accounts.google.com' || claims.iss === 'accounts.google.com';
  if (!validIss) throw new Error('Invalid id_token issuer');
  if (claims.aud !== env.GOOGLE_CLIENT_ID) throw new Error('id_token audience mismatch');
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof claims.exp === 'number' && claims.exp < nowSec - 60) throw new Error('id_token expired');
  if (!claims.email) throw new Error('No email in id_token');
  if (claims.email_verified === false) throw new Error('Google email not verified');

  return {
    email: String(claims.email).toLowerCase(),
    emailVerified: claims.email_verified !== false,
    sub: String(claims.sub || ''),
    name: String(claims.name || ''),
  };
}
