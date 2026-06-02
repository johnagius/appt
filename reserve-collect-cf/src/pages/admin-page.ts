import { htmlDoc } from './shared';

export function adminPage(sig: string): string {
  const body = `
<header class="nav">
  <a class="brand" href="/" target="_blank"><b>Reserve &amp; Collect</b><small>Staff dashboard</small></a>
  <nav class="navright"><a class="navlink" href="/" target="_blank">Public site ↗</a></nav>
</header>
<div class="wrap wide">

  <div class="card">
    <div id="stats" class="row" style="text-align:center;"></div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">Phone &amp; counter orders</h2>
      <button class="btn btn-dark" onclick="toggleNew()">+ New order for a customer</button>
    </div>
    <div id="newOrder" style="display:none;margin-top:14px;">
      <p class="muted" style="margin:0 0 8px;">Create a reservation on a customer's behalf. They'll get an email with the reference and a sign-in link, and it appears in their account when they sign in with this email.</p>
      <div class="row">
        <div><label>Customer name</label><input type="text" id="nName"></div>
        <div><label>Customer email</label><input type="email" id="nEmail"></div>
        <div><label>Phone (optional)</label><input type="tel" id="nPhone"></div>
      </div>
      <label>Items</label>
      <div id="nItems"></div>
      <button class="btn btn-outline" onclick="addNewItem()" style="margin-top:6px;">+ Add item</button>
      <label style="margin-top:10px;">Notes (optional)</label>
      <input type="text" id="nNotes" placeholder="e.g. requested by phone, blue box">
      <div class="err" id="nErr"></div>
      <button class="btn btn-primary" onclick="createOrder()" style="margin-top:12px;">Create reservation &amp; email customer</button>
    </div>
  </div>

  <div class="card">
    <div class="row" style="align-items:center;">
      <div style="flex:2;"><input type="text" id="q" placeholder="Search reference, name or email…" oninput="debouncedLoad()"></div>
      <div style="flex:0 0 auto;"><button class="btn btn-outline" onclick="load()">Search</button></div>
    </div>
    <div id="tabs" style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;"></div>
  </div>

  <div id="list"></div>

  <div class="card" style="border:1px solid #fecaca;">
    <details>
      <summary style="cursor:pointer;font-weight:800;color:#b91c1c;">⚠️ Testing tools (wipe data)</summary>
      <p class="muted" style="margin:10px 0;">Permanently delete data for testing — cannot be undone.</p>
      <div class="row">
        <button class="btn btn-outline" style="border-color:#fca5a5;color:#b91c1c;" onclick="wipe('orders')">Wipe all orders (keep accounts)</button>
        <button class="btn btn-danger" onclick="wipe('all')">Wipe everything (orders + accounts)</button>
      </div>
    </details>
  </div>
</div>
<script>
var SIG = ${JSON.stringify(sig)};
var STATUS = 'ALL';
var STATUSES = ['ALL','SUBMITTED','ACCEPTED','PARTIALLY_UNAVAILABLE','READY_FOR_COLLECTION','COLLECTED','CANCELLED'];
var LABELS = {ALL:'All',SUBMITTED:'New',ACCEPTED:'Accepted',PARTIALLY_UNAVAILABLE:'Partial',READY_FOR_COLLECTION:'Ready',COLLECTED:'Collected',CANCELLED:'Cancelled'};
var ITEM_STATUSES = ['AVAILABLE','RESERVED_ALREADY','UNAVAILABLE'];
var ITEM_LABEL = {PENDING:'Being checked',AVAILABLE:'Available',RESERVED_ALREADY:'Reserved already',UNAVAILABLE:'Unavailable'};
var lastV = -1;

function api(path, method, bodyObj){
  var sep = path.indexOf('?')>=0?'&':'?';
  return fetch(path+sep+'sig='+encodeURIComponent(SIG), {
    method: method||'GET', credentials:'same-origin',
    headers: bodyObj?{'Content-Type':'application/json'}:undefined,
    body: bodyObj?JSON.stringify(bodyObj):undefined
  }).then(function(r){return r.json();});
}
function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; }
function badge(s){ return '<span class="badge b-'+s+'">'+(LABELS[s]||s)+'</span>'; }
function photoUrl(id){ return '/api/photos/'+id+'?sig='+encodeURIComponent(SIG); }

// ── New phone/counter order ──
function toggleNew(){ var n=document.getElementById('newOrder'); var show=n.style.display==='none'; n.style.display=show?'block':'none'; if(show && !document.querySelectorAll('.nItem').length) addNewItem(); }
function addNewItem(){ var w=document.getElementById('nItems'); var d=document.createElement('div'); d.className='row'; d.style.marginBottom='6px';
  d.innerHTML='<div style="flex:3;"><input type="text" class="nItem" placeholder="Item name or description"></div>'
    +'<div style="flex:0 0 80px;min-width:70px;"><input type="number" class="nQty" min="1" max="99" value="1"></div>'
    +'<button class="btn btn-outline" style="flex:0 0 auto;" onclick="this.parentNode.remove()">✕</button>';
  w.appendChild(d); }
async function createOrder(){
  var err=document.getElementById('nErr'); err.textContent='';
  var names=document.querySelectorAll('.nItem'), qtys=document.querySelectorAll('.nQty'), items=[];
  for(var i=0;i<names.length;i++){ var v=names[i].value.trim(); if(v) items.push({name:v, quantity:parseInt(qtys[i].value,10)||1}); }
  var body={ name:document.getElementById('nName').value.trim(), email:document.getElementById('nEmail').value.trim(),
    phone:document.getElementById('nPhone').value.trim(), notes:document.getElementById('nNotes').value.trim(), items:items };
  if(!body.name||!body.email||items.length===0){ err.textContent='Name, email and at least one item are required.'; return; }
  var d=await api('/api/admin/reservations','POST',body);
  if(d.ok){ alert('Created '+d.reference+' — the customer has been emailed.');
    document.getElementById('newOrder').style.display='none'; document.getElementById('nItems').innerHTML='';
    ['nName','nEmail','nPhone','nNotes'].forEach(function(id){ document.getElementById(id).value=''; }); load(); }
  else err.textContent=d.reason||'Failed to create.';
}

function renderTabs(){
  document.getElementById('tabs').innerHTML = STATUSES.map(function(s){
    return '<button class="btn '+(s===STATUS?'btn-dark':'btn-outline')+'" style="padding:7px 12px;font-size:13px;" onclick="setStatus(\\''+s+'\\')">'+LABELS[s]+'</button>';
  }).join('');
}
function setStatus(s){ STATUS=s; renderTabs(); load(); }
var t=null;
function debouncedLoad(){ clearTimeout(t); t=setTimeout(load, 300); }

async function loadStats(){
  try{ var d = await api('/api/admin/stats');
    if(d.ok){ var s=d.stats; document.getElementById('stats').innerHTML =
      stat('New', s.submitted, '#4338ca') + stat('Awaiting action', s.awaiting, '#b45309') +
      stat('Ready', s.ready, '#15803d') + stat('Collected today', s.collectedToday, '#374151'); }
  }catch(e){}
}
function stat(label, n, color){ return '<div><div style="font-size:26px;font-weight:900;color:'+color+';">'+n+'</div><div class="muted">'+label+'</div></div>'; }

// ── Each order is fully shown inline — no clicking needed ──
function renderCard(r){
  var id = r.id;
  var items = (r.items||[]).map(function(it){
    var chips = ITEM_STATUSES.map(function(s){
      var cls = (it.item_status===s)?('chip sel-'+s):'chip';
      return '<span class="'+cls+'" data-item="'+it.id+'" data-status="'+s+'" onclick="pickStatus(this)">'+ITEM_LABEL[s]+'</span>';
    }).join(' ');
    var hint = (it.item_status==='PENDING')?' <span class="muted" style="font-size:12px;">— counts as available when ready</span>':'';
    return '<div style="padding:9px 0;border-top:1px solid var(--line);">'
      + '<div style="font-weight:700;">'+esc(it.item_name)+(it.quantity>1?' <span class="muted">×'+it.quantity+'</span>':'')+'</div>'
      + '<div style="margin:7px 0 0;display:flex;gap:6px;flex-wrap:wrap;align-items:center;" data-itemrow="'+it.id+'" data-current="'+it.item_status+'">'+chips+hint+'</div>'
      + '</div>';
  }).join('');
  var photos = (r.photos||[]).map(function(p){
    return '<a href="'+photoUrl(p.id)+'" target="_blank" style="text-align:center;text-decoration:none;">'
      + '<img class="thumb" src="'+photoUrl(p.id)+'" alt=""><div class="muted" style="font-size:11px;">'+(p.kind==='prescription'?'Rx':'Item')+'</div></a>';
  }).join('');
  return '<div class="card" data-card="'+id+'">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">'
      + '<div><div style="font-size:17px;font-weight:800;">'+esc(r.customer_name)+'</div>'
      + '<div class="muted" style="font-size:13px;">'+esc(r.customer_email)+(r.customer_phone?' · '+esc(r.customer_phone):'')+'</div></div>'
      + '<div style="text-align:right;">'+badge(r.status)+'<div class="muted" style="font-size:11px;margin-top:3px;">Ref '+esc(r.reference)+' · '+(r.created_at||'').slice(0,16)+'</div></div>'
    + '</div>'
    + (r.notes?'<p class="muted" style="margin:8px 0 0;">📝 '+esc(r.notes)+'</p>':'')
    + ((r.preferred_day||r.preferred_time)?'<p class="muted" style="margin:4px 0 0;">Prefers: '+esc(r.preferred_day)+' '+esc(r.preferred_time)+'</p>':'')
    + '<div style="margin-top:8px;">'+items+'</div>'
    + (photos?'<div class="row" style="margin:12px 0 0;gap:10px;">'+photos+'</div>':'')
    + '<div class="row" style="margin-top:14px;">'
      + '<button class="btn btn-good" style="flex:2;" onclick="action(\\''+id+'\\',\\'ready\\')">✓ Ready to collect — email</button>'
      + '<button class="btn btn-dark" onclick="action(\\''+id+'\\',\\'collected\\')">Collected</button>'
    + '</div>'
    + '<div class="row" style="margin-top:8px;">'
      + '<button class="btn btn-outline" onclick="notify(\\''+id+'\\',\\'ready\\')">Re-send ready</button>'
      + '<button class="btn btn-outline" onclick="notify(\\''+id+'\\',\\'unavailable\\')">Tell unavailable</button>'
      + '<button class="btn btn-outline" onclick="notify(\\''+id+'\\',\\'custom\\')">Message</button>'
      + '<button class="btn btn-danger" onclick="action(\\''+id+'\\',\\'cancel\\')">Cancel</button>'
    + '</div>'
  + '</div>';
}

async function load(){
  renderTabs();
  var box = document.getElementById('list');
  var q = document.getElementById('q').value.trim();
  try{
    var d = await api('/api/admin/reservations?status='+encodeURIComponent(STATUS)+'&q='+encodeURIComponent(q));
    if(!d.ok){ box.innerHTML='<div class="card"><p class="muted">Access denied.</p></div>'; return; }
    if(d.reservations.length===0){ box.innerHTML='<div class="card"><p class="muted">No reservations.</p></div>'; return; }
    box.innerHTML = d.reservations.map(renderCard).join('');
  }catch(e){ box.innerHTML='<div class="card"><p class="muted">Error loading.</p></div>'; }
  loadStats();
  await syncVersion();
}

async function pickStatus(el){
  var row = el.parentNode;
  row.querySelectorAll('.chip').forEach(function(c){ c.className='chip'; });
  var status = el.getAttribute('data-status');
  el.className = 'chip sel-'+status;
  row.setAttribute('data-current', status);
  var itemId = el.getAttribute('data-item');
  var card = el.closest('[data-card]'); var rid = card?card.getAttribute('data-card'):null;
  row.style.opacity = '0.55';
  try{ await api('/api/admin/reservations/'+rid+'/items','POST',{items:[{id:itemId,status:status,staffNote:''}]}); }catch(e){}
  row.style.opacity = '1';
  loadStats(); await syncVersion();
}

async function action(id, kind){
  if(kind==='cancel' && !confirm('Cancel this reservation?')) return;
  var path = kind==='ready'?'/ready':kind==='collected'?'/collected':'/cancel';
  var d = await api('/api/admin/reservations/'+id+path,'POST',{});
  if(d.ok){ load(); } else alert(d.reason||'Failed');
}

async function notify(id, type){
  var body = {type:type};
  if(type==='custom'){ var m = prompt('Message to send to the customer:'); if(!m) return; body.message=m; }
  var d = await api('/api/admin/reservations/'+id+'/notify','POST',body);
  if(d.ok){ alert('Email sent.'); } else alert(d.reason||'Failed');
}

// ── Testing: wipe data ──
async function wipe(mode){
  var what = mode==='all' ? 'ALL orders AND all customer accounts' : 'ALL orders (customer accounts kept)';
  var typed = prompt('This permanently deletes ' + what + '. This CANNOT be undone.\\n\\nType DELETE (in capitals) to confirm:');
  if(typed===null) return;
  if(typed.trim()!=='DELETE'){ alert('Cancelled — you must type DELETE exactly to wipe.'); return; }
  var d = await api('/api/admin/wipe','POST',{mode:mode});
  if(d.ok){ alert('Done — '+(mode==='all'?'orders + accounts wiped.':'orders wiped.')+' Photos removed: '+d.photosDeleted); load(); }
  else alert(d.reason||'Failed');
}

// ── Realtime: instant updates + beep on new orders ──
function beep(){
  try{
    var ctx = beep._c || (beep._c = new (window.AudioContext||window.webkitAudioContext)());
    if(ctx.state==='suspended') ctx.resume();
    var o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.value=880; g.gain.value=0.07;
    o.frequency.setValueAtTime(1320, ctx.currentTime+0.12);
    o.start(); o.stop(ctx.currentTime+0.26);
  }catch(e){}
}
function flashTitle(txt){
  var orig='Staff dashboard'; var n=0; clearInterval(flashTitle._t);
  flashTitle._t=setInterval(function(){ document.title=(n%2?txt:orig); if(++n>7){clearInterval(flashTitle._t); document.title=orig;} },600);
}
function connectWS(){
  try{
    var proto = location.protocol==='https:'?'wss:':'ws:';
    var ws = new WebSocket(proto+'//'+location.host+'/api/ws');
    ws.onmessage = function(ev){ var m={}; try{ m=JSON.parse(ev.data); }catch(e){}
      if(m.type==='new_order'){ beep(); flashTitle('🔔 New order!'); load(); }
      else if(m.type==='changed'){ load(); } };
    ws.onclose = function(){ clearInterval(connectWS._p); setTimeout(connectWS, 3000); };
    ws.onerror = function(){ try{ ws.close(); }catch(e){} };
    clearInterval(connectWS._p);
    connectWS._p = setInterval(function(){ try{ if(ws.readyState===1) ws.send('ping'); }catch(e){} }, 25000);
  }catch(e){ setTimeout(connectWS, 5000); }
}
// Resume audio on first interaction (browsers gate autoplay).
document.addEventListener('click', function(){ try{ if(beep._c && beep._c.state==='suspended') beep._c.resume(); }catch(e){} });

// Poll only as a fallback if the socket drops.
async function syncVersion(){ try{ var d=await api('/api/poll'); if(d&&d.v!==undefined) lastV=d.v; }catch(e){} }
async function poll(){
  try{ var d = await api('/api/poll'); if(d.v!==undefined && d.v!==lastV){ if(lastV!==-1) load(); lastV=d.v; } }catch(e){}
}
renderTabs(); load(); connectWS(); setInterval(poll, 15000);
</script>`;
  return htmlDoc('Staff dashboard — Reserve & Collect', body);
}
