import type { Env } from '../types';
import { escapeHtml } from '../services/utils';
import { htmlDoc, topBar } from './shared';

export function indexPage(env: Env): string {
  const appts = env.APPOINTMENTS_URL;
  const body = `
${topBar(env, '<a href="/signin">Sign in</a>')}
<div class="wrap">

  <div class="card hero">
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
      <div style="flex:1;min-width:220px;">
        <h2 style="margin:0 0 6px;">🩺 Need to see the doctor, physio or book a blood test?</h2>
        <p class="muted" style="margin:0 0 12px;">Book an appointment at ${escapeHtml(env.PHARMACY_NAME)} — doctor visits, physiotherapy, blood tests and phone consults.</p>
        <a class="btn btn-blue" href="${escapeHtml(appts)}">Go to the appointment booking →</a>
      </div>
    </div>
  </div>

  <div class="card">
    <h1>Reserve &amp; Collect</h1>
    <p class="lead">Reserve your pharmacy items online and collect them in-store when they're ready — no queueing, no guessing if we have it in stock. You can add a photo of the item or your prescription to help us find exactly what you need.</p>
    <a class="btn btn-primary block" href="/reserve" style="font-size:16px;">Start a reservation</a>
    <p class="muted" style="text-align:center;margin-top:10px;">You'll sign in and verify your email first — it takes a few seconds.</p>
  </div>

  <div class="card">
    <h2>How it works</h2>
    <ol style="margin:0;padding-left:20px;color:#374151;line-height:1.7;">
      <li><b>Sign in &amp; verify</b> with Google or your email address.</li>
      <li><b>Tell us what you need</b> — type the item(s), add a photo of the product or prescription if it helps.</li>
      <li><b>We check &amp; confirm</b> — each item is marked available, reserved, or unavailable.</li>
      <li><b>Collect in-store</b> — we email you as soon as it's ready, with your collection reference.</li>
    </ol>
    <div class="hint" style="margin-top:14px;">Collection only — we don't deliver. Payment is taken in-store at collection. For prescription-only medicines, bring a valid prescription when you collect.</div>
  </div>

  <div class="card" style="text-align:center;">
    <p class="muted" style="margin:0 0 8px;">Looking for medical care instead of products?</p>
    <a class="btn btn-outline" href="${escapeHtml(appts)}">Book a doctor, physio or blood test appointment</a>
  </div>

</div>
<script>
  // Capture a referral code from ?ref= so we can credit it at sign-up.
  (function(){
    try{
      var p = new URLSearchParams(location.search);
      var ref = p.get('ref');
      if(ref){ document.cookie = 'rc_ref=' + encodeURIComponent(ref.replace(/[^a-zA-Z0-9]/g,'')) + '; path=/; max-age=2592000; SameSite=Lax'; }
    }catch(e){}
  })();
</script>`;
  return htmlDoc(env.PHARMACY_NAME + ' — Reserve & Collect', body);
}
