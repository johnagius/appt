export function reschedulePage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Reschedule Appointment</title>
  <style>
    :root{--bg:#f6f7fb;--card:#ffffff;--muted:#6b7280;--text:#111827;--accent:#f5b301;--line:#e5e7eb;--bad:#ef4444;--good:#10b981;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);font-size:14.5px;}
    .wrap{max-width:720px;margin:18px auto;padding:0 14px 30px 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:18px;margin-bottom:14px;}
    h1{margin:0 0 6px 0;font-size:18px;font-weight:900;}
    h2{margin:16px 0 8px 0;font-size:15px;font-weight:800;}
    p{margin:0 0 12px 0;color:var(--muted);font-size:14px;line-height:1.45;}
    .current{padding:12px;border-radius:14px;border:1px solid var(--line);background:#fff;font-size:14px;line-height:1.5;}
    .current b{color:var(--text);}
    .current .label{color:var(--muted);}
    select{width:100%;padding:10px 12px;border-radius:12px;border:1px solid var(--line);font-size:14px;background:#fff;color:var(--text);appearance:auto;margin-bottom:12px;}
    .time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0;}
    @media(min-width:520px){.time-grid{grid-template-columns:repeat(6,1fr);}}
    .slot-btn{padding:10px 4px;border-radius:12px;border:1.5px solid var(--line);background:#fff;font-size:14px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;}
    .slot-btn:hover:not(:disabled){border-color:var(--accent);background:#fffbeb;}
    .slot-btn.selected{border-color:var(--accent);background:#fef3c7;box-shadow:0 2px 8px rgba(245,179,1,0.2);}
    .slot-btn:disabled{opacity:0.35;cursor:not-allowed;}
    .btnRow{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
    .btn{border:none;border-radius:999px;padding:12px 20px;font-weight:750;cursor:pointer;font-size:14.5px;transition:transform 0.12s,opacity 0.12s;}
    .btn:active{transform:scale(0.97);}
    .btn:disabled{opacity:0.45;cursor:not-allowed;transform:none;}
    .btnAccent{background:var(--accent);color:#fff;box-shadow:0 8px 18px rgba(245,179,1,0.25);}
    .btnGhost{background:transparent;color:var(--text);border:1px solid var(--line);box-shadow:none;}
    .msg{margin-top:12px;padding:12px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--text);font-size:14px;line-height:1.4;display:none;}
    .msg.good{border-color:rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);}
    .msg.bad{border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);}
    .empty{text-align:center;padding:20px 0;color:var(--muted);font-size:14px;}
    .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.55);display:none;align-items:center;justify-content:center;padding:14px;z-index:2000;}
    .loadingBox{width:min(520px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;gap:14px;align-items:center;}
    .spinner{width:34px;height:34px;border-radius:999px;border:4px solid #e5e7eb;border-top-color:#111827;animation:spin 0.9s linear infinite;flex:0 0 auto;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .loadingText h4{margin:0 0 4px 0;font-size:14px;}
    .loadingText div{margin:0;color:var(--muted);font-size:13px;line-height:1.35;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Reschedule Appointment</h1>
      <p>Choose a new date and time. Your current appointment will be updated automatically.</p>

      <h2>Current Appointment</h2>
      <div id="currentAppt" class="current" style="display:none;"></div>

      <h2>Choose New Date</h2>
      <select id="dateSelect" onchange="loadSlots()">
        <option value="">Loading dates...</option>
      </select>

      <h2>Choose New Time</h2>
      <div id="timeGrid" class="time-grid">
        <div class="empty">Select a date above.</div>
      </div>

      <div class="btnRow">
        <button id="btnReschedule" class="btn btnAccent" disabled onclick="doReschedule()">Reschedule</button>
        <button class="btn btnGhost" onclick="try{window.close()}catch(e){} window.location.href='about:blank';">Close</button>
      </div>
      <div id="msg" class="msg"></div>
    </div>
  </div>
  <div class="overlay" id="loadingOverlay">
    <div class="loadingBox">
      <div class="spinner"></div>
      <div class="loadingText">
        <h4 id="loadingTitle">Loading\u2026</h4>
        <div id="loadingDesc">Please wait.</div>
      </div>
    </div>
  </div>
  <script>
    var params = new URLSearchParams(location.search);
    var TOKEN = params.get('token') || '';
    var SIG = params.get('sig') || '';
    var _selectedSlot = null;
    var _currentAppt = null;

    var msg = document.getElementById('msg');
    var loadingOverlay = document.getElementById('loadingOverlay');
    var dateSelect = document.getElementById('dateSelect');
    var timeGrid = document.getElementById('timeGrid');
    var btnReschedule = document.getElementById('btnReschedule');

    function showLoading(t, d){
      document.getElementById('loadingTitle').textContent = t || 'Loading\u2026';
      document.getElementById('loadingDesc').textContent = d || 'Please wait.';
      loadingOverlay.style.display = 'flex';
    }
    function hideLoading(){ loadingOverlay.style.display = 'none'; }
    function showMsg(type, text){
      msg.style.display = 'block';
      msg.classList.remove('good','bad');
      if (type) msg.classList.add(type);
      msg.textContent = text;
    }
    function fmt(hhmm){
      var p = hhmm.split(':').map(function(n){return parseInt(n,10);});
      var ampm = p[0] >= 12 ? 'PM' : 'AM';
      var h = (p[0] % 12) === 0 ? 12 : (p[0] % 12);
      return h + ':' + String(p[1]).padStart(2,'0') + ' ' + ampm;
    }
    function fmtDate(dk){
      var d = new Date(dk + 'T12:00:00');
      return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    }

    async function init(){
      showLoading('Loading appointment\u2026', 'Please wait while we load your details.');
      try {
        var res = await fetch('/api/reschedule-info?token=' + encodeURIComponent(TOKEN) + '&sig=' + encodeURIComponent(SIG));
        var data = await res.json();
        if (!data.ok) { hideLoading(); showMsg('bad', data.reason || 'Unable to load appointment.'); btnReschedule.disabled = true; return; }
        _currentAppt = data.appointment;
        var el = document.getElementById('currentAppt');
        el.style.display = 'block';
        el.innerHTML =
          '<div><span class="label">Service:</span> <b>' + _currentAppt.serviceName + '</b></div>' +
          '<div><span class="label">Date:</span> <b>' + fmtDate(_currentAppt.dateKey) + '</b></div>' +
          '<div><span class="label">Time:</span> <b>' + fmt(_currentAppt.startTime) + ' - ' + fmt(_currentAppt.endTime) + '</b></div>' +
          '<div><span class="label">Location:</span> <b>' + _currentAppt.location + '</b></div>';

        // Load slots for today by default
        var slotsRes = await fetch('/api/reschedule-slots?token=' + encodeURIComponent(TOKEN) + '&sig=' + encodeURIComponent(SIG));
        var slotsData = await slotsRes.json();
        hideLoading();
        if (slotsData.ok) {
          renderDates(slotsData.dates);
          dateSelect.value = slotsData.dateKey;
          loadSlots();
        }
      } catch(e) {
        hideLoading();
        showMsg('bad', 'Error: ' + e.message);
        btnReschedule.disabled = true;
      }
    }

    function renderDates(dates){
      dateSelect.innerHTML = '';
      for (var i = 0; i < dates.length; i++) {
        var opt = document.createElement('option');
        opt.value = dates[i].dateKey;
        opt.textContent = fmtDate(dates[i].dateKey);
        if (dates[i].disabled) { opt.disabled = true; opt.textContent += ' (Closed)'; }
        dateSelect.appendChild(opt);
      }
    }

    async function loadSlots(){
      _selectedSlot = null;
      btnReschedule.disabled = true;
      var dk = dateSelect.value;
      if (!dk) return;
      timeGrid.innerHTML = '<div class="empty"><div class="spinner" style="margin:0 auto 10px;width:28px;height:28px;"></div>Loading slots\u2026</div>';
      try {
        var res = await fetch('/api/reschedule-slots?token=' + encodeURIComponent(TOKEN) + '&sig=' + encodeURIComponent(SIG) + '&date=' + encodeURIComponent(dk));
        var data = await res.json();
        if (!data.ok) { timeGrid.innerHTML = '<div class="empty">Unable to load slots.</div>'; return; }
        var slots = data.slots || [];
        var available = slots.filter(function(s){return s.available;});
        if (!available.length) { timeGrid.innerHTML = '<div class="empty">No available slots on this date.</div>'; return; }
        var html = '';
        for (var i = 0; i < slots.length; i++) {
          var s = slots[i];
          if (!s.available) continue;
          html += '<button class="slot-btn" data-start="' + s.start + '" data-end="' + s.end + '" onclick="selectSlot(this)">' + fmt(s.start) + '</button>';
        }
        timeGrid.innerHTML = html;
      } catch(e) {
        timeGrid.innerHTML = '<div class="empty">Error loading slots.</div>';
      }
    }

    function selectSlot(btn){
      var all = timeGrid.querySelectorAll('.slot-btn');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
      btn.classList.add('selected');
      _selectedSlot = { start: btn.dataset.start, end: btn.dataset.end };
      btnReschedule.disabled = false;
    }

    async function doReschedule(){
      if (!_selectedSlot) return;
      var dk = dateSelect.value;
      btnReschedule.disabled = true;
      showLoading('Rescheduling\u2026', 'Updating your appointment.');
      try {
        var res = await fetch('/api/reschedule', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token: TOKEN, sig: SIG, dateKey: dk, startTime: _selectedSlot.start })
        });
        var data = await res.json();
        hideLoading();
        if (!data.ok) { showMsg('bad', data.reason || 'Could not reschedule.'); btnReschedule.disabled = false; return; }
        showMsg('good', 'Appointment rescheduled to ' + fmtDate(data.dateKey) + ' at ' + fmt(data.startTime) + '. A new confirmation email has been sent.');
        // Update the current appointment display
        document.getElementById('currentAppt').innerHTML =
          '<div><span class="label">Service:</span> <b>' + data.serviceName + '</b></div>' +
          '<div><span class="label">Date:</span> <b>' + fmtDate(data.dateKey) + '</b></div>' +
          '<div><span class="label">Time:</span> <b>' + fmt(data.startTime) + ' - ' + fmt(data.endTime) + '</b></div>' +
          '<div><span class="label">Location:</span> <b>' + data.location + '</b></div>';
        btnReschedule.disabled = true;
        timeGrid.innerHTML = '<div class="empty" style="color:var(--good);font-weight:700;">Done! Check your email for confirmation.</div>';
      } catch(e) {
        hideLoading();
        showMsg('bad', 'Error: ' + e.message);
        btnReschedule.disabled = false;
      }
    }

    init();
  </script>
</body>
</html>`;
}
