import type { Env } from '../types';
import { escapeHtml } from '../services/utils';
import { htmlDoc, topBar } from './shared';

export function reservePage(env: Env): string {
  const body = `
${topBar(env, '<a href="/orders">My reservations</a> &nbsp; <a href="#" onclick="return logout()">Sign out</a>')}
<div class="wrap">

  <div id="formView">
    <div class="card">
      <h1>Reserve your items</h1>
      <p class="lead">Tell us what you'd like to reserve. Add a photo of the product or your prescription if it helps us find the right item. We'll check stock and email you when it's ready to collect.</p>
    </div>

    <div class="card">
      <h2>What would you like to reserve?</h2>
      <div id="items"></div>
      <button type="button" class="btn btn-outline" onclick="addItem()" style="margin-top:6px;">+ Add another item</button>
    </div>

    <div class="card">
      <h2>Add a photo <span class="muted" style="font-weight:600;">(optional)</span></h2>
      <p class="muted">A photo of the box/product or your prescription helps us match exactly what you need.</p>
      <div class="row">
        <label style="flex:0 0 auto;"><input type="radio" name="kind" value="item" checked> Item / product</label>
        <label style="flex:0 0 auto;"><input type="radio" name="kind" value="prescription"> Prescription</label>
      </div>
      <label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-weight:600;">
        <input type="checkbox" id="consent" style="width:auto;margin-top:3px;">
        <span>I agree to ${escapeHtml(env.PHARMACY_NAME)} storing the photo(s) I upload to process my reservation. Photos are kept private and deleted within 90 days of collection.</span>
      </label>
      <input type="file" id="file" accept="image/*" capture="environment" style="margin-top:10px;" onchange="uploadPhoto()">
      <div class="err" id="photoErr"></div>
      <div id="thumbs" class="row" style="margin-top:10px;"></div>
    </div>

    <div class="card">
      <h2>Your details</h2>
      <div class="row">
        <div><label for="name">Full name</label><input type="text" id="name" placeholder="Your name"></div>
        <div><label for="phone">Phone <span class="muted" style="font-weight:600;">(optional)</span></label><input type="tel" id="phone" placeholder="For collection contact"></div>
      </div>
      <label for="notes">Notes for the pharmacist <span class="muted" style="font-weight:600;">(optional)</span></label>
      <textarea id="notes" placeholder="e.g. the blue one, 500mg, brand preference…"></textarea>
      <div class="row">
        <div><label for="prefDay">Preferred collection day <span class="muted" style="font-weight:600;">(optional)</span></label><input type="text" id="prefDay" placeholder="e.g. Tomorrow, Saturday"></div>
        <div><label for="prefTime">Preferred time <span class="muted" style="font-weight:600;">(optional)</span></label><input type="text" id="prefTime" placeholder="e.g. Afternoon"></div>
      </div>
      <div class="hint" style="margin-top:12px;">Collection only — we don't deliver. You pay in-store when you collect.</div>
    </div>

    <div class="card">
      <div class="err" id="err"></div>
      <button type="button" class="btn btn-primary block" id="submitBtn" onclick="submitReservation()" style="font-size:16px;">Submit reservation</button>
    </div>
  </div>

  <div id="doneView" style="display:none;">
    <div class="card" style="text-align:center;">
      <div style="font-size:46px;">✅</div>
      <h1>Reservation submitted</h1>
      <p class="lead">Thanks! We've emailed you a confirmation. We'll let you know as soon as your items are ready to collect.</p>
      <p style="font-size:15px;">Your collection reference:</p>
      <div style="font-size:30px;font-weight:900;letter-spacing:2px;margin:6px 0 16px;" id="refOut"></div>
      <a class="btn btn-blue" href="/orders">View my reservations</a>
      <button type="button" class="btn btn-outline" onclick="location.reload()" style="margin-left:8px;">Reserve more</button>
    </div>
  </div>

</div>
<script>
var photos = [];

async function init(){
  try{
    var res = await fetch('/api/auth/me'); var data = await res.json();
    if(!data.ok){ location.href = '/signin'; return; }
    document.getElementById('name').value = data.user.name || '';
    document.getElementById('phone').value = data.user.phone || '';
  }catch(e){ location.href='/signin'; return; }
  addItem();
}

function addItem(name, qty){
  var wrap = document.getElementById('items');
  var div = document.createElement('div');
  div.className = 'row';
  div.style.marginBottom = '8px';
  div.innerHTML = '<div style="flex:3;"><input type="text" class="itemName" placeholder="Item name or description" value="'+(name?String(name).replace(/"/g,'&quot;'):'')+'"></div>'
    + '<div style="flex:0 0 90px;min-width:80px;"><input type="number" class="itemQty" min="1" max="99" value="'+(qty||1)+'"></div>'
    + '<button type="button" class="btn btn-outline" style="flex:0 0 auto;" onclick="this.parentNode.remove()">✕</button>';
  wrap.appendChild(div);
}

async function uploadPhoto(){
  var input = document.getElementById('file');
  var err = document.getElementById('photoErr'); err.textContent='';
  if(!input.files || !input.files[0]) return;
  if(!document.getElementById('consent').checked){
    err.textContent = 'Please tick the consent box before adding a photo.';
    input.value=''; return;
  }
  var kind = document.querySelector('input[name=kind]:checked').value;
  var fd = new FormData();
  fd.append('file', input.files[0]);
  fd.append('kind', kind);
  err.textContent = 'Uploading…';
  try{
    var res = await fetch('/api/photos', {method:'POST', body: fd});
    var data = await res.json();
    if(data.ok){ photos.push({id:data.photoId, kind:kind}); err.textContent=''; renderThumbs(); }
    else { err.textContent = data.reason || 'Upload failed.'; }
  }catch(e){ err.textContent='Upload failed. Please try again.'; }
  input.value='';
}

function renderThumbs(){
  var t = document.getElementById('thumbs'); t.innerHTML='';
  photos.forEach(function(p, i){
    var d = document.createElement('div');
    d.style.cssText='flex:0 0 auto;text-align:center;';
    d.innerHTML = '<img class="thumb" src="/api/photos/'+p.id+'" alt="">'
      + '<div class="muted" style="font-size:11px;">'+(p.kind==='prescription'?'Rx':'Item')+'</div>'
      + '<button type="button" class="btn btn-outline" style="padding:2px 8px;font-size:12px;margin-top:2px;" onclick="removePhoto('+i+')">remove</button>';
    t.appendChild(d);
  });
}
function removePhoto(i){ photos.splice(i,1); renderThumbs(); }

async function submitReservation(){
  var err = document.getElementById('err'); err.textContent='';
  var names = document.querySelectorAll('.itemName');
  var qtys = document.querySelectorAll('.itemQty');
  var items = [];
  for(var i=0;i<names.length;i++){
    var n = names[i].value.trim();
    if(n) items.push({name:n, quantity: parseInt(qtys[i].value,10)||1});
  }
  if(items.length===0){ err.textContent='Please add at least one item.'; return; }
  var name = document.getElementById('name').value.trim();
  if(!name){ err.textContent='Please enter your name.'; return; }
  var btn = document.getElementById('submitBtn'); btn.disabled=true; btn.textContent='Submitting…';
  var payload = {
    items: items,
    name: name,
    phone: document.getElementById('phone').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    preferredDay: document.getElementById('prefDay').value.trim(),
    preferredTime: document.getElementById('prefTime').value.trim(),
    photoIds: photos.map(function(p){return p.id;})
  };
  try{
    var res = await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    var data = await res.json();
    if(data.ok){
      document.getElementById('refOut').textContent = data.reference;
      document.getElementById('formView').style.display='none';
      document.getElementById('doneView').style.display='block';
      window.scrollTo(0,0);
    } else { err.textContent = data.reason || 'Could not submit.'; btn.disabled=false; btn.textContent='Submit reservation'; }
  }catch(e){ err.textContent='Network error. Please try again.'; btn.disabled=false; btn.textContent='Submit reservation'; }
}

async function logout(){ try{ await fetch('/api/auth/logout',{method:'POST'}); }catch(e){} location.href='/'; return false; }

init();
</script>`;
  return htmlDoc('Reserve — ' + env.PHARMACY_NAME, body);
}
