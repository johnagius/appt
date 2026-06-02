/** Signed-cookie session handling.
 *  Cookie value = `${sessionId}.${HMAC(sessionId, SIGNING_SECRET)}`.
 *  Verify by recomputing the sig (safeEqual) — no DB read needed to authenticate
 *  the cookie; a sessions-table lookup then confirms it isn't revoked/expired. */
import type { Env, User } from '../types';
import { computeSig, safeEqual } from './crypto';
import { getSessionById, getUserById } from '../db/queries';
import { nowIso } from './utils';

export const SESSION_COOKIE = 'rc_session';
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export async function signSessionToken(sessionId: string, secret: string): Promise<string> {
  const sig = await computeSig('sess|' + sessionId, secret);
  return sessionId + '.' + sig;
}

export async function parseSessionToken(token: string, secret: string): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const sessionId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await computeSig('sess|' + sessionId, secret);
  return safeEqual(expected, sig) ? sessionId : null;
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SEC}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request: Request, name: string): string {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^\\s;]+)'));
  return m ? m[1] : '';
}

/** Resolve the signed-in, verified user for a request, or null.
 *  Returns null if the cookie is missing/tampered, the session is
 *  revoked/expired, or the user's email isn't verified. */
export async function getSessionUser(request: Request, env: Env): Promise<User | null> {
  const token = readCookie(request, SESSION_COOKIE);
  const sessionId = await parseSessionToken(token, env.SIGNING_SECRET);
  if (!sessionId) return null;

  const session = await getSessionById(env.DB, sessionId);
  if (!session) return null;
  if (session.revoked_at) return null;
  if (session.expires_at && session.expires_at <= nowIso(env.TIMEZONE)) return null;

  const user = await getUserById(env.DB, session.user_id);
  if (!user) return null;
  if (!user.email_verified) return null;
  return user;
}
