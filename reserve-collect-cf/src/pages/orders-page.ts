import type { Env } from '../types';
import { escapeHtml } from '../services/utils';
import { htmlDoc, topBar } from './shared';

export function ordersPage(env: Env): string {
  const body = `
${topBar(env, '<a href="/reserve">New reservation</a> &nbsp; <a href="#" onclick="return logout()">Sign out</a>')}
<div class="wrap">
  <div class="card">
    <h1>My reservations</h1>
    <p class="lead">Track your reservations and re-order in one tap. We'll always email you when something's ready to collect.</p>
  </div>

  <div class="card" id="referralCard" style="display:none;background:linear-gradient(135deg,#fff7e0,#fff);border:1.5px solid var(--accent);">
    <h2>🎁 Share with a friend</h2>
    <p class="muted" style="margin:0 0 10px;">Tell friends they can reserve &amp; collect their pharmacy items here too.</p>
    <div class="row">
      <input type="text" id="refLink" readonly>
      <button type="button" class="btn btn-outline" style="flex:0 0 auto;" onclick="copyRef()">Copy</button>
      <a class="btn btn-good" style="flex:0 0 auto;" id="waShare" target="_blank">Share on WhatsApp</a>
    </div>
  </div>

  <div id="list"><div class="card"><p class="muted">Loading…</p></div></div>
</div>
<script>
var ME = null;

function badge(status){
  var labels = {SUBMITTED:'Submitted',ACCEPTED:'Accepted',READY_FOR_COLLECTION:'Ready to collect',COLLECTED:'Collected',PARTIALLY_UNAVAILABLE:'Partially available',CANCELLED:'Cancelled'};
  return '<span class="badge b-'+status+'">'+(labels[status]||status)+'</span>';
}
var ITEM_LABEL = {PENDING:'Being checked',AVAILABLE:'Available',RESERVED_ALREADY:'Reserved already',UNAVAILABLE:'Unavailable'};
var ITEM_COLOR = {PENDING:'#6b7280',AVAILABLE:'#10b981',RESERVED_ALREADY:'#f59e0b',UNAVAILABLE:'#ef4444'};

async function init(){
  try{
    var me = await (await fetch('/api/auth/me')).json();
    if(!me.ok){ location.href='/signin'; return; }
    ME = me.user;
    if(ME.referralCode){
      var link = location.origin + '/?ref=' + ME.referralCode;
      document.getElementById('refLink').value = link;
      document.getElementById('waShare').href = 'https://wa.me/?text=' + encodeURIComponent('Reserve & collect your pharmacy items here: ' + link);
      document.getElementById('referralCard').style.display='block';
    }
  }catch(e){ location.href='/signin'; return; }
  load();
}

async function load(){
  var box = document.getElementById('list');
  try{
    var data = await (await fetch('/api/reservations')).json();
    if(!data.ok){ box.innerHTML='<div class="card"><p class="muted">Could not load.</p></div>'; return; }
    if(data.reservations.length===0){
      box.innerHTML='<div class="card" style="text-align:center;"><p class="muted">No reservations yet.</p><a class="btn btn-primary" href="/reserve">Start a reservation</a></div>';
      return;
    }
    box.innerHTML = data.reservations.map(function(r){
      var items = (r.items||[]).map(function(it){
        return '<li>'+escapeText(it.item_name)+(it.quantity>1?' ×'+it.quantity:'')+' — <span style="color:'+(ITEM_COLOR[it.item_status]||'#6b7280')+';font-weight:700;">'+(ITEM_LABEL[it.item_status]||it.item_status)+'</span></li>';
      }).join('');
      var canCancel = (r.status!=='COLLECTED' && r.status!=='CANCELLED');
      return '<div class="card">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">'
        + '<div><b>'+escapeText(r.reference)+'</b> <span class="muted">· '+ (r.created_at||'').slice(0,10) +'</span></div>'
        + badge(r.status) + '</div>'
        + '<ul style="margin:10px 0;padding-left:18px;line-height:1.6;">'+items+'</ul>'
        + (r.notes?'<p class="muted">Note: '+escapeText(r.notes)+'</p>':'')
        + '<div class="row" style="margin-top:8px;">'
        + '<button type="button" class="btn btn-outline" style="flex:0 0 auto;" onclick="reorder(\\''+r.id+'\\')">Order again</button>'
        + (canCancel?'<button type="button" class="btn btn-danger" style="flex:0 0 auto;" onclick="cancelR(\\''+r.id+'\\')">Cancel</button>':'')
        + '</div></div>';
    }).join('');
  }catch(e){ box.innerHTML='<div class="card"><p class="muted">Could not load.</p></div>'; }
}

function escapeText(s){ var d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; }

async function reorder(id){
  if(!confirm('Create a new reservation with the same items? (Please re-attach any prescription photo.)')) return;
  try{
    var data = await (await fetch('/api/reservations/'+id+'/reorder',{method:'POST'})).json();
    if(data.ok){ alert('New reservation created: '+data.reference); load(); }
    else alert(data.reason||'Could not reorder.');
  }catch(e){ alert('Network error.'); }
}
async function cancelR(id){
  if(!confirm('Cancel this reservation?')) return;
  try{
    var data = await (await fetch('/api/reservations/'+id+'/cancel',{method:'POST'})).json();
    if(data.ok){ load(); } else alert(data.reason||'Could not cancel.');
  }catch(e){ alert('Network error.'); }
}
function copyRef(){ var el=document.getElementById('refLink'); el.select(); try{document.execCommand('copy');}catch(e){} }
async function logout(){ try{ await fetch('/api/auth/logout',{method:'POST'}); }catch(e){} location.href='/'; return false; }

init();
</script>`;
  return htmlDoc('My reservations — ' + env.PHARMACY_NAME, body);
}
