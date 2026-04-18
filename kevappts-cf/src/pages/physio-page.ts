import type { Env } from '../types';

export function physioPage(env: Env): string {
  const doctorName = env.LINDA_DOCTOR_NAME || 'Linda';
  const location = env.LINDA_LOCATION || "Potter's Clinic";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${doctorName} — Physiotherapist</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%2310b981'/%3E%3Ctext x='50' y='68' font-size='50' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'%3EP%3C/text%3E%3C/svg%3E">
<style>
  :root{--good:#10b981;--bad:#ef4444;--muted:#6b7280;--text:#111827;--line:#e5e7eb;--accent:#10b981;}
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:0;background:#f6f7fb;color:var(--text);line-height:1.5;}
  .wrap{max-width:860px;margin:0 auto;padding:20px 16px;}
  .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
  .title{margin:0;font-size:22px;font-weight:800;}
  .back{color:#2563eb;text-decoration:none;font-weight:700;font-size:14px;}
  .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
  .sectionTitle{font-weight:700;margin:0 0 10px 0;font-size:15px;}
  .label{color:var(--muted);font-size:13px;margin:0 0 4px 0;}
  .hours{color:var(--muted);font-size:13px;margin:4px 0 0 0;}
  select,input,textarea{width:100%;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:15px;font-family:inherit;background:#fff;}
  textarea{min-height:70px;resize:vertical;}
  .slotGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-top:8px;}
  .slot{padding:10px 8px;border:1px solid var(--line);border-radius:10px;background:#fff;font-size:14px;text-align:center;cursor:pointer;font-weight:600;}
  .slot:hover:not(.taken):not(.past){border-color:var(--accent);}
  .slot.selected{background:var(--accent);color:#fff;border-color:var(--accent);}
  .slot.taken,.slot.past{color:#9ca3af;background:#f9fafb;cursor:not-allowed;text-decoration:line-through;}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .fields>*+*{margin-top:10px;}
  .submit{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:999px;font-size:16px;font-weight:800;cursor:pointer;}
  .submit:disabled{background:#9ca3af;cursor:not-allowed;}
  .msg{margin-top:10px;padding:10px;border-radius:8px;font-size:14px;}
  .msg.ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;}
  .msg.err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;}
  .meta{color:var(--muted);font-size:13px;margin:0 0 6px 0;}
  @media (max-width:560px){.row{grid-template-columns:1fr;}}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <h1 class="title">${doctorName} — Physiotherapist</h1>
    <a class="back" href="/">&larr; Back to Pharmacy Bookings</a>
  </div>

  <div class="card">
    <p class="meta">Location: <b>${location}</b></p>
    <p class="meta">Available: <b>24 April – 7 May 2026</b> &middot; Mon–Fri 09:30–13:00 &amp; 16:00–18:30 &middot; 30-min sessions</p>
  </div>

  <div class="card">
    <p class="sectionTitle">Select a date</p>
    <select id="dateSelect"></select>
    <p id="dateHint" class="hours"></p>
  </div>

  <div class="card">
    <p class="sectionTitle">Select a time</p>
    <div id="slotGrid" class="slotGrid"></div>
    <p id="slotHint" class="hours" style="margin-top:10px;"></p>
  </div>

  <div class="card fields">
    <p class="sectionTitle">Your details</p>
    <div><p class="label">Full name</p><input id="fName" type="text" autocomplete="name" required></div>
    <div class="row">
      <div><p class="label">Email</p><input id="fEmail" type="email" autocomplete="email" required></div>
      <div><p class="label">Phone</p><input id="fPhone" type="tel" autocomplete="tel" required></div>
    </div>
    <div><p class="label">Comments (optional)</p><textarea id="fComments" placeholder="Anything the physiotherapist should know"></textarea></div>
    <button id="submitBtn" class="submit" disabled>Book physiotherapy appointment</button>
    <div id="resultMsg" class="msg" style="display:none;"></div>
  </div>
</div>

<script>
(function(){
  var state = { dateOptions: [], selectedDate: '', slots: [], selectedSlot: '' };

  function $(id){ return document.getElementById(id); }

  function renderDateOptions(opts){
    var sel = $('dateSelect');
    sel.innerHTML = '';
    opts.forEach(function(o){
      var el = document.createElement('option');
      el.value = o.dateKey;
      el.textContent = o.label + (o.disabled ? ' — ' + (o.reason || 'Closed') : '');
      el.disabled = !!o.disabled;
      sel.appendChild(el);
    });
    var first = opts.find(function(o){ return !o.disabled; });
    if (first) {
      sel.value = first.dateKey;
      state.selectedDate = first.dateKey;
    }
  }

  function renderSlots(slots, reason){
    var grid = $('slotGrid');
    grid.innerHTML = '';
    state.selectedSlot = '';
    updateSubmit();
    if (!slots || !slots.length) {
      $('slotHint').textContent = reason || 'No slots available for this date.';
      return;
    }
    $('slotHint').textContent = '';
    slots.forEach(function(s){
      var btn = document.createElement('div');
      btn.className = 'slot';
      btn.textContent = s.start;
      if (!s.available) {
        btn.classList.add('taken');
        btn.title = 'Not available';
      } else {
        btn.addEventListener('click', function(){
          var sel = grid.querySelector('.slot.selected');
          if (sel) sel.classList.remove('selected');
          btn.classList.add('selected');
          state.selectedSlot = s.start;
          updateSubmit();
        });
      }
      grid.appendChild(btn);
    });
  }

  function updateSubmit(){
    var ok = !!(state.selectedDate && state.selectedSlot && $('fName').value.trim() && $('fEmail').value.trim() && $('fPhone').value.trim());
    $('submitBtn').disabled = !ok;
  }

  function showMsg(text, kind){
    var el = $('resultMsg');
    el.style.display = 'block';
    el.className = 'msg ' + (kind === 'ok' ? 'ok' : 'err');
    el.textContent = text;
  }

  async function loadInit(){
    try {
      var res = await fetch('/api/physio-init');
      var data = await res.json();
      state.dateOptions = data.dateOptions || [];
      renderDateOptions(state.dateOptions);
      if (data.initialSlots && data.initialSlots.ok) {
        state.slots = data.initialSlots.slots;
        renderSlots(state.slots);
      } else if (data.initialSlots) {
        renderSlots([], data.initialSlots.reason);
      }
    } catch (e) {
      showMsg('Unable to load availability. Please refresh.', 'err');
    }
  }

  async function loadSlots(dateKey){
    renderSlots([], 'Loading…');
    try {
      var res = await fetch('/api/physio-availability?date=' + encodeURIComponent(dateKey));
      var data = await res.json();
      if (data.ok) {
        state.slots = data.slots || [];
        renderSlots(state.slots);
      } else {
        renderSlots([], data.reason || 'Closed');
      }
    } catch(e) {
      renderSlots([], 'Unable to load slots.');
    }
  }

  $('dateSelect').addEventListener('change', function(ev){
    state.selectedDate = ev.target.value;
    loadSlots(state.selectedDate);
  });

  ['fName','fEmail','fPhone'].forEach(function(id){ $(id).addEventListener('input', updateSubmit); });

  $('submitBtn').addEventListener('click', async function(){
    $('submitBtn').disabled = true;
    $('submitBtn').textContent = 'Booking…';
    try {
      var body = {
        dateKey: state.selectedDate,
        startTime: state.selectedSlot,
        serviceId: 'physio',
        fullName: $('fName').value.trim(),
        email: $('fEmail').value.trim(),
        phone: $('fPhone').value.trim(),
        comments: $('fComments').value.trim(),
      };
      var res = await fetch('/api/physio-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.ok) {
        showMsg('Booking confirmed for ' + data.dateKey + ' at ' + data.startTime + '. Redirecting…', 'ok');
        setTimeout(function(){ window.location.href = data.redirectUrl || '/'; }, 2500);
      } else {
        showMsg(data.reason || 'Booking failed.', 'err');
        $('submitBtn').disabled = false;
        $('submitBtn').textContent = 'Book physiotherapy appointment';
      }
    } catch(e) {
      showMsg('Network error. Please try again.', 'err');
      $('submitBtn').disabled = false;
      $('submitBtn').textContent = 'Book physiotherapy appointment';
    }
  });

  loadInit();
})();
</script>
</body>
</html>`;
}
