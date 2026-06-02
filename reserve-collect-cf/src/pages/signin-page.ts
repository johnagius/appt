import type { Env } from '../types';
import { htmlDoc, topBar } from './shared';

export function signinPage(env: Env): string {
  const googleEnabled = !!env.GOOGLE_CLIENT_ID;
  const googleBtn = googleEnabled ? `
    <a class="btn btn-outline block" href="/api/auth/google/start" style="margin-bottom:14px;">
      <svg width="18" height="18" viewBox="0 0 48 48" style="vertical-align:middle"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.8-9.7 6.8-17.4z"/><path fill="#FBBC05" d="M10.4 28.4c-.5-1.5-.8-3.1-.8-4.9s.3-3.4.8-4.9l-7.9-6.1C.9 16.1 0 19.9 0 24s.9 7.9 2.5 11.5l7.9-7.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.4 0-11.7-3.7-13.6-9.4l-7.9 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
      Continue with Google
    </a>
    <div style="text-align:center;color:#9ca3af;font-size:13px;margin:6px 0 14px;">or use your email</div>` : '';

  const body = `
${topBar(env)}
<div class="wrap" style="max-width:440px;">
  <div class="card">
    <h1>Sign in</h1>
    <p class="lead">To reserve items we first verify your email — it keeps reservations linked to you and prevents spam.</p>
    ${googleBtn}
    <form id="emailForm" onsubmit="return requestCode(event)">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" placeholder="you@example.com" autocomplete="email" required>
      <div class="err" id="err"></div>
      <button type="submit" class="btn btn-primary block" id="sendBtn" style="margin-top:12px;">Email me a sign-in code</button>
    </form>
    <p class="muted" style="margin-top:14px;">We'll send a 6-digit code that both signs you in and verifies your email. No password needed.</p>
  </div>
  <p class="muted" style="text-align:center;"><a href="/">← Back</a></p>
</div>
<script>
async function requestCode(e){
  e.preventDefault();
  var email = document.getElementById('email').value.trim();
  var btn = document.getElementById('sendBtn');
  var err = document.getElementById('err'); err.textContent = '';
  if(!email){ err.textContent='Please enter your email.'; return false; }
  btn.disabled = true; btn.textContent = 'Sending…';
  try{
    var res = await fetch('/api/auth/email/request', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})});
    var data = await res.json();
    if(data.ok){ location.href = '/verify?email=' + encodeURIComponent(email); }
    else { err.textContent = data.reason || 'Something went wrong.'; btn.disabled=false; btn.textContent='Email me a sign-in code'; }
  }catch(ex){ err.textContent='Network error. Please try again.'; btn.disabled=false; btn.textContent='Email me a sign-in code'; }
  return false;
}
</script>`;
  return htmlDoc('Sign in — ' + env.PHARMACY_NAME, body);
}
