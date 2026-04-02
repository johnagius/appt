/**
 * Admin dashboard page — serves the full admin HTML.
 * All API calls use fetch() with sig parameter.
 * Uses SSE for real-time updates instead of polling.
 */
export function adminPage(sig: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Admin - Dr Kevin Navarro Gera</title>
  <style>
    :root{--bg:#f6f7fb;--card:#fff;--muted:#6b7280;--text:#111827;--accent:#f5b301;--line:#e5e7eb;--good:#10b981;--bad:#ef4444;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:16px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:1200px;margin:0 auto;padding:12px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.95);padding:16px;margin-bottom:12px;}
    h2{margin:0 0 12px 0;font-size:16px;font-weight:900;}
    h3{margin:0 0 8px 0;font-size:14px;font-weight:800;}
    .tabs{display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;}
    .tab{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.15s;}
    .tab:hover{background:#f3f4f6;}
    .tab.active{background:#111827;color:#fff;border-color:#111827;}
    .tabContent{display:none;}
    .tabContent.active{display:block;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    th{text-align:left;padding:8px;border-bottom:2px solid var(--line);font-weight:800;font-size:11px;text-transform:uppercase;color:var(--muted);}
    td{padding:8px;border-bottom:1px solid var(--line);}
    .btn{border:none;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;font-size:12px;transition:all 0.15s;}
    .btnPrimary{background:#111827;color:#fff;}
    .btnPrimary:hover{background:#374151;}
    .btnDanger{background:var(--bad);color:#fff;}
    .btnGood{background:var(--good);color:#fff;}
    .btnGhost{background:transparent;color:var(--text);border:1px solid var(--line);}
    input,select,textarea{padding:8px 10px;border:1px solid var(--line);border-radius:10px;font-size:13px;width:100%;outline:none;}
    input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(245,179,1,0.18);}
    .formRow{margin-bottom:10px;}
    .formRow label{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:4px;}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
    @media(max-width:768px){.grid2,.grid3{grid-template-columns:1fr;}}
    .stat{text-align:center;padding:12px;}
    .statNum{font-size:28px;font-weight:900;}
    .statLabel{font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge.booked{background:#dbeafe;color:#1d4ed8;}
    .badge.cancelled{background:#fee2e2;color:#991b1b;}
    .badge.attended{background:#d1fae5;color:#065f46;}
    .badge.noshow{background:#fef3c7;color:#92400e;}
    .badge.relocated{background:#ede9fe;color:#5b21b6;}
    .msg{padding:10px;border-radius:12px;margin:8px 0;font-size:13px;}
    .msg.good{background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#065f46;}
    .msg.bad{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#991b1b;}
    .sseStatus{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);}
    .sseDot{width:8px;height:8px;border-radius:50%;}
    .sseDot.connected{background:var(--good);}
    .sseDot.disconnected{background:var(--bad);}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:1000;padding:16px;}
    .modal-overlay.open{display:flex;}
    .modal{background:#fff;border-radius:18px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;padding:20px;}
    .empty{text-align:center;padding:24px;color:var(--muted);font-size:13px;}
  </style>
</head>
<body>
<div class="wrap">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <h2 style="margin:0;">Admin Panel</h2>
    <div class="sseStatus"><div class="sseDot disconnected" id="sseDot"></div><span id="sseLabel">Connecting...</span></div>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="dashboard">Dashboard</div>
    <div class="tab" data-tab="manage">Manage</div>
    <div class="tab" data-tab="search">Search</div>
    <div class="tab" data-tab="reviews">Reviews</div>
    <div class="tab" data-tab="stats">Statistics</div>
    <div class="tab" data-tab="settings">Settings</div>
  </div>

  <div id="tab-dashboard" class="tabContent active">
    <div class="grid3" id="statsRow" style="margin-bottom:12px;"></div>
    <div class="card"><h3>Today's Appointments</h3><div id="todayTable"><div class="empty">Loading...</div></div></div>
    <div class="card"><h3>Tomorrow's Appointments</h3><div id="tomorrowTable"><div class="empty">Loading...</div></div></div>
    <div class="grid2">
      <div class="card"><h3>Doctor Off</h3><div id="offList"><div class="empty">Loading...</div></div></div>
      <div class="card"><h3>Extra Slots</h3><div id="extraList"><div class="empty">Loading...</div></div></div>
    </div>
  </div>

  <div id="tab-manage" class="tabContent">
    <div class="grid2">
      <div class="card">
        <h3>Mark Doctor Off</h3>
        <div class="formRow"><label>Start Date</label><input type="date" id="offStartDate"></div>
        <div class="formRow"><label>End Date (optional)</label><input type="date" id="offEndDate"></div>
        <div class="formRow"><label>Start Time (optional)</label><input type="time" id="offStartTime"></div>
        <div class="formRow"><label>End Time (optional)</label><input type="time" id="offEndTime"></div>
        <div class="formRow"><label>Reason</label><input type="text" id="offReason" value="Doctor not available"></div>
        <button class="btn btnDanger" onclick="markDoctorOff()">Mark Off</button>
        <div id="offMsg"></div>
      </div>
      <div class="card">
        <h3>Add Extra Slots</h3>
        <div class="formRow"><label>Date</label><input type="date" id="extraDate"></div>
        <div class="formRow"><label>End Date (optional, for range)</label><input type="date" id="extraEndDate"></div>
        <div class="formRow"><label>Start Time</label><input type="time" id="extraStartTime"></div>
        <div class="formRow"><label>End Time</label><input type="time" id="extraEndTime"></div>
        <div class="formRow"><label>Reason</label><input type="text" id="extraReason" value="Extra hours"></div>
        <button class="btn btnGood" onclick="addExtraSlots()">Add Slots</button>
        <div id="extraMsg"></div>
      </div>
    </div>
  </div>

  <div id="tab-search" class="tabContent">
    <div class="card">
      <h3>Search Appointments</h3>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <input type="text" id="searchQuery" placeholder="Name, phone, or email..." style="flex:1;">
        <button class="btn btnPrimary" onclick="doSearch()">Search</button>
      </div>
      <div id="searchResults"><div class="empty">Enter a search term</div></div>
    </div>
  </div>

  <div id="tab-reviews" class="tabContent">
    <div class="card">
      <h3>Send Review Requests</h3>
      <div id="reviewContent"><div class="empty">Loading...</div></div>
    </div>
  </div>

  <div id="tab-stats" class="tabContent">
    <div class="card">
      <h3>Statistics (28 days)</h3>
      <div id="statsContent"><div class="empty">Loading...</div></div>
    </div>
  </div>

  <div id="tab-settings" class="tabContent">
    <div class="card">
      <h3>Settings</h3>
      <div id="settingsContent"><div class="empty">Loading...</div></div>
    </div>
  </div>
</div>

<script>
const SIG = ${JSON.stringify(sig)};
const API = '/api/admin/';

// ─── WebSocket Connection ──────────────────────────────
let ws = null;
function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(proto + '//' + location.host + '/api/ws');
  ws.onopen = () => {
    document.getElementById('sseDot').className = 'sseDot connected';
    document.getElementById('sseLabel').textContent = 'Live';
    // Subscribe to admin channel — get ALL updates pushed
    ws.send(JSON.stringify({ subscribe: 'admin' }));
  };
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'slots_updated' || data.type === 'slots_data' || data.type === 'dashboard_data') {
        loadDashboard();
      }
    } catch {}
  };
  ws.onclose = () => {
    document.getElementById('sseDot').className = 'sseDot disconnected';
    document.getElementById('sseLabel').textContent = 'Reconnecting...';
    setTimeout(connectWS, 2000);
  };
  ws.onerror = () => { ws.close(); };
}
connectWS();
// Keepalive ping every 30s
setInterval(() => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({type:'ping'})); }, 30000);

// ─── Tab Navigation ────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabContent').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'stats') loadStats();
    if (tab.dataset.tab === 'settings') loadSettings();
    if (tab.dataset.tab === 'reviews') loadReviews();
  });
});

// ─── API Helper ────────────────────────────────────────
async function api(path, opts = {}) {
  const sep = path.includes('?') ? '&' : '?';
  const url = API + path + sep + 'sig=' + encodeURIComponent(SIG);
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  return res.json();
}

function statusBadge(status) {
  const map = { BOOKED: 'booked', CANCELLED_CLIENT: 'cancelled', CANCELLED_DOCTOR: 'cancelled', ATTENDED: 'attended', NO_SHOW: 'noshow', RELOCATED_SPINOLA: 'relocated' };
  return '<span class="badge ' + (map[status] || '') + '">' + status + '</span>';
}

function showMsg(id, type, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="msg ' + type + '">' + text + '</div>';
}

// ─── Dashboard ─────────────────────────────────────────
async function loadDashboard() {
  const data = await api('dashboard');
  if (!data.ok) return;

  document.getElementById('statsRow').innerHTML =
    '<div class="card stat"><div class="statNum">' + data.stats.weekBooked + '</div><div class="statLabel">This Week</div></div>' +
    '<div class="card stat"><div class="statNum">' + data.stats.weekCancelled + '</div><div class="statLabel">Cancelled</div></div>' +
    '<div class="card stat"><div class="statNum">' + data.stats.todayCapacity + '</div><div class="statLabel">Today Capacity</div></div>';

  renderApptTable('todayTable', data.todayAppointments, data.todayKey);
  renderApptTable('tomorrowTable', data.tomorrowAppointments, data.tomorrowKey);

  let offHtml = '';
  for (const r of data.doctorOffEntries) {
    offHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--line);">' +
      '<div><b>' + r.start_date + '</b>' + (r.end_date !== r.start_date ? ' to ' + r.end_date : '') +
      (r.start_time ? ' ' + r.start_time + '-' + r.end_time : ' (all day)') +
      '<br><span style="color:var(--muted);font-size:12px;">' + (r.reason || '') + '</span></div>' +
      '<button class="btn btnGhost" onclick="removeOff(' + r.id + ')">Remove</button></div>';
  }
  document.getElementById('offList').innerHTML = offHtml || '<div class="empty">No doctor-off entries</div>';

  let extraHtml = '';
  for (const r of data.extraSlotEntries) {
    extraHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--line);">' +
      '<div><b>' + r.date_key + '</b> ' + r.start_time + '-' + r.end_time +
      '<br><span style="color:var(--muted);font-size:12px;">' + (r.reason || '') + '</span></div>' +
      '<button class="btn btnGhost" onclick="removeExtra(' + r.id + ')">Remove</button></div>';
  }
  document.getElementById('extraList').innerHTML = extraHtml || '<div class="empty">No extra slots</div>';
}

function renderApptTable(containerId, appts, dateKey) {
  if (!appts.length) {
    document.getElementById(containerId).innerHTML = '<div class="empty">No appointments</div>';
    return;
  }
  let html = '<table><thead><tr><th>Time</th><th>Patient</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
  for (const a of appts) {
    html += '<tr><td>' + a.start_time + '-' + a.end_time + '</td><td>' + a.full_name + '</td><td>' + a.phone + '</td>' +
      '<td>' + statusBadge(a.status) + '</td><td>' +
      (a.status === 'BOOKED' ? '<button class="btn btnGhost" style="font-size:11px;padding:4px 8px;" onclick="markAttendance(\\'' + a.id + '\\',\\'' + dateKey + '\\',true)">Attended</button> ' +
      '<button class="btn btnGhost" style="font-size:11px;padding:4px 8px;" onclick="markAttendance(\\'' + a.id + '\\',\\'' + dateKey + '\\',false)">No-show</button>' : '') +
      '</td></tr>';
  }
  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}

async function markAttendance(id, dk, attended) {
  await api('attendance', { method: 'POST', body: JSON.stringify({ appointmentId: id, dateKey: dk, attended }) });
  loadDashboard();
}

async function removeOff(id) {
  await api('doctor-off/' + id, { method: 'DELETE' });
  loadDashboard();
}

async function removeExtra(id) {
  await api('extra-slots/' + id, { method: 'DELETE' });
  loadDashboard();
}

// ─── Manage ────────────────────────────────────────────
async function markDoctorOff() {
  const data = await api('doctor-off', { method: 'POST', body: JSON.stringify({
    startDate: document.getElementById('offStartDate').value,
    endDate: document.getElementById('offEndDate').value,
    startTime: document.getElementById('offStartTime').value,
    endTime: document.getElementById('offEndTime').value,
    reason: document.getElementById('offReason').value,
  })});
  showMsg('offMsg', data.ok ? 'good' : 'bad', data.message || data.reason);
  if (data.ok) loadDashboard();
}

async function addExtraSlots() {
  const data = await api('extra-slots', { method: 'POST', body: JSON.stringify({
    date: document.getElementById('extraDate').value,
    endDate: document.getElementById('extraEndDate').value,
    startTime: document.getElementById('extraStartTime').value,
    endTime: document.getElementById('extraEndTime').value,
    reason: document.getElementById('extraReason').value,
  })});
  showMsg('extraMsg', data.ok ? 'good' : 'bad', data.message || data.reason);
  if (data.ok) loadDashboard();
}

// ─── Search ────────────────────────────────────────────
async function doSearch() {
  const q = document.getElementById('searchQuery').value.trim();
  if (!q) return;
  const data = await api('search?q=' + encodeURIComponent(q));
  if (!data.ok) { document.getElementById('searchResults').innerHTML = '<div class="msg bad">' + data.reason + '</div>'; return; }
  if (!data.results.length) { document.getElementById('searchResults').innerHTML = '<div class="empty">No results</div>'; return; }

  let html = '<table><thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead><tbody>';
  for (const a of data.results) {
    html += '<tr><td>' + a.date_key + '</td><td>' + a.start_time + '</td><td>' + a.full_name + '</td><td>' + a.email + '</td><td>' + a.phone + '</td><td>' + statusBadge(a.status) + '</td></tr>';
  }
  html += '</tbody></table>';
  document.getElementById('searchResults').innerHTML = html;
}
document.getElementById('searchQuery').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

// ─── Reviews ───────────────────────────────────────────
async function loadReviews() {
  const data = await api('reviews');
  if (!data.ok) return;
  let html = '<h4>Potter\\'s Patients</h4>';
  if (!data.potters.length) html += '<div class="empty">No patients today</div>';
  else {
    html += '<div>';
    for (const p of data.potters) {
      html += '<div style="padding:6px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;">' +
        '<span>' + p.fullName + ' (' + p.startTime + ') ' + (p.reviewSent ? '<span style="color:var(--good);font-size:11px;">Sent</span>' : '') + '</span>' +
        '</div>';
    }
    html += '</div>';
  }
  document.getElementById('reviewContent').innerHTML = html;
}

// ─── Stats ─────────────────────────────────────────────
async function loadStats() {
  const data = await api('stats');
  if (!data.ok) return;
  const s = data.stats;
  let html = '<div class="grid3" style="margin-bottom:12px;">' +
    '<div class="stat"><div class="statNum">' + s.total + '</div><div class="statLabel">Total</div></div>' +
    '<div class="stat"><div class="statNum">' + s.cancelled + '</div><div class="statLabel">Cancelled</div></div>' +
    '<div class="stat"><div class="statNum">' + s.cancelRate + '%</div><div class="statLabel">Cancel Rate</div></div>' +
    '<div class="stat"><div class="statNum">' + s.attended + '</div><div class="statLabel">Attended</div></div>' +
    '<div class="stat"><div class="statNum">' + s.noShow + '</div><div class="statLabel">No Show</div></div>' +
    '<div class="stat"><div class="statNum">' + s.avgLeadTimeDays + 'd</div><div class="statLabel">Avg Lead Time</div></div>' +
    '</div>';
  html += '<div class="grid2"><div><h4>Location Split</h4><p>Potter\\'s: ' + s.pottersCount + ' | Spinola: ' + s.spinolaCount + '</p></div>';
  html += '<div><h4>Top Patients</h4>';
  for (const p of (s.topPatients || []).slice(0, 5)) html += '<div style="font-size:13px;">' + p.name + ': ' + p.count + ' visits</div>';
  html += '</div></div>';
  document.getElementById('statsContent').innerHTML = html;
}

// ─── Settings ──────────────────────────────────────────
async function loadSettings() {
  const data = await api('settings');
  if (!data.ok) return;
  const s = data.settings;
  let html = '<div class="grid2">' +
    '<div class="formRow"><label>Appointment Duration (min)</label><input type="number" id="setDuration" value="' + s.apptDurationMin + '"></div>' +
    '<div class="formRow"><label>Advance Days</label><input type="number" id="setAdvDays" value="' + s.advanceDays + '"></div>' +
    '<div class="formRow"><label>Max Active Per Person (0=unlimited)</label><input type="number" id="setMaxActive" value="' + s.maxActiveApptsPerPerson + '"></div>' +
    '<div class="formRow"><label>Potter\\'s Location</label><input type="text" id="setPottersLoc" value="' + s.pottersLocation + '"></div>' +
    '<div class="formRow"><label>Spinola Location</label><input type="text" id="setSpinolaLoc" value="' + s.spinolaLocation + '"></div>' +
    '</div>' +
    '<button class="btn btnPrimary" onclick="saveSettings()" style="margin-top:10px;">Save Settings</button>' +
    '<div id="settingsMsg"></div>';
  document.getElementById('settingsContent').innerHTML = html;
}

async function saveSettings() {
  const data = await api('settings', { method: 'POST', body: JSON.stringify({
    apptDurationMin: parseInt(document.getElementById('setDuration').value),
    advanceDays: parseInt(document.getElementById('setAdvDays').value),
    maxActiveApptsPerPerson: parseInt(document.getElementById('setMaxActive').value),
    pottersLocation: document.getElementById('setPottersLoc').value,
    spinolaLocation: document.getElementById('setSpinolaLoc').value,
  })});
  showMsg('settingsMsg', data.ok ? 'good' : 'bad', data.message || data.reason);
}

// ─── Init ──────────────────────────────────────────────
loadDashboard();
</script>
</body>
</html>`;
}
