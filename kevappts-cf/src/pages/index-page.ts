import type { Env } from '../types';

export function indexPage(env: Env): string {
  return `<!DOCTYPE html>
<html>
<head>
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
    @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}
    .shake{animation:shake 0.4s ease-in-out;}

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

      <div class="row" style="margin-top:10px; justify-content:flex-start; gap:10px;">
        <button class="btn btnAccent" id="confirmBtn" data-i18n="confirmBtn">Confirm</button>
        <button class="btn btnGhost" id="clearBtn" data-i18n="clearBtn">Clear</button>
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
      confirmBtn:'Confirm',clearBtn:'Clear',appointmentConfirmed:'Appointment Confirmed',okBtn:'OK',
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
      confirmBtn:'Confirmer',clearBtn:'Effacer',appointmentConfirmed:'Rendez-vous confirmé',okBtn:'OK',
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
      confirmBtn:'Confirmar',clearBtn:'Borrar',appointmentConfirmed:'Cita confirmada',okBtn:'OK',
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
      confirmBtn:'Conferma',clearBtn:'Cancella',appointmentConfirmed:'Appuntamento confermato',okBtn:'OK',
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
      confirmBtn:'确认',clearBtn:'清除',appointmentConfirmed:'预约已确认',okBtn:'确定',
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
      confirmBtn:'पुष्टि करें',clearBtn:'साफ़ करें',appointmentConfirmed:'अपॉइंटमेंट की पुष्टि हो गई',okBtn:'ठीक है',
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
      confirmBtn:'Confirmar',clearBtn:'Limpar',appointmentConfirmed:'Consulta confirmada',okBtn:'OK',
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
      confirmBtn:'Подтвердить',clearBtn:'Очистить',appointmentConfirmed:'Запись подтверждена',okBtn:'ОК',
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
      confirmBtn:'確認',clearBtn:'クリア',appointmentConfirmed:'予約が確定しました',okBtn:'OK',
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
      confirmBtn:'ਪੁਸ਼ਟੀ ਕਰੋ',clearBtn:'ਸਾਫ਼ ਕਰੋ',appointmentConfirmed:'ਅਪੌਇੰਟਮੈਂਟ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ',okBtn:'ਠੀਕ ਹੈ',
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
      confirmBtn:'Onayla',clearBtn:'Temizle',appointmentConfirmed:'Randevu onaylandı',okBtn:'Tamam',
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
      confirmBtn:'تأكيد',clearBtn:'مسح',appointmentConfirmed:'تم تأكيد الموعد',okBtn:'موافق',
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
      confirmBtn:'Potwierdź',clearBtn:'Wyczyść',appointmentConfirmed:'Wizyta potwierdzona',okBtn:'OK',
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
      confirmBtn:'Potvrdi',clearBtn:'Obriši',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
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
      confirmBtn:'Potvrdi',clearBtn:'Obriši',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
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
      confirmBtn:'Potvrdi',clearBtn:'Obriši',appointmentConfirmed:'Termin je potvrđen',okBtn:'OK',
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
      confirmBtn:'Підтвердити',clearBtn:'Очистити',appointmentConfirmed:'Запис підтверджено',okBtn:'OK',
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
      confirmBtn:'Kumpirmahin',clearBtn:'I-clear',appointmentConfirmed:'Nakumpirma ang appointment',okBtn:'OK',
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
      confirmBtn:'Потвърди',clearBtn:'Изчисти',appointmentConfirmed:'Часът е потвърден',okBtn:'OK',
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
      confirmBtn:'Confirmă',clearBtn:'Șterge',appointmentConfirmed:'Programare confirmată',okBtn:'OK',
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
      confirmBtn:'Patvirtinti',clearBtn:'Išvalyti',appointmentConfirmed:'Vizitas patvirtintas',okBtn:'Gerai',
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
      confirmBtn:'Ikkonferma',clearBtn:'Neħħi',appointmentConfirmed:'L-appuntament ġie kkonfermat',okBtn:'OK',
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
      // Re-apply Spinola dynamic text if section is visible
      if (els.spinolaInline && els.spinolaInline.classList.contains('show') && _spinolaDateKey) {
        els.spinolaDateLabel.textContent = t('spinolaDateSlots') + ' ' + localDate(_spinolaDateKey);
      }
      // Update Spinola summary if a Spinola slot is selected
      if (_spinolaSelectedSlot) {
        var spinolaLoc = (state.config && state.config.spinolaLocation) || 'Spinola Clinic';
        els.sumTime.textContent = t('timeTemplate', to12h(_spinolaSelectedSlot.start), to12h(_spinolaSelectedSlot.end));
        els.sumLoc.textContent = t('locationTemplate', spinolaLoc);
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
      clearBtn: document.getElementById('clearBtn'),
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

    function clearForm(){
      state.selectedSlot = null;
      state.selectedServiceId = '';
      state.selectedServiceName = '';
      els.fullName.value = '';
      els.email.value = '';
      els.phone.value = '';
      els.comments.value = '';
      els.sumTime.textContent = t('timeTemplate', t('timeDash'), '').replace(' - ', '');
      els.timeGrid.innerHTML = '';
      clearFieldErrors();
      hideMsg();
      hideSpinolaInline();
      applyLanguage('en');
    }

    function goToExecAfterBooking_(){
      clearForm();
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
        o.textContent = localDate(opt.dateKey) + (opt.spinolaOnly ? ' — Spinola Clinic' : '') + (opt.disabled ? \` — \${opt.reason}\` : '');
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
      // Preserve Spinola selection during silent refresh — only clear if user has no active Spinola slot
      var hadSpinolaSlot = _spinolaSelectedSlot && _spinolaSelectedSlot.start;
      var savedSpinolaSlot = hadSpinolaSlot ? _spinolaSelectedSlot : null;
      var savedSpinolaDateKey = hadSpinolaSlot ? _spinolaDateKey : null;
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
        _pottersSlotsEmpty = true;
        // Use prefetched Spinola data if available for this date
        if (_spinolaPrefetchedSlots && _spinolaPrefetchDateKey === state.selectedDateKey) {
          hideHint(els.timeHint);
          showSpinolaInlineWithData(_spinolaPrefetchedSlots);
          // Restore previously selected Spinola slot if it's still available
          if (savedSpinolaSlot && savedSpinolaDateKey === state.selectedDateKey) {
            var btns = els.spinolaSlotsGrid.querySelectorAll('.timeBtn');
            for (var ri = 0; ri < btns.length; ri++) {
              if (btns[ri].textContent === to12h(savedSpinolaSlot.start)) {
                btns[ri].click();
                break;
              }
            }
          }
        } else {
          showHint(els.timeHint, 'bad', t('noSlots'));
        }
        return;
      }
      _pottersSlotsEmpty = false;
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
      _pottersSlotsEmpty = false;
      fetch('/api/spinola?date=' + encodeURIComponent(state.selectedDateKey))
        .then(function(r) { return r.json(); })
        .then(function(res) {
          _spinolaPrefetchedSlots = res;
          if (_pottersSlotsEmpty && _spinolaPrefetchDateKey === state.selectedDateKey) {
            hideHint(els.timeHint);
            showSpinolaInlineWithData(res);
          }
        })
        .catch(function() { _spinolaPrefetchedSlots = null; });

      fetch('/api/availability?date=' + encodeURIComponent(state.selectedDateKey))
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (!isSilentRefresh) hideLoading();
          if (res && res._debug) console.log('[APPT DEBUG]', JSON.stringify(res._debug));
          if (!res || !res.ok) {
            renderSlots([]);
            showHint(els.timeHint, 'bad', (res && res.reason) ? res.reason : t('noAvailability'));
            setStatus('bad', t('unavailable'));
            return;
          }
          var hasAvailable = hasAvailableSlots(res.slots || []);
          if (!hasAvailable && autoAdvance && !res.doctorOff) {
            if (advanceToNextEnabledDate()) {
              loadAvailability(false, true);
              return;
            }
          }
          renderSlots(res.slots || []);
          setStatus('good', t('slotsLoaded'));
        })
        .catch(function(err) {
          if (!isSilentRefresh) hideLoading();
          renderSlots([]);
          showHint(els.timeHint, 'bad', String(err && err.message ? err.message : err));
          setStatus('bad', t('errorLoadingSlots'));
        });
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
    var _pottersSlotsEmpty = false;

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
        // Shake the confirm button to draw attention
        els.confirmBtn.classList.add('shake');
        setTimeout(function() { els.confirmBtn.classList.remove('shake'); }, 600);
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

        fetch('/api/book-spinola', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(spinolaPayload)})
          .then(function(r) { return r.json(); })
          .then(function(res) {
            hideLoading();
            if (res && res.ok) {
              var dateLabel2 = localDate(_spinolaDateKey);
              var text = t('confirmMsg', res.serviceName, dateLabel2, to12h(res.startTime), to12h(res.endTime), res.location);
              if (res.calWarning) console.warn('SPINOLA CAL:', res.calWarning);
              showConfirmModal(text);
              return;
            }
            showMsg('bad', (res && res.reason) || t('couldNotBook'));
            setStatus('bad', t('bookingFailed'));
          })
          .catch(function(e) {
            hideLoading();
            var msg = (e && e.message) ? e.message : String(e);
            showMsg('bad', msg);
            setStatus('bad', t('bookingError'));
          });
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

      fetch('/api/book', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
        .then(function(r) { return r.json(); })
        .then(function(res) {
          hideLoading();
          if (res && res.ok) {
            var text = t('confirmMsg', res.serviceName, state.selectedDateLabel, to12h(res.startTime), to12h(res.endTime), res.location);
            showConfirmModal(text);
            return;
          }
          showMsg('bad', (res && res.reason) || t('couldNotBook'));
          setStatus('bad', t('bookingFailed'));
          loadAvailability(false);
        })
        .catch(function(e) {
          hideLoading();
          var msg = (e && e.message) ? e.message : String(e);
          showMsg('bad', msg);
          setStatus('bad', t('bookingError'));
          loadAvailability(false);
        });
    });

    els.clearBtn.addEventListener('click', function() {
      clearForm();
      // Re-select first available date and reload slots
      if (state.dateOptions && state.dateOptions.length) {
        var first = state.dateOptions.find(function(o) { return !o.disabled; });
        if (first) {
          els.dateSelect.value = first.dateKey;
          state.selectedDateKey = first.dateKey;
          state.selectedDateLabel = localDate(first.dateKey);
          els.sumDate.textContent = t('dateTemplate', state.selectedDateLabel);
          loadAvailability(false);
        }
      }
    });

    function refreshDateOptions() {
      fetch('/api/dates')
        .then(function(r) { return r.json(); })
        .then(function(dateOptions) {
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
        .catch(function() { /* silent */ });
    }

    var _autoRefreshInstalled = false;
    function installAutoRefresh() {
      if (_autoRefreshInstalled) return;
      _autoRefreshInstalled = true;

      var _idlePaused = false;
      var CLEAR_MS = 4 * 60 * 1000; // 4 minutes — clear form for privacy
      var IDLE_MS = 5 * 60 * 1000 + 10 * 1000; // 5 minutes 10 seconds — show idle overlay
      var _formCleared = false;
      var _lastActivity = Date.now();
      var _slotTimerId = null;
      var _dateTimerId = null;
      var _idleCheckId = null;
      var _idleOverlay = document.getElementById('idleOverlay');

      function isIdle() { return _idlePaused; }

      // ── Slot refresh (30s) — skip if user picked a slot AND is still active ──
      _slotTimerId = setInterval(function() {
        if (isIdle() || document.hidden || !state.selectedDateKey) return;
        // Skip refresh while user is actively filling in details (has slot + recent activity)
        if ((state.selectedSlot || _spinolaSelectedSlot) && (Date.now() - _lastActivity < CLEAR_MS)) return;
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
        document.addEventListener(evt, function() {
          _lastActivity = Date.now();
          _formCleared = false;
        }, { passive: true });
      });

      // ── Idle check (every 1s) ──
      _idleCheckId = setInterval(function() {
        if (_idlePaused) return;
        var elapsed = Date.now() - _lastActivity;
        // Clear personal details after 4 min of inactivity (privacy)
        if (!_formCleared && elapsed >= CLEAR_MS) {
          _formCleared = true;
          clearForm();
        }
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

    // ── Screen Wake Lock — prevent iPad/tablet from sleeping ──
    var _wakeLock = null;
    function releaseWakeLock() {
      if (_wakeLock) { try { _wakeLock.release(); } catch(e) {} _wakeLock = null; }
    }
    function requestWakeLock() {
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(function(lock) {
          _wakeLock = lock;
          _wakeLock.addEventListener('release', function() { _wakeLock = null; });
        }).catch(function() {});
      }
    }
    // Request on load + re-acquire when page becomes visible again
    requestWakeLock();
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && !_wakeLock) requestWakeLock();
    });


    // ── SSE: Real-time slot updates ──
    var _evtSource = null;
    var _sseConnected = false;
    function connectSSE() {
      try {
        _evtSource = new EventSource('/api/stream');
        _evtSource.onopen = function() { _sseConnected = true; };
        _evtSource.onmessage = function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.type === 'slots_updated') {
              // Refresh slots if we're looking at the affected date
              if (data.dateKey === state.selectedDateKey || !data.dateKey) {
                loadAvailability(true);
              }
              refreshDateOptions();
            }
          } catch(e) {}
        };
        _evtSource.onerror = function() {
          _sseConnected = false;
          _evtSource.close();
          setTimeout(connectSSE, 3000);
        };
      } catch(e) { _sseConnected = false; }
    }

    function init() {
      // Show inline loading in time grid instead of full-screen overlay
      els.timeGrid.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--muted);font-size:13px;"><div class="spinner" style="margin:0 auto 10px;width:28px;height:28px;"></div>Loading available times...</div>';
      setStatus('good', t('loadingSlots'));

      fetch('/api/init')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          state.config = data.config;
          state.dateOptions = data.dateOptions || [];

          els.docName.textContent = state.config.doctorName;
          els.docMeta.textContent = state.config.pottersLocation;
          els.tzMeta.textContent = 'Time zone: ' + state.config.timezone;

          els.sumLoc.textContent = t('locationTemplate', state.config.pottersLocation);

          renderClinicHours();
          renderServices();
          renderDates();

          if (state.selectedDateKey && data.initialSlots) {
            // Use prefetched slots from apiInit — no extra round trip
            _spinolaPrefetchedSlots = data.initialSpinola || null;
            _spinolaPrefetchDateKey = state.selectedDateKey;

            var res = data.initialSlots;
            if (res && res.ok) {
              var hasAvailable = hasAvailableSlots(res.slots || []);
              if (!hasAvailable && !res.doctorOff) {
                // No slots for first date — fall through to loadAvailability with autoAdvance
                loadAvailability(false, true);
              } else {
                renderSlots(res.slots || []);
                setStatus('good', t('slotsLoaded'));
              }
            } else {
              renderSlots([]);
              showHint(els.timeHint, 'bad', (res && res.reason) ? res.reason : t('noAvailability'));
              setStatus('bad', t('unavailable'));
            }
          } else if (state.selectedDateKey) {
            setStatus('good', t('loadingSlots'));
            loadAvailability(false, true);
          } else {
            setStatus('bad', t('noDatesAvailable'));
          }

          installAutoRefresh();
          // Connect SSE for real-time updates
          connectSSE();
        })
        .catch(function(e) {
          els.timeGrid.innerHTML = '';
          showMsg('bad', t('errorLoadingApp') + (e && e.message ? e.message : e));
          setStatus('bad', t('loadError'));
        });
    }

    init();
  </script>
</body>
</html>
`;
}
