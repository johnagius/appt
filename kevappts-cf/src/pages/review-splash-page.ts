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
      display:flex;align-items:center;justify-content:center;
      padding:clamp(8px,1.4vw,18px) clamp(10px,2vw,22px);
    }
    body::before{
      content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%230f766e' stroke-opacity='0.05' stroke-width='2'%3E%3Cpath d='M30 22v16M22 30h16'/%3E%3C/g%3E%3C/svg%3E");
    }
    .shell{position:relative;z-index:1;width:100%;max-width:940px;}
    .brand{display:flex;align-items:center;gap:9px;justify-content:center;margin:0 0 7px;}
    .brand .emblem{width:32px;height:32px;border-radius:9px;background:linear-gradient(140deg,#0f766e,#12b3a1);
      display:grid;place-items:center;box-shadow:0 8px 18px -6px rgba(15,118,110,.6);}
    .brand .emblem svg{width:18px;height:18px;}
    .brand .name{font-weight:700;letter-spacing:.02em;font-size:14px;color:#12433d;}
    .brand .name span{color:var(--amber);}

    .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
      box-shadow:var(--shadow);overflow:hidden;}
    .split{display:grid;grid-template-columns:1fr;}
    @media (min-width:800px){ .split{grid-template-columns:1.08fr 0.92fr;} }

    .left{position:relative;padding:clamp(18px,2.6vw,30px) clamp(20px,3vw,34px);}
    .left::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:4px;
      background:linear-gradient(90deg,var(--teal),var(--amber));}
    @media (min-width:800px){ .left::after{left:auto;top:0;bottom:0;right:-1px;width:4px;height:auto;
      background:linear-gradient(180deg,var(--teal),var(--amber));} }

    .badge{display:inline-flex;align-items:center;gap:7px;background:var(--teal-soft);color:#0b5c55;
      font-weight:600;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:12px;}
    .badge .dot{width:7px;height:7px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 3px rgba(245,179,1,.22);}
    .stars{display:flex;gap:4px;margin-bottom:12px;}
    .stars svg{width:26px;height:26px;filter:drop-shadow(0 3px 5px rgba(245,179,1,.35));}
    h1{font-family:"Fraunces",Georgia,serif;font-weight:500;font-optical-sizing:auto;
      font-size:clamp(24px,3.2vw,36px);line-height:1.07;margin:0 0 11px;letter-spacing:-.01em;color:#10322e;}
    .lede{font-size:clamp(14px,1.55vw,16px);line-height:1.55;color:var(--muted);margin:0;}
    .lede .soft{color:var(--ink);font-weight:500;}
    .points{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:9px;}
    .points li{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:#3a4a57;line-height:1.4;}
    .points li .tick{flex:0 0 auto;width:21px;height:21px;border-radius:50%;background:var(--teal-soft);
      display:grid;place-items:center;margin-top:1px;}
    .points li .tick svg{width:12px;height:12px;color:var(--teal);}
    .points li b{color:var(--ink);font-weight:600;}

    .right{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;
      padding:clamp(20px,3vw,30px);background:#fbfdff;border-top:1px solid var(--line);}
    @media (min-width:800px){ .right{border-top:0;border-left:1px solid var(--line);} }
    .qrbox{width:clamp(150px,20vw,190px);height:clamp(150px,20vw,190px);background:#fff;border:1px solid var(--line);
      border-radius:16px;padding:12px;box-shadow:0 14px 30px -16px rgba(15,23,42,.45);}
    .qrbox svg{width:100%;height:100%;display:block;}
    .scan{font-size:12.5px;color:var(--muted);margin:0;}
    .scan b{color:var(--ink);font-weight:600;}
    .cta{display:inline-flex;align-items:center;gap:9px;background:var(--teal);color:#fff;text-decoration:none;
      font-weight:600;font-size:14px;padding:11px 20px;border-radius:11px;transition:transform .12s ease,box-shadow .12s ease;
      box-shadow:0 12px 24px -12px rgba(15,118,110,.8);}
    .cta:hover{transform:translateY(-1px);box-shadow:0 16px 30px -12px rgba(15,118,110,.85);}
    .cta svg{width:16px;height:16px;}

    .foot{text-align:center;padding:9px 20px;color:#8a97a4;font-size:11.5px;line-height:1.5;
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
          <div class="stars" aria-hidden="true">${stars}${stars}${stars}${stars}${stars}</div>
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
          <div class="qrbox">${qrSvg}</div>
          <p class="scan"><b>Scan to review</b><br>Point your phone camera at the code</p>
          <a class="cta" href="${hrefReview}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
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
