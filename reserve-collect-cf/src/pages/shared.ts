/** Shared design system: CSS, inline line-icons, document shell, header
 *  (with live login state) and footer. Brand palette matches kevappts
 *  (--accent #f5b301 gold, --good, --bad, --radius). */
import type { Env, User } from '../types';
import { escapeHtml } from '../services/utils';

export const BASE_CSS = `
  :root{
    --bg:#f4f6fb; --card:#ffffff; --muted:#6b7280; --text:#0f172a; --ink:#111827;
    --accent:#f5b301; --accent-600:#e0a200; --line:#e6e8ee; --good:#10b981; --bad:#ef4444; --warn:#f59e0b;
    --blue:#2563eb; --shadow:0 12px 34px rgba(15,23,42,0.08); --shadow-sm:0 2px 10px rgba(15,23,42,0.06);
    --radius:18px; --radius-sm:12px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,"Apple Color Emoji";
    font-size:15.5px;line-height:1.5;color:var(--text);
    background:radial-gradient(1200px 500px at 50% -200px,#fff7e0 0%,rgba(255,247,224,0) 60%),var(--bg);
    -webkit-font-smoothing:antialiased;}
  a{color:var(--blue);text-decoration:none;}
  .ic{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;vertical-align:middle;}
  .ic-fill{fill:currentColor;stroke:none;}

  /* ── Header ───────────────────────────────── */
  .nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:11px clamp(14px,4vw,28px);background:rgba(15,23,42,0.96);backdrop-filter:saturate(1.2) blur(6px);color:#fff;}
  .nav .brand{display:flex;flex-direction:column;line-height:1.12;text-decoration:none;}
  .nav .brand b{color:var(--accent);font-weight:900;font-size:17px;letter-spacing:.2px;}
  .nav .brand small{color:#cbd5e1;font-weight:600;font-size:11.5px;}
  .nav .navright{display:flex;align-items:center;gap:8px;}
  .navlink{color:#e5e7eb;font-weight:700;font-size:13.5px;padding:8px 10px;border-radius:999px;}
  .navlink:hover{background:rgba(255,255,255,0.1);color:#fff;}
  .acct{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);
    padding:5px 10px 5px 6px;border-radius:999px;}
  .acct .av{width:26px;height:26px;border-radius:50%;background:var(--accent);color:#111827;font-weight:900;font-size:12px;
    display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
  .acct .em{color:#e5e7eb;font-size:12.5px;font-weight:600;max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .signin-btn{display:inline-flex;align-items:center;gap:7px;background:var(--accent);color:#111827;font-weight:800;font-size:13.5px;
    padding:8px 14px;border-radius:999px;transition:transform .15s ease,box-shadow .15s ease;}
  .signin-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(245,179,1,.35);}

  /* ── Layout ───────────────────────────────── */
  .wrap{max-width:760px;margin:0 auto;padding:clamp(16px,4vw,30px) 14px 60px;}
  .wrap.wide{max-width:1040px;}
  .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid var(--line);
    padding:clamp(18px,3.4vw,26px);margin-bottom:18px;animation:fadeUp .5s ease both;}
  .hero{background:linear-gradient(135deg,#fffdf6 0%,#fff 60%);border:1.5px solid #fde9af;position:relative;overflow:hidden;}
  .hero:before{content:"";position:absolute;right:-60px;top:-60px;width:200px;height:200px;border-radius:50%;
    background:radial-gradient(circle,rgba(245,179,1,.16),transparent 70%);}
  h1{font-size:clamp(24px,5vw,30px);line-height:1.15;margin:0 0 10px;letter-spacing:-.02em;font-weight:900;}
  h2{font-size:19px;margin:0 0 12px;font-weight:800;letter-spacing:-.01em;}
  .eyebrow{display:inline-flex;align-items:center;gap:7px;color:var(--accent-600);font-weight:800;font-size:12.5px;
    text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}
  p.lead{color:var(--muted);margin:0 0 18px;font-size:15.5px;}
  .muted{color:var(--muted);font-size:13.5px;}

  /* ── Buttons ──────────────────────────────── */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:none;border-radius:999px;
    padding:13px 20px;font-size:15.5px;font-weight:800;cursor:pointer;text-decoration:none;line-height:1;
    transition:transform .16s ease,box-shadow .16s ease,filter .16s ease;}
  .btn .ic{transition:transform .16s ease;}
  .btn:hover{transform:translateY(-2px);}
  .btn:active{transform:translateY(0);}
  .btn.block{display:flex;width:100%;}
  .btn-primary{background:linear-gradient(180deg,#f7bd1a,#f5b301);color:#111827;box-shadow:0 8px 20px rgba(245,179,1,.35);}
  .btn-primary:hover{box-shadow:0 12px 26px rgba(245,179,1,.45);}
  .btn-primary:hover .ic{transform:translateX(3px);}
  .btn-dark{background:var(--ink);color:#fff;}
  .btn-blue{background:var(--blue);color:#fff;box-shadow:0 8px 20px rgba(37,99,235,.28);}
  .btn-blue:hover .ic{transform:translateX(3px);}
  .btn-good{background:var(--good);color:#fff;}
  .btn-outline{background:#fff;border:1.5px solid var(--line);color:#374151;}
  .btn-outline:hover{border-color:#cbd5e1;}
  .btn-danger{background:#fff;border:1.5px solid #fecaca;color:var(--bad);}
  .btn-ghost{background:transparent;color:var(--muted);font-weight:700;}
  .btn[disabled]{opacity:.55;cursor:not-allowed;transform:none;}

  /* ── Forms ────────────────────────────────── */
  label{display:block;font-size:13px;font-weight:700;margin:12px 0 5px;color:#374151;}
  input[type=text],input[type=email],input[type=tel],input[type=number],textarea,select{
    width:100%;padding:12px 13px;border:1.5px solid var(--line);border-radius:var(--radius-sm);font-size:15.5px;background:#fff;color:var(--text);}
  input:focus,textarea:focus,select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px rgba(245,179,1,.18);}
  textarea{min-height:78px;resize:vertical;}
  .row{display:flex;gap:12px;flex-wrap:wrap;}
  .row>*{flex:1;min-width:150px;}

  /* ── Bits ─────────────────────────────────── */
  .steps{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media(max-width:560px){.steps{grid-template-columns:1fr;}}
  .step{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid var(--line);border-radius:var(--radius-sm);background:#fcfdff;}
  .step .num{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:#fff7e0;color:var(--accent-600);
    display:flex;align-items:center;justify-content:center;border:1px solid #fde9af;}
  .step b{display:block;margin-bottom:2px;}
  .badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;}
  .pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-radius:999px;
    padding:7px 12px;font-size:12.5px;font-weight:700;color:#475569;box-shadow:var(--shadow-sm);}
  .pill .ic{color:var(--good);}
  .hint{display:flex;gap:9px;align-items:flex-start;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius-sm);
    padding:11px 13px;font-size:13.5px;color:#075985;}
  .hint .ic{color:#0284c7;flex:0 0 auto;margin-top:1px;}
  .err{color:var(--bad);font-size:13.5px;margin-top:8px;min-height:18px;}
  .ok{color:var(--good);font-size:13.5px;margin-top:8px;}
  .thumb{width:70px;height:70px;border-radius:10px;object-fit:cover;border:1px solid var(--line);background:#f3f4f6;}
  .badge{display:inline-block;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:800;}
  .b-SUBMITTED{background:#eef2ff;color:#4338ca;} .b-ACCEPTED{background:#ecfdf5;color:#047857;}
  .b-READY_FOR_COLLECTION{background:#dcfce7;color:#15803d;} .b-COLLECTED{background:#f1f5f9;color:#475569;}
  .b-PARTIALLY_UNAVAILABLE{background:#fffbeb;color:#b45309;} .b-CANCELLED{background:#fef2f2;color:#b91c1c;}
  .chip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:700;background:#fff;cursor:pointer;}
  .chip.sel-AVAILABLE{background:#ecfdf5;border-color:#6ee7b7;color:#047857;}
  .chip.sel-RESERVED_ALREADY{background:#fffbeb;border-color:#fcd34d;color:#b45309;}
  .chip.sel-UNAVAILABLE{background:#fef2f2;border-color:#fca5a5;color:#b91c1c;}
  .foot{max-width:760px;margin:0 auto;padding:22px 16px 40px;color:#94a3b8;font-size:12.5px;text-align:center;}
  .foot a{color:#64748b;font-weight:600;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes floaty{0%,100%{transform:translateY(0);}50%{transform:translateY(-2px);}}
  .floaty{animation:floaty 3.4s ease-in-out infinite;}
  @media(prefers-reduced-motion:reduce){
    *{animation:none !important;}
    .btn,.signin-btn{transition:none;}
    html{scroll-behavior:auto;}
  }
`;

const ICON_PATHS: Record<string, string> = {
  health: '<path d="M3 12h4l2 5 4-10 2 5h6"/>',
  bag: '<path d="M6 8h12l-1.1 11.2A2 2 0 0 1 14.9 21H9.1a2 2 0 0 1-2-1.8L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7l1.3-2h4.4l1.3 2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8.3 12.4l2.5 2.5 4.9-5.4"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.4"/><path d="M3.4 7.2 12 13l8.6-5.8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2v5l3.2 2"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  signout: '<path d="M15 12H4.5"/><path d="M8 8l-3.8 4L8 16"/><path d="M13 4h6v16h-6"/>',
  arrow: '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
  star: '<path class="ic-fill" d="M12 3.2l2.6 5.6 6.1.8-4.5 4.2 1.1 6L12 17l-5.4 2.8 1.1-6-4.5-4.2 6.1-.8L12 3.2z"/>',
  phone: '<path d="M5 4h3l1.8 4.5-2 1.2a12 12 0 0 0 5.5 5.5l1.2-2 4.5 1.8V20a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  box: '<path d="M21 7.5 12 12 3 7.5 12 3l9 4.5z"/><path d="M3 7.5V17l9 4.5 9-4.5V7.5"/><path d="M12 12v9.5"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z"/><path d="M9.2 12.2l2 2 3.6-3.8"/>',
};

export function icon(name: string, size = 20, cls = ''): string {
  const p = ICON_PATHS[name] || '';
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}

function initials(user: User): string {
  const base = (user.full_name || user.email || '?').trim();
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  const s = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  return (s || base[0] || '?').toUpperCase();
}

/** Header with live login state: account chip + sign-out when signed in,
 *  otherwise a clear "Sign in" button. */
export function topBar(env: Env, user?: User | null): string {
  let right: string;
  if (user) {
    right = `
      <a class="navlink" href="/orders">My reservations</a>
      <span class="acct"><span class="av">${escapeHtml(initials(user))}</span><span class="em">${escapeHtml(user.email)}</span></span>
      <a class="navlink" href="/logout">${icon('signout', 16)} Sign out</a>`;
  } else {
    right = `<a class="signin-btn" href="/signin">${icon('user', 16)} Sign in</a>`;
  }
  return `<header class="nav">
    <a class="brand" href="/"><b>${escapeHtml(env.PHARMACY_NAME)}</b><small>Reserve &amp; Collect</small></a>
    <nav class="navright">${right}</nav>
  </header>`;
}

export function footer(env: Env): string {
  return `<footer class="foot">
    <div>${escapeHtml(env.PHARMACY_NAME)} · Reserve &amp; Collect — collection only, no delivery.</div>
    <div style="margin-top:6px;"><a href="${escapeHtml(env.APPOINTMENTS_URL)}">Book an appointment</a> · <a href="/">Home</a></div>
  </footer>`;
}

export function htmlDoc(title: string, body: string, extraHead = ''): string {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f172a">
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}</style>
${extraHead}
</head><body>${body}</body></html>`;
}
