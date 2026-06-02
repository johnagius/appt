/**
 * Reserve & Collect — Cloudflare Worker entry point.
 *
 * Pages:  GET /  /signin  /verify  /reserve (auth)  /orders (auth)  /admin (staff)
 * Auth:   /api/auth/google/start|callback, /api/auth/email/request|verify, /logout, /me
 * Resv:   POST/GET /api/reservations, GET/POST /api/reservations/:id(/cancel|/reorder)
 * Photos: POST /api/photos, GET /api/photos/:id (auth-gated)
 * Admin:  /api/admin/* (HMAC sig-gated), POST /admin/login, GET /api/poll
 * Cron:   hourly — expire OTPs + purge old photos
 */
import type { Env } from './types';
import { RealtimeHub } from './realtime';
import { html, json } from './services/http';
import { computeAdminSig, verifyAdminSig } from './services/crypto';
import { getSessionUser, parseSessionToken, clearSessionCookie, readCookie } from './services/session';
import { nowIso, isoOffset } from './services/utils';
import {
  apiGoogleStart, apiGoogleCallback, apiEmailRequest, apiEmailVerify, apiLogout, apiMe,
} from './api/auth';
import {
  apiCreateReservation, apiListMyReservations, apiGetMyReservation,
  apiCancelMyReservation, apiReorderReservation,
} from './api/reservations';
import { apiUploadPhoto, apiServePhoto } from './api/photos';
import { apiListFavourites, apiAddFavourite, apiDeleteFavourite } from './api/favourites';
import {
  apiListBundles, apiServeBundleImage, apiAdminListBundles, apiAdminCreateBundle,
  apiAdminUpdateBundle, apiAdminDeleteBundle, apiAdminUploadBundleImage,
} from './api/bundles';
import {
  apiPoll, apiAdminListReservations, apiAdminGetReservation, apiAdminSetItems,
  apiAdminMarkReady, apiAdminMarkCollected, apiAdminNotify, apiAdminCancel, apiAdminStats,
  apiAdminCreateReservation, apiAdminWipe, apiAdminActivity,
} from './api/admin';
import { purgeExpiredVerifications, getPhotosToPurge, deletePhotoRow, getConfigValue, revokeSession } from './db/queries';
import { indexPage } from './pages/index-page';
import { signinPage } from './pages/signin-page';
import { verifyPage } from './pages/verify-page';
import { reservePage } from './pages/reserve-page';
import { ordersPage } from './pages/orders-page';
import { adminPage } from './pages/admin-page';

export { RealtimeHub };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    (globalThis as any).__ctx = ctx;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // ─── WebSocket (realtime dashboard updates) ───
      if (path === '/api/ws') {
        const id = env.REALTIME.idFromName('global');
        const stub = env.REALTIME.get(id);
        return stub.fetch(new Request('http://internal/ws', { headers: request.headers }));
      }

      // ─── Auth API ─────────────────────────────────
      if (path === '/api/auth/google/start' && method === 'GET') return apiGoogleStart(request, env);
      if (path === '/api/auth/google/callback' && method === 'GET') return apiGoogleCallback(request, env);
      if (path === '/api/auth/email/request' && method === 'POST') return apiEmailRequest(request, env);
      if (path === '/api/auth/email/verify' && method === 'POST') return apiEmailVerify(request, env);
      if (path === '/api/auth/logout' && method === 'POST') return apiLogout(request, env);
      if (path === '/api/auth/me' && method === 'GET') return apiMe(request, env);

      // Convenience GET logout for the header link.
      if (path === '/logout' && method === 'GET') {
        const token = readCookie(request, 'rc_session');
        const sid = await parseSessionToken(token, env.SIGNING_SECRET);
        if (sid) { try { await revokeSession(env.DB, sid, nowIso(env.TIMEZONE)); } catch {} }
        return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': clearSessionCookie() } });
      }

      // ─── Poll ─────────────────────────────────────
      if (path === '/api/poll' && method === 'GET') return apiPoll(env);

      // ─── Photos ───────────────────────────────────
      if (path === '/api/photos' && method === 'POST') return apiUploadPhoto(request, env);
      if (path.startsWith('/api/photos/') && method === 'GET') {
        return apiServePhoto(request, env, decodeURIComponent(path.slice('/api/photos/'.length)));
      }

      // ─── Reservations API ─────────────────────────
      if (path === '/api/reservations' && method === 'POST') return apiCreateReservation(request, env);
      if (path === '/api/reservations' && method === 'GET') return apiListMyReservations(request, env);
      {
        const m = path.match(/^\/api\/reservations\/([^\/]+)(?:\/(cancel|reorder))?$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          const action = m[2];
          if (!action && method === 'GET') return apiGetMyReservation(request, env, id);
          if (action === 'cancel' && method === 'POST') return apiCancelMyReservation(request, env, id);
          if (action === 'reorder' && method === 'POST') return apiReorderReservation(request, env, id);
        }
      }

      // ─── Bundles (public) + favourites (customer) ─
      if (path === '/api/bundles' && method === 'GET') return apiListBundles(request, env);
      if (path.startsWith('/api/bundles/') && path.endsWith('/image') && method === 'GET') {
        return apiServeBundleImage(request, env, decodeURIComponent(path.slice('/api/bundles/'.length, -'/image'.length)));
      }
      if (path === '/api/favourites' && method === 'GET') return apiListFavourites(request, env);
      if (path === '/api/favourites' && method === 'POST') return apiAddFavourite(request, env);
      {
        const mf = path.match(/^\/api\/favourites\/([^\/]+)\/delete$/);
        if (mf && method === 'POST') return apiDeleteFavourite(request, env, decodeURIComponent(mf[1]));
      }

      // ─── Admin login ──────────────────────────────
      if (path === '/admin/login' && method === 'POST') {
        const form = await request.formData();
        const password = (form.get('password') as string || '').trim();
        const redirect = (form.get('redirect') as string) || '/admin';
        if (password === env.ADMIN_PASSWORD || password === env.ADMIN_SECRET) {
          const sig = await computeAdminSig(env.ADMIN_SECRET);
          return new Response(null, {
            status: 302,
            headers: {
              'Location': redirect,
              'Set-Cookie': `admin_sig=${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`,
            },
          });
        }
        return html(loginPage(redirect, 'Wrong password. Try again.'));
      }

      // ─── Admin photo (sig-gated stream) ───────────
      if (path.startsWith('/api/admin/photo/') && method === 'GET') {
        return apiServePhoto(request, env, decodeURIComponent(path.slice('/api/admin/photo/'.length)));
      }

      // ─── Admin API ────────────────────────────────
      if (path.startsWith('/api/admin/')) {
        if (path === '/api/admin/stats' && method === 'GET') return apiAdminStats(request, env);
        if (path === '/api/admin/activity' && method === 'GET') return apiAdminActivity(request, env);
        if (path === '/api/admin/wipe' && method === 'POST') return apiAdminWipe(request, env);
        if (path === '/api/admin/reservations' && method === 'GET') return apiAdminListReservations(request, env);
        if (path === '/api/admin/reservations' && method === 'POST') return apiAdminCreateReservation(request, env);
        if (path === '/api/admin/bundles' && method === 'GET') return apiAdminListBundles(request, env);
        if (path === '/api/admin/bundles' && method === 'POST') return apiAdminCreateBundle(request, env);
        {
          const mb = path.match(/^\/api\/admin\/bundles\/([^\/]+)(?:\/(delete|image))?$/);
          if (mb && method === 'POST') {
            const bid = decodeURIComponent(mb[1]);
            if (!mb[2]) return apiAdminUpdateBundle(request, env, bid);
            if (mb[2] === 'delete') return apiAdminDeleteBundle(request, env, bid);
            if (mb[2] === 'image') return apiAdminUploadBundleImage(request, env, bid);
          }
        }
        const m = path.match(/^\/api\/admin\/reservations\/([^\/]+)(?:\/(items|ready|collected|notify|cancel))?$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          const action = m[2];
          if (!action && method === 'GET') return apiAdminGetReservation(request, env, id);
          if (action === 'items' && method === 'POST') return apiAdminSetItems(request, env, id);
          if (action === 'ready' && method === 'POST') return apiAdminMarkReady(request, env, id);
          if (action === 'collected' && method === 'POST') return apiAdminMarkCollected(request, env, id);
          if (action === 'notify' && method === 'POST') return apiAdminNotify(request, env, id);
          if (action === 'cancel' && method === 'POST') return apiAdminCancel(request, env, id);
        }
      }

      // ─── Pages ────────────────────────────────────
      if (method === 'GET') {
        if (path === '/' || path === '/signin' || path === '/verify' || path === '/reserve' || path === '/orders') {
          const sUser = await getSessionUser(request, env);
          if (path === '/') return html(indexPage(env, sUser));
          if (path === '/signin') return sUser ? redirectTo('/reserve') : html(signinPage(env));
          if (path === '/verify') return sUser ? redirectTo('/reserve') : html(verifyPage(env));
          // /reserve and /orders require a signed-in, verified user.
          if (!sUser) return redirectTo('/signin');
          return html(path === '/reserve' ? reservePage(env, sUser) : ordersPage(env, sUser));
        }

        if (path === '/admin') {
          let sig = url.searchParams.get('sig') || '';
          if (!sig) {
            const cookie = request.headers.get('Cookie') || '';
            const cm = cookie.match(/(?:^|;\s*)admin_sig=([^\s;]+)/);
            if (cm) sig = cm[1];
          }
          if (sig && await verifyAdminSig(sig, env.ADMIN_SECRET)) {
            return new Response(adminPage(sig), {
              headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Set-Cookie': `admin_sig=${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`,
              },
            });
          }
          return html(loginPage('/admin'));
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      console.error('Worker error:', err);
      return json({ ok: false, reason: err.message || 'Internal error' }, 500);
    }
  },

  // Hourly cron: expire stale OTPs + purge photos past the retention window.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    (globalThis as any).__ctx = ctx;
    const tz = env.TIMEZONE;
    try {
      await purgeExpiredVerifications(env.DB, nowIso(tz));
    } catch (e) { console.error('OTP purge error:', e); }

    try {
      const days = parseInt((await getConfigValue(env.DB, 'PHOTO_RETENTION_DAYS')) || '90', 10) || 90;
      const cutoff = isoOffset(tz, -days * 86400000);
      const stale = await getPhotosToPurge(env.DB, cutoff);
      for (const p of stale) {
        try { await env.PHOTOS.delete(p.r2_key); } catch (e) { console.error('R2 delete error:', p.r2_key, e); }
        try { await deletePhotoRow(env.DB, p.id); } catch (e) { console.error('photo row delete error:', p.id, e); }
      }
      if (stale.length) console.log('Purged', stale.length, 'expired photos');
    } catch (e) { console.error('Photo purge cron error:', e); }
  },
};

function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { 'Location': location } });
}

function loginPage(redirect: string, error?: string): string {
  const errHtml = error ? '<div class="err">' + error + '</div>' : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Staff Login</title>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f6f7fb}
  .box{background:#fff;padding:32px;border-radius:16px;box-shadow:0 10px 30px rgba(17,24,39,.08);width:320px;text-align:center}
  h2{margin:0 0 6px;color:#111827}.sub{color:#6b7280;font-size:13px;margin:0 0 18px}
  input[type=password]{width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:12px;font-size:16px;box-sizing:border-box;margin-bottom:16px}
  button{width:100%;padding:12px;background:#f5b301;color:#111827;border:none;border-radius:999px;font-size:16px;font-weight:800;cursor:pointer}
  .err{color:#ef4444;font-size:14px;margin-bottom:12px}
</style></head><body>
<div class="box">
  <h2>Reserve &amp; Collect</h2>
  <p class="sub">Staff dashboard</p>
  ${errHtml}
  <form method="POST" action="/admin/login">
    <input type="hidden" name="redirect" value="${redirect}">
    <input type="password" name="password" placeholder="Staff password" autofocus>
    <button type="submit">Sign in</button>
  </form>
</div>
</body></html>`;
}
