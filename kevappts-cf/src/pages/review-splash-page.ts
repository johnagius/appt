import type { Env } from '../types';

/**
 * Google-review splash page.
 *
 * Shown IN PLACE of the booking page when the admin turns on the REVIEW_SPLASH
 * toggle (mutually exclusive with DOCTOR_UNAVAILABLE). Instead of booking, it
 * warmly asks visitors to leave a Google review to help other travellers find
 * the pharmacy — with a QR code (and tap link) straight to the review form.
 *
 * Self-contained apart from the curated web fonts. The QR is inline SVG so it
 * always renders.
 */
export function reviewSplashPage(_env: Env): string {
  // Same Google place used by the review-request emails (services/email.ts).
  const reviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE';
  const hrefReview = reviewUrl.replace(/&/g, '&amp;');

  // Pre-rendered QR (error-correction M) encoding `reviewUrl`.
  const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 39" shape-rendering="crispEdges" role="img" aria-label="QR code to leave a Google review"><path fill="#ffffff" d="M0 0h39v39H0z"/><path stroke="#0f172a" d="M1 1.5h7m1 0h2m1 0h2m4 0h2m4 0h1m1 0h3m2 0h7M1 2.5h1m5 0h1m1 0h1m1 0h1m5 0h5m1 0h1m7 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h1m3 0h1m1 0h1m3 0h2m1 0h1m3 0h3m2 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m4 0h1m1 0h3m1 0h1m3 0h5m2 0h1m1 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h1m1 0h1m2 0h2m2 0h3m1 0h1m4 0h1m1 0h1m1 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m2 0h1m3 0h2m1 0h1m3 0h4m1 0h1m2 0h1m1 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M11 8.5h5m8 0h1m1 0h1m1 0h2M1 9.5h1m2 0h6m1 0h1m1 0h6m1 0h3m1 0h2m1 0h1m1 0h2m2 0h1m1 0h3M1 10.5h1m1 0h3m2 0h3m2 0h2m3 0h1m1 0h1m1 0h1m3 0h1m1 0h1m1 0h1m2 0h1m1 0h2M1 11.5h4m1 0h3m3 0h1m1 0h2m2 0h2m1 0h1m1 0h4m1 0h4m1 0h2m2 0h1M4 12.5h2m3 0h1m2 0h1m3 0h1m1 0h1m5 0h2m1 0h3m2 0h1m1 0h4M3 13.5h3m1 0h2m3 0h1m1 0h2m1 0h1m2 0h1m4 0h1m2 0h2m1 0h1m2 0h1m2 0h1M1 14.5h6m1 0h3m4 0h3m4 0h1m1 0h1m1 0h3m4 0h2m1 0h1M3 15.5h5m1 0h2m1 0h1m1 0h3m3 0h4m2 0h5m2 0h5M4 16.5h1m6 0h2m4 0h1m1 0h2m3 0h2m3 0h4m1 0h3M1 17.5h3m2 0h2m1 0h1m1 0h1m1 0h2m2 0h2m1 0h1m1 0h6m1 0h1m1 0h1m3 0h1M1 18.5h2m1 0h3m4 0h5m1 0h4m1 0h2m2 0h7m1 0h1M1 19.5h5m1 0h1m2 0h1m3 0h3m1 0h1m1 0h3m1 0h2m2 0h2m1 0h1m1 0h3m1 0h1M2 20.5h1m2 0h2m1 0h2m2 0h3m4 0h1m1 0h1m4 0h1m1 0h1m1 0h3m1 0h1m2 0h1M1 21.5h1m3 0h1m1 0h3m3 0h1m1 0h4m1 0h1m4 0h1m1 0h1m1 0h6M10 22.5h1m3 0h1m1 0h1m2 0h3m1 0h2m2 0h2m4 0h1m1 0h2M1 23.5h1m2 0h2m1 0h2m2 0h2m1 0h3m1 0h1m2 0h1m2 0h3m1 0h5m1 0h1m1 0h2M1 24.5h4m6 0h2m1 0h3m1 0h1m2 0h1m1 0h1m3 0h3m2 0h4M7 25.5h1m1 0h11m2 0h1m2 0h1m2 0h2m1 0h2m4 0h1M1 26.5h3m1 0h2m7 0h2m1 0h1m1 0h2m1 0h2m2 0h2m1 0h1m3 0h1M1 27.5h2m2 0h3m3 0h1m2 0h1m2 0h1m2 0h1m4 0h1m1 0h2m2 0h1m3 0h3M1 28.5h1m1 0h2m4 0h1m2 0h2m2 0h1m3 0h2m2 0h1m4 0h8M1 29.5h1m2 0h4m2 0h1m1 0h2m1 0h1m1 0h1m3 0h1m1 0h4m2 0h7M9 30.5h1m3 0h1m1 0h2m3 0h2m1 0h1m1 0h2m2 0h1m3 0h1m1 0h1M1 31.5h7m1 0h1m1 0h3m1 0h2m3 0h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h1m3 0h1M1 32.5h1m5 0h1m1 0h1m1 0h5m1 0h5m4 0h1m1 0h2m3 0h1m2 0h2M1 33.5h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h2m3 0h2m3 0h1m1 0h7m2 0h2M1 34.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1m1 0h1m3 0h1m2 0h1m3 0h2m3 0h1m1 0h1M1 35.5h1m1 0h3m1 0h1m2 0h2m2 0h1m1 0h2m1 0h1m1 0h1m2 0h2m2 0h1m4 0h1m1 0h1m1 0h1M1 36.5h1m5 0h1m2 0h6m1 0h4m3 0h1m4 0h2m2 0h5M1 37.5h7m1 0h1m2 0h1m3 0h2m2 0h2m2 0h2m3 0h4m1 0h1m2 0h1"/></svg>`;

  const stars = '<svg viewBox="0 0 24 24" fill="#f5b301"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f766e">
  <meta name="robots" content="noindex">
  <title>Leave us a review — Potter's Pharmacy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{
      --ink:#0f172a;--muted:#5b6b7c;--line:#e6ebf1;--card:#ffffff;
      --teal:#0f766e;--teal-soft:#e6f4f1;--amber:#f5b301;--radius:20px;
      --shadow:0 20px 50px -22px rgba(15,23,42,.30);
    }
    *{box-sizing:border-box;}
    html,body{margin:0;padding:0;height:100%;}
    body{
      font-family:"Inter",ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:var(--ink);-webkit-font-smoothing:antialiased;
      background:
        radial-gradient(1100px 640px at 12% -8%, #e8f5f2 0%, rgba(232,245,242,0) 60%),
        radial-gradient(1000px 620px at 108% 4%, #fff6df 0%, rgba(255,246,223,0) 55%),
        linear-gradient(180deg,#fbfdff 0%,#f4f7fb 100%);
      display:flex;align-items:stretch;justify-content:center;
      min-height:100dvh;
      padding:0 clamp(10px,2vw,22px);
    }
    body::before{
      content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%230f766e' stroke-opacity='0.05' stroke-width='2'%3E%3Cpath d='M30 22v16M22 30h16'/%3E%3C/g%3E%3C/svg%3E");
    }
    /* Fill the viewport: shell is a column, card grows to take the height. */
    .shell{position:relative;z-index:1;width:100%;max-width:1040px;min-height:100dvh;display:flex;flex-direction:column;}
    .brand{display:flex;align-items:center;gap:9px;justify-content:center;flex:0 0 auto;padding:12px 0 8px;}
    .brand .emblem{width:32px;height:32px;border-radius:9px;background:linear-gradient(140deg,#0f766e,#12b3a1);
      display:grid;place-items:center;box-shadow:0 8px 18px -6px rgba(15,118,110,.6);}
    .brand .emblem svg{width:18px;height:18px;}
    .brand .name{font-weight:700;letter-spacing:.02em;font-size:14px;color:#12433d;}
    .brand .name span{color:var(--amber);}

    .card{position:relative;flex:1 1 auto;display:flex;flex-direction:column;
      background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
      box-shadow:var(--shadow);overflow:hidden;margin-bottom:12px;}
    .card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;z-index:2;
      background:linear-gradient(90deg,var(--teal),var(--amber));}
    /* Portrait / narrow = one column; the teal panel grows to fill the height. */
    .split{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}

    .left{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
      padding:clamp(24px,4.5vw,48px) clamp(22px,5vw,48px) clamp(18px,3vw,28px);
      background:linear-gradient(180deg,#ffffff 0%,#f6fbfa 100%);}
    .left::before{content:"";position:absolute;inset:0;pointer-events:none;
      background:radial-gradient(560px 300px at 50% -8%, rgba(245,179,1,.12), transparent 60%);}
    .left > *{position:relative;z-index:1;}
    .badge{display:inline-flex;align-items:center;gap:7px;background:var(--teal-soft);color:#0b5c55;
      font-weight:600;font-size:12px;letter-spacing:.05em;text-transform:uppercase;padding:6px 13px;border-radius:999px;margin-bottom:14px;}
    .badge .dot{width:7px;height:7px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 3px rgba(245,179,1,.22);}
    .stars{display:flex;gap:5px;margin-bottom:14px;}
    .stars svg{width:clamp(26px,3.4vmin,34px);height:clamp(26px,3.4vmin,34px);filter:drop-shadow(0 3px 5px rgba(245,179,1,.35));}
    h1{font-family:"Fraunces",Georgia,serif;font-weight:500;font-optical-sizing:auto;
      font-size:clamp(26px,5vw,42px);line-height:1.08;margin:0 0 13px;letter-spacing:-.01em;color:#10322e;max-width:16ch;}
    .lede{font-size:clamp(14.5px,1.9vw,17px);line-height:1.58;color:var(--muted);margin:0;max-width:34em;}
    .lede .soft{color:var(--ink);font-weight:500;}
    .points{list-style:none;margin:20px 0 0;padding:0;display:flex;flex-direction:column;gap:11px;align-items:center;}
    .points li{display:flex;gap:10px;align-items:flex-start;text-align:left;font-size:clamp(13px,1.6vw,14.5px);
      color:#3a4a57;line-height:1.42;max-width:30em;}
    .points li .tick{flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:var(--teal-soft);
      display:grid;place-items:center;margin-top:1px;}
    .points li .tick svg{width:12px;height:12px;color:var(--teal);}
    .points li b{color:var(--ink);font-weight:600;}

    .right{position:relative;overflow:hidden;flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:15px;text-align:center;padding:clamp(26px,4vw,42px);color:#eafaf7;
      background:linear-gradient(158deg,#12776d 0%,#0c5a53 56%,#0a4e48 100%);border-top:1px solid rgba(255,255,255,.08);}
    /* warm + cool glows and a faint dot grid give the panel depth */
    .right::before{content:"";position:absolute;inset:0;pointer-events:none;
      background:
        radial-gradient(440px 300px at 82% 8%, rgba(245,179,1,.24), transparent 60%),
        radial-gradient(460px 340px at 6% 96%, rgba(23,205,184,.30), transparent 62%);}
    .right::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.6;
      background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.12) 1px, transparent 0);background-size:22px 22px;
      -webkit-mask-image:radial-gradient(72% 68% at 50% 44%, #000, transparent);mask-image:radial-gradient(72% 68% at 50% 44%, #000, transparent);}
    .right > *{position:relative;z-index:1;}
    /* White "Review us on Google" card with Google-coloured corners, floating
       on the teal panel. A faint tilted card peeks behind for a stacked look. */
    .gwrap{position:relative;display:inline-block;width:100%;max-width:min(94%,370px);}
    .gwrap::before{content:"";position:absolute;inset:0;background:#ffffff;border-radius:15px;
      transform:rotate(4.5deg) translate(-6px,4px);transform-origin:center;
      box-shadow:0 22px 44px -20px rgba(0,0,0,.55);opacity:.5;z-index:0;}
    .gcard{position:relative;z-index:1;overflow:hidden;background:#fff;border-radius:15px;text-align:center;transform:rotate(-2.5deg);
      aspect-ratio:4/5;display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:clamp(24px,4vw,38px) clamp(24px,4vw,36px);
      box-shadow:0 30px 60px -22px rgba(0,0,0,.6);}
    /* Corner triangles — exact reference geometry. Each is a full-card polygon
       layer (no border/gradient/opacity/radius). Paint order gives the overlaps:
       orange over red at the top, blue over green at the bottom. */
    .corner{position:absolute;inset:0;z-index:0;}
    .c-tl{background:#D82D1E;clip-path:polygon(0% 0%, 60.03% 0%, 0% 14.18%);}
    .c-tr{background:#FEA801;clip-path:polygon(58.44% 0%, 100% 0%, 100% 10.58%);}
    .c-bl{background:#008845;clip-path:polygon(0% 90.41%, 0% 100%, 44.84% 100%);}
    .c-br{background:#0056E4;clip-path:polygon(34.63% 100%, 100% 100%, 100% 84.55%);}
    .gcard > *:not(.corner){position:relative;z-index:1;}
    .g-kicker{font-size:clamp(11px,1.5vw,12.5px);font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#5f6368;margin:0 0 4px;}
    .glogo{font-family:"Inter",Arial,sans-serif;font-weight:700;font-size:clamp(30px,6.2vw,42px);letter-spacing:-1.5px;line-height:1.05;margin:0 0 8px;}
    .gstars{display:flex;justify-content:center;gap:5px;margin:0 0 9px;}
    .gstars svg{width:clamp(21px,3.7vw,26px);height:clamp(21px,3.7vw,26px);filter:drop-shadow(0 2px 4px rgba(245,179,1,.4));}
    .g-scan{font-size:clamp(12px,1.6vw,13.5px);font-weight:600;color:#3c4043;margin:0 0 10px;line-height:1.4;padding:0 8%;}
    .g-qr{width:clamp(126px,18vmin,150px);height:clamp(126px,18vmin,150px);margin:0 auto;}
    .g-qr svg{width:100%;height:100%;display:block;}
    .cta{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(180deg,#ffce4d,#f5b301);color:#0a3f39;
      text-decoration:none;font-weight:700;font-size:clamp(14px,1.8vw,16px);padding:13px 26px;border-radius:12px;
      transition:transform .12s ease,box-shadow .12s ease;
      box-shadow:0 16px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.55);}
    .cta:hover{transform:translateY(-1px);box-shadow:0 20px 38px -12px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.55);}
    .cta svg{width:17px;height:17px;}

    /* Landscape (wide & short) = two compact columns side by side. */
    @media (orientation:landscape) and (min-width:760px){
      .split{display:grid;grid-template-columns:1.08fr 0.92fr;}
      .left{text-align:left;align-items:flex-start;padding:clamp(20px,2.8vw,34px) clamp(22px,3vw,38px);}
      .stars svg{width:26px;height:26px;}
      h1{font-size:clamp(24px,3.2vw,36px);max-width:none;}
      .lede{font-size:clamp(14px,1.55vw,16px);}
      .points{align-items:flex-start;}
      .points li{font-size:13px;}
      .right{border-top:0;gap:16px;padding:clamp(22px,3vw,36px);}
      .gwrap{max-width:326px;}
      .glogo{font-size:clamp(26px,3.2vw,36px);}
      .gstars svg{width:23px;height:23px;}
      .g-qr{width:clamp(118px,13vw,140px);height:clamp(118px,13vw,140px);}
      .cta{font-size:14px;padding:12px 22px;}
    }

    .foot{flex:0 0 auto;text-align:center;padding:11px 20px;color:#8a97a4;font-size:12px;line-height:1.5;
      border-top:1px solid var(--line);background:#fff;}
    .foot b{color:#5b6b7c;font-weight:600;}
  </style>
</head>
<body>
  <div class="shell">
    <div class="brand">
      <span class="emblem" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="#fff"/></svg>
      </span>
      <span class="name">Potter&rsquo;s <span>Pharmacy</span></span>
    </div>

    <div class="card">
      <div class="split">
        <div class="left">
          <div class="badge"><span class="dot"></span>We&rsquo;d love your feedback</div>
          <h1>Help other travellers find us</h1>
          <p class="lede">
            If we&rsquo;ve looked after you well, <span class="soft">please leave us a Google review.</span>
            A minute of your time helps other travellers and visitors find a <span class="soft">trusted doctor and pharmacy</span> in St Julian&rsquo;s.
          </p>
          <ul class="points">
            <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span><span>Scan the code or tap the button &mdash; <b>it takes under a minute</b>.</span></li>
            <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span><span>Your words help someone far from home find <b>the right care</b>.</span></li>
          </ul>
        </div>

        <div class="right">
          <div class="gwrap">
            <div class="gcard">
              <span class="corner c-tl"></span><span class="corner c-tr"></span><span class="corner c-bl"></span><span class="corner c-br"></span>
              <p class="g-kicker">Review us on</p>
              <div class="glogo" aria-label="Google"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></div>
              <div class="gstars" aria-hidden="true">${stars}${stars}${stars}${stars}${stars}</div>
              <p class="g-scan">Scan the QR code to leave us a review</p>
              <div class="g-qr">${qrSvg}</div>
            </div>
          </div>
          <a class="cta" href="${hrefReview}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
            Leave a Google review
          </a>
        </div>
      </div>

      <div class="foot">
        <b>Potter&rsquo;s Pharmacy</b> &middot; St Julian&rsquo;s, Malta &mdash; thank you for your kindness.
      </div>
    </div>
  </div>
</body>
</html>`;
}
