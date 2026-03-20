// Auto-generated bundle - do not edit directly
// Built by build.py from src/*.gs + src/*.html
//
// _BUNDLE  = object with all public function references
// _HTML_TEMPLATES = object with HTML content keyed by name

var _HTML_TEMPLATES = {
    Index: `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Booking</title>

  <style>
    :root{
      --bg:#f6f7fb;
      --card:#ffffff;
      --muted:#6b7280;
      --text:#111827;
      --accent:#f5b301;
      --line:#e5e7eb;
      --good:#10b981;
      --bad:#ef4444;
      --shadow: 0 10px 30px rgba(17,24,39,0.08);
      --radius: 16px;
    }
    *{box-sizing:border-box;}
    html,body{height:100%;}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
      background: var(--bg);
      color: var(--text);
    }

    /* Attempt hide Apps Script banner if it's inside same DOM */
    #warning,
    .warning-bar.warning-banner-bar,
    .warning-banner-bar,
    .warning-banner{
      display:none !important;
      height:0 !important;
      margin:0 !important;
      padding:0 !important;
      border:0 !important;
    }

    .wrap{
      width:100%;
      max-width:none;
      margin:0;
      padding:12px 12px 18px 12px;
    }

    .card{
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid rgba(229,231,235,0.95);
    }

    /* Header bar */
    .headerBox{
      border-radius: var(--radius);
      border:1px solid var(--line);
      background:#f3f4f6;
      padding:10px 12px;
      display:flex;
      gap:10px;
      align-items:center;
      justify-content:space-between;
      margin-bottom:10px;
    }
    .headerLeft{
      display:flex;
      gap:10px;
      align-items:center;
      min-width:0;
    }
    .headerLogo{
      width:42px;
      height:42px;
      border-radius:14px;
      background:#eff6ff;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#1d4ed8;
      font-weight:900;
      font-size:14px;
      border:1px solid rgba(29,78,216,0.15);
      flex:0 0 auto;
    }
    .headerText{
      display:flex;
      flex-direction:column;
      gap:1px;
      min-width:0;
    }
    .headerName{
      margin:0;
      font-weight:900;
      font-size:14.5px;
      line-height:1.15;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .headerClinic,.headerTz{
      margin:0;
      color: var(--muted);
      font-size:12px;
      line-height:1.2;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .pill{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:4px 10px;
      border-radius:999px;
      border:1px solid var(--line);
      background:#fff;
      color: var(--muted);
      font-size:12px;
      white-space:nowrap;
    }
    .dot{
      width:8px;
      height:8px;
      border-radius:999px;
      background: var(--good);
      display:inline-block;
    }
    .dot.bad{ background: var(--bad); }

    /* === TOP: 3 columns: Summary | Clinic Hours | Services+Date === */
    .topRow{
      display:grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap:10px;
      margin-bottom:10px;
      align-items:stretch;
    }
    @media(max-width: 1100px){
      .topRow{ grid-template-columns: 1fr 1fr; }
      .topRow .topCard.pickCard{ grid-column: 1 / -1; }
    }
    @media(max-width: 780px){
      .topRow{ grid-template-columns: 1fr; }
      .topRow .topCard.pickCard{ grid-column: auto; }
    }

    .topCard{
      padding:12px;
    }
    .topTitle{
      margin:0 0 8px 0;
      font-weight:900;
      font-size:13.5px;
    }
    .topLine{
      margin:0;
      font-size:12.5px;
      color: var(--muted);
      line-height:1.4;
    }
    .topLine b{ color: var(--text); font-weight:800; }

    /* Services + Date in third card */
    .pickGrid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:10px;
      align-items:start;
    }
    @media(max-width: 780px){
      .pickGrid{ grid-template-columns: 1fr; }
    }

    .sectionTitle{
      margin:0 0 6px 0;
      font-size:12px;
      color: var(--muted);
      font-weight:800;
      letter-spacing:0.02em;
      text-transform:uppercase;
    }
    .label{
      font-size:12px;
      color: var(--muted);
      font-weight:800;
      margin-bottom:6px;
    }

    select, input, textarea{
      width:100%;
      padding:10px 10px;
      border:1px solid var(--line);
      border-radius:12px;
      outline:none;
      font-size:13px;
      background:#fff;
      color: var(--text);
    }
    textarea{ min-height:80px; resize:vertical; }

    .phoneWrap{
      display:flex;
      align-items:center;
      border:1px solid var(--line);
      border-radius:12px;
      background:#fff;
      overflow:hidden;
    }
    .phoneWrap .dialCode{
      font-size:13px;
      color:var(--muted);
      font-weight:600;
      padding:0 2px 0 0;
      white-space:nowrap;
      pointer-events:none;
      user-select:none;
    }
    .phoneWrap input#phone{
      border:none;
      border-radius:0;
      padding:10px 10px 10px 6px;
      flex:1;
      min-width:0;
    }
    .ccPicker{position:relative;}
    .ccBtn{
      border:none;
      background:transparent;
      font-size:18px;
      padding:8px 4px 8px 10px;
      cursor:pointer;
      line-height:1;
    }
    .ccDrop{
      display:none;
      position:absolute;
      top:100%;
      left:0;
      z-index:999;
      background:#fff;
      border:1px solid var(--line);
      border-radius:10px;
      box-shadow:0 6px 20px rgba(0,0,0,.15);
      width:260px;
      max-height:280px;
      overflow:hidden;
      flex-direction:column;
    }
    .ccDrop.open{display:flex;}
    .ccSearch{
      border:none;
      border-bottom:1px solid var(--line);
      padding:10px 12px;
      font-size:14px;
      outline:none;
      width:100%;
      box-sizing:border-box;
    }
    .ccList{
      overflow-y:auto;
      flex:1;
    }
    .ccItem{
      display:flex;
      align-items:center;
      gap:8px;
      padding:8px 12px;
      cursor:pointer;
      font-size:13px;
      white-space:nowrap;
    }
    .ccItem:hover,.ccItem.hl{background:var(--accent);color:#fff;}
    .ccItem .ccFlag{font-size:16px;}
    .ccItem .ccCode{color:var(--muted);margin-left:auto;font-size:12px;}
    .ccItem:hover .ccCode,.ccItem.hl .ccCode{color:rgba(255,255,255,.8);}

    .serviceRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:10px 12px;
      border:1px solid var(--line);
      border-radius:14px;
      cursor:pointer;
      transition: transform 0.06s ease, box-shadow 0.06s ease;
      background:#fff;
      margin-bottom:8px;
    }
    .serviceRow:last-child{ margin-bottom:0; }
    .serviceRow:hover{
      box-shadow: 0 10px 22px rgba(17,24,39,0.08);
      transform: translateY(-1px);
    }
    .serviceRow.selected{
      border-color:#111827;
      box-shadow: 0 12px 26px rgba(17,24,39,0.12);
    }
    .serviceLeft{ display:flex; gap:10px; align-items:center; min-width:0; }
    .serviceIcon{
      width:40px;
      height:40px;
      border-radius:12px;
      background:#eef2ff;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:900;
      color:#1d4ed8;
      border:1px solid rgba(29,78,216,0.12);
      flex:0 0 auto;
    }
    .serviceMeta{ display:flex; flex-direction:column; gap:2px; min-width:0; }
    .serviceName{
      font-weight:900;
      font-size:13px;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .serviceDur{ font-size:12px; color: var(--muted); }
    .chev{ font-size:18px; color: var(--muted); padding: 0 4px; flex:0 0 auto; }

    /* MAIN booking area */
    .main{
      padding:12px;
    }

    /* 10 columns time grid on desktop */
    .timeGrid{
      display:grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      gap:8px;
    }
    @media(max-width: 1100px){
      .timeGrid{ grid-template-columns: repeat(8, minmax(0, 1fr)); }
    }
    @media(max-width: 860px){
      .timeGrid{ grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }
    @media(max-width: 650px){
      .timeGrid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    @media(max-width: 420px){
      .timeGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    .timeBtn{
      padding:10px 6px;
      border-radius:12px;
      border:1px solid var(--line);
      background:#fff;
      cursor:pointer;
      font-weight:900;
      font-size:12.5px;
      text-align:center;
      user-select:none;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .timeBtn.selected{
      border-color:#111827;
      box-shadow: 0 10px 20px rgba(17,24,39,0.10);
      transform: translateY(-1px);
    }

    .row{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      align-items:center;
    }

    .btn{
      border:none;
      border-radius:999px;
      padding:10px 16px;
      font-weight:750;
      cursor:pointer;
      background:#111827;
      color:#fff;
      box-shadow: 0 8px 18px rgba(0,0,0,0.12);
      white-space:nowrap;
    }
    .btn:active{ transform: translateY(1px); }
    .btnAccent{
      background: var(--accent);
      color:#111827;
      box-shadow: 0 10px 22px rgba(245,179,1,0.35);
    }
    .btnGhost{
      background: transparent;
      color: var(--text);
      border: 1px solid var(--line);
      box-shadow:none;
    }

    .msg{
      margin-top:10px;
      padding:10px;
      border-radius:14px;
      border:1px solid var(--line);
      background:#fff;
      color: var(--text);
      font-size:13px;
      line-height:1.4;
      display:none;
    }
    .msg.good{ border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.06); }
    .msg.bad{ border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.06); }

    /* Modals */
    .overlay{
      position:fixed;
      inset:0;
      background: rgba(17,24,39,0.55);
      display:none;
      align-items:center;
      justify-content:center;
      padding:14px;
      z-index:2000;
    }
    .modal{
      width: min(720px, 100%);
      background:#fff;
      border-radius:18px;
      padding:16px;
      border:1px solid var(--line);
      box-shadow: var(--shadow);
    }
    .modal h3{
      margin:0 0 8px 0;
      font-size:16px;
      font-weight:900;
    }
    .modal p{
      margin:0 0 12px 0;
      font-size:13px;
      color: var(--muted);
      line-height:1.45;
      white-space:pre-line;
    }
    .modalActions{
      display:flex;
      justify-content:flex-end;
      gap:10px;
    }

    .loadingBox{
      width: min(560px, 100%);
      background:#fff;
      border-radius:18px;
      padding:18px;
      border:1px solid var(--line);
      box-shadow: var(--shadow);
      display:flex;
      gap:14px;
      align-items:center;
    }
    .spinner{
      width:34px;
      height:34px;
      border-radius:999px;
      border:4px solid #e5e7eb;
      border-top-color:#111827;
      animation: spin 0.9s linear infinite;
      flex:0 0 auto;
    }
    @keyframes spin{ to { transform: rotate(360deg); } }
    .loadingText h4{ margin:0 0 4px 0; font-size:14px; }
    .loadingText div{ margin:0; color: var(--muted); font-size:12.5px; line-height:1.35; }
  </style>
</head>

<body>
  <div class="wrap">

    <!-- Header -->
    <div class="headerBox card">
      <div class="headerLeft">
        <div class="headerLogo">MD</div>
        <div class="headerText">
          <p class="headerName" id="docName">Dr Kevin Navarro Gera</p>
          <p class="headerClinic" id="docMeta">Potter’s Pharmacy Clinic</p>
          <p class="headerTz" id="tzMeta">Time zone: Europe/Malta</p>
        </div>
      </div>

      <span class="pill" id="statusPill" style="display:none;">
        <span class="dot" id="statusDot"></span>
        <span id="statusText">Ready</span>
      </span>
    </div>

    <!-- TOP: 3 columns -->
    <div class="topRow">
      <!-- Summary -->
      <div class="card topCard">
        <p class="topTitle">Summary</p>
        <p class="topLine" id="sumService">Service: Clinic Consultation (10 mins)</p>
        <p class="topLine" id="sumDate">Date: —</p>
        <p class="topLine" id="sumTime">Time: —</p>
        <p class="topLine" id="sumLoc">Location: Potter’s Pharmacy Clinic</p>
      </div>

      <!-- Clinic hours -->
      <div class="card topCard">
        <p class="topTitle">Clinic hours</p>
        <p class="topLine"><b>Mon–Fri:</b> 09:00–12:00 & 17:00–19:00</p>
        <p class="topLine"><b>Sat:</b> 10:00–12:00</p>
        <p class="topLine"><b>Sun:</b> Closed</p>
        <p class="topLine">Slots are 10 minutes each.</p>
      </div>

      <!-- Services + Date moved into the empty third column -->
      <div class="card topCard pickCard">
        <div class="pickGrid">
          <div>
            <div class="sectionTitle">Services</div>
            <div id="services"></div>
          </div>

          <div>
            <div class="sectionTitle">Select a date</div>
            <div class="label">Available dates (next 7 days)</div>
            <select id="dateSelect"></select>
            <div id="dateHint" class="msg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="card main">
      <div class="sectionTitle">Select a time</div>
      <div id="timeGrid" class="timeGrid"></div>
      <div id="timeHint" class="msg"></div>

      <div class="sectionTitle" style="margin-top:12px;">Your details</div>

      <div class="row">
        <div style="flex: 1 1 280px;">
          <div class="label">Full name *</div>
          <input id="fullName" type="text" autocomplete="name" placeholder="Full name">
        </div>
        <div style="flex: 1 1 220px;">
          <div class="label">Phone *</div>
          <div class="phoneWrap">
            <div class="ccPicker" id="ccPicker">
              <button type="button" class="ccBtn" id="ccBtn" aria-label="Country code">\\u{1F1F2}\\u{1F1F9}</button>
              <div class="ccDrop" id="ccDrop">
                <input type="text" class="ccSearch" id="ccSearch" placeholder="Search country\\u2026" autocomplete="off">
                <div class="ccList" id="ccList"></div>
              </div>
            </div>
            <span id="dialCode" class="dialCode">+356</span>
            <input id="phone" type="tel" autocomplete="tel-national" placeholder="7900 1234">
          </div>
        </div>
        <div style="flex: 1 1 280px;">
          <div class="label">Email *</div>
          <input id="email" type="email" autocomplete="email" placeholder="you@example.com">
        </div>
      </div>

      <div style="margin-top:10px;">
        <div class="label">Comments</div>
        <textarea id="comments" placeholder="Optional notes…"></textarea>
      </div>

      <div class="row" style="margin-top:10px; justify-content:flex-start;">
        <button class="btn btnAccent" id="confirmBtn">Confirm</button>
      </div>

      <div id="resultMsg" class="msg"></div>
    </div>

  </div>

  <!-- Confirmation modal -->
  <div class="overlay" id="confirmOverlay">
    <div class="modal">
      <h3>Appointment Confirmed</h3>
      <p id="confirmText"></p>
      <div class="modalActions">
        <button class="btn btnAccent" id="confirmOk">OK</button>
      </div>
    </div>
  </div>

  <!-- Loading overlay -->
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
    // --- Remove the "This application was created by a Google Apps Script user" banner (best effort) ---
    (function () {
      function findAndRemoveInDocument(doc) {
        if (!doc) return false;

        let el =
          doc.getElementById('warning') ||
          doc.querySelector('#warning') ||
          doc.querySelector('.warning-bar.warning-banner-bar') ||
          doc.querySelector('.warning-banner-bar') ||
          doc.querySelector('.warning-banner') ||
          doc.querySelector('[aria-labelledby="warning-text"]') ||
          doc.querySelector('#warning-text');

        if (!el) return false;

        if (el && el.id === 'warning-text') {
          el = el.closest('#warning') || el.closest('.warning-banner-bar') || el.closest('.warning-banner') || el;
        }

        const kill =
          el.closest('tr') ||
          el.closest('td') ||
          el.closest('table') ||
          el;

        if (kill && kill.parentNode) {
          kill.parentNode.removeChild(kill);
          return true;
        }

        try {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.height = '0';
          el.style.margin = '0';
          el.style.padding = '0';
          return true;
        } catch (e) {}

        return false;
      }

      function stripGasBanner() {
        let removed = false;
        removed = findAndRemoveInDocument(document) || removed;
        try { removed = findAndRemoveInDocument(window.parent && window.parent.document) || removed; } catch (e1) {}
        try { removed = findAndRemoveInDocument(window.top && window.top.document) || removed; } catch (e2) {}
        return removed;
      }

      function installWatchers() {
        stripGasBanner();
        setTimeout(stripGasBanner, 50);
        setTimeout(stripGasBanner, 250);
        setTimeout(stripGasBanner, 800);
        setTimeout(stripGasBanner, 1500);

        try {
          const mo = new MutationObserver(() => { stripGasBanner(); });
          mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
        } catch (e) {}

        setInterval(stripGasBanner, 2000);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installWatchers);
      } else {
        installWatchers();
      }

      window.stripGasBanner = stripGasBanner;
    })();
  </script>

  <script>
    const state = {
      config: null,
      dateOptions: [],
      selectedServiceId: null,
      selectedServiceName: null,
      selectedServiceMinutes: null,
      selectedDateKey: null,
      selectedDateLabel: null,
      selectedSlot: null,
      slots: []
    };


    const els = {
      services: document.getElementById('services'),
      dateSelect: document.getElementById('dateSelect'),
      timeGrid: document.getElementById('timeGrid'),
      confirmBtn: document.getElementById('confirmBtn'),
      resultMsg: document.getElementById('resultMsg'),

      docName: document.getElementById('docName'),
      docMeta: document.getElementById('docMeta'),
      tzMeta: document.getElementById('tzMeta'),

      sumService: document.getElementById('sumService'),
      sumDate: document.getElementById('sumDate'),
      sumTime: document.getElementById('sumTime'),
      sumLoc: document.getElementById('sumLoc'),

      confirmOverlay: document.getElementById('confirmOverlay'),
      confirmText: document.getElementById('confirmText'),
      confirmOk: document.getElementById('confirmOk'),

      loadingOverlay: document.getElementById('loadingOverlay'),
      loadingTitle: document.getElementById('loadingTitle'),
      loadingDesc: document.getElementById('loadingDesc'),

      dateHint: document.getElementById('dateHint'),
      timeHint: document.getElementById('timeHint'),

      statusPill: document.getElementById('statusPill'),
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),

      fullName: document.getElementById('fullName'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      ccBtn: document.getElementById('ccBtn'),
      ccDrop: document.getElementById('ccDrop'),
      ccSearch: document.getElementById('ccSearch'),
      ccList: document.getElementById('ccList'),
      dialCode: document.getElementById('dialCode'),
      comments: document.getElementById('comments')
    };

    // --- Country code picker (193 UN member states, Malta default) ---
    const COUNTRIES = [
      {flag:"\\u{1F1F2}\\u{1F1F9}",code:"+356",name:"Malta"},
      {flag:"\\u{1F1E6}\\u{1F1EB}",code:"+93",name:"Afghanistan"},
      {flag:"\\u{1F1E6}\\u{1F1F1}",code:"+355",name:"Albania"},
      {flag:"\\u{1F1E9}\\u{1F1FF}",code:"+213",name:"Algeria"},
      {flag:"\\u{1F1E6}\\u{1F1E9}",code:"+376",name:"Andorra"},
      {flag:"\\u{1F1E6}\\u{1F1F4}",code:"+244",name:"Angola"},
      {flag:"\\u{1F1E6}\\u{1F1EC}",code:"+1-268",name:"Antigua and Barbuda"},
      {flag:"\\u{1F1E6}\\u{1F1F7}",code:"+54",name:"Argentina"},
      {flag:"\\u{1F1E6}\\u{1F1F2}",code:"+374",name:"Armenia"},
      {flag:"\\u{1F1E6}\\u{1F1FA}",code:"+61",name:"Australia"},
      {flag:"\\u{1F1E6}\\u{1F1F9}",code:"+43",name:"Austria"},
      {flag:"\\u{1F1E6}\\u{1F1FF}",code:"+994",name:"Azerbaijan"},
      {flag:"\\u{1F1E7}\\u{1F1F8}",code:"+1-242",name:"Bahamas"},
      {flag:"\\u{1F1E7}\\u{1F1ED}",code:"+973",name:"Bahrain"},
      {flag:"\\u{1F1E7}\\u{1F1E9}",code:"+880",name:"Bangladesh"},
      {flag:"\\u{1F1E7}\\u{1F1E7}",code:"+1-246",name:"Barbados"},
      {flag:"\\u{1F1E7}\\u{1F1FE}",code:"+375",name:"Belarus"},
      {flag:"\\u{1F1E7}\\u{1F1EA}",code:"+32",name:"Belgium"},
      {flag:"\\u{1F1E7}\\u{1F1FF}",code:"+501",name:"Belize"},
      {flag:"\\u{1F1E7}\\u{1F1EF}",code:"+229",name:"Benin"},
      {flag:"\\u{1F1E7}\\u{1F1F9}",code:"+975",name:"Bhutan"},
      {flag:"\\u{1F1E7}\\u{1F1F4}",code:"+591",name:"Bolivia"},
      {flag:"\\u{1F1E7}\\u{1F1E6}",code:"+387",name:"Bosnia and Herzegovina"},
      {flag:"\\u{1F1E7}\\u{1F1FC}",code:"+267",name:"Botswana"},
      {flag:"\\u{1F1E7}\\u{1F1F7}",code:"+55",name:"Brazil"},
      {flag:"\\u{1F1E7}\\u{1F1F3}",code:"+673",name:"Brunei"},
      {flag:"\\u{1F1E7}\\u{1F1EC}",code:"+359",name:"Bulgaria"},
      {flag:"\\u{1F1E7}\\u{1F1EB}",code:"+226",name:"Burkina Faso"},
      {flag:"\\u{1F1E7}\\u{1F1EE}",code:"+257",name:"Burundi"},
      {flag:"\\u{1F1E8}\\u{1F1FB}",code:"+238",name:"Cabo Verde"},
      {flag:"\\u{1F1F0}\\u{1F1ED}",code:"+855",name:"Cambodia"},
      {flag:"\\u{1F1E8}\\u{1F1F2}",code:"+237",name:"Cameroon"},
      {flag:"\\u{1F1E8}\\u{1F1E6}",code:"+1",name:"Canada"},
      {flag:"\\u{1F1E8}\\u{1F1EB}",code:"+236",name:"Central African Republic"},
      {flag:"\\u{1F1F9}\\u{1F1E9}",code:"+235",name:"Chad"},
      {flag:"\\u{1F1E8}\\u{1F1F1}",code:"+56",name:"Chile"},
      {flag:"\\u{1F1E8}\\u{1F1F3}",code:"+86",name:"China"},
      {flag:"\\u{1F1E8}\\u{1F1F4}",code:"+57",name:"Colombia"},
      {flag:"\\u{1F1F0}\\u{1F1F2}",code:"+269",name:"Comoros"},
      {flag:"\\u{1F1E8}\\u{1F1EC}",code:"+242",name:"Congo"},
      {flag:"\\u{1F1E8}\\u{1F1E9}",code:"+243",name:"Congo (DRC)"},
      {flag:"\\u{1F1E8}\\u{1F1F7}",code:"+506",name:"Costa Rica"},
      {flag:"\\u{1F1E8}\\u{1F1EE}",code:"+225",name:"C\\u00f4te d'Ivoire"},
      {flag:"\\u{1F1ED}\\u{1F1F7}",code:"+385",name:"Croatia"},
      {flag:"\\u{1F1E8}\\u{1F1FA}",code:"+53",name:"Cuba"},
      {flag:"\\u{1F1E8}\\u{1F1FE}",code:"+357",name:"Cyprus"},
      {flag:"\\u{1F1E8}\\u{1F1FF}",code:"+420",name:"Czechia"},
      {flag:"\\u{1F1E9}\\u{1F1F0}",code:"+45",name:"Denmark"},
      {flag:"\\u{1F1E9}\\u{1F1EF}",code:"+253",name:"Djibouti"},
      {flag:"\\u{1F1E9}\\u{1F1F2}",code:"+1-767",name:"Dominica"},
      {flag:"\\u{1F1E9}\\u{1F1F4}",code:"+1-809",name:"Dominican Republic"},
      {flag:"\\u{1F1EA}\\u{1F1E8}",code:"+593",name:"Ecuador"},
      {flag:"\\u{1F1EA}\\u{1F1EC}",code:"+20",name:"Egypt"},
      {flag:"\\u{1F1F8}\\u{1F1FB}",code:"+503",name:"El Salvador"},
      {flag:"\\u{1F1EC}\\u{1F1F6}",code:"+240",name:"Equatorial Guinea"},
      {flag:"\\u{1F1EA}\\u{1F1F7}",code:"+291",name:"Eritrea"},
      {flag:"\\u{1F1EA}\\u{1F1EA}",code:"+372",name:"Estonia"},
      {flag:"\\u{1F1F8}\\u{1F1FF}",code:"+268",name:"Eswatini"},
      {flag:"\\u{1F1EA}\\u{1F1F9}",code:"+251",name:"Ethiopia"},
      {flag:"\\u{1F1EB}\\u{1F1EF}",code:"+679",name:"Fiji"},
      {flag:"\\u{1F1EB}\\u{1F1EE}",code:"+358",name:"Finland"},
      {flag:"\\u{1F1EB}\\u{1F1F7}",code:"+33",name:"France"},
      {flag:"\\u{1F1EC}\\u{1F1E6}",code:"+241",name:"Gabon"},
      {flag:"\\u{1F1EC}\\u{1F1F2}",code:"+220",name:"Gambia"},
      {flag:"\\u{1F1EC}\\u{1F1EA}",code:"+995",name:"Georgia"},
      {flag:"\\u{1F1E9}\\u{1F1EA}",code:"+49",name:"Germany"},
      {flag:"\\u{1F1EC}\\u{1F1ED}",code:"+233",name:"Ghana"},
      {flag:"\\u{1F1EC}\\u{1F1F7}",code:"+30",name:"Greece"},
      {flag:"\\u{1F1EC}\\u{1F1E9}",code:"+1-473",name:"Grenada"},
      {flag:"\\u{1F1EC}\\u{1F1F9}",code:"+502",name:"Guatemala"},
      {flag:"\\u{1F1EC}\\u{1F1F3}",code:"+224",name:"Guinea"},
      {flag:"\\u{1F1EC}\\u{1F1FC}",code:"+245",name:"Guinea-Bissau"},
      {flag:"\\u{1F1EC}\\u{1F1FE}",code:"+592",name:"Guyana"},
      {flag:"\\u{1F1ED}\\u{1F1F9}",code:"+509",name:"Haiti"},
      {flag:"\\u{1F1ED}\\u{1F1F3}",code:"+504",name:"Honduras"},
      {flag:"\\u{1F1ED}\\u{1F1FA}",code:"+36",name:"Hungary"},
      {flag:"\\u{1F1EE}\\u{1F1F8}",code:"+354",name:"Iceland"},
      {flag:"\\u{1F1EE}\\u{1F1F3}",code:"+91",name:"India"},
      {flag:"\\u{1F1EE}\\u{1F1E9}",code:"+62",name:"Indonesia"},
      {flag:"\\u{1F1EE}\\u{1F1F7}",code:"+98",name:"Iran"},
      {flag:"\\u{1F1EE}\\u{1F1F6}",code:"+964",name:"Iraq"},
      {flag:"\\u{1F1EE}\\u{1F1EA}",code:"+353",name:"Ireland"},
      {flag:"\\u{1F1EE}\\u{1F1F1}",code:"+972",name:"Israel"},
      {flag:"\\u{1F1EE}\\u{1F1F9}",code:"+39",name:"Italy"},
      {flag:"\\u{1F1EF}\\u{1F1F2}",code:"+1-876",name:"Jamaica"},
      {flag:"\\u{1F1EF}\\u{1F1F5}",code:"+81",name:"Japan"},
      {flag:"\\u{1F1EF}\\u{1F1F4}",code:"+962",name:"Jordan"},
      {flag:"\\u{1F1F0}\\u{1F1FF}",code:"+7",name:"Kazakhstan"},
      {flag:"\\u{1F1F0}\\u{1F1EA}",code:"+254",name:"Kenya"},
      {flag:"\\u{1F1F0}\\u{1F1EE}",code:"+686",name:"Kiribati"},
      {flag:"\\u{1F1F0}\\u{1F1FC}",code:"+965",name:"Kuwait"},
      {flag:"\\u{1F1F0}\\u{1F1EC}",code:"+996",name:"Kyrgyzstan"},
      {flag:"\\u{1F1F1}\\u{1F1E6}",code:"+856",name:"Laos"},
      {flag:"\\u{1F1F1}\\u{1F1FB}",code:"+371",name:"Latvia"},
      {flag:"\\u{1F1F1}\\u{1F1E7}",code:"+961",name:"Lebanon"},
      {flag:"\\u{1F1F1}\\u{1F1F8}",code:"+266",name:"Lesotho"},
      {flag:"\\u{1F1F1}\\u{1F1F7}",code:"+231",name:"Liberia"},
      {flag:"\\u{1F1F1}\\u{1F1FE}",code:"+218",name:"Libya"},
      {flag:"\\u{1F1F1}\\u{1F1EE}",code:"+423",name:"Liechtenstein"},
      {flag:"\\u{1F1F1}\\u{1F1F9}",code:"+370",name:"Lithuania"},
      {flag:"\\u{1F1F1}\\u{1F1FA}",code:"+352",name:"Luxembourg"},
      {flag:"\\u{1F1F2}\\u{1F1EC}",code:"+261",name:"Madagascar"},
      {flag:"\\u{1F1F2}\\u{1F1FC}",code:"+265",name:"Malawi"},
      {flag:"\\u{1F1F2}\\u{1F1FE}",code:"+60",name:"Malaysia"},
      {flag:"\\u{1F1F2}\\u{1F1FB}",code:"+960",name:"Maldives"},
      {flag:"\\u{1F1F2}\\u{1F1F1}",code:"+223",name:"Mali"},
      {flag:"\\u{1F1F2}\\u{1F1ED}",code:"+692",name:"Marshall Islands"},
      {flag:"\\u{1F1F2}\\u{1F1F7}",code:"+222",name:"Mauritania"},
      {flag:"\\u{1F1F2}\\u{1F1FA}",code:"+230",name:"Mauritius"},
      {flag:"\\u{1F1F2}\\u{1F1FD}",code:"+52",name:"Mexico"},
      {flag:"\\u{1F1EB}\\u{1F1F2}",code:"+691",name:"Micronesia"},
      {flag:"\\u{1F1F2}\\u{1F1E9}",code:"+373",name:"Moldova"},
      {flag:"\\u{1F1F2}\\u{1F1E8}",code:"+377",name:"Monaco"},
      {flag:"\\u{1F1F2}\\u{1F1F3}",code:"+976",name:"Mongolia"},
      {flag:"\\u{1F1F2}\\u{1F1EA}",code:"+382",name:"Montenegro"},
      {flag:"\\u{1F1F2}\\u{1F1E6}",code:"+212",name:"Morocco"},
      {flag:"\\u{1F1F2}\\u{1F1FF}",code:"+258",name:"Mozambique"},
      {flag:"\\u{1F1F2}\\u{1F1F2}",code:"+95",name:"Myanmar"},
      {flag:"\\u{1F1F3}\\u{1F1E6}",code:"+264",name:"Namibia"},
      {flag:"\\u{1F1F3}\\u{1F1F7}",code:"+674",name:"Nauru"},
      {flag:"\\u{1F1F3}\\u{1F1F5}",code:"+977",name:"Nepal"},
      {flag:"\\u{1F1F3}\\u{1F1F1}",code:"+31",name:"Netherlands"},
      {flag:"\\u{1F1F3}\\u{1F1FF}",code:"+64",name:"New Zealand"},
      {flag:"\\u{1F1F3}\\u{1F1EE}",code:"+505",name:"Nicaragua"},
      {flag:"\\u{1F1F3}\\u{1F1EA}",code:"+227",name:"Niger"},
      {flag:"\\u{1F1F3}\\u{1F1EC}",code:"+234",name:"Nigeria"},
      {flag:"\\u{1F1F0}\\u{1F1F5}",code:"+850",name:"North Korea"},
      {flag:"\\u{1F1F2}\\u{1F1F0}",code:"+389",name:"North Macedonia"},
      {flag:"\\u{1F1F3}\\u{1F1F4}",code:"+47",name:"Norway"},
      {flag:"\\u{1F1F4}\\u{1F1F2}",code:"+968",name:"Oman"},
      {flag:"\\u{1F1F5}\\u{1F1F0}",code:"+92",name:"Pakistan"},
      {flag:"\\u{1F1F5}\\u{1F1FC}",code:"+680",name:"Palau"},
      {flag:"\\u{1F1F5}\\u{1F1E6}",code:"+507",name:"Panama"},
      {flag:"\\u{1F1F5}\\u{1F1EC}",code:"+675",name:"Papua New Guinea"},
      {flag:"\\u{1F1F5}\\u{1F1FE}",code:"+595",name:"Paraguay"},
      {flag:"\\u{1F1F5}\\u{1F1EA}",code:"+51",name:"Peru"},
      {flag:"\\u{1F1F5}\\u{1F1ED}",code:"+63",name:"Philippines"},
      {flag:"\\u{1F1F5}\\u{1F1F1}",code:"+48",name:"Poland"},
      {flag:"\\u{1F1F5}\\u{1F1F9}",code:"+351",name:"Portugal"},
      {flag:"\\u{1F1F6}\\u{1F1E6}",code:"+974",name:"Qatar"},
      {flag:"\\u{1F1F7}\\u{1F1F4}",code:"+40",name:"Romania"},
      {flag:"\\u{1F1F7}\\u{1F1FA}",code:"+7",name:"Russia"},
      {flag:"\\u{1F1F7}\\u{1F1FC}",code:"+250",name:"Rwanda"},
      {flag:"\\u{1F1F0}\\u{1F1F3}",code:"+1-869",name:"Saint Kitts and Nevis"},
      {flag:"\\u{1F1F1}\\u{1F1E8}",code:"+1-758",name:"Saint Lucia"},
      {flag:"\\u{1F1FB}\\u{1F1E8}",code:"+1-784",name:"Saint Vincent and the Grenadines"},
      {flag:"\\u{1F1FC}\\u{1F1F8}",code:"+685",name:"Samoa"},
      {flag:"\\u{1F1F8}\\u{1F1F2}",code:"+378",name:"San Marino"},
      {flag:"\\u{1F1F8}\\u{1F1F9}",code:"+239",name:"S\\u00e3o Tom\\u00e9 and Pr\\u00edncipe"},
      {flag:"\\u{1F1F8}\\u{1F1E6}",code:"+966",name:"Saudi Arabia"},
      {flag:"\\u{1F1F8}\\u{1F1F3}",code:"+221",name:"Senegal"},
      {flag:"\\u{1F1F7}\\u{1F1F8}",code:"+381",name:"Serbia"},
      {flag:"\\u{1F1F8}\\u{1F1E8}",code:"+248",name:"Seychelles"},
      {flag:"\\u{1F1F8}\\u{1F1F1}",code:"+232",name:"Sierra Leone"},
      {flag:"\\u{1F1F8}\\u{1F1EC}",code:"+65",name:"Singapore"},
      {flag:"\\u{1F1F8}\\u{1F1F0}",code:"+421",name:"Slovakia"},
      {flag:"\\u{1F1F8}\\u{1F1EE}",code:"+386",name:"Slovenia"},
      {flag:"\\u{1F1F8}\\u{1F1E7}",code:"+677",name:"Solomon Islands"},
      {flag:"\\u{1F1F8}\\u{1F1F4}",code:"+252",name:"Somalia"},
      {flag:"\\u{1F1FF}\\u{1F1E6}",code:"+27",name:"South Africa"},
      {flag:"\\u{1F1F0}\\u{1F1F7}",code:"+82",name:"South Korea"},
      {flag:"\\u{1F1F8}\\u{1F1F8}",code:"+211",name:"South Sudan"},
      {flag:"\\u{1F1EA}\\u{1F1F8}",code:"+34",name:"Spain"},
      {flag:"\\u{1F1F1}\\u{1F1F0}",code:"+94",name:"Sri Lanka"},
      {flag:"\\u{1F1F8}\\u{1F1E9}",code:"+249",name:"Sudan"},
      {flag:"\\u{1F1F8}\\u{1F1F7}",code:"+597",name:"Suriname"},
      {flag:"\\u{1F1F8}\\u{1F1EA}",code:"+46",name:"Sweden"},
      {flag:"\\u{1F1E8}\\u{1F1ED}",code:"+41",name:"Switzerland"},
      {flag:"\\u{1F1F8}\\u{1F1FE}",code:"+963",name:"Syria"},
      {flag:"\\u{1F1F9}\\u{1F1EF}",code:"+992",name:"Tajikistan"},
      {flag:"\\u{1F1F9}\\u{1F1FF}",code:"+255",name:"Tanzania"},
      {flag:"\\u{1F1F9}\\u{1F1ED}",code:"+66",name:"Thailand"},
      {flag:"\\u{1F1F9}\\u{1F1F1}",code:"+670",name:"Timor-Leste"},
      {flag:"\\u{1F1F9}\\u{1F1EC}",code:"+228",name:"Togo"},
      {flag:"\\u{1F1F9}\\u{1F1F4}",code:"+676",name:"Tonga"},
      {flag:"\\u{1F1F9}\\u{1F1F9}",code:"+1-868",name:"Trinidad and Tobago"},
      {flag:"\\u{1F1F9}\\u{1F1F3}",code:"+216",name:"Tunisia"},
      {flag:"\\u{1F1F9}\\u{1F1F7}",code:"+90",name:"Turkey"},
      {flag:"\\u{1F1F9}\\u{1F1F2}",code:"+993",name:"Turkmenistan"},
      {flag:"\\u{1F1F9}\\u{1F1FB}",code:"+688",name:"Tuvalu"},
      {flag:"\\u{1F1FA}\\u{1F1EC}",code:"+256",name:"Uganda"},
      {flag:"\\u{1F1FA}\\u{1F1E6}",code:"+380",name:"Ukraine"},
      {flag:"\\u{1F1E6}\\u{1F1EA}",code:"+971",name:"United Arab Emirates"},
      {flag:"\\u{1F1EC}\\u{1F1E7}",code:"+44",name:"United Kingdom"},
      {flag:"\\u{1F1FA}\\u{1F1F8}",code:"+1",name:"United States"},
      {flag:"\\u{1F1FA}\\u{1F1FE}",code:"+598",name:"Uruguay"},
      {flag:"\\u{1F1FA}\\u{1F1FF}",code:"+998",name:"Uzbekistan"},
      {flag:"\\u{1F1FB}\\u{1F1FA}",code:"+678",name:"Vanuatu"},
      {flag:"\\u{1F1FB}\\u{1F1E6}",code:"+379",name:"Vatican City"},
      {flag:"\\u{1F1FB}\\u{1F1EA}",code:"+58",name:"Venezuela"},
      {flag:"\\u{1F1FB}\\u{1F1F3}",code:"+84",name:"Vietnam"},
      {flag:"\\u{1F1FE}\\u{1F1EA}",code:"+967",name:"Yemen"},
      {flag:"\\u{1F1FF}\\u{1F1F2}",code:"+260",name:"Zambia"},
      {flag:"\\u{1F1FF}\\u{1F1FC}",code:"+263",name:"Zimbabwe"}
    ];

    // --- Searchable country picker ---
    var selectedCountry = COUNTRIES[0]; // Malta default

    (function initCountryPicker(){
      function renderList(filter) {
        els.ccList.innerHTML = '';
        var q = (filter || '').toLowerCase();
        COUNTRIES.forEach(function(c, i) {
          if (q && c.name.toLowerCase().indexOf(q) === -1 && c.code.indexOf(q) === -1) return;
          var d = document.createElement('div');
          d.className = 'ccItem';
          d.innerHTML = '<span class="ccFlag">' + c.flag + '</span>' +
            '<span>' + c.name + '</span>' +
            '<span class="ccCode">' + c.code + '</span>';
          d.addEventListener('click', function() { pickCountry(c); });
          els.ccList.appendChild(d);
        });
      }

      function pickCountry(c) {
        selectedCountry = c;
        els.ccBtn.textContent = c.flag;
        els.dialCode.textContent = c.code;
        closeDrop();
      }

      function openDrop() {
        els.ccDrop.classList.add('open');
        els.ccSearch.value = '';
        renderList('');
        els.ccSearch.focus();
      }

      function closeDrop() {
        els.ccDrop.classList.remove('open');
      }

      els.ccBtn.addEventListener('click', function() {
        els.ccDrop.classList.contains('open') ? closeDrop() : openDrop();
      });

      els.ccSearch.addEventListener('input', function() {
        renderList(this.value);
      });

      document.addEventListener('click', function(e) {
        if (!document.getElementById('ccPicker').contains(e.target)) closeDrop();
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeDrop();
      });

      // Init default
      els.dialCode.textContent = selectedCountry.code;
      renderList('');
    })();

    function getFullPhone() {
      var local = els.phone.value.trim().replace(/^0+/, '');
      return selectedCountry.code + local;
    }

    const EXEC_URL_AFTER_BOOKING = 'https://script.google.com/macros/s/AKfycbxQGnxKNEe9BpU8F7TSDHzc1kybq9TBi-RpUOwX4BsRcX2HUU2V5TfcuHsvQA6duZQ/exec';

    function goToExecAfterBooking_(){
      const target = EXEC_URL_AFTER_BOOKING;
      try { window.top.location.href = target; return; } catch (e1) {}
      try { window.parent.location.href = target; return; } catch (e2) {}
      try { window.location.href = target; return; } catch (e3) {}
      try {
        const a = document.createElement('a');
        a.href = target;
        a.target = '_top';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e4) {}
    }

    function showLoading(title, desc){
      els.loadingTitle.textContent = title || 'Loading…';
      els.loadingDesc.textContent = desc || 'Please wait.';
      els.loadingOverlay.style.display = 'flex';
    }
    function hideLoading(){
      els.loadingOverlay.style.display = 'none';
    }

    function showConfirmModal(text){
      els.confirmText.textContent = text;
      els.confirmOverlay.style.display = 'flex';
    }
    function hideConfirmModal(){
      els.confirmOverlay.style.display = 'none';
    }

    els.confirmOk.addEventListener('click', () => {
      hideConfirmModal();
      goToExecAfterBooking_();
    });

    function setStatus(type, text) {
      els.statusPill.style.display = 'inline-flex';
      els.statusText.textContent = text;
      if (type === 'bad') els.statusDot.classList.add('bad');
      else els.statusDot.classList.remove('bad');
    }

    function showMsg(type, text) {
      els.resultMsg.style.display = 'block';
      els.resultMsg.classList.remove('good', 'bad');
      if (type === 'good') els.resultMsg.classList.add('good');
      if (type === 'bad') els.resultMsg.classList.add('bad');
      els.resultMsg.textContent = text;
    }
    function hideMsg() {
      els.resultMsg.style.display = 'none';
      els.resultMsg.textContent = '';
      els.resultMsg.classList.remove('good','bad');
    }

    function showHint(el, type, text) {
      el.style.display = 'block';
      el.classList.remove('good', 'bad');
      if (type === 'good') el.classList.add('good');
      if (type === 'bad') el.classList.add('bad');
      el.textContent = text;
    }
    function hideHint(el) {
      el.style.display = 'none';
      el.textContent = '';
      el.classList.remove('good','bad');
    }

    function to12h(hhmm){
      const [hh, mm] = hhmm.split(':').map(x => parseInt(x,10));
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const h = (hh % 12) === 0 ? 12 : (hh % 12);
      return \`\${h}:\${String(mm).padStart(2,'0')} \${ampm}\`;
    }

    function parseHHMMToMinutes(hhmm){
      const [hh, mm] = hhmm.split(':').map(x => parseInt(x,10));
      return (hh * 60) + mm;
    }

    function getNowInTimeZoneParts(tz){
      // Returns {dateKey: YYYY-MM-DD, minutes: minutesSinceMidnight} for a given IANA tz
      const dtf = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = dtf.formatToParts(new Date());
      const map = {};
      parts.forEach(p => { if (p.type !== 'literal') map[p.type] = p.value; });

      const dateKey = \`\${map.year}-\${map.month}-\${map.day}\`;
      const minutes = (parseInt(map.hour,10) * 60) + parseInt(map.minute,10);
      return { dateKey, minutes };
    }

    function renderServices() {
      els.services.innerHTML = '';
      const svcs = (state.config && state.config.services) ? state.config.services : [];

      svcs.forEach((svc) => {
        const div = document.createElement('div');
        div.className = 'serviceRow';
        div.dataset.serviceId = svc.id;

        const icon = (svc.id === 'blood') ? '🧪' : '🩺';

        div.innerHTML = \`
          <div class="serviceLeft">
            <div class="serviceIcon">\${icon}</div>
            <div class="serviceMeta">
              <div class="serviceName">\${svc.name.toUpperCase()}</div>
              <div class="serviceDur">\${svc.minutes} mins</div>
            </div>
          </div>
          <div class="chev">›</div>
        \`;

        div.addEventListener('click', () => selectService(svc));
        els.services.appendChild(div);
      });

      if (svcs.length) selectService(svcs[0], true);
    }

    function selectService(svc, silent) {
      state.selectedServiceId = svc.id;
      state.selectedServiceName = svc.name;
      state.selectedServiceMinutes = svc.minutes;

      [...els.services.querySelectorAll('.serviceRow')].forEach(x => {
        x.classList.toggle('selected', x.dataset.serviceId === svc.id);
      });

      els.sumService.textContent = \`Service: \${svc.name} (\${svc.minutes} mins)\`;
      if (!silent) setStatus('good', 'Service selected');

      // Refresh slots when switching service (optional; safe)
      if (state.selectedDateKey) loadAvailability(true);
    }

    function renderDates() {
      els.dateSelect.innerHTML = '';

      state.dateOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.dateKey;
        o.textContent = opt.label + (opt.disabled ? \` — \${opt.reason}\` : '');
        o.disabled = !!opt.disabled;
        els.dateSelect.appendChild(o);
      });

      const firstEnabled = state.dateOptions.find(x => !x.disabled);
      if (firstEnabled) {
        els.dateSelect.value = firstEnabled.dateKey;
        state.selectedDateKey = firstEnabled.dateKey;
        state.selectedDateLabel = firstEnabled.label;
        els.sumDate.textContent = \`Date: \${firstEnabled.label}\`;
        hideHint(els.dateHint);
      } else {
        state.selectedDateKey = null;
        showHint(els.dateHint, 'bad', 'No available dates in the next 7 days.');
      }
    }

    els.dateSelect.addEventListener('change', () => {
      const dateKey = els.dateSelect.value;
      state.selectedDateKey = dateKey;

      const opt = state.dateOptions.find(x => x.dateKey === dateKey);
      state.selectedDateLabel = opt ? opt.label : dateKey;

      state.selectedSlot = null;
      els.sumDate.textContent = \`Date: \${state.selectedDateLabel}\`;
      els.sumTime.textContent = \`Time: —\`;

      hideHint(els.timeHint);
      hideMsg();
      setStatus('good', 'Loading slots…');
      loadAvailability(false);
    });

    function renderSlots(slots) {
      els.timeGrid.innerHTML = '';
      state.slots = slots || [];

      // Only show available + not past (for today in Europe/Malta)
      const tz = (state.config && state.config.timezone) ? state.config.timezone : 'Europe/Malta';
      const now = getNowInTimeZoneParts(tz);

      const filtered = (slots || []).filter(slot => {
        if (!slot || !slot.start) return false;
        if (slot.available !== true) return false;

        if (state.selectedDateKey && state.selectedDateKey === now.dateKey) {
          const startMin = parseHHMMToMinutes(slot.start);
          if (startMin < now.minutes) return false;
        }
        return true;
      });

      // If previously selected slot is gone, clear
      if (state.selectedSlot && state.selectedSlot.start) {
        const stillThere = filtered.some(s => s.start === state.selectedSlot.start);
        if (!stillThere) {
          state.selectedSlot = null;
          els.sumTime.textContent = 'Time: —';
        }
      }

      if (!filtered.length) {
        showHint(els.timeHint, 'bad', 'No slots available.');
        return;
      }
      hideHint(els.timeHint);

      filtered.forEach(slot => {
        const b = document.createElement('div');
        b.className = 'timeBtn';
        b.textContent = to12h(slot.start);

        if (state.selectedSlot && state.selectedSlot.start === slot.start) {
          b.classList.add('selected');
        }

        b.addEventListener('click', () => selectSlot(slot, b));
        els.timeGrid.appendChild(b);
      });
    }

    function selectSlot(slot, buttonEl) {
      [...els.timeGrid.querySelectorAll('.timeBtn')].forEach(x => x.classList.remove('selected'));
      buttonEl.classList.add('selected');

      state.selectedSlot = slot;
      els.sumTime.textContent = \`Time: \${to12h(slot.start)} - \${to12h(slot.end)}\`;
      els.sumLoc.textContent = \`Location: \${state.config.pottersLocation}\`;

      hideMsg();
      setStatus('good', 'Time selected');
    }

    function validateForm() {
      if (!state.selectedServiceId) return 'Please select a service.';
      if (!state.selectedDateKey) return 'Please select a date.';
      if (!state.selectedSlot || !state.selectedSlot.start) return 'Please select a time slot.';

      const fullName = els.fullName.value.trim();
      const email = els.email.value.trim();
      const phone = els.phone.value.trim();

      if (!fullName) return 'Full name is required.';
      if (!phone) return 'Phone number is required.';
      if (!email) return 'Email is required.';
      if (!email.includes('@')) return 'Please enter a valid email.';

      return null;
    }

    function loadAvailability(isSilentRefresh) {
      if (!state.selectedDateKey) return;

      if (!isSilentRefresh) {
        showLoading('Loading time slots…', 'Please wait while we fetch availability.');
      }

      google.script.run
        .withSuccessHandler((res) => {
          if (!isSilentRefresh) hideLoading();

          if (!res || !res.ok) {
            renderSlots([]);
            showHint(els.timeHint, 'bad', (res && res.reason) ? res.reason : 'No availability.');
            setStatus('bad', 'Unavailable');
            return;
          }

          renderSlots(res.slots || []);
          setStatus('good', 'Slots loaded');
        })
        .withFailureHandler((err) => {
          if (!isSilentRefresh) hideLoading();
          renderSlots([]);
          showHint(els.timeHint, 'bad', String(err && err.message ? err.message : err));
          setStatus('bad', 'Error loading slots');
        })
        .apiGetAvailability(state.selectedDateKey);
    }

    els.confirmBtn.addEventListener('click', () => {
      hideMsg();
      const err = validateForm();
      if (err) {
        showMsg('bad', err);
        setStatus('bad', 'Missing fields');
        return;
      }

      showLoading('Confirming appointment…', 'Sending confirmation email and reserving your slot.');
      setStatus('good', 'Booking…');

      const payload = {
        serviceId: state.selectedServiceId,
        dateKey: state.selectedDateKey,
        startTime: state.selectedSlot.start,
        fullName: els.fullName.value.trim(),
        email: els.email.value.trim(),
        phone: getFullPhone(),
        comments: els.comments.value.trim()
      };

      google.script.run
        .withSuccessHandler((res) => {
          hideLoading();

          if (res && res.ok) {
            const text =
              \`Your appointment has been confirmed.\\n\\n\` +
              \`Service: \${res.serviceName}\\n\` +
              \`Date: \${state.selectedDateLabel}\\n\` +
              \`Time: \${to12h(res.startTime)} - \${to12h(res.endTime)}\\n\` +
              \`Location: \${res.location}\\n\\n\` +
              \`A confirmation email has been sent. You can cancel from the link in that email.\`;

            showConfirmModal(text);
            return;
          }

          showMsg('bad', 'Could not book. Please try again.');
          setStatus('bad', 'Booking failed');
          loadAvailability(false);
        })
        .withFailureHandler((e) => {
          hideLoading();
          const msg = (e && e.message) ? e.message : String(e);
          showMsg('bad', msg);
          setStatus('bad', 'Booking error');
          loadAvailability(false);
        })
        .apiBook(payload);
    });

    // Auto-refresh (keeps page accurate if someone else books online)
    function installAutoRefresh() {
      setInterval(() => {
        if (state.selectedDateKey) loadAvailability(true);
      }, 20000);

      window.addEventListener('focus', () => {
        if (state.selectedDateKey) loadAvailability(true);
      });

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && state.selectedDateKey) loadAvailability(true);
      });
    }

    function init() {
      showLoading('Loading booking page…', 'Please wait while we prepare the booking system.');

      google.script.run
        .withSuccessHandler((data) => {
          hideLoading();

          state.config = data.config;
          state.dateOptions = data.dateOptions || [];

          els.docName.textContent = state.config.doctorName;
          els.docMeta.textContent = state.config.pottersLocation;
          els.tzMeta.textContent = 'Time zone: ' + state.config.timezone;

          els.sumLoc.textContent = \`Location: \${state.config.pottersLocation}\`;

          renderServices();
          renderDates();

          if (state.selectedDateKey) {
            setStatus('good', 'Loading slots…');
            loadAvailability(false);
          } else {
            setStatus('bad', 'No dates available');
          }

          installAutoRefresh();
        })
        .withFailureHandler((e) => {
          hideLoading();
          showMsg('bad', 'Error loading app: ' + (e && e.message ? e.message : e));
          setStatus('bad', 'Load error');
        })
        .apiInit();
    }

    init();
  </script>
</body>
</html>
`,
    Cancel: `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Cancel Appointment</title>

  <style>
    :root{
      --bg:#f6f7fb;
      --card:#ffffff;
      --muted:#6b7280;
      --text:#111827;
      --line:#e5e7eb;
      --bad:#ef4444;
      --good:#10b981;
      --shadow: 0 10px 30px rgba(17,24,39,0.08);
      --radius: 18px;
    }
    *{box-sizing:border-box;}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: var(--bg);
      color: var(--text);
    }
    .wrap{
      max-width: 720px;
      margin: 18px auto;
      padding: 0 14px 30px 14px;
    }
    .card{
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid rgba(229,231,235,0.9);
      padding: 18px;
    }
    h1{
      margin:0 0 10px 0;
      font-size: 18px;
      font-weight: 900;
    }
    p{
      margin:0 0 12px 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
    .row{
      margin-top: 10px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid var(--line);
      background:#fff;
      font-size: 13px;
      line-height: 1.45;
    }
    .row b{color: var(--text);}
    .btnRow{
      display:flex;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .btn{
      border:none;
      border-radius: 999px;
      padding: 10px 16px;
      font-weight: 750;
      cursor: pointer;
      background: #111827;
      color: #fff;
      box-shadow: 0 8px 18px rgba(0,0,0,0.12);
    }
    .btnDanger{
      background: var(--bad);
    }
    .btnGhost{
      background: transparent;
      color: var(--text);
      border: 1px solid var(--line);
      box-shadow:none;
    }
    .msg{
      margin-top: 12px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      font-size: 13px;
      line-height: 1.4;
      display:none;
    }
    .msg.good{border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.06);}
    .msg.bad{border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.06);}

    .overlay{
      position:fixed;
      inset:0;
      background: rgba(17,24,39,0.55);
      display:none;
      align-items:center;
      justify-content:center;
      padding: 14px;
      z-index: 2000;
    }
    .loadingBox{
      width: min(520px, 100%);
      background:#fff;
      border-radius: 18px;
      padding: 18px;
      border:1px solid var(--line);
      box-shadow: var(--shadow);
      display:flex;
      gap: 14px;
      align-items:center;
    }
    .spinner{
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 4px solid #e5e7eb;
      border-top-color: #111827;
      animation: spin 0.9s linear infinite;
      flex: 0 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loadingText h4{ margin:0 0 4px 0; font-size: 14px; }
    .loadingText div{ margin:0; color: var(--muted); font-size: 12.5px; line-height: 1.35; }
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
    const TOKEN = "<?= token ?>";
    const SIG = "<?= sig ?>";

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
    function hideLoading(){
      loadingOverlay.style.display = 'none';
    }

    function showMsg(type, text){
      msg.style.display = 'block';
      msg.classList.remove('good','bad');
      if (type === 'good') msg.classList.add('good');
      if (type === 'bad') msg.classList.add('bad');
      msg.textContent = text;
    }

    function formatTime(hhmm){
      const [hh, mm] = hhmm.split(':').map(n => parseInt(n,10));
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const h = (hh % 12) === 0 ? 12 : (hh % 12);
      return \`\${h}:\${String(mm).padStart(2,'0')} \${ampm}\`;
    }

    function loadInfo(){
      showLoading('Loading appointment…', 'Please wait while we load your appointment details.');

      google.script.run
        .withSuccessHandler((res) => {
          hideLoading();

          if (!res || !res.ok) {
            showMsg('bad', (res && res.reason) ? res.reason : 'Unable to load appointment.');
            btnCancel.disabled = true;
            return;
          }

          const a = res.appointment;
          apptBox.style.display = 'block';
          apptBox.innerHTML =
            \`<div><b>Service:</b> \${a.serviceName}</div>\` +
            \`<div><b>Date:</b> \${a.dateKey}</div>\` +
            \`<div><b>Time:</b> \${formatTime(a.startTime)} - \${formatTime(a.endTime)}</div>\` +
            \`<div><b>Location:</b> \${a.location}</div>\` +
            \`<div style="margin-top:8px;color:#6b7280;"><b>Status:</b> \${a.status}</div>\`;
        })
        .withFailureHandler((err) => {
          hideLoading();
          showMsg('bad', 'Error loading appointment: ' + (err && err.message ? err.message : String(err)));
          btnCancel.disabled = true;
        })
        .apiGetCancelInfo(TOKEN, SIG);
    }

    btnCancel.addEventListener('click', () => {
      btnCancel.disabled = true;
      showLoading('Cancelling…', 'Please wait while we cancel your appointment.');

      google.script.run
        .withSuccessHandler((res) => {
          hideLoading();

          if (!res || !res.ok) {
            showMsg('bad', (res && res.reason) ? res.reason : 'Could not cancel.');
            btnCancel.disabled = false;
            return;
          }

          if (res.alreadyCancelled) {
            showMsg('good', 'This appointment was already cancelled.');
          } else {
            showMsg('good', 'Appointment cancelled successfully.');
          }

          // Prevent re-cancel attempts
          btnCancel.disabled = true;
        })
        .withFailureHandler((err) => {
          hideLoading();
          showMsg('bad', 'Cancel failed: ' + (err && err.message ? err.message : String(err)));
          btnCancel.disabled = false;
        })
        .apiCancelAppointment(TOKEN, SIG);
    });

    btnClose.addEventListener('click', () => {
      try { window.close(); } catch(e) {}
      // fallback if browser blocks close:
      window.location.href = "about:blank";
    });

    loadInfo();
  </script>
</body>
</html>
`,
    DocAction: `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Doctor Action</title>

  <style>
    :root{
      --bg:#f6f7fb;
      --card:#ffffff;
      --muted:#6b7280;
      --text:#111827;
      --line:#e5e7eb;
      --good:#10b981;
      --bad:#b00020;
      --shadow: 0 10px 30px rgba(17,24,39,0.08);
      --radius: 18px;
    }
    *{box-sizing:border-box;}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: var(--bg);
      color: var(--text);
    }
    .wrap{
      max-width: 760px;
      margin: 18px auto;
      padding: 0 14px 30px 14px;
    }
    .card{
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid rgba(229,231,235,0.9);
      padding: 18px;
    }
    h1{
      margin:0 0 10px 0;
      font-size: 18px;
    }
    p{
      margin: 0 0 12px 0;
      color: var(--muted);
      line-height: 1.45;
      font-size: 13.5px;
    }
    .btn{
      border:none;
      border-radius: 999px;
      padding: 12px 16px;
      font-weight: 800;
      cursor: pointer;
      background: #111827;
      color:#fff;
    }
    .btnDanger{background: var(--bad);}
    .btnGood{background: var(--good); color:#052e1a;}
    .msg{
      margin-top: 12px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid var(--line);
      background:#fff;
      color: var(--text);
      font-size: 13px;
      line-height: 1.4;
      display:none;
    }
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
    const token = "<?= token ?>";
    const sig = "<?= sig ?>";
    const act = "<?= act ?>";

    const title = document.getElementById('title');
    const desc = document.getElementById('desc');
    const btn = document.getElementById('actBtn');
    const msg = document.getElementById('msg');

    function show(text){
      msg.style.display = 'block';
      msg.textContent = text;
    }

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

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Processing…';

      google.script.run
        .withSuccessHandler((res) => {
          if (res && res.ok) {
            show(res.message || 'Done.');
            btn.textContent = 'Completed';
          } else {
            show('Could not complete action.');
            btn.disabled = false;
          }
        })
        .withFailureHandler((e) => {
          show((e && e.message) ? e.message : String(e));
          btn.disabled = false;
          btn.textContent = (act === 'cancel') ? 'Confirm cancellation' : 'Confirm redirect';
        })
        .apiDoctorAction(token, act, sig);
    });
  </script>
</body>
</html>
`,
    Admin: `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Admin Panel</title>
  <style>
    :root{--bg:#f6f7fb;--card:#fff;--muted:#6b7280;--text:#111827;--line:#e5e7eb;--bad:#ef4444;--good:#10b981;--blue:#2563eb;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:900px;margin:0 auto;padding:14px 14px 40px;}
    h1{margin:0 0 6px;font-size:20px;font-weight:900;}
    h2{margin:18px 0 8px;font-size:16px;font-weight:800;}
    h3{margin:14px 0 6px;font-size:14px;font-weight:700;}
    .subtitle{color:var(--muted);font-size:13px;margin:0 0 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:16px;margin-bottom:14px;}
    .stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
    .stat{background:var(--card);border-radius:14px;border:1px solid var(--line);padding:12px 16px;flex:1;min-width:120px;text-align:center;}
    .stat .num{font-size:28px;font-weight:900;}
    .stat .label{font-size:12px;color:var(--muted);}
    table{border-collapse:collapse;width:100%;font-size:13px;}
    th{text-align:left;padding:8px;border-bottom:2px solid var(--line);font-size:12px;color:var(--muted);font-weight:600;}
    td{padding:8px;border-bottom:1px solid var(--line);}
    .btn{border:none;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;}
    .btn-sm{padding:5px 10px;font-size:11px;}
    .btn-dark{background:#111827;color:#fff;}
    .btn-danger{background:var(--bad);color:#fff;}
    .btn-good{background:var(--good);color:#052e1a;}
    .btn-blue{background:var(--blue);color:#fff;}
    .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--line);}
    .btn:disabled{opacity:0.5;cursor:not-allowed;}
    input,select,textarea{font-family:inherit;font-size:13px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;outline:none;width:100%;}
    input:focus,select:focus,textarea:focus{border-color:var(--blue);}
    .form-row{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;align-items:end;}
    .form-group{flex:1;min-width:120px;}
    .form-group label{display:block;font-size:11px;color:var(--muted);margin-bottom:3px;font-weight:600;}
    .msg{margin-top:8px;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.4;display:none;}
    .msg.good{display:block;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);color:#065f46;}
    .msg.bad{display:block;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);color:#991b1b;}
    .tabs{display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap;}
    .tab{padding:8px 14px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:600;background:transparent;border:1px solid var(--line);color:var(--muted);}
    .tab.active{background:#111827;color:#fff;border-color:#111827;}
    .empty{padding:16px;text-align:center;color:var(--muted);font-size:13px;}
    .appt-row{display:flex;align-items:center;gap:8px;}
    .appt-row input[type=checkbox]{width:auto;margin:0;}
    .action-bar{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap;align-items:center;}
    .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.55);display:none;align-items:center;justify-content:center;padding:14px;z-index:2000;}
    .loadingBox{width:min(520px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;gap:14px;align-items:center;}
    .spinner{width:34px;height:34px;border-radius:999px;border:4px solid #e5e7eb;border-top-color:#111827;animation:spin 0.9s linear infinite;flex:0 0 auto;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .loadingText h4{margin:0 0 4px;font-size:14px;}
    .loadingText div{margin:0;color:var(--muted);font-size:12.5px;line-height:1.35;}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge-red{background:rgba(239,68,68,0.1);color:#dc2626;}
    .badge-green{background:rgba(16,185,129,0.1);color:#059669;}
  </style>
</head>
<body>
<div class="wrap">
  <h1>Admin Panel</h1>
  <p class="subtitle">Dr Kevin Navarro Gera - Appointment Management</p>

  <div class="stats" id="statsBar">
    <div class="stat"><div class="num" id="statBooked">-</div><div class="label">Booked this week</div></div>
    <div class="stat"><div class="num" id="statCancelled">-</div><div class="label">Cancelled this week</div></div>
    <div class="stat"><div class="num" id="statToday">-</div><div class="label">Today</div></div>
    <div class="stat"><div class="num" id="statTomorrow">-</div><div class="label">Tomorrow</div></div>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="schedule" onclick="switchTab('schedule')">Schedule</div>
    <div class="tab" data-tab="doctoroff" onclick="switchTab('doctoroff')">Doctor Off</div>
    <div class="tab" data-tab="extraslots" onclick="switchTab('extraslots')">Extra Slots</div>
    <div class="tab" data-tab="actions" onclick="switchTab('actions')">Quick Actions</div>
  </div>

  <!-- SCHEDULE TAB -->
  <div class="tab-content" id="tab-schedule">
    <div class="card">
      <h3 id="todayHeader">Today's Appointments</h3>
      <div id="todayTable"></div>
    </div>
    <div class="card">
      <h3 id="tomorrowHeader">Tomorrow's Appointments</h3>
      <div id="tomorrowTable"></div>
    </div>
  </div>

  <!-- DOCTOR OFF TAB -->
  <div class="tab-content" id="tab-doctoroff" style="display:none;">
    <div class="card">
      <h3>Mark Doctor Unavailable</h3>
      <div class="form-row">
        <div class="form-group"><label>Start Date</label><input type="date" id="offStartDate"></div>
        <div class="form-group"><label>End Date (optional)</label><input type="date" id="offEndDate"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Start Time (optional)</label><input type="time" id="offStartTime"></div>
        <div class="form-group"><label>End Time (optional)</label><input type="time" id="offEndTime"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Reason</label><input type="text" id="offReason" placeholder="e.g. Personal leave, Conference"></div>
      </div>
      <button class="btn btn-danger" onclick="markDoctorOff()">Mark Unavailable</button>
      <div class="msg" id="offMsg"></div>
    </div>

    <div class="card">
      <h3>Current Doctor-Off Entries</h3>
      <div id="offEntriesTable"></div>
    </div>
  </div>

  <!-- EXTRA SLOTS TAB -->
  <div class="tab-content" id="tab-extraslots" style="display:none;">
    <div class="card">
      <h3>Add Extra Working Hours</h3>
      <p class="subtitle">Doctor wants to work extra? Add additional time slots here.</p>
      <div class="form-row">
        <div class="form-group"><label>Date</label><input type="date" id="extraDate"></div>
        <div class="form-group"><label>Start Time</label><input type="time" id="extraStartTime"></div>
        <div class="form-group"><label>End Time</label><input type="time" id="extraEndTime"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Reason (optional)</label><input type="text" id="extraReason" placeholder="e.g. Extra clinic hours"></div>
      </div>
      <button class="btn btn-good" onclick="addExtraSlots()">Add Extra Slots</button>
      <div class="msg" id="extraMsg"></div>
    </div>

    <div class="card">
      <h3>Current Extra Slot Entries</h3>
      <div id="extraEntriesTable"></div>
    </div>
  </div>

  <!-- QUICK ACTIONS TAB -->
  <div class="tab-content" id="tab-actions" style="display:none;">
    <div class="card">
      <h3>Cancel / Redirect / Push Appointments</h3>
      <p class="subtitle">Select a date to see appointments, then choose what to do with them.</p>
      <div class="form-row">
        <div class="form-group"><label>Date</label><input type="date" id="actionDate" onchange="loadActionAppts()"></div>
      </div>
      <div id="actionApptsList"></div>

      <div class="action-bar" id="actionBar" style="display:none;">
        <button class="btn btn-danger" onclick="processAction('cancel')">Cancel Selected</button>
        <button class="btn btn-blue" onclick="processAction('redirect_spinola')">Redirect to Spinola</button>
        <button class="btn btn-good" onclick="processAction('push_next_day')">Push to Next Day</button>
      </div>

      <div class="form-row" id="customMsgRow" style="display:none;margin-top:8px;">
        <div class="form-group"><label>Custom message for patients (optional)</label><textarea id="customMsg" rows="2" placeholder="Leave blank for default message"></textarea></div>
      </div>

      <div class="msg" id="actionMsg"></div>
    </div>

    <div class="card">
      <h3>Send Notification to Patients</h3>
      <p class="subtitle">Send a custom message to patients with appointments on a specific date.</p>
      <div class="form-row">
        <div class="form-group"><label>Date</label><input type="date" id="notifyDate" onchange="loadNotifyAppts()"></div>
      </div>
      <div id="notifyApptsList"></div>
      <div class="form-row" id="notifyMsgRow" style="display:none;">
        <div class="form-group"><label>Message</label><textarea id="notifyMsg" rows="3" placeholder="Type your message to patients..."></textarea></div>
      </div>
      <button class="btn btn-blue" id="notifyBtn" style="display:none;" onclick="sendNotification()">Send Notification</button>
      <div class="msg" id="notifyResultMsg"></div>
    </div>
  </div>
</div>

<div class="overlay" id="loadingOverlay">
  <div class="loadingBox">
    <div class="spinner"></div>
    <div class="loadingText">
      <h4 id="loadingTitle">Loading...</h4>
      <div id="loadingDesc">Please wait.</div>
    </div>
  </div>
</div>

<script>
const SIG = "<?= adminSig ?>";

function showLoading(title, desc) {
  document.getElementById('loadingTitle').textContent = title || 'Loading...';
  document.getElementById('loadingDesc').textContent = desc || 'Please wait.';
  document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

function showMsg(id, type, text) {
  var el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = text;
}

function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
}

function renderApptTable(appts, containerId, withCheckboxes) {
  var el = document.getElementById(containerId);
  if (!appts || !appts.length) {
    el.innerHTML = '<div class="empty">No appointments.</div>';
    return;
  }
  var html = '<table><thead><tr>';
  if (withCheckboxes) html += '<th><input type="checkbox" onchange="toggleAll(this, \\'' + containerId + '\\')"></th>';
  html += '<th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th></tr></thead><tbody>';
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var statusBadge = a.status === 'RELOCATED_SPINOLA'
      ? '<span class="badge badge-green">Spinola</span>'
      : '<span class="badge badge-green">Booked</span>';
    html += '<tr>';
    if (withCheckboxes) html += '<td><input type="checkbox" class="appt-cb" value="' + esc(a.appointmentId) + '"></td>';
    html += '<td><b>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</b></td>';
    html += '<td>' + esc(a.fullName) + '</td>';
    html += '<td>' + esc(a.phone) + '</td>';
    html += '<td>' + esc(a.serviceName) + '</td>';
    html += '<td>' + esc(a.location) + '</td>';
    html += '<td>' + statusBadge + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderOffEntries(entries) {
  var el = document.getElementById('offEntriesTable');
  if (!entries || !entries.length) {
    el.innerHTML = '<div class="empty">No doctor-off entries.</div>';
    return;
  }
  var html = '<table><thead><tr><th>Start Date</th><th>End Date</th><th>Start Time</th><th>End Time</th><th>Reason</th><th></th></tr></thead><tbody>';
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    html += '<tr>';
    html += '<td>' + esc(e.startDate) + '</td>';
    html += '<td>' + esc(e.endDate) + '</td>';
    html += '<td>' + (e.startTime || '<span style="color:#6b7280">All day</span>') + '</td>';
    html += '<td>' + (e.endTime || '') + '</td>';
    html += '<td>' + esc(e.reason) + '</td>';
    html += '<td><button class="btn btn-sm btn-ghost" onclick="removeDoctorOff(' + e.rowIndex + ')">Remove</button></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderExtraEntries(entries) {
  var el = document.getElementById('extraEntriesTable');
  if (!entries || !entries.length) {
    el.innerHTML = '<div class="empty">No extra slot entries.</div>';
    return;
  }
  var html = '<table><thead><tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Reason</th><th></th></tr></thead><tbody>';
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    html += '<tr>';
    html += '<td>' + esc(e.date) + '</td>';
    html += '<td>' + esc(e.startTime) + '</td>';
    html += '<td>' + esc(e.endTime) + '</td>';
    html += '<td>' + esc(e.reason) + '</td>';
    html += '<td><button class="btn btn-sm btn-ghost" onclick="removeExtraSlots(' + e.rowIndex + ')">Remove</button></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleAll(masterCb, containerId) {
  var cbs = document.getElementById(containerId).querySelectorAll('.appt-cb');
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = masterCb.checked;
}

function getSelectedIds(containerId) {
  var cbs = document.getElementById(containerId).querySelectorAll('.appt-cb:checked');
  var ids = [];
  for (var i = 0; i < cbs.length; i++) ids.push(cbs[i].value);
  return ids;
}

// ========== Load Dashboard ==========

function loadDashboard() {
  showLoading('Loading dashboard...', 'Fetching appointment data.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { alert('Failed to load dashboard.'); return; }

      document.getElementById('statBooked').textContent = res.stats.weekBooked;
      document.getElementById('statCancelled').textContent = res.stats.weekCancelled;
      document.getElementById('statToday').textContent = res.todayAppointments.length;
      document.getElementById('statTomorrow').textContent = res.tomorrowAppointments.length;

      document.getElementById('todayHeader').textContent = "Today's Appointments (" + res.todayKey + ')';
      document.getElementById('tomorrowHeader').textContent = "Tomorrow's Appointments (" + res.tomorrowKey + ')';

      renderApptTable(res.todayAppointments, 'todayTable', false);
      renderApptTable(res.tomorrowAppointments, 'tomorrowTable', false);
      renderOffEntries(res.doctorOffEntries);
      renderExtraEntries(res.extraSlotEntries);

      // Set default dates
      document.getElementById('offStartDate').value = res.todayKey;
      document.getElementById('extraDate').value = res.todayKey;
      document.getElementById('actionDate').value = res.todayKey;
      document.getElementById('notifyDate').value = res.todayKey;
    })
    .withFailureHandler(function(err) {
      hideLoading();
      alert('Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetDashboard(SIG);
}

// ========== Doctor Off ==========

function markDoctorOff() {
  var startDate = document.getElementById('offStartDate').value;
  var endDate = document.getElementById('offEndDate').value;
  var startTime = document.getElementById('offStartTime').value;
  var endTime = document.getElementById('offEndTime').value;
  var reason = document.getElementById('offReason').value;

  if (!startDate) { showMsg('offMsg', 'bad', 'Please select a start date.'); return; }

  showLoading('Marking unavailable...', 'Adding doctor-off entry.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('offMsg', 'bad', res.reason || 'Failed.'); return; }

      var msg = 'Doctor marked as unavailable.';
      if (res.affectedAppointments && res.affectedAppointments.length > 0) {
        msg += ' ' + res.affectedAppointments.length + ' appointment(s) affected. Go to Quick Actions to process them.';
      }
      showMsg('offMsg', 'good', msg);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('offMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminMarkDoctorOff(SIG, {
      startDate: startDate,
      endDate: endDate || startDate,
      startTime: startTime,
      endTime: endTime,
      reason: reason || 'Doctor not available'
    });
}

function removeDoctorOff(rowIndex) {
  if (!confirm('Remove this doctor-off entry? This will re-open those slots for booking.')) return;
  showLoading('Removing...', 'Removing doctor-off entry.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { alert(res.reason || 'Failed.'); return; }
      loadDashboard();
    })
    .withFailureHandler(function(err) { hideLoading(); alert('Error: ' + (err && err.message ? err.message : String(err))); })
    .apiAdminRemoveDoctorOff(SIG, rowIndex);
}

// ========== Extra Slots ==========

function addExtraSlots() {
  var date = document.getElementById('extraDate').value;
  var startTime = document.getElementById('extraStartTime').value;
  var endTime = document.getElementById('extraEndTime').value;
  var reason = document.getElementById('extraReason').value;

  if (!date) { showMsg('extraMsg', 'bad', 'Please select a date.'); return; }
  if (!startTime) { showMsg('extraMsg', 'bad', 'Please select a start time.'); return; }
  if (!endTime) { showMsg('extraMsg', 'bad', 'Please select an end time.'); return; }

  showLoading('Adding extra slots...', 'Adding extra working hours.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('extraMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('extraMsg', 'good', res.message);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('extraMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminAddExtraSlots(SIG, { date: date, startTime: startTime, endTime: endTime, reason: reason });
}

function removeExtraSlots(rowIndex) {
  if (!confirm('Remove this extra slots entry?')) return;
  showLoading('Removing...', 'Removing extra slots entry.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { alert(res.reason || 'Failed.'); return; }
      loadDashboard();
    })
    .withFailureHandler(function(err) { hideLoading(); alert('Error: ' + (err && err.message ? err.message : String(err))); })
    .apiAdminRemoveExtraSlots(SIG, rowIndex);
}

// ========== Quick Actions ==========

function loadActionAppts() {
  var dateKey = document.getElementById('actionDate').value;
  if (!dateKey) return;

  document.getElementById('actionApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('actionBar').style.display = 'none';
  document.getElementById('customMsgRow').style.display = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('actionApptsList').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'actionApptsList', true);
      if (res.appointments && res.appointments.length > 0) {
        document.getElementById('actionBar').style.display = 'flex';
        document.getElementById('customMsgRow').style.display = 'flex';
      }
    })
    .withFailureHandler(function(err) {
      document.getElementById('actionApptsList').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, dateKey);
}

function processAction(action) {
  var dateKey = document.getElementById('actionDate').value;
  var ids = getSelectedIds('actionApptsList');
  var customMsg = document.getElementById('customMsg').value;

  if (!dateKey) { showMsg('actionMsg', 'bad', 'Select a date first.'); return; }

  var actionLabel = action === 'cancel' ? 'CANCEL' : action === 'redirect_spinola' ? 'REDIRECT TO SPINOLA' : 'PUSH TO NEXT DAY';
  var target = ids.length > 0 ? ids.length + ' selected appointment(s)' : 'ALL appointments';
  if (!confirm('Are you sure you want to ' + actionLabel + ' ' + target + ' on ' + dateKey + '?')) return;

  showLoading('Processing...', 'Applying ' + actionLabel.toLowerCase() + ' to appointments.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('actionMsg', 'bad', res.reason || 'Failed.'); return; }

      var msg = res.message;
      if (res.results) {
        var details = [];
        for (var i = 0; i < res.results.length; i++) {
          var r = res.results[i];
          var d = r.patient + ': ' + r.action;
          if (r.newDate) d += ' -> ' + r.newDate + ' ' + r.newTime;
          details.push(d);
        }
        if (details.length) msg += '\\n' + details.join('\\n');
      }
      showMsg('actionMsg', 'good', msg);
      loadActionAppts();
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('actionMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminProcessAppointments(SIG, {
      dateKey: dateKey,
      action: action,
      appointmentIds: ids,
      customMessage: customMsg
    });
}

// ========== Notifications ==========

function loadNotifyAppts() {
  var dateKey = document.getElementById('notifyDate').value;
  if (!dateKey) return;

  document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('notifyMsgRow').style.display = 'none';
  document.getElementById('notifyBtn').style.display = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('notifyApptsList').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'notifyApptsList', true);
      if (res.appointments && res.appointments.length > 0) {
        document.getElementById('notifyMsgRow').style.display = 'flex';
        document.getElementById('notifyBtn').style.display = 'inline-flex';
      }
    })
    .withFailureHandler(function(err) {
      document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, dateKey);
}

function sendNotification() {
  var dateKey = document.getElementById('notifyDate').value;
  var ids = getSelectedIds('notifyApptsList');
  var message = document.getElementById('notifyMsg').value;

  if (!dateKey) { showMsg('notifyResultMsg', 'bad', 'Select a date first.'); return; }
  if (!ids.length) { showMsg('notifyResultMsg', 'bad', 'Select at least one patient.'); return; }
  if (!message.trim()) { showMsg('notifyResultMsg', 'bad', 'Please type a message.'); return; }

  showLoading('Sending...', 'Sending notification to ' + ids.length + ' patient(s).');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('notifyResultMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('notifyResultMsg', 'good', res.message);
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('notifyResultMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminNotifyPatients(SIG, {
      dateKey: dateKey,
      appointmentIds: ids,
      message: message
    });
}

// ========== Init ==========
loadDashboard();
</script>
</body>
</html>
`
};

var _BUNDLE = (function() {

// ===== Config.gs =====
/***************
 * Config.gs
 ***************/

var _cfgCache = null;
var _propsCache = null;
var _tzCache = null;

function CFG() {
  if (_cfgCache) return _cfgCache;
  _cfgCache = {
    // Script Properties keys
    PROP_CONFIG_SSID: 'CONFIG_SPREADSHEET_ID',
    PROP_APPTS_SSID: 'APPOINTMENTS_SPREADSHEET_ID',
    PROP_DOCTOR_EMAIL: 'DOCTOR_EMAIL',
    PROP_WEBAPP_URL: 'WEBAPP_URL',
    PROP_SECRET: 'SIGNING_SECRET',
    PROP_ADMIN_SECRET: 'ADMIN_SECRET',
    PROP_TIMEZONE: 'TIMEZONE',
    PROP_POTTERS_LOCATION: 'POTTERS_LOCATION',
    PROP_SPINOLA_LOCATION: 'SPINOLA_LOCATION',
    PROP_CALENDAR_ID: 'KEVINAPPTS_CALENDAR_ID',
    PROP_DOUBLECHECK_CALENDAR: 'DOUBLECHECK_CALENDAR',
    PROP_MAX_ACTIVE_APPTS_PER_PERSON: 'MAX_ACTIVE_APPTS_PER_PERSON',

    // Sheet names
    SHEET_CLIENTS: 'Clients',
    SHEET_DOCTOR_OFF: 'DoctorOff',
    SHEET_DOCTOR_EXTRA: 'DoctorExtra',

    // Appointment day sheet format
    APPT_SHEET_DATE_FORMAT: 'yyyy-MM-dd',

    // Appointment settings
    APPT_DURATION_MIN: 10,
    ADVANCE_DAYS: 7,

    // Services
    SERVICES: [
      { id: 'clinic', name: 'Clinic Consultation', minutes: 10 }
    ],

    // Working hours
    HOURS: {
      MON: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      TUE: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      WED: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      THU: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      FRI: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      SAT: [{ start: '10:00', end: '12:00' }],
      SUN: []
    }
  };
  return _cfgCache;
}

function getScriptProps_() {
  if (_propsCache) return _propsCache;
  _propsCache = PropertiesService.getScriptProperties();
  return _propsCache;
}

function getTimeZone_() {
  if (_tzCache) return _tzCache;
  var props = getScriptProps_();
  _tzCache = props.getProperty(CFG().PROP_TIMEZONE) || Session.getScriptTimeZone() || 'Europe/Malta';
  return _tzCache;
}

function getOrCreateSigningSecret_() {
  var props = getScriptProps_();
  var s = props.getProperty(CFG().PROP_SECRET);
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(CFG().PROP_SECRET, s);
  }
  return s;
}

function getOrCreateAdminSecret_() {
  var props = getScriptProps_();
  var s = props.getProperty(CFG().PROP_ADMIN_SECRET);
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(CFG().PROP_ADMIN_SECRET, s);
  }
  return s;
}

// ===== Utils.gs =====
/***************
 * Utils.gs
 ***************/

function pad2_(n) {
  n = String(n);
  return n.length === 1 ? '0' + n : n;
}

function toDateKey_(dateObj) {
  return Utilities.formatDate(dateObj, getTimeZone_(), CFG().APPT_SHEET_DATE_FORMAT);
}

function parseDateKey_(dateKey) {
  var parts = dateKey.split('-');
  if (parts.length !== 3) throw new Error('Invalid dateKey: ' + dateKey);
  var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseTimeToMinutes_(hhmm) {
  var p = hhmm.split(':');
  if (p.length !== 2) throw new Error('Invalid time: ' + hhmm);
  return Number(p[0]) * 60 + Number(p[1]);
}

function minutesToTime_(mins) {
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return pad2_(h) + ':' + pad2_(m);
}

function combineDateAndTime_(dateObj, hhmm) {
  var mins = parseTimeToMinutes_(hhmm);
  var d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  d.setMinutes(mins);
  return d;
}

function addMinutes_(dateObj, minutes) {
  return new Date(dateObj.getTime() + minutes * 60000);
}

function dayOfWeekKey_(dateObj) {
  var dow = dateObj.getDay();
  if (dow === 0) return 'SUN';
  if (dow === 1) return 'MON';
  if (dow === 2) return 'TUE';
  if (dow === 3) return 'WED';
  if (dow === 4) return 'THU';
  if (dow === 5) return 'FRI';
  return 'SAT';
}

function isSunday_(dateObj) {
  return dateObj.getDay() === 0;
}

function todayLocal_() {
  var tz = getTimeZone_();
  var now = new Date();
  var s = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  return parseDateKey_(s);
}

function todayKeyLocal_() {
  return toDateKey_(todayLocal_());
}

function nowMinutesLocal_() {
  var s = Utilities.formatDate(new Date(), getTimeZone_(), 'HH:mm');
  return parseTimeToMinutes_(s);
}

function sanitizePhone_(phone) {
  phone = String(phone || '').trim();
  phone = phone.replace(/\s+/g, ' ');
  return phone;
}

function sanitizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeName_(name) {
  return String(name || '').trim();
}

/**
 * Public holidays / closed days
 */
function isHolidayOrClosed_(dateObj) {
  if (isSunday_(dateObj)) {
    return { closed: true, reason: 'Sunday (Closed)' };
  }

  var y = dateObj.getFullYear();
  var dk = toDateKey_(dateObj);

  var fixed = [
    '01-01', '02-10', '03-19', '03-31', '05-01',
    '06-07', '06-29', '08-15', '09-08', '09-21',
    '12-08', '12-13', '12-25'
  ];

  var mmdd = pad2_(dateObj.getMonth() + 1) + '-' + pad2_(dateObj.getDate());
  if (fixed.indexOf(mmdd) >= 0) {
    return { closed: true, reason: 'Public holiday' };
  }

  var gf = goodFriday_(y);
  if (toDateKey_(gf) === dk) {
    return { closed: true, reason: 'Good Friday' };
  }

  return { closed: false, reason: '' };
}

function easterSunday_(year) {
  var a = year % 19;
  var b = Math.floor(year / 100);
  var c = year % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31);
  var day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function goodFriday_(year) {
  var easter = easterSunday_(year);
  return addMinutes_(easter, -2 * 24 * 60);
}

function inAdvanceWindow_(dateObj) {
  var today = todayLocal_();
  var max = addMinutes_(today, CFG().ADVANCE_DAYS * 24 * 60);
  return dateObj.getTime() >= today.getTime() && dateObj.getTime() <= max.getTime();
}

/**
 * Build slots for a date from normal working hours + optional extra windows.
 * Extra windows come from DoctorExtra sheet (doctor adding more hours).
 */
function buildSlotsForDate_(dateObj, extraWindows) {
  var dowKey = dayOfWeekKey_(dateObj);
  var windows = (CFG().HOURS[dowKey] || []).slice();

  if (extraWindows && extraWindows.length) {
    for (var i = 0; i < extraWindows.length; i++) {
      windows.push(extraWindows[i]);
    }
  }

  windows.sort(function(a, b) {
    return parseTimeToMinutes_(a.start) - parseTimeToMinutes_(b.start);
  });

  var slots = [];
  var dur = CFG().APPT_DURATION_MIN;
  var usedMinutes = {};

  for (var w = 0; w < windows.length; w++) {
    var startMin = parseTimeToMinutes_(windows[w].start);
    var endMin = parseTimeToMinutes_(windows[w].end);

    for (var m = startMin; m + dur <= endMin; m += dur) {
      if (!usedMinutes[m]) {
        usedMinutes[m] = true;
        slots.push({ start: minutesToTime_(m), end: minutesToTime_(m + dur) });
      }
    }
  }

  slots.sort(function(a, b) {
    return parseTimeToMinutes_(a.start) - parseTimeToMinutes_(b.start);
  });

  return slots;
}

/***************
 * Signing helpers for email links
 ***************/

function computeSig_(payloadString) {
  payloadString = String(payloadString || '');
  var secret = getOrCreateSigningSecret_();
  var raw = Utilities.computeHmacSha256Signature(payloadString, secret);
  return Utilities.base64EncodeWebSafe(raw);
}

function safeEqual_(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (a.length !== b.length) return false;
  var res = 0;
  for (var i = 0; i < a.length; i++) {
    res |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return res === 0;
}

function verifyCancelSig_(token, sig) {
  token = String(token || '').trim();
  sig = String(sig || '').trim();
  if (!token || !sig) return false;

  var candidates = [
    token,
    'cancel|' + token,
    'mode=cancel&token=' + token
  ];

  for (var i = 0; i < candidates.length; i++) {
    var expected = computeSig_(candidates[i]);
    if (safeEqual_(expected, sig)) return true;
  }
  return false;
}

function verifyDocActionSig_(token, act, sig) {
  token = String(token || '').trim();
  act = String(act || '').trim();
  sig = String(sig || '').trim();
  if (!token || !act || !sig) return false;

  var candidates = [
    token + '|' + act,
    'docAction|' + token + '|' + act
  ];

  for (var i = 0; i < candidates.length; i++) {
    var expected = computeSig_(candidates[i]);
    if (safeEqual_(expected, sig)) return true;
  }
  return false;
}

/***************
 * Admin signing helpers
 ***************/

function computeAdminSig_() {
  var secret = getOrCreateAdminSecret_();
  var raw = Utilities.computeHmacSha256Signature('admin_access', secret);
  return Utilities.base64EncodeWebSafe(raw);
}

function verifyAdminSig_(sig) {
  sig = String(sig || '').trim();
  if (!sig) return false;
  var expected = computeAdminSig_();
  return safeEqual_(expected, sig);
}

function buildAdminLink_() {
  var base = getWebAppUrl_();
  var sig = computeAdminSig_();
  return base + '?mode=admin&sig=' + encodeURIComponent(sig);
}

function getWebAppUrl_() {
  var props = getScriptProps_();
  var url = String(props.getProperty(CFG().PROP_WEBAPP_URL) || '').trim();

  if (!url) {
    try {
      var auto = ScriptApp.getService().getUrl();
      auto = String(auto || '').trim();
      if (auto) {
        props.setProperty(CFG().PROP_WEBAPP_URL, auto);
        url = auto;
      }
    } catch (e) {}
  }

  if (!url) {
    throw new Error(
      'WEBAPP_URL not set. Deploy as Web app (not test) and then run setWebAppUrlAuto() or set it in Script Properties.'
    );
  }

  return url;
}

// ===== Data.gs =====
/***************
 * Data.gs
 ***************/

var _configSsCache = null;
var _apptsSsCache = null;
var _daySheetFormatted = {};

function getConfigSpreadsheet_() {
  if (_configSsCache) return _configSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_CONFIG_SSID);
  if (!id) throw new Error('CONFIG spreadsheet ID not set. Run install().');
  _configSsCache = SpreadsheetApp.openById(id);
  return _configSsCache;
}

function getAppointmentsSpreadsheet_() {
  if (_apptsSsCache) return _apptsSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_APPTS_SSID);
  if (!id) throw new Error('APPOINTMENTS spreadsheet ID not set. Run install().');
  _apptsSsCache = SpreadsheetApp.openById(id);
  return _apptsSsCache;
}

function ensureDaySheet_(dateKey) {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);

  if (!sh) {
    sh = ss.insertSheet(dateKey);
    sh.getRange(1, 1, 1, 18).setValues([[
      'AppointmentId',
      'Date(yyyy-MM-dd)',
      'StartTime',
      'EndTime',
      'ServiceId',
      'ServiceName',
      'FullName',
      'Email',
      'Phone',
      'Comments',
      'Status',
      'Location',
      'CreatedAt',
      'UpdatedAt',
      'Token',
      'CalendarEventId',
      'CancelledAt',
      'CancelReason'
    ]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[dateKey] = true;
  } else if (!_daySheetFormatted[dateKey]) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[dateKey] = true;
  }

  return sh;
}

function getDoctorOffDates_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var values = sh.getRange(2, 1, lastRow - 1, 5).getValues();
  var map = {};

  for (var i = 0; i < values.length; i++) {
    var startKey = normalizeDateKeyCell_(values[i][0]);
    if (!startKey) continue;

    var endKey = normalizeDateKeyCell_(values[i][1]) || startKey;
    var startTimeStr = normalizeTimeCell_(values[i][2]);
    var endTimeStr = normalizeTimeCell_(values[i][3]);
    var reason = String(values[i][4] || '').trim();

    var startDate = parseDateKey_(startKey);
    var endDate = parseDateKey_(endKey);

    if (endDate.getTime() < startDate.getTime()) {
      var tmp = startDate;
      startDate = endDate;
      endDate = tmp;
    }

    var hasTime = !!(String(startTimeStr || '').trim() || String(endTimeStr || '').trim());
    var blockStartMin = 0;
    var blockEndMin = 1440;

    if (hasTime) {
      blockStartMin = startTimeStr ? parseTimeToMinutes_(startTimeStr) : 0;
      blockEndMin = endTimeStr ? parseTimeToMinutes_(endTimeStr) : 1440;

      if (endTimeStr === '00:00' && blockStartMin > 0) {
        blockEndMin = 1440;
      }

      if (blockStartMin < 0) blockStartMin = 0;
      if (blockStartMin > 1440) blockStartMin = 1440;
      if (blockEndMin < 0) blockEndMin = 0;
      if (blockEndMin > 1440) blockEndMin = 1440;

      if (blockEndMin < blockStartMin) {
        var t2 = blockStartMin;
        blockStartMin = blockEndMin;
        blockEndMin = t2;
      }

      if (blockEndMin === blockStartMin) continue;
    }

    var d = new Date(startDate.getTime());
    while (d.getTime() <= endDate.getTime()) {
      var dk = toDateKey_(d);

      if (!map[dk]) {
        map[dk] = { allDay: false, reason: '', blocks: [], _reasons: [] };
      }

      var entry = map[dk];
      var isAllDay = (!hasTime) || (blockStartMin <= 0 && blockEndMin >= 1440);

      if (isAllDay) {
        entry.allDay = true;
        entry.blocks = [{ startMin: 0, endMin: 1440, reason: reason }];
      } else if (!entry.allDay) {
        entry.blocks.push({ startMin: blockStartMin, endMin: blockEndMin, reason: reason });
      }

      if (reason) entry._reasons.push(reason);
      d = addMinutes_(d, 24 * 60);
    }
  }

  Object.keys(map).forEach(function(dk) {
    var entry = map[dk];
    entry.reason = dedupeJoinReasons_(entry._reasons);
    delete entry._reasons;

    if (entry.blocks && entry.blocks.length > 1) {
      entry.blocks.sort(function(a, b) { return Number(a.startMin) - Number(b.startMin); });
    }
  });

  return map;
}

/**
 * Get raw DoctorOff rows with their sheet row indices (for admin delete).
 */
function getDoctorOffRows_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 5).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var startKey = normalizeDateKeyCell_(values[i][0]);
    if (!startKey) continue;
    rows.push({
      rowIndex: i + 2,
      startDate: startKey,
      endDate: normalizeDateKeyCell_(values[i][1]) || startKey,
      startTime: normalizeTimeCell_(values[i][2]),
      endTime: normalizeTimeCell_(values[i][3]),
      reason: String(values[i][4] || '').trim()
    });
  }
  return rows;
}

/**
 * Read DoctorExtra sheet: extra time windows the doctor has added.
 * Returns map by dateKey => [{start, end}]
 */
function getDoctorExtraSlots_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) return {};

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var values = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  var map = {};

  for (var i = 0; i < values.length; i++) {
    var dk = normalizeDateKeyCell_(values[i][0]);
    if (!dk) continue;

    var startTime = normalizeTimeCell_(values[i][1]);
    var endTime = normalizeTimeCell_(values[i][2]);
    if (!startTime || !endTime) continue;

    if (!map[dk]) map[dk] = [];
    map[dk].push({ start: startTime, end: endTime });
  }

  return map;
}

/**
 * Get raw DoctorExtra rows with their sheet row indices (for admin delete).
 */
function getDoctorExtraRows_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var dk = normalizeDateKeyCell_(values[i][0]);
    if (!dk) continue;
    rows.push({
      rowIndex: i + 2,
      date: dk,
      startTime: normalizeTimeCell_(values[i][1]),
      endTime: normalizeTimeCell_(values[i][2]),
      reason: String(values[i][3] || '').trim()
    });
  }
  return rows;
}

function normalizeDateKeyCell_(cell) {
  if (cell === null || cell === undefined) return '';
  if (Object.prototype.toString.call(cell) === '[object Date]' && !isNaN(cell.getTime())) {
    return Utilities.formatDate(cell, getTimeZone_(), 'yyyy-MM-dd');
  }

  var s = String(cell || '').trim();
  if (!s) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  var p = s.split('-');
  if (p.length === 3) {
    var y = String(p[0]).trim();
    var m = String(p[1]).trim();
    var d = String(p[2]).trim();
    if (/^\d{4}$/.test(y) && /^\d{1,2}$/.test(m) && /^\d{1,2}$/.test(d)) {
      return y + '-' + pad2_(Number(m)) + '-' + pad2_(Number(d));
    }
  }

  return '';
}

function normalizeTimeCell_(cell) {
  if (cell === null || cell === undefined) return '';

  if (Object.prototype.toString.call(cell) === '[object Date]' && !isNaN(cell.getTime())) {
    return Utilities.formatDate(cell, getTimeZone_(), 'HH:mm');
  }

  if (typeof cell === 'number' && !isNaN(cell)) {
    var mins = Math.round(cell * 24 * 60);
    if (mins < 0) mins = 0;
    if (mins > 1440) mins = 1440;
    return minutesToTime_(mins);
  }

  var s = String(cell || '').trim();
  if (!s) return '';

  var m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    var hh = Number(m[1]);
    var mm = Number(m[2]);
    if (isNaN(hh) || isNaN(mm)) return '';
    if (hh < 0 || hh > 24) return '';
    if (mm < 0 || mm > 59) return '';
    return pad2_(hh) + ':' + pad2_(mm);
  }

  return '';
}

function dedupeJoinReasons_(reasons) {
  reasons = reasons || [];
  var out = [];
  var seen = {};
  for (var i = 0; i < reasons.length; i++) {
    var r = String(reasons[i] || '').trim();
    if (!r) continue;
    if (!seen[r]) {
      seen[r] = true;
      out.push(r);
    }
  }
  return out.join(' / ');
}


function getOrCreateClient_(fullName, email, phone) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_CLIENTS);
  if (!sh) throw new Error('Clients sheet missing.');

  sh.getRange(1, 1, sh.getMaxRows(), 6).setNumberFormat('@');

  var lastRow = sh.getLastRow();
  var now = new Date();
  var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);
  fullName = sanitizeName_(fullName);

  if (lastRow >= 2) {
    var data = sh.getRange(2, 1, lastRow - 1, 6).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowEmail = String(data[i][2] || '').trim().toLowerCase();
      var rowPhone = String(data[i][3] || '').trim();

      if (email && rowEmail === email) {
        var r = i + 2;
        sh.getRange(r, 2, 1, 3).setValues([[fullName || data[i][1], email || data[i][2], phone || data[i][3]]]);
        sh.getRange(r, 6).setValue(nowStr);
        return { clientId: String(data[i][0]), row: r };
      }

      if (!email && phone && rowPhone === phone) {
        var r2 = i + 2;
        sh.getRange(r2, 2, 1, 3).setValues([[fullName || data[i][1], email || data[i][2], phone || data[i][3]]]);
        sh.getRange(r2, 6).setValue(nowStr);
        return { clientId: String(data[i][0]), row: r2 };
      }
    }
  }

  var clientId = 'C-' + Utilities.getUuid();
  sh.appendRow([clientId, fullName, email, phone, nowStr, nowStr]);
  return { clientId: clientId, row: sh.getLastRow() };
}

function listAppointmentsForDate_(dateKey) {
  var sh = ensureDaySheet_(dateKey);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 18).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    rows.push(appointmentRowToObj_(values[i]));
  }
  return rows;
}

/**
 * List active (BOOKED / RELOCATED_SPINOLA) appointments for a date.
 */
function listActiveAppointmentsForDate_(dateKey) {
  var all = listAppointmentsForDate_(dateKey);
  var active = [];
  for (var i = 0; i < all.length; i++) {
    if (apptIsActive_(all[i])) active.push(all[i]);
  }
  active.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });
  return active;
}

function appointmentRowToObj_(r) {
  return {
    appointmentId: String(r[0] || ''),
    dateKey: String(r[1] || ''),
    startTime: String(r[2] || ''),
    endTime: String(r[3] || ''),
    serviceId: String(r[4] || ''),
    serviceName: String(r[5] || ''),
    fullName: String(r[6] || ''),
    email: String(r[7] || ''),
    phone: String(r[8] || ''),
    comments: String(r[9] || ''),
    status: String(r[10] || ''),
    location: String(r[11] || ''),
    createdAt: String(r[12] || ''),
    updatedAt: String(r[13] || ''),
    token: String(r[14] || ''),
    calendarEventId: String(r[15] || ''),
    cancelledAt: String(r[16] || ''),
    cancelReason: String(r[17] || '')
  };
}

function findAppointmentByToken_(token) {
  token = String(token || '').trim();
  if (!token) return null;

  var today = todayLocal_();
  var ss = getAppointmentsSpreadsheet_();

  // Search -30 to +ADVANCE_DAYS+7 days (narrower than old 241-day window)
  var pastDays = 30;
  var futureDays = CFG().ADVANCE_DAYS + 7;

  for (var i = -pastDays; i <= futureDays; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    var sh = ss.getSheetByName(dk);
    if (!sh) continue;

    var lastRow = sh.getLastRow();
    if (lastRow < 2) continue;

    var vals = sh.getRange(2, 1, lastRow - 1, 18).getValues();
    for (var r = 0; r < vals.length; r++) {
      if (String(vals[r][14] || '') === token) {
        return {
          sheetName: dk,
          rowIndex: r + 2,
          appointment: appointmentRowToObj_(vals[r])
        };
      }
    }
  }

  return null;
}

function updateAppointmentStatus_(sheetName, rowIndex, updates) {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet not found: ' + sheetName);

  if (!_daySheetFormatted[sheetName]) {
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[sheetName] = true;
  }

  var now = new Date();
  var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

  if (updates.status !== undefined) sh.getRange(rowIndex, 11).setValue(updates.status);
  if (updates.location !== undefined) sh.getRange(rowIndex, 12).setValue(updates.location);
  sh.getRange(rowIndex, 14).setValue(nowStr);

  if (updates.calendarEventId !== undefined) sh.getRange(rowIndex, 16).setValue(updates.calendarEventId);
  if (updates.cancelledAt !== undefined) sh.getRange(rowIndex, 17).setValue(updates.cancelledAt);
  if (updates.cancelReason !== undefined) sh.getRange(rowIndex, 18).setValue(updates.cancelReason);
}

function appendAppointment_(dateKey, apptObj) {
  var sh = ensureDaySheet_(dateKey);

  sh.appendRow([
    apptObj.appointmentId,
    apptObj.dateKey,
    apptObj.startTime,
    apptObj.endTime,
    apptObj.serviceId,
    apptObj.serviceName,
    apptObj.fullName,
    apptObj.email,
    apptObj.phone,
    apptObj.comments,
    apptObj.status,
    apptObj.location,
    apptObj.createdAt,
    apptObj.updatedAt,
    apptObj.token,
    apptObj.calendarEventId,
    apptObj.cancelledAt,
    apptObj.cancelReason
  ]);

  return sh.getLastRow();
}

function apptIsActive_(appt) {
  var st = String(appt.status || '').trim();
  return (st === 'BOOKED' || st === 'RELOCATED_SPINOLA');
}

function countActiveAppointmentsInWindow_(email, phone) {
  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);

  if (!email && !phone) return 0;

  var count = 0;
  var today = todayLocal_();
  var ss = getAppointmentsSpreadsheet_();

  for (var i = 0; i <= CFG().ADVANCE_DAYS; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    var sh = ss.getSheetByName(dk);
    if (!sh) continue;

    var lr = sh.getLastRow();
    if (lr < 2) continue;

    var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
    for (var r = 0; r < vals.length; r++) {
      var status = String(vals[r][10] || '');
      if (status !== 'BOOKED' && status !== 'RELOCATED_SPINOLA') continue;

      var e = String(vals[r][7] || '').trim().toLowerCase();
      var p = String(vals[r][8] || '').trim();

      if (email && phone) {
        if (e === email || p === phone) count++;
      } else if (email) {
        if (e === email) count++;
      } else if (phone) {
        if (p === phone) count++;
      }
    }
  }

  return count;
}

function personAlreadyBookedSameSlot_(dateKey, startTime, email, phone) {
  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);

  var appts = listAppointmentsForDate_(dateKey);
  for (var i = 0; i < appts.length; i++) {
    if (!apptIsActive_(appts[i])) continue;
    if (String(appts[i].startTime || '').trim() !== String(startTime || '').trim()) continue;

    var e = String(appts[i].email || '').trim().toLowerCase();
    var p = String(appts[i].phone || '').trim();

    if (email && e === email) return true;
    if (phone && p === phone) return true;
  }
  return false;
}

/**
 * Add a DoctorOff row to the sheet.
 */
function addDoctorOffRow_(startDate, endDate, startTime, endTime, reason) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');
  sh.appendRow([startDate, endDate || startDate, startTime || '', endTime || '', reason || '']);
}

/**
 * Delete a DoctorOff row by sheet row index.
 */
function deleteDoctorOffRow_(rowIndex) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');
  sh.deleteRow(rowIndex);
}

/**
 * Add a DoctorExtra row to the sheet.
 */
function addDoctorExtraRow_(date, startTime, endTime, reason) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) throw new Error('DoctorExtra sheet missing. Run install() again.');
  sh.appendRow([date, startTime, endTime, reason || '']);
}

/**
 * Delete a DoctorExtra row by sheet row index.
 */
function deleteDoctorExtraRow_(rowIndex) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) throw new Error('DoctorExtra sheet missing.');
  sh.deleteRow(rowIndex);
}

/**
 * Find the next available working day after the given date.
 * Skips holidays, Sundays, and full-day doctor-off dates.
 */
function findNextAvailableDay_(afterDateKey, offMap) {
  var d = parseDateKey_(afterDateKey);
  for (var i = 1; i <= 30; i++) {
    d = addMinutes_(d, 24 * 60);
    var dk = toDateKey_(d);
    var holiday = isHolidayOrClosed_(d);
    if (holiday.closed) continue;
    var offEntry = offMap ? offMap[dk] : null;
    if (offEntry && offEntry.allDay) continue;
    // Check if it has working hours
    var slots = buildSlotsForDate_(d);
    if (slots.length > 0) return dk;
  }
  return null;
}

// ===== CalendarService.gs =====
/***************
 * CalendarService.gs
 ***************/

function getKevinCalendar_() {
  var calId = getScriptProps_().getProperty(CFG().PROP_CALENDAR_ID);
  if (!calId) throw new Error('Calendar ID missing. Run install().');
  return CalendarApp.getCalendarById(calId);
}

function createCalendarEvent_(appt) {
  var cal = getKevinCalendar_();
  var dateObj = parseDateKey_(appt.dateKey);

  var start = combineDateAndTime_(dateObj, appt.startTime);
  var end = combineDateAndTime_(dateObj, appt.endTime);

  var title = appt.serviceName + ' - ' + appt.fullName;

  var descLines = [];
  descLines.push('Patient: ' + appt.fullName);
  descLines.push('Email: ' + appt.email);
  descLines.push('Phone: ' + appt.phone);
  if (appt.comments) descLines.push('Comments: ' + appt.comments);
  descLines.push('Status: ' + appt.status);
  descLines.push('Token: ' + appt.token);

  var ev = cal.createEvent(title, start, end, {
    description: descLines.join('\n'),
    location: appt.location
  });

  return ev.getId();
}

function deleteCalendarEvent_(eventId) {
  if (!eventId) return;
  var cal = getKevinCalendar_();
  try {
    var ev = cal.getEventById(eventId);
    if (ev) ev.deleteEvent();
  } catch (e) {}
}

function updateCalendarEventLocation_(eventId, newLocation, newTitleOptional, newDescriptionOptional) {
  if (!eventId) return false;
  var cal = getKevinCalendar_();
  try {
    var ev = cal.getEventById(eventId);
    if (!ev) return false;

    if (newTitleOptional) ev.setTitle(newTitleOptional);
    if (newDescriptionOptional) ev.setDescription(newDescriptionOptional);
    if (newLocation) ev.setLocation(newLocation);

    return true;
  } catch (e) {
    return false;
  }
}

function listCalendarTakenSlots_(dateKey) {
  var cal = getKevinCalendar_();
  var dateObj = parseDateKey_(dateKey);

  var start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  var end = addMinutes_(start, 24 * 60);

  var events = cal.getEvents(start, end);
  var taken = {};

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var st = ev.getStartTime();
    var s = Utilities.formatDate(st, getTimeZone_(), 'HH:mm');
    taken[s] = true;
  }
  return taken;
}

// ===== EmailService.gs =====
/***************
 * EmailService.gs
 ***************/

function buildCancelLink_(token) {
  var base = getWebAppUrl_();
  token = String(token || '').trim();
  var sig = computeSig_('cancel|' + token);
  var url = base + '?mode=cancel'
    + '&token=' + encodeURIComponent(token)
    + '&sig=' + encodeURIComponent(sig);
  return url;
}

function buildDocActionLink_(token, action) {
  var base = getWebAppUrl_();
  token = String(token || '').trim();
  action = String(action || '').trim();
  var sig = computeSig_('docAction|' + token + '|' + action);
  var url = base + '?mode=docaction'
    + '&token=' + encodeURIComponent(token)
    + '&act=' + encodeURIComponent(action)
    + '&sig=' + encodeURIComponent(sig);
  return url;
}

function sendClientConfirmationEmail_(appt) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var cancelUrl = buildCancelLink_(appt.token);

  var subject = 'Appointment Confirmed - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Confirmed</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment has been confirmed.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">'
    + '<p style="margin:0 0 10px 0;color:#111827;"><b>Cancel appointment</b></p>'
    + '<a href="' + cancelUrl + '" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Cancel Appointment</a>'
    + '<p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;">If the button does not work, copy and paste this link into your browser:<br>'
    + '<span style="word-break:break-all;">' + escapeHtml_(cancelUrl) + '</span></p>'
    + '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendDoctorBookingEmail_(appt, dayList) {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var subject = 'New Booking: ' + appt.serviceName + ' - ' + appt.dateKey + ' ' + appt.startTime;

  var active = [];
  for (var i = 0; i < (dayList || []).length; i++) {
    if (apptIsActive_(dayList[i])) {
      active.push(dayList[i]);
    }
  }
  active.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });

  var rowsHtml = '';
  for (var j = 0; j < active.length; j++) {
    var cancelLink = buildDocActionLink_(active[j].token, 'cancel');
    var redirectLink = buildDocActionLink_(active[j].token, 'redirect');
    rowsHtml += ''
      + '<tr>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].startTime) + ' - ' + escapeHtml_(active[j].endTime) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].serviceName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].fullName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].phone) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">'
      + '<a href="' + cancelLink + '" style="color:#ef4444;font-size:12px;">Cancel</a> | '
      + '<a href="' + redirectLink + '" style="color:#10b981;font-size:12px;">Spinola</a>'
      + '</td>'
      + '</tr>';
  }

  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No active appointments found.</td></tr>';
  }

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">New Appointment Booked</h2>'
    + '<table style="border-collapse:collapse;width:100%;max-width:620px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.fullName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.phone) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.email) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<h3 style="margin:16px 0 8px 0;">Appointments for the day</h3>'
    + '<table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">'
    + '<thead>'
    + '<tr style="background:#f9fafb;">'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Actions</th>'
    + '</tr>'
    + '</thead>'
    + '<tbody>' + rowsHtml + '</tbody>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

function sendClientCancelledEmail_(appt, messageText) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var bookingUrl = getWebAppUrl_();
  var subject = 'Appointment Cancelled - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(messageText || 'Your appointment has been cancelled.') + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<p style="margin:14px 0 0 0;"><a href="' + bookingUrl + '" style="color:#2563eb;">Book a new appointment</a></p>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendDoctorCancellationEmail_(appt, messageText) {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var subject = 'Appointment Cancelled: ' + appt.serviceName + ' - ' + appt.dateKey + ' ' + appt.startTime;

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(messageText || 'Appointment was cancelled.') + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:620px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.fullName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.phone) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.email) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Email patient that their appointment has been redirected to Spinola Clinic.
 */
function sendRedirectToSpinolaEmail_(appt, spinolaLocation) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Appointment Location Changed - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Location Changed</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment has been moved to <b>' + escapeHtml_(spinolaLocation) + '</b>. The date and time remain the same.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">New Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(spinolaLocation) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Email patient that their appointment has been rescheduled.
 */
function sendAppointmentPushedEmail_(appt, newDateKey, newStartTime, newEndTime) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Appointment Rescheduled - ' + appt.serviceName + ' (moved to ' + newDateKey + ' ' + newStartTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Rescheduled</h2>'
    + '<p style="margin:0 0 10px 0;">Due to doctor unavailability, your appointment has been rescheduled.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#ef4444;">Original Date</td><td style="padding:6px 0;"><s>' + escapeHtml_(appt.dateKey) + ' ' + escapeHtml_(appt.startTime) + '</s></td></tr>'
    + '<tr><td style="padding:6px 0;color:#10b981;">New Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(newDateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#10b981;">New Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(newStartTime) + ' - ' + escapeHtml_(newEndTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">If this new time does not work for you, please cancel and rebook.</p>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Daily schedule email sent to doctor at 7am via trigger.
 */
function sendDailyDoctorSchedule_() {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var todayKey = todayKeyLocal_();
  var active = listActiveAppointmentsForDate_(todayKey);

  var subject = 'Daily Schedule - ' + todayKey + ' (' + active.length + ' appointment' + (active.length !== 1 ? 's' : '') + ')';

  var rowsHtml = '';
  for (var i = 0; i < active.length; i++) {
    var a = active[i];
    rowsHtml += ''
      + '<tr>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.startTime) + ' - ' + escapeHtml_(a.endTime) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.serviceName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.fullName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.phone) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.location) + '</td>'
      + '</tr>';
  }

  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No appointments today.</td></tr>';
  }

  var adminLink = '';
  try { adminLink = buildAdminLink_(); } catch (e) {}

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Daily Schedule - ' + escapeHtml_(todayKey) + '</h2>'
    + '<p style="margin:0 0 10px 0;">' + active.length + ' appointment' + (active.length !== 1 ? 's' : '') + ' today.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">'
    + '<thead>'
    + '<tr style="background:#f9fafb;">'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Location</th>'
    + '</tr>'
    + '</thead>'
    + '<tbody>' + rowsHtml + '</tbody>'
    + '</table>';

  if (adminLink) {
    html += '<p style="margin:16px 0 0 0;"><a href="' + adminLink + '" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Open Admin Panel</a></p>';
  }

  html += '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Send custom notification to a patient.
 */
function sendCustomNotificationEmail_(appt, customMessage) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Important: Your Appointment on ' + appt.dateKey + ' at ' + appt.startTime;

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Notice</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(customMessage) + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function escapeHtml_(s) {
  s = String(s === null || s === undefined ? '' : s);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== WebApp.gs =====
/***************
 * WebApp.gs
 ***************/

function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) ? String(e.parameter.mode) : 'book';

  if (mode === 'cancel') {
    var cancelHtml = _serveHtml('Cancel', {
      token: String((e.parameter && e.parameter.token) || ''),
      sig: String((e.parameter && e.parameter.sig) || '')
    });
    return cancelHtml
      .setTitle('Cancel Appointment')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  if (mode === 'docaction') {
    var docHtml = _serveHtml('DocAction', {
      token: String((e.parameter && e.parameter.token) || ''),
      act: String((e.parameter && e.parameter.act) || ''),
      sig: String((e.parameter && e.parameter.sig) || '')
    });
    return docHtml
      .setTitle('Doctor Action')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  if (mode === 'admin') {
    var adminSig = String((e.parameter && e.parameter.sig) || '');
    if (!verifyAdminSig_(adminSig)) {
      return HtmlService.createHtmlOutput('<h2>Access Denied</h2><p>Invalid or missing admin signature.</p>')
        .setTitle('Access Denied');
    }
    var adminHtml = _serveHtml('Admin', { adminSig: adminSig });
    return adminHtml
      .setTitle('Admin - Dr Kevin Navarro Gera')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  return _serveHtml('Index', {})
    .setTitle('Dr Kevin Navarro Gera - Booking')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Serve an HTML page from the _HTML_TEMPLATES global (populated by the bundle).
 * Replaces <?= varName ?> scriptlet placeholders with actual values.
 */
function _serveHtml(name, vars) {
  var html = (_HTML_TEMPLATES && _HTML_TEMPLATES[name]) || '';
  if (!html) throw new Error('HTML template not found: ' + name);

  // Replace GAS-style scriptlet placeholders: <?= varName ?>
  for (var key in vars) {
    // Escape the value for safe HTML embedding inside a JS string
    var safeVal = String(vars[key]).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
    html = html.replace(new RegExp('<\\?=\\s*' + key + '\\s*\\?>', 'g'), safeVal);
  }

  return HtmlService.createHtmlOutput(html);
}

function apiInit() {
  var extraMap = getDoctorExtraSlots_();
  return {
    config: {
      doctorName: 'Dr Kevin Navarro Gera',
      clinicName: "Potter's Pharmacy Clinic",
      apptMinutes: CFG().APPT_DURATION_MIN,
      services: CFG().SERVICES,
      timezone: getTimeZone_(),
      bookingPolicy: 'Choose a service and then select your time slot. You will receive confirmation by email. You can CANCEL your appointment from the email.',
      pottersLocation: (getScriptProps_().getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic"),
      spinolaLocation: (getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic')
    },
    dateOptions: apiGetDateOptions(extraMap)
  };
}

function apiGetDateOptions(extraMap) {
  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var nowMin = nowMinutesLocal_();

  var offMap = getDoctorOffDates_();
  if (!extraMap) extraMap = getDoctorExtraSlots_();
  var out = [];

  for (var i = 0; i <= CFG().ADVANCE_DAYS; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    var holiday = isHolidayOrClosed_(d);
    var reason = '';
    var disabled = false;

    var offEntry = getDoctorOffEntryForDate_(offMap, dk);

    if (!inAdvanceWindow_(d)) {
      disabled = true;
      reason = 'Outside booking window';
    } else if (holiday.closed) {
      disabled = true;
      reason = holiday.reason;
    } else if (offEntry && offEntry.allDay) {
      disabled = true;
      reason = doctorOffReason_(offEntry);
    } else {
      var extras = extraMap[dk] || null;
      var slots = buildSlotsForDate_(d, extras);

      if (!slots.length) {
        disabled = true;
        reason = 'Closed';
      } else if (dk === todayKey) {
        var lastEnd = 0;
        for (var s = 0; s < slots.length; s++) {
          var endM = parseTimeToMinutes_(slots[s].end);
          if (endM > lastEnd) lastEnd = endM;
        }
        if (nowMin >= lastEnd) {
          disabled = true;
          reason = 'No slots remaining today';
        } else {
          var remainingToday = 0;
          for (var t = 0; t < slots.length; t++) {
            var stMin = parseTimeToMinutes_(slots[t].start);
            if (stMin < nowMin) continue;
            if (slotBlockedByDoctorOff_(offEntry, slots[t].start, slots[t].end)) continue;
            remainingToday++;
          }
          if (remainingToday === 0) {
            disabled = true;
            reason = offEntry ? doctorOffReason_(offEntry) : 'No slots available';
          }
        }
      } else {
        var remaining = 0;
        for (var u = 0; u < slots.length; u++) {
          if (slotBlockedByDoctorOff_(offEntry, slots[u].start, slots[u].end)) continue;
          remaining++;
        }
        if (remaining === 0) {
          disabled = true;
          reason = offEntry ? doctorOffReason_(offEntry) : 'No slots available';
        }
      }
    }

    out.push({
      dateKey: dk,
      label: Utilities.formatDate(d, getTimeZone_(), 'EEE dd MMM yyyy'),
      disabled: disabled,
      reason: reason
    });
  }

  return out;
}


function apiGetAvailability(dateKey) {
  dateKey = String(dateKey || '').trim();
  if (!dateKey) throw new Error('Missing dateKey');

  var d = parseDateKey_(dateKey);
  var today = todayLocal_();
  var todayKey = toDateKey_(today);

  if (d.getTime() < today.getTime()) {
    return { ok: false, reason: 'Date is in the past', dateKey: dateKey, slots: [] };
  }

  if (!inAdvanceWindow_(d)) {
    return { ok: false, reason: 'Outside booking window', dateKey: dateKey, slots: [] };
  }

  var holiday = isHolidayOrClosed_(d);
  if (holiday.closed) {
    return { ok: false, reason: holiday.reason, dateKey: dateKey, slots: [] };
  }

  var offMap = getDoctorOffDates_();
  var offEntry = getDoctorOffEntryForDate_(offMap, dateKey);

  if (offEntry && offEntry.allDay) {
    return { ok: false, reason: doctorOffReason_(offEntry), dateKey: dateKey, slots: [] };
  }

  var extraMap = getDoctorExtraSlots_();
  var extras = extraMap[dateKey] || null;
  var baseSlots = buildSlotsForDate_(d, extras);

  var appts = listAppointmentsForDate_(dateKey);
  var taken = {};
  for (var i = 0; i < appts.length; i++) {
    var st = String(appts[i].startTime || '').trim();
    if (apptIsActive_(appts[i])) {
      taken[st] = true;
    }
  }

  var dc = (getScriptProps_().getProperty(CFG().PROP_DOUBLECHECK_CALENDAR) || 'true') === 'true';
  if (dc) {
    var calTaken = listCalendarTakenSlots_(dateKey);
    Object.keys(calTaken).forEach(function(k) { taken[k] = true; });
  }

  var nowMin = nowMinutesLocal_();

  var outSlots = [];
  for (var s = 0; s < baseSlots.length; s++) {
    var slot = baseSlots[s];
    var startMin = parseTimeToMinutes_(slot.start);

    var past = (dateKey === todayKey) ? (startMin < nowMin) : false;
    var isTaken = !!taken[slot.start];
    var isOff = slotBlockedByDoctorOff_(offEntry, slot.start, slot.end);

    outSlots.push({
      start: slot.start,
      end: slot.end,
      available: (!past && !isTaken && !isOff)
    });
  }

  return { ok: true, dateKey: dateKey, slots: outSlots };
}

function getDoctorOffEntryForDate_(offMap, dateKey) {
  if (!offMap) return null;
  var e = offMap[dateKey];
  return e ? e : null;
}

function doctorOffReason_(offEntry) {
  if (!offEntry) return 'Doctor not available';
  var r = String(offEntry.reason || '').trim();
  return r ? r : 'Doctor not available';
}

function slotBlockedByDoctorOff_(offEntry, slotStart, slotEnd) {
  if (!offEntry) return false;
  if (offEntry.allDay) return true;

  var blocks = offEntry.blocks || [];
  if (!blocks.length) return false;

  var stMin = parseTimeToMinutes_(slotStart);
  var enMin = parseTimeToMinutes_(slotEnd);

  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    var bStart = Number(b.startMin);
    var bEnd = Number(b.endMin);

    if (stMin < bEnd && enMin > bStart) return true;
  }

  return false;
}


function apiBook(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    payload = payload || {};
    var dateKey = String(payload.dateKey || '').trim();
    var startTime = String(payload.startTime || '').trim();
    var serviceId = String(payload.serviceId || '').trim();

    var fullName = sanitizeName_(payload.fullName);
    var email = sanitizeEmail_(payload.email);
    var phone = sanitizePhone_(payload.phone);
    var comments = String(payload.comments || '').trim();

    if (!dateKey) throw new Error('Missing date');
    if (!startTime) throw new Error('Missing time');
    if (!serviceId) throw new Error('Missing service');
    if (!fullName) throw new Error('Missing full name');
    if (!email) throw new Error('Missing email');
    if (!phone) throw new Error('Missing phone');

    var d = parseDateKey_(dateKey);
    var today = todayLocal_();
    var todayKey = toDateKey_(today);

    if (d.getTime() < today.getTime()) throw new Error('You cannot book a past date.');
    if (!inAdvanceWindow_(d)) throw new Error('You can only book up to 7 days in advance.');

    var holiday = isHolidayOrClosed_(d);
    if (holiday.closed) throw new Error('Closed: ' + holiday.reason);

    var offMap = getDoctorOffDates_();
    var offEntry = getDoctorOffEntryForDate_(offMap, dateKey);

    if (offEntry && offEntry.allDay) throw new Error('Doctor not available: ' + doctorOffReason_(offEntry));

    if (dateKey === todayKey) {
      var nowMin = nowMinutesLocal_();
      var stMin = parseTimeToMinutes_(startTime);
      if (stMin < nowMin) {
        throw new Error('That time is already in the past. Please choose a later slot.');
      }
    }

    var maxActive = Number(getScriptProps_().getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON) || '0');
    if (isNaN(maxActive) || maxActive < 0) maxActive = 0;

    if (maxActive > 0) {
      var activeCount = countActiveAppointmentsInWindow_(email, phone);
      if (activeCount >= maxActive) {
        throw new Error('You already have ' + activeCount + ' active appointment(s) in the next 7 days. Please cancel one before booking another.');
      }
    }

    if (personAlreadyBookedSameSlot_(dateKey, startTime, email, phone)) {
      throw new Error('You already booked this exact time slot. Please choose a different time.');
    }

    var extraMap = getDoctorExtraSlots_();
    var extras = extraMap[dateKey] || null;
    var slots = buildSlotsForDate_(d, extras);
    var slotFound = null;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].start === startTime) {
        slotFound = slots[i];
        break;
      }
    }
    if (!slotFound) throw new Error('Invalid slot');

    if (slotBlockedByDoctorOff_(offEntry, slotFound.start, slotFound.end)) {
      throw new Error('Doctor not available: ' + doctorOffReason_(offEntry));
    }

    var appts = listAppointmentsForDate_(dateKey);
    for (var j = 0; j < appts.length; j++) {
      if (apptIsActive_(appts[j]) && String(appts[j].startTime || '').trim() === startTime) {
        throw new Error('That slot was just taken. Please pick another.');
      }
    }

    var calTaken = listCalendarTakenSlots_(dateKey);
    if (calTaken[startTime]) {
      throw new Error('That slot was just taken. Please pick another.');
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    var service = null;
    for (var k = 0; k < CFG().SERVICES.length; k++) {
      if (CFG().SERVICES[k].id === serviceId) { service = CFG().SERVICES[k]; break; }
    }
    if (!service) throw new Error('Unknown service');

    getOrCreateClient_(fullName, email, phone);

    var appointmentId = 'A-' + Utilities.getUuid();
    var token = Utilities.getUuid();

    var location = (getScriptProps_().getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic");

    var apptObj = {
      appointmentId: appointmentId,
      dateKey: dateKey,
      startTime: slotFound.start,
      endTime: slotFound.end,
      serviceId: service.id,
      serviceName: service.name,
      fullName: fullName,
      email: email,
      phone: phone,
      comments: comments,
      status: 'BOOKED',
      location: location,
      createdAt: nowStr,
      updatedAt: nowStr,
      token: token,
      calendarEventId: '',
      cancelledAt: '',
      cancelReason: ''
    };

    var eventId = createCalendarEvent_(apptObj);
    apptObj.calendarEventId = eventId;

    appendAppointment_(dateKey, apptObj);

    sendClientConfirmationEmail_(apptObj);
    var dayList = listAppointmentsForDate_(dateKey);
    sendDoctorBookingEmail_(apptObj, dayList);

    return {
      ok: true,
      appointmentId: appointmentId,
      dateKey: dateKey,
      startTime: apptObj.startTime,
      endTime: apptObj.endTime,
      serviceName: apptObj.serviceName,
      location: apptObj.location
    };
  } finally {
    lock.releaseLock();
  }
}


function apiGetCancelInfo(token, sig) {
  token = String(token || '').trim();
  sig = String(sig || '').trim();

  if (!verifyCancelSig_(token, sig)) {
    return { ok: false, reason: 'Invalid or expired cancel link.' };
  }

  var found = findAppointmentByToken_(token);
  if (!found) return { ok: false, reason: 'Appointment not found.' };

  var appt = found.appointment;
  return {
    ok: true,
    appointment: {
      appointmentId: appt.appointmentId,
      dateKey: appt.dateKey,
      startTime: appt.startTime,
      endTime: appt.endTime,
      serviceName: appt.serviceName,
      fullName: appt.fullName,
      email: appt.email,
      phone: appt.phone,
      status: appt.status,
      location: appt.location
    }
  };
}

function apiCancelAppointment(token, sig) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    token = String(token || '').trim();
    sig = String(sig || '').trim();

    if (!verifyCancelSig_(token, sig)) {
      return { ok: false, reason: 'Invalid or expired cancel link.' };
    }

    var found = findAppointmentByToken_(token);
    if (!found) return { ok: false, reason: 'Appointment not found.' };

    var appt = found.appointment;

    if (!apptIsActive_(appt)) {
      return { ok: true, alreadyCancelled: true, message: 'This appointment is already cancelled.', appointmentId: appt.appointmentId };
    }

    var eventId = String(appt.calendarEventId || '').trim();
    if (eventId) {
      deleteCalendarEvent_(eventId);
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    updateAppointmentStatus_(found.sheetName, found.rowIndex, {
      status: 'CANCELLED_CLIENT',
      cancelledAt: nowStr,
      cancelReason: 'Cancelled by client via email link',
      calendarEventId: ''
    });

    try { sendClientCancelledEmail_(appt, 'Your appointment has been cancelled.'); } catch (e1) {}
    try { sendDoctorCancellationEmail_(appt, 'Client cancelled via email link.'); } catch (e2) {}

    return {
      ok: true,
      alreadyCancelled: false,
      message: 'Appointment cancelled successfully.',
      appointmentId: appt.appointmentId
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Doctor action from email link (cancel or redirect to Spinola).
 */
function apiDoctorAction(token, act, sig) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    token = String(token || '').trim();
    act = String(act || '').trim();
    sig = String(sig || '').trim();

    if (!verifyDocActionSig_(token, act, sig)) {
      return { ok: false, reason: 'Invalid or expired link.' };
    }

    var found = findAppointmentByToken_(token);
    if (!found) return { ok: false, reason: 'Appointment not found.' };

    var appt = found.appointment;

    if (!apptIsActive_(appt)) {
      return { ok: true, message: 'This appointment is already cancelled or processed.' };
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    if (act === 'cancel') {
      var eventId = String(appt.calendarEventId || '').trim();
      if (eventId) {
        deleteCalendarEvent_(eventId);
      }

      updateAppointmentStatus_(found.sheetName, found.rowIndex, {
        status: 'CANCELLED_DOCTOR',
        cancelledAt: nowStr,
        cancelReason: 'Cancelled by doctor',
        calendarEventId: ''
      });

      try { sendClientCancelledEmail_(appt, 'Your appointment has been cancelled by the clinic. Please rebook if needed.'); } catch (e1) {}
      try { sendDoctorCancellationEmail_(appt, 'You cancelled this appointment.'); } catch (e2) {}

      return { ok: true, message: 'Appointment cancelled and patient notified.' };
    }

    if (act === 'redirect') {
      var spinolaLocation = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

      updateAppointmentStatus_(found.sheetName, found.rowIndex, {
        status: 'RELOCATED_SPINOLA',
        location: spinolaLocation
      });

      var calEventId = String(appt.calendarEventId || '').trim();
      if (calEventId) {
        try {
          updateCalendarEventLocation_(calEventId, spinolaLocation,
            appt.serviceName + ' - ' + appt.fullName + ' [SPINOLA]');
        } catch (e3) {}
      }

      try { sendRedirectToSpinolaEmail_(appt, spinolaLocation); } catch (e4) {}
      try { sendDoctorCancellationEmail_(appt, 'Appointment redirected to ' + spinolaLocation + '.'); } catch (e5) {}

      return { ok: true, message: 'Appointment redirected to ' + spinolaLocation + ' and patient notified.' };
    }

    return { ok: false, reason: 'Unknown action: ' + act };

  } finally {
    lock.releaseLock();
  }
}

// ===== AdminApi.gs =====
/***************
 * AdminApi.gs - Admin panel API endpoints
 ***************/

/**
 * Dashboard data for admin panel.
 */
function apiAdminGetDashboard(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var tomorrow = addMinutes_(today, 24 * 60);
  var tomorrowKey = toDateKey_(tomorrow);

  var todayAppts = listActiveAppointmentsForDate_(todayKey);
  var tomorrowAppts = listActiveAppointmentsForDate_(tomorrowKey);

  // Get doctor-off entries for upcoming days
  var offRows = getDoctorOffRows_();
  var futureOffRows = [];
  for (var i = 0; i < offRows.length; i++) {
    if (offRows[i].endDate >= todayKey || offRows[i].startDate >= todayKey) {
      futureOffRows.push(offRows[i]);
    }
  }

  // Get extra slots entries
  var extraRows = getDoctorExtraRows_();
  var futureExtraRows = [];
  for (var j = 0; j < extraRows.length; j++) {
    if (extraRows[j].date >= todayKey) {
      futureExtraRows.push(extraRows[j]);
    }
  }

  // Week stats
  var weekBooked = 0;
  var weekCancelled = 0;
  for (var d = 0; d <= 6; d++) {
    var dk = toDateKey_(addMinutes_(today, d * 24 * 60));
    var ss = getAppointmentsSpreadsheet_();
    var sh = ss.getSheetByName(dk);
    if (!sh) continue;
    var lr = sh.getLastRow();
    if (lr < 2) continue;
    var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
    for (var r = 0; r < vals.length; r++) {
      var status = String(vals[r][10] || '');
      if (status === 'BOOKED' || status === 'RELOCATED_SPINOLA') weekBooked++;
      if (status.indexOf('CANCELLED') >= 0) weekCancelled++;
    }
  }

  return {
    ok: true,
    todayKey: todayKey,
    tomorrowKey: tomorrowKey,
    todayAppointments: todayAppts,
    tomorrowAppointments: tomorrowAppts,
    doctorOffEntries: futureOffRows,
    extraSlotEntries: futureExtraRows,
    stats: {
      weekBooked: weekBooked,
      weekCancelled: weekCancelled
    }
  };
}

/**
 * Get appointments for a specific date (admin).
 */
function apiAdminGetDateAppointments(sig, dateKey) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  dateKey = String(dateKey || '').trim();
  if (!dateKey) return { ok: false, reason: 'Missing date.' };

  var appts = listActiveAppointmentsForDate_(dateKey);
  return { ok: true, dateKey: dateKey, appointments: appts };
}

/**
 * Mark doctor as unavailable for a date range.
 */
function apiAdminMarkDoctorOff(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var startDate = String(payload.startDate || '').trim();
  var endDate = String(payload.endDate || startDate).trim();
  var startTime = String(payload.startTime || '').trim();
  var endTime = String(payload.endTime || '').trim();
  var reason = String(payload.reason || 'Doctor not available').trim();

  if (!startDate) return { ok: false, reason: 'Missing start date.' };

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { ok: false, reason: 'Invalid start date format. Use YYYY-MM-DD.' };
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return { ok: false, reason: 'Invalid end date format. Use YYYY-MM-DD.' };

  // Validate time format if provided
  if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) return { ok: false, reason: 'Invalid start time format. Use HH:mm.' };
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return { ok: false, reason: 'Invalid end time format. Use HH:mm.' };

  addDoctorOffRow_(startDate, endDate, startTime, endTime, reason);

  // Find affected appointments
  var affected = [];
  var sd = parseDateKey_(startDate);
  var ed = parseDateKey_(endDate || startDate);
  if (ed.getTime() < sd.getTime()) { var tmp = sd; sd = ed; ed = tmp; }

  var d = new Date(sd.getTime());
  while (d.getTime() <= ed.getTime()) {
    var dk = toDateKey_(d);
    var appts = listActiveAppointmentsForDate_(dk);
    for (var i = 0; i < appts.length; i++) {
      // If no time specified (all day), all appointments are affected
      if (!startTime && !endTime) {
        affected.push(appts[i]);
      } else {
        // Check if appointment overlaps with the blocked time window
        var aStart = parseTimeToMinutes_(appts[i].startTime);
        var aEnd = parseTimeToMinutes_(appts[i].endTime);
        var bStart = startTime ? parseTimeToMinutes_(startTime) : 0;
        var bEnd = endTime ? parseTimeToMinutes_(endTime) : 1440;
        if (aStart < bEnd && aEnd > bStart) {
          affected.push(appts[i]);
        }
      }
    }
    d = addMinutes_(d, 24 * 60);
  }

  return {
    ok: true,
    message: 'Doctor marked as unavailable.',
    affectedAppointments: affected
  };
}

/**
 * Add extra time slots for a date.
 */
function apiAdminAddExtraSlots(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var date = String(payload.date || '').trim();
  var startTime = String(payload.startTime || '').trim();
  var endTime = String(payload.endTime || '').trim();
  var reason = String(payload.reason || 'Extra hours').trim();

  if (!date) return { ok: false, reason: 'Missing date.' };
  if (!startTime) return { ok: false, reason: 'Missing start time.' };
  if (!endTime) return { ok: false, reason: 'Missing end time.' };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'Invalid date format.' };
  if (!/^\d{2}:\d{2}$/.test(startTime)) return { ok: false, reason: 'Invalid start time format.' };
  if (!/^\d{2}:\d{2}$/.test(endTime)) return { ok: false, reason: 'Invalid end time format.' };

  var stMin = parseTimeToMinutes_(startTime);
  var enMin = parseTimeToMinutes_(endTime);
  if (enMin <= stMin) return { ok: false, reason: 'End time must be after start time.' };

  addDoctorExtraRow_(date, startTime, endTime, reason);

  var slotsAdded = Math.floor((enMin - stMin) / CFG().APPT_DURATION_MIN);

  return {
    ok: true,
    message: 'Added extra time window: ' + startTime + ' - ' + endTime + ' on ' + date + ' (' + slotsAdded + ' slots).'
  };
}

/**
 * Process affected appointments for a date: cancel, redirect, or push.
 */
function apiAdminProcessAppointments(sig, payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

    payload = payload || {};
    var dateKey = String(payload.dateKey || '').trim();
    var action = String(payload.action || '').trim();
    var customMessage = String(payload.customMessage || '').trim();
    var appointmentIds = payload.appointmentIds || [];

    if (!dateKey) return { ok: false, reason: 'Missing date.' };
    if (!action) return { ok: false, reason: 'Missing action.' };

    var validActions = ['cancel', 'redirect_spinola', 'push_next_day'];
    if (validActions.indexOf(action) < 0) return { ok: false, reason: 'Invalid action. Use: cancel, redirect_spinola, or push_next_day.' };

    var allAppts = listActiveAppointmentsForDate_(dateKey);

    // Filter to selected appointments if IDs provided
    var appts = [];
    if (appointmentIds.length > 0) {
      var idSet = {};
      for (var a = 0; a < appointmentIds.length; a++) {
        idSet[String(appointmentIds[a])] = true;
      }
      for (var b = 0; b < allAppts.length; b++) {
        if (idSet[allAppts[b].appointmentId]) appts.push(allAppts[b]);
      }
    } else {
      appts = allAppts;
    }

    if (!appts.length) return { ok: true, message: 'No appointments to process.', processed: 0 };

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");
    var results = [];

    if (action === 'cancel') {
      for (var i = 0; i < appts.length; i++) {
        var appt = appts[i];
        var found = findAppointmentByToken_(appt.token);
        if (!found) continue;

        var eventId = String(appt.calendarEventId || '').trim();
        if (eventId) { try { deleteCalendarEvent_(eventId); } catch (e) {} }

        updateAppointmentStatus_(found.sheetName, found.rowIndex, {
          status: 'CANCELLED_DOCTOR',
          cancelledAt: nowStr,
          cancelReason: customMessage || 'Doctor unavailable',
          calendarEventId: ''
        });

        var msg = customMessage || 'We apologise, the doctor is unavailable on ' + dateKey + '. Your appointment has been cancelled. Please rebook at your convenience.';
        try { sendClientCancelledEmail_(appt, msg); } catch (e1) {}

        results.push({ appointmentId: appt.appointmentId, action: 'cancelled', patient: appt.fullName });
      }
    }

    if (action === 'redirect_spinola') {
      var spinolaLoc = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

      for (var j = 0; j < appts.length; j++) {
        var appt2 = appts[j];
        var found2 = findAppointmentByToken_(appt2.token);
        if (!found2) continue;

        updateAppointmentStatus_(found2.sheetName, found2.rowIndex, {
          status: 'RELOCATED_SPINOLA',
          location: spinolaLoc
        });

        var calEvId = String(appt2.calendarEventId || '').trim();
        if (calEvId) {
          try { updateCalendarEventLocation_(calEvId, spinolaLoc, appt2.serviceName + ' - ' + appt2.fullName + ' [SPINOLA]'); } catch (e2) {}
        }

        try { sendRedirectToSpinolaEmail_(appt2, spinolaLoc); } catch (e3) {}

        results.push({ appointmentId: appt2.appointmentId, action: 'redirected_spinola', patient: appt2.fullName });
      }
    }

    if (action === 'push_next_day') {
      var offMap = getDoctorOffDates_();
      var nextDay = findNextAvailableDay_(dateKey, offMap);

      if (!nextDay) {
        return { ok: false, reason: 'Could not find an available day in the next 30 days to push appointments to.' };
      }

      var nextDateObj = parseDateKey_(nextDay);
      var extraMap = getDoctorExtraSlots_();
      var extras = extraMap[nextDay] || null;
      var availableSlots = buildSlotsForDate_(nextDateObj, extras);

      // Check which slots are already taken on the target day
      var nextDayAppts = listActiveAppointmentsForDate_(nextDay);
      var takenOnNextDay = {};
      for (var t = 0; t < nextDayAppts.length; t++) {
        takenOnNextDay[nextDayAppts[t].startTime] = true;
      }

      for (var k = 0; k < appts.length; k++) {
        var appt3 = appts[k];
        var found3 = findAppointmentByToken_(appt3.token);
        if (!found3) continue;

        // Try to find the same time slot on the next day
        var newStartTime = null;
        var newEndTime = null;

        // First try same time
        if (!takenOnNextDay[appt3.startTime]) {
          for (var sl = 0; sl < availableSlots.length; sl++) {
            if (availableSlots[sl].start === appt3.startTime) {
              if (!slotBlockedByDoctorOff_(getDoctorOffEntryForDate_(offMap, nextDay), availableSlots[sl].start, availableSlots[sl].end)) {
                newStartTime = availableSlots[sl].start;
                newEndTime = availableSlots[sl].end;
                break;
              }
            }
          }
        }

        // If same time not available, find next available slot
        if (!newStartTime) {
          for (var sl2 = 0; sl2 < availableSlots.length; sl2++) {
            if (!takenOnNextDay[availableSlots[sl2].start]) {
              if (!slotBlockedByDoctorOff_(getDoctorOffEntryForDate_(offMap, nextDay), availableSlots[sl2].start, availableSlots[sl2].end)) {
                newStartTime = availableSlots[sl2].start;
                newEndTime = availableSlots[sl2].end;
                break;
              }
            }
          }
        }

        if (!newStartTime) {
          // No slot available — cancel instead
          var evId = String(appt3.calendarEventId || '').trim();
          if (evId) { try { deleteCalendarEvent_(evId); } catch (e4) {} }

          updateAppointmentStatus_(found3.sheetName, found3.rowIndex, {
            status: 'CANCELLED_DOCTOR',
            cancelledAt: nowStr,
            cancelReason: 'No available slot on ' + nextDay,
            calendarEventId: ''
          });

          try { sendClientCancelledEmail_(appt3, 'Your appointment could not be rescheduled as no slots were available. Please rebook at your convenience.'); } catch (e5) {}
          results.push({ appointmentId: appt3.appointmentId, action: 'cancelled_no_slot', patient: appt3.fullName });
          continue;
        }

        // Cancel old calendar event
        var oldEvId = String(appt3.calendarEventId || '').trim();
        if (oldEvId) { try { deleteCalendarEvent_(oldEvId); } catch (e6) {} }

        // Cancel old appointment
        updateAppointmentStatus_(found3.sheetName, found3.rowIndex, {
          status: 'CANCELLED_DOCTOR',
          cancelledAt: nowStr,
          cancelReason: 'Pushed to ' + nextDay + ' ' + newStartTime,
          calendarEventId: ''
        });

        // Create new appointment on next day
        var newToken = Utilities.getUuid();
        var newAppt = {
          appointmentId: 'A-' + Utilities.getUuid(),
          dateKey: nextDay,
          startTime: newStartTime,
          endTime: newEndTime,
          serviceId: appt3.serviceId,
          serviceName: appt3.serviceName,
          fullName: appt3.fullName,
          email: appt3.email,
          phone: appt3.phone,
          comments: appt3.comments,
          status: 'BOOKED',
          location: appt3.location,
          createdAt: nowStr,
          updatedAt: nowStr,
          token: newToken,
          calendarEventId: '',
          cancelledAt: '',
          cancelReason: ''
        };

        var newEventId = '';
        try { newEventId = createCalendarEvent_(newAppt); } catch (e7) {}
        newAppt.calendarEventId = newEventId;

        appendAppointment_(nextDay, newAppt);
        takenOnNextDay[newStartTime] = true;

        try { sendAppointmentPushedEmail_(appt3, nextDay, newStartTime, newEndTime); } catch (e8) {}

        results.push({ appointmentId: newAppt.appointmentId, action: 'pushed', patient: appt3.fullName, newDate: nextDay, newTime: newStartTime });
      }
    }

    return {
      ok: true,
      message: 'Processed ' + results.length + ' appointment(s).',
      processed: results.length,
      results: results,
      nextDay: action === 'push_next_day' ? (nextDay || null) : undefined
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Remove a DoctorOff entry by row index.
 */
function apiAdminRemoveDoctorOff(sig, rowIndex) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  rowIndex = Number(rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return { ok: false, reason: 'Invalid row index.' };
  deleteDoctorOffRow_(rowIndex);
  return { ok: true, message: 'Doctor-off entry removed. Slots are now available for booking.' };
}

/**
 * Remove a DoctorExtra entry by row index.
 */
function apiAdminRemoveExtraSlots(sig, rowIndex) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  rowIndex = Number(rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return { ok: false, reason: 'Invalid row index.' };
  deleteDoctorExtraRow_(rowIndex);
  return { ok: true, message: 'Extra slots entry removed.' };
}

/**
 * Send custom notification to selected patients.
 */
function apiAdminNotifyPatients(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var dateKey = String(payload.dateKey || '').trim();
  var appointmentIds = payload.appointmentIds || [];
  var message = String(payload.message || '').trim();

  if (!dateKey) return { ok: false, reason: 'Missing date.' };
  if (!message) return { ok: false, reason: 'Missing message.' };
  if (!appointmentIds.length) return { ok: false, reason: 'No appointments selected.' };

  var allAppts = listActiveAppointmentsForDate_(dateKey);
  var idSet = {};
  for (var i = 0; i < appointmentIds.length; i++) {
    idSet[String(appointmentIds[i])] = true;
  }

  var sent = 0;
  for (var j = 0; j < allAppts.length; j++) {
    if (!idSet[allAppts[j].appointmentId]) continue;
    try {
      sendCustomNotificationEmail_(allAppts[j], message);
      sent++;
    } catch (e) {}
  }

  return { ok: true, message: 'Notification sent to ' + sent + ' patient(s).', sent: sent };
}

// ===== Install.gs =====
/***************
 * Install.gs
 ***************/

function install() {
  var props = getScriptProps_();

  if (!props.getProperty(CFG().PROP_TIMEZONE)) {
    props.setProperty(CFG().PROP_TIMEZONE, 'Europe/Malta');
  }

  getOrCreateSigningSecret_();
  getOrCreateAdminSecret_();

  // Create or reuse spreadsheets
  var configId = props.getProperty(CFG().PROP_CONFIG_SSID);
  var apptsId = props.getProperty(CFG().PROP_APPTS_SSID);

  if (!configId) {
    var ss1 = SpreadsheetApp.create('Kevin Booking - CONFIG');
    configId = ss1.getId();
    props.setProperty(CFG().PROP_CONFIG_SSID, configId);
  }
  if (!apptsId) {
    var ss2 = SpreadsheetApp.create('Kevin Booking - APPOINTMENTS');
    apptsId = ss2.getId();
    props.setProperty(CFG().PROP_APPTS_SSID, apptsId);
  }

  ensureConfigSheets_();
  ensureDefaultConfigProperties_();
  ensureCalendar_();
  ensureTriggers_();

  var adminLink = '';
  try { adminLink = buildAdminLink_(); } catch (e) {}

  return {
    ok: true,
    configSpreadsheetId: configId,
    appointmentsSpreadsheetId: apptsId,
    calendarId: getScriptProps_().getProperty(CFG().PROP_CALENDAR_ID),
    timezone: getTimeZone_(),
    adminLink: adminLink
  };
}

function ensureDefaultConfigProperties_() {
  var props = getScriptProps_();

  if (!props.getProperty(CFG().PROP_DOCTOR_EMAIL)) {
    props.setProperty(CFG().PROP_DOCTOR_EMAIL, '');
  }
  if (!props.getProperty(CFG().PROP_POTTERS_LOCATION)) {
    props.setProperty(CFG().PROP_POTTERS_LOCATION, "Potter's Pharmacy Clinic");
  }
  if (!props.getProperty(CFG().PROP_SPINOLA_LOCATION)) {
    props.setProperty(CFG().PROP_SPINOLA_LOCATION, 'Spinola Clinic');
  }

  // Calendar double-check ON prevents stale "free slots"
  if (!props.getProperty(CFG().PROP_DOUBLECHECK_CALENDAR)) {
    props.setProperty(CFG().PROP_DOUBLECHECK_CALENDAR, 'true');
  }

  // NEW: allow multiple appointments; optional cap
  // Default 0 = unlimited
  if (!props.getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON)) {
    props.setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, '0');
  }
}

function ensureSheetHeader_(sheet, headers) {
  sheet.setFrozenRows(1);

  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var mismatch = false;

  for (var i = 0; i < headers.length; i++) {
    if (String(existing[i] || '').trim() !== String(headers[i]).trim()) {
      mismatch = true;
      break;
    }
  }

  if (mismatch) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function ensureConfigSheets_() {
  var configSs = SpreadsheetApp.openById(getScriptProps_().getProperty(CFG().PROP_CONFIG_SSID));

  var clients = configSs.getSheetByName(CFG().SHEET_CLIENTS);
  if (!clients) clients = configSs.insertSheet(CFG().SHEET_CLIENTS);

  ensureSheetHeader_(clients, [
    'ClientId', 'FullName', 'Email', 'Phone', 'CreatedAt', 'LastUpdated'
  ]);

  // Force text formatting (prevents phone corruption)
  clients.getRange(1, 1, clients.getMaxRows(), 6).setNumberFormat('@');

  var off = configSs.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!off) off = configSs.insertSheet(CFG().SHEET_DOCTOR_OFF);

  // NEW DoctorOff format (ranges + optional time windows)
  ensureSheetHeader_(off, [
    'StartDate(yyyy-MM-dd)',
    'EndDate(yyyy-MM-dd)',
    'StartTime(HH:mm)',
    'EndTime(HH:mm)',
    'Reason'
  ]);

  off.getRange(1, 1, off.getMaxRows(), 5).setNumberFormat('@');

  // DoctorExtra sheet (extra time slots the doctor adds)
  var extra = configSs.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!extra) extra = configSs.insertSheet(CFG().SHEET_DOCTOR_EXTRA);

  ensureSheetHeader_(extra, [
    'Date(yyyy-MM-dd)',
    'StartTime(HH:mm)',
    'EndTime(HH:mm)',
    'Reason'
  ]);

  extra.getRange(1, 1, extra.getMaxRows(), 4).setNumberFormat('@');
}


function ensureCalendar_() {
  var props = getScriptProps_();
  var calId = props.getProperty(CFG().PROP_CALENDAR_ID);
  var calName = 'KevinAppts';

  if (calId) {
    try {
      CalendarApp.getCalendarById(calId).getName();
      return;
    } catch (e) {}
  }

  var cals = CalendarApp.getCalendarsByName(calName);
  var cal;
  if (cals && cals.length > 0) {
    cal = cals[0];
  } else {
    cal = CalendarApp.createCalendar(calName);
  }
  props.setProperty(CFG().PROP_CALENDAR_ID, cal.getId());
}

function ensureTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    if (t.getHandlerFunction && t.getHandlerFunction() === 'sendDailyDoctorSchedule_') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('sendDailyDoctorSchedule_')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}

/**
 * SAFE: run once after you update code.
 * - Does NOT clear data
 * - Fixes formatting issues (phone/email becoming numbers)
 * - Applies text formatting to existing day tabs in appointments spreadsheet
 */
function repairSheets() {
  ensureConfigSheets_();

  var apptSs = SpreadsheetApp.openById(getScriptProps_().getProperty(CFG().PROP_APPTS_SSID));
  var sheets = apptSs.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (/^\d{4}-\d{2}-\d{2}$/.test(name)) {
      sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
      sh.setFrozenRows(1);
    }
  }

  return { ok: true };
}

/***************
 * Convenience setters
 ***************/
function setWebAppUrl(url) {
  if (!url || typeof url !== 'string') throw new Error('Missing url');
  getScriptProps_().setProperty(CFG().PROP_WEBAPP_URL, url);
  return { ok: true, webAppUrl: url };
}

function setDoctorEmail(email) {
  if (!email || typeof email !== 'string') throw new Error('Missing email');
  getScriptProps_().setProperty(CFG().PROP_DOCTOR_EMAIL, email.trim());
  return { ok: true, doctorEmail: email.trim() };
}

function setPottersLocation(text) {
  if (!text || typeof text !== 'string') throw new Error('Missing location');
  getScriptProps_().setProperty(CFG().PROP_POTTERS_LOCATION, text.trim());
  return { ok: true, pottersLocation: text.trim() };
}

function setSpinolaLocation(text) {
  if (!text || typeof text !== 'string') throw new Error('Missing location');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_LOCATION, text.trim());
  return { ok: true, spinolaLocation: text.trim() };
}

function setDoubleCheckCalendar(enabled) {
  getScriptProps_().setProperty(CFG().PROP_DOUBLECHECK_CALENDAR, String(!!enabled));
  return { ok: true, doubleCheckCalendar: String(!!enabled) };
}

/**
 * NEW: cap active appointments per person in next 7 days
 * 0 = unlimited (recommended)
 */
function setMaxActiveAppointmentsPerPerson(n) {
  if (n === null || n === undefined || n === '') throw new Error('Missing number');
  var v = Number(n);
  if (isNaN(v) || v < 0) throw new Error('Invalid number. Use 0 for unlimited.');
  getScriptProps_().setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, String(Math.floor(v)));
  return { ok: true, MAX_ACTIVE_APPTS_PER_PERSON: String(Math.floor(v)) };
}

/**
 * Generate and return the admin panel URL.
 * Run this after install() and setWebAppUrlAuto() to get your admin bookmark.
 */
function generateAdminLink() {
  var link = buildAdminLink_();
  Logger.log('=== ADMIN LINK ===');
  Logger.log(link);
  Logger.log('==================');
  return { ok: true, adminLink: link };
}

function setWebAppUrlAuto() {
  var auto = ScriptApp.getService().getUrl();
  auto = String(auto || '').trim();
  if (!auto) {
    throw new Error(
      'No Web App URL detected. Deploy: Deploy → New deployment → Web app, then run setWebAppUrlAuto() again.'
    );
  }
  getScriptProps_().setProperty(CFG().PROP_WEBAPP_URL, auto);
  Logger.log('Web App URL set to: ' + auto);
  return { ok: true, WEBAPP_URL: auto };
}


// ===== Uninstall.gs =====
/************************************
 * Uninstall.gs
 *
 * Purpose:
 * - Allows you to fully remove everything created by install():
 *   - Triggers
 *   - CONFIG spreadsheet (Drive file -> trashed)
 *   - APPOINTMENTS spreadsheet (Drive file -> trashed)
 *   - KevinAppts calendar (requires Advanced Calendar Service)
 *   - Script properties
 *
 * Safety model:
 * 1) Run armUninstall() first (valid for 15 minutes)
 * 2) Then run uninstallEverything()
 *
 * If you want to force-delete even if names don't match, run armUninstallForce()
 ************************************/

/**
 * Run this first. It arms uninstall for 15 minutes.
 */
function armUninstall() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var until = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  props.setProperty('UNINSTALL_ARMED', 'true');
  props.setProperty('UNINSTALL_ARMED_AT', now.toISOString());
  props.setProperty('UNINSTALL_ARMED_UNTIL', until.toISOString());
  props.setProperty('UNINSTALL_FORCE', 'false');

  return {
    ok: true,
    message: 'Uninstall armed for 15 minutes. Now run uninstallEverything().',
    armedAt: now.toISOString(),
    armedUntil: until.toISOString(),
    force: false
  };
}

/**
 * Same as armUninstall(), but allows deletion even if the resource name does not match expected names.
 * Use only if you know what you are doing.
 */
function armUninstallForce() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var until = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  props.setProperty('UNINSTALL_ARMED', 'true');
  props.setProperty('UNINSTALL_ARMED_AT', now.toISOString());
  props.setProperty('UNINSTALL_ARMED_UNTIL', until.toISOString());
  props.setProperty('UNINSTALL_FORCE', 'true');

  return {
    ok: true,
    message: 'FORCE uninstall armed for 15 minutes. Now run uninstallEverything().',
    armedAt: now.toISOString(),
    armedUntil: until.toISOString(),
    force: true
  };
}

/**
 * Disarm uninstall.
 */
function disarmUninstall() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('UNINSTALL_ARMED');
  props.deleteProperty('UNINSTALL_ARMED_AT');
  props.deleteProperty('UNINSTALL_ARMED_UNTIL');
  props.deleteProperty('UNINSTALL_FORCE');

  return { ok: true, message: 'Uninstall disarmed.' };
}

/**
 * Dry-run: shows what WOULD be deleted/trashed, but does not delete anything.
 */
function uninstallDryRun() {
  return uninstallCore_({ execute: false, deleteCalendar: true, trashFiles: true, wipeProperties: false });
}

/**
 * Full uninstall:
 * - Deletes triggers
 * - Trashes spreadsheets
 * - Deletes calendar (requires Advanced Calendar Service)
 * - Wipes script properties
 */
function uninstallEverything() {
  assertUninstallArmed_();
  return uninstallCore_({ execute: true, deleteCalendar: true, trashFiles: true, wipeProperties: true });
}

/**
 * Uninstall but keep the calendar (useful if you reused an existing calendar and don't want it removed).
 * - Deletes triggers
 * - Trashes spreadsheets
 * - Keeps calendar
 * - Wipes script properties
 */
function uninstallKeepCalendar() {
  assertUninstallArmed_();
  return uninstallCore_({ execute: true, deleteCalendar: false, trashFiles: true, wipeProperties: true });
}

/************************************
 * Internals
 ************************************/

function assertUninstallArmed_() {
  var props = PropertiesService.getScriptProperties();
  var armed = props.getProperty('UNINSTALL_ARMED') === 'true';
  var untilStr = props.getProperty('UNINSTALL_ARMED_UNTIL');

  if (!armed || !untilStr) {
    throw new Error('Uninstall is NOT armed. Run armUninstall() first, then run uninstallEverything().');
  }

  var until = new Date(untilStr);
  var now = new Date();
  if (now.getTime() > until.getTime()) {
    disarmUninstall();
    throw new Error('Uninstall arming expired. Run armUninstall() again.');
  }
}

function uninstallCore_(opts) {
  opts = opts || {};
  var execute = !!opts.execute;
  var deleteCalendar = !!opts.deleteCalendar;
  var trashFiles = !!opts.trashFiles;
  var wipeProperties = !!opts.wipeProperties;

  var props = PropertiesService.getScriptProperties();
  var force = props.getProperty('UNINSTALL_FORCE') === 'true';

  var report = {
    ok: true,
    execute: execute,
    deleteCalendar: deleteCalendar,
    trashFiles: trashFiles,
    wipeProperties: wipeProperties,
    force: force,
    actions: [],
    warnings: [],
    errors: []
  };

  // 1) Remove triggers
  try {
    var trigRes = removeAllProjectTriggers_(execute);
    report.actions.push(trigRes);
  } catch (e1) {
    report.errors.push('Trigger removal failed: ' + (e1 && e1.message ? e1.message : String(e1)));
  }

  // 2) Trash spreadsheets created/used by install
  var configId = props.getProperty('CONFIG_SPREADSHEET_ID');
  var apptsId = props.getProperty('APPOINTMENTS_SPREADSHEET_ID');

  if (trashFiles) {
    try {
      var s1 = trashSpreadsheetById_(configId, 'Kevin Booking - CONFIG', execute, force);
      report.actions.push(s1);
    } catch (e2) {
      report.errors.push('Config spreadsheet trash failed: ' + (e2 && e2.message ? e2.message : String(e2)));
    }

    try {
      var s2 = trashSpreadsheetById_(apptsId, 'Kevin Booking - APPOINTMENTS', execute, force);
      report.actions.push(s2);
    } catch (e3) {
      report.errors.push('Appointments spreadsheet trash failed: ' + (e3 && e3.message ? e3.message : String(e3)));
    }
  } else {
    report.actions.push({ type: 'spreadsheets', action: 'skipped', reason: 'trashFiles=false' });
  }

  // 3) Delete calendar (requires Advanced Calendar service)
  var calId = props.getProperty('KEVINAPPTS_CALENDAR_ID');

  if (deleteCalendar) {
    try {
      var c1 = deleteCalendarById_(calId, 'KevinAppts', execute, force);
      report.actions.push(c1);
    } catch (e4) {
      report.errors.push('Calendar delete failed: ' + (e4 && e4.message ? e4.message : String(e4)));
    }
  } else {
    report.actions.push({ type: 'calendar', action: 'skipped', reason: 'deleteCalendar=false', calendarId: calId || '' });
  }

  // 4) Wipe properties (do this last)
  if (wipeProperties) {
    try {
      var p1 = wipeScriptProperties_(execute);
      report.actions.push(p1);
    } catch (e5) {
      report.errors.push('Property wipe failed: ' + (e5 && e5.message ? e5.message : String(e5)));
    }
  } else {
    report.actions.push({ type: 'properties', action: 'skipped', reason: 'wipeProperties=false' });
  }

  // Always disarm after execute=true (even if errors)
  if (execute) {
    try { disarmUninstall(); } catch (e6) {}
  }

  if (report.errors.length) {
    report.ok = false;
  }

  return report;
}

function removeAllProjectTriggers_(execute) {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = [];
  var kept = [];

  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    var handler = '';
    try { handler = t.getHandlerFunction(); } catch (e) { handler = ''; }

    if (execute) {
      ScriptApp.deleteTrigger(t);
      removed.push(handler || '(unknown handler)');
    } else {
      removed.push('[dry-run] ' + (handler || '(unknown handler)'));
    }
  }

  return {
    type: 'triggers',
    action: execute ? 'deleted' : 'dry-run',
    removedCount: removed.length,
    removedHandlers: removed,
    keptHandlers: kept
  };
}

function trashSpreadsheetById_(fileId, expectedName, execute, force) {
  if (!fileId) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'No fileId stored in Script Properties',
      expectedName: expectedName
    };
  }

  var file;
  try {
    file = DriveApp.getFileById(fileId);
  } catch (e) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'File not accessible / not found: ' + fileId,
      fileId: fileId,
      expectedName: expectedName
    };
  }

  var actualName = file.getName();
  var nameMatches = (actualName === expectedName);

  if (!nameMatches && !force) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'Name mismatch (safety). Run armUninstallForce() to override.',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName
    };
  }

  if (execute) {
    file.setTrashed(true);
    return {
      type: 'spreadsheet',
      action: 'trashed',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName,
      note: 'File moved to Trash. You can restore from Drive Trash if needed.'
    };
  } else {
    return {
      type: 'spreadsheet',
      action: 'dry-run',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName,
      wouldTrash: true
    };
  }
}

function deleteCalendarById_(calendarId, expectedName, execute, force) {
  if (!calendarId) {
    return {
      type: 'calendar',
      action: 'skipped',
      reason: 'No calendarId stored in Script Properties',
      expectedName: expectedName
    };
  }

  // Confirm name (via CalendarApp) where possible
  var actualName = '';
  try {
    var cal = CalendarApp.getCalendarById(calendarId);
    actualName = cal ? cal.getName() : '';
  } catch (e) {
    actualName = '';
  }

  var nameMatches = (actualName && actualName === expectedName);

  if (!nameMatches && !force) {
    return {
      type: 'calendar',
      action: 'skipped',
      reason: 'Name mismatch (safety). Run armUninstallForce() to override.',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName
    };
  }

  // Calendar deletion requires Advanced Calendar Service
  // Uses: Calendar.Calendars.remove(calendarId)
  if (typeof Calendar === 'undefined' || !Calendar.Calendars || !Calendar.Calendars.remove) {
    throw new Error(
      'Advanced Google Service "Google Calendar API" is not enabled.\n' +
      'Enable it in Apps Script: Services (+) -> Google Calendar API -> Add.\n' +
      'Then run uninstallEverything() again.'
    );
  }

  if (execute) {
    Calendar.Calendars.remove(calendarId);
    return {
      type: 'calendar',
      action: 'deleted',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName,
      note: 'Calendar removed via Calendar API (this is permanent).'
    };
  } else {
    return {
      type: 'calendar',
      action: 'dry-run',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName,
      wouldDelete: true
    };
  }
}

function wipeScriptProperties_(execute) {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();

  // Keep uninstall safety keys out of counting? (we will remove them anyway if execute=true)
  var keys = Object.keys(all);

  if (execute) {
    props.deleteAllProperties();
    return {
      type: 'properties',
      action: 'deleted',
      deletedCount: keys.length,
      deletedKeys: keys
    };
  } else {
    return {
      type: 'properties',
      action: 'dry-run',
      wouldDeleteCount: keys.length,
      wouldDeleteKeys: keys
    };
  }
}


  return {
    doGet: doGet,
    apiInit: apiInit,
    apiGetDateOptions: apiGetDateOptions,
    apiGetAvailability: apiGetAvailability,
    apiBook: apiBook,
    apiGetCancelInfo: apiGetCancelInfo,
    apiCancelAppointment: apiCancelAppointment,
    apiDoctorAction: apiDoctorAction,
    apiAdminGetDashboard: apiAdminGetDashboard,
    apiAdminGetDateAppointments: apiAdminGetDateAppointments,
    apiAdminMarkDoctorOff: apiAdminMarkDoctorOff,
    apiAdminAddExtraSlots: apiAdminAddExtraSlots,
    apiAdminProcessAppointments: apiAdminProcessAppointments,
    apiAdminRemoveDoctorOff: apiAdminRemoveDoctorOff,
    apiAdminRemoveExtraSlots: apiAdminRemoveExtraSlots,
    apiAdminNotifyPatients: apiAdminNotifyPatients,
    sendDailyDoctorSchedule_: sendDailyDoctorSchedule_,
    install: install,
    repairSheets: repairSheets,
    setWebAppUrl: setWebAppUrl,
    setDoctorEmail: setDoctorEmail,
    setPottersLocation: setPottersLocation,
    setSpinolaLocation: setSpinolaLocation,
    setDoubleCheckCalendar: setDoubleCheckCalendar,
    setMaxActiveAppointmentsPerPerson: setMaxActiveAppointmentsPerPerson,
    generateAdminLink: generateAdminLink,
    setWebAppUrlAuto: setWebAppUrlAuto,
    armUninstall: armUninstall,
    armUninstallForce: armUninstallForce,
    disarmUninstall: disarmUninstall,
    uninstallDryRun: uninstallDryRun,
    uninstallEverything: uninstallEverything,
    uninstallKeepCalendar: uninstallKeepCalendar
  };
})();
