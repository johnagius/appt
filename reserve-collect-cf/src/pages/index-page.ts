import type { Env, User } from '../types';
import { escapeHtml } from '../services/utils';
import { htmlDoc, topBar, footer, icon } from './shared';

export function indexPage(env: Env, user?: User | null): string {
  const appts = escapeHtml(env.APPOINTMENTS_URL);
  const reviewUrl = (env.REVIEW_URL && env.REVIEW_URL.trim())
    || ('https://www.google.com/search?q=' + encodeURIComponent(env.PHARMACY_NAME + ' reviews'));

  // Primary CTA adapts to login state.
  const primary = user
    ? `<a class="btn btn-primary block" href="/reserve" style="font-size:16.5px;">${icon('bag', 20)} Start a reservation</a>
       <p class="muted" style="text-align:center;margin-top:12px;">Signed in as <b>${escapeHtml(user.email)}</b> · <a href="/orders">View my reservations</a></p>`
    : `<a class="btn btn-primary block" href="/reserve" style="font-size:16.5px;">${icon('bag', 20)} Start a reservation</a>
       <div style="display:flex;align-items:center;gap:10px;margin:14px 2px 2px;color:#94a3b8;font-size:13px;">
         <span style="flex:1;height:1px;background:var(--line);"></span>already a customer?<span style="flex:1;height:1px;background:var(--line);"></span>
       </div>
       <a class="btn btn-outline block" href="/signin" style="margin-top:10px;">${icon('user', 18)} Sign in to your account</a>
       <p class="muted" style="text-align:center;margin-top:10px;">New here? "Start a reservation" sets you up in seconds.</p>`;

  const body = `
${topBar(env, user)}
<div class="wrap">

  <div class="card hero">
    <div class="eyebrow">${icon('health', 16)} One-stop shop</div>
    <h2 style="font-size:21px;">Need to see the doctor, physio or book a blood test?</h2>
    <p class="muted" style="margin:0 0 14px;">Book an appointment at ${escapeHtml(env.PHARMACY_NAME)} — doctor visits, physiotherapy, blood tests and phone consults.</p>
    <a class="btn btn-blue" href="${appts}">Go to appointment booking ${icon('arrow', 18)}</a>
  </div>

  <div class="card">
    <div class="eyebrow">${icon('bag', 16)} Reserve &amp; Collect</div>
    <h1>Reserve your pharmacy items, collect in-store.</h1>
    <p class="lead">No queueing, no guessing whether we have it in stock. Tell us what you need, add a photo of the product or your prescription if it helps, and we'll have it ready for you to pick up — and email you the moment it is.</p>
    ${primary}
    <div class="badges" style="margin-top:18px;">
      <span class="pill">${icon('lock', 15)} Verified email</span>
      <span class="pill">${icon('shield', 15)} Private photos</span>
      <span class="pill">${icon('box', 15)} Collection only</span>
      <span class="pill">${icon('mail', 15)} Email when ready</span>
    </div>
  </div>

  <div class="card hero" style="text-align:center;border-color:#fde68a;">
    <div class="eyebrow" style="justify-content:center;">${icon('star', 16)} Love ${escapeHtml(env.PHARMACY_NAME)}?</div>
    <h2 style="margin:4px 0 8px;">Leave us a quick Google review</h2>
    <p class="muted" style="margin:0 auto 16px;max-width:460px;">⭐⭐⭐⭐⭐ It takes 10 seconds and genuinely helps our pharmacy. Thank you!</p>
    <a class="btn btn-primary review-cta" target="_blank" rel="noopener" href="${escapeHtml(reviewUrl)}">${icon('star', 18)} Leave a Google review</a>
  </div>

  <div class="card">
    <h2>How it works</h2>
    <div class="steps">
      <div class="step"><span class="num">${icon('user', 18)}</span><div><b>Sign in &amp; verify</b><span class="muted">Google or your email — a quick code keeps it secure.</span></div></div>
      <div class="step"><span class="num">${icon('camera', 18)}</span><div><b>Tell us what you need</b><span class="muted">Type the item(s); add a photo of the product or prescription.</span></div></div>
      <div class="step"><span class="num">${icon('check', 18)}</span><div><b>We check &amp; confirm</b><span class="muted">Each item is marked available, reserved, or unavailable.</span></div></div>
      <div class="step"><span class="num">${icon('box', 18)}</span><div><b>Collect in-store</b><span class="muted">We email you when it's ready, with your collection reference.</span></div></div>
    </div>
    <div class="hint" style="margin-top:16px;">${icon('clock', 16)}<div>Collection only — we don't deliver. You pay in-store at collection. For prescription-only medicines, bring a valid prescription.</div></div>
  </div>

</div>
${footer(env)}
<script>
  // Capture a referral code from ?ref= so we can credit it at sign-up.
  (function(){try{var p=new URLSearchParams(location.search);var ref=p.get('ref');
    if(ref){document.cookie='rc_ref='+encodeURIComponent(ref.replace(/[^a-zA-Z0-9]/g,''))+'; path=/; max-age=2592000; SameSite=Lax';}}catch(e){}})();
</script>`;
  return htmlDoc(env.PHARMACY_NAME + ' — Reserve & Collect', body);
}
