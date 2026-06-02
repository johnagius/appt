import type { Env, User } from '../types';
import { escapeHtml } from '../services/utils';
import { htmlDoc, topBar, footer, icon } from './shared';

export function ordersPage(env: Env, user: User): string {
  const base = env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const shareUrl = user.referral_code ? base + '/?ref=' + user.referral_code : base;
  const shareText = "Reserve & collect your pharmacy items at " + env.PHARMACY_NAME + ": " + shareUrl;
  const waHref = 'https://wa.me/?text=' + encodeURIComponent(shareText);
  const mailHref = 'mailto:?subject=' + encodeURIComponent(env.PHARMACY_NAME + ' — Reserve & Collect') + '&body=' + encodeURIComponent(shareText);
  const reviewUrl = (env.REVIEW_URL && env.REVIEW_URL.trim())
    || ('https://www.google.com/search?q=' + encodeURIComponent(env.PHARMACY_NAME + ' reviews'));
  const shareCard = `
  <div class="card hero">
    <div class="eyebrow">${icon('star', 15)} Enjoying ${escapeHtml(env.PHARMACY_NAME)}?</div>
    <h2 style="margin-bottom:8px;">Leave a review &amp; share with friends</h2>
    <div class="row">
      <a class="btn btn-primary block review-cta" target="_blank" rel="noopener" href="${escapeHtml(reviewUrl)}">${icon('star', 18)} Leave a Google review</a>
    </div>
    <p class="muted" style="margin:14px 0 6px;">Tell a friend they can reserve &amp; collect here too:</p>
    <div class="row">
      <a class="btn btn-good" target="_blank" rel="noopener" href="${escapeHtml(waHref)}">${icon('phone', 16)} WhatsApp</a>
      <a class="btn btn-outline" href="${escapeHtml(mailHref)}">${icon('mail', 16)} Email</a>
      <button type="button" class="btn btn-outline" onclick="copyRef()">Copy link</button>
    </div>
    <input type="text" id="refLink" value="${escapeHtml(shareUrl)}" readonly style="margin-top:8px;">
  </div>`;

  const body = `
${topBar(env, user)}
<div class="wrap">
  <div class="card">
    <div class="eyebrow">${icon('box', 15)} Your account</div>
    <h1>My reservations</h1>
    <p class="lead" style="margin:0;">Track your reservations and re-order in one tap. We always email you when something's ready to collect.</p>
    <a class="btn btn-primary" href="/reserve" style="margin-top:14px;">${icon('plus', 18)} New reservation</a>
  </div>
  ${shareCard}
  <div id="list"><div class="card"><p class="muted">Loading…</p></div></div>
</div>
${footer(env)}
<script>
var ITEM_LABEL={PENDING:'Being checked',AVAILABLE:'Available',RESERVED_ALREADY:'Reserved already',UNAVAILABLE:'Unavailable'};
var ITEM_COLOR={PENDING:'#6b7280',AVAILABLE:'#10b981',RESERVED_ALREADY:'#f59e0b',UNAVAILABLE:'#ef4444'};
var SLAB={SUBMITTED:'Submitted',ACCEPTED:'Accepted',READY_FOR_COLLECTION:'Ready to collect',COLLECTED:'Collected',PARTIALLY_UNAVAILABLE:'Partially available',CANCELLED:'Cancelled'};
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
function badge(s){return '<span class="badge b-'+s+'">'+(SLAB[s]||s)+'</span>';}
async function load(){
  var box=document.getElementById('list');
  try{
    var data=await (await fetch('/api/reservations')).json();
    if(!data.ok){box.innerHTML='<div class="card"><p class="muted">Could not load.</p></div>';return;}
    if(data.reservations.length===0){box.innerHTML='<div class="card" style="text-align:center;"><p class="muted">No reservations yet.</p><a class="btn btn-primary" href="/reserve">Start a reservation</a></div>';return;}
    box.innerHTML=data.reservations.map(function(r){
      var items=(r.items||[]).map(function(it){return '<li>'+esc(it.item_name)+(it.quantity>1?' ×'+it.quantity:'')+' — <span style="color:'+(ITEM_COLOR[it.item_status]||'#6b7280')+';font-weight:700;">'+(ITEM_LABEL[it.item_status]||it.item_status)+'</span></li>';}).join('');
      var canCancel=(r.status!=='COLLECTED'&&r.status!=='CANCELLED');
      return '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">'
        +'<div><b style="font-size:16px;">'+esc(r.reference)+'</b> <span class="muted">· '+(r.created_at||'').slice(0,10)+'</span></div>'+badge(r.status)+'</div>'
        +'<ul style="margin:10px 0;padding-left:18px;line-height:1.7;">'+items+'</ul>'
        +(r.notes?'<p class="muted">Note: '+esc(r.notes)+'</p>':'')
        +'<div class="row" style="margin-top:8px;">'
        +'<button type="button" class="btn btn-outline" style="flex:0 0 auto;" onclick="reorder(\\''+r.id+'\\')">Order again</button>'
        +(canCancel?'<button type="button" class="btn btn-danger" style="flex:0 0 auto;" onclick="cancelR(\\''+r.id+'\\')">Cancel</button>':'')
        +'</div></div>';
    }).join('');
  }catch(e){box.innerHTML='<div class="card"><p class="muted">Could not load.</p></div>';}
}
async function reorder(id){
  if(!confirm('Create a new reservation with the same items? (Please re-attach any prescription photo.)'))return;
  try{var data=await (await fetch('/api/reservations/'+id+'/reorder',{method:'POST'})).json();
    if(data.ok){alert('New reservation created: '+data.reference);load();}else alert(data.reason||'Could not reorder.');}catch(e){alert('Network error.');}
}
async function cancelR(id){
  if(!confirm('Cancel this reservation?'))return;
  try{var data=await (await fetch('/api/reservations/'+id+'/cancel',{method:'POST'})).json();
    if(data.ok){load();}else alert(data.reason||'Could not cancel.');}catch(e){alert('Network error.');}
}
function copyRef(){var el=document.getElementById('refLink');if(!el)return;el.select();try{document.execCommand('copy');}catch(e){}}
load();
</script>`;
  return htmlDoc('My reservations — ' + env.PHARMACY_NAME, body);
}
