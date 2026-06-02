/** Authentication + mandatory email verification.
 *  Two paths, both of which produce a verified user + a session:
 *   - Google Sign-In (OIDC): email is pre-verified by Google.
 *   - Passwordless email OTP: the 6-digit code both logs in AND verifies. */
import type { Env } from '../types';
import { json, html } from '../services/http';
import {
  computeSig, safeEqual, generateId, generateOtpCode, generateReferralCode,
} from '../services/crypto';
import {
  signSessionToken, buildSessionCookie, clearSessionCookie, readCookie,
  SESSION_MAX_AGE_SEC, parseSessionToken,
} from '../services/session';
import { buildGoogleAuthUrl, exchangeCodeForIdentity } from '../services/google-oidc';
import { nowIso, isoPlusDays, isoPlusMinutes, sanitizeEmail, isValidEmail } from '../services/utils';
import {
  getUserByEmail, upsertUserGoogle, upsertUserEmail, createSession, revokeSession,
  putVerification, getVerification, incrementVerificationAttempts, consumeVerification,
  insertReferral, getConfigValue,
} from '../db/queries';
import { getSessionUser } from '../services/session';

const REF_COOKIE = 'rc_ref';
const STATE_COOKIE = 'rc_oauth_state';
const MAX_OTP_ATTEMPTS = 5;

async function startSessionResponse(env: Env, request: Request, userId: string, redirect: string, extraCookies: string[] = []): Promise<Response> {
  const now = nowIso(env.TIMEZONE);
  const sessionId = await createSession(env.DB, {
    userId,
    now,
    expiresAt: isoPlusDays(env.TIMEZONE, 30),
    userAgent: (request.headers.get('User-Agent') || '').slice(0, 200),
  });
  const token = await signSessionToken(sessionId, env.SIGNING_SECRET);
  const headers = new Headers({ 'Location': redirect });
  headers.append('Set-Cookie', buildSessionCookie(token));
  for (const c of extraCookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

/** Record a referral if a valid referral-code cookie is present (new users only). */
async function maybeRecordReferral(env: Env, request: Request, email: string): Promise<void> {
  const code = readCookie(request, REF_COOKIE);
  if (!code) return;
  try { await insertReferral(env.DB, { code, referredEmail: email, now: nowIso(env.TIMEZONE) }); } catch {}
}

// ─── Google ────────────────────────────────────────────────
export async function apiGoogleStart(request: Request, env: Env): Promise<Response> {
  if (!env.GOOGLE_CLIENT_ID) return html('<p>Google sign-in is not configured. Please use email instead.</p>', 503);
  const nonce = generateId();
  const url = buildGoogleAuthUrl(env, nonce);
  const headers = new Headers({ 'Location': url });
  // Short-lived state cookie to defend against CSRF on the callback.
  headers.append('Set-Cookie', `${STATE_COOKIE}=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null, { status: 302, headers });
}

export async function apiGoogleCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const cookieState = readCookie(request, STATE_COOKIE);
  if (!code) return html(authErrorPage('Sign-in was cancelled or failed.'), 400);
  if (!state || !cookieState || !safeEqual(state, cookieState)) {
    return html(authErrorPage('Your sign-in session expired. Please try again.'), 400);
  }
  try {
    const identity = await exchangeCodeForIdentity(env, code);
    const isNew = !(await getUserByEmail(env.DB, identity.email));
    const refCode = await generateReferralCode(identity.email, env.SIGNING_SECRET);
    const user = await upsertUserGoogle(env.DB, {
      email: identity.email,
      googleSub: identity.sub,
      fullName: identity.name,
      referralCode: refCode,
      now: nowIso(env.TIMEZONE),
    });
    if (isNew) await maybeRecordReferral(env, request, identity.email);
    // Clear the state cookie as we set the session.
    return await startSessionResponse(env, request, user.id, '/reserve', [
      `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    ]);
  } catch (e: any) {
    console.error('Google callback error:', e);
    return html(authErrorPage('We could not complete Google sign-in. Please try again or use email.'), 400);
  }
}

// ─── Email OTP ─────────────────────────────────────────────
export async function apiEmailRequest(request: Request, env: Env): Promise<Response> {
  const body: any = await request.json().catch(() => ({}));
  const email = sanitizeEmail(body.email || '');
  if (!isValidEmail(email)) return json({ ok: false, reason: 'Please enter a valid email address.' }, 400);

  const code = generateOtpCode();
  const codeHash = await computeSig(code, env.SIGNING_SECRET);
  const ttlMin = parseInt((await getConfigValue(env.DB, 'OTP_TTL_MIN')) || '10', 10) || 10;
  await putVerification(env.DB, {
    email,
    codeHash,
    expiresAt: isoPlusMinutes(env.TIMEZONE, ttlMin),
    now: nowIso(env.TIMEZONE),
  });
  try {
    const { sendOtpEmail } = await import('../services/email');
    await sendOtpEmail(env, email, code);
  } catch (e) { console.error('OTP email error:', e); }

  // Always respond ok (no account enumeration).
  return json({ ok: true });
}

export async function apiEmailVerify(request: Request, env: Env): Promise<Response> {
  const body: any = await request.json().catch(() => ({}));
  const email = sanitizeEmail(body.email || '');
  const code = String(body.code || '').trim();
  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    return json({ ok: false, reason: 'Enter the 6-digit code we emailed you.' }, 400);
  }
  const rec = await getVerification(env.DB, email);
  const now = nowIso(env.TIMEZONE);
  if (!rec || rec.consumed_at || rec.expires_at <= now) {
    return json({ ok: false, reason: 'That code has expired. Please request a new one.' }, 400);
  }
  if (rec.attempts >= MAX_OTP_ATTEMPTS) {
    return json({ ok: false, reason: 'Too many attempts. Please request a new code.' }, 429);
  }
  const expected = await computeSig(code, env.SIGNING_SECRET);
  if (!safeEqual(expected, rec.code_hash)) {
    await incrementVerificationAttempts(env.DB, email);
    return json({ ok: false, reason: 'Incorrect code. Please try again.' }, 400);
  }

  await consumeVerification(env.DB, email, now);
  const isNew = !(await getUserByEmail(env.DB, email));
  const refCode = await generateReferralCode(email, env.SIGNING_SECRET);
  const user = await upsertUserEmail(env.DB, { email, referralCode: refCode, now });
  if (isNew) await maybeRecordReferral(env, request, email);

  const sessionId = await createSession(env.DB, {
    userId: user.id,
    now,
    expiresAt: isoPlusDays(env.TIMEZONE, 30),
    userAgent: (request.headers.get('User-Agent') || '').slice(0, 200),
  });
  const token = await signSessionToken(sessionId, env.SIGNING_SECRET);
  return json({ ok: true, redirect: '/reserve' }, 200, { 'Set-Cookie': buildSessionCookie(token) });
}

// ─── Session lifecycle ─────────────────────────────────────
export async function apiLogout(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request, 'rc_session');
  const sessionId = await parseSessionToken(token, env.SIGNING_SECRET);
  if (sessionId) {
    try { await revokeSession(env.DB, sessionId, nowIso(env.TIMEZONE)); } catch {}
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}

export async function apiMe(request: Request, env: Env): Promise<Response> {
  const user = await getSessionUser(request, env);
  if (!user) return json({ ok: false });
  return json({
    ok: true,
    user: {
      email: user.email,
      name: user.full_name,
      phone: user.phone,
      verified: !!user.email_verified,
      referralCode: user.referral_code,
    },
  });
}

function authErrorPage(message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign-in</title>
  <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#f6f7fb;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;color:#111827}.box{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 10px 30px rgba(17,24,39,0.08);padding:28px;max-width:380px;text-align:center}a{display:inline-block;margin-top:14px;background:#f5b301;color:#111827;text-decoration:none;font-weight:800;padding:11px 18px;border-radius:999px}</style>
  </head><body><div class="box"><h2>Sign-in problem</h2><p style="color:#6b7280">${message}</p><a href="/signin">Back to sign in</a></div></body></html>`;
}
