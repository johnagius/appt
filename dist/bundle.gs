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
      display:block;
      font-size:12px;
      color: var(--muted);
      font-weight:800;
      margin-bottom:6px;
    }
    .field-error{
      font-size:11.5px;
      color: var(--bad);
      margin-top:4px;
      min-height:0;
      line-height:1.3;
    }
    .field-error:empty{ display:none; }
    .has-error{ border-color: var(--bad) !important; }
    .has-error:focus{ box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important; }
    .phoneWrap.has-error{ border-color: var(--bad) !important; }
    .phoneRow.has-error .ccBtn{ border-color: var(--bad) !important; }
    .phoneRow.has-error .phoneWrap{ border-color: var(--bad) !important; }

    select, input, textarea{
      width:100%;
      padding:10px 10px;
      border:1px solid var(--line);
      border-radius:12px;
      outline:none;
      font-size:13px;
      background:#fff;
      color: var(--text);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    select:focus, input:focus, textarea:focus{
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(245,179,1,0.18);
    }
    textarea{ min-height:80px; resize:vertical; }

    .phoneRow{
      display:flex;
      align-items:center;
      position:relative;
    }
    .phoneWrap{
      display:flex;
      align-items:center;
      border:1px solid var(--line);
      border-radius:0 12px 12px 0;
      background:#fff;
      overflow:hidden;
      flex:1;
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
      border:1px solid var(--line);
      border-right:none;
      background:#f9fafb;
      font-size:18px;
      padding:10px 8px 10px 10px;
      min-height:44px;
      cursor:pointer;
      line-height:1;
      border-radius:12px 0 0 12px;
      transition: background 0.15s ease;
    }
    .ccBtn:hover{
      background:#f0f0f0;
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
      width:280px;
      max-height:340px;
      overflow:hidden;
      flex-direction:column;
    }
    .ccDrop.open{display:flex;}
    .ccSearchWrap{
      position:sticky;
      top:0;
      background:#fff;
      padding:8px;
      border-bottom:1px solid var(--line);
      z-index:1;
      display:flex;
      align-items:center;
      gap:6px;
    }
    .ccSearchWrap::before{
      content:'🔍';
      font-size:13px;
      opacity:0.5;
      flex-shrink:0;
    }
    .ccSearch{
      border:1px solid var(--line);
      border-radius:8px;
      padding:8px 10px;
      font-size:14px;
      outline:none;
      width:100%;
      box-sizing:border-box;
      background:#f9fafb;
      transition: border-color 0.15s ease;
    }
    .ccSearch:focus{
      border-color:var(--accent);
      background:#fff;
    }
    .ccList{
      overflow-y:auto;
      flex:1;
    }
    .ccItem{
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px 12px;
      min-height:44px;
      cursor:pointer;
      font-size:13px;
      white-space:nowrap;
      transition: background 0.12s ease;
    }
    .ccItem:hover,.ccItem.hl{background:var(--accent);color:#fff;}
    .ccItem .ccFlag{font-size:16px;}
    .ccItem .ccCode{color:var(--muted);margin-left:auto;font-size:12px;}
    .ccItem:hover .ccCode,.ccItem.hl .ccCode{color:rgba(255,255,255,.8);}

    /* Language picker */
    .langPicker{position:relative;flex:0 0 auto;display:flex;align-items:center;gap:4px;}
    .langQuickFlags{
      display:flex;
      gap:2px;
    }
    .langFlag{
      width:36px;
      height:36px;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      border-radius:10px;
      border:2px solid transparent;
      transition: border-color 0.12s ease, transform 0.1s ease;
      flex-shrink:0;
    }
    .langFlag:hover{background:rgba(17,24,39,0.06);transform:scale(1.12);}
    .langFlag.active{border-color:var(--accent);}
    .langBtn{
      border:none;
      background:#fff;
      font-size:20px;
      padding:6px 10px;
      min-height:36px;
      cursor:pointer;
      line-height:1;
      border-radius:999px;
      border:1px solid var(--line);
      display:flex;
      align-items:center;
      gap:4px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .langBtn:hover{ border-color:#d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .langBtn .langLabel{
      font-size:11px;
      font-weight:800;
      color:var(--muted);
    }
    .langDrop{
      display:none;
      position:absolute;
      top:100%;
      right:0;
      z-index:999;
      background:#fff;
      border:1px solid var(--line);
      border-radius:10px;
      box-shadow:0 6px 20px rgba(0,0,0,.15);
      width:220px;
      max-height:360px;
      overflow-y:auto;
      margin-top:4px;
    }
    .langDrop.open{display:block;}
    .langItem{
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px 12px;
      min-height:44px;
      cursor:pointer;
      font-size:13px;
      white-space:nowrap;
      transition: background 0.12s ease;
    }
    .langItem:first-child{border-radius:10px 10px 0 0;}
    .langItem:last-child{border-radius:0 0 10px 10px;}
    .langItem:hover,.langItem.active{background:var(--accent);color:#fff;}
    [dir="rtl"] .langDrop{right:auto;left:0;}
    [dir="rtl"] .headerBox{flex-direction:row-reverse;}
    [dir="rtl"] .headerLeft{flex-direction:row-reverse;}
    [dir="rtl"] .langPicker{flex-direction:row-reverse;}
    @media(max-width: 650px){
      .langQuickFlags{display:none;}
      .langBtn .langLabel{display:inline;}
    }

    .serviceRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 14px;
      min-height:48px;
      border:1px solid var(--line);
      border-radius:14px;
      cursor:pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
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
      padding:12px 6px;
      min-height:44px;
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
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    }
    .timeBtn:hover{
      border-color:#d1d5db;
      box-shadow: 0 4px 12px rgba(17,24,39,0.06);
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
      padding:12px 20px;
      min-height:44px;
      font-weight:750;
      font-size:13px;
      cursor:pointer;
      background:#111827;
      color:#fff;
      box-shadow: 0 8px 18px rgba(0,0,0,0.12);
      white-space:nowrap;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }
    .btn:hover{ opacity:0.88; transform: translateY(-1px); }
    .btn:active{ transform: translateY(1px); opacity:1; }
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
    .btnGhost:hover{ background: rgba(17,24,39,0.04); opacity:1; }

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

    /* Global focus-visible ring */
    :focus-visible{
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    input:focus-visible, select:focus-visible, textarea:focus-visible{
      outline: none; /* handled by border/shadow above */
    }

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
      opacity:0;
      transition: opacity 0.2s ease;
    }
    .overlay.show{ opacity:1; }
    .modal{
      width: min(720px, 100%);
      background:#fff;
      border-radius:18px;
      padding:20px;
      border:1px solid var(--line);
      box-shadow: var(--shadow);
      transform: translateY(10px) scale(0.98);
      transition: transform 0.2s ease;
    }
    .overlay.show .modal{
      transform: translateY(0) scale(1);
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

    /* Spinola inline offer (replaces time grid when no Potter's slots) */
    .spinola-inline{
      display:none;
      margin-top:8px;
    }
    .spinola-inline.show{
      display:block;
    }
    .spinola-inline h3{
      margin:0 0 6px 0;
      font-size:16px;
      font-weight:900;
    }
    .spinola-inline .spinola-subtitle{
      margin:0 0 16px 0;
      font-size:13px;
      color:var(--muted);
    }
    .spinola-option-card{
      border:1px solid var(--line);
      border-radius:14px;
      padding:14px;
      margin-bottom:12px;
      transition: border-color 0.15s;
    }
    .spinola-option-card:hover{
      border-color:var(--accent);
    }
    .spinola-option-card h4{
      margin:0 0 4px 0;
      font-size:14px;
      font-weight:700;
    }
    .spinola-option-card .spinola-loc-details{
      margin:0 0 10px 0;
      font-size:12px;
      color:var(--muted);
      line-height:1.4;
    }
    .spinola-option-card .spinola-date-label{
      margin:0 0 8px 0;
      font-size:12px;
      font-weight:600;
      color:var(--text);
    }
    .spinola-slots-grid{
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(80px,1fr));
      gap:6px;
      margin-bottom:8px;
    }
    .spinola-slots-grid .timeBtn{
      font-size:12px;
      padding:6px 4px;
    }
    .spinola-no-slots{
      font-size:12px;
      color:var(--muted);
      padding:8px 0;
    }
    .spinola-divider{
      text-align:center;
      font-size:12px;
      color:var(--muted);
      margin:14px 0;
    }
    .btnKevinNext{
      background:var(--accent);
      color:#111;
      border:none;
      padding:10px 14px;
      border-radius:999px;
      font-weight:700;
      font-size:13px;
      cursor:pointer;
      transition:filter 0.15s;
    }
    .btnKevinNext:hover{
      filter:brightness(1.08);
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
      transform: translateY(10px) scale(0.98);
      transition: transform 0.2s ease;
    }
    .overlay.show .loadingBox{
      transform: translateY(0) scale(1);
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

    /* Idle overlay */
    .idle-overlay{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(246,247,251,0.50);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer;opacity:0;visibility:hidden;pointer-events:none;transition:opacity 0.5s ease,visibility 0.5s ease;}
    .idle-overlay.show{opacity:1;visibility:visible;pointer-events:auto;}
    .idle-card{text-align:center;padding:48px 36px;max-width:340px;animation:idle-float 3s ease-in-out infinite;}
    .idle-icon{font-size:56px;margin-bottom:16px;animation:idle-pulse-icon 2.5s ease-in-out infinite;}
    .idle-title{font-size:22px;font-weight:800;color:var(--text);margin:0 0 8px 0;letter-spacing:-0.3px;}
    .idle-sub{font-size:14px;color:var(--muted);margin:0 0 24px 0;line-height:1.5;}
    .idle-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--accent);color:#fff;border-radius:40px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(245,179,1,0.35);transition:transform 0.2s,box-shadow 0.2s;}
    .idle-cta:hover{transform:scale(1.05);box-shadow:0 6px 28px rgba(245,179,1,0.45);}
    .idle-cta .idle-arrow{display:inline-block;transition:transform 0.3s;font-size:18px;}
    .idle-overlay:hover .idle-arrow{transform:translateX(4px);}
    @keyframes idle-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes idle-pulse-icon{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(0.95);}}
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

      <div class="langPicker" id="langPicker">
        <div class="langQuickFlags" id="langQuickFlags"></div>
        <button type="button" class="langBtn" id="langBtn">🌐 <span class="langLabel">More</span></button>
        <div class="langDrop" id="langDrop"></div>
      </div>

      <span class="pill" id="statusPill" style="display:none;">
        <span class="dot" id="statusDot"></span>
        <span id="statusText" data-i18n="ready">Ready</span>
      </span>
    </div>

    <!-- TOP: 3 columns -->
    <div class="topRow">
      <!-- Summary -->
      <div class="card topCard">
        <p class="topTitle" data-i18n="summary">Summary</p>
        <p class="topLine" id="sumService">Service: Clinic Consultation (10 mins)</p>
        <p class="topLine" id="sumDate">Date: —</p>
        <p class="topLine" id="sumTime">Time: —</p>
        <p class="topLine" id="sumLoc">Location: Potter’s Pharmacy Clinic</p>
      </div>

      <!-- Clinic hours -->
      <div class="card topCard">
        <p class="topTitle" data-i18n="clinicHours">Clinic hours</p>
        <div id="clinicHoursInfo"></div>
        <p class="topLine" id="slotInfoLine" data-i18n="slotInfo">Slots are {duration} minutes each.</p>
      </div>

      <!-- Services + Date moved into the empty third column -->
      <div class="card topCard pickCard">
        <div class="pickGrid">
          <div>
            <div class="sectionTitle" data-i18n="services">Services</div>
            <div id="services"></div>
          </div>

          <div>
            <div class="sectionTitle" data-i18n="selectDate">Select a date</div>
            <div class="label" data-i18n="availableDates">Available dates (next 7 days)</div>
            <select id="dateSelect"></select>
            <div id="dateHint" class="msg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="card main">
      <div class="sectionTitle" data-i18n="selectTime">Select a time</div>
      <div id="timeGrid" class="timeGrid"></div>
      <div id="timeHint" class="msg"></div>

      <!-- Spinola inline offer (shown when no Potter's slots & Spinola is open) -->
      <div class="spinola-inline" id="spinolaInline">
        <h3 id="spinolaTitle" data-i18n="spinolaOfferTitle">No slots available at Potter's Clinic</h3>
        <p class="spinola-subtitle" id="spinolaSubtitle" data-i18n="spinolaSubtitle">Would you like to see another doctor or try another day?</p>

        <div class="spinola-option-card" id="spinolaOptionCard">
          <h4 id="spinolaDrLabel" data-i18n="spinolaOfferDrJames">See Dr James at Spinola Clinic</h4>
          <p class="spinola-loc-details" id="spinolaLocDetails" data-i18n="spinolaLocDetails">Near McDonald's, Love Statue, near bus stop, in Spinola</p>
          <p class="spinola-date-label" id="spinolaDateLabel"></p>
          <div class="spinola-slots-grid" id="spinolaSlotsGrid"></div>
          <div class="spinola-no-slots" id="spinolaNoSlots" style="display:none" data-i18n="spinolaNoSlots">No slots available at Spinola for this date.</div>
        </div>
      </div>

      <div class="sectionTitle" style="margin-top:12px;" data-i18n="yourDetails">Your details</div>

      <div class="row">
        <div style="flex: 1 1 280px;">
          <label class="label" for="fullName" data-i18n="fullNameLabel">Full name *</label>
          <input id="fullName" type="text" autocomplete="name" placeholder="Full name" data-i18n-ph="fullNamePh">
          <div class="field-error" id="fullNameError"></div>
        </div>
        <div style="flex: 1 1 220px;">
          <label class="label" data-i18n="phoneLabel">Phone *</label>
          <div class="phoneRow">
            <div class="ccPicker" id="ccPicker">
              <button type="button" class="ccBtn" id="ccBtn" aria-label="Country code"><img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f2-1f1f9.svg" width="20" height="20" alt="" style="vertical-align:middle;"></button>
              <div class="ccDrop" id="ccDrop" role="listbox" aria-label="Country code">
                <div class="ccSearchWrap">
                  <input type="text" class="ccSearch" id="ccSearch" placeholder="Search country&#8230;" autocomplete="off" data-i18n-ph="searchCountryPh">
                </div>
                <div class="ccList" id="ccList"></div>
              </div>
            </div>
            <div class="phoneWrap" id="phoneWrap">
              <span id="dialCode" class="dialCode">+356</span>
              <input id="phone" type="tel" autocomplete="tel-national" placeholder="7900 1234">
            </div>
          </div>
          <div class="field-error" id="phoneError"></div>
        </div>
        <div style="flex: 1 1 280px;">
          <label class="label" for="email" data-i18n="emailLabel">Email *</label>
          <input id="email" type="email" autocomplete="email" placeholder="you@example.com" data-i18n-ph="emailPh">
          <div class="field-error" id="emailError"></div>
        </div>
      </div>

      <div style="margin-top:10px;">
        <label class="label" for="comments" data-i18n="commentsLabel">Comments</label>
        <textarea id="comments" placeholder="Optional notes…" data-i18n-ph="commentsPh"></textarea>
      </div>

      <div class="row" style="margin-top:10px; justify-content:flex-start;">
        <button class="btn btnAccent" id="confirmBtn" data-i18n="confirmBtn">Confirm</button>
      </div>

      <!-- Dr Kevin next day option (shown when no Potter's slots) -->
      <div class="spinola-inline" id="kevinNextSection">
        <div class="spinola-divider" id="spinolaOrDivider" data-i18n="spinolaOrDivider">&mdash; or &mdash;</div>
        <div class="spinola-option-card">
          <h4 id="spinolaKevinLabel" data-i18n="spinolaOfferDrKevin">See Dr Kevin on another day</h4>
          <p class="spinola-loc-details" id="spinolaKevinDesc" data-i18n="spinolaKevinNextDesc">We'll find the next available day for Dr Kevin at Potter's Clinic.</p>
          <button class="btnKevinNext" id="btnKevinNext" data-i18n="spinolaKevinNextBtn">Next available Dr Kevin day</button>
        </div>
      </div>

      <div id="resultMsg" class="msg"></div>
    </div>

  </div>

  <!-- Idle overlay — shown after inactivity to pause all background fetches -->
  <div class="idle-overlay" id="idleOverlay">
    <div class="idle-card">
      <div class="idle-icon">📋</div>
      <div class="idle-title">Ready to Book?</div>
      <div class="idle-sub">Tap anywhere to view the latest<br>available appointment slots</div>
      <div class="idle-cta">Start Booking <span class="idle-arrow">→</span></div>
    </div>
  </div>

  <!-- Confirmation modal -->
  <div class="overlay" id="confirmOverlay" role="dialog" aria-modal="true" aria-labelledby="confirmModalTitle">
    <div class="modal">
      <h3 id="confirmModalTitle" data-i18n="appointmentConfirmed">Appointment Confirmed</h3>
      <p id="confirmText"></p>
      <div class="modalActions">
        <button class="btn btnAccent" id="confirmOk" data-i18n="okBtn">OK</button>
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

    // ─── i18n Translation System ───
    var currentLang = 'en';

    function localDate(dateKey) {
      if (!dateKey) return dateKey;
      var parts = dateKey.split('-');
      var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      try {
        return d.toLocaleDateString(currentLang, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      } catch(e) {
        return dateKey;
      }
    }

    const LANGUAGES = [
      {code:'en',name:'English',cc:'gb'},
      {code:'fr',name:'Français',cc:'fr'},
      {code:'es',name:'Español',cc:'es'},
      {code:'pt',name:'Português',cc:'br'},
      {code:'it',name:'Italiano',cc:'it'},
      {code:'ru',name:'Русский',cc:'ru'},
      {code:'zh',name:'中文',cc:'cn'},
      {code:'ja',name:'日本語',cc:'jp'},
      {code:'hi',name:'हिन्दी',cc:'in'},
      {code:'pa',name:'ਪੰਜਾਬੀ',cc:'in'},
      {code:'tr',name:'Türkçe',cc:'tr'},
      {code:'ar',name:'العربية',cc:'sa'},
      {code:'pl',name:'Polski',cc:'pl'},
      {code:'sr',name:'Srpski',cc:'rs'},
      {code:'hr',name:'Hrvatski',cc:'hr'},
      {code:'bs',name:'Bosanski',cc:'ba'},
      {code:'uk',name:'Українська',cc:'ua'},
      {code:'fil',name:'Filipino',cc:'ph'},
      {code:'bg',name:'Български',cc:'bg'},
      {code:'ro',name:'Română',cc:'ro'},
      {code:'lt',name:'Lietuvių',cc:'lt'},
      {code:'mt',name:'Malti',cc:'mt'}
    ];

    function flagImg(cc, size) {
      size = size || 20;
      var a = (0x1f1e6 + cc.charCodeAt(0) - 97).toString(16);
      var b = (0x1f1e6 + cc.charCodeAt(1) - 97).toString(16);
      return '<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/' + a + '-' + b + '.svg" width="' + size + '" height="' + size + '" alt="" style="vertical-align:middle;" loading="lazy">';
    }

    const POPULAR_LANGS = ['en','es','pt','fr','it','ru','zh','ja'];

    const TR = {};

    TR.en = {
      summary:'Summary',clinicHours:'Clinic hours',services:'Services',selectDate:'Select a date',
      availableDates:'Available dates (next 7 days)',selectTime:'Select a time',yourDetails:'Your details',
      fullNameLabel:'Full name *',phoneLabel:'Phone *',emailLabel:'Email *',commentsLabel:'Comments',
      confirmBtn:'Confirm',appointmentConfirmed:'Appointment Confirmed',okBtn:'OK',
      clinicMF:'Mon–Fri:',clinicSat:'Sat:',clinicSun:'Sun:',closed:'Closed',
      slotInfo:'Slots are {duration} minutes each.',ready:'Ready',
      fullNamePh:'Full name',emailPh:'you@example.com',commentsPh:'Optional notes…',searchCountryPh:'Search country…',
      serviceTemplate:'Service: {0} ({1} mins)',dateTemplate:'Date: {0}',timeTemplate:'Time: {0} - {1}',
      locationTemplate:'Location: {0}',mins:'mins',
      loadingTitle:'Loading…',loadingDesc:'Please wait.',
      loadingBookingTitle:'Loading booking page…',loadingBookingDesc:'Please wait while we prepare the booking system.',
      loadingSlotsTitle:'Loading time slots…',loadingSlotsDesc:'Please wait while we fetch availability.',
      confirmingTitle:'Confirming appointment…',confirmingDesc:'Sending confirmation email and reserving your slot.',
      noSlots:'No slots available.',noDates:'No available dates in the next 7 days.',
      serviceSelected:'Service selected',loadingSlots:'Loading slots…',slotsLoaded:'Slots loaded',
      timeSelected:'Time selected',missingFields:'Missing fields',bookingStatus:'Booking…',
      unavailable:'Unavailable',errorLoadingSlots:'Error loading slots',noDatesAvailable:'No dates available',
      loadError:'Load error',bookingFailed:'Booking failed',bookingError:'Booking error',
      confirmMsg:'Your appointment has been confirmed.\\n\\nService: {0}\\nDate: {1}\\nTime: {2} - {3}\\nLocation: {4}\\n\\nA confirmation email has been sent. You can cancel from the link in that email.',
      couldNotBook:'Could not book. Please try again.',errorLoadingApp:'Error loading app: ',
      noAvailability:'No availability.',
      valService:'Please select a service.',valDate:'Please select a date.',valTime:'Please select a time slot.',
      valName:'Full name is required.',valPhone:'Phone number is required.',valEmail:'Email is required.',
      valEmailFormat:'Please enter a valid email.',timeDash:'—',
      spinolaSubtitle:'Would you like to see another doctor or try another day?',
      spinolaLocDetails:"Near McDonald's, Love Statue, near bus stop, in Spinola",
      spinolaOrDivider:'\\u2014 or \\u2014',
      spinolaOfferTitle:"No slots available at Potter's Clinic",
      spinolaOfferDrJames:'See Dr James at Spinola Clinic',
      spinolaOfferDrKevin:'See Dr Kevin on another day',
      spinolaKevinNextDesc:"We'll find the next available day for Dr Kevin at Potter's Clinic.",
      spinolaKevinNextBtn:'Next available Dr Kevin day',
      spinolaBookBtn:'Book at Spinola Clinic',
      spinolaDateSlots:'Available slots for',
      spinolaNoSlots:'No slots available at Spinola Clinic for this date.'
    };

    TR.fr = {
      summary:'Résumé',clinicHours:'Heures de la clinique',services:'Services',selectDate:'Sélectionner une date',
      availableDates:'Dates disponibles (7 prochains jours)',selectTime:'Sélectionner une heure',yourDetails:'Vos coordonnées',
      fullNameLabel:'Nom complet *',phoneLabel:'Téléphone *',emailLabel:'E-mail *',commentsLabel:'Commentaires',
      confirmBtn:'Confirmer',appointmentConfirmed:'Rendez-vous confirmé',okBtn:'OK',
      clinicMF:'Lun–Ven :',clinicSat:'Sam :',clinicSun:'Dim :',closed:'Fermé',
      slotInfo:'Les créneaux sont de {duration} minutes chacun.',ready:'Prêt',
      fullNamePh:'Nom complet',emailPh:'vous@exemple.com',commentsPh:'Notes facultatives…',searchCountryPh:'Rechercher un pays…',
      serviceTemplate:'Service : {0} ({1} min)',dateTemplate:'Date : {0}',timeTemplate:'Heure : {0} - {1}',
      locationTemplate:'Lieu : {0}',mins:'min',
      loadingTitle:'Chargement…',loadingDesc:'Veuillez patienter.',
      loadingBookingTitle:'Chargement de la page…',loadingBookingDesc:'Préparation du système de réservation.',
      loadingSlotsTitle:'Chargement des créneaux…',loadingSlotsDesc:'Récupération des disponibilités.',
      confirmingTitle:'Confirmation du rendez-vous…',confirmingDesc:'Envoi de l\\'e-mail de confirmation et réservation.',
      noSlots:'Aucun créneau disponible.',noDates:'Aucune date disponible dans les 7 prochains jours.',
      serviceSelected:'Service sélectionné',loadingSlots:'Chargement…',slotsLoaded:'Créneaux chargés',
      timeSelected:'Heure sélectionnée',missingFields:'Champs manquants',bookingStatus:'Réservation…',
      unavailable:'Indisponible',errorLoadingSlots:'Erreur de chargement',noDatesAvailable:'Aucune date disponible',
      loadError:'Erreur de chargement',bookingFailed:'Échec de la réservation',bookingError:'Erreur de réservation',
      confirmMsg:'Votre rendez-vous a été confirmé.\\n\\nService : {0}\\nDate : {1}\\nHeure : {2} - {3}\\nLieu : {4}\\n\\nUn e-mail de confirmation a été envoyé. Vous pouvez annuler via le lien dans cet e-mail.',
      couldNotBook:'Impossible de réserver. Veuillez réessayer.',errorLoadingApp:'Erreur de chargement : ',
      noAvailability:'Pas de disponibilité.',
      valService:'Veuillez sélectionner un service.',valDate:'Veuillez sélectionner une date.',valTime:'Veuillez sélectionner un créneau.',
      valName:'Le nom complet est requis.',valPhone:'Le numéro de téléphone est requis.',valEmail:'L\\'e-mail est requis.',
      valEmailFormat:'Veuillez entrer un e-mail valide.',timeDash:'—',
      spinolaSubtitle:'Souhaitez-vous voir un autre médecin ou essayer un autre jour ?',
      spinolaLocDetails:'Près de McDonald\\'s, Love Statue, près de l\\'arrêt de bus, à Spinola',
      spinolaOrDivider:'\\u2014 ou \\u2014',
      spinolaOfferTitle:'Aucun créneau disponible à Potter\\'s Clinic',
      spinolaOfferDrJames:'Voir Dr James à Spinola Clinic',
      spinolaOfferDrKevin:'Voir Dr Kevin un autre jour',
      spinolaKevinNextDesc:'Nous trouverons le prochain jour disponible pour Dr Kevin à Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Prochain jour Dr Kevin disponible',
      spinolaBookBtn:'Réserver à Spinola Clinic',
      spinolaDateSlots:'Créneaux disponibles pour',
      spinolaNoSlots:'Aucun créneau disponible à Spinola Clinic pour cette date.'
    };

    TR.es = {
      summary:'Resumen',clinicHours:'Horario de la clínica',services:'Servicios',selectDate:'Seleccionar fecha',
      availableDates:'Fechas disponibles (próximos 7 días)',selectTime:'Seleccionar hora',yourDetails:'Sus datos',
      fullNameLabel:'Nombre completo *',phoneLabel:'Teléfono *',emailLabel:'Correo electrónico *',commentsLabel:'Comentarios',
      confirmBtn:'Confirmar',appointmentConfirmed:'Cita confirmada',okBtn:'OK',
      clinicMF:'Lun–Vie:',clinicSat:'Sáb:',clinicSun:'Dom:',closed:'Cerrado',
      slotInfo:'Los turnos son de {duration} minutos cada uno.',ready:'Listo',
      fullNamePh:'Nombre completo',emailPh:'tu@ejemplo.com',commentsPh:'Notas opcionales…',searchCountryPh:'Buscar país…',
      serviceTemplate:'Servicio: {0} ({1} min)',dateTemplate:'Fecha: {0}',timeTemplate:'Hora: {0} - {1}',
      locationTemplate:'Ubicación: {0}',mins:'min',
      loadingTitle:'Cargando…',loadingDesc:'Por favor espere.',
      loadingBookingTitle:'Cargando página…',loadingBookingDesc:'Preparando el sistema de reservas.',
      loadingSlotsTitle:'Cargando horarios…',loadingSlotsDesc:'Obteniendo disponibilidad.',
      confirmingTitle:'Confirmando cita…',confirmingDesc:'Enviando correo de confirmación y reservando su turno.',
      noSlots:'No hay turnos disponibles.',noDates:'No hay fechas disponibles en los próximos 7 días.',
      serviceSelected:'Servicio seleccionado',loadingSlots:'Cargando…',slotsLoaded:'Turnos cargados',
      timeSelected:'Hora seleccionada',missingFields:'Campos faltantes',bookingStatus:'Reservando…',
      unavailable:'No disponible',errorLoadingSlots:'Error al cargar',noDatesAvailable:'Sin fechas disponibles',
      loadError:'Error de carga',bookingFailed:'Error en la reserva',bookingError:'Error de reserva',
      confirmMsg:'Su cita ha sido confirmada.\\n\\nServicio: {0}\\nFecha: {1}\\nHora: {2} - {3}\\nUbicación: {4}\\n\\nSe ha enviado un correo de confirmación. Puede cancelar desde el enlace en ese correo.',
      couldNotBook:'No se pudo reservar. Inténtelo de nuevo.',errorLoadingApp:'Error al cargar: ',
      noAvailability:'Sin disponibilidad.',
      valService:'Seleccione un servicio.',valDate:'Seleccione una fecha.',valTime:'Seleccione un turno.',
      valName:'El nombre completo es obligatorio.',valPhone:'El teléfono es obligatorio.',valEmail:'El correo es obligatorio.',
      valEmailFormat:'Ingrese un correo válido.',timeDash:'—',
      spinolaSubtitle:'¿Le gustaría ver a otro médico o probar otro día?',
      spinolaLocDetails:'Cerca de McDonald\\'s, Love Statue, cerca de la parada de autobús, en Spinola',
      spinolaOrDivider:'\\u2014 o \\u2014',
      spinolaOfferTitle:'No hay turnos disponibles en Potter\\'s Clinic',
      spinolaOfferDrJames:'Ver Dr James en Spinola Clinic',
      spinolaOfferDrKevin:'Ver Dr Kevin otro día',
      spinolaKevinNextDesc:'Buscaremos el próximo día disponible para Dr Kevin en Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Próximo día Dr Kevin disponible',
      spinolaBookBtn:'Reservar en Spinola Clinic',
      spinolaDateSlots:'Turnos disponibles para',
      spinolaNoSlots:'No hay turnos disponibles en Spinola Clinic para esta fecha.'
    };

    TR.it = {
      summary:'Riepilogo',clinicHours:'Orari della clinica',services:'Servizi',selectDate:'Seleziona una data',
      availableDates:'Date disponibili (prossimi 7 giorni)',selectTime:'Seleziona un orario',yourDetails:'I tuoi dati',
      fullNameLabel:'Nome completo *',phoneLabel:'Telefono *',emailLabel:'Email *',commentsLabel:'Commenti',
      confirmBtn:'Conferma',appointmentConfirmed:'Appuntamento confermato',okBtn:'OK',
      clinicMF:'Lun–Ven:',clinicSat:'Sab:',clinicSun:'Dom:',closed:'Chiuso',
      slotInfo:'Gli slot sono di {duration} minuti ciascuno.',ready:'Pronto',
      fullNamePh:'Nome completo',emailPh:'tu@esempio.com',commentsPh:'Note facoltative…',searchCountryPh:'Cerca paese…',
      serviceTemplate:'Servizio: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Orario: {0} - {1}',
      locationTemplate:'Luogo: {0}',mins:'min',
      loadingTitle:'Caricamento…',loadingDesc:'Attendere prego.',
      loadingBookingTitle:'Caricamento pagina…',loadingBookingDesc:'Preparazione del sistema di prenotazione.',
      loadingSlotsTitle:'Caricamento orari…',loadingSlotsDesc:'Recupero disponibilità.',
      confirmingTitle:'Conferma appuntamento…',confirmingDesc:'Invio email di conferma e prenotazione.',
      noSlots:'Nessuno slot disponibile.',noDates:'Nessuna data disponibile nei prossimi 7 giorni.',
      serviceSelected:'Servizio selezionato',loadingSlots:'Caricamento…',slotsLoaded:'Orari caricati',
      timeSelected:'Orario selezionato',missingFields:'Campi mancanti',bookingStatus:'Prenotazione…',
      unavailable:'Non disponibile',errorLoadingSlots:'Errore di caricamento',noDatesAvailable:'Nessuna data disponibile',
      loadError:'Errore di caricamento',bookingFailed:'Prenotazione fallita',bookingError:'Errore di prenotazione',
      confirmMsg:'Il tuo appuntamento è stato confermato.\\n\\nServizio: {0}\\nData: {1}\\nOrario: {2} - {3}\\nLuogo: {4}\\n\\nÈ stata inviata un\\'email di conferma. Puoi cancellare dal link nell\\'email.',
      couldNotBook:'Impossibile prenotare. Riprova.',errorLoadingApp:'Errore di caricamento: ',
      noAvailability:'Nessuna disponibilità.',
      valService:'Seleziona un servizio.',valDate:'Seleziona una data.',valTime:'Seleziona un orario.',
      valName:'Il nome completo è obbligatorio.',valPhone:'Il telefono è obbligatorio.',valEmail:'L\\'email è obbligatoria.',
      valEmailFormat:'Inserisci un\\'email valida.',timeDash:'—',
      spinolaSubtitle:'Vuoi vedere un altro dottore o provare un altro giorno?',
      spinolaLocDetails:'Vicino a McDonald\\'s, Love Statue, vicino alla fermata dell\\'autobus, a Spinola',
      spinolaOrDivider:'\\u2014 oppure \\u2014',
      spinolaOfferTitle:'Nessuno slot disponibile presso la Clinica Potter\\'s',
      spinolaOfferDrJames:'Vedi Dr James alla Clinica Spinola',
      spinolaOfferDrKevin:'Vedi Dr Kevin un altro giorno',
      spinolaKevinNextDesc:'Troveremo il prossimo giorno disponibile per Dr Kevin alla Clinica Potter\\'s.',
      spinolaKevinNextBtn:'Prossimo giorno Dr Kevin disponibile',
      spinolaBookBtn:'Prenota alla Clinica Spinola',
      spinolaDateSlots:'Slot disponibili per',
      spinolaNoSlots:'Nessuno slot disponibile alla Clinica Spinola per questa data.'
    };

    TR.zh = {
      summary:'摘要',clinicHours:'诊所时间',services:'服务',selectDate:'选择日期',
      availableDates:'可用日期（未来7天）',selectTime:'选择时间',yourDetails:'您的信息',
      fullNameLabel:'全名 *',phoneLabel:'电话 *',emailLabel:'邮箱 *',commentsLabel:'备注',
      confirmBtn:'确认',appointmentConfirmed:'预约已确认',okBtn:'确定',
      clinicMF:'周一至周五：',clinicSat:'周六：',clinicSun:'周日：',closed:'休息',
      slotInfo:'每个时段为{duration}分钟。',ready:'就绪',
      fullNamePh:'全名',emailPh:'you@example.com',commentsPh:'可选备注…',searchCountryPh:'搜索国家…',
      serviceTemplate:'服务：{0}（{1}分钟）',dateTemplate:'日期：{0}',timeTemplate:'时间：{0} - {1}',
      locationTemplate:'地点：{0}',mins:'分钟',
      loadingTitle:'加载中…',loadingDesc:'请稍候。',
      loadingBookingTitle:'加载预约页面…',loadingBookingDesc:'正在准备预约系统。',
      loadingSlotsTitle:'加载时段…',loadingSlotsDesc:'正在获取可用时间。',
      confirmingTitle:'确认预约中…',confirmingDesc:'正在发送确认邮件并预留时段。',
      noSlots:'没有可用时段。',noDates:'未来7天没有可用日期。',
      serviceSelected:'已选服务',loadingSlots:'加载中…',slotsLoaded:'时段已加载',
      timeSelected:'已选时间',missingFields:'缺少信息',bookingStatus:'预约中…',
      unavailable:'不可用',errorLoadingSlots:'加载错误',noDatesAvailable:'无可用日期',
      loadError:'加载错误',bookingFailed:'预约失败',bookingError:'预约错误',
      confirmMsg:'您的预约已确认。\\n\\n服务：{0}\\n日期：{1}\\n时间：{2} - {3}\\n地点：{4}\\n\\n确认邮件已发送。您可以通过邮件中的链接取消预约。',
      couldNotBook:'无法预约，请重试。',errorLoadingApp:'加载错误：',
      noAvailability:'无可用时间。',
      valService:'请选择服务。',valDate:'请选择日期。',valTime:'请选择时段。',
      valName:'请填写全名。',valPhone:'请填写电话号码。',valEmail:'请填写邮箱。',
      valEmailFormat:'请输入有效的邮箱地址。',timeDash:'—',
      spinolaSubtitle:'您想看另一位医生还是换一天？',
      spinolaLocDetails:'靠近麦当劳、Love Statue、公交车站附近，Spinola',
      spinolaOrDivider:'\\u2014 或 \\u2014',
      spinolaOfferTitle:'Potter\\'s Clinic 没有可用时段',
      spinolaOfferDrJames:'在 Spinola Clinic 看 Dr James',
      spinolaOfferDrKevin:'换一天看 Dr Kevin',
      spinolaKevinNextDesc:'我们会为您查找 Dr Kevin 在 Potter\\'s Clinic 的下一个可用日期。',
      spinolaKevinNextBtn:'下一个 Dr Kevin 可用日',
      spinolaBookBtn:'在 Spinola Clinic 预约',
      spinolaDateSlots:'可用时段：',
      spinolaNoSlots:'Spinola Clinic 在此日期没有可用时段。'
    };

    TR.hi = {
      summary:'सारांश',clinicHours:'क्लिनिक समय',services:'सेवाएँ',selectDate:'तारीख चुनें',
      availableDates:'उपलब्ध तारीखें (अगले 7 दिन)',selectTime:'समय चुनें',yourDetails:'आपकी जानकारी',
      fullNameLabel:'पूरा नाम *',phoneLabel:'फ़ोन *',emailLabel:'ईमेल *',commentsLabel:'टिप्पणियाँ',
      confirmBtn:'पुष्टि करें',appointmentConfirmed:'अपॉइंटमेंट की पुष्टि हो गई',okBtn:'ठीक है',
      clinicMF:'सोम–शुक्र:',clinicSat:'शनि:',clinicSun:'रवि:',closed:'बंद',
      slotInfo:'प्रत्येक स्लॉट {duration} मिनट का है।',ready:'तैयार',
      fullNamePh:'पूरा नाम',emailPh:'you@example.com',commentsPh:'वैकल्पिक नोट्स…',searchCountryPh:'देश खोजें…',
      serviceTemplate:'सेवा: {0} ({1} मिनट)',dateTemplate:'तारीख: {0}',timeTemplate:'समय: {0} - {1}',
      locationTemplate:'स्थान: {0}',mins:'मिनट',
      loadingTitle:'लोड हो रहा है…',loadingDesc:'कृपया प्रतीक्षा करें।',
      loadingBookingTitle:'बुकिंग पेज लोड हो रहा है…',loadingBookingDesc:'बुकिंग सिस्टम तैयार हो रहा है।',
      loadingSlotsTitle:'समय स्लॉट लोड हो रहे हैं…',loadingSlotsDesc:'उपलब्धता प्राप्त हो रही है।',
      confirmingTitle:'अपॉइंटमेंट की पुष्टि हो रही है…',confirmingDesc:'पुष्टि ईमेल भेजा जा रहा है।',
      noSlots:'कोई स्लॉट उपलब्ध नहीं।',noDates:'अगले 7 दिनों में कोई तारीख उपलब्ध नहीं।',
      serviceSelected:'सेवा चयनित',loadingSlots:'लोड हो रहा है…',slotsLoaded:'स्लॉट लोड हो गए',
      timeSelected:'समय चयनित',missingFields:'जानकारी अधूरी',bookingStatus:'बुकिंग…',
      unavailable:'अनुपलब्ध',errorLoadingSlots:'लोड त्रुटि',noDatesAvailable:'कोई तारीख उपलब्ध नहीं',
      loadError:'लोड त्रुटि',bookingFailed:'बुकिंग विफल',bookingError:'बुकिंग त्रुटि',
      confirmMsg:'आपकी अपॉइंटमेंट की पुष्टि हो गई है।\\n\\nसेवा: {0}\\nतारीख: {1}\\nसमय: {2} - {3}\\nस्थान: {4}\\n\\nपुष्टि ईमेल भेजा गया है। आप उस ईमेल में दिए गए लिंक से रद्द कर सकते हैं।',
      couldNotBook:'बुकिंग नहीं हो सकी। कृपया पुनः प्रयास करें।',errorLoadingApp:'लोड त्रुटि: ',
      noAvailability:'कोई उपलब्धता नहीं।',
      valService:'कृपया एक सेवा चुनें।',valDate:'कृपया एक तारीख चुनें।',valTime:'कृपया एक समय स्लॉट चुनें।',
      valName:'पूरा नाम आवश्यक है।',valPhone:'फ़ोन नंबर आवश्यक है।',valEmail:'ईमेल आवश्यक है।',
      valEmailFormat:'कृपया एक मान्य ईमेल दर्ज करें।',timeDash:'—',
      spinolaSubtitle:'क्या आप किसी अन्य डॉक्टर को दिखाना चाहेंगे या कोई अन्य दिन आज़माना चाहेंगे?',
      spinolaLocDetails:'McDonald\\'s के पास, Love Statue, बस स्टॉप के पास, Spinola में',
      spinolaOrDivider:'\\u2014 या \\u2014',
      spinolaOfferTitle:'Potter\\'s Clinic में कोई स्लॉट उपलब्ध नहीं',
      spinolaOfferDrJames:'Spinola Clinic में Dr James से मिलें',
      spinolaOfferDrKevin:'Dr Kevin को किसी अन्य दिन दिखाएँ',
      spinolaKevinNextDesc:'हम Potter\\'s Clinic में Dr Kevin के लिए अगला उपलब्ध दिन खोजेंगे।',
      spinolaKevinNextBtn:'अगला Dr Kevin उपलब्ध दिन',
      spinolaBookBtn:'Spinola Clinic में बुक करें',
      spinolaDateSlots:'उपलब्ध स्लॉट:',
      spinolaNoSlots:'इस तारीख के लिए Spinola Clinic में कोई स्लॉट उपलब्ध नहीं।'
    };

    TR.pt = {
      summary:'Resumo',clinicHours:'Horário da clínica',services:'Serviços',selectDate:'Selecionar data',
      availableDates:'Datas disponíveis (próximos 7 dias)',selectTime:'Selecionar horário',yourDetails:'Seus dados',
      fullNameLabel:'Nome completo *',phoneLabel:'Telefone *',emailLabel:'E-mail *',commentsLabel:'Comentários',
      confirmBtn:'Confirmar',appointmentConfirmed:'Consulta confirmada',okBtn:'OK',
      clinicMF:'Seg–Sex:',clinicSat:'Sáb:',clinicSun:'Dom:',closed:'Fechado',
      slotInfo:'Os horários são de {duration} minutos cada.',ready:'Pronto',
      fullNamePh:'Nome completo',emailPh:'voce@exemplo.com',commentsPh:'Notas opcionais…',searchCountryPh:'Pesquisar país…',
      serviceTemplate:'Serviço: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Horário: {0} - {1}',
      locationTemplate:'Local: {0}',mins:'min',
      loadingTitle:'Carregando…',loadingDesc:'Por favor aguarde.',
      loadingBookingTitle:'Carregando página…',loadingBookingDesc:'Preparando o sistema de agendamento.',
      loadingSlotsTitle:'Carregando horários…',loadingSlotsDesc:'Buscando disponibilidade.',
      confirmingTitle:'Confirmando consulta…',confirmingDesc:'Enviando e-mail de confirmação e reservando horário.',
      noSlots:'Nenhum horário disponível.',noDates:'Nenhuma data disponível nos próximos 7 dias.',
      serviceSelected:'Serviço selecionado',loadingSlots:'Carregando…',slotsLoaded:'Horários carregados',
      timeSelected:'Horário selecionado',missingFields:'Campos faltando',bookingStatus:'Agendando…',
      unavailable:'Indisponível',errorLoadingSlots:'Erro ao carregar',noDatesAvailable:'Sem datas disponíveis',
      loadError:'Erro de carregamento',bookingFailed:'Falha no agendamento',bookingError:'Erro no agendamento',
      confirmMsg:'Sua consulta foi confirmada.\\n\\nServiço: {0}\\nData: {1}\\nHorário: {2} - {3}\\nLocal: {4}\\n\\nUm e-mail de confirmação foi enviado. Você pode cancelar pelo link no e-mail.',
      couldNotBook:'Não foi possível agendar. Tente novamente.',errorLoadingApp:'Erro ao carregar: ',
      noAvailability:'Sem disponibilidade.',
      valService:'Selecione um serviço.',valDate:'Selecione uma data.',valTime:'Selecione um horário.',
      valName:'Nome completo é obrigatório.',valPhone:'Telefone é obrigatório.',valEmail:'E-mail é obrigatório.',
      valEmailFormat:'Insira um e-mail válido.',timeDash:'—',
      spinolaSubtitle:'Gostaria de ver outro médico ou tentar outro dia?',
      spinolaLocDetails:'Perto do McDonald\\'s, Love Statue, perto da paragem de autocarro, em Spinola',
      spinolaOrDivider:'\\u2014 ou \\u2014',
      spinolaOfferTitle:'Sem horários disponíveis em Potter\\'s Clinic',
      spinolaOfferDrJames:'Ver Dr James em Spinola Clinic',
      spinolaOfferDrKevin:'Ver Dr Kevin noutro dia',
      spinolaKevinNextDesc:'Encontraremos o próximo dia disponível para Dr Kevin em Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Próximo dia Dr Kevin disponível',
      spinolaBookBtn:'Reservar em Spinola Clinic',
      spinolaDateSlots:'Horários disponíveis para',
      spinolaNoSlots:'Sem horários disponíveis em Spinola Clinic para esta data.'
    };

    TR.ru = {
      summary:'Сводка',clinicHours:'Часы работы клиники',services:'Услуги',selectDate:'Выберите дату',
      availableDates:'Доступные даты (ближайшие 7 дней)',selectTime:'Выберите время',yourDetails:'Ваши данные',
      fullNameLabel:'ФИО *',phoneLabel:'Телефон *',emailLabel:'Эл. почта *',commentsLabel:'Комментарии',
      confirmBtn:'Подтвердить',appointmentConfirmed:'Запись подтверждена',okBtn:'ОК',
      clinicMF:'Пн–Пт:',clinicSat:'Сб:',clinicSun:'Вс:',closed:'Закрыто',
      slotInfo:'Каждый слот — {duration} минут.',ready:'Готово',
      fullNamePh:'ФИО',emailPh:'you@example.com',commentsPh:'Необязательные заметки…',searchCountryPh:'Поиск страны…',
      serviceTemplate:'Услуга: {0} ({1} мин)',dateTemplate:'Дата: {0}',timeTemplate:'Время: {0} - {1}',
      locationTemplate:'Место: {0}',mins:'мин',
      loadingTitle:'Загрузка…',loadingDesc:'Пожалуйста, подождите.',
      loadingBookingTitle:'Загрузка страницы…',loadingBookingDesc:'Подготовка системы записи.',
      loadingSlotsTitle:'Загрузка слотов…',loadingSlotsDesc:'Получение доступных слотов.',
      confirmingTitle:'Подтверждение записи…',confirmingDesc:'Отправка подтверждения и бронирование.',
      noSlots:'Нет доступных слотов.',noDates:'Нет доступных дат в ближайшие 7 дней.',
      serviceSelected:'Услуга выбрана',loadingSlots:'Загрузка…',slotsLoaded:'Слоты загружены',
      timeSelected:'Время выбрано',missingFields:'Не все поля заполнены',bookingStatus:'Запись…',
      unavailable:'Недоступно',errorLoadingSlots:'Ошибка загрузки',noDatesAvailable:'Нет доступных дат',
      loadError:'Ошибка загрузки',bookingFailed:'Ошибка записи',bookingError:'Ошибка записи',
      confirmMsg:'Ваша запись подтверждена.\\n\\nУслуга: {0}\\nДата: {1}\\nВремя: {2} - {3}\\nМесто: {4}\\n\\nПисьмо с подтверждением отправлено. Отменить можно по ссылке в письме.',
      couldNotBook:'Не удалось записаться. Попробуйте снова.',errorLoadingApp:'Ошибка загрузки: ',
      noAvailability:'Нет доступного времени.',
      valService:'Выберите услугу.',valDate:'Выберите дату.',valTime:'Выберите время.',
      valName:'ФИО обязательно.',valPhone:'Телефон обязателен.',valEmail:'Эл. почта обязательна.',
      valEmailFormat:'Введите корректный адрес эл. почты.',timeDash:'—',
      spinolaSubtitle:'Хотите записаться к другому врачу или попробовать другой день?',
      spinolaLocDetails:'Рядом с McDonald\\'s, Love Statue, рядом с автобусной остановкой, в Spinola',
      spinolaOrDivider:'\\u2014 или \\u2014',
      spinolaOfferTitle:'Нет свободных слотов в Potter\\'s Clinic',
      spinolaOfferDrJames:'Записаться к Dr James в Spinola Clinic',
      spinolaOfferDrKevin:'Записаться к Dr Kevin на другой день',
      spinolaKevinNextDesc:'Мы найдём ближайший свободный день для Dr Kevin в Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Ближайший день Dr Kevin',
      spinolaBookBtn:'Записаться в Spinola Clinic',
      spinolaDateSlots:'Доступные слоты на',
      spinolaNoSlots:'Нет свободных слотов в Spinola Clinic на эту дату.'
    };


    TR.ja = {
      summary:'概要',clinicHours:'診療時間',services:'サービス',selectDate:'日付を選択',
      availableDates:'予約可能な日付（7日間）',selectTime:'時間を選択',yourDetails:'お客様情報',
      fullNameLabel:'氏名 *',phoneLabel:'電話番号 *',emailLabel:'メール *',commentsLabel:'コメント',
      confirmBtn:'確認',appointmentConfirmed:'予約が確定しました',okBtn:'OK',
      clinicMF:'月〜金：',clinicSat:'土：',clinicSun:'日：',closed:'休診',
      slotInfo:'各スロットは{duration}分間です。',ready:'準備完了',
      fullNamePh:'氏名',emailPh:'you@example.com',commentsPh:'メモ（任意）…',searchCountryPh:'国を検索…',
      serviceTemplate:'サービス：{0}（{1}分）',dateTemplate:'日付：{0}',timeTemplate:'時間：{0} - {1}',
      locationTemplate:'場所：{0}',mins:'分',
      loadingTitle:'読み込み中…',loadingDesc:'お待ちください。',
      loadingBookingTitle:'予約ページを読み込み中…',loadingBookingDesc:'予約システムを準備しています。',
      loadingSlotsTitle:'時間枠を読み込み中…',loadingSlotsDesc:'空き状況を取得しています。',
      confirmingTitle:'予約を確認中…',confirmingDesc:'確認メールを送信し、予約を確保しています。',
      noSlots:'利用可能な時間枠がありません。',noDates:'7日間に利用可能な日付がありません。',
      serviceSelected:'サービス選択済み',loadingSlots:'読み込み中…',slotsLoaded:'時間枠を読み込みました',
      timeSelected:'時間選択済み',missingFields:'未入力の項目があります',bookingStatus:'予約中…',
      unavailable:'利用不可',errorLoadingSlots:'読み込みエラー',noDatesAvailable:'利用可能な日付なし',
      loadError:'読み込みエラー',bookingFailed:'予約に失敗しました',bookingError:'予約エラー',
      confirmMsg:'ご予約が確定しました。\\n\\nサービス：{0}\\n日付：{1}\\n時間：{2} - {3}\\n場所：{4}\\n\\n確認メールが送信されました。メール内のリンクからキャンセルできます。',
      couldNotBook:'予約できませんでした。もう一度お試しください。',errorLoadingApp:'読み込みエラー：',
      noAvailability:'空きがありません。',
      valService:'サービスを選択してください。',valDate:'日付を選択してください。',valTime:'時間枠を選択してください。',
      valName:'氏名は必須です。',valPhone:'電話番号は必須です。',valEmail:'メールは必須です。',
      valEmailFormat:'有効なメールアドレスを入力してください。',timeDash:'—',
      spinolaSubtitle:'別の医師の診察を希望しますか、それとも別の日をお試しになりますか？',
      spinolaLocDetails:'マクドナルド近く、Love Statue、バス停近く、Spinola',
      spinolaOrDivider:'\\u2014 または \\u2014',
      spinolaOfferTitle:'Potter\\'s Clinic に空きがありません',
      spinolaOfferDrJames:'Spinola Clinic で Dr James の診察',
      spinolaOfferDrKevin:'別の日に Dr Kevin の診察',
      spinolaKevinNextDesc:'Potter\\'s Clinic での Dr Kevin の次の空き日を検索します。',
      spinolaKevinNextBtn:'次の Dr Kevin 空き日',
      spinolaBookBtn:'Spinola Clinic で予約',
      spinolaDateSlots:'利用可能な時間帯：',
      spinolaNoSlots:'この日は Spinola Clinic に空きがありません。'
    };

    TR.pa = {
      summary:'ਸਾਰ',clinicHours:'ਕਲੀਨਿਕ ਦੇ ਸਮੇਂ',services:'ਸੇਵਾਵਾਂ',selectDate:'ਤਾਰੀਖ ਚੁਣੋ',
      availableDates:'ਉਪਲਬਧ ਤਾਰੀਖਾਂ (ਅਗਲੇ 7 ਦਿਨ)',selectTime:'ਸਮਾਂ ਚੁਣੋ',yourDetails:'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ',
      fullNameLabel:'ਪੂਰਾ ਨਾਮ *',phoneLabel:'ਫ਼ੋਨ *',emailLabel:'ਈਮੇਲ *',commentsLabel:'ਟਿੱਪਣੀਆਂ',
      confirmBtn:'ਪੁਸ਼ਟੀ ਕਰੋ',appointmentConfirmed:'ਅਪੌਇੰਟਮੈਂਟ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ',okBtn:'ਠੀਕ ਹੈ',
      clinicMF:'ਸੋਮ–ਸ਼ੁੱਕਰ:',clinicSat:'ਸ਼ਨੀ:',clinicSun:'ਐਤ:',closed:'ਬੰਦ',
      slotInfo:'ਹਰ ਸਲਾਟ {duration} ਮਿੰਟ ਦਾ ਹੈ।',ready:'ਤਿਆਰ',
      fullNamePh:'ਪੂਰਾ ਨਾਮ',emailPh:'you@example.com',commentsPh:'ਵਿਕਲਪਿਕ ਨੋਟਸ…',searchCountryPh:'ਦੇਸ਼ ਖੋਜੋ…',
      serviceTemplate:'ਸੇਵਾ: {0} ({1} ਮਿੰਟ)',dateTemplate:'ਤਾਰੀਖ: {0}',timeTemplate:'ਸਮਾਂ: {0} - {1}',
      locationTemplate:'ਸਥਾਨ: {0}',mins:'ਮਿੰਟ',
      loadingTitle:'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',loadingDesc:'ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ।',
      loadingBookingTitle:'ਬੁਕਿੰਗ ਪੇਜ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',loadingBookingDesc:'ਬੁਕਿੰਗ ਸਿਸਟਮ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ।',
      loadingSlotsTitle:'ਸਮਾਂ ਸਲਾਟ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…',loadingSlotsDesc:'ਉਪਲਬਧਤਾ ਪ੍ਰਾਪਤ ਹੋ ਰਹੀ ਹੈ।',
      confirmingTitle:'ਅਪੌਇੰਟਮੈਂਟ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਰਹੀ ਹੈ…',confirmingDesc:'ਪੁਸ਼ਟੀ ਈਮੇਲ ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ।',
      noSlots:'ਕੋਈ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ।',noDates:'ਅਗਲੇ 7 ਦਿਨਾਂ ਵਿੱਚ ਕੋਈ ਤਾਰੀਖ ਉਪਲਬਧ ਨਹੀਂ।',
      serviceSelected:'ਸੇਵਾ ਚੁਣੀ ਗਈ',loadingSlots:'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',slotsLoaded:'ਸਲਾਟ ਲੋਡ ਹੋ ਗਏ',
      timeSelected:'ਸਮਾਂ ਚੁਣਿਆ ਗਿਆ',missingFields:'ਜਾਣਕਾਰੀ ਅਧੂਰੀ',bookingStatus:'ਬੁਕਿੰਗ…',
      unavailable:'ਅਣਉਪਲਬਧ',errorLoadingSlots:'ਲੋਡ ਗਲਤੀ',noDatesAvailable:'ਕੋਈ ਤਾਰੀਖ ਉਪਲਬਧ ਨਹੀਂ',
      loadError:'ਲੋਡ ਗਲਤੀ',bookingFailed:'ਬੁਕਿੰਗ ਅਸਫਲ',bookingError:'ਬੁਕਿੰਗ ਗਲਤੀ',
      confirmMsg:'ਤੁਹਾਡੀ ਅਪੌਇੰਟਮੈਂਟ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ ਹੈ।\\n\\nਸੇਵਾ: {0}\\nਤਾਰੀਖ: {1}\\nਸਮਾਂ: {2} - {3}\\nਸਥਾਨ: {4}\\n\\nਪੁਸ਼ਟੀ ਈਮੇਲ ਭੇਜੀ ਗਈ ਹੈ। ਤੁਸੀਂ ਈਮੇਲ ਵਿੱਚ ਦਿੱਤੇ ਲਿੰਕ ਤੋਂ ਰੱਦ ਕਰ ਸਕਦੇ ਹੋ।',
      couldNotBook:'ਬੁਕਿੰਗ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',errorLoadingApp:'ਲੋਡ ਗਲਤੀ: ',
      noAvailability:'ਕੋਈ ਉਪਲਬਧਤਾ ਨਹੀਂ।',
      valService:'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸੇਵਾ ਚੁਣੋ।',valDate:'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਤਾਰੀਖ ਚੁਣੋ।',valTime:'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ।',
      valName:'ਪੂਰਾ ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ।',valPhone:'ਫ਼ੋਨ ਨੰਬਰ ਜ਼ਰੂਰੀ ਹੈ।',valEmail:'ਈਮੇਲ ਜ਼ਰੂਰੀ ਹੈ।',
      valEmailFormat:'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਈਮੇਲ ਦਰਜ ਕਰੋ।',timeDash:'—',
      spinolaSubtitle:'ਕੀ ਤੁਸੀਂ ਕਿਸੇ ਹੋਰ ਡਾਕਟਰ ਨੂੰ ਮਿਲਣਾ ਚਾਹੋਗੇ ਜਾਂ ਕੋਈ ਹੋਰ ਦਿਨ ਅਜ਼ਮਾਉਣਾ ਚਾਹੋਗੇ?',
      spinolaLocDetails:'McDonald\\'s ਦੇ ਨੇੜੇ, Love Statue, ਬੱਸ ਸਟਾਪ ਦੇ ਨੇੜੇ, Spinola ਵਿੱਚ',
      spinolaOrDivider:'\\u2014 ਜਾਂ \\u2014',
      spinolaOfferTitle:'Potter\\'s Clinic ਵਿੱਚ ਕੋਈ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ',
      spinolaOfferDrJames:'Spinola Clinic ਵਿੱਚ Dr James ਨੂੰ ਮਿਲੋ',
      spinolaOfferDrKevin:'Dr Kevin ਨੂੰ ਕਿਸੇ ਹੋਰ ਦਿਨ ਮਿਲੋ',
      spinolaKevinNextDesc:'ਅਸੀਂ Potter\\'s Clinic ਵਿੱਚ Dr Kevin ਲਈ ਅਗਲਾ ਉਪਲਬਧ ਦਿਨ ਲੱਭਾਂਗੇ।',
      spinolaKevinNextBtn:'ਅਗਲਾ Dr Kevin ਉਪਲਬਧ ਦਿਨ',
      spinolaBookBtn:'Spinola Clinic ਵਿੱਚ ਬੁੱਕ ਕਰੋ',
      spinolaDateSlots:'ਉਪਲਬਧ ਸਲਾਟ:',
      spinolaNoSlots:'ਇਸ ਤਾਰੀਖ਼ ਲਈ Spinola Clinic ਵਿੱਚ ਕੋਈ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ।'
    };

    TR.tr = {
      summary:'Özet',clinicHours:'Klinik saatleri',services:'Hizmetler',selectDate:'Tarih seçin',
      availableDates:'Müsait tarihler (önümüzdeki 7 gün)',selectTime:'Saat seçin',yourDetails:'Bilgileriniz',
      fullNameLabel:'Ad Soyad *',phoneLabel:'Telefon *',emailLabel:'E-posta *',commentsLabel:'Yorumlar',
      confirmBtn:'Onayla',appointmentConfirmed:'Randevu onaylandı',okBtn:'Tamam',
      clinicMF:'Pzt–Cum:',clinicSat:'Cmt:',clinicSun:'Paz:',closed:'Kapalı',
      slotInfo:'Her slot {duration} dakikadır.',ready:'Hazır',
      fullNamePh:'Ad Soyad',emailPh:'siz@ornek.com',commentsPh:'İsteğe bağlı notlar…',searchCountryPh:'Ülke ara…',
      serviceTemplate:'Hizmet: {0} ({1} dk)',dateTemplate:'Tarih: {0}',timeTemplate:'Saat: {0} - {1}',
      locationTemplate:'Konum: {0}',mins:'dk',
      loadingTitle:'Yükleniyor…',loadingDesc:'Lütfen bekleyin.',
      loadingBookingTitle:'Sayfa yükleniyor…',loadingBookingDesc:'Randevu sistemi hazırlanıyor.',
      loadingSlotsTitle:'Saatler yükleniyor…',loadingSlotsDesc:'Müsaitlik kontrol ediliyor.',
      confirmingTitle:'Randevu onaylanıyor…',confirmingDesc:'Onay e-postası gönderiliyor.',
      noSlots:'Müsait saat yok.',noDates:'Önümüzdeki 7 günde müsait tarih yok.',
      serviceSelected:'Hizmet seçildi',loadingSlots:'Yükleniyor…',slotsLoaded:'Saatler yüklendi',
      timeSelected:'Saat seçildi',missingFields:'Eksik bilgiler',bookingStatus:'Randevu alınıyor…',
      unavailable:'Müsait değil',errorLoadingSlots:'Yükleme hatası',noDatesAvailable:'Müsait tarih yok',
      loadError:'Yükleme hatası',bookingFailed:'Randevu başarısız',bookingError:'Randevu hatası',
      confirmMsg:'Randevunuz onaylandı.\\n\\nHizmet: {0}\\nTarih: {1}\\nSaat: {2} - {3}\\nKonum: {4}\\n\\nOnay e-postası gönderildi. E-postadaki bağlantıdan iptal edebilirsiniz.',
      couldNotBook:'Randevu alınamadı. Lütfen tekrar deneyin.',errorLoadingApp:'Yükleme hatası: ',
      noAvailability:'Müsaitlik yok.',
      valService:'Lütfen bir hizmet seçin.',valDate:'Lütfen bir tarih seçin.',valTime:'Lütfen bir saat seçin.',
      valName:'Ad Soyad gereklidir.',valPhone:'Telefon gereklidir.',valEmail:'E-posta gereklidir.',
      valEmailFormat:'Geçerli bir e-posta girin.',timeDash:'—',
      spinolaSubtitle:'Başka bir doktora gitmek veya başka bir gün denemek ister misiniz?',
      spinolaLocDetails:'McDonald\\'s yakınında, Love Statue, otobüs durağı yakınında, Spinola\\'da',
      spinolaOrDivider:'\\u2014 veya \\u2014',
      spinolaOfferTitle:'Potter\\'s Clinic\\'te uygun randevu yok',
      spinolaOfferDrJames:'Spinola Clinic\\'te Dr James\\'i görün',
      spinolaOfferDrKevin:'Dr Kevin\\'i başka bir gün görün',
      spinolaKevinNextDesc:'Potter\\'s Clinic\\'te Dr Kevin için bir sonraki uygun günü bulacağız.',
      spinolaKevinNextBtn:'Sonraki Dr Kevin uygun günü',
      spinolaBookBtn:'Spinola Clinic\\'te randevu alın',
      spinolaDateSlots:'Uygun randevular:',
      spinolaNoSlots:'Bu tarihte Spinola Clinic\\'te uygun randevu yok.'
    };

    TR.ar = {
      summary:'الملخص',clinicHours:'ساعات العيادة',services:'الخدمات',selectDate:'اختر تاريخًا',
      availableDates:'التواريخ المتاحة (7 أيام القادمة)',selectTime:'اختر وقتًا',yourDetails:'بياناتك',
      fullNameLabel:'الاسم الكامل *',phoneLabel:'الهاتف *',emailLabel:'البريد الإلكتروني *',commentsLabel:'ملاحظات',
      confirmBtn:'تأكيد',appointmentConfirmed:'تم تأكيد الموعد',okBtn:'موافق',
      clinicMF:'الإثنين–الجمعة:',clinicSat:'السبت:',clinicSun:'الأحد:',closed:'مغلق',
      slotInfo:'كل فترة {duration} دقائق.',ready:'جاهز',
      fullNamePh:'الاسم الكامل',emailPh:'you@example.com',commentsPh:'ملاحظات اختيارية…',searchCountryPh:'البحث عن بلد…',
      serviceTemplate:'الخدمة: {0} ({1} دقيقة)',dateTemplate:'التاريخ: {0}',timeTemplate:'الوقت: {0} - {1}',
      locationTemplate:'الموقع: {0}',mins:'دقيقة',
      loadingTitle:'جارٍ التحميل…',loadingDesc:'يرجى الانتظار.',
      loadingBookingTitle:'جارٍ تحميل صفحة الحجز…',loadingBookingDesc:'جارٍ تحضير نظام الحجز.',
      loadingSlotsTitle:'جارٍ تحميل الأوقات…',loadingSlotsDesc:'جارٍ جلب الأوقات المتاحة.',
      confirmingTitle:'جارٍ تأكيد الموعد…',confirmingDesc:'جارٍ إرسال بريد التأكيد وحجز الموعد.',
      noSlots:'لا توجد أوقات متاحة.',noDates:'لا توجد تواريخ متاحة في الأيام السبعة القادمة.',
      serviceSelected:'تم اختيار الخدمة',loadingSlots:'جارٍ التحميل…',slotsLoaded:'تم تحميل الأوقات',
      timeSelected:'تم اختيار الوقت',missingFields:'حقول ناقصة',bookingStatus:'جارٍ الحجز…',
      unavailable:'غير متاح',errorLoadingSlots:'خطأ في التحميل',noDatesAvailable:'لا تواريخ متاحة',
      loadError:'خطأ في التحميل',bookingFailed:'فشل الحجز',bookingError:'خطأ في الحجز',
      confirmMsg:'تم تأكيد موعدك.\\n\\nالخدمة: {0}\\nالتاريخ: {1}\\nالوقت: {2} - {3}\\nالموقع: {4}\\n\\nتم إرسال بريد التأكيد. يمكنك الإلغاء من الرابط في البريد.',
      couldNotBook:'تعذر الحجز. يرجى المحاولة مرة أخرى.',errorLoadingApp:'خطأ في التحميل: ',
      noAvailability:'لا توجد أوقات متاحة.',
      valService:'يرجى اختيار خدمة.',valDate:'يرجى اختيار تاريخ.',valTime:'يرجى اختيار وقت.',
      valName:'الاسم الكامل مطلوب.',valPhone:'رقم الهاتف مطلوب.',valEmail:'البريد الإلكتروني مطلوب.',
      valEmailFormat:'يرجى إدخال بريد إلكتروني صحيح.',timeDash:'—',
      spinolaSubtitle:'هل ترغب في رؤية طبيب آخر أو تجربة يوم آخر؟',
      spinolaLocDetails:'بالقرب من ماكدونالدز، Love Statue، بالقرب من موقف الحافلات، في Spinola',
      spinolaOrDivider:'\\u2014 أو \\u2014',
      spinolaOfferTitle:'لا توجد مواعيد متاحة في Potter\\'s Clinic',
      spinolaOfferDrJames:'زيارة Dr James في Spinola Clinic',
      spinolaOfferDrKevin:'زيارة Dr Kevin في يوم آخر',
      spinolaKevinNextDesc:'سنجد اليوم التالي المتاح لـ Dr Kevin في Potter\\'s Clinic.',
      spinolaKevinNextBtn:'اليوم التالي المتاح لـ Dr Kevin',
      spinolaBookBtn:'حجز في Spinola Clinic',
      spinolaDateSlots:'المواعيد المتاحة لـ',
      spinolaNoSlots:'لا توجد مواعيد متاحة في Spinola Clinic لهذا التاريخ.'
    };

    TR.pl = {
      summary:'Podsumowanie',clinicHours:'Godziny pracy kliniki',services:'Usługi',selectDate:'Wybierz datę',
      availableDates:'Dostępne daty (najbliższe 7 dni)',selectTime:'Wybierz godzinę',yourDetails:'Twoje dane',
      fullNameLabel:'Imię i nazwisko *',phoneLabel:'Telefon *',emailLabel:'E-mail *',commentsLabel:'Komentarze',
      confirmBtn:'Potwierdź',appointmentConfirmed:'Wizyta potwierdzona',okBtn:'OK',
      clinicMF:'Pon–Pt:',clinicSat:'Sob:',clinicSun:'Niedz:',closed:'Zamknięte',
      slotInfo:'Każdy slot trwa {duration} minut.',ready:'Gotowe',
      fullNamePh:'Imię i nazwisko',emailPh:'ty@przyklad.pl',commentsPh:'Opcjonalne notatki…',searchCountryPh:'Szukaj kraju…',
      serviceTemplate:'Usługa: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Godzina: {0} - {1}',
      locationTemplate:'Lokalizacja: {0}',mins:'min',
      loadingTitle:'Ładowanie…',loadingDesc:'Proszę czekać.',
      loadingBookingTitle:'Ładowanie strony…',loadingBookingDesc:'Przygotowanie systemu rezerwacji.',
      loadingSlotsTitle:'Ładowanie godzin…',loadingSlotsDesc:'Pobieranie dostępności.',
      confirmingTitle:'Potwierdzanie wizyty…',confirmingDesc:'Wysyłanie e-maila z potwierdzeniem.',
      noSlots:'Brak dostępnych godzin.',noDates:'Brak dostępnych dat w najbliższych 7 dniach.',
      serviceSelected:'Usługa wybrana',loadingSlots:'Ładowanie…',slotsLoaded:'Godziny załadowane',
      timeSelected:'Godzina wybrana',missingFields:'Brakujące pola',bookingStatus:'Rezerwacja…',
      unavailable:'Niedostępne',errorLoadingSlots:'Błąd ładowania',noDatesAvailable:'Brak dostępnych dat',
      loadError:'Błąd ładowania',bookingFailed:'Rezerwacja nieudana',bookingError:'Błąd rezerwacji',
      confirmMsg:'Twoja wizyta została potwierdzona.\\n\\nUsługa: {0}\\nData: {1}\\nGodzina: {2} - {3}\\nLokalizacja: {4}\\n\\nWysłano e-mail z potwierdzeniem. Możesz anulować z linku w e-mailu.',
      couldNotBook:'Nie udało się zarezerwować. Spróbuj ponownie.',errorLoadingApp:'Błąd ładowania: ',
      noAvailability:'Brak dostępności.',
      valService:'Wybierz usługę.',valDate:'Wybierz datę.',valTime:'Wybierz godzinę.',
      valName:'Imię i nazwisko jest wymagane.',valPhone:'Telefon jest wymagany.',valEmail:'E-mail jest wymagany.',
      valEmailFormat:'Wprowadź prawidłowy e-mail.',timeDash:'—',
      spinolaSubtitle:'Czy chcesz umówić się do innego lekarza lub spróbować innego dnia?',
      spinolaLocDetails:'Obok McDonald\\'s, Love Statue, obok przystanku autobusowego, w Spinola',
      spinolaOrDivider:'\\u2014 lub \\u2014',
      spinolaOfferTitle:'Brak dostępnych terminów w Potter\\'s Clinic',
      spinolaOfferDrJames:'Wizyta u Dr James w Spinola Clinic',
      spinolaOfferDrKevin:'Wizyta u Dr Kevin innego dnia',
      spinolaKevinNextDesc:'Znajdziemy najbliższy dostępny termin Dr Kevin w Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Następny dostępny dzień Dr Kevin',
      spinolaBookBtn:'Zarezerwuj w Spinola Clinic',
      spinolaDateSlots:'Dostępne terminy na',
      spinolaNoSlots:'Brak dostępnych terminów w Spinola Clinic na ten dzień.'
    };

    TR.sr = {
      summary:'Rezime',clinicHours:'Radno vreme klinike',services:'Usluge',selectDate:'Izaberite datum',
      availableDates:'Dostupni datumi (narednih 7 dana)',selectTime:'Izaberite vreme',yourDetails:'Vaši podaci',
      fullNameLabel:'Ime i prezime *',phoneLabel:'Telefon *',emailLabel:'E-mail *',commentsLabel:'Komentari',
      confirmBtn:'Potvrdi',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
      clinicMF:'Pon–Pet:',clinicSat:'Sub:',clinicSun:'Ned:',closed:'Zatvoreno',
      slotInfo:'Svaki termin traje {duration} minuta.',ready:'Spremno',
      fullNamePh:'Ime i prezime',emailPh:'vi@primer.com',commentsPh:'Opcione napomene…',searchCountryPh:'Pretraži državu…',
      serviceTemplate:'Usluga: {0} ({1} min)',dateTemplate:'Datum: {0}',timeTemplate:'Vreme: {0} - {1}',
      locationTemplate:'Lokacija: {0}',mins:'min',
      loadingTitle:'Učitavanje…',loadingDesc:'Molimo sačekajte.',
      loadingBookingTitle:'Učitavanje stranice…',loadingBookingDesc:'Priprema sistema za zakazivanje.',
      loadingSlotsTitle:'Učitavanje termina…',loadingSlotsDesc:'Preuzimanje dostupnosti.',
      confirmingTitle:'Potvrđivanje termina…',confirmingDesc:'Slanje e-maila za potvrdu.',
      noSlots:'Nema dostupnih termina.',noDates:'Nema dostupnih datuma u narednih 7 dana.',
      serviceSelected:'Usluga izabrana',loadingSlots:'Učitavanje…',slotsLoaded:'Termini učitani',
      timeSelected:'Vreme izabrano',missingFields:'Nedostaju polja',bookingStatus:'Zakazivanje…',
      unavailable:'Nedostupno',errorLoadingSlots:'Greška pri učitavanju',noDatesAvailable:'Nema dostupnih datuma',
      loadError:'Greška pri učitavanju',bookingFailed:'Zakazivanje neuspešno',bookingError:'Greška zakazivanja',
      confirmMsg:'Vaš termin je potvrđen.\\n\\nUsluga: {0}\\nDatum: {1}\\nVreme: {2} - {3}\\nLokacija: {4}\\n\\nPotvrda je poslata na e-mail. Možete otkazati putem linka u e-mailu.',
      couldNotBook:'Nije moguće zakazati. Pokušajte ponovo.',errorLoadingApp:'Greška pri učitavanju: ',
      noAvailability:'Nema dostupnosti.',
      valService:'Izaberite uslugu.',valDate:'Izaberite datum.',valTime:'Izaberite termin.',
      valName:'Ime i prezime je obavezno.',valPhone:'Telefon je obavezan.',valEmail:'E-mail je obavezan.',
      valEmailFormat:'Unesite ispravnu e-mail adresu.',timeDash:'—',
      spinolaSubtitle:'Да ли желите да видите другог лекара или да пробате други дан?',
      spinolaLocDetails:'Близу McDonald\\'s, Love Statue, близу аутобуске станице, у Spinola',
      spinolaOrDivider:'\\u2014 или \\u2014',
      spinolaOfferTitle:'Нема доступних термина у Potter\\'s Clinic',
      spinolaOfferDrJames:'Посетите Dr James у Spinola Clinic',
      spinolaOfferDrKevin:'Посетите Dr Kevin другог дана',
      spinolaKevinNextDesc:'Пронаћи ћемо следећи доступан дан за Dr Kevin у Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Следећи доступан дан Dr Kevin',
      spinolaBookBtn:'Резервишите у Spinola Clinic',
      spinolaDateSlots:'Доступни термини за',
      spinolaNoSlots:'Нема доступних термина у Spinola Clinic за овај датум.'
    };

    TR.hr = {
      summary:'Sažetak',clinicHours:'Radno vrijeme klinike',services:'Usluge',selectDate:'Odaberite datum',
      availableDates:'Dostupni datumi (sljedećih 7 dana)',selectTime:'Odaberite vrijeme',yourDetails:'Vaši podaci',
      fullNameLabel:'Ime i prezime *',phoneLabel:'Telefon *',emailLabel:'E-mail *',commentsLabel:'Komentari',
      confirmBtn:'Potvrdi',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
      clinicMF:'Pon–Pet:',clinicSat:'Sub:',clinicSun:'Ned:',closed:'Zatvoreno',
      slotInfo:'Svaki termin traje {duration} minuta.',ready:'Spremno',
      fullNamePh:'Ime i prezime',emailPh:'vi@primjer.com',commentsPh:'Neobavezne napomene…',searchCountryPh:'Pretraži državu…',
      serviceTemplate:'Usluga: {0} ({1} min)',dateTemplate:'Datum: {0}',timeTemplate:'Vrijeme: {0} - {1}',
      locationTemplate:'Lokacija: {0}',mins:'min',
      loadingTitle:'Učitavanje…',loadingDesc:'Molimo pričekajte.',
      loadingBookingTitle:'Učitavanje stranice…',loadingBookingDesc:'Priprema sustava za naručivanje.',
      loadingSlotsTitle:'Učitavanje termina…',loadingSlotsDesc:'Dohvaćanje dostupnosti.',
      confirmingTitle:'Potvrđivanje termina…',confirmingDesc:'Slanje e-maila za potvrdu.',
      noSlots:'Nema dostupnih termina.',noDates:'Nema dostupnih datuma u sljedećih 7 dana.',
      serviceSelected:'Usluga odabrana',loadingSlots:'Učitavanje…',slotsLoaded:'Termini učitani',
      timeSelected:'Vrijeme odabrano',missingFields:'Nedostaju polja',bookingStatus:'Naručivanje…',
      unavailable:'Nedostupno',errorLoadingSlots:'Greška učitavanja',noDatesAvailable:'Nema dostupnih datuma',
      loadError:'Greška učitavanja',bookingFailed:'Naručivanje neuspjelo',bookingError:'Greška naručivanja',
      confirmMsg:'Vaš termin je potvrđen.\\n\\nUsluga: {0}\\nDatum: {1}\\nVrijeme: {2} - {3}\\nLokacija: {4}\\n\\nPotvrda je poslana na e-mail. Možete otkazati putem linka u e-mailu.',
      couldNotBook:'Nije moguće naručiti. Pokušajte ponovo.',errorLoadingApp:'Greška učitavanja: ',
      noAvailability:'Nema dostupnosti.',
      valService:'Odaberite uslugu.',valDate:'Odaberite datum.',valTime:'Odaberite termin.',
      valName:'Ime i prezime je obavezno.',valPhone:'Telefon je obavezan.',valEmail:'E-mail je obavezan.',
      valEmailFormat:'Unesite ispravnu e-mail adresu.',timeDash:'—',
      spinolaSubtitle:'Želite li posjetiti drugog liječnika ili pokušati drugi dan?',
      spinolaLocDetails:'Blizu McDonald\\'s, Love Statue, blizu autobusne stanice, u Spinola',
      spinolaOrDivider:'\\u2014 ili \\u2014',
      spinolaOfferTitle:'Nema dostupnih termina u Potter\\'s Clinic',
      spinolaOfferDrJames:'Posjetite Dr James u Spinola Clinic',
      spinolaOfferDrKevin:'Posjetite Dr Kevin drugi dan',
      spinolaKevinNextDesc:'Pronaći ćemo sljedeći dostupan dan za Dr Kevin u Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Sljedeći dostupan dan Dr Kevin',
      spinolaBookBtn:'Rezervirajte u Spinola Clinic',
      spinolaDateSlots:'Dostupni termini za',
      spinolaNoSlots:'Nema dostupnih termina u Spinola Clinic za ovaj datum.'
    };

    TR.bs = {
      summary:'Sažetak',clinicHours:'Radno vrijeme klinike',services:'Usluge',selectDate:'Odaberite datum',
      availableDates:'Dostupni datumi (narednih 7 dana)',selectTime:'Odaberite vrijeme',yourDetails:'Vaši podaci',
      fullNameLabel:'Ime i prezime *',phoneLabel:'Telefon *',emailLabel:'E-mail *',commentsLabel:'Komentari',
      confirmBtn:'Potvrdi',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
      clinicMF:'Pon–Pet:',clinicSat:'Sub:',clinicSun:'Ned:',closed:'Zatvoreno',
      slotInfo:'Svaki termin traje {duration} minuta.',ready:'Spremno',
      fullNamePh:'Ime i prezime',emailPh:'vi@primjer.com',commentsPh:'Neobavezne napomene…',searchCountryPh:'Pretraži državu…',
      serviceTemplate:'Usluga: {0} ({1} min)',dateTemplate:'Datum: {0}',timeTemplate:'Vrijeme: {0} - {1}',
      locationTemplate:'Lokacija: {0}',mins:'min',
      loadingTitle:'Učitavanje…',loadingDesc:'Molimo pričekajte.',
      loadingBookingTitle:'Učitavanje stranice…',loadingBookingDesc:'Priprema sistema za naručivanje.',
      loadingSlotsTitle:'Učitavanje termina…',loadingSlotsDesc:'Dohvatanje dostupnosti.',
      confirmingTitle:'Potvrđivanje termina…',confirmingDesc:'Slanje e-maila za potvrdu.',
      noSlots:'Nema dostupnih termina.',noDates:'Nema dostupnih datuma u narednih 7 dana.',
      serviceSelected:'Usluga odabrana',loadingSlots:'Učitavanje…',slotsLoaded:'Termini učitani',
      timeSelected:'Vrijeme odabrano',missingFields:'Nedostaju polja',bookingStatus:'Naručivanje…',
      unavailable:'Nedostupno',errorLoadingSlots:'Greška učitavanja',noDatesAvailable:'Nema dostupnih datuma',
      loadError:'Greška učitavanja',bookingFailed:'Naručivanje neuspjelo',bookingError:'Greška naručivanja',
      confirmMsg:'Vaš termin je potvrđen.\\n\\nUsluga: {0}\\nDatum: {1}\\nVrijeme: {2} - {3}\\nLokacija: {4}\\n\\nPotvrda je poslana na e-mail. Možete otkazati putem linka u e-mailu.',
      couldNotBook:'Nije moguće naručiti. Pokušajte ponovo.',errorLoadingApp:'Greška učitavanja: ',
      noAvailability:'Nema dostupnosti.',
      valService:'Odaberite uslugu.',valDate:'Odaberite datum.',valTime:'Odaberite termin.',
      valName:'Ime i prezime je obavezno.',valPhone:'Telefon je obavezan.',valEmail:'E-mail je obavezan.',
      valEmailFormat:'Unesite ispravnu e-mail adresu.',timeDash:'—',
      spinolaSubtitle:'Želite li posjetiti drugog ljekara ili pokušati drugi dan?',
      spinolaLocDetails:'Blizu McDonald\\'s, Love Statue, blizu autobuske stanice, u Spinola',
      spinolaOrDivider:'\\u2014 ili \\u2014',
      spinolaOfferTitle:'Nema dostupnih termina u Potter\\'s Clinic',
      spinolaOfferDrJames:'Posjetite Dr James u Spinola Clinic',
      spinolaOfferDrKevin:'Posjetite Dr Kevin drugi dan',
      spinolaKevinNextDesc:'Pronaći ćemo sljedeći dostupan dan za Dr Kevin u Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Sljedeći dostupan dan Dr Kevin',
      spinolaBookBtn:'Rezervišite u Spinola Clinic',
      spinolaDateSlots:'Dostupni termini za',
      spinolaNoSlots:'Nema dostupnih termina u Spinola Clinic za ovaj datum.'
    };

    TR.uk = {
      summary:'Підсумок',clinicHours:'Години роботи клініки',services:'Послуги',selectDate:'Оберіть дату',
      availableDates:'Доступні дати (наступні 7 днів)',selectTime:'Оберіть час',yourDetails:'Ваші дані',
      fullNameLabel:'Повне ім\\'я *',phoneLabel:'Телефон *',emailLabel:'Ел. пошта *',commentsLabel:'Коментарі',
      confirmBtn:'Підтвердити',appointmentConfirmed:'Запис підтверджено',okBtn:'OK',
      clinicMF:'Пн–Пт:',clinicSat:'Сб:',clinicSun:'Нд:',closed:'Зачинено',
      slotInfo:'Кожен слот — {duration} хвилин.',ready:'Готово',
      fullNamePh:'Повне ім\\'я',emailPh:'you@example.com',commentsPh:'Необов\\'язкові нотатки…',searchCountryPh:'Пошук країни…',
      serviceTemplate:'Послуга: {0} ({1} хв)',dateTemplate:'Дата: {0}',timeTemplate:'Час: {0} - {1}',
      locationTemplate:'Місце: {0}',mins:'хв',
      loadingTitle:'Завантаження…',loadingDesc:'Будь ласка, зачекайте.',
      loadingBookingTitle:'Завантаження сторінки…',loadingBookingDesc:'Підготовка системи запису.',
      loadingSlotsTitle:'Завантаження слотів…',loadingSlotsDesc:'Отримання доступних часів.',
      confirmingTitle:'Підтвердження запису…',confirmingDesc:'Надсилання підтвердження.',
      noSlots:'Немає доступних слотів.',noDates:'Немає доступних дат у наступні 7 днів.',
      serviceSelected:'Послугу обрано',loadingSlots:'Завантаження…',slotsLoaded:'Слоти завантажено',
      timeSelected:'Час обрано',missingFields:'Не всі поля заповнено',bookingStatus:'Запис…',
      unavailable:'Недоступно',errorLoadingSlots:'Помилка завантаження',noDatesAvailable:'Немає доступних дат',
      loadError:'Помилка завантаження',bookingFailed:'Помилка запису',bookingError:'Помилка запису',
      confirmMsg:'Ваш запис підтверджено.\\n\\nПослуга: {0}\\nДата: {1}\\nЧас: {2} - {3}\\nМісце: {4}\\n\\nЛист підтвердження надіслано. Скасувати можна за посиланням у листі.',
      couldNotBook:'Не вдалося записатися. Спробуйте ще раз.',errorLoadingApp:'Помилка завантаження: ',
      noAvailability:'Немає доступного часу.',
      valService:'Оберіть послугу.',valDate:'Оберіть дату.',valTime:'Оберіть час.',
      valName:'Повне ім\\'я обов\\'язкове.',valPhone:'Телефон обов\\'язковий.',valEmail:'Ел. пошта обов\\'язкова.',
      valEmailFormat:'Введіть дійсну ел. пошту.',timeDash:'—',
      spinolaSubtitle:'Бажаєте записатися до іншого лікаря або спробувати інший день?',
      spinolaLocDetails:'Біля McDonald\\'s, Love Statue, біля автобусної зупинки, в Spinola',
      spinolaOrDivider:'\\u2014 або \\u2014',
      spinolaOfferTitle:'Немає вільних слотів у Potter\\'s Clinic',
      spinolaOfferDrJames:'Записатися до Dr James у Spinola Clinic',
      spinolaOfferDrKevin:'Записатися до Dr Kevin на інший день',
      spinolaKevinNextDesc:'Ми знайдемо найближчий вільний день Dr Kevin у Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Наступний вільний день Dr Kevin',
      spinolaBookBtn:'Записатися в Spinola Clinic',
      spinolaDateSlots:'Доступні слоти на',
      spinolaNoSlots:'Немає вільних слотів у Spinola Clinic на цю дату.'
    };

    TR.fil = {
      summary:'Buod',clinicHours:'Oras ng klinika',services:'Mga Serbisyo',selectDate:'Pumili ng petsa',
      availableDates:'Mga available na petsa (susunod na 7 araw)',selectTime:'Pumili ng oras',yourDetails:'Iyong impormasyon',
      fullNameLabel:'Buong pangalan *',phoneLabel:'Telepono *',emailLabel:'Email *',commentsLabel:'Mga komento',
      confirmBtn:'Kumpirmahin',appointmentConfirmed:'Nakumpirma ang appointment',okBtn:'OK',
      clinicMF:'Lun–Biy:',clinicSat:'Sab:',clinicSun:'Lin:',closed:'Sarado',
      slotInfo:'Ang bawat slot ay {duration} minuto.',ready:'Handa na',
      fullNamePh:'Buong pangalan',emailPh:'you@example.com',commentsPh:'Opsyonal na tala…',searchCountryPh:'Maghanap ng bansa…',
      serviceTemplate:'Serbisyo: {0} ({1} min)',dateTemplate:'Petsa: {0}',timeTemplate:'Oras: {0} - {1}',
      locationTemplate:'Lokasyon: {0}',mins:'min',
      loadingTitle:'Naglo-load…',loadingDesc:'Mangyaring maghintay.',
      loadingBookingTitle:'Naglo-load ng pahina…',loadingBookingDesc:'Inihahanda ang sistema ng booking.',
      loadingSlotsTitle:'Naglo-load ng mga oras…',loadingSlotsDesc:'Kinukuha ang availability.',
      confirmingTitle:'Kinukumpirma ang appointment…',confirmingDesc:'Nagpapadala ng confirmation email.',
      noSlots:'Walang available na slot.',noDates:'Walang available na petsa sa susunod na 7 araw.',
      serviceSelected:'Napili ang serbisyo',loadingSlots:'Naglo-load…',slotsLoaded:'Na-load na ang mga oras',
      timeSelected:'Napili ang oras',missingFields:'May kulang na impormasyon',bookingStatus:'Nagbu-book…',
      unavailable:'Hindi available',errorLoadingSlots:'Error sa pag-load',noDatesAvailable:'Walang available na petsa',
      loadError:'Error sa pag-load',bookingFailed:'Hindi na-book',bookingError:'Error sa booking',
      confirmMsg:'Nakumpirma na ang iyong appointment.\\n\\nSerbisyo: {0}\\nPetsa: {1}\\nOras: {2} - {3}\\nLokasyon: {4}\\n\\nNaipadala na ang confirmation email. Maaari kang mag-cancel sa link sa email.',
      couldNotBook:'Hindi na-book. Pakisubukan ulit.',errorLoadingApp:'Error sa pag-load: ',
      noAvailability:'Walang availability.',
      valService:'Pumili ng serbisyo.',valDate:'Pumili ng petsa.',valTime:'Pumili ng oras.',
      valName:'Kailangan ang buong pangalan.',valPhone:'Kailangan ang telepono.',valEmail:'Kailangan ang email.',
      valEmailFormat:'Maglagay ng tamang email.',timeDash:'—',
      spinolaSubtitle:'Gusto mo bang magpatingin sa ibang doktor o subukan sa ibang araw?',
      spinolaLocDetails:'Malapit sa McDonald\\'s, Love Statue, malapit sa bus stop, sa Spinola',
      spinolaOrDivider:'\\u2014 o \\u2014',
      spinolaOfferTitle:'Walang available na slot sa Potter\\'s Clinic',
      spinolaOfferDrJames:'Magpatingin kay Dr James sa Spinola Clinic',
      spinolaOfferDrKevin:'Magpatingin kay Dr Kevin sa ibang araw',
      spinolaKevinNextDesc:'Hahanapin namin ang susunod na available na araw para kay Dr Kevin sa Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Susunod na available na araw ni Dr Kevin',
      spinolaBookBtn:'Mag-book sa Spinola Clinic',
      spinolaDateSlots:'Available na slot para sa',
      spinolaNoSlots:'Walang available na slot sa Spinola Clinic para sa petsa na ito.'
    };

    TR.bg = {
      summary:'Обобщение',clinicHours:'Работно време на клиниката',services:'Услуги',selectDate:'Изберете дата',
      availableDates:'Налични дати (следващите 7 дни)',selectTime:'Изберете час',yourDetails:'Вашите данни',
      fullNameLabel:'Пълно име *',phoneLabel:'Телефон *',emailLabel:'Имейл *',commentsLabel:'Коментари',
      confirmBtn:'Потвърди',appointmentConfirmed:'Часът е потвърден',okBtn:'OK',
      clinicMF:'Пон–Пет:',clinicSat:'Съб:',clinicSun:'Нед:',closed:'Затворено',
      slotInfo:'Всеки час е по {duration} минути.',ready:'Готово',
      fullNamePh:'Пълно име',emailPh:'you@example.com',commentsPh:'Незадължителни бележки…',searchCountryPh:'Търсене на държава…',
      serviceTemplate:'Услуга: {0} ({1} мин)',dateTemplate:'Дата: {0}',timeTemplate:'Час: {0} - {1}',
      locationTemplate:'Местоположение: {0}',mins:'мин',
      loadingTitle:'Зареждане…',loadingDesc:'Моля, изчакайте.',
      loadingBookingTitle:'Зареждане на страницата…',loadingBookingDesc:'Подготовка на системата за записване.',
      loadingSlotsTitle:'Зареждане на часове…',loadingSlotsDesc:'Получаване на наличност.',
      confirmingTitle:'Потвърждаване на час…',confirmingDesc:'Изпращане на имейл за потвърждение.',
      noSlots:'Няма налични часове.',noDates:'Няма налични дати в следващите 7 дни.',
      serviceSelected:'Услугата е избрана',loadingSlots:'Зареждане…',slotsLoaded:'Часовете са заредени',
      timeSelected:'Часът е избран',missingFields:'Липсващи полета',bookingStatus:'Записване…',
      unavailable:'Недостъпно',errorLoadingSlots:'Грешка при зареждане',noDatesAvailable:'Няма налични дати',
      loadError:'Грешка при зареждане',bookingFailed:'Неуспешно записване',bookingError:'Грешка при записване',
      confirmMsg:'Вашият час е потвърден.\\n\\nУслуга: {0}\\nДата: {1}\\nЧас: {2} - {3}\\nМестоположение: {4}\\n\\nИзпратен е имейл за потвърждение. Можете да отмените от линка в имейла.',
      couldNotBook:'Не може да се запише. Опитайте отново.',errorLoadingApp:'Грешка при зареждане: ',
      noAvailability:'Няма наличност.',
      valService:'Моля, изберете услуга.',valDate:'Моля, изберете дата.',valTime:'Моля, изберете час.',
      valName:'Пълното име е задължително.',valPhone:'Телефонът е задължителен.',valEmail:'Имейлът е задължителен.',
      valEmailFormat:'Въведете валиден имейл.',timeDash:'—',
      spinolaSubtitle:'Желаете ли да посетите друг лекар или да опитате друг ден?',
      spinolaLocDetails:'Близо до McDonald\\'s, Love Statue, близо до автобусната спирка, в Spinola',
      spinolaOrDivider:'\\u2014 или \\u2014',
      spinolaOfferTitle:'Няма свободни часове в Potter\\'s Clinic',
      spinolaOfferDrJames:'Посетете Dr James в Spinola Clinic',
      spinolaOfferDrKevin:'Посетете Dr Kevin друг ден',
      spinolaKevinNextDesc:'Ще намерим следващия свободен ден за Dr Kevin в Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Следващ свободен ден на Dr Kevin',
      spinolaBookBtn:'Резервирайте в Spinola Clinic',
      spinolaDateSlots:'Свободни часове за',
      spinolaNoSlots:'Няма свободни часове в Spinola Clinic за тази дата.'
    };

    TR.ro = {
      summary:'Rezumat',clinicHours:'Programul clinicii',services:'Servicii',selectDate:'Selectați o dată',
      availableDates:'Date disponibile (următoarele 7 zile)',selectTime:'Selectați o oră',yourDetails:'Datele dumneavoastră',
      fullNameLabel:'Nume complet *',phoneLabel:'Telefon *',emailLabel:'E-mail *',commentsLabel:'Comentarii',
      confirmBtn:'Confirmă',appointmentConfirmed:'Programare confirmată',okBtn:'OK',
      clinicMF:'Lun–Vin:',clinicSat:'Sâm:',clinicSun:'Dum:',closed:'Închis',
      slotInfo:'Fiecare slot are {duration} minute.',ready:'Pregătit',
      fullNamePh:'Nume complet',emailPh:'dvs@exemplu.com',commentsPh:'Note opționale…',searchCountryPh:'Caută țara…',
      serviceTemplate:'Serviciu: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Ora: {0} - {1}',
      locationTemplate:'Locație: {0}',mins:'min',
      loadingTitle:'Se încarcă…',loadingDesc:'Vă rugăm așteptați.',
      loadingBookingTitle:'Se încarcă pagina…',loadingBookingDesc:'Pregătirea sistemului de programări.',
      loadingSlotsTitle:'Se încarcă orele…',loadingSlotsDesc:'Se obține disponibilitatea.',
      confirmingTitle:'Se confirmă programarea…',confirmingDesc:'Se trimite e-mailul de confirmare.',
      noSlots:'Nu sunt ore disponibile.',noDates:'Nu sunt date disponibile în următoarele 7 zile.',
      serviceSelected:'Serviciu selectat',loadingSlots:'Se încarcă…',slotsLoaded:'Orele au fost încărcate',
      timeSelected:'Ora selectată',missingFields:'Câmpuri lipsă',bookingStatus:'Se programează…',
      unavailable:'Indisponibil',errorLoadingSlots:'Eroare la încărcare',noDatesAvailable:'Fără date disponibile',
      loadError:'Eroare la încărcare',bookingFailed:'Programare eșuată',bookingError:'Eroare la programare',
      confirmMsg:'Programarea dumneavoastră a fost confirmată.\\n\\nServiciu: {0}\\nData: {1}\\nOra: {2} - {3}\\nLocație: {4}\\n\\nUn e-mail de confirmare a fost trimis. Puteți anula din linkul din e-mail.',
      couldNotBook:'Nu s-a putut programa. Încercați din nou.',errorLoadingApp:'Eroare la încărcare: ',
      noAvailability:'Fără disponibilitate.',
      valService:'Selectați un serviciu.',valDate:'Selectați o dată.',valTime:'Selectați o oră.',
      valName:'Numele complet este obligatoriu.',valPhone:'Telefonul este obligatoriu.',valEmail:'E-mailul este obligatoriu.',
      valEmailFormat:'Introduceți un e-mail valid.',timeDash:'—',
      spinolaSubtitle:'Doriți să consultați un alt medic sau să încercați o altă zi?',
      spinolaLocDetails:'Lângă McDonald\\'s, Love Statue, lângă stația de autobuz, în Spinola',
      spinolaOrDivider:'\\u2014 sau \\u2014',
      spinolaOfferTitle:'Nu sunt locuri disponibile la Potter\\'s Clinic',
      spinolaOfferDrJames:'Consultați Dr James la Spinola Clinic',
      spinolaOfferDrKevin:'Consultați Dr Kevin într-o altă zi',
      spinolaKevinNextDesc:'Vom găsi următoarea zi disponibilă pentru Dr Kevin la Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Următoarea zi disponibilă Dr Kevin',
      spinolaBookBtn:'Rezervați la Spinola Clinic',
      spinolaDateSlots:'Locuri disponibile pentru',
      spinolaNoSlots:'Nu sunt locuri disponibile la Spinola Clinic pentru această dată.'
    };

    TR.lt = {
      summary:'Santrauka',clinicHours:'Klinikos darbo laikas',services:'Paslaugos',selectDate:'Pasirinkite datą',
      availableDates:'Galimos datos (artimiausios 7 dienos)',selectTime:'Pasirinkite laiką',yourDetails:'Jūsų duomenys',
      fullNameLabel:'Vardas ir pavardė *',phoneLabel:'Telefonas *',emailLabel:'El. paštas *',commentsLabel:'Komentarai',
      confirmBtn:'Patvirtinti',appointmentConfirmed:'Vizitas patvirtintas',okBtn:'Gerai',
      clinicMF:'Pr–Pn:',clinicSat:'Šešt:',clinicSun:'Sekm:',closed:'Uždaryta',
      slotInfo:'Kiekvienas vizitas trunka {duration} minučių.',ready:'Paruošta',
      fullNamePh:'Vardas ir pavardė',emailPh:'jusu@pastas.lt',commentsPh:'Papildomos pastabos…',searchCountryPh:'Ieškoti šalies…',
      serviceTemplate:'Paslauga: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Laikas: {0} - {1}',
      locationTemplate:'Vieta: {0}',mins:'min',
      loadingTitle:'Kraunama…',loadingDesc:'Prašome palaukti.',
      loadingBookingTitle:'Kraunamas registracijos puslapis…',loadingBookingDesc:'Prašome palaukti, kol paruošime sistemą.',
      loadingSlotsTitle:'Kraunami laiko tarpai…',loadingSlotsDesc:'Prašome palaukti, kol patikriname prieinamumą.',
      confirmingTitle:'Tvirtinamas vizitas…',confirmingDesc:'Siunčiamas patvirtinimo el. laiškas.',
      noSlots:'Laisvų laikų nėra.',noDates:'Artimiausiomis 7 dienomis laisvų datų nėra.',
      serviceSelected:'Paslauga pasirinkta',loadingSlots:'Kraunama…',slotsLoaded:'Laikai įkelti',
      timeSelected:'Laikas pasirinktas',missingFields:'Trūksta duomenų',bookingStatus:'Registruojama…',
      unavailable:'Nepasiekiama',errorLoadingSlots:'Klaida kraunant laikus',noDatesAvailable:'Laisvų datų nėra',
      loadError:'Įkėlimo klaida',bookingFailed:'Registracija nepavyko',bookingError:'Registracijos klaida',
      confirmMsg:'Jūsų vizitas patvirtintas.\\n\\nPaslauga: {0}\\nData: {1}\\nLaikas: {2} - {3}\\nVieta: {4}\\n\\nPatvirtinimo el. laiškas išsiųstas. Galite atšaukti vizitą naudodami nuorodą laiške.',
      couldNotBook:'Nepavyko užregistruoti. Bandykite dar kartą.',errorLoadingApp:'Klaida kraunant: ',
      noAvailability:'Nėra prieinamumo.',
      valService:'Prašome pasirinkti paslaugą.',valDate:'Prašome pasirinkti datą.',valTime:'Prašome pasirinkti laiką.',
      valName:'Vardas ir pavardė privalomi.',valPhone:'Telefono numeris privalomas.',valEmail:'El. paštas privalomas.',
      valEmailFormat:'Įveskite galiojantį el. paštą.',timeDash:'—',
      spinolaSubtitle:'Ar norėtumėte apsilankyti pas kitą gydytoją ar pabandyti kitą dieną?',
      spinolaLocDetails:'Šalia McDonald\\'s, Love Statue, šalia autobusų stotelės, Spinola',
      spinolaOrDivider:'\\u2014 arba \\u2014',
      spinolaOfferTitle:'Nėra laisvų laikų Potter\\'s Clinic',
      spinolaOfferDrJames:'Apsilankyti pas Dr James Spinola Clinic',
      spinolaOfferDrKevin:'Apsilankyti pas Dr Kevin kitą dieną',
      spinolaKevinNextDesc:'Rasime artimiausią laisvą dieną Dr Kevin Potter\\'s Clinic.',
      spinolaKevinNextBtn:'Kita laisva Dr Kevin diena',
      spinolaBookBtn:'Registruotis Spinola Clinic',
      spinolaDateSlots:'Laisvi laikai:',
      spinolaNoSlots:'Šiai datai nėra laisvų laikų Spinola Clinic.'
    };

    TR.mt = {
      summary:'Sommarju',clinicHours:'Sigħat tal-klinika',services:'Servizzi',selectDate:'Agħżel data',
      availableDates:'Dati disponibbli (7 ijiem li ġejjin)',selectTime:'Agħżel ħin',yourDetails:'Id-dettalji tiegħek',
      fullNameLabel:'Isem sħiħ *',phoneLabel:'Telefon *',emailLabel:'Email *',commentsLabel:'Kummenti',
      confirmBtn:'Ikkonferma',appointmentConfirmed:'L-appuntament ġie kkonfermat',okBtn:'OK',
      clinicMF:'Tne–Ġim:',clinicSat:'Sib:',clinicSun:'Ħad:',closed:'Magħluq',
      slotInfo:'Kull slot huwa ta\\' {duration} minuti.',ready:'Lest',
      fullNamePh:'Isem sħiħ',emailPh:'int@eżempju.com',commentsPh:'Noti mhux obbligatorji…',searchCountryPh:'Fittex pajjiż…',
      serviceTemplate:'Servizz: {0} ({1} min)',dateTemplate:'Data: {0}',timeTemplate:'Ħin: {0} - {1}',
      locationTemplate:'Post: {0}',mins:'min',
      loadingTitle:'Qed jitgħabba…',loadingDesc:'Jekk jogħġbok stenna.',
      loadingBookingTitle:'Qed tgħabbi l-paġna…',loadingBookingDesc:'Qed tipprepara s-sistema tal-booking.',
      loadingSlotsTitle:'Qed jitgħabbew il-ħinijiet…',loadingSlotsDesc:'Qed tikseb id-disponibbiltà.',
      confirmingTitle:'Qed tikkonferma l-appuntament…',confirmingDesc:'Qed tintbagħat l-email ta\\' konferma.',
      noSlots:'M\\'hemm l-ebda slot disponibbli.',noDates:'M\\'hemmx dati disponibbli fis-7 ijiem li ġejjin.',
      serviceSelected:'Servizz magħżul',loadingSlots:'Qed jitgħabba…',slotsLoaded:'Ħinijiet imtella\\'',
      timeSelected:'Ħin magħżul',missingFields:'Dettalji neqsin',bookingStatus:'Qed tiġi rreġistrata…',
      unavailable:'Mhux disponibbli',errorLoadingSlots:'Żball fit-tagħbija',noDatesAvailable:'L-ebda data disponibbli',
      loadError:'Żball fit-tagħbija',bookingFailed:'Ir-reġistrazzjoni falliet',bookingError:'Żball fir-reġistrazzjoni',
      confirmMsg:'L-appuntament tiegħek ġie kkonfermat.\\n\\nServizz: {0}\\nData: {1}\\nĦin: {2} - {3}\\nPost: {4}\\n\\nIntbagħtet email ta\\' konferma. Tista\\' tikkanċella mill-link fl-email.',
      couldNotBook:'Ma setgħetx tirreġistra. Erġa\\' pprova.',errorLoadingApp:'Żball fit-tagħbija: ',
      noAvailability:'L-ebda disponibbiltà.',
      valService:'Jekk jogħġbok agħżel servizz.',valDate:'Jekk jogħġbok agħżel data.',valTime:'Jekk jogħġbok agħżel ħin.',
      valName:'L-isem sħiħ huwa meħtieġ.',valPhone:'In-numru tat-telefon huwa meħtieġ.',valEmail:'L-email huwa meħtieġ.',
      valEmailFormat:'Daħħal email validu.',timeDash:'—',
      spinolaSubtitle:'Trid tara tabib ie\\u0127or jew tipprova jum ie\\u0127or?',
      spinolaLocDetails:"\\u0126dejn McDonald's, Love Statue, \\u0127dejn il-bus stop, fi Spinola",
      spinolaOrDivider:'\\u2014 jew \\u2014',
      spinolaOfferTitle:"M'hemmx slots disponibbli fil-Klinika ta' Potter's",
      spinolaOfferDrJames:'Ara Dr James fil-Klinika ta\\' Spinola',
      spinolaOfferDrKevin:'Ara Dr Kevin jum ieħor',
      spinolaKevinNextDesc:"Insibu l-ewwel jum disponibbli għal Dr Kevin fil-Klinika ta' Potter's.",
      spinolaKevinNextBtn:'L-ewwel jum disponibbli Dr Kevin',
      spinolaBookBtn:'Ibbukkja fil-Klinika ta\\' Spinola',
      spinolaDateSlots:'Slots disponibbli għal',
      spinolaNoSlots:"M'hemmx slots disponibbli fil-Klinika ta' Spinola għal din id-data."
    };

    // ─── Translation helpers ───
    function t(key) {
      var dict = TR[currentLang] || TR.en;
      var str = (dict[key] !== undefined) ? dict[key] : (TR.en[key] || key);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          str = str.replace('{' + (i - 1) + '}', arguments[i]);
        }
      }
      return str;
    }

    function applyLanguage(lang) {
      currentLang = lang;
      // Update static data-i18n text
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        el.textContent = t(key);
      });
      // Update placeholders
      document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key);
      });
      // RTL for Arabic
      document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
      // Update lang button label (shows "More" on large screens with flags visible)
      var langLabel = document.querySelector('.langLabel');
      if (langLabel) langLabel.textContent = 'More';
      // Mark active in dropdown
      document.querySelectorAll('.langItem').forEach(function(el) {
        el.classList.toggle('active', el.dataset.lang === lang);
      });
      document.querySelectorAll('.langFlag').forEach(function(el) {
        el.classList.toggle('active', el.dataset.lang === lang);
      });
      // Re-render date dropdown with localized dates
      if (state.dateOptions && state.dateOptions.length) {
        state.dateOptions.forEach(function(opt) {
          var o = els.dateSelect.querySelector('option[value="' + opt.dateKey + '"]');
          if (o) o.textContent = localDate(opt.dateKey) + (opt.disabled ? ' \\u2014 ' + opt.reason : '');
        });
      }
      // Re-apply dynamic summary text if state is loaded
      if (state.selectedServiceName) {
        els.sumService.textContent = t('serviceTemplate', state.selectedServiceName, state.selectedServiceMinutes);
      }
      if (state.selectedDateKey) {
        state.selectedDateLabel = localDate(state.selectedDateKey);
        els.sumDate.textContent = t('dateTemplate', state.selectedDateLabel);
      } else if (state.selectedDateLabel) {
        els.sumDate.textContent = t('dateTemplate', state.selectedDateLabel);
      } else {
        els.sumDate.textContent = t('dateTemplate', t('timeDash'));
      }
      if (state.selectedSlot) {
        els.sumTime.textContent = t('timeTemplate', to12h(state.selectedSlot.start), to12h(state.selectedSlot.end));
      } else {
        els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');
      }
      if (state.config && state.config.pottersLocation) {
        els.sumLoc.textContent = t('locationTemplate', state.config.pottersLocation);
      }
    }

    // ─── Language picker logic ───
    (function() {
      var langDrop = document.getElementById('langDrop');
      var langBtn = document.getElementById('langBtn');
      var quickFlags = document.getElementById('langQuickFlags');

      function selectLang(code) {
        applyLanguage(code);
        langDrop.classList.remove('open');
        // Update flag highlights
        quickFlags.querySelectorAll('.langFlag').forEach(function(f) {
          f.classList.toggle('active', f.dataset.lang === code);
        });
        langDrop.querySelectorAll('.langItem').forEach(function(f) {
          f.classList.toggle('active', f.dataset.lang === code);
        });
      }

      // Popular flags in header (always visible)
      POPULAR_LANGS.forEach(function(code) {
        var lang = LANGUAGES.find(function(l) { return l.code === code; });
        if (!lang) return;
        var f = document.createElement('div');
        f.className = 'langFlag';
        if (code === 'en') f.classList.add('active');
        f.dataset.lang = code;
        f.innerHTML = flagImg(lang.cc, 24);
        f.title = lang.name;
        f.addEventListener('click', function() { selectLang(code); });
        quickFlags.appendChild(f);
      });

      // Full language list in dropdown (for all languages including less common ones)
      LANGUAGES.forEach(function(lang) {
        var d = document.createElement('div');
        d.className = 'langItem';
        d.dataset.lang = lang.code;
        d.innerHTML = flagImg(lang.cc) + '  ' + lang.name;
        if (lang.code === 'en') d.classList.add('active');
        d.addEventListener('click', function() { selectLang(lang.code); });
        langDrop.appendChild(d);
      });

      langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langDrop.classList.toggle('open');
      });

      document.addEventListener('click', function(e) {
        if (!document.getElementById('langPicker').contains(e.target)) {
          langDrop.classList.remove('open');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') langDrop.classList.remove('open');
      });
    })();

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
      comments: document.getElementById('comments'),

      spinolaInline: document.getElementById('spinolaInline'),
      kevinNextSection: document.getElementById('kevinNextSection'),
      spinolaTitle: document.getElementById('spinolaTitle'),
      spinolaDateLabel: document.getElementById('spinolaDateLabel'),
      spinolaSlotsGrid: document.getElementById('spinolaSlotsGrid'),
      spinolaNoSlots: document.getElementById('spinolaNoSlots'),
      btnKevinNext: document.getElementById('btnKevinNext')
    };

    // --- Country code picker (193 UN member states, Malta default) ---
    const COUNTRIES = [
      {cc:"mt",code:"+356",name:"Malta"},
      {cc:"af",code:"+93",name:"Afghanistan"},
      {cc:"al",code:"+355",name:"Albania"},
      {cc:"dz",code:"+213",name:"Algeria"},
      {cc:"ad",code:"+376",name:"Andorra"},
      {cc:"ao",code:"+244",name:"Angola"},
      {cc:"ag",code:"+1-268",name:"Antigua and Barbuda"},
      {cc:"ar",code:"+54",name:"Argentina"},
      {cc:"am",code:"+374",name:"Armenia"},
      {cc:"au",code:"+61",name:"Australia"},
      {cc:"at",code:"+43",name:"Austria"},
      {cc:"az",code:"+994",name:"Azerbaijan"},
      {cc:"bs",code:"+1-242",name:"Bahamas"},
      {cc:"bh",code:"+973",name:"Bahrain"},
      {cc:"bd",code:"+880",name:"Bangladesh"},
      {cc:"bb",code:"+1-246",name:"Barbados"},
      {cc:"by",code:"+375",name:"Belarus"},
      {cc:"be",code:"+32",name:"Belgium"},
      {cc:"bz",code:"+501",name:"Belize"},
      {cc:"bj",code:"+229",name:"Benin"},
      {cc:"bt",code:"+975",name:"Bhutan"},
      {cc:"bo",code:"+591",name:"Bolivia"},
      {cc:"ba",code:"+387",name:"Bosnia and Herzegovina"},
      {cc:"bw",code:"+267",name:"Botswana"},
      {cc:"br",code:"+55",name:"Brazil"},
      {cc:"bn",code:"+673",name:"Brunei"},
      {cc:"bg",code:"+359",name:"Bulgaria"},
      {cc:"bf",code:"+226",name:"Burkina Faso"},
      {cc:"bi",code:"+257",name:"Burundi"},
      {cc:"cv",code:"+238",name:"Cabo Verde"},
      {cc:"kh",code:"+855",name:"Cambodia"},
      {cc:"cm",code:"+237",name:"Cameroon"},
      {cc:"ca",code:"+1",name:"Canada"},
      {cc:"cf",code:"+236",name:"Central African Republic"},
      {cc:"td",code:"+235",name:"Chad"},
      {cc:"cl",code:"+56",name:"Chile"},
      {cc:"cn",code:"+86",name:"China"},
      {cc:"co",code:"+57",name:"Colombia"},
      {cc:"km",code:"+269",name:"Comoros"},
      {cc:"cg",code:"+242",name:"Congo"},
      {cc:"cd",code:"+243",name:"Congo (DRC)"},
      {cc:"cr",code:"+506",name:"Costa Rica"},
      {cc:"ci",code:"+225",name:"C\\u00f4te d'Ivoire"},
      {cc:"hr",code:"+385",name:"Croatia"},
      {cc:"cu",code:"+53",name:"Cuba"},
      {cc:"cy",code:"+357",name:"Cyprus"},
      {cc:"cz",code:"+420",name:"Czechia"},
      {cc:"dk",code:"+45",name:"Denmark"},
      {cc:"dj",code:"+253",name:"Djibouti"},
      {cc:"dm",code:"+1-767",name:"Dominica"},
      {cc:"do",code:"+1-809",name:"Dominican Republic"},
      {cc:"ec",code:"+593",name:"Ecuador"},
      {cc:"eg",code:"+20",name:"Egypt"},
      {cc:"sv",code:"+503",name:"El Salvador"},
      {cc:"gq",code:"+240",name:"Equatorial Guinea"},
      {cc:"er",code:"+291",name:"Eritrea"},
      {cc:"ee",code:"+372",name:"Estonia"},
      {cc:"sz",code:"+268",name:"Eswatini"},
      {cc:"et",code:"+251",name:"Ethiopia"},
      {cc:"fj",code:"+679",name:"Fiji"},
      {cc:"fi",code:"+358",name:"Finland"},
      {cc:"fr",code:"+33",name:"France"},
      {cc:"ga",code:"+241",name:"Gabon"},
      {cc:"gm",code:"+220",name:"Gambia"},
      {cc:"ge",code:"+995",name:"Georgia"},
      {cc:"de",code:"+49",name:"Germany"},
      {cc:"gh",code:"+233",name:"Ghana"},
      {cc:"gr",code:"+30",name:"Greece"},
      {cc:"gd",code:"+1-473",name:"Grenada"},
      {cc:"gt",code:"+502",name:"Guatemala"},
      {cc:"gn",code:"+224",name:"Guinea"},
      {cc:"gw",code:"+245",name:"Guinea-Bissau"},
      {cc:"gy",code:"+592",name:"Guyana"},
      {cc:"ht",code:"+509",name:"Haiti"},
      {cc:"hn",code:"+504",name:"Honduras"},
      {cc:"hu",code:"+36",name:"Hungary"},
      {cc:"is",code:"+354",name:"Iceland"},
      {cc:"in",code:"+91",name:"India"},
      {cc:"id",code:"+62",name:"Indonesia"},
      {cc:"ir",code:"+98",name:"Iran"},
      {cc:"iq",code:"+964",name:"Iraq"},
      {cc:"ie",code:"+353",name:"Ireland"},
      {cc:"il",code:"+972",name:"Israel"},
      {cc:"it",code:"+39",name:"Italy"},
      {cc:"jm",code:"+1-876",name:"Jamaica"},
      {cc:"jp",code:"+81",name:"Japan"},
      {cc:"jo",code:"+962",name:"Jordan"},
      {cc:"kz",code:"+7",name:"Kazakhstan"},
      {cc:"ke",code:"+254",name:"Kenya"},
      {cc:"ki",code:"+686",name:"Kiribati"},
      {cc:"kw",code:"+965",name:"Kuwait"},
      {cc:"kg",code:"+996",name:"Kyrgyzstan"},
      {cc:"la",code:"+856",name:"Laos"},
      {cc:"lv",code:"+371",name:"Latvia"},
      {cc:"lb",code:"+961",name:"Lebanon"},
      {cc:"ls",code:"+266",name:"Lesotho"},
      {cc:"lr",code:"+231",name:"Liberia"},
      {cc:"ly",code:"+218",name:"Libya"},
      {cc:"li",code:"+423",name:"Liechtenstein"},
      {cc:"lt",code:"+370",name:"Lithuania"},
      {cc:"lu",code:"+352",name:"Luxembourg"},
      {cc:"mg",code:"+261",name:"Madagascar"},
      {cc:"mw",code:"+265",name:"Malawi"},
      {cc:"my",code:"+60",name:"Malaysia"},
      {cc:"mv",code:"+960",name:"Maldives"},
      {cc:"ml",code:"+223",name:"Mali"},
      {cc:"mh",code:"+692",name:"Marshall Islands"},
      {cc:"mr",code:"+222",name:"Mauritania"},
      {cc:"mu",code:"+230",name:"Mauritius"},
      {cc:"mx",code:"+52",name:"Mexico"},
      {cc:"fm",code:"+691",name:"Micronesia"},
      {cc:"md",code:"+373",name:"Moldova"},
      {cc:"mc",code:"+377",name:"Monaco"},
      {cc:"mn",code:"+976",name:"Mongolia"},
      {cc:"me",code:"+382",name:"Montenegro"},
      {cc:"ma",code:"+212",name:"Morocco"},
      {cc:"mz",code:"+258",name:"Mozambique"},
      {cc:"mm",code:"+95",name:"Myanmar"},
      {cc:"na",code:"+264",name:"Namibia"},
      {cc:"nr",code:"+674",name:"Nauru"},
      {cc:"np",code:"+977",name:"Nepal"},
      {cc:"nl",code:"+31",name:"Netherlands"},
      {cc:"nz",code:"+64",name:"New Zealand"},
      {cc:"ni",code:"+505",name:"Nicaragua"},
      {cc:"ne",code:"+227",name:"Niger"},
      {cc:"ng",code:"+234",name:"Nigeria"},
      {cc:"kp",code:"+850",name:"North Korea"},
      {cc:"mk",code:"+389",name:"North Macedonia"},
      {cc:"no",code:"+47",name:"Norway"},
      {cc:"om",code:"+968",name:"Oman"},
      {cc:"pk",code:"+92",name:"Pakistan"},
      {cc:"pw",code:"+680",name:"Palau"},
      {cc:"pa",code:"+507",name:"Panama"},
      {cc:"pg",code:"+675",name:"Papua New Guinea"},
      {cc:"py",code:"+595",name:"Paraguay"},
      {cc:"pe",code:"+51",name:"Peru"},
      {cc:"ph",code:"+63",name:"Philippines"},
      {cc:"pl",code:"+48",name:"Poland"},
      {cc:"pt",code:"+351",name:"Portugal"},
      {cc:"qa",code:"+974",name:"Qatar"},
      {cc:"ro",code:"+40",name:"Romania"},
      {cc:"ru",code:"+7",name:"Russia"},
      {cc:"rw",code:"+250",name:"Rwanda"},
      {cc:"kn",code:"+1-869",name:"Saint Kitts and Nevis"},
      {cc:"lc",code:"+1-758",name:"Saint Lucia"},
      {cc:"vc",code:"+1-784",name:"Saint Vincent and the Grenadines"},
      {cc:"ws",code:"+685",name:"Samoa"},
      {cc:"sm",code:"+378",name:"San Marino"},
      {cc:"st",code:"+239",name:"S\\u00e3o Tom\\u00e9 and Pr\\u00edncipe"},
      {cc:"sa",code:"+966",name:"Saudi Arabia"},
      {cc:"sn",code:"+221",name:"Senegal"},
      {cc:"rs",code:"+381",name:"Serbia"},
      {cc:"sc",code:"+248",name:"Seychelles"},
      {cc:"sl",code:"+232",name:"Sierra Leone"},
      {cc:"sg",code:"+65",name:"Singapore"},
      {cc:"sk",code:"+421",name:"Slovakia"},
      {cc:"si",code:"+386",name:"Slovenia"},
      {cc:"sb",code:"+677",name:"Solomon Islands"},
      {cc:"so",code:"+252",name:"Somalia"},
      {cc:"za",code:"+27",name:"South Africa"},
      {cc:"kr",code:"+82",name:"South Korea"},
      {cc:"ss",code:"+211",name:"South Sudan"},
      {cc:"es",code:"+34",name:"Spain"},
      {cc:"lk",code:"+94",name:"Sri Lanka"},
      {cc:"sd",code:"+249",name:"Sudan"},
      {cc:"sr",code:"+597",name:"Suriname"},
      {cc:"se",code:"+46",name:"Sweden"},
      {cc:"ch",code:"+41",name:"Switzerland"},
      {cc:"sy",code:"+963",name:"Syria"},
      {cc:"tj",code:"+992",name:"Tajikistan"},
      {cc:"tz",code:"+255",name:"Tanzania"},
      {cc:"th",code:"+66",name:"Thailand"},
      {cc:"tl",code:"+670",name:"Timor-Leste"},
      {cc:"tg",code:"+228",name:"Togo"},
      {cc:"to",code:"+676",name:"Tonga"},
      {cc:"tt",code:"+1-868",name:"Trinidad and Tobago"},
      {cc:"tn",code:"+216",name:"Tunisia"},
      {cc:"tr",code:"+90",name:"Turkey"},
      {cc:"tm",code:"+993",name:"Turkmenistan"},
      {cc:"tv",code:"+688",name:"Tuvalu"},
      {cc:"ug",code:"+256",name:"Uganda"},
      {cc:"ua",code:"+380",name:"Ukraine"},
      {cc:"ae",code:"+971",name:"United Arab Emirates"},
      {cc:"gb",code:"+44",name:"United Kingdom"},
      {cc:"us",code:"+1",name:"United States"},
      {cc:"uy",code:"+598",name:"Uruguay"},
      {cc:"uz",code:"+998",name:"Uzbekistan"},
      {cc:"vu",code:"+678",name:"Vanuatu"},
      {cc:"va",code:"+379",name:"Vatican City"},
      {cc:"ve",code:"+58",name:"Venezuela"},
      {cc:"vn",code:"+84",name:"Vietnam"},
      {cc:"ye",code:"+967",name:"Yemen"},
      {cc:"zm",code:"+260",name:"Zambia"},
      {cc:"zw",code:"+263",name:"Zimbabwe"}
    ];

    // --- Searchable country picker ---
    var selectedCountry = COUNTRIES[0]; // Malta default

    (function initCountryPicker(){
      var hlIndex = -1;
      var visibleItems = [];

      function renderList(filter) {
        els.ccList.innerHTML = '';
        visibleItems = [];
        hlIndex = -1;
        var q = (filter || '').toLowerCase();
        COUNTRIES.forEach(function(c) {
          if (q && c.name.toLowerCase().indexOf(q) === -1 && c.code.indexOf(q) === -1) return;
          var d = document.createElement('div');
          d.className = 'ccItem';
          d.innerHTML = '<span class="ccFlag">' + flagImg(c.cc) + '</span>' +
            '<span>' + c.name + '</span>' +
            '<span class="ccCode">' + c.code + '</span>';
          d.addEventListener('click', function() { pickCountry(c); });
          els.ccList.appendChild(d);
          visibleItems.push({el: d, country: c});
        });
      }

      function highlightItem(idx) {
        visibleItems.forEach(function(item) { item.el.classList.remove('hl'); });
        if (idx >= 0 && idx < visibleItems.length) {
          hlIndex = idx;
          visibleItems[idx].el.classList.add('hl');
          visibleItems[idx].el.scrollIntoView({block: 'nearest'});
        }
      }

      function pickCountry(c) {
        selectedCountry = c;
        els.ccBtn.innerHTML = flagImg(c.cc);
        els.dialCode.textContent = c.code;
        closeDrop();
      }

      function openDrop() {
        els.ccDrop.classList.add('open');
        els.ccSearch.value = '';
        renderList('');
        setTimeout(function() { els.ccSearch.focus(); }, 10);
      }

      function closeDrop() {
        els.ccDrop.classList.remove('open');
        hlIndex = -1;
      }

      els.ccBtn.addEventListener('click', function() {
        els.ccDrop.classList.contains('open') ? closeDrop() : openDrop();
      });

      els.ccSearch.addEventListener('input', function() {
        renderList(this.value);
      });

      els.ccSearch.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          highlightItem(Math.min(hlIndex + 1, visibleItems.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          highlightItem(Math.max(hlIndex - 1, 0));
        } else if (e.key === 'Enter' && hlIndex >= 0) {
          e.preventDefault();
          pickCountry(visibleItems[hlIndex].country);
        }
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

    const EXEC_URL_AFTER_BOOKING = '<?= WEBAPP_URL ?>';

    function goToExecAfterBooking_(){
      // Reset form in-place (no redirect/reload — GAS sandboxed iframe doesn't support it)
      state.selectedSlot = null;
      state.selectedServiceId = '';
      state.selectedServiceName = '';
      els.fullName.value = '';
      els.email.value = '';
      els.phone.value = '';
      els.comments.value = '';
      els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');
      els.timeGrid.innerHTML = '';
      hideMsg();
      // Re-fetch fresh data (dates, slots)
      init();
    }

    function showOverlay(el){
      el.style.display = 'flex';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    }
    function hideOverlay(el){
      el.classList.remove('show');
      setTimeout(() => { el.style.display = 'none'; }, 200);
    }

    function showLoading(title, desc){
      els.loadingTitle.textContent = title || t('loadingTitle');
      els.loadingDesc.textContent = desc || t('loadingDesc');
      showOverlay(els.loadingOverlay);
    }
    function hideLoading(){
      hideOverlay(els.loadingOverlay);
    }

    function showConfirmModal(text){
      els.confirmText.textContent = text;
      showOverlay(els.confirmOverlay);
      // Auto-close after 4 seconds and continue as if user clicked OK
      setTimeout(function() {
        if (els.confirmOverlay.classList.contains('show')) {
          hideConfirmModal();
          applyLanguage('en');
          goToExecAfterBooking_();
        }
      }, 4000);
    }
    function hideConfirmModal(){
      hideOverlay(els.confirmOverlay);
    }

    els.confirmOk.addEventListener('click', () => {
      hideConfirmModal();
      applyLanguage('en');
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
      els.resultMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    function renderClinicHours() {
      var wh = state.config && state.config.workingHours;
      var mins = (state.config && state.config.apptMinutes) || 10;
      var container = document.getElementById('clinicHoursInfo');
      var slotLine = document.getElementById('slotInfoLine');

      // Update slot duration text
      if (slotLine) {
        var tmpl = t('slotInfo');
        slotLine.textContent = tmpl.replace('{duration}', mins);
      }

      if (!wh || !container) return;

      // Build schedule string for each day for grouping
      var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
      var dayLabels = {MON:'Mon',TUE:'Tue',WED:'Wed',THU:'Thu',FRI:'Fri',SAT:'Sat',SUN:'Sun'};

      function blocksToStr(blocks) {
        if (!blocks || blocks.length === 0) return '';
        return blocks.map(function(b) { return b.start + '–' + b.end; }).join(' & ');
      }

      // Group consecutive days with same schedule
      var groups = [];
      var i = 0;
      while (i < dayOrder.length) {
        var key = dayOrder[i];
        var sched = blocksToStr(wh[key] || []);
        var start = i;
        while (i + 1 < dayOrder.length && blocksToStr(wh[dayOrder[i + 1]] || []) === sched) {
          i++;
        }
        var end = i;
        var label;
        if (start === end) {
          label = dayLabels[dayOrder[start]];
        } else {
          label = dayLabels[dayOrder[start]] + '–' + dayLabels[dayOrder[end]];
        }
        groups.push({ label: label, schedule: sched });
        i++;
      }

      var html = '';
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        html += '<p class="topLine"><b>' + grp.label + ':</b> ' +
          (grp.schedule || t('closed')) + '</p>';
      }
      container.innerHTML = html;
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
              <div class="serviceDur">\${svc.minutes} \${t('mins')}</div>
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

      els.sumService.textContent = t('serviceTemplate', svc.name, svc.minutes);
      if (!silent) setStatus('good', t('serviceSelected'));

      // Refresh slots when switching service (optional; safe)
      if (state.selectedDateKey) loadAvailability(true);
    }

    function renderDates() {
      els.dateSelect.innerHTML = '';

      state.dateOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.dateKey;
        o.textContent = localDate(opt.dateKey) + (opt.disabled ? \` — \${opt.reason}\` : '');
        o.disabled = !!opt.disabled;
        els.dateSelect.appendChild(o);
      });

      const firstEnabled = state.dateOptions.find(x => !x.disabled);
      if (firstEnabled) {
        els.dateSelect.value = firstEnabled.dateKey;
        state.selectedDateKey = firstEnabled.dateKey;
        state.selectedDateLabel = localDate(firstEnabled.dateKey);
        els.sumDate.textContent = t('dateTemplate', localDate(firstEnabled.dateKey));
        hideHint(els.dateHint);
      } else {
        state.selectedDateKey = null;
        showHint(els.dateHint, 'bad', t('noDates'));
      }
    }

    els.dateSelect.addEventListener('change', () => {
      const dateKey = els.dateSelect.value;
      state.selectedDateKey = dateKey;

      state.selectedDateLabel = localDate(dateKey);

      state.selectedSlot = null;
      els.sumDate.textContent = t('dateTemplate', state.selectedDateLabel);
      els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');

      hideHint(els.timeHint);
      hideMsg();
      setStatus('good', t('loadingSlots'));
      loadAvailability(false, false);
    });

    function renderSlots(slots) {
      els.timeGrid.innerHTML = '';
      hideSpinolaInline();
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
          els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');
        }
      }

      if (!filtered.length) {
        // Use prefetched Spinola data if available for this date
        if (_spinolaPrefetchedSlots && _spinolaPrefetchDateKey === state.selectedDateKey) {
          hideHint(els.timeHint);
          showSpinolaInlineWithData(_spinolaPrefetchedSlots);
        } else {
          showHint(els.timeHint, 'bad', t('noSlots'));
        }
        return;
      }
      hideSpinolaInline();
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
      els.sumTime.textContent = t('timeTemplate', to12h(slot.start), to12h(slot.end));
      els.sumLoc.textContent = t('locationTemplate', state.config.pottersLocation);

      hideMsg();
      setStatus('good', t('timeSelected'));
      setTimeout(function() { els.confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
    }

    function clearFieldErrors() {
      ['fullNameError','phoneError','emailError'].forEach(id => {
        var el = document.getElementById(id);
        if (el) el.textContent = '';
      });
      els.fullName.classList.remove('has-error');
      els.phone.classList.remove('has-error');
      document.getElementById('phoneWrap').closest('.phoneRow').classList.remove('has-error');
      els.email.classList.remove('has-error');
    }

    function setFieldError(inputEl, errorId, msg) {
      inputEl.classList.add('has-error');
      var errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = msg;
    }

    function validateForm() {
      clearFieldErrors();

      if (!state.selectedServiceId) return t('valService');
      if (!state.selectedDateKey) return t('valDate');
      // Accept either Potter's slot or Spinola slot
      if ((!state.selectedSlot || !state.selectedSlot.start) && (!_spinolaSelectedSlot || !_spinolaSelectedSlot.start)) return t('valTime');

      const fullName = els.fullName.value.trim();
      const email = els.email.value.trim();
      const phone = els.phone.value.trim();

      let hasError = false;
      if (!fullName) { setFieldError(els.fullName, 'fullNameError', t('valName')); hasError = true; }
      if (!phone) { setFieldError(els.phone, 'phoneError', t('valPhone')); document.getElementById('phoneWrap').closest('.phoneRow').classList.add('has-error'); hasError = true; }
      if (!email) { setFieldError(els.email, 'emailError', t('valEmail')); hasError = true; }
      else if (!email.includes('@')) { setFieldError(els.email, 'emailError', t('valEmailFormat')); hasError = true; }

      if (hasError) return t('missingFields') || 'Please fill in the required fields.';

      return null;
    }

    function loadAvailability(isSilentRefresh, autoAdvance, keepLoading) {
      if (!state.selectedDateKey) return;

      if (!isSilentRefresh && !keepLoading) {
        showLoading(t('loadingSlotsTitle'), t('loadingSlotsDesc'));
      }

      // Prefetch Spinola slots in parallel
      _spinolaPrefetchedSlots = null;
      _spinolaPrefetchDateKey = state.selectedDateKey;
      google.script.run
        .withSuccessHandler(function(res) { _spinolaPrefetchedSlots = res; })
        .withFailureHandler(function() { _spinolaPrefetchedSlots = null; })
        .apiGetSpinolaAvailability(state.selectedDateKey);

      google.script.run
        .withSuccessHandler((res) => {
          if (!isSilentRefresh) hideLoading();

          if (res && res._debug) console.log('[APPT DEBUG]', JSON.stringify(res._debug));
          if (!res || !res.ok) {
            renderSlots([]);
            showHint(els.timeHint, 'bad', (res && res.reason) ? res.reason : t('noAvailability'));
            setStatus('bad', t('unavailable'));
            return;
          }

          // Check if there are any actually available slots (not taken, not past)
          var hasAvailable = hasAvailableSlots(res.slots || []);

          if (!hasAvailable && autoAdvance) {
            // No available slots for this day — try the next enabled date
            if (advanceToNextEnabledDate()) {
              loadAvailability(false, true);
              return;
            }
          }

          renderSlots(res.slots || []);
          setStatus('good', t('slotsLoaded'));
        })
        .withFailureHandler((err) => {
          if (!isSilentRefresh) hideLoading();
          renderSlots([]);
          showHint(els.timeHint, 'bad', String(err && err.message ? err.message : err));
          setStatus('bad', t('errorLoadingSlots'));
        })
        .apiGetAvailability(state.selectedDateKey);
    }

    function hasAvailableSlots(slots) {
      var tz = (state.config && state.config.timezone) ? state.config.timezone : 'Europe/Malta';
      var now = getNowInTimeZoneParts(tz);
      return (slots || []).some(function(slot) {
        if (!slot || !slot.start) return false;
        if (slot.available !== true) return false;
        if (state.selectedDateKey && state.selectedDateKey === now.dateKey) {
          var startMin = parseHHMMToMinutes(slot.start);
          if (startMin < now.minutes) return false;
        }
        return true;
      });
    }

    function advanceToNextEnabledDate() {
      var currentIdx = state.dateOptions.findIndex(function(x) {
        return x.dateKey === state.selectedDateKey;
      });
      var next = state.dateOptions.find(function(x, i) {
        return i > currentIdx && !x.disabled;
      });
      if (!next) return false;

      els.dateSelect.value = next.dateKey;
      state.selectedDateKey = next.dateKey;
      state.selectedDateLabel = localDate(next.dateKey);
      els.sumDate.textContent = t('dateTemplate', state.selectedDateLabel);
      state.selectedSlot = null;
      els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');
      hideHint(els.timeHint);
      return true;
    }

    // Clear inline errors on input
    ['fullName','phone','email'].forEach(id => {
      var inp = document.getElementById(id);
      if (inp) inp.addEventListener('input', () => {
        inp.classList.remove('has-error');
        var errEl = document.getElementById(id + 'Error');
        if (errEl) errEl.textContent = '';
        if (id === 'phone') document.getElementById('phoneWrap').closest('.phoneRow').classList.remove('has-error');
      });
    });

    /* ===== Spinola Inline Offer Logic ===== */

    var _spinolaSelectedSlot = null;
    var _spinolaDateKey = null;
    var _spinolaPrefetchedSlots = null;
    var _spinolaPrefetchDateKey = null;

    function showSpinolaInlineWithData(res) {
      _spinolaSelectedSlot = null;
      _spinolaDateKey = state.selectedDateKey;

      els.spinolaTitle.textContent = t('spinolaOfferTitle');
      document.getElementById('spinolaSubtitle').textContent = t('spinolaSubtitle');
      els.spinolaSlotsGrid.innerHTML = '';
      els.spinolaNoSlots.style.display = 'none';

      // Set location details - use translation if available, fall back to config
      var locDetailsEl = document.getElementById('spinolaLocDetails');
      if (locDetailsEl) locDetailsEl.textContent = t('spinolaLocDetails');

      var drLabel = document.getElementById('spinolaDrLabel');
      if (drLabel) drLabel.textContent = t('spinolaOfferDrJames');

      var kevinLabel = document.getElementById('spinolaKevinLabel');
      if (kevinLabel) kevinLabel.textContent = t('spinolaOfferDrKevin');

      var kevinDesc = document.getElementById('spinolaKevinDesc');
      if (kevinDesc) kevinDesc.textContent = t('spinolaKevinNextDesc');

      els.btnKevinNext.textContent = t('spinolaKevinNextBtn');

      // Show date label
      els.spinolaDateLabel.textContent = t('spinolaDateSlots') + ' ' + localDate(_spinolaDateKey);

      // Render Spinola slots from prefetched data
      if (!res || !res.ok || !res.slots) {
        els.spinolaNoSlots.textContent = (res && res.reason) || t('spinolaNoSlots');
        els.spinolaNoSlots.style.display = 'block';
      } else {
        var tz = (state.config && state.config.timezone) || 'Europe/Malta';
        var now = getNowInTimeZoneParts(tz);
        var available = res.slots.filter(function(slot) {
          if (!slot || !slot.start || slot.available !== true) return false;
          if (_spinolaDateKey === now.dateKey) {
            if (parseHHMMToMinutes(slot.start) < now.minutes) return false;
          }
          return true;
        });

        if (!available.length) {
          els.spinolaNoSlots.textContent = t('spinolaNoSlots');
          els.spinolaNoSlots.style.display = 'block';
        } else {
          available.forEach(function(slot) {
            var b = document.createElement('div');
            b.className = 'timeBtn';
            b.textContent = to12h(slot.start);
            b.addEventListener('click', function() {
              var prev = els.spinolaSlotsGrid.querySelectorAll('.timeBtn');
              for (var i = 0; i < prev.length; i++) prev[i].classList.remove('selected');
              b.classList.add('selected');
              _spinolaSelectedSlot = slot;
              _spinolaDateKey = state.selectedDateKey;
              // Clear any Potter's slot selection
              state.selectedSlot = null;
              [...els.timeGrid.querySelectorAll('.timeBtn')].forEach(function(x) { x.classList.remove('selected'); });
              // Update summary to reflect Spinola
              var spinolaLoc = (state.config && state.config.spinolaLocation) || 'Spinola Clinic';
              els.sumTime.textContent = t('timeTemplate', to12h(slot.start), to12h(slot.end));
              els.sumLoc.textContent = t('locationTemplate', spinolaLoc);
              hideMsg();
              setTimeout(function() { els.confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
            });
            els.spinolaSlotsGrid.appendChild(b);
          });
        }
      }

      // Hide time grid, show inline Spinola offer + Dr Kevin section
      els.timeGrid.style.display = 'none';
      els.spinolaInline.classList.add('show');
      els.kevinNextSection.classList.add('show');
    }

    function hideSpinolaInline() {
      els.spinolaInline.classList.remove('show');
      els.kevinNextSection.classList.remove('show');
      els.timeGrid.style.display = '';
      _spinolaSelectedSlot = null;
      _spinolaDateKey = null;
    }

    // "See Dr Kevin on another day" button
    els.btnKevinNext.addEventListener('click', function() {
      hideSpinolaInline();
      if (advanceToNextEnabledDate()) {
        loadAvailability(false, true);
      } else {
        showMsg('bad', t('noDates'));
      }
    });

    els.confirmBtn.addEventListener('click', () => {
      hideMsg();
      const err = validateForm();
      if (err) {
        showMsg('bad', err);
        setStatus('bad', t('missingFields'));
        return;
      }

      showLoading(t('confirmingTitle'), t('confirmingDesc'));
      setStatus('good', t('bookingStatus'));

      // Route to Spinola or Potter's based on which slot is selected
      if (_spinolaSelectedSlot && _spinolaDateKey) {
        var spinolaPayload = {
          serviceId: state.selectedServiceId,
          dateKey: _spinolaDateKey,
          startTime: _spinolaSelectedSlot.start,
          fullName: els.fullName.value.trim(),
          email: els.email.value.trim(),
          phone: getFullPhone(),
          comments: els.comments.value.trim()
        };

        google.script.run
          .withSuccessHandler(function(res) {
            hideLoading();
            if (res && res.ok) {
              var dateLabel2 = localDate(_spinolaDateKey);
              var text = t('confirmMsg', res.serviceName, dateLabel2, to12h(res.startTime), to12h(res.endTime), res.location);
              if (res.calWarning) console.warn('SPINOLA CAL:', res.calWarning);
              showConfirmModal(text);
              return;
            }
            showMsg('bad', t('couldNotBook'));
            setStatus('bad', t('bookingFailed'));
          })
          .withFailureHandler(function(e) {
            hideLoading();
            var msg = (e && e.message) ? e.message : String(e);
            showMsg('bad', msg);
            setStatus('bad', t('bookingError'));
          })
          .apiBookSpinola(spinolaPayload);
        return;
      }

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
            const text = t('confirmMsg', res.serviceName, state.selectedDateLabel, to12h(res.startTime), to12h(res.endTime), res.location);
            showConfirmModal(text);
            return;
          }

          showMsg('bad', t('couldNotBook'));
          setStatus('bad', t('bookingFailed'));
          loadAvailability(false);
        })
        .withFailureHandler((e) => {
          hideLoading();
          const msg = (e && e.message) ? e.message : String(e);
          showMsg('bad', msg);
          setStatus('bad', t('bookingError'));
          loadAvailability(false);
        })
        .apiBook(payload);
    });

    function refreshDateOptions() {
      google.script.run
        .withSuccessHandler(function(dateOptions) {
          if (!dateOptions) return;
          var prevSelected = state.selectedDateKey;
          state.dateOptions = dateOptions;
          renderDates();
          if (prevSelected) {
            var still = state.dateOptions.find(function(o) { return o.dateKey === prevSelected && !o.disabled; });
            if (still) {
              els.dateSelect.value = prevSelected;
              state.selectedDateKey = prevSelected;
              state.selectedDateLabel = still.label;
            }
          }
          if (state.selectedDateKey) loadAvailability(true);
        })
        .withFailureHandler(function() { /* silent */ })
        .apiRefreshDates();
    }

    var _autoRefreshInstalled = false;
    function installAutoRefresh() {
      if (_autoRefreshInstalled) return;
      _autoRefreshInstalled = true;

      var _idlePaused = false;
      var IDLE_MS = 5 * 60 * 1000 + 10 * 1000; // 5 minutes 10 seconds
      var _lastActivity = Date.now();
      var _slotTimerId = null;
      var _dateTimerId = null;
      var _idleCheckId = null;
      var _idleOverlay = document.getElementById('idleOverlay');

      function isIdle() { return _idlePaused; }

      // ── Slot refresh (30s) ──
      _slotTimerId = setInterval(function() {
        if (isIdle() || document.hidden || !state.selectedDateKey) return;
        loadAvailability(true);
      }, 30000);

      // ── Date refresh (90s) ──
      _dateTimerId = setInterval(function() {
        if (isIdle() || document.hidden) return;
        refreshDateOptions();
      }, 90000);

      // ── Focus / visibility ──
      // Tab hidden → immediately go idle (zero API calls while backgrounded)
      // Tab visible again → user must click overlay to resume
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          // Immediately pause everything
          _idlePaused = true;
          _idleOverlay.classList.add('show');
        }
        // When visible again: do nothing — overlay is showing, user clicks to resume
      });
      window.addEventListener('focus', function() {
        // Do nothing if idle — user must click overlay
      });

      // ── Activity tracking ──
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
        document.addEventListener(evt, function() { _lastActivity = Date.now(); }, { passive: true });
      });

      // ── Idle check (every 1s) ──
      _idleCheckId = setInterval(function() {
        if (_idlePaused) return;
        var elapsed = Date.now() - _lastActivity;
        if (elapsed >= IDLE_MS) {
          _idlePaused = true;
          _idleOverlay.classList.add('show');
        }
      }, 1000);

      // ── Wake on click ──
      _idleOverlay.addEventListener('click', function() {
        _idlePaused = false;
        _lastActivity = Date.now();
        _idleOverlay.classList.remove('show');
        // Full fresh reload of data
        goToExecAfterBooking_();
      });
    }

    function init() {
      showLoading(t('loadingBookingTitle'), t('loadingBookingDesc'));

      google.script.run
        .withSuccessHandler((data) => {
          state.config = data.config;
          state.dateOptions = data.dateOptions || [];

          els.docName.textContent = state.config.doctorName;
          els.docMeta.textContent = state.config.pottersLocation;
          els.tzMeta.textContent = 'Time zone: ' + state.config.timezone;

          els.sumLoc.textContent = t('locationTemplate', state.config.pottersLocation);

          renderClinicHours();
          renderServices();
          renderDates();

          if (state.selectedDateKey) {
            setStatus('good', t('loadingSlots'));
            loadAvailability(false, true, true);
          } else {
            hideLoading();
            setStatus('bad', t('noDatesAvailable'));
          }

          installAutoRefresh();
        })
        .withFailureHandler((e) => {
          hideLoading();
          showMsg('bad', t('errorLoadingApp') + (e && e.message ? e.message : e));
          setStatus('bad', t('loadError'));
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
    .wrap{max-width:900px;margin:0 auto;padding:14px 14px 60px;}
    h1{margin:0 0 6px;font-size:20px;font-weight:900;}
    h2{margin:18px 0 8px;font-size:16px;font-weight:800;}
    h3{margin:14px 0 6px;font-size:14px;font-weight:700;}
    .subtitle{color:var(--muted);font-size:13px;margin:0 0 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:16px;margin-bottom:14px;}
    .stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
    .stat{background:var(--card);border-radius:14px;border:1px solid var(--line);padding:12px 16px;flex:1;min-width:120px;text-align:center;}
    .stat .num{font-size:28px;font-weight:900;}
    .stat .label{font-size:12px;color:var(--muted);}
    .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px;}
    table{border-collapse:collapse;width:100%;font-size:13px;}
    th{text-align:left;padding:10px 10px;border-bottom:2px solid var(--line);font-size:12px;color:var(--muted);font-weight:600;}
    td{padding:10px 10px;border-bottom:1px solid var(--line);}
    tbody tr:nth-child(even){background:rgba(243,244,246,0.5);}
    tbody tr{transition:background 0.12s ease;}
    tbody tr:hover{background:rgba(243,244,246,0.9);}
    .btn{border:none;border-radius:999px;padding:10px 16px;min-height:40px;font-weight:700;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;transition:transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;}
    .btn:hover{opacity:0.88;transform:translateY(-1px);}
    .btn:active{transform:translateY(1px);opacity:1;}
    .btn-sm{padding:6px 12px;min-height:34px;font-size:11px;}
    .btn-dark{background:#111827;color:#fff;}
    .btn-danger{background:var(--bad);color:#fff;}
    .btn-good{background:var(--good);color:#052e1a;}
    .btn-blue{background:var(--blue);color:#fff;}.btn-small{padding:4px 10px;font-size:12px;border-radius:4px;background:var(--muted);color:var(--text);}
    .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--line);}
    .btn-ghost:hover{background:rgba(17,24,39,0.04);opacity:1;}
    .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none !important;}
    input,select,textarea{font-family:inherit;font-size:13px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;outline:none;width:100%;transition:border-color 0.15s ease, box-shadow 0.15s ease;}
    input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.12);}
    :focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
    input:focus-visible,select:focus-visible,textarea:focus-visible{outline:none;}
    .form-row{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;align-items:end;}
    .form-group{flex:1;min-width:120px;}
    .form-group label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600;}
    .msg{margin-top:8px;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.4;display:none;}
    .msg.good{display:block;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);color:#065f46;}
    .msg.bad{display:block;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);color:#991b1b;}
    .tabs{display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap;}
    .tab{padding:10px 16px;min-height:40px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:600;background:transparent;border:1px solid var(--line);color:var(--muted);transition:background 0.15s ease, color 0.15s ease, border-color 0.15s ease;display:inline-flex;align-items:center;}
    .tab:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .tab.active{background:#111827;color:#fff;border-color:#111827;}
    .tab.active:hover{background:#1f2937;}
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
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge-red{background:rgba(239,68,68,0.1);color:#dc2626;}
    .badge-green{background:rgba(16,185,129,0.1);color:#059669;}
    .badge-dark{background:rgba(17,24,39,0.1);color:#111827;}
    .badge-amber{background:rgba(245,158,11,0.1);color:#b45309;}

    /* Fill ring in stats bar */
    .stat-fill{display:flex;align-items:center;gap:10px;justify-content:center;}
    .fill-ring{flex-shrink:0;}
    .fill-bg{fill:none;stroke:var(--line);stroke-width:4;}
    .fill-fg{fill:none;stroke:var(--good);stroke-width:4;stroke-linecap:round;transition:stroke-dashoffset 0.6s ease;}

    /* Patient history modal */
    .patient-modal{width:min(640px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);max-height:80vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}
    .patient-modal-header{display:flex;justify-content:space-between;align-items:center;}
    .patient-summary{display:flex;gap:12px;flex-wrap:wrap;}
    .patient-summary-item{background:var(--bg);border-radius:12px;padding:10px 14px;flex:1;min-width:80px;text-align:center;}
    .patient-summary-item .psv{font-size:22px;font-weight:900;}
    .patient-summary-item .psl{font-size:11px;color:var(--muted);}
    .patient-link{color:var(--blue);cursor:pointer;text-decoration:none;font-weight:inherit;}
    .patient-link:hover{text-decoration:underline;}

    /* Attendance buttons */
    .att-btns{display:inline-flex;gap:4px;margin-left:4px;}
    .att-btns .btn{min-height:28px;padding:4px 10px;font-size:12px;font-weight:800;}
    .btn-warn{background:#f59e0b;color:#78350f;}

    /* Trend arrow */
    .trend-arrow{font-size:13px;font-weight:700;margin-left:4px;}
    .trend-up{color:var(--good);}
    .trend-down{color:var(--bad);}
    .trend-flat{color:var(--muted);}

    /* Auto-refresh bar */
    .refresh-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(17,24,39,0.92);color:#e5e7eb;font-size:12px;padding:6px 14px;display:flex;justify-content:space-between;align-items:center;z-index:1500;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-weight:500;}
    .refresh-bar .refresh-info{display:flex;gap:16px;align-items:center;}
    .refresh-bar .refresh-dot{width:6px;height:6px;border-radius:50%;background:var(--good);display:inline-block;margin-right:4px;animation:pulse-dot 2s ease-in-out infinite;}
    @keyframes pulse-dot{0%,100%{opacity:1;}50%{opacity:0.3;}}
    .refresh-bar .refresh-countdown{color:#9ca3af;font-variant-numeric:tabular-nums;}

    /* Responsive */
    @media(max-width:600px){
      .wrap{padding:10px 10px 56px;}
      .stats{gap:8px;}
      .stat{min-width:0;flex:1 1 calc(50% - 4px);padding:10px 12px;}
      .stat .num{font-size:22px;}
      .form-row{flex-direction:column;}
      .form-group{min-width:0;width:100%;}
      .action-bar{flex-direction:column;}
      .action-bar .btn{width:100%;justify-content:center;}
      .tabs{gap:6px;}
      .tab{padding:8px 12px;font-size:12px;}
      h1{font-size:18px;}
      .card{padding:12px;}
    }
    @media(max-width:400px){
      .stat{flex:1 1 100%;}
    }

    /* Availability tab */
    .avail-toggle{display:flex;gap:0;margin-bottom:14px;}
    .toggle-btn{flex:1;padding:12px;border:1px solid var(--line);cursor:pointer;font-weight:700;font-size:13px;text-align:center;transition:all 0.15s ease;background:#fff;color:var(--muted);}
    .toggle-btn:first-child{border-radius:12px 0 0 12px;}
    .toggle-btn:last-child{border-radius:0 12px 12px 0;border-left:none;}
    .toggle-btn.active-block{background:rgba(239,68,68,0.08);color:var(--bad);border-color:var(--bad);}
    .toggle-btn.active-block + .toggle-btn{border-left-color:var(--line);}
    .toggle-btn.active-add{background:rgba(16,185,129,0.08);color:var(--good);border-color:var(--good);}
    .presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
    .preset-pill{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s ease;user-select:none;}
    .preset-pill:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .preset-pill.active{background:#111827;color:#fff;border-color:#111827;}
    .override-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;}
    .override-item:last-child{border-bottom:none;}
    .override-item .ov-icon{font-size:16px;flex-shrink:0;}
    .override-item .ov-info{flex:1;line-height:1.5;}
    .override-item .ov-date{font-weight:700;}
    .override-item .ov-detail{color:var(--muted);font-size:12px;}
    .override-item .ov-reason{color:var(--muted);font-style:italic;font-size:12px;}
    .override-item.past{opacity:0.4;}
    .override-item .ov-remove{border:none;background:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:8px;transition:all 0.15s ease;}
    .override-item .ov-remove:hover{background:rgba(239,68,68,0.1);color:var(--bad);}
    .time-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
    .time-pill{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s ease;user-select:none;}
    .time-pill:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .time-pill.active{background:#111827;color:#fff;border-color:#111827;}
    .time-label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:600;}

    /* Custom time spinner */
    .time-spinner-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:10px;}
    .time-spinner-group{display:flex;flex-direction:column;align-items:center;gap:2px;}
    .time-spinner-group .time-label{margin-bottom:2px;}
    .time-spinner{display:flex;align-items:center;gap:2px;background:#f9fafb;border:1px solid var(--line);border-radius:12px;padding:4px;user-select:none;}
    .time-drum{display:flex;flex-direction:column;align-items:center;width:48px;}
    .time-drum-btn{border:none;background:none;cursor:pointer;color:var(--muted);font-size:16px;line-height:1;padding:4px;border-radius:8px;transition:background 0.1s ease;width:100%;text-align:center;}
    .time-drum-btn:hover{background:rgba(17,24,39,0.06);}
    .time-drum-btn:active{background:rgba(17,24,39,0.12);}
    .time-drum-val{font-size:24px;font-weight:800;width:100%;text-align:center;padding:4px 0;cursor:ns-resize;line-height:1.2;}
    .time-drum-label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;}
    .time-sep{font-size:24px;font-weight:800;color:var(--muted);padding:0 2px;align-self:center;margin-top:-2px;}
    .time-spinner-arrow{font-size:20px;color:var(--muted);padding:0 4px;align-self:center;}
    @media(max-width:600px){
      .time-spinner-row{gap:10px;}
      .time-drum{width:42px;}
      .time-drum-val{font-size:20px;}
    }

    /* Timeline bar */
    .timeline-card{margin-bottom:0;padding-bottom:10px;}
    .tl-date-nav{display:flex;align-items:center;gap:8px;margin-bottom:10px;justify-content:center;}
    .tl-date-nav button{border:none;background:none;cursor:pointer;font-size:18px;color:var(--muted);padding:4px 8px;border-radius:8px;}
    .tl-date-nav button:hover{background:rgba(17,24,39,0.06);}
    .tl-date-label{font-weight:700;font-size:14px;min-width:140px;text-align:center;}
    .tl-outer{position:relative;margin-bottom:6px;padding-top:28px;}
    .tl-wrap{position:relative;height:48px;background:#f3f4f6;border-radius:10px;overflow:hidden;cursor:crosshair;border:1px solid var(--line);}
    .tl-seg{position:absolute;top:0;height:100%;}
    .tl-seg.regular{background:var(--good);opacity:0.55;z-index:1;}
    .tl-seg.regular:hover{opacity:0.65;}
    .tl-seg.extra{background:var(--good);opacity:0.85;z-index:3;cursor:pointer;background-image:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.2) 4px,rgba(255,255,255,0.2) 8px);}
    .tl-seg.extra:hover{opacity:1;}
    .tl-seg.blocked{background:var(--bad);opacity:0.7;z-index:3;cursor:pointer;}
    .tl-seg.blocked:hover{opacity:1;}
    .tl-seg-handle{position:absolute;top:0;width:10px;height:100%;cursor:ew-resize;z-index:4;}
    .tl-seg-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:20px;border-radius:2px;background:rgba(255,255,255,0.7);}
    .tl-seg-handle.handle-left{left:-2px;}
    .tl-seg-handle.handle-right{right:-2px;}
    .tl-ticks{position:relative;height:18px;display:flex;pointer-events:none;}
    .tl-tick{flex:1;position:relative;border-left:1px solid var(--line);}
    .tl-tick:last-child{border-right:1px solid var(--line);}
    .tl-tick-label{position:absolute;top:2px;left:0;font-size:10px;color:var(--muted);font-weight:600;white-space:nowrap;transform:translateX(-50%);}
    .tl-legend{display:flex;gap:12px;margin-top:10px;font-size:11px;color:var(--muted);justify-content:center;}
    .tl-legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:middle;}
    .tl-tooltip{position:absolute;bottom:calc(100% + 6px);background:#111827;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;z-index:10;transform:translateX(-50%);display:none;}
    .tl-sel-label{position:absolute;top:0;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;padding:2px 10px;border-radius:4px;font-size:13px;font-weight:700;white-space:nowrap;pointer-events:none;z-index:11;display:none;}
    .tl-actions{display:flex;gap:6px;margin-top:8px;justify-content:center;}
    .tl-actions .btn{font-size:12px;padding:6px 14px;}
    .tl-sel{position:absolute;top:28px;height:48px;background:rgba(37,99,235,0.25);border:2px solid var(--blue);border-radius:4px;pointer-events:none;z-index:5;display:none;}
    .tl-cursor{position:absolute;top:28px;width:2px;height:48px;background:var(--blue);pointer-events:none;z-index:8;display:none;opacity:0.7;}
    .tl-cursor-label{position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600;white-space:nowrap;}
    .tl-popover{position:absolute;bottom:calc(100% + 8px);background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:8px 10px;z-index:20;transform:translateX(-50%);white-space:nowrap;display:none;font-size:12px;}
    .tl-popover::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#fff;}
    .tl-popover-type{font-weight:700;margin-bottom:2px;}
    .tl-popover-type.pop-extra{color:var(--good);}
    .tl-popover-type.pop-blocked{color:var(--bad);}
    .tl-popover-time{color:var(--text);margin-bottom:4px;}
    .tl-popover-reason{color:var(--muted);font-style:italic;margin-bottom:6px;}
    .tl-popover-del{border:none;background:var(--bad);color:#fff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;width:100%;}
    .tl-popover-del:hover{opacity:0.85;}

    /* Search bar */
    .search-wrap{position:relative;margin-bottom:14px;}
    .search-wrap input{padding-left:36px;padding-right:36px;}
    .search-wrap .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:14px;pointer-events:none;}
    .search-wrap .search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:8px;}
    .search-wrap .search-clear:hover{background:rgba(17,24,39,0.06);color:var(--text);}

    /* Week grid */
    .week-nav{display:flex;align-items:center;gap:8px;margin-bottom:10px;justify-content:space-between;}
    .week-nav .week-label{font-size:14px;font-weight:700;text-align:center;flex:1;}
    .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px;}
    .week-cell{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 4px;text-align:center;cursor:pointer;transition:all 0.15s ease;position:relative;}
    .week-cell:hover{border-color:#d1d5db;background:rgba(17,24,39,0.02);transform:translateY(-1px);}
    .week-cell.today{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,0.15);}
    .week-cell.today .wc-num{color:var(--blue);}
    .week-cell.selected{background:#111827;color:#fff;border-color:#111827;}
    .week-cell.selected .wc-num{color:#fff;}
    .week-cell.selected.today{background:var(--blue);border-color:var(--blue);}
    .week-cell.selected.today:hover{background:#1d4ed8;}
    .week-cell.selected:hover{background:#1f2937;}
    .week-cell .wc-day{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;}
    .week-cell.selected .wc-day{color:rgba(255,255,255,0.7);}
    .week-cell .wc-num{font-size:18px;font-weight:800;margin:2px 0;}
    .week-cell .wc-count{font-size:11px;color:var(--muted);font-weight:600;}
    .week-cell.selected .wc-count{color:rgba(255,255,255,0.7);}
    .week-cell .wc-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin:0 1px;vertical-align:middle;}
    .week-cell.blocked{background:rgba(239,68,68,0.04);}
    .week-cell.no-hours{opacity:0.4;}
    @media(max-width:600px){
      .week-cell{padding:6px 2px;border-radius:8px;}
      .week-cell .wc-num{font-size:14px;}
      .week-cell .wc-day{font-size:10px;}
    }

    /* Date navigator */
    .date-nav{display:flex;align-items:center;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
    .date-nav input[type=date]{width:auto;flex:0 0 auto;max-width:160px;}
    .date-header{font-size:15px;font-weight:800;margin:0 0 4px;}

    /* Settings tab */
    .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    @media(max-width:600px){.settings-grid{grid-template-columns:1fr;}}
    .day-row{padding:10px 0;border-bottom:1px solid var(--line);}
    .day-row:last-child{border-bottom:none;}
    .day-row-header{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
    .day-row-header .day-name{font-weight:700;font-size:14px;min-width:40px;}
    .day-toggle{position:relative;width:38px;height:22px;cursor:pointer;}
    .day-toggle input{display:none;}
    .day-toggle .slider{position:absolute;inset:0;background:#d1d5db;border-radius:999px;transition:background 0.15s ease;}
    .day-toggle .slider::before{content:'';position:absolute;width:16px;height:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform 0.15s ease;}
    .day-toggle input:checked + .slider{background:var(--good);}
    .day-toggle input:checked + .slider::before{transform:translateX(16px);}
    .time-block-row{display:flex;align-items:center;gap:6px;margin:4px 0 4px 50px;flex-wrap:wrap;}
    .time-block-row input[type=time]{width:auto;max-width:120px;padding:6px 8px;font-size:12px;}
    .time-block-row .block-sep{color:var(--muted);font-weight:600;font-size:13px;}
    .time-block-row .remove-block{border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:6px;}
    .time-block-row .remove-block:hover{background:rgba(239,68,68,0.1);color:var(--bad);}
    .add-block-btn{margin-left:50px;margin-top:4px;border:none;background:none;color:var(--blue);cursor:pointer;font-size:12px;font-weight:600;padding:4px 8px;border-radius:6px;}
    .add-block-btn:hover{background:rgba(37,99,235,0.06);}

    /* Statistics tab */
    .hero-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
    .hero-card{background:var(--card);border-radius:14px;border:1px solid var(--line);padding:16px;flex:1;min-width:140px;text-align:center;}
    .hero-card .hero-value{font-size:28px;font-weight:900;line-height:1.1;}
    .hero-card .hero-label{font-size:12px;color:var(--muted);margin-top:4px;}
    .hero-card .hero-sub{font-size:11px;color:var(--muted);margin-top:2px;}
    .progress-ring{display:block;margin:0 auto 4px;}
    .progress-ring .ring-bg{fill:none;stroke:var(--line);stroke-width:6;}
    .progress-ring .ring-fg{fill:none;stroke:#2563eb;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset 0.8s ease;}
    .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    @media(max-width:600px){.stats-grid{grid-template-columns:1fr;}.hero-stats{flex-direction:column;}}
    .bar-chart{display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 4px;}
    .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
    .bar-stack{width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:100%;}
    .bar{width:100%;border-radius:4px 4px 0 0;transition:height 0.5s ease;min-height:0;}
    .bar.booked{background:#2563eb;}
    .bar.cancelled{background:#ef4444;border-radius:0 0 0 0;}
    .bar-val{font-size:11px;font-weight:700;margin-bottom:2px;color:var(--fg);}
    .bar-label{font-size:10px;color:var(--muted);margin-top:4px;text-align:center;}
    .heatmap{display:flex;gap:4px;flex-wrap:wrap;}
    .heat-cell{min-width:40px;flex:1;height:44px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:background 0.3s ease;}
    .heat-cell .heat-hour{font-size:9px;font-weight:600;opacity:0.7;margin-bottom:1px;}
    .h-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
    .h-bar-label{width:36px;font-size:12px;font-weight:700;flex-shrink:0;}
    .h-bar-track{flex:1;height:22px;background:var(--line);border-radius:11px;overflow:hidden;}
    .h-bar-fill{height:100%;border-radius:11px;transition:width 0.5s ease;background:#2563eb;}
    .h-bar-pct{width:40px;font-size:12px;font-weight:600;text-align:right;flex-shrink:0;}
    .patient-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);}
    .patient-row:last-child{border-bottom:none;}
    .patient-rank{width:20px;height:20px;border-radius:50%;background:#2563eb;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .patient-name{flex:1;font-size:13px;font-weight:600;}
    .patient-count{font-size:13px;font-weight:700;color:var(--muted);}
    .capacity-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
    .capacity-label{width:56px;font-size:12px;font-weight:700;flex-shrink:0;}
    .capacity-track{flex:1;height:22px;background:var(--line);border-radius:11px;overflow:hidden;position:relative;}
    .capacity-fill{height:100%;border-radius:11px;transition:width 0.5s ease;}
    .capacity-text{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:700;color:var(--fg);}
    .stats-refresh{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .stats-period{font-size:12px;color:var(--muted);}
    .legend{display:flex;gap:12px;margin-top:8px;font-size:11px;color:var(--muted);}
    .legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:middle;}

    /* Overlay animation */
    .overlay{opacity:0;transition:opacity 0.2s ease;}
    .overlay.show{opacity:1;}
    .loadingBox{transform:translateY(10px) scale(0.98);transition:transform 0.2s ease;}
    .overlay.show .loadingBox{transform:translateY(0) scale(1);}
    /* Idle overlay */
    .idle-overlay{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(246,247,251,0.50);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer;opacity:0;visibility:hidden;pointer-events:none;transition:opacity 0.5s ease,visibility 0.5s ease;}
    .idle-overlay.show{opacity:1;visibility:visible;pointer-events:auto;}
    .idle-card{text-align:center;padding:48px 36px;max-width:340px;animation:idle-float 3s ease-in-out infinite;}
    .idle-icon{font-size:56px;margin-bottom:16px;animation:idle-pulse-icon 2.5s ease-in-out infinite;}
    .idle-title{font-size:22px;font-weight:800;color:var(--text);margin:0 0 8px 0;letter-spacing:-0.3px;}
    .idle-sub{font-size:14px;color:var(--muted);margin:0 0 24px 0;line-height:1.5;}
    .idle-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--blue);color:#fff;border-radius:40px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(37,99,235,0.35);transition:transform 0.2s,box-shadow 0.2s;}
    .idle-cta:hover{transform:scale(1.05);box-shadow:0 6px 28px rgba(37,99,235,0.45);}
    .idle-cta .idle-arrow{display:inline-block;transition:transform 0.3s;font-size:18px;}
    .idle-overlay:hover .idle-arrow{transform:translateX(4px);}
    @keyframes idle-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes idle-pulse-icon{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(0.95);}}
  </style>
</head>
<body>
<div class="wrap">
  <h1>Admin Panel</h1>
  <p class="subtitle">Dr Kevin Navarro Gera - Appointment Management</p>

  <div class="stats" id="statsBar">
    <div class="stat"><div class="num" id="statBooked">-</div><div class="label">Booked this week</div></div>
    <div class="stat"><div class="num" id="statCancelled">-</div><div class="label">Cancelled this week</div></div>
    <div class="stat stat-fill">
      <svg class="fill-ring" width="52" height="52" viewBox="0 0 52 52">
        <circle class="fill-bg" cx="26" cy="26" r="22"/>
        <circle class="fill-fg" cx="26" cy="26" r="22" id="fillRingFg" stroke-dasharray="138.2" stroke-dashoffset="138.2" transform="rotate(-90 26 26)"/>
      </svg>
      <div><div class="num" id="statToday">-</div><div class="label" id="statTodayLabel">Today</div></div>
    </div>
    <div class="stat"><div class="num" id="statTomorrow">-</div><div class="label">Tomorrow</div></div>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="schedule" onclick="switchTab('schedule')">Schedule</div>
    <div class="tab" data-tab="availability" onclick="switchTab('availability')">Availability</div>
    <div class="tab" data-tab="actions" onclick="switchTab('actions')">Quick Actions</div>
    <div class="tab" data-tab="statistics" onclick="switchTab('statistics')">Statistics</div>
    <div class="tab" data-tab="settings" onclick="switchTab('settings')">Settings</div>
  </div>

  <div class="msg" id="globalMsg"></div>

  <!-- SCHEDULE TAB -->
  <div class="tab-content" id="tab-schedule">
    <!-- Search -->
    <div class="search-wrap">
      <span class="search-icon">&#x1F50D;</span>
      <input type="text" id="searchInput" placeholder="Search patients by name or phone..." oninput="onSearchInput()">
      <button class="search-clear" id="searchClear" style="display:none;" onclick="clearSearch()">&times;</button>
    </div>

    <!-- Search results (hidden by default) -->
    <div id="searchResults" style="display:none;"></div>

    <!-- Normal schedule view -->
    <div id="scheduleView">
      <!-- Week overview -->
      <div class="card" id="weekCard">
        <div class="week-nav">
          <button class="btn btn-ghost btn-sm" onclick="changeWeek(-1)">&larr; Prev</button>
          <span class="week-label" id="weekLabel"></span>
          <button class="btn btn-ghost btn-sm" onclick="changeWeek(1)">Next &rarr;</button>
        </div>
        <div class="week-grid" id="weekGrid"></div>
      </div>

      <!-- Date navigator -->
      <div class="date-nav">
        <button class="btn btn-ghost btn-sm" onclick="changeDay(-1)">&larr;</button>
        <button class="btn btn-sm btn-dark" onclick="goToToday()">Today</button>
        <button class="btn btn-sm btn-ghost" onclick="goToTomorrow()">Tomorrow</button>
        <input type="date" id="schedDate" onchange="onSchedDateChange()">
        <button class="btn btn-ghost btn-sm" onclick="changeDay(1)">&rarr;</button>
      </div>

      <!-- Day appointments -->
      <div class="card">
        <h3 id="schedHeader" class="date-header">Appointments</h3>
        <div id="schedTable"></div>
      </div>
    </div>
  </div>

  <!-- SETTINGS TAB -->
  <div class="tab-content" id="tab-settings" style="display:none;">
    <div class="card">
      <h3>General Settings</h3>
      <div class="settings-grid">
        <div class="form-group"><label>Doctor Email</label><input type="email" id="setDoctorEmail"></div>
        <div class="form-group"><label>Timezone</label><input type="text" id="setTimezone" placeholder="e.g. Europe/Malta"></div>
        <div class="form-group"><label>Potter's Location</label><input type="text" id="setPottersLoc"></div>
        <div class="form-group"><label>Spinola Location</label><input type="text" id="setSpinolaLoc"></div>
        <div class="form-group"><label>Appointment Duration (minutes)</label><input type="number" id="setDuration" min="1" max="120"></div>
        <div class="form-group"><label>Advance Booking Days</label><input type="number" id="setAdvanceDays" min="1" max="90"></div>
        <div class="form-group"><label>Max Appointments Per Person (0 = unlimited)</label><input type="number" id="setMaxAppts" min="0"></div>
      </div>
    </div>

    <div class="card">
      <h3>Working Hours</h3>
      <div id="hoursEditor"></div>
    </div>

    <div style="margin-top:10px;">
      <button class="btn btn-dark" onclick="saveSettings()">Save Settings</button>
    </div>
    <div class="msg" id="settingsMsg"></div>

    <div class="card" style="margin-top:16px;">
      <h3>Data Maintenance</h3>
      <p style="font-size:13px;color:#666;margin:0 0 10px;">Archive appointment sheets older than 30 days into a single Archive sheet. This reduces the number of sheets in the spreadsheet and improves performance. Patient history, search, and reports will still access archived data normally.</p>
      <button class="btn" style="background:#6c757d;color:#fff;" onclick="archiveOldSheets()">Archive Old Sheets</button>
      <div class="msg" id="archiveMsg"></div>
    </div>
  </div>

  <!-- AVAILABILITY TAB -->
  <div class="tab-content" id="tab-availability" style="display:none;">
    <div class="card timeline-card">
      <h3>Daily Availability</h3>
      <div class="tl-date-nav">
        <button onclick="tlNavDate(-1)" title="Previous day">&#9664;</button>
        <div class="tl-date-label" id="tlDateLabel">Today</div>
        <button onclick="tlNavDate(1)" title="Next day">&#9654;</button>
      </div>
      <div class="tl-outer" id="tlOuter">
        <div class="tl-sel-label" id="tlSelLabel"></div>
        <div class="tl-wrap" id="tlBar">
          <div class="tl-tooltip" id="tlTip"></div>
        </div>
        <div class="tl-sel" id="tlSel"></div>
        <div class="tl-cursor" id="tlCursor"><div class="tl-cursor-label" id="tlCursorLabel"></div></div>
        <div class="tl-popover" id="tlPopover">
          <div class="tl-popover-type" id="tlPopType"></div>
          <div class="tl-popover-time" id="tlPopTime"></div>
          <div class="tl-popover-reason" id="tlPopReason"></div>
          <button class="tl-popover-del" id="tlPopDel">Remove</button>
        </div>
        <div class="tl-ticks" id="tlTicks"></div>
      </div>
      <div class="tl-legend">
        <span><span class="tl-legend-dot" style="background:var(--good);opacity:0.55;"></span>Regular hours</span>
        <span><span class="tl-legend-dot" style="background:var(--good);opacity:0.85;background-image:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.3) 2px,rgba(255,255,255,0.3) 4px);"></span>Extra hours</span>
        <span><span class="tl-legend-dot" style="background:var(--bad);opacity:0.7;"></span>Blocked</span>
        <span><span class="tl-legend-dot" style="background:#f3f4f6;border:1px solid var(--line);"></span>Off</span>
      </div>
      <div class="tl-actions" id="tlActions" style="display:none;">
        <button class="btn btn-good" id="tlAddBtn" onclick="tlAddExtra()">Add Extra Time</button>
        <button class="btn btn-danger" id="tlBlockBtn" onclick="tlBlockTime()">Block Time</button>
      </div>
    </div>

    <div class="card">
      <div class="avail-toggle">
        <div class="toggle-btn active-block" id="toggleBlock" onclick="setAvailMode('block')">Block Time</div>
        <div class="toggle-btn" id="toggleAdd" onclick="setAvailMode('add')">Add Extra Time</div>
      </div>

      <div class="presets" id="presets">
        <div class="preset-pill" onclick="applyPreset('today')">Today</div>
        <div class="preset-pill" onclick="applyPreset('tomorrow')">Tomorrow</div>
        <div class="preset-pill" onclick="applyPreset('week')">This week</div>
        <div class="preset-pill" onclick="applyPreset('custom')">Custom</div>
      </div>

      <div id="availForm" style="display:none;">
        <div class="form-row">
          <div class="form-group"><label>Start date</label><input type="date" id="avStartDate"></div>
          <div class="form-group"><label>End date</label><input type="date" id="avEndDate"></div>
        </div>
        <div class="time-label">Time range</div>
        <div class="time-pills" id="timePills">
          <div class="time-pill active" onclick="pickTime('allday')">All day</div>
          <div class="time-pill" onclick="pickTime('morning')">Morning 09:00-12:00</div>
          <div class="time-pill" onclick="pickTime('afternoon')">Afternoon 17:00-19:00</div>
          <div class="time-pill" onclick="pickTime('custom')">Custom</div>
        </div>
        <div id="avTimeRow" style="display:none;">
          <div class="time-spinner-row">
            <div class="time-spinner-group">
              <div class="time-label">Start</div>
              <div class="time-spinner" id="spinnerStart">
                <div class="time-drum" data-unit="h" data-spinner="start">
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','h',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="startH">09</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','h',-1)">&#x25BC;</button>
                </div>
                <div class="time-sep">:</div>
                <div class="time-drum" data-unit="m" data-spinner="start">
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','m',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="startM">00</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','m',-1)">&#x25BC;</button>
                </div>
              </div>
            </div>
            <div class="time-spinner-arrow">&#x2192;</div>
            <div class="time-spinner-group">
              <div class="time-label">End</div>
              <div class="time-spinner" id="spinnerEnd">
                <div class="time-drum" data-unit="h" data-spinner="end">
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','h',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="endH">12</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','h',-1)">&#x25BC;</button>
                </div>
                <div class="time-sep">:</div>
                <div class="time-drum" data-unit="m" data-spinner="end">
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','m',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="endM">00</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','m',-1)">&#x25BC;</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Reason (optional)</label><input type="text" id="avReason" placeholder="e.g. Personal leave, Conference"></div>
        </div>
        <button class="btn btn-danger" id="avSubmitBtn" onclick="submitAvailability()">Block Time</button>
        <div class="msg" id="availMsg"></div>
      </div>
    </div>

    <div class="card">
      <h3>Active Overrides</h3>
      <div id="overridesList"><div class="empty">Loading...</div></div>
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
      <div id="notifyPresets" style="display:none;margin-bottom:8px;">
        <button class="btn btn-small" onclick="prefillNotifyMsg('reminder')">Appointment Reminder</button>
      </div>
      <button class="btn btn-blue" id="notifyBtn" style="display:none;" onclick="sendNotification()">Send Notification</button>
      <div class="msg" id="notifyResultMsg"></div>
    </div>
  </div>
</div>

<!-- STATISTICS TAB -->
<div class="tab-content" id="tab-statistics" style="display:none;">
  <div class="stats-refresh">
    <span class="stats-period" id="statsPeriod">Last 28 days</span>
    <button class="btn btn-sm btn-ghost" onclick="_statsLoaded=false;loadStatistics()">Refresh</button>
  </div>

  <!-- Hero metrics -->
  <div class="hero-stats" id="heroStats">
    <div class="hero-card">
      <svg class="progress-ring" width="72" height="72" viewBox="0 0 72 72" id="utilRing">
        <circle class="ring-bg" cx="36" cy="36" r="30"/>
        <circle class="ring-fg" cx="36" cy="36" r="30" stroke-dasharray="188.5" stroke-dashoffset="188.5" transform="rotate(-90 36 36)"/>
      </svg>
      <div class="hero-value" id="heroUtil">-</div>
      <div class="hero-label">Utilization</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroBooked">-</div>
      <div class="hero-label">Appointments</div>
      <div class="hero-sub" id="heroBookedSub">last 28 days</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroCancelRate">-</div>
      <div class="hero-label">Cancel Rate</div>
      <div class="hero-sub" id="heroCancelSub">lower is better</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroPatients">-</div>
      <div class="hero-label">Unique Patients</div>
      <div class="hero-sub" id="heroRepeat">- returning</div>
    </div>
  </div>

  <!-- Charts row -->
  <div class="stats-grid">
    <div class="card">
      <h3>Weekly Trend</h3>
      <div class="bar-chart" id="weeklyTrendChart"></div>
      <div class="legend">
        <span><span class="legend-dot" style="background:#2563eb;"></span>Booked</span>
        <span><span class="legend-dot" style="background:#ef4444;"></span>Cancelled</span>
      </div>
    </div>
    <div class="card">
      <h3>Peak Hours</h3>
      <div class="heatmap" id="peakHoursMap"></div>
    </div>
  </div>

  <!-- Insights row -->
  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Utilization by Day</h3>
      <div id="utilByDay"></div>
    </div>
    <div class="card">
      <h3>Upcoming 7-Day Load</h3>
      <div id="upcomingLoadChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Location Split</h3>
      <div id="locationSplitChart"></div>
    </div>
    <div class="card">
      <h3>Top Patients</h3>
      <div id="topPatientsChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Cancellations</h3>
      <div id="cancelBreakdownChart"></div>
    </div>
    <div class="card">
      <h3>Busiest Day</h3>
      <div id="busiestDayChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Booking Lead Time</h3>
      <div id="leadTimeChart"></div>
    </div>
    <div class="card">
      <h3>Attendance</h3>
      <div id="attendanceChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Doctor Actions</h3>
      <div id="doctorActionsChart"></div>
    </div>
    <div class="card">
      <h3>Bookings by Country</h3>
      <div id="countryChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Top Cancellers</h3>
      <div id="topCancellersChart"></div>
    </div>
  </div>

  <div class="msg" id="statsMsg"></div>
</div>

<!-- Patient History modal -->
<div class="overlay" id="patientOverlay">
  <div class="patient-modal">
    <div class="patient-modal-header">
      <h3 id="patientTitle" style="margin:0;">Patient History</h3>
      <button class="btn btn-ghost btn-sm" onclick="hidePatientHistory()">&#x2715;</button>
    </div>
    <div id="patientContent"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- Confirm modal -->
<div class="overlay" id="confirmOverlay" role="dialog" aria-modal="true">
  <div class="loadingBox" style="flex-direction:column;align-items:stretch;gap:12px;max-width:420px;">
    <h3 id="confirmTitle" style="margin:0;font-size:15px;font-weight:800;">Confirm</h3>
    <p id="confirmBody" style="margin:0;font-size:13px;color:var(--muted);line-height:1.45;"></p>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
      <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
      <button class="btn btn-danger" id="confirmOk">Confirm</button>
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

<div class="refresh-bar" id="refreshBar">
  <div class="refresh-info">
    <span><span class="refresh-dot"></span> Auto-refresh</span>
    <span id="refreshLastText">Last refreshed: just now</span>
  </div>
  <span class="refresh-countdown" id="refreshCountdown">Refreshes in: 30s</span>
</div>

<!-- Idle overlay — shown after inactivity to pause all background fetches -->
<div class="idle-overlay" id="idleOverlay">
  <div class="idle-card">
    <div class="idle-icon">⚙️</div>
    <div class="idle-title">Admin Dashboard Paused</div>
    <div class="idle-sub">Background updates are paused to<br>save resources. Tap to resume.</div>
    <div class="idle-cta">Resume Dashboard <span class="idle-arrow">→</span></div>
  </div>
</div>

<script>
const SIG = "<?= adminSig ?>";
var _schedDate = ''; // currently viewed date in schedule tab
var _weekStart = ''; // Monday of currently viewed week
var _searchTimer = null;

function showLoading(title, desc) {
  document.getElementById('loadingTitle').textContent = title || 'Loading...';
  document.getElementById('loadingDesc').textContent = desc || 'Please wait.';
  var el = document.getElementById('loadingOverlay');
  el.style.display = 'flex';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('show'); }); });
}
function hideLoading() {
  var el = document.getElementById('loadingOverlay');
  el.classList.remove('show');
  setTimeout(function(){ el.style.display = 'none'; }, 200);
}

function showMsg(id, type, text) {
  var el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = text;
}

var _confirmCb = null;
function styledConfirm(title, body, btnLabel, btnClass, dismissLabel) {
  return new Promise(function(resolve) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmBody').textContent = body;
    var okBtn = document.getElementById('confirmOk');
    okBtn.className = 'btn ' + (btnClass || 'btn-danger');
    okBtn.textContent = btnLabel || 'Confirm';
    document.getElementById('confirmCancel').textContent = dismissLabel || 'Go Back';
    var overlay = document.getElementById('confirmOverlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ overlay.classList.add('show'); }); });
    _confirmCb = resolve;
  });
}
document.getElementById('confirmCancel').onclick = function(){
  var overlay = document.getElementById('confirmOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
  if (_confirmCb) { _confirmCb(false); _confirmCb = null; }
};
document.getElementById('confirmOk').onclick = function(){
  var overlay = document.getElementById('confirmOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
  if (_confirmCb) { _confirmCb(true); _confirmCb = null; }
};

function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
  if (name === 'settings') loadSettings();
  if (name === 'statistics') loadStatistics();
  if (name === 'actions') { loadActionAppts(); if (document.getElementById('notifyDate').value) loadNotifyAppts(); }
}

function getStatusBadge(status) {
  if (status === 'ATTENDED') return { cls: 'badge-dark', text: 'Attended' };
  if (status === 'NO_SHOW') return { cls: 'badge-amber', text: 'No-Show' };
  if (status === 'RELOCATED_SPINOLA') return { cls: 'badge-green', text: 'Spinola' };
  if (status && status.indexOf('CANCELLED') >= 0) return { cls: 'badge-red', text: 'Cancelled' };
  return { cls: 'badge-green', text: 'Booked' };
}

function renderApptTable(appts, containerId, withCheckboxes, showDate) {
  var el = document.getElementById(containerId);
  if (!appts || !appts.length) {
    el.innerHTML = '<div class="empty">No appointments.</div>';
    return;
  }
  var html = '<div class="table-wrap"><table><thead><tr>';
  if (withCheckboxes) html += '<th><input type="checkbox" onchange="toggleAll(this, \\'' + containerId + '\\')"></th>';
  if (showDate) html += '<th>Date</th>';
  html += '<th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>';
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var badge = getStatusBadge(a.status);
    html += '<tr' + (showDate ? ' style="cursor:pointer" onclick="goToDate(\\'' + esc(a.dateKey) + '\\')"' : '') + '>';
    if (withCheckboxes) html += '<td><input type="checkbox" class="appt-cb" value="' + esc(a.appointmentId) + '"></td>';
    if (showDate) html += '<td><b>' + esc(a.dateKey) + '</b></td>';
    html += '<td><b>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</b></td>';
    html += '<td><a class="patient-link" href="#" onclick="event.stopPropagation();event.preventDefault();showPatientHistory(\\'' + esc(a.email) + '\\',\\'' + esc(a.phone) + '\\')">' + esc(a.fullName) + '</a></td>';
    html += '<td>' + esc(a.phone) + '</td>';
    html += '<td>' + esc(a.serviceName) + '</td>';
    html += '<td>' + esc(a.location) + '</td>';
    html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
    html += '<td>';
    if (a.status === 'BOOKED' || a.status === 'RELOCATED_SPINOLA') {
      html += '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();cancelSingleAppt(\\'' + esc(a.appointmentId) + '\\', \\'' + containerId + '\\')">Cancel</button>';
      html += '<span class="att-btns">';
      html += '<button class="btn btn-sm btn-good" onclick="event.stopPropagation();markAttendance(\\'' + esc(a.appointmentId) + '\\',\\'' + esc(a.dateKey) + '\\',true,\\'' + containerId + '\\')">Attended</button>';
      html += '<button class="btn btn-sm btn-warn" onclick="event.stopPropagation();markAttendance(\\'' + esc(a.appointmentId) + '\\',\\'' + esc(a.dateKey) + '\\',false,\\'' + containerId + '\\')">No-Show</button>';
      html += '</span>';
    }
    html += '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderOverrides(offEntries, extraEntries) {
  var el = document.getElementById('overridesList');
  var items = [];
  var todayStr = new Date().toISOString().slice(0, 10);

  (offEntries || []).forEach(function(e) {
    var dateLabel = formatDateNice(e.startDate);
    if (e.endDate && e.endDate !== e.startDate) dateLabel += ' - ' + formatDateNice(e.endDate);
    var timeLabel = (e.startTime && e.endTime) ? e.startTime + ' - ' + e.endTime : 'All day';
    items.push({
      type: 'block', sortDate: e.startDate, rowIndex: e.rowIndex,
      dateLabel: dateLabel, timeLabel: timeLabel, reason: e.reason || '',
      past: (e.endDate || e.startDate) < todayStr
    });
  });

  (extraEntries || []).forEach(function(e) {
    items.push({
      type: 'extra', sortDate: e.date, rowIndex: e.rowIndex,
      dateLabel: formatDateNice(e.date), timeLabel: e.startTime + ' - ' + e.endTime,
      reason: e.reason || '', past: e.date < todayStr
    });
  });

  items.sort(function(a, b) { return a.sortDate < b.sortDate ? -1 : a.sortDate > b.sortDate ? 1 : 0; });

  if (!items.length) {
    el.innerHTML = '<div class="empty">No overrides set.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var icon = it.type === 'block' ? '<span style="color:var(--bad)">&#x1f6ab;</span>' : '<span style="color:var(--good)">&#x2795;</span>';
    html += '<div class="override-item' + (it.past ? ' past' : '') + '">';
    html += '<div class="ov-icon">' + icon + '</div>';
    html += '<div class="ov-info">';
    html += '<span class="ov-date">' + esc(it.dateLabel) + '</span>';
    html += ' <span class="ov-detail">' + esc(it.timeLabel) + '</span>';
    if (it.reason) html += ' <span class="ov-reason"> &middot; ' + esc(it.reason) + '</span>';
    html += '</div>';
    html += '<button class="ov-remove" onclick="removeOverride(\\'' + it.type + '\\',' + it.rowIndex + ')" title="Remove">&times;</button>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function formatDateNice(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
}

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[d.getDay()] + ', ' + formatDateNice(dateStr);
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

// ========== Date helpers ==========

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function addDaysStr(dateStr, n) {
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function getMondayOf(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var dow = d.getDay();
  var diff = dow === 0 ? -6 : 1 - dow; // Monday = 1
  d.setDate(d.getDate() + diff);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ========== Load Dashboard ==========

function loadDashboard() {
  showLoading('Loading dashboard...', 'Fetching appointment data.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('globalMsg', 'bad', 'Failed to load dashboard.'); return; }

      document.getElementById('statBooked').textContent = res.stats.weekBooked;
      document.getElementById('statCancelled').textContent = res.stats.weekCancelled;
      document.getElementById('statTomorrow').textContent = res.tomorrowAppointments.length;
      updateFillRing(res.todayAppointments.length, res.stats.todayCapacity || 0);

      renderOverrides(res.doctorOffEntries, res.extraSlotEntries);

      // Update timeline data
      _tlWorkingHours = res.workingHours || null;
      _tlOffEntries = res.doctorOffEntries || [];
      _tlExtraEntries = res.extraSlotEntries || [];
      if (!_tlDate) _tlDate = res.todayKey;
      renderTimeline();

      _cachedDashboard = _dashboardHash(res);
      if (res._v !== undefined) _cachedVersion = res._v;

      // Initialize schedule to today if not set
      if (!_schedDate) {
        _schedDate = res.todayKey;
        _weekStart = getMondayOf(_schedDate);
        document.getElementById('schedDate').value = _schedDate;
      }

      // Load schedule for current date and week
      loadSchedAppts();
      try { loadWeekOverview(); } catch(e) { console.error('Week overview error:', e); }

      // Set default dates for Quick Actions
      document.getElementById('actionDate').value = res.todayKey;
      loadActionAppts();
      document.getElementById('notifyDate').value = res.todayKey;
      loadNotifyAppts();

      // Reset poll timer after manual load
      _lastRefreshTime = Date.now();
      if (_pollTimerId) { clearInterval(_pollTimerId); }
      _pollTimerId = setInterval(doPollAndRefresh, POLL_INTERVAL_SEC * 1000);
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('globalMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetDashboard(SIG);
}

// ========== Schedule Tab: Date Navigation ==========

function goToDate(dateStr) {
  _schedDate = dateStr;
  document.getElementById('schedDate').value = dateStr;
  clearSearch();
  var newWeek = getMondayOf(dateStr);
  if (newWeek !== _weekStart) {
    _weekStart = newWeek;
    loadWeekOverview();
  } else {
    highlightWeekCell();
  }
  loadSchedAppts();
}

function goToToday() { goToDate(todayStr()); }
function goToTomorrow() { goToDate(addDaysStr(todayStr(), 1)); }
function changeDay(dir) { goToDate(addDaysStr(_schedDate, dir)); }
function onSchedDateChange() { goToDate(document.getElementById('schedDate').value); }

function loadSchedAppts() {
  if (!_schedDate) return;
  document.getElementById('schedHeader').textContent = formatDateFull(_schedDate);
  document.getElementById('schedTable').innerHTML = '<div class="empty">Loading...</div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('schedTable').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'schedTable', false);
    })
    .withFailureHandler(function() {
      document.getElementById('schedTable').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, _schedDate);
}

// ========== Week Overview ==========

function changeWeek(dir) {
  _weekStart = addDaysStr(_weekStart, dir * 7);
  loadWeekOverview();
}

function loadWeekOverview() {
  var grid = document.getElementById('weekGrid');
  var label = document.getElementById('weekLabel');
  var endStr = addDaysStr(_weekStart, 6);
  label.textContent = formatDateNice(_weekStart) + ' - ' + formatDateNice(endStr);

  // Show placeholder cells
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  for (var i = 0; i < 7; i++) {
    var dk = addDaysStr(_weekStart, i);
    var num = parseInt(dk.split('-')[2], 10);
    html += '<div class="week-cell' + (dk === todayStr() ? ' today' : '') + (dk === _schedDate ? ' selected' : '') + '" onclick="goToDate(\\'' + dk + '\\')">';
    html += '<div class="wc-day">' + days[i] + '</div>';
    html += '<div class="wc-num">' + num + '</div>';
    html += '<div class="wc-count" id="wc-' + dk + '">...</div>';
    html += '</div>';
  }
  grid.innerHTML = html;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) return;
      for (var i = 0; i < res.days.length; i++) {
        var d = res.days[i];
        var countEl = document.getElementById('wc-' + d.dateKey);
        if (!countEl) continue;
        var cell = countEl.closest('.week-cell');

        if (!d.hasHours && d.count === 0) {
          countEl.textContent = '--';
          cell.classList.add('no-hours');
        } else {
          var dots = '';
          if (d.hasBlock) dots += '<span class="wc-dot" style="background:var(--bad)"></span>';
          if (d.hasExtra) dots += '<span class="wc-dot" style="background:var(--good)"></span>';
          countEl.innerHTML = d.count + (dots ? ' ' + dots : '');
          if (d.hasBlock) cell.classList.add('blocked');
        }
      }
    })
    .withFailureHandler(function() {})
    .apiAdminGetWeekOverview(SIG, _weekStart);
}

function highlightWeekCell() {
  var cells = document.querySelectorAll('.week-cell');
  cells.forEach(function(c) { c.classList.remove('selected'); });
  // Find the cell for _schedDate by looking at onclick
  cells.forEach(function(c) {
    if (c.getAttribute('onclick') && c.getAttribute('onclick').indexOf(_schedDate) >= 0) {
      c.classList.add('selected');
    }
  });
}

// ========== Search ==========

function onSearchInput() {
  var q = document.getElementById('searchInput').value.trim();
  document.getElementById('searchClear').style.display = q ? 'block' : 'none';

  if (_searchTimer) clearTimeout(_searchTimer);

  if (q.length < 2) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('scheduleView').style.display = 'block';
    return;
  }

  _searchTimer = setTimeout(function() { doSearch(q); }, 400);
}

function doSearch(query) {
  document.getElementById('searchResults').style.display = 'block';
  document.getElementById('scheduleView').style.display = 'none';
  document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">Searching...</div></div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">' + esc(res.reason || 'Search failed.') + '</div></div>';
        return;
      }
      if (!res.results.length) {
        document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">No results found for "' + esc(query) + '".</div></div>';
        return;
      }
      var html = '<div class="card"><h3>Search Results (' + res.total + ')</h3>';
      html += '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th></tr></thead><tbody>';
      for (var i = 0; i < res.results.length; i++) {
        var r = res.results[i];
        var badge = getStatusBadge(r.status);
        html += '<tr style="cursor:pointer" onclick="goToDate(\\'' + esc(r.dateKey) + '\\')">';
        html += '<td><b>' + esc(r.dateKey) + '</b></td>';
        html += '<td>' + esc(r.startTime) + ' - ' + esc(r.endTime) + '</td>';
        html += '<td><a class="patient-link" href="#" onclick="event.stopPropagation();event.preventDefault();showPatientHistory(\\'' + esc(r.email) + '\\',\\'' + esc(r.phone) + '\\')">' + esc(r.fullName) + '</a></td>';
        html += '<td>' + esc(r.phone) + '</td>';
        html += '<td>' + esc(r.serviceName) + '</td>';
        html += '<td>' + esc(r.location) + '</td>';
        html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      document.getElementById('searchResults').innerHTML = html;
    })
    .withFailureHandler(function() {
      document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">Search error.</div></div>';
    })
    .apiAdminSearchAppointments(SIG, query);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('scheduleView').style.display = 'block';
}

// ========== Timeline Bar ==========

var _tlDate = null; // current timeline date string "YYYY-MM-DD"
var _tlWorkingHours = null; // working hours config from dashboard
var _tlOffEntries = []; // doctor off entries
var _tlExtraEntries = []; // extra slot entries
var _tlDayStart = 7; // timeline display range: 7am
var _tlDayEnd = 21; // to 9pm
var _tlSelStart = null; // drag selection start (minutes)
var _tlSelEnd = null; // drag selection end (minutes)
var _tlDragging = false;
var _tlResizing = false;

function tlNavDate(delta) {
  if (!_tlDate) return;
  var d = new Date(_tlDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  _tlDate = d.toISOString().slice(0, 10);
  renderTimeline();
}

function renderTimeline() {
  if (!_tlDate || !_tlWorkingHours) return;
  var bar = document.getElementById('tlBar');
  var label = document.getElementById('tlDateLabel');
  var ticksEl = document.getElementById('tlTicks');

  // Update date label
  var d = new Date(_tlDate + 'T12:00:00');
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  label.textContent = dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();

  // Clear old segments and popover
  bar.querySelectorAll('.tl-seg').forEach(function(el) { el.remove(); });
  document.getElementById('tlSel').style.display = 'none';
  document.getElementById('tlSelLabel').style.display = 'none';
  document.getElementById('tlPopover').style.display = 'none';
  document.getElementById('tlActions').style.display = 'none';
  _tlSelStart = null;
  _tlSelEnd = null;

  var totalMin = (_tlDayEnd - _tlDayStart) * 60;

  function minToPercent(m) {
    return ((m - _tlDayStart * 60) / totalMin * 100);
  }

  // Render tick marks below the bar
  ticksEl.innerHTML = '';
  for (var h = _tlDayStart; h <= _tlDayEnd; h++) {
    var tick = document.createElement('div');
    tick.className = 'tl-tick';
    var lbl = document.createElement('div');
    lbl.className = 'tl-tick-label';
    lbl.textContent = String(h).padStart(2, '0') + ':00';
    tick.appendChild(lbl);
    ticksEl.appendChild(tick);
  }

  // Get day-of-week key
  var dowKeys = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  var dow = dowKeys[d.getDay()];

  // Regular working hours for this day
  var regularWindows = _tlWorkingHours[dow] || [];
  for (var i = 0; i < regularWindows.length; i++) {
    var w = regularWindows[i];
    addSegment(bar, w.start, w.end, 'regular', 'Regular: ' + w.start + ' - ' + w.end);
  }

  // Extra hours for this date
  for (var j = 0; j < _tlExtraEntries.length; j++) {
    var ex = _tlExtraEntries[j];
    if (ex.date === _tlDate && ex.startTime && ex.endTime) {
      addSegment(bar, ex.startTime, ex.endTime, 'extra', 'Extra: ' + ex.startTime + ' - ' + ex.endTime + (ex.reason ? ' (' + ex.reason + ')' : ''), {
        type: 'extra', rowIndex: ex.rowIndex, time: ex.startTime + ' - ' + ex.endTime, reason: ex.reason || ''
      });
    }
  }

  // Blocked hours for this date
  for (var k = 0; k < _tlOffEntries.length; k++) {
    var off = _tlOffEntries[k];
    var offStart = off.startDate;
    var offEnd = off.endDate || off.startDate;
    if (_tlDate >= offStart && _tlDate <= offEnd) {
      var isAllDay = !off.startTime || !off.endTime;
      var bStart = isAllDay ? String(_tlDayStart).padStart(2, '0') + ':00' : off.startTime;
      var bEnd = isAllDay ? String(_tlDayEnd).padStart(2, '0') + ':00' : off.endTime;
      var bLabel = isAllDay ? 'All day' : off.startTime + ' - ' + off.endTime;
      addSegment(bar, bStart, bEnd, 'blocked', 'Blocked: ' + bLabel + (off.reason ? ' (' + off.reason + ')' : ''), {
        type: 'block', rowIndex: off.rowIndex, time: bLabel, reason: off.reason || ''
      });
    }
  }

  function addSegment(container, start, end, cls, tip, meta) {
    var sMin = parseHHMM(start);
    var eMin = parseHHMM(end);
    var left = Math.max(0, minToPercent(sMin));
    var right = Math.min(100, minToPercent(eMin));
    if (right <= left) return;

    var seg = document.createElement('div');
    seg.className = 'tl-seg ' + cls;
    seg.style.left = left + '%';
    seg.style.width = (right - left) + '%';
    seg.title = tip;
    if (meta) {
      seg.addEventListener('click', function(e) {
        e.stopPropagation();
        showSegPopover(left + (right - left) / 2, meta);
      });
      // Add resize handles
      var handleL = document.createElement('div');
      handleL.className = 'tl-seg-handle handle-left';
      handleL.addEventListener('mousedown', function(e) { e.stopPropagation(); e.preventDefault(); startResize(meta, 'left', sMin, eMin, e); });
      seg.appendChild(handleL);

      var handleR = document.createElement('div');
      handleR.className = 'tl-seg-handle handle-right';
      handleR.addEventListener('mousedown', function(e) { e.stopPropagation(); e.preventDefault(); startResize(meta, 'right', sMin, eMin, e); });
      seg.appendChild(handleR);
    }
    seg.addEventListener('mouseenter', function() {
      if (!_tlDragging && !_tlResizing) {
        var tipEl = document.getElementById('tlTip');
        tipEl.textContent = tip;
        tipEl.style.left = (left + (right - left) / 2) + '%';
        tipEl.style.display = 'block';
      }
    });
    seg.addEventListener('mouseleave', function() {
      document.getElementById('tlTip').style.display = 'none';
    });
    container.insertBefore(seg, container.querySelector('.tl-tooltip'));
  }
}

function showSegPopover(pct, meta) {
  var pop = document.getElementById('tlPopover');
  var typeEl = document.getElementById('tlPopType');
  var timeEl = document.getElementById('tlPopTime');
  var reasonEl = document.getElementById('tlPopReason');
  var delBtn = document.getElementById('tlPopDel');

  typeEl.textContent = meta.type === 'extra' ? 'Extra Hours' : 'Blocked Time';
  typeEl.className = 'tl-popover-type ' + (meta.type === 'extra' ? 'pop-extra' : 'pop-blocked');
  timeEl.textContent = meta.time;
  if (meta.reason) {
    reasonEl.textContent = meta.reason;
    reasonEl.style.display = 'block';
  } else {
    reasonEl.style.display = 'none';
  }

  // Clamp popover position so it doesn't overflow
  pop.style.left = Math.max(10, Math.min(90, pct)) + '%';
  pop.style.display = 'block';

  delBtn.onclick = function() {
    pop.style.display = 'none';
    if (meta.type === 'extra') {
      showLoading('Removing...', 'Removing extra time slot.');
      google.script.run
        .withSuccessHandler(function(res) {
          hideLoading();
          if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
          showMsg('availMsg', 'good', res.message);
          loadDashboard();
        })
        .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
        .apiAdminRemoveExtraSlots(SIG, meta.rowIndex);
    } else {
      showLoading('Removing...', 'Removing blocked time.');
      google.script.run
        .withSuccessHandler(function(res) {
          hideLoading();
          if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
          showMsg('availMsg', 'good', res.message);
          loadDashboard();
        })
        .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
        .apiAdminRemoveDoctorOff(SIG, meta.rowIndex);
    }
  };

  // Close popover when clicking elsewhere
  function closePop(e) {
    if (!pop.contains(e.target)) {
      pop.style.display = 'none';
      document.removeEventListener('click', closePop);
    }
  }
  setTimeout(function() { document.addEventListener('click', closePop); }, 0);
}

function startResize(meta, side, origStartMin, origEndMin, mouseEvt) {
  _tlResizing = true;
  var bar = document.getElementById('tlBar');
  var totalMin = (_tlDayEnd - _tlDayStart) * 60;
  document.getElementById('tlPopover').style.display = 'none';
  document.getElementById('tlCursor').style.display = 'none';

  // Show the selection overlay to visualize the resize
  var sel = document.getElementById('tlSel');
  var selLabel = document.getElementById('tlSelLabel');
  var curStart = origStartMin;
  var curEnd = origEndMin;

  function getMin(e) {
    var rect = bar.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round((_tlDayStart * 60 + pct * totalMin) / 10) * 10;
  }

  function updateResize(e) {
    var m = getMin(e);
    if (side === 'left') {
      curStart = Math.min(m, curEnd - 10);
    } else {
      curEnd = Math.max(m, curStart + 10);
    }
    var left = (curStart - _tlDayStart * 60) / totalMin * 100;
    var width = (curEnd - curStart) / totalMin * 100;
    sel.style.left = left + '%';
    sel.style.width = width + '%';
    sel.style.display = 'block';
    selLabel.textContent = minToHHMM(curStart) + ' \\u2192 ' + minToHHMM(curEnd);
    selLabel.style.left = (left + width / 2) + '%';
    selLabel.style.display = 'block';
  }

  updateResize(mouseEvt);

  function onMove(e) { updateResize(e); }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    _tlResizing = false;
    sel.style.display = 'none';
    selLabel.style.display = 'none';

    // Only save if the time actually changed
    if (curStart === origStartMin && curEnd === origEndMin) return;

    var newStart = minToHHMM(curStart);
    var newEnd = minToHHMM(curEnd);

    // Delete old entry, then create new one with updated times
    showLoading('Updating...', 'Resizing time range.');
    var removeFunc = meta.type === 'extra' ? 'apiAdminRemoveExtraSlots' : 'apiAdminRemoveDoctorOff';
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.ok) { hideLoading(); showMsg('availMsg', 'bad', res.reason || 'Failed to remove old entry.'); return; }
        // Now add the new resized entry
        var addFunc = meta.type === 'extra' ? 'apiAdminAddExtraSlots' : 'apiAdminMarkDoctorOff';
        var payload = meta.type === 'extra'
          ? { date: _tlDate, startTime: newStart, endTime: newEnd, reason: meta.reason || 'Extra hours' }
          : { startDate: _tlDate, startTime: newStart, endTime: newEnd, reason: meta.reason || 'Blocked' };
        google.script.run
          .withSuccessHandler(function(res2) {
            hideLoading();
            if (!res2 || !res2.ok) { showMsg('availMsg', 'bad', res2.reason || 'Failed.'); return; }
            showMsg('availMsg', 'good', 'Updated to ' + newStart + ' - ' + newEnd);
            loadDashboard();
          })
          .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
          [addFunc](SIG, payload);
      })
      .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
      [removeFunc](SIG, meta.rowIndex);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function parseHHMM(str) {
  var parts = String(str).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
}

// Drag-to-select and hover cursor on timeline
(function initTimelineDrag() {
  var bar = document.getElementById('tlBar');
  var outer = document.getElementById('tlOuter');
  if (!bar) return;

  function getPctFromX(e) {
    var rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  function getMinFromX(e) {
    var totalMin = (_tlDayEnd - _tlDayStart) * 60;
    var rawMin = _tlDayStart * 60 + getPctFromX(e) * totalMin;
    return Math.round(rawMin / 10) * 10;
  }

  function updateSel() {
    if (_tlSelStart === null || _tlSelEnd === null) return;
    var s = Math.min(_tlSelStart, _tlSelEnd);
    var e = Math.max(_tlSelStart, _tlSelEnd);
    var selLabel = document.getElementById('tlSelLabel');
    if (e - s < 10) {
      document.getElementById('tlSel').style.display = 'none';
      selLabel.style.display = 'none';
      return;
    }
    var totalMin = (_tlDayEnd - _tlDayStart) * 60;
    var left = (s - _tlDayStart * 60) / totalMin * 100;
    var width = (e - s) / totalMin * 100;
    var sel = document.getElementById('tlSel');
    sel.style.left = left + '%';
    sel.style.width = width + '%';
    sel.style.display = 'block';
    // Position label above selection, centered
    selLabel.textContent = minToHHMM(s) + ' \\u2192 ' + minToHHMM(e);
    selLabel.style.left = (left + width / 2) + '%';
    selLabel.style.display = 'block';
  }

  // Hover cursor
  bar.addEventListener('mousemove', function(e) {
    if (_tlDragging) return;
    var cursor = document.getElementById('tlCursor');
    var cursorLabel = document.getElementById('tlCursorLabel');
    var pct = getPctFromX(e);
    var m = getMinFromX(e);
    cursor.style.left = (pct * 100) + '%';
    cursorLabel.textContent = minToHHMM(m);
    cursor.style.display = 'block';
  });

  bar.addEventListener('mouseleave', function() {
    if (!_tlDragging) document.getElementById('tlCursor').style.display = 'none';
  });

  bar.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    _tlDragging = true;
    _tlSelStart = getMinFromX(e);
    _tlSelEnd = _tlSelStart;
    document.getElementById('tlActions').style.display = 'none';
    document.getElementById('tlCursor').style.display = 'none';
    updateSel();
  });

  bar.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    _tlDragging = true;
    _tlSelStart = getMinFromX(touch);
    _tlSelEnd = _tlSelStart;
    document.getElementById('tlActions').style.display = 'none';
    updateSel();
  }, {passive: true});

  document.addEventListener('mousemove', function(e) {
    if (!_tlDragging) return;
    _tlSelEnd = getMinFromX(e);
    updateSel();
  });

  document.addEventListener('touchmove', function(e) {
    if (!_tlDragging) return;
    _tlSelEnd = getMinFromX(e.touches[0]);
    updateSel();
  }, {passive: true});

  function finishDrag(e) {
    if (!_tlDragging) return;
    _tlDragging = false;
    var pos = e.changedTouches ? e.changedTouches[0] : e;
    _tlSelEnd = getMinFromX(pos);
    var s = Math.min(_tlSelStart, _tlSelEnd);
    var en = Math.max(_tlSelStart, _tlSelEnd);
    if (en - s >= 10) {
      document.getElementById('tlActions').style.display = 'flex';
      _tlSelStart = s;
      _tlSelEnd = en;
      updateSel();
    } else {
      document.getElementById('tlSel').style.display = 'none';
      document.getElementById('tlSelLabel').style.display = 'none';
      _tlSelStart = null;
      _tlSelEnd = null;
    }
  }

  document.addEventListener('mouseup', finishDrag);
  document.addEventListener('touchend', finishDrag);
})();

function minToHHMM(m) {
  var hh = String(Math.floor(m / 60)).padStart(2, '0');
  var mm = String(m % 60).padStart(2, '0');
  return hh + ':' + mm;
}

function tlAddExtra() {
  if (_tlSelStart === null || _tlSelEnd === null || !_tlDate) return;
  showLoading('Adding...', 'Adding extra time slot.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('availMsg', 'good', res.message);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminAddExtraSlots(SIG, {
      date: _tlDate,
      startTime: minToHHMM(_tlSelStart),
      endTime: minToHHMM(_tlSelEnd),
      reason: 'Added from timeline'
    });
}

function tlBlockTime() {
  if (_tlSelStart === null || _tlSelEnd === null || !_tlDate) return;
  showLoading('Blocking...', 'Blocking time slot.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('availMsg', 'good', res.message);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminMarkDoctorOff(SIG, {
      startDate: _tlDate,
      startTime: minToHHMM(_tlSelStart),
      endTime: minToHHMM(_tlSelEnd),
      reason: 'Blocked from timeline'
    });
}

// ========== Availability (unified Block / Extra) ==========

var _availMode = 'block'; // 'block' or 'add'

function setAvailMode(mode) {
  _availMode = mode;
  var blockBtn = document.getElementById('toggleBlock');
  var addBtn = document.getElementById('toggleAdd');
  var submitBtn = document.getElementById('avSubmitBtn');

  blockBtn.className = 'toggle-btn' + (mode === 'block' ? ' active-block' : '');
  addBtn.className = 'toggle-btn' + (mode === 'add' ? ' active-add' : '');

  if (mode === 'block') {
    submitBtn.className = 'btn btn-danger';
    submitBtn.textContent = 'Block Time';
    // Show all-day pill
    var allDayPill = document.querySelector('#timePills .time-pill');
    if (allDayPill) allDayPill.style.display = '';
    pickTime('allday');
  } else {
    submitBtn.className = 'btn btn-good';
    submitBtn.textContent = 'Add Extra Time';
    // Hide all-day pill — extra time needs specific hours
    var allDayPill = document.querySelector('#timePills .time-pill');
    if (allDayPill) allDayPill.style.display = 'none';
    // Default to morning if currently on all-day
    if (_selectedTime === 'allday') pickTime('morning');
  }
}

function applyPreset(preset) {
  var pills = document.querySelectorAll('.preset-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  event.target.classList.add('active');

  var today = new Date();
  var todayStr = toDateStr(today);

  var startDate = document.getElementById('avStartDate');
  var endDate = document.getElementById('avEndDate');

  if (preset === 'today') {
    startDate.value = todayStr;
    endDate.value = todayStr;
  } else if (preset === 'tomorrow') {
    var tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    var tomStr = toDateStr(tom);
    startDate.value = tomStr;
    endDate.value = tomStr;
  } else if (preset === 'week') {
    startDate.value = todayStr;
    var sun = new Date(today);
    sun.setDate(sun.getDate() + (7 - sun.getDay()));
    endDate.value = toDateStr(sun);
  } else {
    startDate.value = '';
    endDate.value = '';
  }

  // Reset time to all-day (block mode) or morning (add mode)
  if (_availMode === 'add') {
    pickTime('morning');
  } else {
    pickTime('allday');
  }
  document.getElementById('avReason').value = '';
  document.getElementById('availForm').style.display = 'block';
  document.getElementById('availMsg').className = 'msg';

  // Re-apply mode visibility (hides all-day pill for extra)
  setAvailMode(_availMode);
}

function toDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

var _selectedTime = 'allday';

function pickTime(mode) {
  _selectedTime = mode;
  var pills = document.querySelectorAll('#timePills .time-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  // Find and activate the matching pill
  var labels = {allday: 'All day', morning: 'Morning 09:00-12:00', afternoon: 'Afternoon 17:00-19:00', custom: 'Custom'};
  pills.forEach(function(p) { if (p.textContent === labels[mode]) p.classList.add('active'); });

  document.getElementById('avTimeRow').style.display = mode === 'custom' ? 'flex' : 'none';
}

function getTimeRange() {
  if (_selectedTime === 'allday') return {start: '', end: ''};
  if (_selectedTime === 'morning') return {start: '09:00', end: '12:00'};
  if (_selectedTime === 'afternoon') return {start: '17:00', end: '19:00'};
  var sh = document.getElementById('startH').textContent;
  var sm = document.getElementById('startM').textContent;
  var eh = document.getElementById('endH').textContent;
  var em = document.getElementById('endM').textContent;
  return {start: sh + ':' + sm, end: eh + ':' + em};
}

// ─── Time spinner logic ───

function drumStep(which, unit, dir) {
  var hEl = document.getElementById(which === 'start' ? 'startH' : 'endH');
  var mEl = document.getElementById(which === 'start' ? 'startM' : 'endM');
  var h = parseInt(hEl.textContent, 10);
  var m = parseInt(mEl.textContent, 10);

  if (unit === 'h') {
    h = (h + dir + 24) % 24;
  } else {
    m = m + dir * 10;
    if (m >= 60) { m = 0; h = (h + 1) % 24; }
    if (m < 0) { m = 50; h = (h - 1 + 24) % 24; }
  }

  hEl.textContent = String(h).padStart(2, '0');
  mEl.textContent = String(m).padStart(2, '0');
}

// Mouse wheel on drum values
document.addEventListener('wheel', function(e) {
  var drum = e.target.closest('.time-drum');
  if (!drum) return;
  e.preventDefault();
  var which = drum.dataset.spinner;
  var unit = drum.dataset.unit;
  var dir = e.deltaY < 0 ? 1 : -1;
  drumStep(which, unit, dir);
}, {passive: false});

// Drag on drum values
(function() {
  var dragDrum = null, dragUnit = null, dragWhich = null, dragStartY = 0, dragAccum = 0;

  function onPointerDown(e) {
    var val = e.target.closest('.time-drum-val');
    if (!val) return;
    var drum = val.closest('.time-drum');
    if (!drum) return;
    dragDrum = drum;
    dragUnit = drum.dataset.unit;
    dragWhich = drum.dataset.spinner;
    dragStartY = e.clientY;
    dragAccum = 0;
    e.preventDefault();
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragDrum) return;
    var dy = dragStartY - e.clientY;
    dragAccum += dy;
    dragStartY = e.clientY;
    var threshold = 20;
    while (dragAccum >= threshold) { drumStep(dragWhich, dragUnit, 1); dragAccum -= threshold; }
    while (dragAccum <= -threshold) { drumStep(dragWhich, dragUnit, -1); dragAccum += threshold; }
  }

  function onPointerUp() {
    dragDrum = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }

  document.addEventListener('pointerdown', onPointerDown);
})();

function submitAvailability() {
  var startDate = document.getElementById('avStartDate').value;
  var endDate = document.getElementById('avEndDate').value;
  var times = getTimeRange();
  var reason = document.getElementById('avReason').value;

  if (!startDate) { showMsg('availMsg', 'bad', 'Please select a start date.'); return; }

  if (_availMode === 'block') {
    showLoading('Blocking time...', 'Adding block entry.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
        var msg = 'Time blocked successfully.';
        if (res.affectedAppointments && res.affectedAppointments.length > 0) {
          msg += ' ' + res.affectedAppointments.length + ' appointment(s) affected. Go to Quick Actions to process them.';
        }
        showMsg('availMsg', 'good', msg);
        document.getElementById('availForm').style.display = 'none';
        document.querySelectorAll('.preset-pill').forEach(function(p) { p.classList.remove('active'); });
        loadDashboard();
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminMarkDoctorOff(SIG, {
        startDate: startDate,
        endDate: endDate || startDate,
        startTime: times.start,
        endTime: times.end,
        reason: reason || 'Doctor not available'
      });
  } else {
    if (!times.start) { showMsg('availMsg', 'bad', 'Please select a time range.'); return; }
    if (!times.end) { showMsg('availMsg', 'bad', 'Please select a time range.'); return; }

    showLoading('Adding extra time...', 'Adding extra working hours.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
        showMsg('availMsg', 'good', res.message);
        document.getElementById('availForm').style.display = 'none';
        document.querySelectorAll('.preset-pill').forEach(function(p) { p.classList.remove('active'); });
        loadDashboard();
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminAddExtraSlots(SIG, {
        date: startDate,
        endDate: endDate || '',
        startTime: times.start,
        endTime: times.end,
        reason: reason
      });
  }
}

function removeOverride(type, rowIndex) {
  var title = type === 'block' ? 'Remove Block' : 'Remove Extra Time';
  var body = type === 'block'
    ? 'Remove this block? Slots will re-open for booking.'
    : 'Remove this extra time entry?';

  styledConfirm(title, body, 'Remove', 'btn-danger').then(function(ok) {
    if (!ok) return;
    showLoading('Removing...', 'Removing entry.');

    var handler = function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      loadDashboard();
    };
    var errHandler = function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    };

    if (type === 'block') {
      google.script.run.withSuccessHandler(handler).withFailureHandler(errHandler).apiAdminRemoveDoctorOff(SIG, rowIndex);
    } else {
      google.script.run.withSuccessHandler(handler).withFailureHandler(errHandler).apiAdminRemoveExtraSlots(SIG, rowIndex);
    }
  });
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
  var btnClass = action === 'cancel' ? 'btn-danger' : action === 'redirect_spinola' ? 'btn-blue' : 'btn-good';
  styledConfirm('Confirm Action', actionLabel + ' ' + target + ' on ' + dateKey + '?', actionLabel, btnClass).then(function(ok){
  if (!ok) return;

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
      // Also refresh the notify table if it has the same date loaded
      if (document.getElementById('notifyDate').value) loadNotifyAppts();
      _scheduleStatsRefresh(); // Deferred dashboard refresh instead of full reload
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
  });
}

function cancelSingleAppt(appointmentId, containerId) {
  var dateKey;
  if (containerId === 'actionApptsList') dateKey = document.getElementById('actionDate').value;
  else if (containerId === 'notifyApptsList') dateKey = document.getElementById('notifyDate').value;
  else dateKey = _schedDate;
  if (!dateKey) return;
  styledConfirm('Cancel Appointment', 'Are you sure you want to cancel this appointment?', 'Yes, Cancel', 'btn-danger', 'Go Back').then(function(ok){
  if (!ok) return;

  showLoading('Cancelling...', 'Cancelling appointment.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) {
        var msgId = containerId === 'actionApptsList' ? 'actionMsg' : 'notifyResultMsg';
        showMsg(msgId, 'bad', res.reason || 'Failed.');
        return;
      }
      var msgId = containerId === 'actionApptsList' ? 'actionMsg' : containerId === 'notifyApptsList' ? 'notifyResultMsg' : 'globalMsg';
      showMsg(msgId, 'good', 'Appointment cancelled.');
      // Reload both action tables so they stay in sync
      if (document.getElementById('actionDate').value) loadActionAppts();
      if (document.getElementById('notifyDate').value) loadNotifyAppts();
      if (containerId !== 'actionApptsList' && containerId !== 'notifyApptsList') loadSchedAppts();
      _scheduleStatsRefresh(); // Deferred dashboard refresh instead of immediate
    })
    .withFailureHandler(function(err) {
      hideLoading();
      var msgId = containerId === 'actionApptsList' ? 'actionMsg' : 'notifyResultMsg';
      showMsg(msgId, 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminProcessAppointments(SIG, {
      dateKey: dateKey,
      action: 'cancel',
      appointmentIds: [appointmentId],
      customMessage: ''
    });
  });
}

// ========== Notifications ==========

function loadNotifyAppts() {
  var dateKey = document.getElementById('notifyDate').value;
  if (!dateKey) return;

  document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('notifyMsgRow').style.display = 'none';
  document.getElementById('notifyPresets').style.display = 'none';
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
        document.getElementById('notifyPresets').style.display = 'block';
        document.getElementById('notifyBtn').style.display = 'inline-flex';
      }
    })
    .withFailureHandler(function(err) {
      document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, dateKey);
}

function prefillNotifyMsg(type) {
  var dateKey = document.getElementById('notifyDate').value || 'your appointment date';
  if (type === 'reminder') {
    document.getElementById('notifyMsg').value = 'This is a friendly reminder that your appointment is coming up soon on ' + dateKey + '. Please make sure to arrive on time. Thank you!';
  }
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
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(loadDashboard, 0);
} else {
  document.addEventListener('DOMContentLoaded', loadDashboard);
}

// ========== Auto-Refresh ==========
// ── Version-based polling ──
// Instead of fetching the full dashboard every 60s (~11 sheet reads),
// we poll a lightweight version counter (1 PropertiesService read).
// Full dashboard is only fetched when the version actually changed.
var POLL_INTERVAL_SEC = 10;
var _lastRefreshTime = Date.now();
var _pollTimerId = null;
var _isRefreshing = false;
var _isPolling = false;
var _cachedVersion = 0;
var _cachedDashboard = null;

function doPollAndRefresh() {
  if (_isPolling || _isRefreshing) return;
  // Skip polling when tab is hidden — visibility handler will catch up
  if (document.hidden) return;
  _isPolling = true;

  google.script.run
    .withSuccessHandler(function(res) {
      _isPolling = false;
      if (!res) return;

      if (res.v !== _cachedVersion) {
        _cachedVersion = res.v;
        doFullRefresh();
      } else {
        _lastRefreshTime = Date.now();
      }
    })
    .withFailureHandler(function() {
      _isPolling = false;
    })
    .apiPoll();
}

function doFullRefresh() {
  if (_isRefreshing) return;
  _isRefreshing = true;

  google.script.run
    .withSuccessHandler(function(res) {
      _isRefreshing = false;
      _lastRefreshTime = Date.now();
      if (!res || !res.ok) return;

      if (res._v !== undefined) _cachedVersion = res._v;

      // Update stats bar
      document.getElementById('statBooked').textContent = res.stats.weekBooked;
      document.getElementById('statCancelled').textContent = res.stats.weekCancelled;
      document.getElementById('statTomorrow').textContent = res.tomorrowAppointments.length;
      updateFillRing(res.todayAppointments.length, res.stats.todayCapacity || 0);

      renderOverrides(res.doctorOffEntries, res.extraSlotEntries);

      // Only reload schedule/week if data shape changed (avoid 2 extra API calls)
      var newHash = _dashboardHash(res);
      if (!_cachedDashboard || _cachedDashboard !== newHash) {
        _cachedDashboard = newHash;
        loadSchedAppts();
        loadWeekOverview();
        // Refresh quick actions if that tab is active
        if (document.getElementById('tab-actions').style.display !== 'none') {
          loadActionAppts();
          if (document.getElementById('notifyDate').value) loadNotifyAppts();
        }
      }
    })
    .withFailureHandler(function() {
      _isRefreshing = false;
      _lastRefreshTime = Date.now();
    })
    .apiAdminGetDashboard(SIG);
}

// Keep the old name so _scheduleStatsRefresh still works
function doAutoRefresh() { doPollAndRefresh(); }

function _dashboardHash(res) {
  return res.stats.weekBooked + '|' + res.stats.weekCancelled + '|' +
    res.todayAppointments.length + '|' + res.tomorrowAppointments.length + '|' +
    (res.doctorOffEntries || []).length + '|' + (res.extraSlotEntries || []).length;
}

function updateRefreshDisplay() {
  var elapsed = Math.floor((Date.now() - _lastRefreshTime) / 1000);
  var remaining = Math.max(0, POLL_INTERVAL_SEC - elapsed);

  var lastEl = document.getElementById('refreshLastText');
  if (lastEl) {
    if (elapsed < 5) lastEl.textContent = 'Last refreshed: just now';
    else if (elapsed < 60) lastEl.textContent = 'Last refreshed: ' + elapsed + 's ago';
    else lastEl.textContent = 'Last refreshed: ' + Math.floor(elapsed / 60) + 'm ago';
  }

  var countEl = document.getElementById('refreshCountdown');
  if (countEl) countEl.textContent = 'Next check: ' + remaining + 's';
}

// ── Idle overlay ──
var _idlePaused = false;
var _IDLE_MS = 5 * 60 * 1000 + 10 * 1000; // 5 minutes 10 seconds
var _lastAdminActivity = Date.now();
var _idleOverlay = document.getElementById('idleOverlay');
var _displayTimerId = null;

function _isAdminIdle() { return _idlePaused; }

_pollTimerId = setInterval(function() {
  if (!_isAdminIdle()) doPollAndRefresh();
}, POLL_INTERVAL_SEC * 1000);

_displayTimerId = setInterval(function() {
  if (!_isAdminIdle()) updateRefreshDisplay();
}, 1000);

// Tab hidden → immediately go idle (zero API calls while backgrounded)
// Tab visible again → user must click overlay to resume
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    _idlePaused = true;
    if (_pollTimerId) { clearInterval(_pollTimerId); _pollTimerId = null; }
    _idleOverlay.classList.add('show');
  }
  // When visible again: do nothing — overlay is showing, user clicks to resume
});
window.addEventListener('focus', function() {
  // Do nothing if idle — user must click overlay
});

// Activity tracking
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
  document.addEventListener(evt, function() { _lastAdminActivity = Date.now(); }, { passive: true });
});

// Idle check (every 1s)
setInterval(function() {
  if (_idlePaused) return;
  if (Date.now() - _lastAdminActivity >= _IDLE_MS) {
    _idlePaused = true;
    // Stop polling timer entirely to save cycles
    if (_pollTimerId) { clearInterval(_pollTimerId); _pollTimerId = null; }
    _idleOverlay.classList.add('show');
  }
}, 1000);

// Wake on click
_idleOverlay.addEventListener('click', function() {
  _idlePaused = false;
  _lastAdminActivity = Date.now();
  _idleOverlay.classList.remove('show');
  // Restart polling
  _pollTimerId = setInterval(function() {
    if (!_isAdminIdle()) doPollAndRefresh();
  }, POLL_INTERVAL_SEC * 1000);
  // Immediate full refresh
  doFullRefresh();
});

// ========== Settings Tab ==========

var _settingsLoaded = false;
var _settingsData = null;

function loadSettings() {
  if (_settingsLoaded) return;
  showLoading('Loading settings...', 'Fetching configuration.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('settingsMsg', 'bad', 'Failed to load settings.'); return; }
      _settingsLoaded = true;
      _settingsData = res.settings;
      populateSettings(res.settings);
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('settingsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetSettings(SIG);
}

function populateSettings(s) {
  document.getElementById('setDoctorEmail').value = s.doctorEmail || '';
  document.getElementById('setTimezone').value = s.timezone || '';
  document.getElementById('setPottersLoc').value = s.pottersLocation || '';
  document.getElementById('setSpinolaLoc').value = s.spinolaLocation || '';
  document.getElementById('setDuration').value = s.apptDurationMin || 10;
  document.getElementById('setAdvanceDays').value = s.advanceDays || 7;
  document.getElementById('setMaxAppts').value = s.maxActiveApptsPerPerson || 0;
  renderHoursEditor(s.workingHours);
}

function renderHoursEditor(hours) {
  var dayNames = {MON:'Monday',TUE:'Tuesday',WED:'Wednesday',THU:'Thursday',FRI:'Friday',SAT:'Saturday',SUN:'Sunday'};
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var el = document.getElementById('hoursEditor');
  var html = '';

  for (var di = 0; di < dayOrder.length; di++) {
    var day = dayOrder[di];
    var blocks = hours[day] || [];
    var enabled = blocks.length > 0;

    html += '<div class="day-row" data-day="' + day + '">';
    html += '<div class="day-row-header">';
    html += '<span class="day-name">' + dayNames[day] + '</span>';
    html += '<label class="day-toggle"><input type="checkbox" ' + (enabled ? 'checked' : '') + ' onchange="toggleDay(\\'' + day + '\\', this.checked)"><span class="slider"></span></label>';
    html += '</div>';
    html += '<div class="day-blocks" id="blocks-' + day + '">';

    if (enabled) {
      for (var bi = 0; bi < blocks.length; bi++) {
        html += timeBlockRow(day, bi, blocks[bi].start, blocks[bi].end);
      }
    }

    html += '</div>';
    html += '<button type="button" class="add-block-btn" onclick="addTimeBlock(\\'' + day + '\\')" ' + (enabled ? '' : 'style="display:none"') + ' id="addBtn-' + day + '">+ Add time block</button>';
    html += '</div>';
  }

  el.innerHTML = html;
}

function timeBlockRow(day, idx, start, end) {
  return '<div class="time-block-row">' +
    '<input type="time" value="' + (start || '09:00') + '" step="600">' +
    '<span class="block-sep">to</span>' +
    '<input type="time" value="' + (end || '12:00') + '" step="600">' +
    '<button type="button" class="remove-block" onclick="this.parentElement.remove()" title="Remove">&times;</button>' +
    '</div>';
}

function toggleDay(day, enabled) {
  var blocksEl = document.getElementById('blocks-' + day);
  var addBtn = document.getElementById('addBtn-' + day);
  if (enabled) {
    if (blocksEl.children.length === 0) {
      blocksEl.innerHTML = timeBlockRow(day, 0, '09:00', '12:00');
    }
    addBtn.style.display = '';
  } else {
    blocksEl.innerHTML = '';
    addBtn.style.display = 'none';
  }
}

function addTimeBlock(day) {
  var blocksEl = document.getElementById('blocks-' + day);
  var div = document.createElement('div');
  div.innerHTML = timeBlockRow(day, blocksEl.children.length, '09:00', '12:00');
  blocksEl.appendChild(div.firstChild);
}

function collectSettings() {
  var settings = {
    doctorEmail: document.getElementById('setDoctorEmail').value,
    timezone: document.getElementById('setTimezone').value,
    pottersLocation: document.getElementById('setPottersLoc').value,
    spinolaLocation: document.getElementById('setSpinolaLoc').value,
    apptDurationMin: parseInt(document.getElementById('setDuration').value, 10),
    advanceDays: parseInt(document.getElementById('setAdvanceDays').value, 10),
    maxActiveApptsPerPerson: parseInt(document.getElementById('setMaxAppts').value, 10)
  };

  // Collect working hours
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var wh = {};
  for (var di = 0; di < dayOrder.length; di++) {
    var day = dayOrder[di];
    var blocksEl = document.getElementById('blocks-' + day);
    var rows = blocksEl.querySelectorAll('.time-block-row');
    wh[day] = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var inputs = rows[ri].querySelectorAll('input[type=time]');
      if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
        wh[day].push({ start: inputs[0].value.substring(0, 5), end: inputs[1].value.substring(0, 5) });
      }
    }
  }
  settings.workingHours = wh;
  return settings;
}

function saveSettings() {
  var settings = collectSettings();

  styledConfirm('Save Settings', 'Save all settings? This will affect the booking page immediately.', 'Save', 'btn-dark', 'Cancel').then(function(ok) {
    if (!ok) return;
    showLoading('Saving settings...', 'Applying configuration changes.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('settingsMsg', 'bad', res.reason || 'Failed to save.'); return; }
        showMsg('settingsMsg', 'good', res.message);
        _settingsLoaded = false; // Force reload on next tab switch
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('settingsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminSaveSettings(SIG, settings);
  });
}

// ========== Data Maintenance ==========

function archiveOldSheets() {
  styledConfirm('Archive Old Sheets', 'This will move appointment data older than 30 days into a single Archive sheet and delete the individual day sheets. All data remains accessible. Continue?', 'Archive', 'btn-dark', 'Cancel').then(function(ok) {
    if (!ok) return;
    showLoading('Archiving...', 'Moving old sheets to archive.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('archiveMsg', 'bad', res.reason || 'Archive failed.'); return; }
        showMsg('archiveMsg', 'good', res.message);
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('archiveMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminArchiveOldSheets(SIG);
  });
}

// ========== Fill Ring ==========

function updateFillRing(booked, capacity) {
  var cap = capacity || 0;
  document.getElementById('statToday').textContent = booked + '/' + cap;
  document.getElementById('statTodayLabel').textContent = 'Today filled';
  var circumference = 2 * Math.PI * 22; // ~138.2
  var pct = cap > 0 ? booked / cap : 0;
  var offset = circumference * (1 - pct);
  var fg = document.getElementById('fillRingFg');
  fg.style.strokeDashoffset = offset;
  fg.style.stroke = pct >= 0.9 ? 'var(--bad)' : pct >= 0.75 ? '#f59e0b' : 'var(--good)';
}

// ========== Attendance Tracking ==========

function markAttendance(appointmentId, dateKey, attended, containerId) {
  // Optimistic UI: update the row immediately without refetching
  var newStatus = attended ? 'ATTENDED' : 'NO_SHOW';
  var badge = getStatusBadge(newStatus);
  // Update the row in ALL visible tables (action, notify, schedule)
  var containerIds = [containerId];
  if (containerId !== 'actionApptsList') containerIds.push('actionApptsList');
  if (containerId !== 'notifyApptsList') containerIds.push('notifyApptsList');
  for (var ci = 0; ci < containerIds.length; ci++) {
    var container = document.getElementById(containerIds[ci]);
    if (!container) continue;
    var rows = container.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
      var cb = rows[i].querySelector('.appt-cb');
      if (cb && cb.value === appointmentId) {
        var badgeEl = rows[i].querySelector('.badge');
        if (badgeEl) { badgeEl.className = 'badge ' + badge.cls; badgeEl.textContent = badge.text; }
        var lastTd = rows[i].querySelector('td:last-child');
        if (lastTd) lastTd.innerHTML = '';
        break;
      }
      // Also handle schedule table (no checkboxes)
      if (!cb) {
        var btns = rows[i].querySelectorAll('.att-btns button');
        for (var j = 0; j < btns.length; j++) {
          if (btns[j].getAttribute('onclick') && btns[j].getAttribute('onclick').indexOf(appointmentId) >= 0) {
            var badgeEl2 = rows[i].querySelector('.badge');
            if (badgeEl2) { badgeEl2.className = 'badge ' + badge.cls; badgeEl2.textContent = badge.text; }
            var lastTd2 = rows[i].querySelector('td:last-child');
            if (lastTd2) lastTd2.innerHTML = '';
            break;
          }
        }
      }
    }
  }

  // Fire-and-forget API call (no loading spinner, no refetch)
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('globalMsg', 'bad', res.reason || 'Failed. Refresh to see current state.'); }
      // Schedule a deferred stats bar refresh (debounced)
      _scheduleStatsRefresh();
    })
    .withFailureHandler(function(err) {
      showMsg('globalMsg', 'bad', 'Error saving: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminMarkAttendance(SIG, appointmentId, dateKey, attended);
}

// Debounced stats refresh — batches multiple rapid actions into one refresh.
// After a write action we know data changed, so skip the poll and go straight to full refresh.
var _statsRefreshTimer = null;
function _scheduleStatsRefresh() {
  if (_statsRefreshTimer) clearTimeout(_statsRefreshTimer);
  _statsRefreshTimer = setTimeout(function() {
    _statsRefreshTimer = null;
    _lastRefreshTime = Date.now();
    doFullRefresh();
  }, 3000);
}

// ========== Patient History ==========

function showPatientHistory(email, phone) {
  var overlay = document.getElementById('patientOverlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ overlay.classList.add('show'); }); });
  document.getElementById('patientTitle').textContent = 'Patient History';
  document.getElementById('patientContent').innerHTML = '<div class="empty">Loading...</div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('patientContent').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      var p = res.patient;
      document.getElementById('patientTitle').textContent = p.name || 'Patient History';

      var html = '';
      // Contact info
      html += '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">';
      if (p.email) html += p.email;
      if (p.email && p.phone) html += ' &middot; ';
      if (p.phone) html += p.phone;
      if (res.firstSeen) html += ' &middot; First seen: ' + res.firstSeen;
      html += '</div>';

      // Summary cards
      html += '<div class="patient-summary">';
      html += '<div class="patient-summary-item"><div class="psv">' + res.totalVisits + '</div><div class="psl">Visits</div></div>';
      html += '<div class="patient-summary-item"><div class="psv">' + res.cancelCount + '</div><div class="psl">Cancellations</div></div>';
      html += '<div class="patient-summary-item"><div class="psv">' + res.noShowCount + '</div><div class="psl">No-Shows</div></div>';
      html += '</div>';

      // Appointment table
      if (res.appointments && res.appointments.length > 0) {
        html += '<div class="table-wrap" style="margin-top:10px;"><table><thead><tr>';
        html += '<th>Date</th><th>Time</th><th>Status</th><th>Location</th><th>Notes</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < res.appointments.length; i++) {
          var a = res.appointments[i];
          var badge = getStatusBadge(a.status);
          html += '<tr>';
          html += '<td><b>' + esc(a.dateKey) + '</b></td>';
          html += '<td>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</td>';
          html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
          html += '<td>' + esc(a.location) + '</td>';
          html += '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(a.comments || '') + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
      } else {
        html += '<div class="empty">No appointment history found.</div>';
      }

      document.getElementById('patientContent').innerHTML = html;
    })
    .withFailureHandler(function(err) {
      document.getElementById('patientContent').innerHTML = '<div class="empty">Error: ' + esc(err && err.message ? err.message : String(err)) + '</div>';
    })
    .apiAdminGetPatientHistory(SIG, email, phone);
}

function hidePatientHistory() {
  var overlay = document.getElementById('patientOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
}

// ========== Statistics Tab ==========

var _statsLoaded = false;

function loadStatistics() {
  if (_statsLoaded) return;
  showMsg('statsMsg', '', 'Loading statistics...');

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('statsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('statsMsg', '', '');
      _statsLoaded = true;
      renderAllStats(res);
    })
    .withFailureHandler(function(err) {
      showMsg('statsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetStatistics(SIG);
}

function renderAllStats(s) {
  // Period label
  document.getElementById('statsPeriod').textContent = s.period.from + ' to ' + s.period.to + ' (generated ' + s.generated + ')';

  // Hero metrics
  renderProgressRing(s.utilization);
  document.getElementById('heroUtil').textContent = s.utilization + '%';
  document.getElementById('heroBooked').textContent = s.totalBooked;
  // Trend arrow on appointments
  var trendArrow = '';
  if (s.trendDirection === 'up') trendArrow = '<span class="trend-arrow trend-up">&uarr;' + s.trendPct + '%</span>';
  else if (s.trendDirection === 'down') trendArrow = '<span class="trend-arrow trend-down">&darr;' + s.trendPct + '%</span>';
  document.getElementById('heroBookedSub').innerHTML = 'last 28 days ' + trendArrow;
  document.getElementById('heroCancelRate').textContent = s.cancelRate + '%';
  var crEl = document.getElementById('heroCancelRate');
  crEl.style.color = s.cancelRate < 10 ? 'var(--good)' : s.cancelRate < 20 ? '#f59e0b' : 'var(--bad)';
  document.getElementById('heroPatients').textContent = s.totalUniquePatients;
  document.getElementById('heroRepeat').textContent = s.repeatPatients + ' returning';

  renderWeeklyTrend(s.weeklyTrend);
  renderPeakHours(s.hourlyDistribution);
  renderUtilByDay(s.utilizationByDay);
  renderUpcomingLoad(s.upcomingLoad);
  renderLocationSplit(s.locationSplit);
  renderTopPatients(s.topPatients);
  renderCancelBreakdown(s);
  renderBusiestDay(s.busiestDay);
  renderLeadTime(s);
  renderAttendance(s);
  renderDoctorActions(s);
  renderCountryBreakdown(s.countryBreakdown);
  renderTopCancellers(s.topCancellers);
}

function renderLeadTime(s) {
  var el = document.getElementById('leadTimeChart');
  var html = '<div style="text-align:center;padding:12px 0;">';
  html += '<div style="font-size:42px;font-weight:900;color:#2563eb;">' + (s.avgLeadTimeDays || 0) + '</div>';
  html += '<div style="font-size:14px;font-weight:700;margin-top:4px;">days average</div>';
  html += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">How far ahead patients book</div>';
  if (s.sameDayCancels > 0) {
    html += '<div style="margin-top:12px;padding:8px 12px;background:rgba(245,158,11,0.08);border-radius:10px;display:inline-block;">';
    html += '<span style="font-size:18px;font-weight:800;color:#b45309;">' + s.sameDayCancels + '</span>';
    html += '<span style="font-size:12px;color:#b45309;margin-left:6px;">same-day cancellations</span>';
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderAttendance(s) {
  var el = document.getElementById('attendanceChart');
  var attended = s.totalAttended || 0;
  var noShow = s.totalNoShow || 0;
  var total = attended + noShow;

  var html = '<div style="text-align:center;padding:8px 0;">';
  if (total > 0) {
    var noShowRate = s.noShowRate || 0;
    var noShowColor = noShowRate < 5 ? 'var(--good)' : noShowRate < 15 ? '#f59e0b' : 'var(--bad)';
    html += '<div style="font-size:36px;font-weight:900;color:' + noShowColor + ';">' + noShowRate + '%</div>';
    html += '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;">No-show rate</div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">Attended</div>';
    var pctA = total > 0 ? Math.round(attended / total * 100) : 0;
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctA + '%;background:var(--good);"></div></div>';
    html += '<div class="h-bar-pct">' + attended + '</div></div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">No-Show</div>';
    var pctN = 100 - pctA;
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctN + '%;background:#f59e0b;"></div></div>';
    html += '<div class="h-bar-pct">' + noShow + '</div></div>';
  } else {
    html += '<div class="empty">No attendance data yet.<br><span style="font-size:11px;">Use the &#x2713; and &#x2717; buttons on today\\'s appointments to track attendance.</span></div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderProgressRing(pct) {
  var circumference = 2 * Math.PI * 30; // r=30
  var offset = circumference - (pct / 100) * circumference;
  var fg = document.querySelector('#utilRing .ring-fg');
  if (fg) {
    fg.style.strokeDasharray = circumference;
    // Trigger animation by setting initially then updating
    setTimeout(function() { fg.style.strokeDashoffset = offset; }, 50);
  }
}

function renderWeeklyTrend(weeks) {
  var el = document.getElementById('weeklyTrendChart');
  if (!weeks || !weeks.length) { el.innerHTML = '<div class="empty">No data yet.</div>'; return; }

  var maxVal = 1;
  for (var i = 0; i < weeks.length; i++) {
    var total = weeks[i].booked + weeks[i].cancelled;
    if (total > maxVal) maxVal = total;
  }

  var html = '';
  for (var i = 0; i < weeks.length; i++) {
    var w = weeks[i];
    var bH = Math.round((w.booked / maxVal) * 100);
    var cH = Math.round((w.cancelled / maxVal) * 100);
    html += '<div class="bar-col">';
    html += '<div class="bar-val">' + w.booked + '</div>';
    html += '<div class="bar-stack" style="height:100%;">';
    html += '<div style="flex:1;"></div>'; // spacer
    if (w.cancelled > 0) html += '<div class="bar cancelled" style="height:' + cH + '%;"></div>';
    html += '<div class="bar booked" style="height:' + bH + '%;"></div>';
    html += '</div>';
    html += '<div class="bar-label">' + esc(w.label) + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderPeakHours(dist) {
  var el = document.getElementById('peakHoursMap');
  if (!dist) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  // Only show hours that have data or are in working range (7-21)
  var maxCount = 1;
  for (var h = 0; h < 24; h++) { if (dist[h] > maxCount) maxCount = dist[h]; }

  var html = '';
  for (var h = 7; h <= 20; h++) {
    var count = dist[h] || 0;
    var intensity = maxCount > 0 ? count / maxCount : 0;
    var r = Math.round(219 - intensity * 182);
    var g = Math.round(234 - intensity * 135);
    var b = Math.round(254 - intensity * 15);
    var textColor = intensity > 0.6 ? '#fff' : 'var(--fg)';
    if (count === 0) { r = 249; g = 250; b = 251; textColor = 'var(--muted)'; }
    var label = h < 12 ? h + 'am' : (h === 12 ? '12pm' : (h - 12) + 'pm');
    html += '<div class="heat-cell" style="background:rgb(' + r + ',' + g + ',' + b + ');color:' + textColor + ';">';
    html += '<span class="heat-hour">' + label + '</span>';
    html += count;
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderUtilByDay(utilByDay) {
  var el = document.getElementById('utilByDay');
  if (!utilByDay) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  var days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  for (var i = 0; i < days.length; i++) {
    var pct = utilByDay[days[i]] || 0;
    var color = pct >= 90 ? 'var(--bad)' : pct >= 70 ? '#f59e0b' : '#2563eb';
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label">' + labels[i] + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + pct + '%</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderUpcomingLoad(load) {
  var el = document.getElementById('upcomingLoadChart');
  if (!load || !load.length) { el.innerHTML = '<div class="empty">No upcoming data.</div>'; return; }

  var html = '';
  for (var i = 0; i < load.length; i++) {
    var d = load[i];
    if (d.capacity === 0) continue; // Skip closed days
    var pct = d.capacity > 0 ? Math.round(d.booked / d.capacity * 100) : 0;
    if (pct > 100) pct = 100;
    var color = pct >= 90 ? 'var(--bad)' : pct >= 75 ? '#f59e0b' : 'var(--good)';
    var dateNum = d.dateKey.substring(8);
    html += '<div class="capacity-row">';
    html += '<div class="capacity-label">' + d.dayLabel + ' ' + parseInt(dateNum, 10) + '</div>';
    html += '<div class="capacity-track"><div class="capacity-fill" style="width:' + pct + '%;background:' + color + ';"></div>';
    html += '<div class="capacity-text">' + d.booked + '/' + d.capacity + '</div></div>';
    html += '</div>';
  }
  el.innerHTML = html || '<div class="empty">No working days ahead.</div>';
}

function renderLocationSplit(split) {
  var el = document.getElementById('locationSplitChart');
  if (!split) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  var total = split.potters + split.spinola;
  if (total === 0) { el.innerHTML = '<div class="empty">No appointments yet.</div>'; return; }

  var pctP = Math.round(split.potters / total * 100);
  var pctS = 100 - pctP;

  var html = '';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:60px;">Potter\\'s</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctP + '%;background:#2563eb;"></div></div>';
  html += '<div class="h-bar-pct">' + split.potters + '</div></div>';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:60px;">Spinola</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctS + '%;background:#8b5cf6;"></div></div>';
  html += '<div class="h-bar-pct">' + split.spinola + '</div></div>';
  el.innerHTML = html;
}

function renderTopPatients(patients) {
  var el = document.getElementById('topPatientsChart');
  if (!patients || !patients.length) { el.innerHTML = '<div class="empty">No patient data yet.</div>'; return; }

  var html = '';
  for (var i = 0; i < patients.length; i++) {
    var p = patients[i];
    html += '<div class="patient-row">';
    html += '<div class="patient-rank">' + (i + 1) + '</div>';
    html += '<div class="patient-name">' + esc(p.name) + '</div>';
    html += '<div class="patient-count">' + p.count + ' visits</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderCancelBreakdown(s) {
  var el = document.getElementById('cancelBreakdownChart');
  var cb = s.cancelBreakdown;
  var total = cb.byDoctor + cb.byPatient;

  var html = '<div style="margin-bottom:12px;">';
  html += '<div style="font-size:36px;font-weight:900;color:' + (s.cancelRate < 10 ? 'var(--good)' : s.cancelRate < 20 ? '#f59e0b' : 'var(--bad)') + ';">' + s.cancelRate + '%</div>';
  html += '<div style="font-size:12px;color:var(--muted);">Overall cancel rate</div>';
  html += '</div>';

  if (total > 0) {
    var pctD = Math.round(cb.byDoctor / total * 100);
    var pctP = 100 - pctD;
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Doctor</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctD + '%;background:#f59e0b;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byDoctor + '</div></div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Patient</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctP + '%;background:#ef4444;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byPatient + '</div></div>';
  } else {
    html += '<div class="empty">No cancellations!</div>';
  }
  html += '<div style="margin-top:10px;font-size:12px;color:var(--muted);">Total cancelled: ' + s.totalCancelled + ' of ' + (s.totalBooked + s.totalCancelled) + '</div>';
  el.innerHTML = html;
}

function renderBusiestDay(day) {
  var el = document.getElementById('busiestDayChart');
  if (!day || !day.dateKey) { el.innerHTML = '<div class="empty">No data yet.</div>'; return; }

  el.innerHTML = '<div style="text-align:center;padding:12px 0;">'
    + '<div style="font-size:42px;font-weight:900;color:#2563eb;">' + day.count + '</div>'
    + '<div style="font-size:14px;font-weight:700;margin-top:4px;">' + day.dayName + ', ' + day.dateKey + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-top:2px;">Most appointments in a single day</div>'
    + '</div>';
}

function renderDoctorActions(s) {
  var el = document.getElementById('doctorActionsChart');
  var cb = s.cancelBreakdown || {};
  var html = '';

  var items = [
    { label: 'Cancelled by doctor', count: cb.byDoctor || 0, color: '#f59e0b' },
    { label: 'Cancelled by patient', count: cb.byPatient || 0, color: '#ef4444' },
    { label: 'Redirected to Spinola', count: s.relocatedSpinola || 0, color: '#8b5cf6' },
    { label: 'Pushed to next day', count: s.pushedNextDay || 0, color: '#2563eb' },
    { label: 'Pushed to next time', count: s.pushedSameDay || 0, color: '#06b6d4' }
  ];

  var maxCount = 1;
  for (var i = 0; i < items.length; i++) {
    if (items[i].count > maxCount) maxCount = items[i].count;
  }

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var pct = maxCount > 0 ? Math.round(it.count / maxCount * 100) : 0;
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:140px;font-size:12px;">' + it.label + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + it.color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + it.count + '</div>';
    html += '</div>';
  }

  if (!html) html = '<div class="empty">No data yet.</div>';
  el.innerHTML = html;
}

function renderCountryBreakdown(countries) {
  var el = document.getElementById('countryChart');
  if (!countries || !countries.length) { el.innerHTML = '<div class="empty">No country data yet.</div>'; return; }

  var maxCount = countries[0].count || 1;
  var colors = ['#2563eb','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316'];

  var html = '';
  for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
    var pct = Math.round(c.count / maxCount * 100);
    var color = colors[i % colors.length];
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:90px;font-size:12px;">' + esc(c.country) + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + c.count + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderTopCancellers(cancellers) {
  var el = document.getElementById('topCancellersChart');
  if (!cancellers || !cancellers.length) { el.innerHTML = '<div class="empty">No cancellation data yet.</div>'; return; }

  var html = '';
  for (var i = 0; i < cancellers.length; i++) {
    var c = cancellers[i];
    html += '<div class="patient-row">';
    html += '<div class="patient-rank" style="background:rgba(239,68,68,0.1);color:#ef4444;">' + (i + 1) + '</div>';
    html += '<div class="patient-name">' + esc(c.name) + '</div>';
    html += '<div class="patient-count" style="color:#ef4444;">' + c.count + ' cancelled</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

</script>

</body>
</html>
`,
    DoctorAdmin: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#f5f7fb;
    --card:#ffffff;
    --text:#111827;
    --muted:#6b7280;
    --line:#e5e7eb;
    --good:#10b981;
    --good-dark:#047857;
    --bad:#ef4444;
    --bad-dark:#b91c1c;
    --blue:#2563eb;
    --blue-dark:#1d4ed8;
    --amber:#f59e0b;
    --amber-soft:#fffbeb;
    --shadow:0 14px 40px rgba(15,23,42,0.10);
    --radius:22px;
  }
  body{
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    background:var(--bg);
    color:var(--text);
    max-width:680px;
    margin:0 auto;
    padding:14px 14px 28px;
  }
  button,input{font:inherit;}
  .stack{display:flex;flex-direction:column;gap:14px;}
  .date-label{font-size:15px;font-weight:800;color:var(--text);padding:4px 2px 0;}
  .day-nav{display:flex;align-items:center;gap:10px;}
  .day-nav-arrow{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text);transition:background .15s,opacity .15s;flex-shrink:0;}
  .day-nav-arrow:hover{background:#f0f4ff;}
  .day-nav-arrow:disabled{opacity:.25;cursor:default;background:#fff;}
  .not-today-banner{font-size:12px;color:#b45309;font-weight:700;margin-top:2px;}
  .not-today-banner a{color:#1d4ed8;text-decoration:underline;}
  .viewing-future .card{border-left:3px solid #f59e0b;}
  .card{background:var(--card);border-radius:var(--radius);padding:18px;box-shadow:var(--shadow);}
  .session-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;}
  .session-title{font-size:20px;font-weight:900;line-height:1.1;}
  .status-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;margin-top:8px;}
  .status-pill.coming{background:#d1fae5;color:var(--good-dark);}
  .status-pill.not-coming{background:#fee2e2;color:var(--bad-dark);}
  .dot{width:8px;height:8px;border-radius:50%;background:currentColor;}
  .work-summary{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .work-summary .label{font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;}
  .work-summary .value{font-size:17px;font-weight:900;line-height:1.25;}
  .work-summary .hint{font-size:12px;color:var(--muted);line-height:1.4;}
  .session-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
  .btn{border:none;border-radius:18px;padding:14px 16px;font-weight:900;cursor:pointer;transition:transform .12s ease,opacity .12s ease,background .12s ease;}
  .btn:active{transform:scale(.98);}
  .btn-primary{background:var(--good);color:#fff;}
  .btn-danger{background:var(--bad);color:#fff;}
  .btn-secondary{background:#eff6ff;color:var(--blue-dark);}
  .btn-ghost{background:#f3f4f6;color:var(--text);}
  .btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
  .patient-list{display:flex;flex-direction:column;gap:10px;}
  .patient-card{border:1px solid var(--line);border-radius:18px;padding:12px 14px;display:flex;align-items:center;gap:12px;background:#fff;}
  .patient-card.relocated{opacity:.55;}
  .patient-card.relocated .patient-name,
  .patient-card.relocated .patient-meta,
  .patient-card.relocated .patient-time{text-decoration:line-through;text-decoration-color:var(--muted);}
  .patient-badge{display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:8px;margin-top:4px;text-decoration:none;}
  .patient-badge.spinola{background:#fef3c7;color:#92400e;}
  .patient-main{flex:1;min-width:0;}
  .patient-name{font-size:15px;font-weight:800;line-height:1.25;}
  .patient-meta{font-size:12px;color:var(--muted);line-height:1.45;margin-top:3px;word-break:break-word;}
  .patient-time{font-size:14px;font-weight:900;color:var(--blue-dark);text-align:right;white-space:nowrap;}
  .empty{padding:14px;border-radius:16px;background:#f9fafb;border:1px dashed var(--line);font-size:13px;color:var(--muted);text-align:center;}

  .calendar-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
  .calendar-title{font-size:18px;font-weight:900;}
  .calendar-subtitle{font-size:13px;color:var(--muted);line-height:1.4;margin-bottom:14px;}
  .calendar-nav{display:flex;align-items:center;gap:8px;}
  .icon-btn{width:40px;height:40px;border:none;border-radius:14px;background:#eef2ff;color:var(--blue-dark);font-size:18px;font-weight:900;cursor:pointer;}
  .calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;}
  .dow{font-size:11px;color:var(--muted);font-weight:800;text-align:center;padding-bottom:2px;}
  .day-btn{position:relative;min-height:62px;border:none;border-radius:18px;background:#f8fafc;color:var(--text);padding:9px 6px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;border:1px solid transparent;}
  .day-btn.disabled{opacity:.32;cursor:not-allowed;}
  .day-btn.selected{border-color:var(--blue);background:#dbeafe;}
  .day-btn.cancelled{background:#fee2e2;border-color:#fca5a5;color:var(--bad-dark);}
  .day-btn.cancelled.selected{background:#fecaca;}
  .day-num{font-size:16px;font-weight:900;line-height:1;}
  .day-mark{font-size:11px;font-weight:900;line-height:1.2;min-height:13px;}
  .day-x{position:absolute;top:7px;right:7px;font-size:16px;font-weight:900;color:var(--bad-dark);}
  .calendar-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}
  .selection-summary{margin-top:10px;font-size:12px;color:var(--muted);line-height:1.5;}

  .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.48);display:none;align-items:flex-end;justify-content:center;padding:16px;z-index:1001;}
  .modal-overlay.show{display:flex;}
  .modal-card{width:100%;max-width:680px;background:#fff;border-radius:26px 26px 22px 22px;box-shadow:0 18px 50px rgba(15,23,42,.24);padding:18px 18px 20px;max-height:min(88vh,780px);overflow:auto;}
  .modal-handle{width:52px;height:5px;border-radius:999px;background:#d1d5db;margin:0 auto 12px;}
  .modal-title{font-size:20px;font-weight:900;margin-bottom:6px;}
  .modal-text{font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:14px;}
  .range-block{padding:12px 0;border-top:1px solid var(--line);}
  .range-block:first-of-type{border-top:none;padding-top:0;}
  .range-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px;}
  .range-label{font-size:13px;font-weight:900;}
  .range-value{font-size:14px;font-weight:900;color:var(--blue-dark);text-align:right;}
  .range-hint{font-size:12px;color:var(--muted);line-height:1.35;margin-top:4px;}
  input[type=range]{width:100%;height:34px;background:transparent;-webkit-appearance:none;appearance:none;}
  input[type=range]::-webkit-slider-runnable-track{height:8px;border-radius:999px;background:#dbeafe;}
  input[type=range]::-moz-range-track{height:8px;border-radius:999px;background:#dbeafe;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:var(--blue);margin-top:-10px;border:none;box-shadow:0 4px 10px rgba(37,99,235,.35);}
  input[type=range]::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:var(--blue);border:none;box-shadow:0 4px 10px rgba(37,99,235,.35);}
  .switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line);}
  .switch-copy{flex:1;}
  .switch-copy strong{display:block;font-size:14px;margin-bottom:4px;}
  .switch-copy span{font-size:12px;color:var(--muted);line-height:1.4;}
  .switch{position:relative;display:inline-block;width:58px;height:32px;flex:0 0 auto;}
  .switch input{opacity:0;width:0;height:0;}
  .switch-slider{position:absolute;cursor:pointer;inset:0;background:#d1d5db;border-radius:999px;transition:.2s;}
  .switch-slider:before{content:'';position:absolute;height:24px;width:24px;left:4px;top:4px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 2px 6px rgba(0,0,0,.2);}
  .switch input:checked + .switch-slider{background:var(--blue);}
  .switch input:checked + .switch-slider:before{transform:translateX(26px);}
  .modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}

  .action-summary{padding:12px 14px;border-radius:16px;background:var(--amber-soft);border:1px solid #fcd34d;color:#92400e;font-size:13px;line-height:1.5;margin-bottom:14px;}
  .affected-list{display:flex;flex-direction:column;gap:10px;max-height:32vh;overflow:auto;margin-bottom:14px;}
  .affected-card{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;}
  .affected-date{font-size:12px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;}
  .affected-name{font-size:15px;font-weight:900;}
  .affected-meta{font-size:12px;color:var(--muted);line-height:1.4;margin-top:2px;}
  .action-grid{display:grid;gap:10px;}

  .break-options{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}
  .break-opt{border:2px solid var(--line);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;background:#fff;}
  .break-opt.selected{border-color:var(--blue);background:#eff6ff;}
  .break-opt-mins{font-size:22px;font-weight:900;line-height:1.2;}
  .break-opt-label{font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.03em;}
  .break-summary{font-size:13px;color:var(--muted);line-height:1.45;padding:10px 0;}

  .msg{display:none;margin-top:12px;padding:11px 13px;border-radius:14px;font-size:13px;font-weight:800;line-height:1.4;}
  .msg.good{display:block;background:#d1fae5;color:#065f46;}
  .msg.bad{display:block;background:#fee2e2;color:#991b1b;}

  .loading-overlay{position:fixed;inset:0;background:rgba(255,255,255,.86);display:none;align-items:center;justify-content:center;z-index:1100;flex-direction:column;gap:10px;}
  .loading-overlay.show{display:flex;}
  .loading-spinner{width:38px;height:38px;border:4px solid #dbeafe;border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;}
  .loading-text{font-size:14px;font-weight:900;}
  .idle-overlay{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(245,247,251,0.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .35s ease,visibility .35s ease;}
  .idle-overlay.show{opacity:1;visibility:visible;pointer-events:auto;}
  .idle-card{text-align:center;padding:40px 28px;max-width:360px;animation:idle-float 3s ease-in-out infinite;}
  .idle-icon{font-size:54px;margin-bottom:16px;animation:idle-pulse-icon 2.5s ease-in-out infinite;}
  .idle-title{font-size:24px;font-weight:900;margin-bottom:8px;}
  .idle-sub{font-size:14px;color:var(--muted);line-height:1.5;margin-bottom:22px;}
  .idle-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:var(--blue);color:#fff;font-size:15px;font-weight:900;box-shadow:0 8px 24px rgba(37,99,235,.28);}
  .idle-arrow{display:inline-block;transition:transform .2s ease;}
  .idle-overlay:hover .idle-arrow{transform:translateX(4px);}
  .contact-link{color:inherit;text-decoration:none;font-weight:800;}
  .contact-link:hover{text-decoration:underline;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes idle-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
  @keyframes idle-pulse-icon{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.75;transform:scale(.95);}}

  @media (max-width:420px){
    .session-actions,.calendar-actions,.modal-actions{grid-template-columns:1fr;}
    .session-title{font-size:18px;}
    .patient-card{align-items:flex-start;}
  }
</style>
</head>
<body>
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
    <div class="loading-text" id="loadingText">Loading…</div>
  </div>

  <div class="idle-overlay" id="idleOverlay">
    <div class="idle-card">
      <div class="idle-icon">🩺</div>
      <div class="idle-title">Doctor Dashboard Paused</div>
      <div class="idle-sub">Automatic updates are paused to save resources. Tap anywhere to resume live updates.</div>
      <div class="idle-cta">Resume Dashboard <span class="idle-arrow">→</span></div>
    </div>
  </div>

  <div class="stack">
    <div class="day-nav">
      <button class="day-nav-arrow" id="dayPrev" onclick="navigateDay(-1)">&larr;</button>
      <div>
        <div id="dateLabel" class="date-label"></div>
        <div id="notTodayBanner" class="not-today-banner" style="display:none;">
          You are viewing a future date &mdash; <a href="#" onclick="navigateToToday();return false;">back to today</a>
        </div>
      </div>
      <button class="day-nav-arrow" id="dayNext" onclick="navigateDay(1)">&rarr;</button>
    </div>

    <section class="card" id="morningCard">
      <div class="session-head">
        <div>
          <div class="session-title">Morning</div>
          <div class="status-pill coming" id="morningPill"><span class="dot"></span><span id="morningPillText">Coming to Work</span></div>
        </div>
      </div>
      <div class="work-summary">
        <div class="label">Working times</div>
        <div class="value" id="morningTimes">—</div>
        <div class="hint" id="morningHint"></div>
      </div>
      <div class="session-actions" style="grid-template-columns:1fr 1fr 1fr;">
        <button class="btn btn-danger" id="morningToggleBtn" onclick="toggleSession('morning')">Not Coming to Work</button>
        <button class="btn btn-secondary" onclick="openAdjustModal('morning')">Adjust Shift</button>
        <button class="btn btn-ghost" onclick="openBreakModal('morning')">Take a Break</button>
      </div>
      <div class="patient-list" id="morningPatients"></div>
      <div class="msg" id="morningMsg"></div>
    </section>

    <section class="card" id="eveningCard">
      <div class="session-head">
        <div>
          <div class="session-title">Evening</div>
          <div class="status-pill coming" id="eveningPill"><span class="dot"></span><span id="eveningPillText">Coming to Work</span></div>
        </div>
      </div>
      <div class="work-summary">
        <div class="label">Working times</div>
        <div class="value" id="eveningTimes">—</div>
        <div class="hint" id="eveningHint"></div>
      </div>
      <div class="session-actions" style="grid-template-columns:1fr 1fr 1fr;">
        <button class="btn btn-danger" id="eveningToggleBtn" onclick="toggleSession('evening')">Not Coming to Work</button>
        <button class="btn btn-secondary" onclick="openAdjustModal('evening')">Adjust Shift</button>
        <button class="btn btn-ghost" onclick="openBreakModal('evening')">Take a Break</button>
      </div>
      <div class="patient-list" id="eveningPatients"></div>
      <div class="msg" id="eveningMsg"></div>
    </section>

    <section class="card">
      <div class="calendar-head">
        <div class="calendar-title">Cancel or Reactivate Dates</div>
        <div class="calendar-nav">
          <button class="icon-btn" onclick="changeCalendarMonth(-1)">‹</button>
          <button class="icon-btn" onclick="changeCalendarMonth(1)">›</button>
        </div>
      </div>
      <div class="calendar-subtitle">Tap one or more future days. Cancelled days are marked with an X. Tap them again to reactivate.</div>
      <div class="date-label" id="calendarMonthLabel" style="padding:0 0 10px;"></div>
      <div class="calendar-grid" id="calendarGrid"></div>
      <div class="calendar-actions">
        <button class="btn btn-danger" id="cancelDaysBtn" onclick="startCancelSelectedDays()">Cancel Selected Days</button>
        <button class="btn btn-secondary" id="reactivateDaysBtn" onclick="reactivateSelectedDays()">Reactivate Selected Days</button>
      </div>
      <div class="selection-summary" id="calendarSelectionSummary">No days selected.</div>
      <div class="msg" id="calendarMsg"></div>
    </section>
  </div>

  <div class="modal-overlay" id="adjustModal">
    <div class="modal-card">
      <div class="modal-handle"></div>
      <div class="modal-title" id="adjustTitle">Adjust shift</div>
      <div class="modal-text" id="adjustText"></div>

      <div class="range-block">
        <div class="range-top">
          <div>
            <div class="range-label">Shift starts</div>
            <div class="range-hint">Slide to choose when work starts.</div>
          </div>
          <div class="range-value" id="adjustStartValue">—</div>
        </div>
        <input type="range" id="adjustStartRange" min="0" max="0" step="1" oninput="syncAdjustModal()">
      </div>

      <div class="range-block">
        <div class="range-top">
          <div>
            <div class="range-label">Shift ends</div>
            <div class="range-hint">Slide to choose when work ends.</div>
          </div>
          <div class="range-value" id="adjustEndValue">—</div>
        </div>
        <input type="range" id="adjustEndRange" min="0" max="0" step="1" oninput="syncAdjustModal()">
      </div>

      <div class="switch-row">
        <div class="switch-copy">
          <strong>Insert a block</strong>
          <span>Add a gap inside the shift where patients cannot book.</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="gapEnabled" onchange="syncAdjustModal()">
          <span class="switch-slider"></span>
        </label>
      </div>

      <div id="gapControls" style="display:none;">
        <div class="range-block">
          <div class="range-top">
            <div>
              <div class="range-label">Block starts</div>
              <div class="range-hint">Choose when the gap begins.</div>
            </div>
            <div class="range-value" id="gapStartValue">—</div>
          </div>
          <input type="range" id="gapStartRange" min="0" max="0" step="1" oninput="syncAdjustModal()">
        </div>
        <div class="range-block">
          <div class="range-top">
            <div>
              <div class="range-label">Block ends</div>
              <div class="range-hint">Choose when the gap finishes.</div>
            </div>
            <div class="range-value" id="gapEndValue">—</div>
          </div>
          <input type="range" id="gapEndRange" min="0" max="0" step="1" oninput="syncAdjustModal()">
        </div>
      </div>

      <div class="action-summary" id="adjustSummary"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeAdjustModal()">Close</button>
        <button class="btn btn-primary" onclick="saveAdjustModal()">Save Shift</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="breakModal">
    <div class="modal-card">
      <div class="modal-handle"></div>
      <div class="modal-title">Take a Break</div>
      <div class="modal-text">How long do you need? The break starts now.</div>
      <div class="break-options">
        <div class="break-opt" onclick="selectBreakDuration(20)" id="breakOpt20">
          <div class="break-opt-mins">20</div>
          <div class="break-opt-label">minutes</div>
        </div>
        <div class="break-opt" onclick="selectBreakDuration(30)" id="breakOpt30">
          <div class="break-opt-mins">30</div>
          <div class="break-opt-label">minutes</div>
        </div>
        <div class="break-opt" onclick="selectBreakDuration(40)" id="breakOpt40">
          <div class="break-opt-mins">40</div>
          <div class="break-opt-label">minutes</div>
        </div>
      </div>
      <div class="break-summary" id="breakSummary"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeBreakModal()">Cancel</button>
        <button class="btn btn-primary" id="breakConfirmBtn" onclick="confirmBreak()" disabled>Start Break</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="actionModal">
    <div class="modal-card">
      <div class="modal-handle"></div>
      <div class="modal-title" id="actionTitle">Appointments must be handled first</div>
      <div class="modal-text" id="actionText"></div>
      <div class="action-summary" id="actionSummary"></div>
      <div class="affected-list" id="affectedList"></div>
      <div class="action-grid">
        <button class="btn btn-secondary" onclick="handlePendingAction('redirect_spinola')">Send to Spinola</button>
        <button class="btn btn-primary" id="actionPushSameDay" style="display:none;" onclick="handlePendingAction('push_same_day')">Push to Later Today</button>
        <button class="btn btn-primary" onclick="handlePendingAction('push_next_day')">Push to Next Day</button>
        <button class="btn btn-danger" onclick="handlePendingAction('cancel')">Cancel Appointments</button>
        <button class="btn btn-ghost" onclick="closeActionModal()">Back</button>
      </div>
    </div>
  </div>

<script>
var SIG = '<?= adminSig ?>';
var _todayKey = '';
var _selectedDateKey = '';
var _workingHours = null;
var _offEntries = [];
var _extraEntries = [];
var _sessionState = { morning: null, evening: null };
var _appointmentsBySession = { morning: [], evening: [] };
var _calendarMonth = null;
var _selectedDates = {};
var _cachedDateAppointments = {};
var _adjustContext = null;
var _pendingFlow = null;
var SLOT_MINUTES = 15;
var AUTO_REFRESH_MS = 20 * 1000;
var IDLE_TIMEOUT_MS = 2 * 60 * 1000;
var GAS_TIMEOUT_MS = 30 * 1000;
function withTimeout(promise, ms) {
  ms = ms || GAS_TIMEOUT_MS;
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() { reject(new Error('Server took too long. Please try again.')); }, ms);
    promise.then(function(v) { clearTimeout(timer); resolve(v); }, function(e) { clearTimeout(timer); reject(e); });
  });
}
var _idlePaused = false;
var _lastActivityAt = Date.now();
var _autoRefreshTimerId = null;
var _idleCheckTimerId = null;
var _refreshInFlight = false;
var _idleOverlay = document.getElementById('idleOverlay');

function showLoading(msg) {
  document.getElementById('loadingText').textContent = msg || 'Loading…';
  document.getElementById('loadingOverlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}
function showMsg(id, type, msg) {
  var el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = msg;
  setTimeout(function() { el.className = 'msg'; }, 6000);
}
function esc(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}
function timeToMin(t) {
  if (!t) return 0;
  var p = String(t).split(':');
  return Number(p[0] || 0) * 60 + Number(p[1] || 0);
}
function minToTime(m) {
  var hours = Math.floor(m / 60);
  var mins = m % 60;
  return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
}
function addDays(dateKey, days) {
  var d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d;
}
function toDateKey(dateObj) {
  var y = dateObj.getFullYear();
  var m = String(dateObj.getMonth() + 1).padStart(2, '0');
  var d = String(dateObj.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
function dateLabel(dateKey) {
  var d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function getTomorrowKey() {
  return toDateKey(addDays(_todayKey, 1));
}
function sortTimeRanges(ranges) {
  return ranges.slice().sort(function(a, b) { return timeToMin(a.start) - timeToMin(b.start); });
}
function mergeRanges(ranges) {
  if (!ranges.length) return [];
  var sorted = ranges.slice().sort(function(a, b) { return a.startMin - b.startMin; });
  var merged = [sorted[0]];
  for (var i = 1; i < sorted.length; i++) {
    var prev = merged[merged.length - 1];
    var cur = sorted[i];
    if (cur.startMin <= prev.endMin) {
      prev.endMin = Math.max(prev.endMin, cur.endMin);
    } else {
      merged.push({ startMin: cur.startMin, endMin: cur.endMin });
    }
  }
  return merged;
}
function subtractBlocks(base, blocks) {
  if (!base) return [];
  if (!blocks.length) return [{ start: base.start, end: base.end }];
  var cursor = timeToMin(base.start);
  var end = timeToMin(base.end);
  var merged = mergeRanges(blocks);
  var result = [];
  for (var i = 0; i < merged.length; i++) {
    var block = merged[i];
    if (block.startMin > cursor) result.push({ start: minToTime(cursor), end: minToTime(block.startMin) });
    cursor = Math.max(cursor, block.endMin);
  }
  if (cursor < end) result.push({ start: minToTime(cursor), end: minToTime(end) });
  return result.filter(function(seg) { return timeToMin(seg.end) > timeToMin(seg.start); });
}
function blocksFromSegments(base, segments) {
  var blocks = [];
  var cursor = timeToMin(base.start);
  var end = timeToMin(base.end);
  var ordered = sortTimeRanges(segments);
  for (var i = 0; i < ordered.length; i++) {
    var segStart = timeToMin(ordered[i].start);
    var segEnd = timeToMin(ordered[i].end);
    if (segStart > cursor) blocks.push({ start: minToTime(cursor), end: minToTime(segStart) });
    cursor = Math.max(cursor, segEnd);
  }
  if (cursor < end) blocks.push({ start: minToTime(cursor), end: minToTime(end) });
  return blocks.filter(function(block) { return timeToMin(block.end) > timeToMin(block.start); });
}
function isWithinAnySegment(startTime, endTime, segments) {
  var start = timeToMin(startTime);
  var end = timeToMin(endTime);
  for (var i = 0; i < segments.length; i++) {
    if (start >= timeToMin(segments[i].start) && end <= timeToMin(segments[i].end)) return true;
  }
  return false;
}
function isSessionAvailable(session) {
  return !!(_sessionState[session] && _sessionState[session].segments.length);
}
function getDayWindows(dateKey) {
  var d = new Date(dateKey + 'T12:00:00');
  var dowKeys = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  return (_workingHours && _workingHours[dowKeys[d.getDay()]]) || [];
}
function classifyBaseWindow(session) {
  var windows = getDayWindows(_selectedDateKey);
  for (var i = 0; i < windows.length; i++) {
    var startHour = parseInt(String(windows[i].start || '00:00').split(':')[0], 10);
    if (session === 'morning' && startHour < 13) return windows[i];
    if (session === 'evening' && startHour >= 13) return windows[i];
  }
  return null;
}
function buildSessionState(session) {
  var base = classifyBaseWindow(session);
  if (!base) return null;
  var baseStart = timeToMin(base.start);
  var baseEnd = timeToMin(base.end);
  var blocks = [];
  var rowIndices = [];
  for (var i = 0; i < _offEntries.length; i++) {
    var off = _offEntries[i];
    if (_selectedDateKey < off.startDate || _selectedDateKey > (off.endDate || off.startDate)) continue;
    var blockStart = off.startTime ? timeToMin(off.startTime) : 0;
    var blockEnd = off.endTime ? timeToMin(off.endTime) : 1440;
    if (!off.startTime && !off.endTime) {
      blockStart = 0;
      blockEnd = 1440;
    }
    var startMin = Math.max(baseStart, blockStart);
    var endMin = Math.min(baseEnd, blockEnd);
    if (endMin <= startMin) continue;
    blocks.push({ startMin: startMin, endMin: endMin, rowIndex: off.rowIndex });
    rowIndices.push(off.rowIndex);
  }
  var baseSegments = subtractBlocks(base, blocks);

  // Find extra entries for today in this session
  var extraRowIndices = [];
  var extraSegments = [];
  for (var e = 0; e < _extraEntries.length; e++) {
    var ex = _extraEntries[e];
    if (ex.date !== _selectedDateKey) continue;
    var exStart = timeToMin(ex.startTime);
    // Classify: morning if start < 13:00, evening otherwise
    if ((session === 'morning' && exStart >= 780) || (session === 'evening' && exStart < 780)) continue;
    extraSegments.push({ start: ex.startTime, end: ex.endTime });
    extraRowIndices.push(ex.rowIndex);
  }

  // Merge base segments with extras, sort and merge overlapping
  var allSegments = baseSegments.concat(extraSegments);
  allSegments.sort(function(a, b) { return timeToMin(a.start) - timeToMin(b.start); });
  var merged = [];
  for (var m = 0; m < allSegments.length; m++) {
    var seg = allSegments[m];
    if (merged.length && timeToMin(seg.start) <= timeToMin(merged[merged.length - 1].end)) {
      merged[merged.length - 1].end = minToTime(Math.max(timeToMin(merged[merged.length - 1].end), timeToMin(seg.end)));
    } else {
      merged.push({ start: seg.start, end: seg.end });
    }
  }

  var uniqueRowIndices = [];
  var seen = {};
  for (var j = 0; j < rowIndices.length; j++) {
    if (!seen[rowIndices[j]]) {
      seen[rowIndices[j]] = true;
      uniqueRowIndices.push(rowIndices[j]);
    }
  }
  return {
    session: session,
    base: base,
    blocks: blocksFromSegments(base, baseSegments),
    segments: merged,
    rowIndices: uniqueRowIndices,
    extraRowIndices: extraRowIndices
  };
}
function renderSession(session) {
  var state = _sessionState[session];
  var card = document.getElementById(session + 'Card');
  if (!state) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';

  var available = state.segments.length > 0;
  var pill = document.getElementById(session + 'Pill');
  var pillText = document.getElementById(session + 'PillText');
  pill.className = 'status-pill ' + (available ? 'coming' : 'not-coming');
  pillText.textContent = available ? 'Coming to Work' : 'Not Coming to Work';
  document.getElementById(session + 'ToggleBtn').textContent = available ? 'Not Coming to Work' : 'Coming to Work';
  document.getElementById(session + 'ToggleBtn').className = 'btn ' + (available ? 'btn-danger' : 'btn-primary');

  document.getElementById(session + 'Times').textContent = available
    ? state.segments.map(function(seg) { return seg.start + ' - ' + seg.end; }).join(' • ')
    : 'Not coming to work for this session';
  document.getElementById(session + 'Hint').textContent = 'Normal hours: ' + state.base.start + ' - ' + state.base.end + '.';

  renderPatientList(session);
}
function renderPatientList(session) {
  var appts = _appointmentsBySession[session] || [];
  var el = document.getElementById(session + 'Patients');
  if (!appts.length) {
    el.innerHTML = '<div class="empty">No patients booked for this ' + session + '.</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var phoneText = formatPhoneDisplay(a.phone);
    var phoneHref = buildPhoneHref(a.phone);
    var emailText = String(a.email || '').trim();
    var isSpinola = (a.status === 'RELOCATED_SPINOLA');
    html += '<div class="patient-card' + (isSpinola ? ' relocated' : '') + '">';
    html += '<div class="patient-main">';
    html += '<div class="patient-name">' + esc(a.fullName || 'Patient') + '</div>';
    html += '<div class="patient-meta">';
    if (phoneText) {
      if (phoneHref) html += '<a class="contact-link" href="' + esc(phoneHref) + '">' + esc(phoneText) + '</a>';
      else html += esc(phoneText);
    }
    if (phoneText && emailText) html += ' • ';
    if (emailText) html += '<a class="contact-link" href="mailto:' + esc(emailText) + '">' + esc(emailText) + '</a>';
    html += '</div>';
    if (isSpinola) html += '<div class="patient-badge spinola">Sent to Spinola</div>';
    html += '</div>';
    html += '<div class="patient-time">' + esc(a.startTime || '') + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}
function formatPhoneDisplay(phone) {
  var raw = String(phone || '').trim();
  if (!raw) return '';
  return raw.charAt(0) === '+' ? raw : '+' + raw;
}
function buildPhoneHref(phone) {
  var display = formatPhoneDisplay(phone);
  if (!display) return '';
  var normalized = display.replace(/[^\\d+]/g, '');
  return normalized ? 'tel:' + normalized : '';
}
function markUserActivity() {
  _lastActivityAt = Date.now();
}
function stopAutoRefresh() {
  if (_autoRefreshTimerId) {
    clearInterval(_autoRefreshTimerId);
    _autoRefreshTimerId = null;
  }
}
function startAutoRefresh() {
  stopAutoRefresh();
  _autoRefreshTimerId = setInterval(function() {
    if (_idlePaused || document.hidden || _refreshInFlight) return;
    _refreshInFlight = true;
    reloadAll()
      .catch(function() {})
      .finally(function() { _refreshInFlight = false; });
  }, AUTO_REFRESH_MS);
}
function pauseDashboardForIdle() {
  if (_idlePaused) return;
  _idlePaused = true;
  stopAutoRefresh();
  _idleOverlay.classList.add('show');
}
function resumeDashboardFromIdle() {
  _idlePaused = false;
  markUserActivity();
  _idleOverlay.classList.remove('show');
  startAutoRefresh();
  _refreshInFlight = true;
  reloadAll()
    .catch(function(err) {
      showMsg('calendarMsg', 'bad', String(err && err.message ? err.message : err));
    })
    .finally(function() { _refreshInFlight = false; });
}
function navigateDay(delta) {
  var d = addDays(_selectedDateKey, delta);
  var newKey = toDateKey(d);
  if (newKey < _todayKey) return;
  var maxDate = toDateKey(addDays(_todayKey, 7));
  if (newKey > maxDate) return;
  _selectedDateKey = newKey;
  _cachedDateAppointments = {};
  showLoading('Loading ' + newKey + '…');
  loadTodayAppointments().then(function() {
    showDateLabel();
    updateDayNavButtons();
    buildAllSessionState();
    hideLoading();
  }).catch(function(err) {
    hideLoading();
    showMsg('morningMsg', 'bad', String(err && err.message ? err.message : err));
  });
}

function navigateToToday() {
  _selectedDateKey = _todayKey;
  _cachedDateAppointments = {};
  showLoading('Loading today…');
  loadTodayAppointments().then(function() {
    showDateLabel();
    updateDayNavButtons();
    buildAllSessionState();
    hideLoading();
  }).catch(function(err) {
    hideLoading();
  });
}

function updateDayNavButtons() {
  var prevBtn = document.getElementById('dayPrev');
  var nextBtn = document.getElementById('dayNext');
  prevBtn.disabled = _selectedDateKey <= _todayKey;
  var maxDate = toDateKey(addDays(_todayKey, 7));
  nextBtn.disabled = _selectedDateKey >= maxDate;
}

function showDateLabel() {
  var d = new Date(_selectedDateKey + 'T12:00:00');
  var label = d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  if (_selectedDateKey === _todayKey) label += ' (Today)';
  document.getElementById('dateLabel').textContent = label;
  var isToday = _selectedDateKey === _todayKey;
  document.getElementById('notTodayBanner').style.display = isToday ? 'none' : '';
  document.querySelector('.stack').classList.toggle('viewing-future', !isToday);
}
function fetchDashboard() {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) { resolve(res); })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminGetDashboard(SIG);
  }));
}
function fetchDateAppointments(dateKey) {
  if (_cachedDateAppointments[dateKey]) return Promise.resolve(_cachedDateAppointments[dateKey]);
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) {
          _cachedDateAppointments[dateKey] = res.appointments || [];
          resolve(_cachedDateAppointments[dateKey]);
        } else {
          reject((res && res.reason) || 'Failed to load appointments.');
        }
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminGetDateAppointments(SIG, dateKey);
  }));
}
function processAppointments(dateKey, action, ids, extra) {
  var payload = { dateKey: dateKey, action: action, appointmentIds: ids || [] };
  if (extra) { for (var k in extra) payload[k] = extra[k]; }
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to process appointments.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminProcessAppointments(SIG, payload);
  }));
}
function markDoctorOff(payload) {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to block time.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminMarkDoctorOff(SIG, payload);
  }));
}
function removeDoctorOff(rowIndex) {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to reactivate time.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminRemoveDoctorOff(SIG, rowIndex);
  }));
}
function addExtraSlots(payload) {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to add extra slots.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminAddExtraSlots(SIG, payload);
  }));
}
function removeExtraSlots(rowIndex) {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to remove extra slots.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminRemoveExtraSlots(SIG, rowIndex);
  }));
}
function setDoctorOffDates(mode, dateKeys) {
  return withTimeout(new Promise(function(resolve, reject) {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) resolve(res);
        else reject((res && res.reason) || 'Failed to update dates.');
      })
      .withFailureHandler(function(err) { reject(err); })
      .apiAdminSetDoctorOffDates(SIG, { mode: mode, dateKeys: dateKeys });
  }));
}
async function reloadAll() {
  _cachedDateAppointments = {};
  var res = await fetchDashboard();
  if (!res || !res.ok) throw new Error('Could not load dashboard.');
  _todayKey = res.todayKey;
  if (!_selectedDateKey) _selectedDateKey = _todayKey;
  _workingHours = res.workingHours || {};
  _offEntries = res.doctorOffEntries || [];
  _extraEntries = res.extraSlotEntries || [];
  if (!_calendarMonth) {
    var tomorrow = addDays(_todayKey, 1);
    _calendarMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1);
  }
  showDateLabel();
  updateDayNavButtons();
  await loadTodayAppointments();
  buildAllSessionState();
  renderCalendar();
}
async function loadTodayAppointments() {
  var appts = await fetchDateAppointments(_selectedDateKey);
  _appointmentsBySession.morning = [];
  _appointmentsBySession.evening = [];
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var mins = timeToMin(a.startTime || '00:00');
    var morningBase = classifyBaseWindow('morning');
    var eveningBase = classifyBaseWindow('evening');
    if (morningBase && mins < timeToMin(morningBase.end)) _appointmentsBySession.morning.push(a);
    else if (eveningBase) _appointmentsBySession.evening.push(a);
  }
}
function buildAllSessionState() {
  _sessionState.morning = buildSessionState('morning');
  _sessionState.evening = buildSessionState('evening');
  renderSession('morning');
  renderSession('evening');
}
function getSessionAffectedAppointments(session, segments) {
  var all = _appointmentsBySession[session] || [];
  return all.filter(function(appt) {
    if (appt.status === 'RELOCATED_SPINOLA' || appt.status === 'CANCELLED_DOCTOR' || appt.status === 'CANCELLED_CLIENT') return false;
    return !isWithinAnySegment(appt.startTime, appt.endTime, segments);
  });
}
async function toggleSession(session) {
  var state = _sessionState[session];
  if (!state) return;
  var currentlyAvailable = state.segments.length > 0;
  var newSegments = currentlyAvailable ? [] : [{ start: state.base.start, end: state.base.end }];
  var affected = getSessionAffectedAppointments(session, newSegments);
  var blocks = blocksFromSegments(state.base, newSegments);

  if (affected.length) {
    openActionModal({
      title: session === 'morning' ? 'Morning patients must be handled first' : 'Evening patients must be handled first',
      text: 'Before changing this session, every affected patient must be sent to Spinola, pushed to the next day, or cancelled.',
      summary: 'Selected patients affected: ' + affected.length + '.',
      appointments: affected.map(function(appt) { appt.dateKey = _selectedDateKey; return appt; }),
      apply: function() { return applySessionChanges(session, blocks, []); },
      successMsgId: session + 'Msg',
      successMessage: 'Session updated.'
    });
    return;
  }

  try {
    showLoading('Updating ' + session + '…');
    await applySessionChanges(session, blocks, []);
    showMsg(session + 'Msg', 'good', currentlyAvailable ? 'Session marked as not coming to work.' : 'Session reactivated.');
  } catch (err) {
    showMsg(session + 'Msg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}
async function applySessionChanges(session, blocks, extras) {
  var state = _sessionState[session];
  if (!state) return;
  // Remove old extra entries first (descending row order to avoid index shifts)
  var extraRows = (state.extraRowIndices || []).slice().sort(function(a, b) { return b - a; });
  for (var e = 0; e < extraRows.length; e++) {
    try { await removeExtraSlots(extraRows[e]); } catch (ex) { /* row may already be gone */ }
  }
  // Remove old off blocks (descending row order)
  var offRows = state.rowIndices.slice().sort(function(a, b) { return b - a; });
  for (var i = 0; i < offRows.length; i++) {
    try { await removeDoctorOff(offRows[i]); } catch (ex) { /* row may already be gone */ }
  }
  // Add new off blocks
  for (var j = 0; j < blocks.length; j++) {
    await markDoctorOff({
      startDate: _selectedDateKey,
      endDate: _selectedDateKey,
      startTime: blocks[j].start,
      endTime: blocks[j].end,
      reason: 'Doctor adjusted shift'
    });
  }
  // Add new extra entries
  for (var k = 0; k < (extras || []).length; k++) {
    await addExtraSlots({
      date: _selectedDateKey,
      startTime: extras[k].start,
      endTime: extras[k].end,
      reason: 'Doctor adjusted shift'
    });
  }
  await reloadAll();
}
// ===== Break modal =====
var _breakContext = null;

function getNowTime() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  return h + ':' + m;
}

function roundUpToSlot(timeStr) {
  var mins = timeToMin(timeStr);
  var rem = mins % SLOT_MINUTES;
  if (rem > 0) mins += (SLOT_MINUTES - rem);
  return mins;
}

function openBreakModal(session) {
  var state = _sessionState[session];
  if (!state || !state.segments.length) {
    showMsg(session + 'Msg', 'bad', 'Cannot take a break — session is set to "Not Coming to Work".');
    return;
  }
  var isToday = _selectedDateKey === _todayKey;
  var breakLabel = isToday ? 'The break starts now.' : 'Choose the break duration for this day.';
  document.querySelector('#breakModal .modal-text').textContent = 'How long do you need? ' + breakLabel;
  _breakContext = { session: session, duration: null, isToday: isToday };
  document.getElementById('breakSummary').textContent = '';
  document.getElementById('breakConfirmBtn').disabled = true;
  [20, 30, 40].forEach(function(d) {
    document.getElementById('breakOpt' + d).classList.remove('selected');
  });
  document.getElementById('breakModal').classList.add('show');
}

function closeBreakModal() {
  document.getElementById('breakModal').classList.remove('show');
  _breakContext = null;
}

function selectBreakDuration(mins) {
  if (!_breakContext) return;
  _breakContext.duration = mins;
  [20, 30, 40].forEach(function(d) {
    document.getElementById('breakOpt' + d).classList.toggle('selected', d === mins);
  });
  var breakStart;
  if (_breakContext.isToday) {
    breakStart = roundUpToSlot(getNowTime());
  } else {
    // For future dates, break starts at the session's first segment
    var state = _sessionState[_breakContext.session];
    breakStart = state && state.segments.length ? timeToMin(state.segments[0].start) : 0;
  }
  var breakEnd = breakStart + mins;
  _breakContext.breakStartMin = breakStart;
  _breakContext.breakEndMin = breakEnd;
  document.getElementById('breakSummary').textContent =
    'Break from ' + minToTime(breakStart) + ' to ' + minToTime(breakEnd) + ' (' + mins + ' min).';
  document.getElementById('breakConfirmBtn').disabled = false;
}

async function confirmBreak() {
  if (!_breakContext || !_breakContext.duration) return;
  var session = _breakContext.session;
  var breakStartMin = _breakContext.breakStartMin;
  var breakEndMin = _breakContext.breakEndMin;
  var breakStart = minToTime(breakStartMin);
  var breakEnd = minToTime(breakEndMin);

  // Find affected appointments during the break
  var allAppts = (_appointmentsBySession[session] || []).filter(function(a) {
    if (a.status === 'RELOCATED_SPINOLA' || a.status === 'CANCELLED_DOCTOR' || a.status === 'CANCELLED_CLIENT') return false;
    var aStart = timeToMin(a.startTime);
    var aEnd = timeToMin(a.endTime);
    return aStart < breakEndMin && aEnd > breakStartMin;
  });

  closeBreakModal();

  if (allAppts.length) {
    openActionModal({
      title: 'Patients booked during your break',
      text: 'These patients have appointments during your break time. Choose what should happen first.',
      summary: allAppts.length + ' affected patient(s) during ' + breakStart + ' – ' + breakEnd + '.',
      appointments: allAppts.map(function(appt) { appt.dateKey = _selectedDateKey; return appt; }),
      allowPushSameDay: true,
      breakEndTime: breakEnd,
      apply: function() {
        return markDoctorOff({
          startDate: _selectedDateKey,
          endDate: _selectedDateKey,
          startTime: breakStart,
          endTime: breakEnd,
          reason: 'Doctor break'
        }).then(function() { return reloadAll(); });
      },
      successMsgId: session + 'Msg',
      successMessage: 'Break set: ' + breakStart + ' – ' + breakEnd + '.'
    });
    return;
  }

  // No affected appointments — just block the time
  try {
    showLoading('Setting break…');
    await markDoctorOff({
      startDate: _selectedDateKey,
      endDate: _selectedDateKey,
      startTime: breakStart,
      endTime: breakEnd,
      reason: 'Doctor break'
    });
    await reloadAll();
    showMsg(session + 'Msg', 'good', 'Break set: ' + breakStart + ' – ' + breakEnd + '.');
  } catch (err) {
    showMsg(session + 'Msg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}

function closeAdjustModal() {
  document.getElementById('adjustModal').classList.remove('show');
  _adjustContext = null;
}
function openAdjustModal(session) {
  var state = _sessionState[session];
  if (!state) return;
  var baseStart = timeToMin(state.base.start);
  var baseEnd = timeToMin(state.base.end);
  // Allow wider range: morning 7:30-13:00, afternoon 13:00-22:00
  var rangeStart, rangeEnd;
  if (session === 'morning') {
    rangeStart = Math.min(baseStart, 450);  // 07:30
    rangeEnd = Math.max(baseEnd, 780);      // 13:00
  } else {
    rangeStart = Math.min(baseStart, 780);  // 13:00
    rangeEnd = Math.max(baseEnd, 1320);     // 22:00
  }
  var points = [];
  for (var min = rangeStart; min <= rangeEnd; min += SLOT_MINUTES) points.push(min);
  if (points[points.length - 1] !== rangeEnd) points.push(rangeEnd);

  var firstSeg = state.segments[0] || { start: state.base.start, end: state.base.end };
  var lastSeg = state.segments[state.segments.length - 1] || { start: state.base.start, end: state.base.end };
  var gapSeg = state.segments.length > 1 ? { start: state.segments[0].end, end: state.segments[1].start } : null;

  _adjustContext = { session: session, points: points };
  document.getElementById('adjustTitle').textContent = (session === 'morning' ? 'Morning' : 'Evening') + ' shift time';
  document.getElementById('adjustText').textContent = 'Use the sliders to choose the start time, end time, and an optional block inside the shift.';

  setRange('adjustStartRange', points, timeToMin(firstSeg.start));
  setRange('adjustEndRange', points, timeToMin(lastSeg.end));
  setRange('gapStartRange', points, gapSeg ? timeToMin(gapSeg.start) : timeToMin(firstSeg.start));
  setRange('gapEndRange', points, gapSeg ? timeToMin(gapSeg.end) : timeToMin(lastSeg.end));
  document.getElementById('gapEnabled').checked = !!gapSeg;
  syncAdjustModal();
  document.getElementById('adjustModal').classList.add('show');
}
function setRange(id, points, value) {
  var input = document.getElementById(id);
  input.min = 0;
  input.max = points.length - 1;
  var idx = 0;
  for (var i = 0; i < points.length; i++) {
    if (points[i] === value) { idx = i; break; }
    if (points[i] <= value) idx = i;
  }
  input.value = idx;
}
function currentRangeValue(id) {
  var input = document.getElementById(id);
  return _adjustContext.points[Number(input.value)];
}
function syncAdjustModal() {
  if (!_adjustContext) return;
  var startMin = currentRangeValue('adjustStartRange');
  var endMin = currentRangeValue('adjustEndRange');
  if (startMin >= endMin) {
    var endRange = document.getElementById('adjustEndRange');
    var startRange = document.getElementById('adjustStartRange');
    if (document.activeElement === endRange) {
      startRange.value = Math.max(0, Number(endRange.value) - 1);
      startMin = currentRangeValue('adjustStartRange');
    } else {
      endRange.value = Math.min(_adjustContext.points.length - 1, Number(startRange.value) + 1);
      endMin = currentRangeValue('adjustEndRange');
    }
  }

  document.getElementById('gapControls').style.display = document.getElementById('gapEnabled').checked ? '' : 'none';

  var gapStartMin = currentRangeValue('gapStartRange');
  var gapEndMin = currentRangeValue('gapEndRange');
  if (gapStartMin < startMin) {
    setRange('gapStartRange', _adjustContext.points, startMin);
    gapStartMin = currentRangeValue('gapStartRange');
  }
  if (gapEndMin > endMin) {
    setRange('gapEndRange', _adjustContext.points, endMin);
    gapEndMin = currentRangeValue('gapEndRange');
  }
  if (gapStartMin >= gapEndMin) {
    var gapStartRange = document.getElementById('gapStartRange');
    var gapEndRange = document.getElementById('gapEndRange');
    if (document.activeElement === gapEndRange) {
      gapStartRange.value = Math.max(Number(document.getElementById('adjustStartRange').value), Number(gapEndRange.value) - 1);
    } else {
      gapEndRange.value = Math.min(Number(document.getElementById('adjustEndRange').value), Number(gapStartRange.value) + 1);
    }
    gapStartMin = currentRangeValue('gapStartRange');
    gapEndMin = currentRangeValue('gapEndRange');
  }

  document.getElementById('adjustStartValue').textContent = minToTime(startMin);
  document.getElementById('adjustEndValue').textContent = minToTime(endMin);
  document.getElementById('gapStartValue').textContent = minToTime(gapStartMin);
  document.getElementById('gapEndValue').textContent = minToTime(gapEndMin);

  var summary = minToTime(startMin) + ' - ' + minToTime(endMin);
  if (document.getElementById('gapEnabled').checked) summary += ' with a block from ' + minToTime(gapStartMin) + ' - ' + minToTime(gapEndMin);
  document.getElementById('adjustSummary').textContent = 'New working times: ' + summary + '.';
}
async function saveAdjustModal() {
  if (!_adjustContext) return;
  var session = _adjustContext.session;
  var state = _sessionState[session];
  var startMin = currentRangeValue('adjustStartRange');
  var endMin = currentRangeValue('adjustEndRange');
  var segments = [{ start: minToTime(startMin), end: minToTime(endMin) }];

  if (document.getElementById('gapEnabled').checked) {
    var gapStartMin = currentRangeValue('gapStartRange');
    var gapEndMin = currentRangeValue('gapEndRange');
    segments = [];
    if (gapStartMin > startMin) segments.push({ start: minToTime(startMin), end: minToTime(gapStartMin) });
    if (gapEndMin < endMin) segments.push({ start: minToTime(gapEndMin), end: minToTime(endMin) });
  }

  // Compute extras (time outside base) and blocks (gaps within base)
  var baseStart = timeToMin(state.base.start);
  var baseEnd = timeToMin(state.base.end);
  var extras = [];
  for (var s = 0; s < segments.length; s++) {
    var sStart = timeToMin(segments[s].start);
    var sEnd = timeToMin(segments[s].end);
    if (sStart < baseStart) extras.push({ start: minToTime(sStart), end: minToTime(Math.min(sEnd, baseStart)) });
    if (sEnd > baseEnd) extras.push({ start: minToTime(Math.max(sStart, baseEnd)), end: minToTime(sEnd) });
  }
  var clippedSegments = segments.map(function(seg) {
    return { start: minToTime(Math.max(timeToMin(seg.start), baseStart)), end: minToTime(Math.min(timeToMin(seg.end), baseEnd)) };
  }).filter(function(seg) { return timeToMin(seg.end) > timeToMin(seg.start); });
  var blocks = blocksFromSegments(state.base, clippedSegments);
  var affected = getSessionAffectedAppointments(session, segments);

  if (affected.length) {
    closeAdjustModal();
    openActionModal({
      title: 'Appointments must be handled before saving',
      text: 'These patients are outside the updated working times. Choose what should happen first.',
      summary: 'Affected patients: ' + affected.length + '.',
      appointments: affected.map(function(appt) { appt.dateKey = _selectedDateKey; return appt; }),
      apply: function() { return applySessionChanges(session, blocks, extras); },
      successMsgId: session + 'Msg',
      successMessage: 'Shift updated.'
    });
    return;
  }

  try {
    showLoading('Saving shift…');
    await applySessionChanges(session, blocks, extras);
    closeAdjustModal();
    showMsg(session + 'Msg', 'good', 'Shift updated.');
  } catch (err) {
    showMsg(session + 'Msg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}
function isDateAllDayOff(dateKey) {
  for (var i = 0; i < _offEntries.length; i++) {
    var off = _offEntries[i];
    if (off.startTime || off.endTime) continue;
    if (dateKey >= off.startDate && dateKey <= (off.endDate || off.startDate)) return true;
  }
  return false;
}
function changeCalendarMonth(delta) {
  var target = new Date(_calendarMonth.getFullYear(), _calendarMonth.getMonth() + delta, 1);
  var tomorrow = new Date(getTomorrowKey() + 'T00:00:00');
  if (target < new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1)) return;
  _calendarMonth = target;
  renderCalendar();
}
function toggleDateSelection(dateKey) {
  if (dateKey < getTomorrowKey()) return;
  if (_selectedDates[dateKey]) delete _selectedDates[dateKey];
  else _selectedDates[dateKey] = true;
  renderCalendar();
}
function renderCalendar() {
  var grid = document.getElementById('calendarGrid');
  var monthLabel = document.getElementById('calendarMonthLabel');
  monthLabel.textContent = _calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  var daysHtml = ['<div class="dow">Mon</div>','<div class="dow">Tue</div>','<div class="dow">Wed</div>','<div class="dow">Thu</div>','<div class="dow">Fri</div>','<div class="dow">Sat</div>','<div class="dow">Sun</div>'];
  var first = new Date(_calendarMonth.getFullYear(), _calendarMonth.getMonth(), 1);
  var last = new Date(_calendarMonth.getFullYear(), _calendarMonth.getMonth() + 1, 0);
  var startPad = (first.getDay() + 6) % 7;
  for (var p = 0; p < startPad; p++) daysHtml.push('<div></div>');
  for (var day = 1; day <= last.getDate(); day++) {
    var dateObj = new Date(_calendarMonth.getFullYear(), _calendarMonth.getMonth(), day);
    var dateKey = toDateKey(dateObj);
    var disabled = dateKey < getTomorrowKey();
    var cancelled = isDateAllDayOff(dateKey);
    var selected = !!_selectedDates[dateKey];
    var cls = 'day-btn';
    if (disabled) cls += ' disabled';
    if (cancelled) cls += ' cancelled';
    if (selected) cls += ' selected';
    daysHtml.push('<button class="' + cls + '"' + (disabled ? ' disabled' : ' onclick="toggleDateSelection(\\'' + dateKey + '\\')"') + '>'
      + (cancelled ? '<span class="day-x">×</span>' : '')
      + '<span class="day-num">' + day + '</span>'
      + '<span class="day-mark">' + (cancelled ? 'Cancelled' : (selected ? 'Selected' : '&nbsp;')) + '</span>'
      + '</button>');
  }
  grid.innerHTML = daysHtml.join('');
  renderCalendarSelectionSummary();
}
function selectedDateBuckets() {
  var active = [];
  var cancelled = [];
  Object.keys(_selectedDates).sort().forEach(function(dateKey) {
    if (isDateAllDayOff(dateKey)) cancelled.push(dateKey);
    else active.push(dateKey);
  });
  return { active: active, cancelled: cancelled };
}
function renderCalendarSelectionSummary() {
  var buckets = selectedDateBuckets();
  document.getElementById('cancelDaysBtn').disabled = buckets.active.length === 0;
  document.getElementById('reactivateDaysBtn').disabled = buckets.cancelled.length === 0;
  var parts = [];
  if (buckets.active.length) parts.push(buckets.active.length + ' active day(s) selected to cancel');
  if (buckets.cancelled.length) parts.push(buckets.cancelled.length + ' cancelled day(s) selected to reactivate');
  document.getElementById('calendarSelectionSummary').textContent = parts.length ? parts.join(' • ') : 'No days selected.';
}
async function gatherAppointmentsForDates(dateKeys) {
  var all = [];
  for (var i = 0; i < dateKeys.length; i++) {
    var appts = await fetchDateAppointments(dateKeys[i]);
    for (var j = 0; j < appts.length; j++) {
      var copy = {};
      for (var key in appts[j]) copy[key] = appts[j][key];
      copy.dateKey = dateKeys[i];
      all.push(copy);
    }
  }
  return all;
}
async function startCancelSelectedDays() {
  var buckets = selectedDateBuckets();
  if (!buckets.active.length) return;
  try {
    showLoading('Checking selected days…');
    var affected = await gatherAppointmentsForDates(buckets.active);
    hideLoading();
    if (affected.length) {
      openActionModal({
        title: 'Appointments must be handled before cancelling these days',
        text: 'Every patient on the selected days must be sent to Spinola, pushed to the next day, or cancelled before those dates can be marked off.',
        summary: 'Affected appointments across ' + buckets.active.length + ' date(s): ' + affected.length + '.',
        appointments: affected,
        apply: function() { return cancelSelectedDays(buckets.active); },
        successMsgId: 'calendarMsg',
        successMessage: 'Selected dates cancelled.'
      });
      return;
    }
    showLoading('Cancelling selected days…');
    await cancelSelectedDays(buckets.active);
    showMsg('calendarMsg', 'good', 'Selected dates cancelled.');
  } catch (err) {
    showMsg('calendarMsg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}
async function cancelSelectedDays(dateKeys) {
  await setDoctorOffDates('cancel', dateKeys);
  for (var i = 0; i < dateKeys.length; i++) delete _selectedDates[dateKeys[i]];
  await reloadAll();
}
async function reactivateSelectedDays() {
  var buckets = selectedDateBuckets();
  if (!buckets.cancelled.length) return;
  try {
    showLoading('Reactivating selected days…');
    await setDoctorOffDates('reactivate', buckets.cancelled);
    for (var i = 0; i < buckets.cancelled.length; i++) delete _selectedDates[buckets.cancelled[i]];
    await reloadAll();
    showMsg('calendarMsg', 'good', 'Selected days reactivated.');
  } catch (err) {
    showMsg('calendarMsg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}
function openActionModal(flow) {
  _pendingFlow = flow;
  document.getElementById('actionTitle').textContent = flow.title;
  document.getElementById('actionText').textContent = flow.text;
  document.getElementById('actionSummary').textContent = flow.summary;
  document.getElementById('actionPushSameDay').style.display = flow.allowPushSameDay ? '' : 'none';
  var html = '';
  for (var i = 0; i < flow.appointments.length; i++) {
    var appt = flow.appointments[i];
    html += '<div class="affected-card">';
    html += '<div class="affected-date">' + esc(dateLabel(appt.dateKey)) + '</div>';
    html += '<div class="affected-name">' + esc(appt.fullName || 'Patient') + '</div>';
    html += '<div class="affected-meta">' + esc(appt.startTime || '') + ' • ' + esc(appt.phone || '') + '</div>';
    html += '</div>';
  }
  document.getElementById('affectedList').innerHTML = html;
  document.getElementById('actionModal').classList.add('show');
}
function closeActionModal() {
  document.getElementById('actionModal').classList.remove('show');
  _pendingFlow = null;
}
async function handlePendingAction(action) {
  if (!_pendingFlow) return;
  var flow = _pendingFlow;
  try {
    showLoading('Processing appointments…');
    var grouped = {};
    for (var i = 0; i < flow.appointments.length; i++) {
      var appt = flow.appointments[i];
      if (!grouped[appt.dateKey]) grouped[appt.dateKey] = [];
      grouped[appt.dateKey].push(appt.appointmentId);
    }
    var extra = {};
    if (action === 'push_same_day' && flow.breakEndTime) {
      extra.breakEndTime = flow.breakEndTime;
    }
    var dates = Object.keys(grouped).sort();
    for (var d = 0; d < dates.length; d++) {
      await processAppointments(dates[d], action, grouped[dates[d]], extra);
    }
    await flow.apply();
    closeActionModal();
    showMsg(flow.successMsgId, 'good', flow.successMessage);
  } catch (err) {
    showMsg((flow && flow.successMsgId) || 'calendarMsg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
}

document.getElementById('adjustModal').addEventListener('click', function(e) {
  if (e.target === this) closeAdjustModal();
});
document.getElementById('breakModal').addEventListener('click', function(e) {
  if (e.target === this) closeBreakModal();
});
document.getElementById('actionModal').addEventListener('click', function(e) {
  if (e.target === this) closeActionModal();
});
['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function(evt) {
  document.addEventListener(evt, function() {
    if (_idlePaused) return;
    markUserActivity();
  }, { passive: true });
});
document.addEventListener('visibilitychange', function() {
  if (document.hidden) pauseDashboardForIdle();
});
_idleCheckTimerId = setInterval(function() {
  if (_idlePaused) return;
  if (Date.now() - _lastActivityAt >= IDLE_TIMEOUT_MS) pauseDashboardForIdle();
}, 1000);
_idleOverlay.addEventListener('click', function() {
  resumeDashboardFromIdle();
});

(async function init() {
  try {
    showLoading('Loading schedule…');
    await reloadAll();
    startAutoRefresh();
  } catch (err) {
    showMsg('calendarMsg', 'bad', String(err && err.message ? err.message : err));
  } finally {
    hideLoading();
  }
})();
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

var DEFAULT_HOURS = {
  MON: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  TUE: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  WED: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  THU: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  FRI: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  SAT: [{ start: '10:00', end: '12:00' }],
  SUN: []
};

var DEFAULT_SPINOLA_HOURS = {
  MON: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  TUE: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  WED: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  THU: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  FRI: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  SAT: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '19:00' }],
  SUN: [{ start: '10:00', end: '12:00' }]
};

function CFG() {
  if (_cfgCache) return _cfgCache;

  var props = getScriptProps_();

  // Read working hours from script property, fallback to defaults
  var hours = DEFAULT_HOURS;
  var hoursJson = props.getProperty('WORKING_HOURS');
  if (hoursJson) {
    try { hours = JSON.parse(hoursJson); } catch (e) { hours = DEFAULT_HOURS; }
  }

  var spinolaHours = DEFAULT_SPINOLA_HOURS;
  var spinolaHoursJson = props.getProperty('SPINOLA_WORKING_HOURS');
  if (spinolaHoursJson) {
    try { spinolaHours = JSON.parse(spinolaHoursJson); } catch (e) { spinolaHours = DEFAULT_SPINOLA_HOURS; }
  }

  // Read numeric settings from script properties with defaults
  var durationStr = props.getProperty('APPT_DURATION_MIN');
  var duration = durationStr ? parseInt(durationStr, 10) : 10;
  if (isNaN(duration) || duration < 1) duration = 10;

  var advStr = props.getProperty('ADVANCE_DAYS');
  var advDays = advStr ? parseInt(advStr, 10) : 7;
  if (isNaN(advDays) || advDays < 1) advDays = 7;

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
    PROP_SPINOLA_CALENDAR_ID: 'SPINOLA_CALENDAR_ID',
    PROP_SPINOLA_APPTS_SSID: 'SPINOLA_APPOINTMENTS_SPREADSHEET_ID',
    PROP_DOUBLECHECK_CALENDAR: 'DOUBLECHECK_CALENDAR',
    PROP_MAX_ACTIVE_APPTS_PER_PERSON: 'MAX_ACTIVE_APPTS_PER_PERSON',

    // Sheet names
    SHEET_CLIENTS: 'Clients',
    SHEET_DOCTOR_OFF: 'DoctorOff',
    SHEET_DOCTOR_EXTRA: 'DoctorExtra',

    // Appointment day sheet format
    APPT_SHEET_DATE_FORMAT: 'yyyy-MM-dd',

    // Appointment settings (now configurable via admin)
    APPT_DURATION_MIN: duration,
    ADVANCE_DAYS: advDays,

    // Services
    SERVICES: [
      { id: 'clinic', name: 'Clinic Consultation', minutes: duration }
    ],

    // Working hours (now configurable via admin)
    HOURS: hours,

    // Spinola Clinic working hours
    SPINOLA_HOURS: spinolaHours
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

/** Data version counter — stored in Script Properties for cheapest possible reads. */
var _PROP_DATA_VERSION = 'DATA_VERSION';

function getDataVersion_() {
  return Number(getScriptProps_().getProperty(_PROP_DATA_VERSION) || '0');
}

function bumpVersion_() {
  var props = getScriptProps_();
  var v = Number(props.getProperty(_PROP_DATA_VERSION) || '0') + 1;
  props.setProperty(_PROP_DATA_VERSION, String(v));
  return v;
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
function buildSlotsForDate_(dateObj, extraWindows, hoursOverride) {
  var dowKey = dayOfWeekKey_(dateObj);
  var hoursSource = hoursOverride || CFG().HOURS;
  var windows = (hoursSource[dowKey] || []).slice();

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
var _spinolaSsCache = null;
var _daySheetFormatted = {};
var _spinolaDaySheetFormatted = {};
var _archiveDataCache = null;

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

function getSpinolaSpreadsheet_() {
  if (_spinolaSsCache) return _spinolaSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_SPINOLA_APPTS_SSID);
  if (!id) throw new Error('SPINOLA APPOINTMENTS spreadsheet ID not set. Run setSpinolaSpreadsheetId().');
  _spinolaSsCache = SpreadsheetApp.openById(id);
  return _spinolaSsCache;
}

function ensureSpinolaDaySheet_(dateKey) {
  var ss = getSpinolaSpreadsheet_();
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
    _spinolaDaySheetFormatted[dateKey] = true;
  } else if (!_spinolaDaySheetFormatted[dateKey]) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _spinolaDaySheetFormatted[dateKey] = true;
  }

  return sh;
}

function appendSpinolaAppointment_(dateKey, apptObj) {
  var sh = ensureSpinolaDaySheet_(dateKey);

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

function listSpinolaAppointmentsForDate_(dateKey) {
  var sh = ensureSpinolaDaySheet_(dateKey);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 18).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    rows.push(appointmentRowToObj_(values[i]));
  }
  return rows;
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
    startTime: normalizeTimeCell_(r[2]),
    endTime: normalizeTimeCell_(r[3]),
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

    // Check live sheet first (need rowIndex for writes), then archive
    var sh = ss.getSheetByName(dk);
    if (sh) {
      var lastRow = sh.getLastRow();
      if (lastRow >= 2) {
        var vals = sh.getRange(2, 1, lastRow - 1, 18).getValues();
        for (var r = 0; r < vals.length; r++) {
          if (String(vals[r][14] || '') === token) {
            return { sheetName: dk, rowIndex: r + 2, appointment: appointmentRowToObj_(vals[r]) };
          }
        }
      }
    } else {
      var archiveRows = getDayRows_(dk);
      for (var r = 0; r < archiveRows.length; r++) {
        if (String(archiveRows[r][14] || '') === token) {
          return { sheetName: dk, rowIndex: -1, appointment: appointmentRowToObj_(archiveRows[r]), archived: true };
        }
      }
    }
  }

  // Also search Spinola spreadsheet if token not found in Potter's
  try {
    var spinolaSs = getSpinolaSpreadsheet_();
    for (var j = -pastDays; j <= futureDays; j++) {
      var d2 = addMinutes_(today, j * 24 * 60);
      var dk2 = toDateKey_(d2);

      var sh2 = spinolaSs.getSheetByName(dk2);
      if (sh2) {
        var lastRow2 = sh2.getLastRow();
        if (lastRow2 >= 2) {
          var vals2 = sh2.getRange(2, 1, lastRow2 - 1, 18).getValues();
          for (var r2 = 0; r2 < vals2.length; r2++) {
            if (String(vals2[r2][14] || '') === token) {
              return { sheetName: dk2, rowIndex: r2 + 2, appointment: appointmentRowToObj_(vals2[r2]), spinola: true };
            }
          }
        }
      }
    }
  } catch (e) {
    // Spinola spreadsheet not configured — skip
  }

  return null;
}

function updateAppointmentStatus_(sheetName, rowIndex, updates, isSpinola) {
  var ss = isSpinola ? getSpinolaSpreadsheet_() : getAppointmentsSpreadsheet_();
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

/**
 * List non-cancelled appointments for a date (includes ATTENDED and NO_SHOW).
 */
function listNonCancelledAppointmentsForDate_(dateKey) {
  var all = listAppointmentsForDate_(dateKey);
  var result = [];
  for (var i = 0; i < all.length; i++) {
    var st = String(all[i].status || '').trim();
    if (st.indexOf('CANCELLED') < 0) result.push(all[i]);
  }
  result.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });
  return result;
}

/**
 * Calculate days between two YYYY-MM-DD date strings.
 */
function daysBetween_(dateStr1, dateStr2) {
  var d1 = parseDateKey_(dateStr1);
  var d2 = parseDateKey_(dateStr2);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
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

// ========== Archive helpers ==========

var ARCHIVE_SHEET_NAME = 'Archive';

/**
 * Get or create the Archive sheet (same 18-column structure as day sheets).
 */
function ensureArchiveSheet_() {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(ARCHIVE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(ARCHIVE_SHEET_NAME);
    sh.getRange(1, 1, 1, 18).setValues([[
      'AppointmentId', 'Date(yyyy-MM-dd)', 'StartTime', 'EndTime',
      'ServiceId', 'ServiceName', 'FullName', 'Email', 'Phone',
      'Comments', 'Status', 'Location', 'CreatedAt', 'UpdatedAt',
      'Token', 'CalendarEventId', 'CancelledAt', 'CancelReason'
    ]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
  }
  return sh;
}

/**
 * Load all archive data, indexed by dateKey. Cached per execution.
 */
function loadArchiveData_() {
  if (_archiveDataCache) return _archiveDataCache;
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(ARCHIVE_SHEET_NAME);
  if (!sh) { _archiveDataCache = {}; return _archiveDataCache; }
  var lr = sh.getLastRow();
  if (lr < 2) { _archiveDataCache = {}; return _archiveDataCache; }

  var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
  var byDate = {};
  for (var i = 0; i < vals.length; i++) {
    var dk = String(vals[i][1] || '');
    if (!byDate[dk]) byDate[dk] = [];
    byDate[dk].push(vals[i]);
  }
  _archiveDataCache = byDate;
  return _archiveDataCache;
}

/**
 * Get raw 18-column rows for a dateKey.
 * Checks the live day sheet first; falls back to archive.
 */
function getDayRows_(dateKey) {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);
  if (sh) {
    var lr = sh.getLastRow();
    if (lr >= 2) return sh.getRange(2, 1, lr - 1, 18).getValues();
    return [];
  }
  // Fall back to archive
  var archive = loadArchiveData_();
  return archive[dateKey] || [];
}

function getSpinolaRows_(dateKey) {
  try {
    var ss = getSpinolaSpreadsheet_();
    if (!ss) return [];
    var sh = ss.getSheetByName(dateKey);
    if (!sh) return [];
    var lr = sh.getLastRow();
    if (lr < 2) return [];
    return sh.getRange(2, 1, lr - 1, 18).getValues();
  } catch(e) { return []; }
}

/**
 * Archive day sheets older than daysToKeep and delete them.
 * Returns { archivedSheets, archivedRows }.
 */
function archiveOldDaySheets_(daysToKeep) {
  daysToKeep = daysToKeep || 30;
  var today = todayLocal_();
  var cutoff = toDateKey_(addMinutes_(today, -daysToKeep * 1440));
  var ss = getAppointmentsSpreadsheet_();
  var sheets = ss.getSheets();
  var archiveSh = ensureArchiveSheet_();

  var datePattern = /^\d{4}-\d{2}-\d{2}$/;
  var allRows = [];
  var toDelete = [];

  // Collect all data first, then write once (avoid per-sheet API calls)
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (!datePattern.test(name)) continue;
    if (name >= cutoff) continue; // Keep recent sheets

    var lr = sheets[i].getLastRow();
    if (lr >= 2) {
      var vals = sheets[i].getRange(2, 1, lr - 1, 18).getValues();
      for (var r = 0; r < vals.length; r++) allRows.push(vals[r]);
    }
    toDelete.push(sheets[i]);
  }

  // Single batch write
  if (allRows.length > 0) {
    archiveSh.getRange(archiveSh.getLastRow() + 1, 1, allRows.length, 18).setValues(allRows);
  }

  // Delete old sheets
  for (var d = 0; d < toDelete.length; d++) {
    ss.deleteSheet(toDelete[d]);
  }

  // Invalidate cache since we just changed archive
  _archiveDataCache = null;

  return { archivedSheets: toDelete.length, archivedRows: allRows.length };
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
  } catch (e) {
    Logger.log('WARN: Failed to delete calendar event ' + eventId + ': ' + e.message);
  }
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

/* ===== Spinola Clinic Calendar ===== */

function getSpinolaCalendar_() {
  var calId = getScriptProps_().getProperty(CFG().PROP_SPINOLA_CALENDAR_ID);
  if (!calId) throw new Error('Spinola Calendar ID missing. Run setSpinolaCalendarId().');
  var cal = CalendarApp.getCalendarById(calId);
  if (!cal) throw new Error('Cannot access Spinola calendar (' + calId + '). Make sure the calendar is shared with this script owner\'s Google account with "Make changes to events" permission.');
  return cal;
}

function createSpinolaCalendarEvent_(appt) {
  var cal = getSpinolaCalendar_();
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

function listSpinolaCalendarTakenSlots_(dateKey) {
  var cal = getSpinolaCalendar_();
  var dateObj = parseDateKey_(dateKey);
  var dur = CFG().APPT_DURATION_MIN;
  var maxEventDur = dur * 2;

  var start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  var end = addMinutes_(start, 24 * 60);

  var events = cal.getEvents(start, end);
  var taken = {};

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var evStartMin = parseTimeToMinutes_(Utilities.formatDate(ev.getStartTime(), getTimeZone_(), 'HH:mm'));
    var evEndMin = parseTimeToMinutes_(Utilities.formatDate(ev.getEndTime(), getTimeZone_(), 'HH:mm'));
    if (evEndMin <= evStartMin) evEndMin = 1440;
    var eventDuration = evEndMin - evStartMin;
    if (eventDuration > maxEventDur) continue;
    taken[minutesToTime_(evStartMin)] = true;
  }
  return taken;
}

function listCalendarTakenSlots_(dateKey) {
  var cal = getKevinCalendar_();
  var dateObj = parseDateKey_(dateKey);
  var dur = CFG().APPT_DURATION_MIN;
  var maxEventDur = dur * 2; // Only consider short appointment-like events

  var start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  var end = addMinutes_(start, 24 * 60);

  var events = cal.getEvents(start, end);
  var taken = {};

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var evStartMin = parseTimeToMinutes_(Utilities.formatDate(ev.getStartTime(), getTimeZone_(), 'HH:mm'));
    var evEndMin = parseTimeToMinutes_(Utilities.formatDate(ev.getEndTime(), getTimeZone_(), 'HH:mm'));
    if (evEndMin <= evStartMin) evEndMin = 1440;
    var eventDuration = evEndMin - evStartMin;
    // Skip long personal/external events — only appointment-like events should block slots
    if (eventDuration > maxEventDur) continue;
    // Mark the slot at this event's start time as taken
    taken[minutesToTime_(evStartMin)] = true;
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

function sendSpinolaConfirmationEmail_(appt) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var cancelUrl = buildCancelLink_(appt.token);
  var spinolaLocation = appt.location || 'Spinola Clinic';

  var subject = 'Appointment Confirmed - Dr James at ' + spinolaLocation + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Confirmed - Spinola Clinic</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment with <b>Dr James</b> at <b>' + escapeHtml_(spinolaLocation) + '</b> has been confirmed.</p>'
    + '<p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">Location: Near McDonald\'s, Love Statue, near bus stop, in Spinola</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Doctor</td><td style="padding:6px 0;"><b>Dr James</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(spinolaLocation) + '</b></td></tr>'
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

  if (mode === 'doctor') {
    var docSig = String((e.parameter && e.parameter.sig) || '');
    if (!verifyAdminSig_(docSig)) {
      return HtmlService.createHtmlOutput('<h2>Access Denied</h2><p>Invalid or missing signature.</p>')
        .setTitle('Access Denied');
    }
    var docAdminHtml = _serveHtml('DoctorAdmin', { adminSig: docSig });
    return docAdminHtml
      .setTitle('Dr Kevin - Schedule')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  return _serveHtml('Index', { WEBAPP_URL: getWebAppUrl_() })
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

/**
 * Lightweight poll endpoint — returns only the data version number.
 * Clients compare against their cached version to decide if a full refetch is needed.
 * Cost: 1 PropertiesService read (no sheet access).
 */
function apiPoll() {
  return { v: getDataVersion_() };
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
      spinolaLocation: (getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic'),
      spinolaDoctorName: 'Dr James',
      spinolaLocationDetails: "Near McDonald's, Love Statue, near bus stop, in Spinola",
      workingHours: CFG().HOURS,
      spinolaHours: CFG().SPINOLA_HOURS
    },
    dateOptions: apiGetDateOptions(extraMap),
    _v: getDataVersion_()
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
        // Only disable today if the last slot has already ended.
        // Detailed per-slot availability (taken, past, blocked) is handled by apiGetAvailability.
        var lastEnd = 0;
        for (var s = 0; s < slots.length; s++) {
          var endM = parseTimeToMinutes_(slots[s].end);
          if (endM > lastEnd) lastEnd = endM;
        }
        if (nowMin >= lastEnd) {
          disabled = true;
          reason = 'No slots remaining today';
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

function apiRefreshDates() {
  return apiGetDateOptions(null);
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
  var extraKeys = Object.keys(extraMap);
  var baseSlots = buildSlotsForDate_(d, extras);

  var appts = listAppointmentsForDate_(dateKey);
  var taken = {};
  var cancelledSlots = {};
  for (var i = 0; i < appts.length; i++) {
    var st = String(appts[i].startTime || '').trim();
    if (apptIsActive_(appts[i])) {
      taken[st] = true;
    } else {
      cancelledSlots[st] = true;
    }
  }

  var dc = (getScriptProps_().getProperty(CFG().PROP_DOUBLECHECK_CALENDAR) || 'true') === 'true';
  if (dc) {
    var calTaken = listCalendarTakenSlots_(dateKey);
    Object.keys(calTaken).forEach(function(k) {
      // DB is source of truth: don't let stale calendar events block cancelled slots
      if (!cancelledSlots[k]) {
        taken[k] = true;
      }
    });
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

  return { ok: true, dateKey: dateKey, slots: outSlots, _v: getDataVersion_(), _debug: { extraKeys: extraKeys, extras: extras, slotCount: baseSlots.length } };
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

    var cancelledSlotsBook = {};
    for (var c = 0; c < appts.length; c++) {
      if (!apptIsActive_(appts[c])) {
        cancelledSlotsBook[String(appts[c].startTime || '').trim()] = true;
      }
    }
    var calTaken = listCalendarTakenSlots_(dateKey);
    if (calTaken[startTime] && !cancelledSlotsBook[startTime]) {
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
    bumpVersion_();

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


/* ===== Spinola Clinic APIs ===== */

function apiGetSpinolaAvailability(dateKey) {
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

  // Spinola has its own hours (including Sundays) — only block fixed public holidays, not Sundays
  var holiday = isHolidayOrClosed_(d);
  if (holiday.closed && !isSunday_(d)) {
    return { ok: false, reason: holiday.reason, dateKey: dateKey, slots: [] };
  }

  // Spinola uses its own hours, no doctor-off (that's Dr Kevin only)
  var baseSlots = buildSlotsForDate_(d, null, CFG().SPINOLA_HOURS);

  if (!baseSlots.length) {
    return { ok: false, reason: 'Spinola Clinic closed', dateKey: dateKey, slots: [] };
  }

  // Check Spinola spreadsheet for taken slots
  var appts = listSpinolaAppointmentsForDate_(dateKey);
  var taken = {};
  var cancelledSlots = {};
  for (var i = 0; i < appts.length; i++) {
    var st = String(appts[i].startTime || '').trim();
    if (apptIsActive_(appts[i])) {
      taken[st] = true;
    } else {
      cancelledSlots[st] = true;
    }
  }

  // Also check Spinola calendar
  try {
    var calTaken = listSpinolaCalendarTakenSlots_(dateKey);
    Object.keys(calTaken).forEach(function(k) {
      if (!cancelledSlots[k]) {
        taken[k] = true;
      }
    });
  } catch (e) {
    // Spinola calendar not configured yet — skip
  }

  var nowMin = nowMinutesLocal_();

  var outSlots = [];
  for (var s = 0; s < baseSlots.length; s++) {
    var slot = baseSlots[s];
    var startMin = parseTimeToMinutes_(slot.start);
    var past = (dateKey === todayKey) ? (startMin < nowMin) : false;
    var isTaken = !!taken[slot.start];

    outSlots.push({
      start: slot.start,
      end: slot.end,
      available: (!past && !isTaken)
    });
  }

  return { ok: true, dateKey: dateKey, slots: outSlots };
}

function apiBookSpinola(payload) {
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

    // Spinola is open on Sundays — only block fixed public holidays
    var holiday = isHolidayOrClosed_(d);
    if (holiday.closed && !isSunday_(d)) throw new Error('Closed: ' + holiday.reason);

    if (dateKey === todayKey) {
      var nowMin = nowMinutesLocal_();
      var stMin = parseTimeToMinutes_(startTime);
      if (stMin < nowMin) {
        throw new Error('That time is already in the past. Please choose a later slot.');
      }
    }

    // Validate slot exists in Spinola hours
    var slots = buildSlotsForDate_(d, null, CFG().SPINOLA_HOURS);
    var slotFound = null;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].start === startTime) {
        slotFound = slots[i];
        break;
      }
    }
    if (!slotFound) throw new Error('Invalid slot');

    // Check Spinola spreadsheet for taken slots
    var appts = listSpinolaAppointmentsForDate_(dateKey);
    for (var j = 0; j < appts.length; j++) {
      if (apptIsActive_(appts[j]) && String(appts[j].startTime || '').trim() === startTime) {
        throw new Error('That slot was just taken. Please pick another.');
      }
    }

    // Also check Spinola calendar
    var cancelledSlotsBook = {};
    for (var c = 0; c < appts.length; c++) {
      if (!apptIsActive_(appts[c])) {
        cancelledSlotsBook[String(appts[c].startTime || '').trim()] = true;
      }
    }
    try {
      var calTaken = listSpinolaCalendarTakenSlots_(dateKey);
      if (calTaken[startTime] && !cancelledSlotsBook[startTime]) {
        throw new Error('That slot was just taken. Please pick another.');
      }
    } catch (e) {
      // Re-throw business logic errors, only swallow calendar connection failures
      if (e.message && e.message.indexOf('just taken') >= 0) throw e;
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

    var location = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

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

    // Create event on Spinola calendar
    var calWarning = '';
    try {
      var eventId = createSpinolaCalendarEvent_(apptObj);
      apptObj.calendarEventId = eventId;
    } catch (e) {
      calWarning = 'Calendar event failed: ' + e.message;
      Logger.log('WARN: ' + calWarning + ' | Stack: ' + (e.stack || ''));
    }

    // Append to Spinola spreadsheet
    appendSpinolaAppointment_(dateKey, apptObj);
    bumpVersion_();

    sendSpinolaConfirmationEmail_(apptObj);
    try {
      var dayList = listSpinolaAppointmentsForDate_(dateKey);
      sendDoctorBookingEmail_(apptObj, dayList);
    } catch (e) {}

    var result = {
      ok: true,
      appointmentId: appointmentId,
      dateKey: dateKey,
      startTime: apptObj.startTime,
      endTime: apptObj.endTime,
      serviceName: apptObj.serviceName,
      location: apptObj.location
    };
    if (calWarning) result.calWarning = calWarning;
    return result;
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
    }, !!found.spinola);
    bumpVersion_();

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
      }, !!found.spinola);
      bumpVersion_();

      try { sendClientCancelledEmail_(appt, 'Your appointment has been cancelled by the clinic. Please rebook if needed.'); } catch (e1) {}
      try { sendDoctorCancellationEmail_(appt, 'You cancelled this appointment.'); } catch (e2) {}

      return { ok: true, message: 'Appointment cancelled and patient notified.' };
    }

    if (act === 'redirect') {
      var spinolaLocation = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

      updateAppointmentStatus_(found.sheetName, found.rowIndex, {
        status: 'RELOCATED_SPINOLA',
        location: spinolaLocation
      }, !!found.spinola);
      bumpVersion_();

      var calEventId = String(appt.calendarEventId || '').trim();
      if (calEventId) {
        try {
          updateCalendarEventLocation_(calEventId, spinolaLocation,
            appt.serviceName + ' - ' + appt.fullName + ' [SPINOLA]');
        } catch (e3) {}
      }

      // Also create event on Spinola calendar and append to Spinola spreadsheet
      var spinolaAppt = {
        appointmentId: appt.appointmentId,
        dateKey: appt.dateKey,
        startTime: appt.startTime,
        endTime: appt.endTime,
        serviceId: appt.serviceId,
        serviceName: appt.serviceName,
        fullName: appt.fullName,
        email: appt.email,
        phone: appt.phone,
        comments: appt.comments || '',
        status: 'RELOCATED_SPINOLA',
        location: spinolaLocation,
        createdAt: appt.createdAt,
        updatedAt: nowStr,
        token: appt.token,
        calendarEventId: '',
        cancelledAt: '',
        cancelReason: ''
      };

      try {
        var spinolaEventId = createSpinolaCalendarEvent_(spinolaAppt);
        spinolaAppt.calendarEventId = spinolaEventId;
      } catch (e6) {
        Logger.log('WARN: Failed to create Spinola calendar event on redirect: ' + e6.message);
      }

      try {
        appendSpinolaAppointment_(appt.dateKey, spinolaAppt);
      } catch (e7) {
        Logger.log('WARN: Failed to append to Spinola spreadsheet on redirect: ' + e7.message);
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

  var todayAppts = listNonCancelledAppointmentsForDate_(todayKey);
  var tomorrowAppts = listNonCancelledAppointmentsForDate_(tomorrowKey);

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
    var vals = getDayRows_(dk);
    for (var r = 0; r < vals.length; r++) {
      var status = String(vals[r][10] || '');
      if (status === 'BOOKED' || status === 'RELOCATED_SPINOLA' || status === 'ATTENDED') weekBooked++;
      if (status.indexOf('CANCELLED') >= 0) weekCancelled++;
    }
  }

  // Today's capacity
  var offMap = getDoctorOffDates_();
  var extraMap = getDoctorExtraSlots_();
  var todaySlots = buildSlotsForDate_(today, extraMap[todayKey] || null);
  var todayCapacity = todaySlots.length;
  var offEntry = offMap[todayKey];
  if (offEntry) {
    if (offEntry.allDay) { todayCapacity = 0; }
    else if (offEntry.blocks) {
      for (var s = 0; s < todaySlots.length; s++) {
        var slotMin = parseTimeToMinutes_(todaySlots[s].start);
        for (var bl = 0; bl < offEntry.blocks.length; bl++) {
          if (slotMin >= offEntry.blocks[bl].startMin && slotMin < offEntry.blocks[bl].endMin) {
            todayCapacity--; break;
          }
        }
      }
    }
  }

  // Build timeline data for today (used by visual availability bar)
  var hoursConfig = CFG().HOURS;

  return {
    ok: true,
    todayKey: todayKey,
    tomorrowKey: tomorrowKey,
    todayAppointments: todayAppts,
    tomorrowAppointments: tomorrowAppts,
    doctorOffEntries: futureOffRows,
    extraSlotEntries: futureExtraRows,
    workingHours: hoursConfig,
    stats: {
      weekBooked: weekBooked,
      weekCancelled: weekCancelled,
      todayCapacity: todayCapacity
    },
    _v: getDataVersion_()
  };
}

/**
 * Get appointments for a specific date (admin).
 */
function apiAdminGetDateAppointments(sig, dateKey) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  dateKey = String(dateKey || '').trim();
  if (!dateKey) return { ok: false, reason: 'Missing date.' };

  var appts = listNonCancelledAppointmentsForDate_(dateKey);
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
  bumpVersion_();

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
  var endDate = String(payload.endDate || '').trim();
  var startTime = String(payload.startTime || '').trim();
  var endTime = String(payload.endTime || '').trim();
  var reason = String(payload.reason || 'Extra hours').trim();

  if (!date) return { ok: false, reason: 'Missing date.' };
  if (!startTime) return { ok: false, reason: 'Missing start time.' };
  if (!endTime) return { ok: false, reason: 'Missing end time.' };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'Invalid date format.' };
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return { ok: false, reason: 'Invalid end date format.' };
  if (!/^\d{2}:\d{2}$/.test(startTime)) return { ok: false, reason: 'Invalid start time format.' };
  if (!/^\d{2}:\d{2}$/.test(endTime)) return { ok: false, reason: 'Invalid end time format.' };

  var stMin = parseTimeToMinutes_(startTime);
  var enMin = parseTimeToMinutes_(endTime);
  if (enMin <= stMin) return { ok: false, reason: 'End time must be after start time.' };

  // Support date ranges: add a row for each date in the range
  var startD = new Date(date + 'T00:00:00');
  var endD = endDate ? new Date(endDate + 'T00:00:00') : startD;
  if (endD < startD) { var tmp = startD; startD = endD; endD = tmp; }

  var daysAdded = 0;
  var cur = new Date(startD);
  while (cur <= endD) {
    var key = Utilities.formatDate(cur, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    addDoctorExtraRow_(key, startTime, endTime, reason);
    daysAdded++;
    cur.setDate(cur.getDate() + 1);
  }

  bumpVersion_();

  var slotsPerDay = Math.floor((enMin - stMin) / CFG().APPT_DURATION_MIN);
  var totalSlots = slotsPerDay * daysAdded;

  var msg = 'Added extra time: ' + startTime + ' - ' + endTime;
  if (daysAdded === 1) {
    msg += ' on ' + date + ' (' + totalSlots + ' slots).';
  } else {
    msg += ' for ' + daysAdded + ' days (' + totalSlots + ' total slots).';
  }

  return { ok: true, message: msg };
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

    var validActions = ['cancel', 'redirect_spinola', 'push_next_day', 'push_same_day'];
    if (validActions.indexOf(action) < 0) return { ok: false, reason: 'Invalid action.' };

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
      var redirectNowStr = Utilities.formatDate(new Date(), getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

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

        // Also create event on Spinola calendar and append to Spinola spreadsheet
        var spinolaAppt2 = {
          appointmentId: appt2.appointmentId,
          dateKey: appt2.dateKey,
          startTime: appt2.startTime,
          endTime: appt2.endTime,
          serviceId: appt2.serviceId,
          serviceName: appt2.serviceName,
          fullName: appt2.fullName,
          email: appt2.email,
          phone: appt2.phone,
          comments: appt2.comments || '',
          status: 'RELOCATED_SPINOLA',
          location: spinolaLoc,
          createdAt: appt2.createdAt,
          updatedAt: redirectNowStr,
          token: appt2.token,
          calendarEventId: '',
          cancelledAt: '',
          cancelReason: ''
        };

        try {
          var spinEvId = createSpinolaCalendarEvent_(spinolaAppt2);
          spinolaAppt2.calendarEventId = spinEvId;
        } catch (e2b) {
          Logger.log('WARN: Failed to create Spinola calendar event on admin redirect: ' + e2b.message);
        }

        try {
          appendSpinolaAppointment_(appt2.dateKey, spinolaAppt2);
        } catch (e2c) {
          Logger.log('WARN: Failed to append to Spinola spreadsheet on admin redirect: ' + e2c.message);
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

    if (action === 'push_same_day') {
      var breakEndTime = String(payload.breakEndTime || '').trim();
      if (!breakEndTime) return { ok: false, reason: 'Missing breakEndTime for push_same_day.' };
      var breakEndMin = parseTimeToMinutes_(breakEndTime);

      // Build available slots for the same day (base + extras)
      var sameDateObj = parseDateKey_(dateKey);
      var sameDayExtraMap = getDoctorExtraSlots_();
      var sameDayExtras = sameDayExtraMap[dateKey] || null;
      var sameDaySlots = buildSlotsForDate_(sameDateObj, sameDayExtras);

      // Get current off blocks for this date
      var sameDayOffMap = getDoctorOffDates_();
      var sameDayOffEntry = getDoctorOffEntryForDate_(sameDayOffMap, dateKey);

      // Get already-taken slots
      var sameDayAppts = listActiveAppointmentsForDate_(dateKey);
      var takenSameDay = {};
      for (var t2 = 0; t2 < sameDayAppts.length; t2++) {
        takenSameDay[sameDayAppts[t2].startTime] = true;
      }

      // Find available slots AFTER the break, not blocked by doctor-off
      var availableAfterBreak = [];
      for (var sl3 = 0; sl3 < sameDaySlots.length; sl3++) {
        var slotStartMin = parseTimeToMinutes_(sameDaySlots[sl3].start);
        if (slotStartMin < breakEndMin) continue;
        if (takenSameDay[sameDaySlots[sl3].start]) continue;
        if (slotBlockedByDoctorOff_(sameDayOffEntry, sameDaySlots[sl3].start, sameDaySlots[sl3].end)) continue;
        availableAfterBreak.push(sameDaySlots[sl3]);
      }

      // If not enough slots, extend the session to fit all appointments
      var shortfall = appts.length - availableAfterBreak.length;
      var dur = CFG().APPT_DURATION_MIN;
      if (shortfall > 0) {
        // Find the last slot end time (the day's latest time)
        var lastSlotEnd = 0;
        for (var ls = 0; ls < sameDaySlots.length; ls++) {
          var lse = parseTimeToMinutes_(sameDaySlots[ls].end);
          if (lse > lastSlotEnd) lastSlotEnd = lse;
        }
        // Also check taken appointments
        for (var lt = 0; lt < sameDayAppts.length; lt++) {
          var lte = parseTimeToMinutes_(sameDayAppts[lt].endTime);
          if (lte > lastSlotEnd) lastSlotEnd = lte;
        }
        // Extend from the end of the day
        var extStart = lastSlotEnd;
        var extEnd = extStart + (shortfall * dur);
        addDoctorExtraRow_(dateKey, minutesToTime_(extStart), minutesToTime_(extEnd), 'Extended for break reschedule');
        // Add these extension slots to available
        for (var em = extStart; em + dur <= extEnd; em += dur) {
          availableAfterBreak.push({ start: minutesToTime_(em), end: minutesToTime_(em + dur) });
        }
      }

      for (var k2 = 0; k2 < appts.length; k2++) {
        var appt4 = appts[k2];
        var found4 = findAppointmentByToken_(appt4.token);
        if (!found4) continue;

        var newSlot = availableAfterBreak.shift();
        if (!newSlot) {
          // Fallback: cancel if somehow still no slot
          var evId4 = String(appt4.calendarEventId || '').trim();
          if (evId4) { try { deleteCalendarEvent_(evId4); } catch (e9) {} }
          updateAppointmentStatus_(found4.sheetName, found4.rowIndex, {
            status: 'CANCELLED_DOCTOR',
            cancelledAt: nowStr,
            cancelReason: 'No available slot on same day',
            calendarEventId: ''
          });
          try { sendClientCancelledEmail_(appt4, 'Your appointment could not be rescheduled. Please rebook at your convenience.'); } catch (e10) {}
          results.push({ appointmentId: appt4.appointmentId, action: 'cancelled_no_slot', patient: appt4.fullName });
          continue;
        }

        // Cancel old calendar event
        var oldEvId4 = String(appt4.calendarEventId || '').trim();
        if (oldEvId4) { try { deleteCalendarEvent_(oldEvId4); } catch (e11) {} }

        // Cancel old appointment
        updateAppointmentStatus_(found4.sheetName, found4.rowIndex, {
          status: 'CANCELLED_DOCTOR',
          cancelledAt: nowStr,
          cancelReason: 'Pushed to later today ' + newSlot.start,
          calendarEventId: ''
        });

        // Create new appointment on same day at new slot
        var newToken4 = Utilities.getUuid();
        var newAppt4 = {
          appointmentId: 'A-' + Utilities.getUuid(),
          dateKey: dateKey,
          startTime: newSlot.start,
          endTime: newSlot.end,
          serviceId: appt4.serviceId,
          serviceName: appt4.serviceName,
          fullName: appt4.fullName,
          email: appt4.email,
          phone: appt4.phone,
          comments: appt4.comments,
          status: 'BOOKED',
          location: appt4.location,
          createdAt: nowStr,
          updatedAt: nowStr,
          token: newToken4,
          calendarEventId: '',
          cancelledAt: '',
          cancelReason: ''
        };

        var newEventId4 = '';
        try { newEventId4 = createCalendarEvent_(newAppt4); } catch (e12) {}
        newAppt4.calendarEventId = newEventId4;

        appendAppointment_(dateKey, newAppt4);
        takenSameDay[newSlot.start] = true;

        try { sendAppointmentPushedEmail_(appt4, dateKey, newSlot.start, newSlot.end); } catch (e13) {}

        results.push({ appointmentId: newAppt4.appointmentId, action: 'pushed_same_day', patient: appt4.fullName, newTime: newSlot.start });
      }
    }

    if (results.length > 0) bumpVersion_();

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
 * Cancel or reactivate multiple all-day doctor-off dates.
 */
function apiAdminSetDoctorOffDates(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var mode = String(payload.mode || '').trim();
  var dateKeys = payload.dateKeys || [];
  if (['cancel', 'reactivate'].indexOf(mode) < 0) {
    return { ok: false, reason: 'Invalid mode.' };
  }
  if (!dateKeys.length) return { ok: false, reason: 'No dates provided.' };

  var unique = [];
  var seen = {};
  for (var i = 0; i < dateKeys.length; i++) {
    var dk = String(dateKeys[i] || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dk) || seen[dk]) continue;
    seen[dk] = true;
    unique.push(dk);
  }
  if (!unique.length) return { ok: false, reason: 'No valid dates provided.' };

  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) return { ok: false, reason: 'DoctorOff sheet missing.' };

  if (mode === 'cancel') {
    var offMap = getDoctorOffDates_();
    var added = 0;
    for (var j = 0; j < unique.length; j++) {
      var entry = offMap[unique[j]];
      if (entry && entry.allDay) continue;
      addDoctorOffRow_(unique[j], unique[j], '', '', 'Doctor not available');
      added++;
    }
    if (added > 0) bumpVersion_();
    return { ok: true, message: 'Cancelled ' + added + ' date(s).', updated: added };
  }

  var selectedMap = {};
  for (var k = 0; k < unique.length; k++) selectedMap[unique[k]] = true;

  var rows = getDoctorOffRows_();
  var rowsToDelete = [];
  var rowsToAppend = [];
  var reactivated = 0;

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    if (row.startTime || row.endTime) continue;

    var start = parseDateKey_(row.startDate);
    var end = parseDateKey_(row.endDate || row.startDate);
    if (end.getTime() < start.getTime()) {
      var tmp = start; start = end; end = tmp;
    }

    var remaining = [];
    var cur = new Date(start.getTime());
    var touched = false;
    while (cur.getTime() <= end.getTime()) {
      var curKey = toDateKey_(cur);
      if (selectedMap[curKey]) {
        touched = true;
        reactivated++;
      } else {
        remaining.push(curKey);
      }
      cur = addMinutes_(cur, 24 * 60);
    }

    if (!touched) continue;

    rowsToDelete.push(row.rowIndex);
    if (!remaining.length) continue;

    var segStart = remaining[0];
    var prev = remaining[0];
    for (var idx = 1; idx <= remaining.length; idx++) {
      var key = remaining[idx];
      var expectedNext = idx < remaining.length ? toDateKey_(addMinutes_(parseDateKey_(prev), 24 * 60)) : null;
      if (!key || key !== expectedNext) {
        rowsToAppend.push([segStart, prev, '', '', row.reason || '']);
        segStart = key;
      }
      prev = key || prev;
    }
  }

  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) {
    sh.deleteRow(rowsToDelete[d]);
  }
  for (var a = 0; a < rowsToAppend.length; a++) {
    sh.appendRow(rowsToAppend[a]);
  }

  if (rowsToDelete.length || rowsToAppend.length) bumpVersion_();
  return {
    ok: true,
    message: 'Reactivated ' + reactivated + ' date(s).',
    updated: reactivated
  };
}

/**
 * Remove a DoctorOff entry by row index.
 */
function apiAdminRemoveDoctorOff(sig, rowIndex) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  rowIndex = Number(rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return { ok: false, reason: 'Invalid row index.' };
  deleteDoctorOffRow_(rowIndex);
  bumpVersion_();
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
  bumpVersion_();
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

/**
 * Get week overview: appointment counts per day for a given week.
 */
function apiAdminGetWeekOverview(sig, weekStartDate) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  weekStartDate = String(weekStartDate || '').trim();
  if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    return { ok: false, reason: 'Invalid week start date.' };
  }

  var offRows = getDoctorOffRows_();
  var extraRows = getDoctorExtraRows_();
  var days = [];

  for (var d = 0; d < 7; d++) {
    var dt = new Date(weekStartDate + 'T00:00:00');
    dt.setDate(dt.getDate() + d);
    var dk = toDateKey_(dt);

    var count = 0;
    var vals = getDayRows_(dk);
    for (var r = 0; r < vals.length; r++) {
      var st = String(vals[r][10] || '');
      if (st === 'BOOKED' || st === 'RELOCATED_SPINOLA' || st === 'ATTENDED') count++;
    }

    // Check for blocks on this date
    var hasBlock = false;
    for (var b = 0; b < offRows.length; b++) {
      if (offRows[b].startDate <= dk && offRows[b].endDate >= dk) { hasBlock = true; break; }
    }

    // Check for extras on this date
    var hasExtra = false;
    for (var e = 0; e < extraRows.length; e++) {
      if (extraRows[e].date === dk) { hasExtra = true; break; }
    }

    // Check if this day has working hours
    var dowKey = dayOfWeekKey_(dt);
    var hasHours = (CFG().HOURS[dowKey] || []).length > 0;

    days.push({ dateKey: dk, count: count, hasBlock: hasBlock, hasExtra: hasExtra, hasHours: hasHours });
  }

  return { ok: true, days: days };
}

/**
 * Search appointments by patient name or phone.
 */
function apiAdminSearchAppointments(sig, query) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  query = String(query || '').trim().toLowerCase();
  if (!query || query.length < 2) return { ok: false, reason: 'Query too short.' };

  var today = todayLocal_();
  var results = [];
  var seenDates = {};

  // Search live sheets: past 30 days + future 14 days
  for (var d = -30; d <= 14; d++) {
    if (results.length >= 50) break;
    var dt = addMinutes_(today, d * 24 * 60);
    var dk = toDateKey_(dt);
    seenDates[dk] = true;
    var vals = getDayRows_(dk);
    if (!vals.length) continue;
    for (var r = 0; r < vals.length; r++) {
      if (results.length >= 50) break;
      var name = String(vals[r][6] || '').toLowerCase();
      var phone = String(vals[r][8] || '').toLowerCase();
      var status = String(vals[r][10] || '');
      if (name.indexOf(query) >= 0 || phone.indexOf(query) >= 0) {
        results.push({
          dateKey: dk,
          appointmentId: String(vals[r][0] || ''),
          startTime: normalizeTimeCell_(vals[r][2]),
          endTime: normalizeTimeCell_(vals[r][3]),
          serviceName: String(vals[r][5] || ''),
          fullName: String(vals[r][6] || ''),
          email: String(vals[r][7] || ''),
          phone: String(vals[r][8] || ''),
          status: status,
          location: String(vals[r][11] || '')
        });
      }
    }
  }

  // Also search full archive for dates outside the live window
  if (results.length < 50) {
    var archive = loadArchiveData_();
    var archiveDates = Object.keys(archive).sort().reverse();
    for (var a = 0; a < archiveDates.length; a++) {
      if (results.length >= 50) break;
      var adk = archiveDates[a];
      if (seenDates[adk]) continue;
      var avals = archive[adk];
      for (var ar = 0; ar < avals.length; ar++) {
        if (results.length >= 50) break;
        var aname = String(avals[ar][6] || '').toLowerCase();
        var aphone = String(avals[ar][8] || '').toLowerCase();
        if (aname.indexOf(query) >= 0 || aphone.indexOf(query) >= 0) {
          results.push({
            dateKey: adk,
            appointmentId: String(avals[ar][0] || ''),
            startTime: normalizeTimeCell_(avals[ar][2]),
            endTime: normalizeTimeCell_(avals[ar][3]),
            serviceName: String(avals[ar][5] || ''),
            fullName: String(avals[ar][6] || ''),
            email: String(avals[ar][7] || ''),
            phone: String(avals[ar][8] || ''),
            status: String(avals[ar][10] || ''),
            location: String(avals[ar][11] || '')
          });
        }
      }
    }
  }

  // Sort by date descending (most recent first)
  results.sort(function(a, b) { return a.dateKey > b.dateKey ? -1 : a.dateKey < b.dateKey ? 1 : 0; });

  return { ok: true, results: results, total: results.length };
}

/**
 * Get admin settings.
 */
function apiAdminGetSettings(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var props = getScriptProps_();
  var hoursJson = props.getProperty('WORKING_HOURS');
  var hours = null;
  if (hoursJson) { try { hours = JSON.parse(hoursJson); } catch (e) {} }
  if (!hours) hours = DEFAULT_HOURS;

  return {
    ok: true,
    settings: {
      doctorEmail: props.getProperty(CFG().PROP_DOCTOR_EMAIL) || '',
      timezone: props.getProperty(CFG().PROP_TIMEZONE) || 'Europe/Malta',
      pottersLocation: props.getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic",
      spinolaLocation: props.getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic',
      apptDurationMin: CFG().APPT_DURATION_MIN,
      advanceDays: CFG().ADVANCE_DAYS,
      maxActiveApptsPerPerson: parseInt(props.getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON) || '0', 10),
      workingHours: hours
    }
  };
}

/**
 * Save admin settings.
 */
function apiAdminSaveSettings(sig, settings) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  settings = settings || {};
  var props = getScriptProps_();

  // Save simple string properties
  if (settings.doctorEmail !== undefined) props.setProperty(CFG().PROP_DOCTOR_EMAIL, String(settings.doctorEmail).trim());
  if (settings.timezone !== undefined) props.setProperty(CFG().PROP_TIMEZONE, String(settings.timezone).trim());
  if (settings.pottersLocation !== undefined) props.setProperty(CFG().PROP_POTTERS_LOCATION, String(settings.pottersLocation).trim());
  if (settings.spinolaLocation !== undefined) props.setProperty(CFG().PROP_SPINOLA_LOCATION, String(settings.spinolaLocation).trim());

  // Save numeric properties
  if (settings.apptDurationMin !== undefined) {
    var dur = parseInt(settings.apptDurationMin, 10);
    if (isNaN(dur) || dur < 1) return { ok: false, reason: 'Appointment duration must be at least 1 minute.' };
    props.setProperty('APPT_DURATION_MIN', String(dur));
  }
  if (settings.advanceDays !== undefined) {
    var adv = parseInt(settings.advanceDays, 10);
    if (isNaN(adv) || adv < 1) return { ok: false, reason: 'Advance days must be at least 1.' };
    props.setProperty('ADVANCE_DAYS', String(adv));
  }
  if (settings.maxActiveApptsPerPerson !== undefined) {
    var max = parseInt(settings.maxActiveApptsPerPerson, 10);
    if (isNaN(max) || max < 0) max = 0;
    props.setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, String(max));
  }

  // Save working hours
  if (settings.workingHours !== undefined) {
    var wh = settings.workingHours;
    // Validate structure
    var validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    for (var i = 0; i < validDays.length; i++) {
      var dayKey = validDays[i];
      if (!wh[dayKey]) wh[dayKey] = [];
      if (!Array.isArray(wh[dayKey])) return { ok: false, reason: 'Working hours for ' + dayKey + ' must be an array.' };
      for (var j = 0; j < wh[dayKey].length; j++) {
        var block = wh[dayKey][j];
        if (!block.start || !block.end) return { ok: false, reason: 'Each time block must have start and end times.' };
        if (!/^\d{2}:\d{2}$/.test(block.start) || !/^\d{2}:\d{2}$/.test(block.end)) {
          return { ok: false, reason: 'Time format must be HH:mm.' };
        }
      }
    }
    props.setProperty('WORKING_HOURS', JSON.stringify(wh));
  }

  // Clear config cache so changes take effect
  _cfgCache = null;
  _propsCache = null;
  _tzCache = null;

  return { ok: true, message: 'Settings saved successfully.' };
}

/**
 * Statistics data for admin analytics dashboard.
 * Scans 28 days back + 7 days forward.
 */
function apiAdminGetStatistics(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var offMap = getDoctorOffDates_();
  var extraMap = getDoctorExtraSlots_();

  var PAST_DAYS = 28;
  var FUTURE_DAYS = 7;
  var dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dowKeys = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  // Accumulators
  var totalBooked = 0, totalCancelled = 0;
  var cancelByDoctor = 0, cancelByPatient = 0;
  var locationPotters = 0, locationSpinola = 0;
  var totalNoShow = 0, totalAttended = 0, sameDayCancels = 0;
  var leadTimes = [];
  var recentBooked = 0, prevBooked = 0; // for period comparison
  var hourCounts = []; for (var h = 0; h < 24; h++) hourCounts.push(0);
  var dowBooked = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 };
  var dowSlots = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 };
  var patientMap = {}; // email/phone -> { name, count }
  var relocatedSpinola = 0;
  var pushedNextDay = 0;
  var pushedSameDay = 0;
  var countryMap = {};  // country code -> count
  var cancellerMap = {}; // email/phone -> { name, count }
  var busiestDay = { dateKey: '', count: 0, dayName: '' };

  // Weekly trend: bucket by week (Mon-Sun)
  var weekBuckets = {}; // mondayKey -> { booked, cancelled, label }

  // Upcoming load (future days only)
  var upcomingLoad = [];

  var fromKey = toDateKey_(addMinutes_(today, -PAST_DAYS * 1440));
  var toKey = toDateKey_(addMinutes_(today, FUTURE_DAYS * 1440));

  for (var i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
    var d = addMinutes_(today, i * 1440);
    var dk = toDateKey_(d);
    var dow = dayOfWeekKey_(d);

    // Compute available slots for this day
    var holiday = isHolidayOrClosed_(d);
    var daySlotCount = 0;
    if (!holiday.closed) {
      var offEntry = offMap[dk];
      if (!offEntry || !offEntry.allDay) {
        var extraSlots = extraMap[dk] || [];
        var slots = buildSlotsForDate_(d, extraSlots);
        // Subtract blocked time slots
        if (offEntry && offEntry.blocks) {
          var unblockedSlots = [];
          for (var s = 0; s < slots.length; s++) {
            var slotMin = parseTimeToMinutes_(slots[s].start);
            var blocked = false;
            for (var b = 0; b < offEntry.blocks.length; b++) {
              if (slotMin >= offEntry.blocks[b].startMin && slotMin < offEntry.blocks[b].endMin) {
                blocked = true; break;
              }
            }
            if (!blocked) unblockedSlots.push(slots[s]);
          }
          daySlotCount = unblockedSlots.length;
        } else {
          daySlotCount = slots.length;
        }
      }
    }
    dowSlots[dow] += daySlotCount;

    // Read appointments for this day (live sheet or archive)
    var vals = getDayRows_(dk);
    var dayBooked = 0;
    var dayCancelled = 0;
    if (vals.length) {
        for (var r = 0; r < vals.length; r++) {
          var status = String(vals[r][10] || '');
          var startTime = normalizeTimeCell_(vals[r][2]);

          if (status === 'BOOKED' || status === 'RELOCATED_SPINOLA' || status === 'ATTENDED') {
            totalBooked++;
            dayBooked++;

            // Hour distribution
            if (startTime) {
              var hr = Math.floor(parseTimeToMinutes_(startTime) / 60);
              if (hr >= 0 && hr < 24) hourCounts[hr]++;
            }

            // Location
            var loc = String(vals[r][11] || '').toLowerCase();
            if (loc.indexOf('spinola') >= 0) locationSpinola++;
            else locationPotters++;
            if (status === 'RELOCATED_SPINOLA') relocatedSpinola++;

            // DOW booked count
            dowBooked[dow]++;

            // Patient tracking
            var email = String(vals[r][7] || '').trim().toLowerCase();
            var phone = String(vals[r][8] || '').trim();
            var pKey = email || phone;
            if (pKey) {
              if (!patientMap[pKey]) {
                patientMap[pKey] = { name: String(vals[r][6] || ''), count: 0 };
              }
              patientMap[pKey].count++;
            }

            // Country tracking from phone prefix
            if (phone) {
              var cc = extractCountryFromPhone_(phone);
              if (cc) {
                if (!countryMap[cc]) countryMap[cc] = 0;
                countryMap[cc]++;
              }
            }

            // Lead time (days between booking creation and appointment date)
            var createdAt = String(vals[r][12] || '');
            if (createdAt && createdAt.length >= 10) {
              var createdDate = createdAt.substring(0, 10);
              var leadDays = daysBetween_(createdDate, dk);
              if (leadDays >= 0) leadTimes.push(leadDays);
            }

            // Attendance tracking
            if (status === 'ATTENDED') totalAttended++;
          } else if (status === 'NO_SHOW') {
            totalNoShow++;
            dayBooked++; // Count in booked totals for capacity purposes
            totalBooked++;
            dowBooked[dow]++;
          } else if (status.indexOf('CANCELLED') >= 0) {
            totalCancelled++;
            dayCancelled++;
            if (status === 'CANCELLED_DOCTOR') cancelByDoctor++;
            else cancelByPatient++;

            // Same-day cancellation check
            var cancelledAt = String(vals[r][16] || '');
            if (cancelledAt && cancelledAt.length >= 10 && cancelledAt.substring(0, 10) === dk) {
              sameDayCancels++;
            }

            var cancelReason = String(vals[r][17] || '');
            if (cancelReason.indexOf('Pushed to') >= 0) {
              if (cancelReason.indexOf(dk) >= 0) pushedSameDay++;
              else pushedNextDay++;
            }

            var cEmail = String(vals[r][7] || '').trim().toLowerCase();
            var cPhone = String(vals[r][8] || '').trim();
            var cKey = cEmail || cPhone;
            if (cKey) {
              if (!cancellerMap[cKey]) cancellerMap[cKey] = { name: String(vals[r][6] || ''), count: 0 };
              cancellerMap[cKey].count++;
            }
          }
        }
    }

    // Also read Spinola appointments for this day
    var spinolaVals = getSpinolaRows_(dk);
    if (spinolaVals.length) {
      for (var sr = 0; sr < spinolaVals.length; sr++) {
        var sStatus = String(spinolaVals[sr][10] || '');
        var sStartTime = normalizeTimeCell_(spinolaVals[sr][2]);

        // Skip RELOCATED_SPINOLA entries that already exist in Potter's data
        if (sStatus === 'RELOCATED_SPINOLA') continue;

        if (sStatus === 'BOOKED' || sStatus === 'ATTENDED') {
          totalBooked++;
          dayBooked++;
          locationSpinola++;
          if (sStartTime) {
            var shr = Math.floor(parseTimeToMinutes_(sStartTime) / 60);
            if (shr >= 0 && shr < 24) hourCounts[shr]++;
          }
          dowBooked[dow]++;

          var sEmail = String(spinolaVals[sr][7] || '').trim().toLowerCase();
          var sPhone = String(spinolaVals[sr][8] || '').trim();
          var sPKey = sEmail || sPhone;
          if (sPKey) {
            if (!patientMap[sPKey]) patientMap[sPKey] = { name: String(spinolaVals[sr][6] || ''), count: 0 };
            patientMap[sPKey].count++;
          }

          // Country tracking from phone prefix
          if (sPhone) {
            var scc = extractCountryFromPhone_(sPhone);
            if (scc) {
              if (!countryMap[scc]) countryMap[scc] = 0;
              countryMap[scc]++;
            }
          }

          var sCreatedAt = String(spinolaVals[sr][12] || '');
          if (sCreatedAt && sCreatedAt.length >= 10) {
            var sLeadDays = daysBetween_(sCreatedAt.substring(0, 10), dk);
            if (sLeadDays >= 0) leadTimes.push(sLeadDays);
          }

          if (sStatus === 'ATTENDED') totalAttended++;
        } else if (sStatus === 'NO_SHOW') {
          totalNoShow++;
          dayBooked++;
          totalBooked++;
          dowBooked[dow]++;
          locationSpinola++;
        } else if (sStatus.indexOf('CANCELLED') >= 0) {
          totalCancelled++;
          dayCancelled++;
          if (sStatus === 'CANCELLED_DOCTOR') cancelByDoctor++;
          else cancelByPatient++;

          var sCancelledAt = String(spinolaVals[sr][16] || '');
          if (sCancelledAt && sCancelledAt.length >= 10 && sCancelledAt.substring(0, 10) === dk) {
            sameDayCancels++;
          }

          var sCancelReason = String(spinolaVals[sr][17] || '');
          if (sCancelReason.indexOf('Pushed to') >= 0) {
            if (sCancelReason.indexOf(dk) >= 0) pushedSameDay++;
            else pushedNextDay++;
          }

          var scEmail = String(spinolaVals[sr][7] || '').trim().toLowerCase();
          var scPhone = String(spinolaVals[sr][8] || '').trim();
          var scKey = scEmail || scPhone;
          if (scKey) {
            if (!cancellerMap[scKey]) cancellerMap[scKey] = { name: String(spinolaVals[sr][6] || ''), count: 0 };
            cancellerMap[scKey].count++;
          }
        }
      }
    }

    // Period comparison (recent 14 days vs previous 14 days)
    if (i >= -PAST_DAYS && i < -PAST_DAYS / 2) prevBooked += dayBooked;
    else if (i >= -PAST_DAYS / 2 && i <= 0) recentBooked += dayBooked;

    // Busiest day
    if (dayBooked > busiestDay.count) {
      busiestDay = { dateKey: dk, count: dayBooked, dayName: dayLabels[d.getDay()] };
    }

    // Weekly trend bucketing (find Monday of this day's week)
    var dayOfWeek = d.getDay(); // 0=Sun
    var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    var monday = addMinutes_(d, mondayOffset * 1440);
    var mondayKey = toDateKey_(monday);
    if (!weekBuckets[mondayKey]) {
      var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      weekBuckets[mondayKey] = { booked: 0, cancelled: 0, label: monthNames[monday.getMonth()] + ' ' + monday.getDate() };
    }
    weekBuckets[mondayKey].booked += dayBooked;
    weekBuckets[mondayKey].cancelled += dayCancelled;

    // Upcoming load (future days including today)
    if (i >= 0 && i <= FUTURE_DAYS) {
      upcomingLoad.push({
        dateKey: dk,
        dayLabel: dayLabels[d.getDay()],
        booked: dayBooked,
        capacity: daySlotCount
      });
    }
  }

  // Compute utilization
  var totalSlots = 0, totalUsed = 0;
  var utilizationByDay = {};
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  for (var di = 0; di < dayOrder.length; di++) {
    var dayK = dayOrder[di];
    totalSlots += dowSlots[dayK];
    totalUsed += dowBooked[dayK];
    utilizationByDay[dayK] = dowSlots[dayK] > 0 ? Math.round(dowBooked[dayK] / dowSlots[dayK] * 100) : 0;
  }
  var utilization = totalSlots > 0 ? Math.round(totalUsed / totalSlots * 1000) / 10 : 0;

  // Cancel rate
  var totalAll = totalBooked + totalCancelled;
  var cancelRate = totalAll > 0 ? Math.round(totalCancelled / totalAll * 1000) / 10 : 0;

  // Enrich patient map with archive data (so repeat/unique counts are accurate)
  var archive = loadArchiveData_();
  var archiveDates = Object.keys(archive);
  for (var ai = 0; ai < archiveDates.length; ai++) {
    var adk = archiveDates[ai];
    // Skip dates already covered by the live window
    if (adk >= fromKey && adk <= toKey) continue;
    var avals = archive[adk];
    for (var ar = 0; ar < avals.length; ar++) {
      var ast = String(avals[ar][10] || '');
      if (ast === 'BOOKED' || ast === 'RELOCATED_SPINOLA' || ast === 'ATTENDED' || ast === 'NO_SHOW') {
        var aemail = String(avals[ar][7] || '').trim().toLowerCase();
        var aphone = String(avals[ar][8] || '').trim();
        var apKey = aemail || aphone;
        if (apKey) {
          if (!patientMap[apKey]) {
            patientMap[apKey] = { name: String(avals[ar][6] || ''), count: 0 };
          }
          patientMap[apKey].count++;
        }
      }
    }
  }

  // Patient insights
  var patientKeys = Object.keys(patientMap);
  var totalUniquePatients = patientKeys.length;
  var repeatPatients = 0;
  var patientList = [];
  for (var pi = 0; pi < patientKeys.length; pi++) {
    var p = patientMap[patientKeys[pi]];
    if (p.count >= 2) repeatPatients++;
    patientList.push(p);
  }
  patientList.sort(function(a, b) { return b.count - a.count; });
  var topPatients = patientList.slice(0, 5).map(function(p) { return { name: p.name, count: p.count }; });

  // Weekly trend: sort by date and take last 4 weeks
  var weekKeys = Object.keys(weekBuckets).sort();
  var weeklyTrend = [];
  for (var wi = 0; wi < weekKeys.length; wi++) {
    weeklyTrend.push(weekBuckets[weekKeys[wi]]);
  }
  // Take last 4 weeks
  if (weeklyTrend.length > 4) weeklyTrend = weeklyTrend.slice(weeklyTrend.length - 4);

  // Lead time average
  var avgLeadTimeDays = 0;
  if (leadTimes.length > 0) {
    var sum = 0;
    for (var li = 0; li < leadTimes.length; li++) sum += leadTimes[li];
    avgLeadTimeDays = Math.round(sum / leadTimes.length * 10) / 10;
  }

  // No-show rate
  var attendanceTotal = totalAttended + totalNoShow;
  var noShowRate = attendanceTotal > 0 ? Math.round(totalNoShow / attendanceTotal * 1000) / 10 : 0;

  // Trend direction
  var trendDirection = recentBooked > prevBooked ? 'up' : recentBooked < prevBooked ? 'down' : 'flat';
  var trendPct = prevBooked > 0 ? Math.round(Math.abs(recentBooked - prevBooked) / prevBooked * 100) : 0;

  // Country breakdown - sort by count descending
  var countryList = [];
  var countryKeys = Object.keys(countryMap);
  for (var ci = 0; ci < countryKeys.length; ci++) {
    countryList.push({ country: countryKeys[ci], count: countryMap[countryKeys[ci]] });
  }
  countryList.sort(function(a, b) { return b.count - a.count; });

  // Top cancellers - sort by count descending, take top 5
  var cancellerKeys = Object.keys(cancellerMap);
  var cancellerList = [];
  for (var xi = 0; xi < cancellerKeys.length; xi++) {
    cancellerList.push(cancellerMap[cancellerKeys[xi]]);
  }
  cancellerList.sort(function(a, b) { return b.count - a.count; });
  var topCancellers = cancellerList.slice(0, 5).map(function(c) { return { name: c.name, count: c.count }; });

  return {
    ok: true,
    generated: Utilities.formatDate(new Date(), getTimeZone_(), "yyyy-MM-dd HH:mm"),
    period: { from: fromKey, to: toKey },
    totalBooked: totalBooked,
    totalCancelled: totalCancelled,
    cancelRate: cancelRate,
    utilization: utilization,
    utilizationByDay: utilizationByDay,
    weeklyTrend: weeklyTrend,
    hourlyDistribution: hourCounts,
    busiestDay: busiestDay,
    locationSplit: { potters: locationPotters, spinola: locationSpinola },
    cancelBreakdown: { byDoctor: cancelByDoctor, byPatient: cancelByPatient },
    totalUniquePatients: totalUniquePatients,
    repeatPatients: repeatPatients,
    topPatients: topPatients,
    upcomingLoad: upcomingLoad,
    avgLeadTimeDays: avgLeadTimeDays,
    totalNoShow: totalNoShow,
    totalAttended: totalAttended,
    noShowRate: noShowRate,
    sameDayCancels: sameDayCancels,
    trendDirection: trendDirection,
    trendPct: trendPct,
    relocatedSpinola: relocatedSpinola,
    pushedNextDay: pushedNextDay,
    pushedSameDay: pushedSameDay,
    countryBreakdown: countryList,
    topCancellers: topCancellers
  };
}

function extractCountryFromPhone_(phone) {
  phone = String(phone || '').replace(/[\s\-\(\)]/g, '');
  if (!phone) return '';
  // Common prefixes (longest match first)
  var prefixes = [
    {p:'+356',c:'Malta'},{p:'+44',c:'UK'},{p:'+39',c:'Italy'},{p:'+33',c:'France'},
    {p:'+49',c:'Germany'},{p:'+34',c:'Spain'},{p:'+1',c:'USA/Canada'},{p:'+61',c:'Australia'},
    {p:'+91',c:'India'},{p:'+86',c:'China'},{p:'+81',c:'Japan'},{p:'+7',c:'Russia'},
    {p:'+31',c:'Netherlands'},{p:'+32',c:'Belgium'},{p:'+41',c:'Switzerland'},
    {p:'+43',c:'Austria'},{p:'+45',c:'Denmark'},{p:'+46',c:'Sweden'},{p:'+47',c:'Norway'},
    {p:'+48',c:'Poland'},{p:'+351',c:'Portugal'},{p:'+353',c:'Ireland'},{p:'+358',c:'Finland'},
    {p:'+30',c:'Greece'},{p:'+36',c:'Hungary'},{p:'+40',c:'Romania'},{p:'+359',c:'Bulgaria'},
    {p:'+370',c:'Lithuania'},{p:'+371',c:'Latvia'},{p:'+372',c:'Estonia'},{p:'+380',c:'Ukraine'},
    {p:'+381',c:'Serbia'},{p:'+385',c:'Croatia'},{p:'+386',c:'Slovenia'},{p:'+387',c:'Bosnia'},
    {p:'+420',c:'Czech Republic'},{p:'+421',c:'Slovakia'},{p:'+90',c:'Turkey'},
    {p:'+971',c:'UAE'},{p:'+966',c:'Saudi Arabia'},{p:'+20',c:'Egypt'},{p:'+212',c:'Morocco'},
    {p:'+216',c:'Tunisia'},{p:'+218',c:'Libya'},{p:'+962',c:'Jordan'},{p:'+961',c:'Lebanon'},
    {p:'+55',c:'Brazil'},{p:'+52',c:'Mexico'},{p:'+27',c:'South Africa'},
    {p:'+63',c:'Philippines'},{p:'+82',c:'South Korea'},{p:'+65',c:'Singapore'},
    {p:'+60',c:'Malaysia'},{p:'+62',c:'Indonesia'},{p:'+66',c:'Thailand'},
    {p:'+357',c:'Cyprus'},{p:'+352',c:'Luxembourg'},{p:'+354',c:'Iceland'},
    {p:'+375',c:'Belarus'},{p:'+373',c:'Moldova'}
  ];
  // Sort by prefix length descending for longest match
  prefixes.sort(function(a, b) { return b.p.length - a.p.length; });
  for (var i = 0; i < prefixes.length; i++) {
    if (phone.indexOf(prefixes[i].p) === 0) return prefixes[i].c;
  }
  // If no + prefix but starts with 356 (local Malta number without +)
  if (/^356\d{8}/.test(phone)) return 'Malta';
  // No + and no recognized prefix - assume local Malta
  if (phone.length <= 8 && /^\d+$/.test(phone)) return 'Malta';
  return 'Other';
}

/**
 * Mark appointment as attended or no-show.
 */
function apiAdminMarkAttendance(sig, appointmentId, dateKey, attended) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  appointmentId = String(appointmentId || '').trim();
  dateKey = String(dateKey || '').trim();
  if (!appointmentId || !dateKey) return { ok: false, reason: 'Missing appointment ID or date.' };

  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);
  if (!sh) return { ok: false, reason: 'Date sheet not found.' };

  var lr = sh.getLastRow();
  if (lr < 2) return { ok: false, reason: 'No appointments on this date.' };

  var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
  for (var r = 0; r < vals.length; r++) {
    if (String(vals[r][0] || '') === appointmentId) {
      var newStatus = attended ? 'ATTENDED' : 'NO_SHOW';
      updateAppointmentStatus_(dateKey, r + 2, { status: newStatus });
      bumpVersion_();
      return { ok: true, message: 'Marked as ' + (attended ? 'attended' : 'no-show') + '.' };
    }
  }

  return { ok: false, reason: 'Appointment not found.' };
}

/**
 * Get patient history by email or phone.
 */
function apiAdminGetPatientHistory(sig, email, phone) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  email = String(email || '').trim().toLowerCase();
  phone = String(phone || '').trim();
  if (!email && !phone) return { ok: false, reason: 'Missing email or phone.' };

  var today = todayLocal_();
  var results = [];
  var patientName = '';
  var patientEmail = '';
  var patientPhone = '';
  var firstSeen = '';
  var seenDates = {};

  // Search live sheets: 90 days back + 14 forward
  for (var d = -90; d <= 14; d++) {
    var dt = addMinutes_(today, d * 1440);
    var dk = toDateKey_(dt);
    seenDates[dk] = true;
    var vals = getDayRows_(dk);
    if (!vals.length) continue;
    for (var r = 0; r < vals.length; r++) {
      var e = String(vals[r][7] || '').trim().toLowerCase();
      var p = String(vals[r][8] || '').trim();
      var match = false;
      if (email && e === email) match = true;
      if (phone && p === phone) match = true;
      if (!match) continue;

      if (!patientName) patientName = String(vals[r][6] || '');
      if (!patientEmail && e) patientEmail = e;
      if (!patientPhone && p) patientPhone = p;
      if (!firstSeen || dk < firstSeen) firstSeen = dk;

      results.push({
        dateKey: dk,
        startTime: normalizeTimeCell_(vals[r][2]),
        endTime: normalizeTimeCell_(vals[r][3]),
        serviceName: String(vals[r][5] || ''),
        status: String(vals[r][10] || ''),
        location: String(vals[r][11] || ''),
        comments: String(vals[r][9] || ''),
        createdAt: String(vals[r][12] || '')
      });
    }
  }

  // Also search full archive for dates outside the live window
  var archive = loadArchiveData_();
  var archiveDates = Object.keys(archive);
  for (var a = 0; a < archiveDates.length; a++) {
    var adk = archiveDates[a];
    if (seenDates[adk]) continue;
    var avals = archive[adk];
    for (var ar = 0; ar < avals.length; ar++) {
      var ae = String(avals[ar][7] || '').trim().toLowerCase();
      var ap = String(avals[ar][8] || '').trim();
      var amatch = false;
      if (email && ae === email) amatch = true;
      if (phone && ap === phone) amatch = true;
      if (!amatch) continue;

      if (!patientName) patientName = String(avals[ar][6] || '');
      if (!patientEmail && ae) patientEmail = ae;
      if (!patientPhone && ap) patientPhone = ap;
      if (!firstSeen || adk < firstSeen) firstSeen = adk;

      results.push({
        dateKey: adk,
        startTime: normalizeTimeCell_(avals[ar][2]),
        endTime: normalizeTimeCell_(avals[ar][3]),
        serviceName: String(avals[ar][5] || ''),
        status: String(avals[ar][10] || ''),
        location: String(avals[ar][11] || ''),
        comments: String(avals[ar][9] || ''),
        createdAt: String(avals[ar][12] || '')
      });
    }
  }

  // Sort by date descending
  results.sort(function(a, b) { return a.dateKey > b.dateKey ? -1 : a.dateKey < b.dateKey ? 1 : 0; });

  // Compute stats
  var totalVisits = 0, cancelCount = 0, noShowCount = 0;
  for (var i = 0; i < results.length; i++) {
    var st = results[i].status;
    if (st === 'BOOKED' || st === 'RELOCATED_SPINOLA' || st === 'ATTENDED') totalVisits++;
    else if (st.indexOf('CANCELLED') >= 0) cancelCount++;
    else if (st === 'NO_SHOW') noShowCount++;
  }

  return {
    ok: true,
    patient: { name: patientName, email: patientEmail, phone: patientPhone },
    totalVisits: totalVisits,
    cancelCount: cancelCount,
    noShowCount: noShowCount,
    firstSeen: firstSeen,
    appointments: results
  };
}

/**
 * Archive old day sheets (older than 30 days) into a single Archive sheet.
 * Reduces spreadsheet sheet count for better performance.
 */
function apiAdminArchiveOldSheets(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  try {
    var result = archiveOldDaySheets_(30);
    if (result.archivedSheets === 0) {
      return { ok: true, message: 'Nothing to archive. All sheets are within the last 30 days.' };
    }
    return {
      ok: true,
      message: 'Archived ' + result.archivedSheets + ' day sheet' + (result.archivedSheets !== 1 ? 's' : '') +
               ' (' + result.archivedRows + ' appointment' + (result.archivedRows !== 1 ? 's' : '') + ') into the Archive sheet.'
    };
  } catch (e) {
    return { ok: false, reason: 'Archive failed: ' + (e.message || String(e)) };
  }
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

/**
 * Run this from the GAS editor to configure Spinola Clinic.
 * (The editor Run button can't pass arguments, so IDs are hardcoded here.)
 */
function setupSpinola() {
  var calId = '28e57ccf7bdb512322b38bc751b3903ab95c7a3ad7d9dc17cdeac2f0273ceab5@group.calendar.google.com';
  var ssId  = '18aCZuV0GAL8yJPXEKblAJwH9DqAUKvZeWeQW8V9ChP4';

  setSpinolaCalendarId(calId);
  setSpinolaSpreadsheetId(ssId);

  Logger.log('Spinola Calendar ID set: ' + calId);
  Logger.log('Spinola Spreadsheet ID set: ' + ssId);
  return { ok: true, calendarId: calId, spreadsheetId: ssId };
}

function setSpinolaCalendarId(id) {
  if (!id || typeof id !== 'string') throw new Error('Missing calendar ID');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_CALENDAR_ID, id.trim());
  return { ok: true, spinolaCalendarId: id.trim() };
}

function setSpinolaSpreadsheetId(id) {
  if (!id || typeof id !== 'string') throw new Error('Missing spreadsheet ID');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_APPTS_SSID, id.trim());
  return { ok: true, spinolaSpreadsheetId: id.trim() };
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

function generateDoctorLink() {
  var base = getWebAppUrl_();
  var sig = computeAdminSig_();
  var link = base + '?mode=doctor&sig=' + encodeURIComponent(sig);
  Logger.log('=== DOCTOR LINK ===');
  Logger.log(link);
  Logger.log('===================');
  return { ok: true, doctorLink: link };
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
    apiPoll: apiPoll,
    apiInit: apiInit,
    apiGetDateOptions: apiGetDateOptions,
    apiRefreshDates: apiRefreshDates,
    apiGetAvailability: apiGetAvailability,
    apiBook: apiBook,
    apiGetSpinolaAvailability: apiGetSpinolaAvailability,
    apiBookSpinola: apiBookSpinola,
    apiGetCancelInfo: apiGetCancelInfo,
    apiCancelAppointment: apiCancelAppointment,
    apiDoctorAction: apiDoctorAction,
    apiAdminGetDashboard: apiAdminGetDashboard,
    apiAdminGetDateAppointments: apiAdminGetDateAppointments,
    apiAdminMarkDoctorOff: apiAdminMarkDoctorOff,
    apiAdminAddExtraSlots: apiAdminAddExtraSlots,
    apiAdminProcessAppointments: apiAdminProcessAppointments,
    apiAdminSetDoctorOffDates: apiAdminSetDoctorOffDates,
    apiAdminRemoveDoctorOff: apiAdminRemoveDoctorOff,
    apiAdminRemoveExtraSlots: apiAdminRemoveExtraSlots,
    apiAdminNotifyPatients: apiAdminNotifyPatients,
    apiAdminGetWeekOverview: apiAdminGetWeekOverview,
    apiAdminSearchAppointments: apiAdminSearchAppointments,
    apiAdminGetSettings: apiAdminGetSettings,
    apiAdminSaveSettings: apiAdminSaveSettings,
    apiAdminGetStatistics: apiAdminGetStatistics,
    apiAdminMarkAttendance: apiAdminMarkAttendance,
    apiAdminGetPatientHistory: apiAdminGetPatientHistory,
    apiAdminArchiveOldSheets: apiAdminArchiveOldSheets,
    sendDailyDoctorSchedule_: sendDailyDoctorSchedule_,
    install: install,
    repairSheets: repairSheets,
    setWebAppUrl: setWebAppUrl,
    setDoctorEmail: setDoctorEmail,
    setPottersLocation: setPottersLocation,
    setSpinolaLocation: setSpinolaLocation,
    setupSpinola: setupSpinola,
    setSpinolaCalendarId: setSpinolaCalendarId,
    setSpinolaSpreadsheetId: setSpinolaSpreadsheetId,
    setDoubleCheckCalendar: setDoubleCheckCalendar,
    setMaxActiveAppointmentsPerPerson: setMaxActiveAppointmentsPerPerson,
    generateAdminLink: generateAdminLink,
    generateDoctorLink: generateDoctorLink,
    setWebAppUrlAuto: setWebAppUrlAuto,
    armUninstall: armUninstall,
    armUninstallForce: armUninstallForce,
    disarmUninstall: disarmUninstall,
    uninstallDryRun: uninstallDryRun,
    uninstallEverything: uninstallEverything,
    uninstallKeepCalendar: uninstallKeepCalendar
  };
})();
