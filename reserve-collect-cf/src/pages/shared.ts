/** Shared design-system CSS + document shell. Mirrors the kevappts palette
 *  (--accent #f5b301 gold, --good, --bad, --radius 16px) for brand consistency. */
import type { Env } from '../types';
import { escapeHtml } from '../services/utils';

export const BASE_CSS = `
  :root{
    --bg:#f6f7fb; --card:#ffffff; --muted:#6b7280; --text:#111827;
    --accent:#f5b301; --line:#e5e7eb; --good:#10b981; --bad:#ef4444; --warn:#f59e0b;
    --shadow:0 10px 30px rgba(17,24,39,0.08); --radius:16px;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,"Apple Color Emoji","Segoe UI Emoji";font-size:15px;background:var(--bg);color:var(--text);}
  a{color:#2563eb;}
  .wrap{max-width:880px;margin:0 auto;padding:16px 14px 40px;}
  .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.95);padding:18px;margin-bottom:16px;}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#111827;color:#fff;}
  .topbar .brand{font-weight:900;color:var(--accent);font-size:17px;}
  .topbar .brand small{display:block;color:#cbd5e1;font-weight:600;font-size:12px;}
  .topbar a{color:#e5e7eb;text-decoration:none;font-weight:600;font-size:14px;}
  h1{font-size:22px;margin:0 0 8px;}
  h2{font-size:18px;margin:0 0 10px;}
  p.lead{color:var(--muted);margin:0 0 14px;}
  label{display:block;font-size:13px;font-weight:700;margin:10px 0 4px;color:#374151;}
  input[type=text],input[type=email],input[type=tel],input[type=number],textarea,select{
    width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:12px;font-size:15px;background:#fff;color:var(--text);}
  input:focus,textarea:focus,select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(245,179,1,0.2);}
  textarea{min-height:74px;resize:vertical;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:999px;padding:12px 18px;font-size:15px;font-weight:800;cursor:pointer;text-decoration:none;}
  .btn-primary{background:var(--accent);color:#111827;}
  .btn-primary:hover{filter:brightness(0.96);}
  .btn-dark{background:#111827;color:#fff;}
  .btn-blue{background:#2563eb;color:#fff;}
  .btn-outline{background:#fff;border:1.5px solid var(--line);color:#374151;}
  .btn-danger{background:#fff;border:1.5px solid #fecaca;color:var(--bad);}
  .btn-good{background:var(--good);color:#fff;}
  .btn[disabled]{opacity:0.55;cursor:not-allowed;}
  .btn.block{display:flex;width:100%;}
  .row{display:flex;gap:10px;flex-wrap:wrap;}
  .row>*{flex:1;min-width:140px;}
  .muted{color:var(--muted);font-size:13px;}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:800;}
  .b-SUBMITTED{background:#eef2ff;color:#4338ca;}
  .b-ACCEPTED{background:#ecfdf5;color:#047857;}
  .b-READY_FOR_COLLECTION{background:#dcfce7;color:#15803d;}
  .b-COLLECTED{background:#f3f4f6;color:#374151;}
  .b-PARTIALLY_UNAVAILABLE{background:#fffbeb;color:#b45309;}
  .b-CANCELLED{background:#fef2f2;color:#b91c1c;}
  .hero{background:linear-gradient(135deg,#fff7e0,#fff);border:1.5px solid var(--accent);}
  .hero h2{font-size:20px;}
  .hint{background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:10px 12px;font-size:13px;color:#075985;}
  .err{color:var(--bad);font-size:13px;margin-top:8px;min-height:18px;}
  .ok{color:var(--good);font-size:13px;margin-top:8px;}
  .thumb{width:64px;height:64px;border-radius:10px;object-fit:cover;border:1px solid var(--line);background:#f3f4f6;}
  .chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font-size:13px;background:#fff;cursor:pointer;}
  .chip.sel-AVAILABLE{background:#ecfdf5;border-color:#6ee7b7;color:#047857;}
  .chip.sel-RESERVED_ALREADY{background:#fffbeb;border-color:#fcd34d;color:#b45309;}
  .chip.sel-UNAVAILABLE{background:#fef2f2;border-color:#fca5a5;color:#b91c1c;}
`;

export function htmlDoc(title: string, body: string, extraHead = ''): string {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f5b301">
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}</style>
${extraHead}
</head><body>${body}</body></html>`;
}

export function topBar(env: Env, right = ''): string {
  return `<div class="topbar">
    <a href="/" style="display:flex;flex-direction:column;line-height:1.1;">
      <span class="brand">${escapeHtml(env.PHARMACY_NAME)}<small>Reserve &amp; Collect</small></span>
    </a>
    <div>${right}</div>
  </div>`;
}
