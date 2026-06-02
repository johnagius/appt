/** Small response + auth-guard helpers shared across handlers. */
import type { Env, User } from '../types';
import { verifyAdminSig } from './crypto';
import { getSessionUser, readCookie } from './session';

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

export function html(body: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...extraHeaders,
    },
  });
}

/** Admin auth via ?sig= query param or admin_sig cookie (same scheme as kevappts). */
export async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const url = new URL(request.url);
  const qsig = (url.searchParams.get('sig') || '').trim();
  if (qsig && await verifyAdminSig(qsig, env.ADMIN_SECRET)) return true;
  const csig = readCookie(request, 'admin_sig');
  if (csig && await verifyAdminSig(csig, env.ADMIN_SECRET)) return true;
  return false;
}

/** Returns a 403 Response if the request is not an authenticated admin, else null. */
export async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (await isAdmin(request, env)) return null;
  return json({ ok: false, reason: 'Access denied' }, 403);
}

/** Resolve the signed-in verified user, or return a 401 JSON Response. */
export async function requireUser(request: Request, env: Env): Promise<{ user: User } | { error: Response }> {
  const user = await getSessionUser(request, env);
  if (!user) return { error: json({ ok: false, reason: 'Please sign in and verify your email first.' }, 401) };
  return { user };
}
