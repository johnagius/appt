import type { Env } from '../types';
import { htmlDoc, topBar } from './shared';

export function verifyPage(env: Env): string {
  const body = `
${topBar(env)}
<div class="wrap" style="max-width:440px;">
  <div class="card">
    <h1>Enter your code</h1>
    <p class="lead">We emailed a 6-digit code to <b id="emailLabel"></b>. Enter it below to finish signing in. The code expires in 10 minutes.</p>
    <form id="verifyForm" onsubmit="return verify(event)">
      <label for="code">6-digit code</label>
      <input type="text" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="font-size:24px;letter-spacing:8px;text-align:center;" required>
      <div class="err" id="err"></div>
      <button type="submit" class="btn btn-primary block" id="verifyBtn" style="margin-top:12px;">Verify &amp; continue</button>
    </form>
    <p class="muted" style="margin-top:14px;"><a href="#" onclick="return resend()">Resend code</a> · <a href="/signin">Use a different email</a></p>
    <div class="ok" id="okMsg"></div>
  </div>
</div>
<script>
var params = new URLSearchParams(location.search);
var email = params.get('email') || '';
document.getElementById('emailLabel').textContent = email || 'your email';
if(!email){ location.href = '/signin'; }

async function verify(e){
  e.preventDefault();
  var code = document.getElementById('code').value.trim();
  var btn = document.getElementById('verifyBtn');
  var err = document.getElementById('err'); err.textContent='';
  if(!/^\\d{6}$/.test(code)){ err.textContent='Enter the 6-digit code.'; return false; }
  btn.disabled=true; btn.textContent='Verifying…';
  try{
    var res = await fetch('/api/auth/email/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,code:code})});
    var data = await res.json();
    if(data.ok){ location.href = data.redirect || '/reserve'; }
    else { err.textContent = data.reason || 'Could not verify.'; btn.disabled=false; btn.textContent='Verify & continue'; }
  }catch(ex){ err.textContent='Network error. Please try again.'; btn.disabled=false; btn.textContent='Verify & continue'; }
  return false;
}
async function resend(){
  var ok = document.getElementById('okMsg'); ok.textContent='';
  try{
    var res = await fetch('/api/auth/email/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})});
    var data = await res.json();
    if(data.ok){ ok.textContent='A new code is on its way.'; }
  }catch(ex){}
  return false;
}
</script>`;
  return htmlDoc('Verify — ' + env.PHARMACY_NAME, body);
}
