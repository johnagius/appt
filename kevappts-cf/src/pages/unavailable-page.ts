import type { Env } from '../types';

/**
 * Doctor-unavailable splash page.
 *
 * Shown IN PLACE of the doctor booking page (`/`, `/book`, `/from/*`) whenever
 * the admin toggles the DOCTOR_UNAVAILABLE config flag on. It reassures the
 * patient, points them to Spinola Clinic, and gives them three ways to find it:
 * an interactive map, a simple visual route, and a QR code that opens
 * turn-by-turn walking directions in Google Maps.
 *
 * Everything is self-contained (inline SVG map + inline SVG QR) except the
 * curated web fonts and the Google Maps embed, which load live in the browser.
 */
export function unavailablePage(env: Env): string {
  const origin = "Potter's Pharmacy, St Julian's, Malta";
  const destination = "Spinola Clinic, St Julian's, Malta";
  const enc = (s: string) => encodeURIComponent(s);

  // Universal Google Maps directions link (walking). Opens the app on phones,
  // the site on desktop. Same URL is encoded into the QR below.
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&origin=' + enc(origin) +
    '&destination=' + enc(destination) + '&travelmode=walking';
  // Classic no-API-key embed showing the route between the two places.
  const mapEmbedSrc =
    'https://maps.google.com/maps?saddr=' + enc(origin) +
    '&daddr=' + enc(destination) + '&z=15&output=embed';

  const hrefDirections = directionsUrl.replace(/&/g, '&amp;');
  const srcMap = mapEmbedSrc.replace(/&/g, '&amp;');

  // Pre-rendered QR (error-correction M) encoding `directionsUrl`. Inline SVG
  // so the code always renders even if a QR image service is unreachable.
  const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 51" shape-rendering="crispEdges" role="img" aria-label="QR code linking to walking directions"><path fill="#ffffff" d="M0 0h51v51H0z"/><path stroke="#0f172a" d="M1 1.5h7m1 0h1m3 0h1m3 0h2m1 0h4m3 0h1m1 0h1m1 0h1m1 0h3m1 0h1m3 0h1m1 0h7M1 2.5h1m5 0h1m1 0h2m1 0h1m5 0h2m1 0h4m3 0h2m3 0h1m1 0h1m1 0h1m1 0h3m1 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h1m2 0h2m1 0h2m3 0h2m1 0h1m3 0h2m1 0h1m2 0h1m1 0h2m1 0h1m1 0h2m1 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m3 0h1m3 0h4m2 0h6m2 0h6m1 0h3m1 0h1m2 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h1m2 0h2m1 0h1m1 0h2m1 0h1m1 0h6m2 0h3m4 0h2m4 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m4 0h1m1 0h1m1 0h2m1 0h1m1 0h3m3 0h1m1 0h2m5 0h4m3 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M10 8.5h1m2 0h1m1 0h1m2 0h1m3 0h2m3 0h2m1 0h1m1 0h1m3 0h1m3 0h1M1 9.5h1m2 0h9m2 0h2m2 0h1m1 0h7m1 0h3m4 0h2m1 0h2m1 0h1m2 0h1m1 0h3M1 10.5h1m1 0h3m3 0h4m2 0h2m3 0h3m1 0h1m1 0h3m1 0h2m3 0h2m1 0h2m1 0h6M1 11.5h2m1 0h1m2 0h1m3 0h1m3 0h4m1 0h1m1 0h3m3 0h3m2 0h3m1 0h2m1 0h1m1 0h1m2 0h2m2 0h1M3 12.5h2m5 0h2m1 0h1m5 0h1m2 0h3m5 0h2m1 0h4m1 0h1m1 0h1m1 0h1m1 0h2m1 0h2M1 13.5h1m1 0h2m1 0h2m3 0h1m2 0h2m1 0h1m3 0h2m2 0h1m2 0h4m1 0h3m1 0h1m1 0h2m1 0h1m2 0h2m2 0h1M2 14.5h2m1 0h1m2 0h7m1 0h1m2 0h3m1 0h3m1 0h5m2 0h1m1 0h1m2 0h2m2 0h3m1 0h2M3 15.5h3m1 0h1m2 0h1m2 0h2m1 0h3m4 0h1m3 0h3m3 0h2m1 0h1m2 0h3m3 0h2m1 0h2M1 16.5h1m1 0h1m6 0h2m1 0h1m3 0h1m3 0h4m3 0h1m1 0h1m3 0h2m4 0h2m4 0h2m1 0h1M2 17.5h2m1 0h3m2 0h1m1 0h2m2 0h2m1 0h5m1 0h2m1 0h1m1 0h6m1 0h2m1 0h2m1 0h3m1 0h2M1 18.5h2m2 0h1m3 0h1m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h2m1 0h1m1 0h6m1 0h2m1 0h7M2 19.5h1m1 0h4m2 0h1m3 0h5m5 0h1m1 0h2m1 0h2m2 0h1m3 0h6m2 0h3m1 0h1M3 20.5h1m4 0h1m1 0h6m1 0h4m1 0h1m4 0h1m1 0h2m2 0h3m3 0h1m2 0h2m2 0h1m1 0h1M1 21.5h4m2 0h1m2 0h1m2 0h2m1 0h7m2 0h1m1 0h1m1 0h2m3 0h4m1 0h1m3 0h2M1 22.5h1m2 0h3m1 0h1m1 0h1m2 0h1m1 0h2m4 0h2m3 0h2m1 0h7m3 0h6m1 0h1M1 23.5h1m1 0h8m2 0h1m1 0h1m1 0h2m3 0h6m1 0h2m1 0h1m1 0h2m5 0h5m1 0h3M1 24.5h2m1 0h2m3 0h5m3 0h1m2 0h2m1 0h1m3 0h1m2 0h4m2 0h1m1 0h1m1 0h2m3 0h3M2 25.5h4m1 0h1m1 0h3m1 0h1m1 0h1m1 0h1m4 0h2m1 0h1m1 0h3m1 0h1m1 0h1m2 0h4m1 0h1m1 0h1m1 0h1m2 0h2M1 26.5h1m3 0h1m3 0h2m1 0h1m7 0h4m3 0h1m2 0h2m1 0h2m4 0h1m1 0h1m3 0h1m1 0h1M4 27.5h8m3 0h1m3 0h1m3 0h5m4 0h1m2 0h1m1 0h1m1 0h7m3 0h1M1 28.5h1m2 0h1m3 0h1m2 0h6m5 0h2m1 0h1m2 0h1m10 0h3m3 0h5M1 29.5h1m4 0h3m2 0h1m1 0h1m1 0h2m1 0h2m1 0h2m1 0h1m1 0h2m3 0h3m3 0h2m1 0h2m4 0h1m1 0h2M3 30.5h1m5 0h3m1 0h2m1 0h6m3 0h1m3 0h1m1 0h5m2 0h1m1 0h3m1 0h1m1 0h3M2 31.5h1m4 0h1m3 0h1m2 0h1m1 0h3m1 0h1m3 0h2m1 0h4m1 0h3m5 0h4m1 0h1m1 0h1m1 0h1M1 32.5h1m1 0h4m2 0h1m12 0h1m1 0h1m1 0h1m2 0h2m3 0h1m1 0h1m3 0h2m2 0h1m1 0h1m1 0h2M4 33.5h1m2 0h1m4 0h2m2 0h2m1 0h3m7 0h3m2 0h4m2 0h3m1 0h3m1 0h2M3 34.5h1m1 0h1m2 0h1m1 0h1m3 0h1m1 0h2m3 0h1m1 0h3m1 0h1m1 0h7m1 0h4m1 0h1m1 0h4M1 35.5h1m1 0h5m2 0h4m2 0h1m1 0h1m2 0h1m1 0h3m1 0h1m2 0h1m2 0h1m1 0h1m4 0h7m1 0h2M1 36.5h1m10 0h2m1 0h1m2 0h4m1 0h1m3 0h1m4 0h5m1 0h2m2 0h1m3 0h4M5 37.5h1m1 0h1m1 0h1m1 0h1m2 0h2m2 0h1m1 0h1m1 0h6m1 0h1m1 0h3m1 0h1m1 0h2m1 0h1m3 0h1m4 0h1M2 38.5h1m1 0h2m3 0h1m1 0h5m1 0h1m1 0h1m1 0h1m1 0h3m2 0h5m3 0h2m1 0h1m1 0h1m3 0h1m2 0h1M2 39.5h1m3 0h2m1 0h3m2 0h1m2 0h2m5 0h1m8 0h2m3 0h2m3 0h1m2 0h1m1 0h2M2 40.5h3m3 0h2m2 0h1m1 0h1m2 0h1m3 0h2m8 0h1m3 0h2m1 0h3m1 0h1m3 0h3M1 41.5h3m3 0h3m1 0h2m1 0h1m1 0h1m5 0h7m3 0h3m2 0h1m1 0h9m1 0h1M9 42.5h1m1 0h3m2 0h1m3 0h1m2 0h1m3 0h3m1 0h1m2 0h2m1 0h2m1 0h2m3 0h2M1 43.5h7m1 0h1m2 0h6m1 0h3m1 0h1m1 0h1m1 0h2m3 0h1m1 0h1m2 0h2m2 0h1m1 0h1m1 0h1m1 0h3M1 44.5h1m5 0h1m1 0h3m3 0h2m3 0h2m1 0h1m3 0h4m1 0h1m1 0h2m3 0h3m3 0h2m1 0h2M1 45.5h1m1 0h3m1 0h1m1 0h4m1 0h2m1 0h1m2 0h1m2 0h5m1 0h1m6 0h3m2 0h6m1 0h1M1 46.5h1m1 0h3m1 0h1m1 0h3m3 0h2m2 0h1m1 0h1m2 0h1m2 0h5m2 0h3m1 0h3m2 0h2m1 0h1m1 0h2M1 47.5h1m1 0h3m1 0h1m3 0h2m3 0h2m1 0h2m1 0h1m2 0h4m1 0h1m1 0h1m1 0h2m1 0h1m5 0h4m1 0h1M1 48.5h1m5 0h1m2 0h1m1 0h3m2 0h1m1 0h2m1 0h1m2 0h2m6 0h1m1 0h2m3 0h1m1 0h2m2 0h4M1 49.5h7m1 0h1m1 0h1m5 0h2m1 0h1m1 0h3m1 0h1m2 0h1m3 0h2m2 0h1m1 0h1m1 0h2m1 0h3m2 0h1"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f766e">
  <meta name="robots" content="noindex">
  <title>Doctor Unavailable — Potter's Pharmacy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{
      --ink:#0f172a;
      --muted:#5b6b7c;
      --line:#e6ebf1;
      --card:#ffffff;
      --teal:#0f766e;
      --teal-soft:#e6f4f1;
      --amber:#f5b301;
      --radius:20px;
      --shadow:0 20px 50px -22px rgba(15,23,42,.30);
    }
    *{box-sizing:border-box;}
    html,body{margin:0;padding:0;height:100%;}
    body{
      font-family:"Inter",ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:var(--ink);
      -webkit-font-smoothing:antialiased;
      background:
        radial-gradient(1100px 640px at 12% -8%, #e8f5f2 0%, rgba(232,245,242,0) 60%),
        radial-gradient(1000px 620px at 108% 4%, #fff6df 0%, rgba(255,246,223,0) 55%),
        linear-gradient(180deg,#fbfdff 0%,#f4f7fb 100%);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:clamp(8px,1.4vw,18px) clamp(10px,2vw,22px);
    }
    /* faint medical-cross texture behind everything */
    body::before{
      content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%230f766e' stroke-opacity='0.05' stroke-width='2'%3E%3Cpath d='M30 22v16M22 30h16'/%3E%3C/g%3E%3C/svg%3E");
    }
    .shell{position:relative;z-index:1;width:100%;max-width:1000px;}

    .brand{display:flex;align-items:center;gap:9px;justify-content:center;margin:0 0 7px;}
    .brand .emblem{width:32px;height:32px;border-radius:9px;background:linear-gradient(140deg,#0f766e,#12b3a1);
      display:grid;place-items:center;box-shadow:0 8px 18px -6px rgba(15,118,110,.6);}
    .brand .emblem svg{width:18px;height:18px;}
    .brand .name{font-weight:700;letter-spacing:.02em;font-size:14px;color:#12433d;}
    .brand .name span{color:var(--amber);}

    .card{
      background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
      box-shadow:var(--shadow);overflow:hidden;
    }
    /* master split: message on the left, wayfinding on the right */
    .split{display:grid;grid-template-columns:1fr;}
    @media (min-width:800px){ .split{grid-template-columns:1.04fr 0.96fr;} }

    .left{position:relative;padding:clamp(16px,2.3vw,26px) clamp(20px,3vw,34px);}
    .left::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:4px;
      background:linear-gradient(90deg,var(--teal),var(--amber));}
    @media (min-width:800px){ .left::after{left:auto;top:0;bottom:0;right:-1px;width:4px;height:auto;
      background:linear-gradient(180deg,var(--teal),var(--amber));} }

    .badge{
      display:inline-flex;align-items:center;gap:7px;
      background:var(--teal-soft);color:#0b5c55;font-weight:600;font-size:11.5px;
      letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:10px;
    }
    .badge .dot{width:7px;height:7px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 3px rgba(245,179,1,.22);}
    h1{
      font-family:"Fraunces",Georgia,serif;font-weight:500;font-optical-sizing:auto;
      font-size:clamp(23px,3.1vw,33px);line-height:1.07;margin:0 0 9px;letter-spacing:-.01em;color:#10322e;
    }
    .lede{font-size:clamp(13.5px,1.5vw,15.5px);line-height:1.55;color:var(--muted);margin:0;}
    .lede .soft{color:var(--ink);font-weight:500;}
    .refer{
      margin:13px 0 0;display:flex;align-items:center;gap:12px;
      background:linear-gradient(180deg,#fffdf6,#fff8e6);border:1px solid #f4e4b5;border-radius:14px;padding:12px 15px;
    }
    .refer .pin{flex:0 0 auto;width:36px;height:36px;border-radius:11px;background:#fff;border:1px solid #f0dfa8;
      display:grid;place-items:center;box-shadow:0 6px 14px -8px rgba(180,140,20,.5);}
    .refer .pin svg{width:20px;height:20px;}
    .refer .rt .k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#a9822a;font-weight:600;}
    .refer .rt .v{font-family:"Fraunces",Georgia,serif;font-size:18px;font-weight:600;color:#7a5a12;line-height:1.15;}
    .refer .rt .s{font-size:12px;color:#9a7c34;margin-top:1px;}

    .qrrow{margin-top:12px;display:flex;gap:15px;align-items:center;
      border:1px solid var(--line);border-radius:14px;padding:11px 14px;background:linear-gradient(180deg,#ffffff,#f8fbfd);}
    @media (max-width:400px){.qrrow{flex-direction:column;text-align:center;}}
    .qrbox{flex:0 0 auto;width:104px;height:104px;background:#fff;border:1px solid var(--line);border-radius:12px;
      padding:8px;box-shadow:0 10px 24px -14px rgba(15,23,42,.4);}
    .qrbox svg{width:100%;height:100%;display:block;}
    .qrtext{flex:1;min-width:0;}
    .qrtext h3{margin:0 0 4px;font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:16.5px;color:#12332f;}
    .qrtext p{margin:0 0 10px;font-size:12.5px;line-height:1.5;color:var(--muted);}
    .cta{display:inline-flex;align-items:center;gap:8px;background:var(--teal);color:#fff;text-decoration:none;
      font-weight:600;font-size:13px;padding:9px 15px;border-radius:10px;transition:transform .12s ease,box-shadow .12s ease;
      box-shadow:0 12px 24px -12px rgba(15,118,110,.8);}
    .cta:hover{transform:translateY(-1px);box-shadow:0 16px 30px -12px rgba(15,118,110,.85);}
    .cta svg{width:15px;height:15px;}

    /* right column: map + schematic route, stacked and compact */
    .right{display:flex;flex-direction:column;gap:10px;padding:clamp(14px,2vw,20px);
      background:#fbfdff;border-top:1px solid var(--line);}
    @media (min-width:800px){ .right{border-top:0;border-left:1px solid var(--line);} }
    .panel{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;display:flex;flex-direction:column;}
    .panel.mappanel{flex:1;min-height:0;}
    .panel h2{margin:0;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:#42525f;font-weight:600;
      padding:10px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px;background:#fbfdff;}
    .panel h2 .ic{width:16px;height:16px;color:var(--teal);}

    .mapwrap{position:relative;flex:1;min-height:150px;background:#eef2f6;}
    .mapwrap iframe{position:absolute;inset:0;width:100%;height:100%;border:0;filter:saturate(1.02);}

    /* schematic route */
    .route{padding:13px 14px;display:flex;flex-direction:column;gap:11px;}
    .route .diagram{width:100%;max-height:104px;border-radius:10px;background:linear-gradient(180deg,#f3f9f8,#eef5f9);border:1px solid #e4eef0;}
    .steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;}
    .steps li{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:#3a4a57;line-height:1.4;}
    .steps li .n{flex:0 0 auto;width:21px;height:21px;border-radius:50%;background:var(--teal-soft);color:#0b5c55;
      font-weight:700;font-size:11px;display:grid;place-items:center;margin-top:1px;}
    .steps li b{color:var(--ink);font-weight:600;}

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
          <div class="badge"><span class="dot"></span>Booking paused</div>
          <h1>The doctor is unavailable at the moment</h1>
          <p class="lede">
            We&rsquo;re sorry &mdash; <span class="soft">the doctor is unavailable at Potter&rsquo;s Pharmacy right now,</span>
            so online booking is closed. Should you wish to see a doctor, please make your way to
            <span class="soft">Spinola Clinic</span> &mdash; <span class="soft">no appointment needed, they are welcoming walk&#8209;in patients.</span>
          </p>
          <div class="refer">
            <span class="pin" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2c-3.9 0-7 3.1-7 7 0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7z" fill="#f5b301"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>
            </span>
            <span class="rt">
              <span class="k">Walk in at</span>
              <span class="v">Spinola Clinic</span>
              <span class="s">St Julian&rsquo;s, Malta &middot; no booking &middot; approx. 5&#8209;minute walk</span>
            </span>
          </div>
          <div class="qrrow">
            <div class="qrbox">${qrSvg}</div>
            <div class="qrtext">
              <h3>Scan for walking directions</h3>
              <p>Point your phone camera at the code for live, turn&#8209;by&#8209;turn directions to Spinola Clinic in Google&nbsp;Maps.</p>
              <a class="cta" href="${hrefDirections}" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>

        <div class="right">
          <div class="panel mappanel">
            <h2><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>Live map</h2>
            <div class="mapwrap">
              <iframe src="${srcMap}" title="Map from Potter's Pharmacy to Spinola Clinic" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>

          <div class="panel">
            <h2><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-3-6-3"/><path d="M4 6h4l2 4"/><circle cx="6" cy="19" r="1.6"/></svg>How to get there</h2>
            <div class="route">
              <svg class="diagram" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Simple route from Potter's Pharmacy to Spinola Clinic">
                <path d="M44 80 C 104 80, 116 30, 186 30 S 256 56, 280 36" fill="none" stroke="#0f766e" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="2 9"/>
                <g>
                  <circle cx="44" cy="80" r="9" fill="#fff" stroke="#0f766e" stroke-width="3"/>
                  <text x="44" y="84" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#0f766e">A</text>
                  <text x="44" y="102" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#3a4a57">Potter&#8217;s</text>
                </g>
                <g transform="translate(157 12)">
                  <path d="M4 8 q4 -6 8 0 q-1 4 -4 4 v6 M8 12 l-3 4 M8 12 l3 4" fill="none" stroke="#a9822a" stroke-width="1.6" stroke-linecap="round"/>
                  <circle cx="8" cy="3" r="2.4" fill="#f5b301"/>
                </g>
                <g>
                  <path d="M280 28 c-5 0-9 4-9 9 0 6 9 14 9 14s9-8 9-14c0-5-4-9-9-9z" fill="#f5b301"/>
                  <circle cx="280" cy="37" r="3.2" fill="#fff"/>
                  <text x="280" y="74" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#3a4a57">Spinola</text>
                </g>
              </svg>
              <ol class="steps">
                <li><span class="n">1</span><span>Leave <b>Potter&rsquo;s Pharmacy</b> and head down towards <b>Spinola Bay</b>.</span></li>
                <li><span class="n">2</span><span>Follow the seafront promenade &mdash; a gentle, well&#8209;signed walk.</span></li>
                <li><span class="n">3</span><span>Arrive at <b>Spinola Clinic</b> in roughly 5 minutes.</span></li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div class="foot">
        <b>Potter&rsquo;s Pharmacy</b> &middot; St Julian&rsquo;s, Malta &mdash; thank you for your understanding.
      </div>
    </div>
  </div>
</body>
</html>`;
}
