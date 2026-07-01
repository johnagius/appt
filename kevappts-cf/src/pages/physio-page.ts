import type { Env } from '../types';

/**
 * Public physiotherapy booking page (Linda) at /physio.
 *
 * Fully dynamic: every label (availability dates, weekly hours, session length,
 * physiotherapist name, location) is derived at runtime from /api/physio-init —
 * nothing is hardcoded, so it always matches whatever the admin/portal has set.
 *
 * UX: a horizontal "day picker" strip of the actual open dates, grouped time
 * slots (Morning / Afternoon) as real, keyboard-accessible <button>s, a sticky
 * booking bar summarising the current choice, and a full confirmation screen.
 * Form values survive a failed submit; slots refresh when the tab regains focus
 * so a customer never books a slot that was taken while they filled the form.
 */
export function physioPage(env: Env): string {
  const doctorName = env.LINDA_DOCTOR_NAME || 'Linda';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#10b981">
<title>${doctorName} — Physiotherapist</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%2310b981'/%3E%3Ctext x='50' y='68' font-size='50' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'%3EP%3C/text%3E%3C/svg%3E">
<style>
  :root{
    --accent:#10b981;--accent-dark:#059669;--good:#065f46;--bad:#ef4444;
    --muted:#6b7280;--text:#111827;--line:#e5e7eb;--bg:#f6f7fb;
    --ease:cubic-bezier(.22,1,.36,1);
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:0;background:var(--bg);color:var(--text);line-height:1.5;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @media (prefers-reduced-motion: reduce){*{animation-duration:.001ms!important;transition-duration:.001ms!important;}}

  .wrap{max-width:720px;margin:0 auto;padding:16px 14px 160px;}

  /* Header */
  .hero{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:18px;padding:18px 18px 16px;box-shadow:0 8px 24px rgba(16,185,129,.28);animation:fadeUp .35s var(--ease) both;}
  .hero .row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
  .hero h1{margin:0;font-size:22px;font-weight:900;letter-spacing:-.2px;}
  .hero .sub{margin:2px 0 0;font-size:13px;font-weight:700;opacity:.92;}
  .hero .back{color:#fff;text-decoration:none;font-weight:800;font-size:13px;background:rgba(255,255,255,.18);padding:8px 12px;border-radius:999px;white-space:nowrap;}
  .hero .back:active{background:rgba(255,255,255,.28);}
  .hero .facts{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
  .fact{background:rgba(255,255,255,.16);border-radius:10px;padding:7px 11px;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:6px;}
  .fact b{font-weight:900;}

  .step{margin-top:18px;animation:fadeUp .35s var(--ease) both;}
  .step-head{display:flex;align-items:center;gap:9px;margin:0 2px 9px;}
  .step-num{width:24px;height:24px;flex:0 0 auto;border-radius:50%;background:var(--accent);color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;}
  .step-title{font-weight:900;font-size:16px;}
  .step-sub{color:var(--muted);font-size:12.5px;font-weight:600;margin-left:auto;}
  .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,.04);}

  /* Day picker */
  .months{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;}
  .months::-webkit-scrollbar{height:0;}
  .mgroup{flex:0 0 auto;}
  .mlabel{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin:0 4px 6px;}
  .days{display:flex;gap:8px;}
  .day{flex:0 0 auto;scroll-snap-align:start;min-width:62px;border:1.5px solid var(--line);background:#fff;border-radius:14px;padding:9px 6px;text-align:center;cursor:pointer;transition:transform .16s var(--ease),border-color .16s,background .16s,box-shadow .16s;}
  .day:active{transform:scale(.95);}
  .day .dow{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;}
  .day .num{font-size:20px;font-weight:900;line-height:1.15;}
  .day .mon{font-size:11px;font-weight:700;color:var(--muted);}
  .day.on{border-color:var(--accent);background:#ecfdf5;box-shadow:0 4px 12px rgba(16,185,129,.22);}
  .day.on .dow,.day.on .mon{color:var(--good);}
  .day.on .num{color:var(--accent-dark);}
  .day.off{opacity:.5;cursor:not-allowed;background:#f9fafb;}
  .day.off .num{text-decoration:line-through;}

  /* Slots */
  .slotwrap{min-height:60px;}
  .slotgroup+.slotgroup{margin-top:12px;}
  .slotgroup-label{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin:0 2px 8px;display:flex;align-items:center;gap:6px;}
  .slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;}
  .slot{padding:11px 6px;border:1.5px solid var(--line);border-radius:11px;background:#fff;font-size:15px;font-weight:800;text-align:center;cursor:pointer;color:var(--text);font-family:inherit;transition:transform .16s var(--ease),border-color .16s,background .16s,color .16s;}
  .slot:hover{border-color:var(--accent);}
  .slot:active{transform:scale(.95);}
  .slot:focus-visible{outline:3px solid rgba(16,185,129,.4);outline-offset:2px;}
  .slot.on{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 4px 12px rgba(16,185,129,.3);}
  .slot[disabled]{color:#9ca3af;background:#f9fafb;cursor:not-allowed;text-decoration:line-through;border-style:dashed;}
  .hint{color:var(--muted);font-size:13.5px;font-weight:600;padding:8px 2px;}
  .hint.warn{color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;}

  /* Details form */
  .field+.field{margin-top:10px;}
  .lbl{display:block;color:var(--muted);font-size:12.5px;font-weight:800;margin:0 0 5px 2px;text-transform:uppercase;letter-spacing:.3px;}
  input,textarea{width:100%;padding:12px 13px;border:1.5px solid var(--line);border-radius:11px;font-size:16px;font-family:inherit;background:#fff;color:var(--text);}
  input:focus,textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(16,185,129,.15);}
  textarea{min-height:72px;resize:vertical;}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  @media (max-width:520px){.two{grid-template-columns:1fr;}}

  /* Sticky booking bar */
  .bar{position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.96);backdrop-filter:saturate(1.2) blur(8px);border-top:1px solid var(--line);padding:10px 14px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -6px 20px rgba(0,0,0,.06);z-index:20;}
  .bar-inner{max-width:720px;margin:0 auto;display:flex;align-items:center;gap:12px;}
  .bar-sum{flex:1 1 auto;min-width:0;}
  .bar-sum .l1{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);}
  .bar-sum .l2{font-size:15px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .book{flex:0 0 auto;padding:14px 22px;background:var(--accent);color:#fff;border:none;border-radius:999px;font-size:16px;font-weight:900;cursor:pointer;transition:transform .16s var(--ease),background .16s,opacity .16s;}
  .book:active{transform:scale(.97);}
  .book:disabled{background:#cbd5e1;color:#fff;cursor:not-allowed;}

  .msg{margin:12px 2px 0;padding:12px 14px;border-radius:12px;font-size:14px;font-weight:700;}
  .msg.err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;}

  /* Confirmation */
  .done{animation:pop .4s var(--ease) both;text-align:center;background:#fff;border:1px solid var(--line);border-radius:20px;padding:28px 20px;box-shadow:0 8px 24px rgba(0,0,0,.06);margin-top:20px;}
  .done .check{width:66px;height:66px;margin:0 auto 12px;border-radius:50%;background:#ecfdf5;color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;}
  .done h2{margin:0 0 4px;font-size:22px;font-weight:900;}
  .done .p{color:var(--muted);font-size:14px;margin:0 0 16px;}
  .rcard{text-align:left;background:#f9fafb;border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 auto 16px;max-width:420px;}
  .rrow{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px;}
  .rrow:last-child{border-bottom:none;}
  .rrow .k{color:var(--muted);font-weight:700;}
  .rrow .v{font-weight:900;text-align:right;}
  .done .home{display:inline-block;padding:13px 22px;background:var(--accent);color:#fff;text-decoration:none;border-radius:999px;font-weight:900;}

  .skeleton{height:44px;border-radius:11px;background:linear-gradient(90deg,#f3f4f6 25%,#eaecef 37%,#f3f4f6 63%);background-size:400px 100%;animation:sh 1.3s infinite;}
  @keyframes sh{0%{background-position:-200px 0}100%{background-position:200px 0}}
  .closed{background:#fff;border:1px dashed var(--line);border-radius:16px;padding:34px 20px;text-align:center;color:var(--muted);font-size:15px;font-weight:700;margin-top:20px;}
</style>
</head>
<body>
<div class="wrap" id="wrap">
  <div class="hero">
    <div class="row">
      <div>
        <h1 id="heroName">${doctorName}</h1>
        <p class="sub">Physiotherapist</p>
      </div>
      <a class="back" href="/">&larr; Pharmacy</a>
    </div>
    <div class="facts" id="heroFacts"></div>
  </div>

  <div id="booking">
    <div class="step" id="stepDate">
      <div class="step-head"><span class="step-num">1</span><span class="step-title">Choose a day</span><span class="step-sub" id="dateSub"></span></div>
      <div class="card"><div class="months" id="dayPicker"><div class="skeleton" style="width:100%"></div></div></div>
    </div>

    <div class="step" id="stepTime">
      <div class="step-head"><span class="step-num">2</span><span class="step-title">Choose a time</span><span class="step-sub" id="timeSub"></span></div>
      <div class="card"><div class="slotwrap" id="slotWrap"><div class="hint">Pick a day first.</div></div></div>
    </div>

    <div class="step" id="stepDetails">
      <div class="step-head"><span class="step-num">3</span><span class="step-title">Your details</span></div>
      <div class="card">
        <div class="field"><label class="lbl" for="fName">Full name</label><input id="fName" type="text" autocomplete="name" placeholder="Jane Borg" required></div>
        <div class="two" style="margin-top:10px;">
          <div class="field" style="margin-top:0;"><label class="lbl" for="fPhone">Phone</label><input id="fPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+356 …" required></div>
          <div class="field" style="margin-top:0;"><label class="lbl" for="fEmail">Email</label><input id="fEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required></div>
        </div>
        <div class="field"><label class="lbl" for="fComments">Comments (optional)</label><textarea id="fComments" placeholder="Anything the physiotherapist should know — e.g. lower-back pain"></textarea></div>
        <div id="resultMsg" class="msg err" style="display:none;"></div>
      </div>
    </div>
  </div>

  <div id="closedBox" class="closed" style="display:none;"></div>
  <div id="doneBox"></div>
</div>

<div class="bar" id="bar">
  <div class="bar-inner">
    <div class="bar-sum">
      <div class="l1">Your appointment</div>
      <div class="l2" id="barSummary">Select a day &amp; time</div>
    </div>
    <button class="book" id="bookBtn" disabled>Book</button>
  </div>
</div>

<script>
(function(){
  "use strict";
  var state = { cfg:null, dates:[], selDate:'', selDateLabel:'', slots:[], selSlot:'', selSlotEnd:'', busy:false };
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var DOWKEY = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  // Parse a YYYY-MM-DD key as a *local* date (no timezone drift).
  function pd(k){ var p=String(k).split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
  function fmtLong(k){ var d=pd(k); return DOW[d.getDay()]+', '+d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear(); }
  function t12(t){ var p=String(t).split(':'); var h=+p[0],m=p[1]; var ap=h<12?'AM':'PM'; var hh=h%12; if(hh===0)hh=12; return hh+':'+m+' '+ap; }

  // Build a friendly weekly-hours summary from the hours map, compressing
  // consecutive weekdays that share identical hours (e.g. "Mon–Fri 9:30am–1pm").
  function hoursSummary(hours){
    if(!hours) return '';
    var order=['MON','TUE','WED','THU','FRI','SAT','SUN'];
    var lbl={MON:'Mon',TUE:'Tue',WED:'Wed',THU:'Thu',FRI:'Fri',SAT:'Sat',SUN:'Sun'};
    function sig(d){ var a=hours[d]||[]; if(!a.length) return ''; return a.map(function(r){return r.start+'-'+r.end;}).join(','); }
    function human(d){ var a=hours[d]||[]; return a.map(function(r){return t12(r.start)+'–'+t12(r.end);}).join(' & '); }
    var groups=[], cur=null;
    for(var i=0;i<order.length;i++){ var d=order[i], s=sig(d);
      if(!s){ cur=null; continue; }
      if(cur && cur.sig===s){ cur.end=d; } else { cur={sig:s,start:d,end:d,human:human(d)}; groups.push(cur); }
    }
    return groups.map(function(g){ var days=g.start===g.end?lbl[g.start]:lbl[g.start]+'–'+lbl[g.end]; return days+' '+g.human; }).join(' · ');
  }

  function renderHero(cfg){
    $('heroName').textContent = cfg.doctorName || 'Linda';
    var facts=[];
    if(cfg.location) facts.push('<span class="fact">📍 <b>'+esc(cfg.location)+'</b></span>');
    var mins = cfg.slotMin || cfg.apptMinutes;
    if(mins) facts.push('<span class="fact">⏱ <b>'+mins+'-min</b> sessions</span>');
    var hs = hoursSummary(cfg.hours);
    if(hs) facts.push('<span class="fact">🕘 '+esc(hs)+'</span>');
    $('heroFacts').innerHTML = facts.join('');
  }

  function renderDays(){
    var host=$('dayPicker');
    var open=state.dates.filter(function(d){return !d.disabled;});
    $('dateSub').textContent = open.length ? open.length+' day'+(open.length>1?'s':'')+' open' : '';
    if(!state.dates.length){ host.innerHTML='<div class="hint">No dates available right now.</div>'; return; }
    // Group by month so long stints read clearly.
    var groups=[], cur=null;
    state.dates.forEach(function(d){ var dt=pd(d.dateKey); var mk=dt.getFullYear()+'-'+dt.getMonth();
      if(!cur||cur.mk!==mk){ cur={mk:mk,label:MON[dt.getMonth()]+' '+dt.getFullYear(),items:[]}; groups.push(cur); }
      cur.items.push(d);
    });
    var html='';
    groups.forEach(function(g){
      html+='<div class="mgroup"><div class="mlabel">'+esc(g.label)+'</div><div class="days">';
      g.items.forEach(function(d){
        var dt=pd(d.dateKey);
        var cls='day'+(d.disabled?' off':'')+(d.dateKey===state.selDate?' on':'');
        var attr=d.disabled?('title="'+esc(d.reason||'Closed')+'" aria-disabled="true"'):('role="button" tabindex="0" data-dk="'+d.dateKey+'"');
        html+='<div class="'+cls+'" '+attr+'>'
          +'<div class="dow">'+DOW[dt.getDay()]+'</div>'
          +'<div class="num">'+dt.getDate()+'</div>'
          +'<div class="mon">'+MON[dt.getMonth()]+'</div></div>';
      });
      html+='</div></div>';
    });
    host.innerHTML=html;
    Array.prototype.forEach.call(host.querySelectorAll('.day[data-dk]'),function(el){
      el.addEventListener('click',function(){ selectDate(el.getAttribute('data-dk')); });
      el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectDate(el.getAttribute('data-dk')); } });
    });
  }

  function selectDate(dk){
    state.selDate=dk; state.selSlot=''; state.selSlotEnd='';
    var opt=state.dates.filter(function(d){return d.dateKey===dk;})[0];
    state.selDateLabel = opt?opt.label:fmtLong(dk);
    renderDays();
    updateBar();
    loadSlots(dk);
    // Bring the time step into view on small screens.
    setTimeout(function(){ try{ $('stepTime').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){} },80);
  }

  function slotSkeleton(){
    var s=''; for(var i=0;i<8;i++) s+='<div class="skeleton" style="height:44px"></div>';
    return '<div class="slots">'+s+'</div>';
  }

  function renderSlots(slots, reason){
    var host=$('slotWrap');
    state.selSlot=''; state.selSlotEnd=''; updateBar();
    if(!slots || !slots.length){
      host.innerHTML='<div class="hint warn">'+esc(reason||'No times available for this day.')+'</div>';
      $('timeSub').textContent='';
      return;
    }
    var avail=slots.filter(function(s){return s.available;}).length;
    $('timeSub').textContent = avail+' free';
    var groups=[{label:'🌅 Morning',items:[]},{label:'☀️ Afternoon & evening',items:[]}];
    slots.forEach(function(s){ var h=+String(s.start).split(':')[0]; (h<12?groups[0]:groups[1]).items.push(s); });
    var html='';
    groups.forEach(function(g){ if(!g.items.length) return;
      html+='<div class="slotgroup"><div class="slotgroup-label">'+g.label+'</div><div class="slots">';
      g.items.forEach(function(s){
        var dis=!s.available;
        html+='<button type="button" class="slot" data-start="'+esc(s.start)+'" data-end="'+esc(s.end)+'"'+(dis?' disabled aria-disabled="true" title="Taken"':'')+'>'+t12(s.start)+'</button>';
      });
      html+='</div></div>';
    });
    if(avail===0) html+='<div class="hint warn" style="margin-top:12px;">All times for this day are taken. Try another day above.</div>';
    host.innerHTML=html;
    Array.prototype.forEach.call(host.querySelectorAll('.slot:not([disabled])'),function(btn){
      btn.addEventListener('click',function(){
        var prev=host.querySelector('.slot.on'); if(prev)prev.classList.remove('on');
        btn.classList.add('on');
        state.selSlot=btn.getAttribute('data-start'); state.selSlotEnd=btn.getAttribute('data-end');
        updateBar();
        setTimeout(function(){ try{ $('stepDetails').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){} },60);
      });
    });
  }

  function detailsValid(){
    var nm=$('fName').value.trim(), em=$('fEmail').value.trim(), ph=$('fPhone').value.trim();
    var emOk=/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(em);
    return nm.length>1 && emOk && ph.length>=6;
  }

  function updateBar(){
    var sum=$('barSummary');
    if(state.selDate && state.selSlot){
      sum.textContent = state.selDateLabel + ' · ' + t12(state.selSlot);
    } else if(state.selDate){
      sum.textContent = state.selDateLabel + ' · pick a time';
    } else {
      sum.textContent = 'Select a day & time';
    }
    $('bookBtn').disabled = !(state.selDate && state.selSlot && detailsValid() && !state.busy);
  }

  function showErr(text){
    var el=$('resultMsg'); el.style.display='block'; el.textContent=text;
    try{ el.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
  }
  function clearErr(){ $('resultMsg').style.display='none'; }

  function loadSlots(dk){
    $('slotWrap').innerHTML=slotSkeleton();
    fetch('/api/physio-availability?date='+encodeURIComponent(dk)).then(function(r){return r.json();}).then(function(data){
      if(dk!==state.selDate) return; // a newer selection won the race
      if(data.ok){ state.slots=data.slots||[]; renderSlots(state.slots); }
      else { renderSlots([], data.reason||'Closed'); }
    }).catch(function(){ if(dk===state.selDate) renderSlots([], 'Could not load times — check your connection and tap the day again.'); });
  }

  function showClosed(msg){
    $('booking').style.display='none';
    $('bar').style.display='none';
    var c=$('closedBox'); c.style.display='block';
    c.innerHTML='<div style="font-size:34px;margin-bottom:8px;">🗓️</div>'+esc(msg);
  }

  function loadInit(){
    fetch('/api/physio-init').then(function(r){return r.json();}).then(function(data){
      var cfg=(data&&data.config)||{}; state.cfg=cfg; renderHero(cfg);
      if(cfg.enabled===false){ showClosed('Physiotherapy bookings aren’t open at the moment. Please check back soon.'); return; }
      state.dates=data.dateOptions||[];
      if(!state.dates.length){ showClosed('No dates are open for booking just yet. Please check back soon.'); return; }
      renderDays();
      var first=state.dates.filter(function(d){return !d.disabled;})[0];
      if(first){
        state.selDate=first.dateKey; state.selDateLabel=first.label;
        renderDays();
        if(data.initialSlots && data.initialSlots.ok && data.initialSlots.dateKey===first.dateKey){
          state.slots=data.initialSlots.slots||[]; renderSlots(state.slots);
        } else { loadSlots(first.dateKey); }
      }
      updateBar();
    }).catch(function(){ showClosed('Could not load availability. Please refresh the page.'); });
  }

  function submit(){
    if(!(state.selDate && state.selSlot && detailsValid())) return;
    clearErr();
    state.busy=true; var btn=$('bookBtn'); btn.disabled=true; btn.textContent='Booking…';
    var body={ dateKey:state.selDate, startTime:state.selSlot, serviceId:'physio',
      fullName:$('fName').value.trim(), email:$('fEmail').value.trim(), phone:$('fPhone').value.trim(),
      comments:$('fComments').value.trim() };
    fetch('/api/physio-book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();})
      .then(function(data){
        state.busy=false; btn.textContent='Book';
        if(data.ok){ showDone(data, body); }
        else {
          showErr(data.reason||'Booking failed. Please try another time.');
          btn.disabled=false; updateBar();
          // The slot may have just been taken — refresh times for this day.
          loadSlots(state.selDate);
        }
      }).catch(function(){
        state.busy=false; btn.textContent='Book'; btn.disabled=false; updateBar();
        showErr('Network error. Please check your connection and try again.');
      });
  }

  function showDone(data, body){
    $('booking').style.display='none';
    $('bar').style.display='none';
    var loc=(state.cfg&&state.cfg.location)||data.location||'';
    var who=(state.cfg&&state.cfg.doctorName)||'Linda';
    var html='<div class="done"><div class="check">✓</div>'
      +'<h2>You’re booked!</h2>'
      +'<p class="p">A confirmation e-mail is on its way to '+esc(body.email)+'.</p>'
      +'<div class="rcard">'
      +'<div class="rrow"><span class="k">Physiotherapist</span><span class="v">'+esc(who)+'</span></div>'
      +'<div class="rrow"><span class="k">Date</span><span class="v">'+esc(fmtLong(data.dateKey))+'</span></div>'
      +'<div class="rrow"><span class="k">Time</span><span class="v">'+esc(t12(data.startTime))+(data.endTime?' – '+esc(t12(data.endTime)):'')+'</span></div>'
      +(loc?'<div class="rrow"><span class="k">Location</span><span class="v">'+esc(loc)+'</span></div>':'')
      +'<div class="rrow"><span class="k">Name</span><span class="v">'+esc(body.fullName)+'</span></div>'
      +'</div>'
      +'<p class="p">Please arrive a few minutes early. Need to change or cancel? Use the link in your e-mail.</p>'
      +'<a class="home" href="/">Done</a></div>';
    $('doneBox').innerHTML=html;
    try{ window.scrollTo({top:0,behavior:'smooth'});}catch(e){}
  }

  ['fName','fEmail','fPhone'].forEach(function(id){ $(id).addEventListener('input',updateBar); });
  $('bookBtn').addEventListener('click',submit);
  // Refresh slots when the customer returns to the tab so they never book a stale slot.
  document.addEventListener('visibilitychange',function(){ if(!document.hidden && state.selDate && !state.busy && $('booking').style.display!=='none') loadSlots(state.selDate); });

  loadInit();
})();
</script>
</body>
</html>`;
}
