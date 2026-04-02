/**
 * KevAppts — Cloudflare Worker Entry Point
 *
 * Routes:
 * Pages:  GET /  GET /cancel  GET /action  GET /admin  GET /doctor
 * Public: GET /api/init  GET /api/dates  GET /api/availability  GET /api/spinola
 *         POST /api/book  POST /api/book-spinola  GET /api/poll
 * Cancel: GET /api/cancel-info  POST /api/cancel  POST /api/doctor-action
 * Admin:  All /api/admin/* routes
 * WS:     GET /api/ws (WebSocket upgrade)
 * Cron:   Daily schedule email
 */
import type { Env } from './types';
import { RealtimeHub } from './realtime';
import { apiPoll, apiInit, apiGetDates, apiGetAvailability, apiGetSpinolaAvailability, apiBook, apiBookSpinola } from './api/public';
import { apiGetCancelInfo, apiCancelAppointment, apiDoctorAction } from './api/cancel';
import {
  apiAdminGetDashboard, apiAdminGetDateAppointments, apiAdminMarkDoctorOff,
  apiAdminAddExtraSlots, apiAdminRemoveDoctorOff, apiAdminRemoveExtraSlots,
  apiAdminProcessAppointments, apiAdminNotifyPatients, apiAdminGetReviewPatients,
  apiAdminSendReviewRequests, apiAdminGetWeekOverview, apiAdminSearchAppointments,
  apiAdminGetSettings, apiAdminSaveSettings, apiAdminGetStatistics,
  apiAdminMarkAttendance, apiAdminGetPatientHistory,
} from './api/admin';
import { verifyAdminSig, computeAdminSig } from './services/crypto';
import { todayKeyLocal } from './services/utils';
import { getActiveAppointmentsByDate } from './db/queries';
import { sendDailyDoctorSchedule } from './services/email';
import { indexPage } from './pages/index-page';
import { cancelPage } from './pages/cancel-page';
import { docActionPage } from './pages/docaction-page';
import { adminPage } from './pages/admin-page';
import { doctorPage } from './pages/doctor-page';

export { RealtimeHub };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Store ctx globally for waitUntil in API handlers
    (globalThis as any).__ctx = ctx;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // ─── WebSocket ────────────────────────────────
      if (path === '/api/ws') {
        const id = env.REALTIME.idFromName('global');
        const stub = env.REALTIME.get(id);
        return stub.fetch(new Request('http://internal/ws', {
          headers: request.headers,
        }));
      }

      // ─── Public API ────────────────────────────────
      if (path === '/api/poll' && method === 'GET') return apiPoll(env);
      if (path === '/api/init' && method === 'GET') return apiInit(env);
      if (path === '/api/dates' && method === 'GET') return apiGetDates(env);
      if (path === '/api/availability' && method === 'GET') return apiGetAvailability(request, env);
      if (path === '/api/spinola' && method === 'GET') return apiGetSpinolaAvailability(request, env);
      if (path === '/api/book' && method === 'POST') return apiBook(request, env);
      if (path === '/api/book-spinola' && method === 'POST') return apiBookSpinola(request, env);

      // ─── Cancel / Action API ───────────────────────
      if (path === '/api/cancel-info' && method === 'GET') return apiGetCancelInfo(request, env);
      if (path === '/api/cancel' && method === 'POST') return apiCancelAppointment(request, env);
      if (path === '/api/doctor-action' && method === 'POST') return apiDoctorAction(request, env);

      // ─── Admin Login ─────────────────────────────────
      if (path === '/admin/login' && method === 'POST') {
        const form = await request.formData();
        const password = (form.get('password') as string || '').trim();
        const redirect = (form.get('redirect') as string) || '/admin';
        const sig = await computeAdminSig(env.ADMIN_SECRET);
        // Compare password against ADMIN_SECRET
        if (password === env.ADMIN_PASSWORD || password === env.ADMIN_SECRET) {
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

      // ─── Admin API ─────────────────────────────────
      if (path.startsWith('/api/admin/')) {
        const adminPath = path.replace('/api/admin/', '');

        if (adminPath === 'dashboard' && method === 'GET') return apiAdminGetDashboard(request, env);
        if (adminPath === 'appointments' && method === 'GET') return apiAdminGetDateAppointments(request, env);
        if (adminPath === 'doctor-off' && method === 'POST') return apiAdminMarkDoctorOff(request, env);
        if (adminPath === 'extra-slots' && method === 'POST') return apiAdminAddExtraSlots(request, env);
        if (adminPath === 'process' && method === 'POST') return apiAdminProcessAppointments(request, env);
        if (adminPath === 'notify' && method === 'POST') return apiAdminNotifyPatients(request, env);
        if (adminPath === 'reviews' && method === 'GET') return apiAdminGetReviewPatients(request, env);
        if (adminPath === 'reviews/send' && method === 'POST') return apiAdminSendReviewRequests(request, env);
        if (adminPath === 'week-overview' && method === 'GET') return apiAdminGetWeekOverview(request, env);
        if (adminPath === 'search' && method === 'GET') return apiAdminSearchAppointments(request, env);
        if (adminPath === 'settings' && method === 'GET') return apiAdminGetSettings(request, env);
        if (adminPath === 'settings' && method === 'POST') return apiAdminSaveSettings(request, env);
        if (adminPath === 'stats' && method === 'GET') return apiAdminGetStatistics(request, env);
        if (adminPath === 'attendance' && method === 'POST') return apiAdminMarkAttendance(request, env);
        if (adminPath === 'patient-history' && method === 'GET') return apiAdminGetPatientHistory(request, env);

        // Delete routes with ID in path
        if (adminPath.startsWith('doctor-off/') && method === 'DELETE') {
          return apiAdminRemoveDoctorOff(request, env);
        }
        if (adminPath.startsWith('extra-slots/') && method === 'DELETE') {
          return apiAdminRemoveExtraSlots(request, env);
        }
      }

      // ─── HTML Pages ────────────────────────────────
      if (method === 'GET') {
        if (path === '/' || path === '/book') return html(indexPage(env));
        if (path === '/cancel') return html(cancelPage());
        if (path === '/action') return html(docActionPage());
        if (path === '/admin' || path === '/doctor') {
          // Check sig from query string or cookie
          let sig = url.searchParams.get('sig') || '';
          if (!sig) {
            const cookie = request.headers.get('Cookie') || '';
            const m = cookie.match(/(?:^|;\s*)admin_sig=([^\s;]+)/);
            if (m) sig = m[1];
          }
          if (sig && await verifyAdminSig(sig, env.ADMIN_SECRET)) {
            // Set cookie so future visits don't need ?sig=
            const headers: Record<string, string> = {
              'Content-Type': 'text/html;charset=UTF-8',
              'Set-Cookie': `admin_sig=${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`,
            };
            const page = path === '/admin' ? adminPage(sig) : doctorPage(sig);
            return new Response(page, { headers });
          }
          // No valid auth — show login form
          return html(loginPage(path));
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ ok: false, reason: err.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },

  // Cron trigger: daily doctor schedule email at 7am Malta time
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    (globalThis as any).__ctx = ctx;
    try {
      const todayKey = todayKeyLocal(env.TIMEZONE);
      const active = await getActiveAppointmentsByDate(env.DB, todayKey);
      await sendDailyDoctorSchedule(env, todayKey, active);
    } catch (e) {
      console.error('Cron error:', e);
    }
  },
};

function loginPage(redirect: string, error?: string): string {
  const errHtml = error ? '<div class="err">' + error + '</div>' : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login</title>
<style>
  body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
  .box{background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.1);width:320px;text-align:center}
  h2{margin:0 0 20px;color:#333}
  input[type=password]{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;margin-bottom:16px}
  button{width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer}
  button:hover{background:#1557b0}
  .err{color:#d32f2f;font-size:14px;margin-bottom:12px}
</style></head><body>
<div class="box">
  <h2>Admin Login</h2>
  ${errHtml}
  <form method="POST" action="/admin/login">
    <input type="hidden" name="redirect" value="${redirect}">
    <input type="password" name="password" placeholder="Enter admin password" autofocus>
    <button type="submit">Login</button>
  </form>
</div>
</body></html>`;
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
