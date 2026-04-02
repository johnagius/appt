export function cancelPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Cancel Appointment</title>
  <style>
    :root{--bg:#f6f7fb;--card:#ffffff;--muted:#6b7280;--text:#111827;--line:#e5e7eb;--bad:#ef4444;--good:#10b981;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:720px;margin:18px auto;padding:0 14px 30px 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:18px;}
    h1{margin:0 0 10px 0;font-size:18px;font-weight:900;}
    p{margin:0 0 12px 0;color:var(--muted);font-size:13px;line-height:1.45;}
    .row{margin-top:10px;padding:12px;border-radius:14px;border:1px solid var(--line);background:#fff;font-size:13px;line-height:1.45;}
    .row b{color:var(--text);}
    .btnRow{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
    .btn{border:none;border-radius:999px;padding:10px 16px;font-weight:750;cursor:pointer;background:#111827;color:#fff;box-shadow:0 8px 18px rgba(0,0,0,0.12);}
    .btnDanger{background:var(--bad);}
    .btnGhost{background:transparent;color:var(--text);border:1px solid var(--line);box-shadow:none;}
    .msg{margin-top:12px;padding:12px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--text);font-size:13px;line-height:1.4;display:none;}
    .msg.good{border-color:rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);}
    .msg.bad{border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);}
    .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.55);display:none;align-items:center;justify-content:center;padding:14px;z-index:2000;}
    .loadingBox{width:min(520px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;gap:14px;align-items:center;}
    .spinner{width:34px;height:34px;border-radius:999px;border:4px solid #e5e7eb;border-top-color:#111827;animation:spin 0.9s linear infinite;flex:0 0 auto;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .loadingText h4{margin:0 0 4px 0;font-size:14px;}
    .loadingText div{margin:0;color:var(--muted);font-size:12.5px;line-height:1.35;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Cancel Appointment</h1>
      <p>This page will cancel the appointment linked to your confirmation email.</p>
      <div id="apptBox" class="row" style="display:none;"></div>
      <div class="btnRow">
        <button id="btnCancel" class="btn btnDanger">Cancel Appointment</button>
        <button id="btnClose" class="btn btnGhost">Close</button>
      </div>
      <div id="msg" class="msg"></div>
    </div>
  </div>
  <div class="overlay" id="loadingOverlay">
    <div class="loadingBox">
      <div class="spinner"></div>
      <div class="loadingText">
        <h4 id="loadingTitle">Loading…</h4>
        <div id="loadingDesc">Please wait.</div>
      </div>
    </div>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    const TOKEN = params.get('token') || '';
    const SIG = params.get('sig') || '';

    const apptBox = document.getElementById('apptBox');
    const msg = document.getElementById('msg');
    const btnCancel = document.getElementById('btnCancel');
    const btnClose = document.getElementById('btnClose');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingDesc = document.getElementById('loadingDesc');

    function showLoading(title, desc){
      loadingTitle.textContent = title || 'Loading…';
      loadingDesc.textContent = desc || 'Please wait.';
      loadingOverlay.style.display = 'flex';
    }
    function hideLoading(){ loadingOverlay.style.display = 'none'; }
    function showMsg(type, text){
      msg.style.display = 'block';
      msg.classList.remove('good','bad');
      if (type) msg.classList.add(type);
      msg.textContent = text;
    }
    function formatTime(hhmm){
      const [hh, mm] = hhmm.split(':').map(n => parseInt(n,10));
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const h = (hh % 12) === 0 ? 12 : (hh % 12);
      return h + ':' + String(mm).padStart(2,'0') + ' ' + ampm;
    }

    async function loadInfo(){
      showLoading('Loading appointment…', 'Please wait while we load your appointment details.');
      try {
        const res = await fetch('/api/cancel-info?token=' + encodeURIComponent(TOKEN) + '&sig=' + encodeURIComponent(SIG));
        const data = await res.json();
        hideLoading();
        if (!data.ok) { showMsg('bad', data.reason || 'Unable to load appointment.'); btnCancel.disabled = true; return; }
        const a = data.appointment;
        apptBox.style.display = 'block';
        apptBox.innerHTML =
          '<div><b>Service:</b> ' + a.serviceName + '</div>' +
          '<div><b>Date:</b> ' + a.dateKey + '</div>' +
          '<div><b>Time:</b> ' + formatTime(a.startTime) + ' - ' + formatTime(a.endTime) + '</div>' +
          '<div><b>Location:</b> ' + a.location + '</div>' +
          '<div style="margin-top:8px;color:#6b7280;"><b>Status:</b> ' + a.status + '</div>';
      } catch(e) {
        hideLoading();
        showMsg('bad', 'Error loading appointment: ' + e.message);
        btnCancel.disabled = true;
      }
    }

    btnCancel.addEventListener('click', async () => {
      btnCancel.disabled = true;
      showLoading('Cancelling…', 'Please wait while we cancel your appointment.');
      try {
        const res = await fetch('/api/cancel', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token: TOKEN, sig: SIG })
        });
        const data = await res.json();
        hideLoading();
        if (!data.ok) { showMsg('bad', data.reason || 'Could not cancel.'); btnCancel.disabled = false; return; }
        showMsg('good', data.alreadyCancelled ? 'This appointment was already cancelled.' : 'Appointment cancelled successfully.');
      } catch(e) {
        hideLoading();
        showMsg('bad', 'Cancel failed: ' + e.message);
        btnCancel.disabled = false;
      }
    });

    btnClose.addEventListener('click', () => { try { window.close(); } catch(e) {} window.location.href = 'about:blank'; });
    loadInfo();
  </script>
</body>
</html>`;
}
