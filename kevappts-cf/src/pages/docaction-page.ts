export function docActionPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Doctor Action</title>
  <style>
    :root{--bg:#f6f7fb;--card:#ffffff;--muted:#6b7280;--text:#111827;--line:#e5e7eb;--good:#10b981;--bad:#b00020;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:760px;margin:18px auto;padding:0 14px 30px 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:18px;}
    h1{margin:0 0 10px 0;font-size:18px;}
    p{margin:0 0 12px 0;color:var(--muted);line-height:1.45;font-size:13.5px;}
    .btn{border:none;border-radius:999px;padding:12px 16px;font-weight:800;cursor:pointer;background:#111827;color:#fff;}
    .btnDanger{background:var(--bad);}
    .btnGood{background:var(--good);color:#052e1a;}
    .msg{margin-top:12px;padding:12px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--text);font-size:13px;line-height:1.4;display:none;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1 id="title">Doctor action</h1>
      <p id="desc">This will apply the selected action and notify the client.</p>
      <button class="btn" id="actBtn">Confirm</button>
      <div class="msg" id="msg"></div>
    </div>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    const token = params.get('token') || '';
    const sig = params.get('sig') || '';
    const act = params.get('act') || '';

    const title = document.getElementById('title');
    const desc = document.getElementById('desc');
    const btn = document.getElementById('actBtn');
    const msg = document.getElementById('msg');

    function show(text){ msg.style.display = 'block'; msg.textContent = text; }

    if (act === 'cancel') {
      title.textContent = 'Cancel appointment (doctor)';
      desc.textContent = 'This will cancel the appointment, remove it from the calendar, and email the client.';
      btn.classList.add('btnDanger');
      btn.textContent = 'Confirm cancellation';
    } else if (act === 'redirect') {
      title.textContent = 'Redirect appointment to Spinola Clinic';
      desc.textContent = 'This will keep the appointment time but change the location to Spinola Clinic and email the client.';
      btn.classList.add('btnGood');
      btn.textContent = 'Confirm redirect';
    } else {
      title.textContent = 'Unknown action';
      desc.textContent = 'This link is not valid.';
      btn.disabled = true;
      btn.textContent = 'Disabled';
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Processing…';
      try {
        const res = await fetch('/api/doctor-action', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token, act, sig })
        });
        const data = await res.json();
        if (data.ok) { show(data.message || 'Done.'); btn.textContent = 'Completed'; }
        else { show(data.reason || 'Could not complete action.'); btn.disabled = false; btn.textContent = act === 'cancel' ? 'Confirm cancellation' : 'Confirm redirect'; }
      } catch(e) {
        show(e.message || String(e));
        btn.disabled = false;
        btn.textContent = act === 'cancel' ? 'Confirm cancellation' : 'Confirm redirect';
      }
    });
  </script>
</body>
</html>`;
}
