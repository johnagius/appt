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

  <div id="detail"></div>

  <div class="card">
    <div class="row" style="align-items:center;">
      <div style="flex:2;"><input type="text" id="q" placeholder="Search reference, name or email…" oninput="debouncedLoad()"></div>
      <div style="flex:0 0 auto;"><button class="btn btn-outline" onclick="load()">Search</button></div>
    </div>
    <div id="tabs" style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;"></div>
  </div>

  <div id="list"></div>
</div>
<script>
var SIG = ${JSON.stringify(sig)};
var STATUS = 'ALL';
var STATUSES = ['ALL','SUBMITTED','ACCEPTED','PARTIALLY_UNAVAILABLE','READY_FOR_COLLECTION','COLLECTED','CANCELLED'];
var LABELS = {ALL:'All',SUBMITTED:'New',ACCEPTED:'Accepted',PARTIALLY_UNAVAILABLE:'Partial',READY_FOR_COLLECTION:'Ready',COLLECTED:'Collected',CANCELLED:'Cancelled'};
var ITEM_STATUSES = ['AVAILABLE','RESERVED_ALREADY','UNAVAILABLE'];
var ITEM_LABEL = {PENDING:'Being checked',AVAILABLE:'Available',RESERVED_ALREADY:'Reserved already',UNAVAILABLE:'Unavailable'};
var lastV = -1;
var curId = null;

function api(path, method, bodyObj){
  var sep = path.indexOf('?')>=0?'&':'?';
  return fetch(path+sep+'sig='+encodeURIComponent(SIG), {
    method: method||'GET', credentials:'same-origin',
    headers: bodyObj?{'Content-Type':'application/json'}:undefined,
    body: bodyObj?JSON.stringify(bodyObj):undefined
  }).then(function(r){return r.json();});
}
function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; }

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
function badge(s){ return '<span class="badge b-'+s+'">'+(LABELS[s]||s)+'</span>'; }

function renderTabs(){
  document.getElementById('tabs').innerHTML = STATUSES.map(function(s){
    return '<button class="btn '+(s===STATUS?'btn-dark':'btn-outline')+'" style="padding:7px 12px;font-size:13px;" onclick="setStatus(\\''+s+'\\')">'+LABELS[s]+'</button>';
  }).join('');
}
function setStatus(s){ STATUS=s; renderTabs(); load(); }

var t=null;
function debouncedLoad(){ clearTimeout(t); t=setTimeout(load, 300); }

async function loadStats(){
  try{
    var d = await api('/api/admin/stats');
    if(d.ok){
      var s = d.stats;
      document.getElementById('stats').innerHTML =
        stat('New', s.submitted, '#4338ca') + stat('Awaiting action', s.awaiting, '#b45309') +
        stat('Ready', s.ready, '#15803d') + stat('Collected today', s.collectedToday, '#374151');
    }
  }catch(e){}
}
function stat(label, n, color){ return '<div><div style="font-size:26px;font-weight:900;color:'+color+';">'+n+'</div><div class="muted">'+label+'</div></div>'; }

async function load(){
  renderTabs();
  var box = document.getElementById('list');
  var q = document.getElementById('q').value.trim();
  try{
    var d = await api('/api/admin/reservations?status='+encodeURIComponent(STATUS)+'&q='+encodeURIComponent(q));
    if(!d.ok){ box.innerHTML='<div class="card"><p class="muted">Access denied.</p></div>'; return; }
    if(d.reservations.length===0){ box.innerHTML='<div class="card"><p class="muted">No reservations.</p></div>'; return; }
    box.innerHTML = d.reservations.map(function(r){
      var itemCount = (r.items||[]).length;
      return '<div class="card" style="cursor:pointer;" onclick="openDetail(\\''+r.id+'\\')">'
        + '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;">'
        + '<div><b>'+esc(r.reference)+'</b> — '+esc(r.customer_name)+' <span class="muted">'+esc(r.customer_email)+'</span></div>'
        + badge(r.status)+'</div>'
        + '<div class="muted" style="margin-top:4px;">'+itemCount+' item(s)'+(r.photoCount?' · '+r.photoCount+' photo(s)':'')+' · '+(r.created_at||'').slice(0,16)+'</div>'
        + '</div>';
    }).join('');
  }catch(e){ box.innerHTML='<div class="card"><p class="muted">Error loading.</p></div>'; }
  loadStats();
}

async function openDetail(id){
  var d = await api('/api/admin/reservations/'+id);
  if(!d.ok){ alert('Not found'); return; }
  var r = d.reservation;
  curId = r.id;
  var items = (r.items||[]).map(function(it){
    var chips = ITEM_STATUSES.map(function(s){
      var selClass = (it.item_status===s)?(' chip sel-'+s):' chip';
      return '<span class="'+selClass+'" data-item="'+it.id+'" data-status="'+s+'" onclick="pickStatus(this)">'+ITEM_LABEL[s]+'</span>';
    }).join(' ');
    return '<div style="padding:10px 0;border-bottom:1px solid var(--line);">'
      + '<div style="font-weight:700;">'+esc(it.item_name)+(it.quantity>1?' ×'+it.quantity:'')+'</div>'
      + '<div style="margin:6px 0;display:flex;gap:6px;flex-wrap:wrap;" data-itemrow="'+it.id+'" data-current="'+it.item_status+'">'+chips+'</div>'
      + '</div>';
  }).join('');
  var photos = (r.photos||[]).map(function(p){
    return '<a href="/api/photos/'+p.id+'" target="_blank" style="text-align:center;text-decoration:none;">'
      + '<img class="thumb" src="/api/photos/'+p.id+'" alt=""><div class="muted" style="font-size:11px;">'+(p.kind==='prescription'?'Rx':'Item')+'</div></a>';
  }).join('');
  var events = (r.events||[]).map(function(e){ return '<li>'+esc(e.created_at)+' — '+esc(e.event)+' <span class="muted">('+esc(e.actor)+(e.detail?': '+esc(e.detail):'')+')</span></li>'; }).join('');

  document.getElementById('detail').innerHTML =
    '<div class="card" style="border:2px solid var(--accent);">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">'
    + '<h2 style="margin:0;">'+esc(r.reference)+' '+badge(r.status)+'</h2>'
    + '<button class="btn btn-outline" style="padding:6px 12px;" onclick="closeDetail()">Close</button></div>'
    + '<p style="margin:8px 0 0;"><b>'+esc(r.customer_name)+'</b> · '+esc(r.customer_email)+(r.customer_phone?' · '+esc(r.customer_phone):'')+'</p>'
    + ((r.preferred_day||r.preferred_time)?'<p class="muted">Prefers: '+esc(r.preferred_day)+' '+esc(r.preferred_time)+'</p>':'')
    + (r.notes?'<p class="muted">Customer note: '+esc(r.notes)+'</p>':'')
    + (photos?'<div class="row" style="margin:10px 0;gap:10px;">'+photos+'</div>':'')
    + '<h2 style="margin-top:14px;">Items</h2>'+items
    + '<div class="hint" style="margin-top:14px;">Items count as available when you mark the order ready — only tap an item above if you need to flag it Unavailable or Reserved.</div>'
    + '<div class="row" style="margin-top:12px;">'
    + '<button class="btn btn-good" style="flex:2;" onclick="action(\\''+r.id+'\\',\\'ready\\')">✓ Ready to collect — email customer</button>'
    + '<button class="btn btn-dark" onclick="action(\\''+r.id+'\\',\\'collected\\')">Collected</button>'
    + '</div>'
    + '<div class="row" style="margin-top:8px;">'
    + '<button class="btn btn-outline" onclick="notify(\\''+r.id+'\\',\\'ready\\')">Re-send ready email</button>'
    + '<button class="btn btn-outline" onclick="notify(\\''+r.id+'\\',\\'unavailable\\')">Tell customer unavailable</button>'
    + '<button class="btn btn-outline" onclick="notify(\\''+r.id+'\\',\\'custom\\')">Custom message</button>'
    + '<button class="btn btn-danger" onclick="action(\\''+r.id+'\\',\\'cancel\\')">Cancel</button>'
    + '</div>'
    + (events?'<details style="margin-top:12px;"><summary class="muted">History</summary><ul class="muted" style="line-height:1.6;">'+events+'</ul></details>':'')
    + '</div>';
  window.scrollTo(0,0);
}
function closeDetail(){ document.getElementById('detail').innerHTML=''; }

async function pickStatus(el){
  var row = el.parentNode;
  row.querySelectorAll('.chip').forEach(function(c){ c.className='chip'; });
  el.className = 'chip sel-'+el.getAttribute('data-status');
  var status = el.getAttribute('data-status');
  row.setAttribute('data-current', status);
  // Auto-save this item immediately so "marked available" is always persisted.
  var itemId = el.getAttribute('data-item');
  var noteEl = document.querySelector('[data-note="'+itemId+'"]');
  el.parentNode.style.opacity = '0.55';
  try { await api('/api/admin/reservations/'+curId+'/items','POST',{items:[{id:itemId,status:status,staffNote:noteEl?noteEl.value:''}]}); }
  catch(e){}
  el.parentNode.style.opacity = '1';
  load();
}

async function action(id, kind){
  if(kind==='cancel' && !confirm('Cancel this reservation?')) return;
  var path = kind==='ready'?'/ready':kind==='collected'?'/collected':'/cancel';
  var d = await api('/api/admin/reservations/'+id+path,'POST',{});
  if(d.ok){ openDetail(id); load(); } else alert(d.reason||'Failed');
}

async function notify(id, type){
  var body = {type:type};
  if(type==='custom'){ var m = prompt('Message to send to the customer:'); if(!m) return; body.message=m; }
  var d = await api('/api/admin/reservations/'+id+'/notify','POST',body);
  if(d.ok){ alert('Email sent.'); openDetail(id); } else alert(d.reason||'Failed');
}

// Auto-refresh the list when data changes (lightweight poll).
async function poll(){
  try{ var d = await api('/api/poll'); if(d.v!==undefined && d.v!==lastV){ if(lastV!==-1) load(); lastV=d.v; } }catch(e){}
}
renderTabs(); load(); setInterval(poll, 8000);
</script>`;
  return htmlDoc('Staff dashboard — Reserve & Collect', body);
}
