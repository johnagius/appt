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
  apiAdminMarkAttendance, apiAdminGetPatientHistory, apiAdminDoctorOffDates,
  apiAdminCreateTestBooking, apiAdminPurgeTestData,
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
      // ─── PWA Manifest & Service Worker ────────────
      if (path === '/manifest.json') {
        return new Response(JSON.stringify({
          name: "Potter's Pharmacy - Book Appointment",
          short_name: "Potter's",
          start_url: "/",
          display: "standalone",
          background_color: "#f6f7fb",
          theme_color: "#f5b301",
          icons: [
            { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23f5b301'/%3E%3Ctext x='50' y='68' font-size='50' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'%3EMD%3C/text%3E%3C/svg%3E", sizes: "512x512", type: "image/svg+xml" }
          ]
        }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
        });
      }

      if (path === '/sw.js') {
        return new Response(
          "self.addEventListener('fetch', function() {});",
          { headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache' } }
        );
      }

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
        if (adminPath === 'doctor-off-dates' && method === 'POST') return apiAdminDoctorOffDates(request, env);
        if (adminPath === 'test-booking' && method === 'POST') return apiAdminCreateTestBooking(request, env);
        if (adminPath === 'purge-test-data' && method === 'POST') return apiAdminPurgeTestData(request, env);

        // Test broadcast — manually trigger a WebSocket notification
        if (adminPath === 'test-broadcast' && method === 'POST') {
          const tSig = new URL(request.url).searchParams.get('sig') || '';
          if (!tSig || !await verifyAdminSig(tSig, env.ADMIN_SECRET)) {
            return new Response(JSON.stringify({ ok: false, reason: 'Access denied' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
          }
          try {
            const doId = env.REALTIME.idFromName('global');
            const stub = env.REALTIME.get(doId);
            const res = await stub.fetch('http://internal/broadcast', {
              method: 'POST',
              body: JSON.stringify({ type: 'slots_updated', dateKey: '2026-04-02' }),
            });
            const result = await res.json();
            return new Response(JSON.stringify({ ok: true, broadcast: result }), {
              headers: { 'Content-Type': 'application/json' },
            });
          } catch (e: any) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

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
        if (path === '/admin' || path === '/doctor' || path === '/test') {
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
            const page = path === '/admin' ? adminPage(sig) : path === '/doctor' ? doctorPage(sig) : testPage(sig);
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

function testPage(sig: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Panel</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;background:#f5f5f5}
  h1{margin:0 0 6px;font-size:24px}
  .sub{color:#666;margin-bottom:20px;font-size:14px}
  .card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:16px}
  h2{margin:0 0 12px;font-size:18px}
  label{display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#333}
  input,select{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:12px}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .btn{padding:12px 20px;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;width:100%}
  .btn-book{background:#10b981;color:#fff}
  .btn-book:hover{background:#059669}
  .btn-purge{background:#ef4444;color:#fff}
  .btn-purge:hover{background:#dc2626}
  .btn-quick{background:#2563eb;color:#fff;margin-bottom:8px}
  .btn-quick:hover{background:#1d4ed8}
  .log{background:#1e1e1e;color:#0f0;padding:14px;border-radius:8px;font-family:monospace;font-size:12px;max-height:300px;overflow:auto;white-space:pre-wrap;min-height:60px}
  .links{display:flex;gap:10px;margin-bottom:20px}
  .links a{color:#2563eb;font-weight:600;text-decoration:none;font-size:14px}
  .links a:hover{text-decoration:underline}
</style>
</head><body>
<h1>Test Panel</h1>
<p class="sub">Create test bookings and purge them when done. Test IDs start with TEST- so real data is never touched.</p>
<div class="links">
  <a href="/admin">Admin Panel</a>
  <a href="/doctor">Doctor Page</a>
  <a href="/">Booking Page</a>
</div>

<div class="card">
  <h2>Quick Create</h2>
  <button class="btn btn-quick" onclick="quickBook('potters')">Book Potter's (next slot today)</button>
  <button class="btn btn-quick" onclick="quickBook('spinola')">Book Spinola (next slot today)</button>
  <button class="btn btn-quick" onclick="quickBookTomorrow()">Book Tomorrow 10:00</button>
</div>

<div class="card">
  <h2>Custom Test Booking</h2>
  <div class="row">
    <div><label>Date</label><input type="date" id="tDate"></div>
    <div><label>Time</label><input type="time" id="tTime" value="10:00"></div>
  </div>
  <div class="row">
    <div><label>Clinic</label><select id="tClinic"><option value="potters">Potter's</option><option value="spinola">Spinola</option></select></div>
    <div><label>Patient Name</label><input type="text" id="tName" placeholder="Auto-generated if empty"></div>
  </div>
  <button class="btn btn-book" onclick="createBooking()">Create Test Booking</button>
</div>

<div class="card">
  <h2>Purge Test Data</h2>
  <p style="font-size:13px;color:#666;margin-bottom:12px">Deletes ALL appointments with TEST- prefix. Real bookings are never affected.</p>
  <button class="btn btn-purge" onclick="purgeAll()">Purge All Test Bookings</button>
  <button class="btn btn-quick" onclick="testBroadcast()" style="margin-top:8px;background:#f59e0b">Test WebSocket Broadcast</button>
</div>

<div class="card">
  <h2>Log</h2>
  <div class="log" id="log">Ready.\\n</div>
</div>

<script>
var SIG = ${JSON.stringify(sig)};
var today = new Date().toISOString().split('T')[0];
document.getElementById('tDate').value = today;

function log(msg) {
  var el = document.getElementById('log');
  el.textContent += new Date().toLocaleTimeString() + ' ' + msg + '\\n';
  el.scrollTop = el.scrollHeight;
}

async function api(endpoint, body) {
  var sep = endpoint.includes('?') ? '&' : '?';
  var res = await fetch('/api/admin/' + endpoint + sep + 'sig=' + encodeURIComponent(SIG), {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return res.json();
}

async function createBooking() {
  var dateKey = document.getElementById('tDate').value;
  var startTime = document.getElementById('tTime').value;
  var clinic = document.getElementById('tClinic').value;
  var name = document.getElementById('tName').value;
  log('Creating ' + clinic + ' booking for ' + dateKey + ' ' + startTime + '...');
  try {
    var res = await api('test-booking', { dateKey: dateKey, startTime: startTime, clinic: clinic, name: name || undefined });
    if (res.ok) log('OK: ' + res.message);
    else log('ERROR: ' + (res.reason || 'Unknown error'));
  } catch(e) { log('FAILED: ' + e.message); }
}

async function quickBook(clinic) {
  var hours = new Date().getHours();
  var mins = new Date().getMinutes();
  mins = Math.ceil(mins / 10) * 10;
  if (mins >= 60) { hours++; mins = 0; }
  var time = String(hours).padStart(2,'0') + ':' + String(mins).padStart(2,'0');
  log('Quick booking ' + clinic + ' at ' + time + '...');
  try {
    var res = await api('test-booking', { dateKey: today, startTime: time, clinic: clinic });
    if (res.ok) log('OK: ' + res.message);
    else log('ERROR: ' + (res.reason || 'Unknown error'));
  } catch(e) { log('FAILED: ' + e.message); }
}

async function quickBookTomorrow() {
  var d = new Date(); d.setDate(d.getDate() + 1);
  var tmrw = d.toISOString().split('T')[0];
  log('Booking tomorrow ' + tmrw + ' at 10:00...');
  try {
    var res = await api('test-booking', { dateKey: tmrw, startTime: '10:00', clinic: 'potters' });
    if (res.ok) log('OK: ' + res.message);
    else log('ERROR: ' + (res.reason || 'Unknown error'));
  } catch(e) { log('FAILED: ' + e.message); }
}

async function purgeAll() {
  if (!confirm('Delete ALL test bookings?')) return;
  log('Purging all test data...');
  try {
    var res = await api('purge-test-data', {});
    if (res.ok) log('OK: ' + res.deleted + ' test records deleted.');
    else log('ERROR: ' + (res.reason || 'Unknown error'));
  } catch(e) { log('FAILED: ' + e.message); }
}

async function testBroadcast() {
  log('Sending test broadcast...');
  try {
    var res = await api('test-broadcast', {});
    log('Broadcast result: ' + JSON.stringify(res));
    log('If admin page is open, it should have received a [WS] message and pinged.');
  } catch(e) { log('FAILED: ' + e.message); }
}
</script>
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
