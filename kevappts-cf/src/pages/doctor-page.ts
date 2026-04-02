/**
 * Doctor schedule view — simplified daily schedule.
 */
export function doctorPage(sig: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Dr Kevin - Schedule</title>
  <style>
    :root{--bg:#f6f7fb;--card:#fff;--muted:#6b7280;--text:#111827;--accent:#f5b301;--line:#e5e7eb;--good:#10b981;--bad:#ef4444;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:16px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:800px;margin:0 auto;padding:12px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.95);padding:16px;margin-bottom:12px;}
    h2{margin:0 0 12px 0;font-size:18px;font-weight:900;}
    h3{margin:0 0 8px 0;font-size:14px;font-weight:800;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    th{text-align:left;padding:10px;border-bottom:2px solid var(--line);font-weight:800;font-size:11px;text-transform:uppercase;color:var(--muted);}
    td{padding:10px;border-bottom:1px solid var(--line);}
    .empty{text-align:center;padding:24px;color:var(--muted);font-size:14px;}
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge.booked{background:#dbeafe;color:#1d4ed8;}
    .badge.attended{background:#d1fae5;color:#065f46;}
    .badge.noshow{background:#fef3c7;color:#92400e;}
    .badge.relocated{background:#ede9fe;color:#5b21b6;}
    .sseStatus{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);}
    .sseDot{width:8px;height:8px;border-radius:50%;}
    .sseDot.connected{background:var(--good);}
    .sseDot.disconnected{background:var(--bad);}
    .statBar{display:flex;gap:16px;margin-bottom:12px;}
    .statItem{text-align:center;}
    .statItem .num{font-size:24px;font-weight:900;}
    .statItem .label{font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;}
  </style>
</head>
<body>
<div class="wrap">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <h2>Dr Kevin - Today's Schedule</h2>
    <div class="sseStatus"><div class="sseDot disconnected" id="sseDot"></div><span id="sseLabel">Connecting...</span></div>
  </div>

  <div class="card">
    <div class="statBar" id="stats"></div>
    <div id="dateLabel" style="font-weight:700;margin-bottom:10px;"></div>
    <div id="schedule"><div class="empty">Loading...</div></div>
  </div>

  <div class="card">
    <h3>Tomorrow</h3>
    <div id="tomorrow"><div class="empty">Loading...</div></div>
  </div>
</div>

<script>
const SIG = ${JSON.stringify(sig)};

// SSE
let evtSource = null;
function connectSSE() {
  evtSource = new EventSource('/api/stream');
  evtSource.onopen = () => {
    document.getElementById('sseDot').className = 'sseDot connected';
    document.getElementById('sseLabel').textContent = 'Live';
  };
  evtSource.onmessage = (e) => {
    try { const d = JSON.parse(e.data); if (d.type === 'slots_updated') loadSchedule(); } catch {}
  };
  evtSource.onerror = () => {
    document.getElementById('sseDot').className = 'sseDot disconnected';
    document.getElementById('sseLabel').textContent = 'Reconnecting...';
    evtSource.close();
    setTimeout(connectSSE, 3000);
  };
}
connectSSE();

function statusBadge(s) {
  const m = { BOOKED:'booked', ATTENDED:'attended', NO_SHOW:'noshow', RELOCATED_SPINOLA:'relocated' };
  return '<span class="badge ' + (m[s]||'') + '">' + s + '</span>';
}

function renderTable(containerId, appts) {
  if (!appts.length) { document.getElementById(containerId).innerHTML = '<div class="empty">No appointments</div>'; return; }
  let html = '<table><thead><tr><th>Time</th><th>Service</th><th>Patient</th><th>Phone</th><th>Location</th><th>Status</th></tr></thead><tbody>';
  for (const a of appts) {
    html += '<tr><td><b>' + a.start_time + '</b> - ' + a.end_time + '</td><td>' + a.service_name + '</td><td>' + a.full_name + '</td><td>' + a.phone + '</td><td>' + a.location + '</td><td>' + statusBadge(a.status) + '</td></tr>';
  }
  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}

async function loadSchedule() {
  try {
    const res = await fetch('/api/admin/dashboard?sig=' + encodeURIComponent(SIG));
    const data = await res.json();
    if (!data.ok) return;

    document.getElementById('dateLabel').textContent = 'Today: ' + data.todayKey;
    document.getElementById('stats').innerHTML =
      '<div class="statItem"><div class="num">' + data.todayAppointments.length + '</div><div class="label">Today</div></div>' +
      '<div class="statItem"><div class="num">' + data.tomorrowAppointments.length + '</div><div class="label">Tomorrow</div></div>' +
      '<div class="statItem"><div class="num">' + data.stats.weekBooked + '</div><div class="label">This Week</div></div>';

    renderTable('schedule', data.todayAppointments);
    renderTable('tomorrow', data.tomorrowAppointments);
  } catch(e) {
    document.getElementById('schedule').innerHTML = '<div class="empty">Error loading schedule</div>';
  }
}

loadSchedule();
</script>
</body>
</html>`;
}
