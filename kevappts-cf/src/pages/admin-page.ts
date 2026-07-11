import type { Env } from '../types';

/**
 * Admin dashboard — full-featured management panel.
 * Ported from GAS Admin.html to Cloudflare Workers.
 */
export function adminPage(sig: string, env: Env): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_top">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Admin Panel</title>
  <style>
    :root{--bg:#f6f7fb;--card:#fff;--muted:#6b7280;--text:#111827;--line:#e5e7eb;--bad:#ef4444;--good:#10b981;--blue:#2563eb;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);}
    .wrap{max-width:900px;margin:0 auto;padding:14px 14px 60px;}
    h1{margin:0 0 6px;font-size:20px;font-weight:900;}
    h2{margin:18px 0 8px;font-size:16px;font-weight:800;}
    h3{margin:14px 0 6px;font-size:14px;font-weight:700;}
    .subtitle{color:var(--muted);font-size:13px;margin:0 0 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:16px;margin-bottom:14px;}
    .stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
    .stat{background:var(--card);border-radius:14px;border:1px solid var(--line);padding:12px 16px;flex:1;min-width:120px;text-align:center;}
    .stat .num{font-size:28px;font-weight:900;}
    .stat .label{font-size:12px;color:var(--muted);}
    .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px;}
    table{border-collapse:collapse;width:100%;font-size:13px;}
    th{text-align:left;padding:10px 10px;border-bottom:2px solid var(--line);font-size:12px;color:var(--muted);font-weight:600;}
    td{padding:10px 10px;border-bottom:1px solid var(--line);}
    tbody tr:nth-child(even){background:rgba(243,244,246,0.5);}
    tbody tr{transition:background 0.12s ease;}
    tbody tr:hover{background:rgba(243,244,246,0.9);}
    .btn{border:none;border-radius:999px;padding:10px 16px;min-height:40px;font-weight:700;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;transition:transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;}
    .btn:hover{opacity:0.88;transform:translateY(-1px);}
    .btn:active{transform:translateY(1px);opacity:1;}
    .btn-sm{padding:6px 12px;min-height:34px;font-size:11px;}
    .btn-dark{background:#111827;color:#fff;}
    .btn-danger{background:var(--bad);color:#fff;}
    .btn-good{background:var(--good);color:#052e1a;}
    .btn-blue{background:var(--blue);color:#fff;}.btn-small{padding:4px 10px;font-size:12px;border-radius:4px;background:var(--muted);color:var(--text);}
    .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--line);}
    .btn-ghost:hover{background:rgba(17,24,39,0.04);opacity:1;}
    .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none !important;}
    input,select,textarea{font-family:inherit;font-size:13px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;outline:none;width:100%;transition:border-color 0.15s ease, box-shadow 0.15s ease;}
    input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.12);}
    :focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
    input:focus-visible,select:focus-visible,textarea:focus-visible{outline:none;}
    .form-row{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;align-items:end;}
    .form-group{flex:1;min-width:120px;}
    .form-group label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600;}
    .msg{margin-top:8px;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.4;display:none;}
    .msg.good{display:block;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.06);color:#065f46;}
    .msg.bad{display:block;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);color:#991b1b;}
    .tabs{display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap;}
    .tab{padding:10px 16px;min-height:40px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:600;background:transparent;border:1px solid var(--line);color:var(--muted);transition:background 0.15s ease, color 0.15s ease, border-color 0.15s ease;display:inline-flex;align-items:center;}
    .tab:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .tab.active{background:#111827;color:#fff;border-color:#111827;}
    .tab.active:hover{background:#1f2937;}
    .empty{padding:16px;text-align:center;color:var(--muted);font-size:13px;}
    .appt-row{display:flex;align-items:center;gap:8px;}
    .appt-row input[type=checkbox]{width:auto;margin:0;}
    .action-bar{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap;align-items:center;}
    .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.55);display:none;align-items:center;justify-content:center;padding:14px;z-index:2000;}
    .loadingBox{width:min(520px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;gap:14px;align-items:center;}
    .spinner{width:34px;height:34px;border-radius:999px;border:4px solid #e5e7eb;border-top-color:#111827;animation:spin 0.9s linear infinite;flex:0 0 auto;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .loadingText h4{margin:0 0 4px;font-size:14px;}
    .loadingText div{margin:0;color:var(--muted);font-size:12.5px;line-height:1.35;}
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge-red{background:rgba(239,68,68,0.1);color:#dc2626;}
    .badge-green{background:rgba(16,185,129,0.1);color:#059669;}
    .badge-dark{background:rgba(17,24,39,0.1);color:#111827;}
    .badge-amber{background:rgba(245,158,11,0.1);color:#b45309;}

    /* Fill ring in stats bar */
    .stat-fill{display:flex;align-items:center;gap:10px;justify-content:center;}
    .fill-ring{flex-shrink:0;}
    .fill-bg{fill:none;stroke:var(--line);stroke-width:4;}
    .fill-fg{fill:none;stroke:var(--good);stroke-width:4;stroke-linecap:round;transition:stroke-dashoffset 0.6s ease;}

    /* Patient history modal */
    .patient-modal{width:min(640px,100%);background:#fff;border-radius:18px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);max-height:80vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}
    .patient-modal-header{display:flex;justify-content:space-between;align-items:center;}
    .patient-summary{display:flex;gap:12px;flex-wrap:wrap;}
    .patient-summary-item{background:var(--bg);border-radius:12px;padding:10px 14px;flex:1;min-width:80px;text-align:center;}
    .patient-summary-item .psv{font-size:22px;font-weight:900;}
    .patient-summary-item .psl{font-size:11px;color:var(--muted);}
    .patient-link{color:var(--blue);cursor:pointer;text-decoration:none;font-weight:inherit;}
    .patient-link:hover{text-decoration:underline;}

    /* Attendance buttons */
    .att-btns{display:inline-flex;gap:4px;margin-left:4px;}
    .att-btns .btn{min-height:28px;padding:4px 10px;font-size:12px;font-weight:800;}
    .btn-warn{background:#f59e0b;color:#78350f;}

    /* Trend arrow */
    .trend-arrow{font-size:13px;font-weight:700;margin-left:4px;}
    .trend-up{color:var(--good);}
    .trend-down{color:var(--bad);}
    .trend-flat{color:var(--muted);}

    /* Auto-refresh bar */
    .refresh-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(17,24,39,0.92);color:#e5e7eb;font-size:12px;padding:6px 14px;display:flex;justify-content:space-between;align-items:center;z-index:1500;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-weight:500;}
    .refresh-bar .refresh-info{display:flex;gap:16px;align-items:center;}
    .refresh-bar .refresh-dot{width:6px;height:6px;border-radius:50%;background:var(--good);display:inline-block;margin-right:4px;animation:pulse-dot 2s ease-in-out infinite;}
    @keyframes pulse-dot{0%,100%{opacity:1;}50%{opacity:0.3;}}
    .refresh-bar .refresh-countdown{color:#9ca3af;font-variant-numeric:tabular-nums;}

    /* Responsive */
    @media(max-width:600px){
      .wrap{padding:10px 10px 56px;}
      .stats{gap:8px;}
      .stat{min-width:0;flex:1 1 calc(50% - 4px);padding:10px 12px;}
      .stat .num{font-size:22px;}
      .form-row{flex-direction:column;}
      .form-group{min-width:0;width:100%;}
      .action-bar{flex-direction:column;}
      .action-bar .btn{width:100%;justify-content:center;}
      .tabs{gap:6px;}
      .tab{padding:8px 12px;font-size:12px;}
      h1{font-size:18px;}
      .card{padding:12px;}
    }
    @media(max-width:400px){
      .stat{flex:1 1 100%;}
    }

    /* Availability tab */
    .avail-toggle{display:flex;gap:0;margin-bottom:14px;}
    .toggle-btn{flex:1;padding:12px;border:1px solid var(--line);cursor:pointer;font-weight:700;font-size:13px;text-align:center;transition:all 0.15s ease;background:#fff;color:var(--muted);}
    .toggle-btn:first-child{border-radius:12px 0 0 12px;}
    .toggle-btn:last-child{border-radius:0 12px 12px 0;border-left:none;}
    .toggle-btn.active-block{background:rgba(239,68,68,0.08);color:var(--bad);border-color:var(--bad);}
    .toggle-btn.active-block + .toggle-btn{border-left-color:var(--line);}
    .toggle-btn.active-add{background:rgba(16,185,129,0.08);color:var(--good);border-color:var(--good);}
    .presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
    .preset-pill{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s ease;user-select:none;}
    .preset-pill:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .preset-pill.active{background:#111827;color:#fff;border-color:#111827;}
    .override-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;}
    .override-item:last-child{border-bottom:none;}
    .override-item .ov-icon{font-size:16px;flex-shrink:0;}
    .override-item .ov-info{flex:1;line-height:1.5;}
    .override-item .ov-date{font-weight:700;}
    .override-item .ov-detail{color:var(--muted);font-size:12px;}
    .override-item .ov-reason{color:var(--muted);font-style:italic;font-size:12px;}
    .override-item.past{opacity:0.4;}
    .override-item .ov-remove{border:none;background:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:8px;transition:all 0.15s ease;}
    .override-item .ov-remove:hover{background:rgba(239,68,68,0.1);color:var(--bad);}
    .time-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
    .time-pill{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s ease;user-select:none;}
    .time-pill:hover{border-color:#d1d5db;background:rgba(17,24,39,0.03);}
    .time-pill.active{background:#111827;color:#fff;border-color:#111827;}
    .time-label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:600;}

    /* Custom time spinner */
    .time-spinner-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:10px;}
    .time-spinner-group{display:flex;flex-direction:column;align-items:center;gap:2px;}
    .time-spinner-group .time-label{margin-bottom:2px;}
    .time-spinner{display:flex;align-items:center;gap:2px;background:#f9fafb;border:1px solid var(--line);border-radius:12px;padding:4px;user-select:none;}
    .time-drum{display:flex;flex-direction:column;align-items:center;width:48px;}
    .time-drum-btn{border:none;background:none;cursor:pointer;color:var(--muted);font-size:16px;line-height:1;padding:4px;border-radius:8px;transition:background 0.1s ease;width:100%;text-align:center;}
    .time-drum-btn:hover{background:rgba(17,24,39,0.06);}
    .time-drum-btn:active{background:rgba(17,24,39,0.12);}
    .time-drum-val{font-size:24px;font-weight:800;width:100%;text-align:center;padding:4px 0;cursor:ns-resize;line-height:1.2;}
    .time-drum-label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;}
    .time-sep{font-size:24px;font-weight:800;color:var(--muted);padding:0 2px;align-self:center;margin-top:-2px;}
    .time-spinner-arrow{font-size:20px;color:var(--muted);padding:0 4px;align-self:center;}
    @media(max-width:600px){
      .time-spinner-row{gap:10px;}
      .time-drum{width:42px;}
      .time-drum-val{font-size:20px;}
    }

    /* Timeline bar */
    .timeline-card{margin-bottom:0;padding-bottom:10px;}
    .tl-date-nav{display:flex;align-items:center;gap:8px;margin-bottom:10px;justify-content:center;}
    .tl-date-nav button{border:none;background:none;cursor:pointer;font-size:18px;color:var(--muted);padding:4px 8px;border-radius:8px;}
    .tl-date-nav button:hover{background:rgba(17,24,39,0.06);}
    .tl-date-label{font-weight:700;font-size:14px;min-width:140px;text-align:center;}
    .tl-outer{position:relative;margin-bottom:6px;padding-top:28px;}
    .tl-wrap{position:relative;height:48px;background:#f3f4f6;border-radius:10px;overflow:hidden;cursor:crosshair;border:1px solid var(--line);}
    .tl-seg{position:absolute;top:0;height:100%;}
    .tl-seg.regular{background:var(--good);opacity:0.55;z-index:1;}
    .tl-seg.regular:hover{opacity:0.65;}
    .tl-seg.extra{background:var(--good);opacity:0.85;z-index:3;cursor:pointer;background-image:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.2) 4px,rgba(255,255,255,0.2) 8px);}
    .tl-seg.extra:hover{opacity:1;}
    .tl-seg.blocked{background:var(--bad);opacity:0.7;z-index:3;cursor:pointer;}
    .tl-seg.blocked:hover{opacity:1;}
    .tl-seg-handle{position:absolute;top:0;width:10px;height:100%;cursor:ew-resize;z-index:4;}
    .tl-seg-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:20px;border-radius:2px;background:rgba(255,255,255,0.7);}
    .tl-seg-handle.handle-left{left:-2px;}
    .tl-seg-handle.handle-right{right:-2px;}
    .tl-ticks{position:relative;height:18px;display:flex;pointer-events:none;}
    .tl-tick{flex:1;position:relative;border-left:1px solid var(--line);}
    .tl-tick:last-child{border-right:1px solid var(--line);}
    .tl-tick-label{position:absolute;top:2px;left:0;font-size:10px;color:var(--muted);font-weight:600;white-space:nowrap;transform:translateX(-50%);}
    .tl-tick-label-end{left:100%;}
    .tl-legend{display:flex;gap:12px;margin-top:10px;font-size:11px;color:var(--muted);justify-content:center;}
    .tl-legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:middle;}
    .tl-tooltip{position:absolute;bottom:calc(100% + 6px);background:#111827;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;z-index:10;transform:translateX(-50%);display:none;}
    .tl-sel-label{position:absolute;top:0;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;padding:2px 10px;border-radius:4px;font-size:13px;font-weight:700;white-space:nowrap;pointer-events:none;z-index:11;display:none;}
    .tl-actions{display:flex;gap:6px;margin-top:8px;justify-content:center;}
    .tl-actions .btn{font-size:12px;padding:6px 14px;}
    .tl-sel{position:absolute;top:28px;height:48px;background:rgba(37,99,235,0.25);border:2px solid var(--blue);border-radius:4px;pointer-events:none;z-index:5;display:none;}
    .tl-cursor{position:absolute;top:28px;width:2px;height:48px;background:var(--blue);pointer-events:none;z-index:8;display:none;opacity:0.7;}
    .tl-cursor-label{position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600;white-space:nowrap;}
    .tl-popover{position:absolute;bottom:calc(100% + 8px);background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:8px 10px;z-index:20;transform:translateX(-50%);white-space:nowrap;display:none;font-size:12px;}
    .tl-popover::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#fff;}
    .tl-popover-type{font-weight:700;margin-bottom:2px;}
    .tl-popover-type.pop-extra{color:var(--good);}
    .tl-popover-type.pop-blocked{color:var(--bad);}
    .tl-popover-time{color:var(--text);margin-bottom:4px;}
    .tl-popover-reason{color:var(--muted);font-style:italic;margin-bottom:6px;}
    .tl-popover-del{border:none;background:var(--bad);color:#fff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;width:100%;}
    .tl-popover-del:hover{opacity:0.85;}

    /* Search bar */
    .search-wrap{position:relative;margin-bottom:14px;}
    .search-wrap input{padding-left:36px;padding-right:36px;}
    .search-wrap .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:14px;pointer-events:none;}
    .search-wrap .search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:8px;}
    .search-wrap .search-clear:hover{background:rgba(17,24,39,0.06);color:var(--text);}

    /* Week grid */
    .week-nav{display:flex;align-items:center;gap:8px;margin-bottom:10px;justify-content:space-between;}
    .week-nav .week-label{font-size:14px;font-weight:700;text-align:center;flex:1;}
    .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px;}
    .week-cell{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 4px;text-align:center;cursor:pointer;transition:all 0.15s ease;position:relative;}
    .week-cell:hover{border-color:#d1d5db;background:rgba(17,24,39,0.02);transform:translateY(-1px);}
    .week-cell.today{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,0.15);}
    .week-cell.today .wc-num{color:var(--blue);}
    .week-cell.selected{background:#111827;color:#fff;border-color:#111827;}
    .week-cell.selected .wc-num{color:#fff;}
    .week-cell.selected.today{background:var(--blue);border-color:var(--blue);}
    .week-cell.selected.today:hover{background:#1d4ed8;}
    .week-cell.selected:hover{background:#1f2937;}
    .week-cell .wc-day{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;}
    .week-cell.selected .wc-day{color:rgba(255,255,255,0.7);}
    .week-cell .wc-num{font-size:18px;font-weight:800;margin:2px 0;}
    .week-cell .wc-count{font-size:11px;color:var(--muted);font-weight:600;}
    .week-cell.selected .wc-count{color:rgba(255,255,255,0.7);}
    .week-cell .wc-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin:0 1px;vertical-align:middle;}
    .week-cell.blocked{background:rgba(239,68,68,0.04);}
    .week-cell.blocked.selected{background:#111827;}
    .week-cell.blocked.selected.today{background:var(--blue);}
    .week-cell.no-hours{opacity:0.4;}
    .week-cell.no-hours.selected{opacity:1;}
    @media(max-width:600px){
      .week-cell{padding:6px 2px;border-radius:8px;}
      .week-cell .wc-num{font-size:14px;}
      .week-cell .wc-day{font-size:10px;}
    }

    /* Date navigator */
    .date-nav{display:flex;align-items:center;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
    .date-nav input[type=date]{width:auto;flex:0 0 auto;max-width:160px;}
    .date-header{font-size:15px;font-weight:800;margin:0 0 4px;}

    /* Settings tab */
    .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    @media(max-width:600px){.settings-grid{grid-template-columns:1fr;}}
    .day-row{padding:10px 0;border-bottom:1px solid var(--line);}
    .day-row:last-child{border-bottom:none;}
    .day-row-header{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
    .day-row-header .day-name{font-weight:700;font-size:14px;min-width:40px;}
    .day-toggle{position:relative;width:38px;height:22px;cursor:pointer;}
    .day-toggle input{display:none;}
    .day-toggle .slider{position:absolute;inset:0;background:#d1d5db;border-radius:999px;transition:background 0.15s ease;}
    .day-toggle .slider::before{content:'';position:absolute;width:16px;height:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform 0.15s ease;}
    .day-toggle input:checked + .slider{background:var(--good);}
    .day-toggle input:checked + .slider::before{transform:translateX(16px);}
    .time-block-row{display:flex;align-items:center;gap:6px;margin:4px 0 4px 50px;flex-wrap:wrap;}
    .time-block-row input[type=time]{width:auto;max-width:120px;padding:6px 8px;font-size:12px;}
    .time-block-row .block-sep{color:var(--muted);font-weight:600;font-size:13px;}
    .time-block-row .remove-block{border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:6px;}
    .time-block-row .remove-block:hover{background:rgba(239,68,68,0.1);color:var(--bad);}
    .add-block-btn{margin-left:50px;margin-top:4px;border:none;background:none;color:var(--blue);cursor:pointer;font-size:12px;font-weight:600;padding:4px 8px;border-radius:6px;}
    .add-block-btn:hover{background:rgba(37,99,235,0.06);}

    /* Doctor Status tab */
    .ds-card{transition:border-color 0.2s ease,box-shadow 0.2s ease;}
    .ds-card.on{border-color:rgba(239,68,68,0.45);box-shadow:0 0 0 3px rgba(239,68,68,0.08),var(--shadow);}
    .ds-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:4px;}
    .ds-sub{margin:0;color:var(--muted);font-size:13px;}
    .ds-status{flex:0 0 auto;font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;letter-spacing:.02em;
      background:rgba(16,185,129,0.1);color:#065f46;border:1px solid rgba(16,185,129,0.3);white-space:nowrap;}
    .ds-status.off{background:rgba(239,68,68,0.1);color:#991b1b;border-color:rgba(239,68,68,0.3);}
    .ds-toggle-row{display:flex;align-items:center;gap:18px;justify-content:space-between;
      margin:16px 0 6px;padding:16px;border:1px solid var(--line);border-radius:14px;background:#fafbfc;}
    .ds-toggle-copy{min-width:0;}
    .ds-toggle-title{font-weight:700;font-size:14.5px;color:var(--text);margin-bottom:3px;}
    .ds-toggle-desc{font-size:12.5px;color:var(--muted);line-height:1.5;}
    .ds-switch{position:relative;flex:0 0 auto;width:58px;height:32px;cursor:pointer;}
    .ds-switch input{display:none;}
    .ds-slider{position:absolute;inset:0;background:#cbd5e1;border-radius:999px;transition:background 0.2s ease;}
    .ds-slider::before{content:'';position:absolute;width:24px;height:24px;left:4px;top:4px;background:#fff;border-radius:50%;
      box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:transform 0.2s ease;}
    .ds-switch input:checked + .ds-slider{background:var(--bad);}
    .ds-switch input:checked + .ds-slider::before{transform:translateX(26px);}
    .ds-preview-note{font-size:13px;line-height:1.5;color:var(--muted);margin:12px 2px 0;}
    .ds-preview-note b{color:var(--text);}
    .ds-actions{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;}

    /* Statistics tab - period toggle */
    .stats-toggle{display:inline-flex;gap:0;border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-right:12px;}
    .stats-toggle-btn{border:none;background:none;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;color:var(--muted);transition:all 0.15s ease;}
    .stats-toggle-btn:hover{background:rgba(37,99,235,0.04);}
    .stats-toggle-btn.active{background:#2563eb;color:#fff;}
    /* Statistics tab */
    .hero-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
    .hero-card{background:var(--card);border-radius:14px;border:1px solid var(--line);padding:16px;flex:1;min-width:140px;text-align:center;}
    .hero-card .hero-value{font-size:28px;font-weight:900;line-height:1.1;}
    .hero-card .hero-label{font-size:12px;color:var(--muted);margin-top:4px;}
    .hero-card .hero-sub{font-size:11px;color:var(--muted);margin-top:2px;}
    .progress-ring{display:block;margin:0 auto 4px;}
    .progress-ring .ring-bg{fill:none;stroke:var(--line);stroke-width:6;}
    .progress-ring .ring-fg{fill:none;stroke:#2563eb;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset 0.8s ease;}
    .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    @media(max-width:600px){.stats-grid{grid-template-columns:1fr;}.hero-stats{flex-direction:column;}}
    .bar-chart{display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 4px;}
    .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
    .bar-stack{width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:100%;}
    .bar{width:100%;border-radius:4px 4px 0 0;transition:height 0.5s ease;min-height:0;}
    .bar.booked{background:#2563eb;}
    .bar.cancelled{background:#ef4444;border-radius:0 0 0 0;}
    .bar-val{font-size:11px;font-weight:700;margin-bottom:2px;color:var(--fg);}
    .bar-label{font-size:10px;color:var(--muted);margin-top:4px;text-align:center;}
    .heatmap{display:flex;gap:4px;flex-wrap:wrap;}
    .heat-cell{min-width:40px;flex:1;height:44px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:background 0.3s ease;}
    .heat-cell .heat-hour{font-size:9px;font-weight:600;opacity:0.7;margin-bottom:1px;}
    .h-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
    .h-bar-label{width:36px;font-size:12px;font-weight:700;flex-shrink:0;}
    .h-bar-track{flex:1;height:22px;background:var(--line);border-radius:11px;overflow:hidden;}
    .h-bar-fill{height:100%;border-radius:11px;transition:width 0.5s ease;background:#2563eb;}
    .h-bar-pct{width:40px;font-size:12px;font-weight:600;text-align:right;flex-shrink:0;}
    .patient-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);}
    .patient-row:last-child{border-bottom:none;}
    .patient-rank{width:20px;height:20px;border-radius:50%;background:#2563eb;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .patient-name{flex:1;font-size:13px;font-weight:600;}
    .patient-count{font-size:13px;font-weight:700;color:var(--muted);}
    .capacity-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
    .capacity-label{width:56px;font-size:12px;font-weight:700;flex-shrink:0;}
    .capacity-track{flex:1;height:22px;background:var(--line);border-radius:11px;overflow:hidden;position:relative;}
    .capacity-fill{height:100%;border-radius:11px;transition:width 0.5s ease;}
    .capacity-text{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:700;color:var(--fg);}
    .stats-refresh{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .stats-period{font-size:12px;color:var(--muted);}
    .legend{display:flex;gap:12px;margin-top:8px;font-size:11px;color:var(--muted);}
    .legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:middle;}

    /* Reviews tab */
    .rev-wrap{max-width:900px;margin:0 auto;padding:0 14px;}
    .rev-title{margin:0 0 4px;font-size:18px;font-weight:800;color:var(--text);}
    .rev-subtitle{font-size:13px;color:var(--muted);margin:0 0 20px;line-height:1.5;}
    .rev-team{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:14px 18px;margin-bottom:16px;}
    .rev-team-label{font-size:13px;font-weight:700;display:block;margin-bottom:8px;color:var(--text);}
    .rev-team-checks{display:flex;gap:20px;flex-wrap:wrap;}
    .rev-check-label{font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;}
    .rev-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    @media(max-width:600px){.rev-grid{grid-template-columns:1fr;}}
    .rev-card{display:flex;flex-direction:column;overflow:hidden;}
    .rev-card-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid var(--line);margin-bottom:4px;gap:12px;}
    .rev-card-title{margin:0;font-size:15px;font-weight:700;}
    .rev-list{flex:1;min-height:48px;max-height:340px;overflow-y:auto;}
    .rev-card-footer{padding-top:12px;border-top:1px solid var(--line);margin-top:4px;}
    .rev-row{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid rgba(229,231,235,0.5);transition:background 0.15s;}
    .rev-row:last-child{border-bottom:none;}
    .rev-row:hover{background:rgba(37,99,235,0.03);border-radius:8px;}
    .rev-row label{display:flex;align-items:center;gap:10px;flex:1;cursor:pointer;min-width:0;}
    .rev-row input[type="checkbox"]{flex-shrink:0;margin:0;width:16px;height:16px;accent-color:var(--blue);}
    .rev-patient-info{min-width:0;flex:1;}
    .rev-patient-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .rev-patient-detail{font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .rev-sent-badge{flex-shrink:0;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;background:rgba(16,185,129,0.1);color:#065f46;border:1px solid rgba(16,185,129,0.25);}
    .rev-msg{margin-top:14px;}

    /* Overlay animation */
    .overlay{opacity:0;transition:opacity 0.2s ease;}
    .overlay.show{opacity:1;}
    .loadingBox{transform:translateY(10px) scale(0.98);transition:transform 0.2s ease;}
    .overlay.show .loadingBox{transform:translateY(0) scale(1);}
    /* Idle overlay */
    .idle-overlay{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(246,247,251,0.50);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer;opacity:0;visibility:hidden;pointer-events:none;transition:opacity 0.5s ease,visibility 0.5s ease;}
    .idle-overlay.show{opacity:1;visibility:visible;pointer-events:auto;}
    .idle-card{text-align:center;padding:48px 36px;max-width:340px;animation:idle-float 3s ease-in-out infinite;}
    .idle-icon{font-size:56px;margin-bottom:16px;animation:idle-pulse-icon 2.5s ease-in-out infinite;}
    .idle-title{font-size:22px;font-weight:800;color:var(--text);margin:0 0 8px 0;letter-spacing:-0.3px;}
    .idle-sub{font-size:14px;color:var(--muted);margin:0 0 24px 0;line-height:1.5;}
    .idle-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--blue);color:#fff;border-radius:40px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(37,99,235,0.35);transition:transform 0.2s,box-shadow 0.2s;}
    .idle-cta:hover{transform:scale(1.05);box-shadow:0 6px 28px rgba(37,99,235,0.45);}
    .idle-cta .idle-arrow{display:inline-block;transition:transform 0.3s;font-size:18px;}
    .idle-overlay:hover .idle-arrow{transform:translateX(4px);}
    @keyframes idle-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes idle-pulse-icon{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(0.95);}}
  </style>
<body>
<div class="wrap">
  <h1>Admin Panel</h1>
  <p class="subtitle">Dr Kevin Navarro Gera - Appointment Management</p>

  <div class="stats" id="statsBar">
    <div class="stat"><div class="num" id="statBooked">-</div><div class="label">Booked this week</div></div>
    <div class="stat"><div class="num" id="statCancelled">-</div><div class="label">Cancelled this week</div></div>
    <div class="stat stat-fill">
      <svg class="fill-ring" width="52" height="52" viewBox="0 0 52 52">
        <circle class="fill-bg" cx="26" cy="26" r="22"/>
        <circle class="fill-fg" cx="26" cy="26" r="22" id="fillRingFg" stroke-dasharray="138.2" stroke-dashoffset="138.2" transform="rotate(-90 26 26)"/>
      </svg>
      <div><div class="num" id="statToday">-</div><div class="label" id="statTodayLabel">Today</div></div>
    </div>
    <div class="stat"><div class="num" id="statTomorrow">-</div><div class="label">Tomorrow</div></div>
    <div class="stat" id="statTelemedWrap" style="background:#fff7ed;border:1px solid #fdba74;cursor:pointer;" onclick="switchTab('telemedicine')" title="Telemedicine calls today / week / total · €25 each">
      <div class="num" id="statTelemed" style="color:#c2410c;">-</div>
      <div class="label" style="color:#9a3412;">Telemed today <span id="statTelemedLive" style="display:none;background:#ef4444;color:#fff;font-size:9px;padding:1px 6px;border-radius:999px;margin-left:4px;vertical-align:middle;">LIVE</span></div>
    </div>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="schedule" onclick="switchTab('schedule')">Schedule</div>
    <div class="tab" data-tab="activity" onclick="switchTab('activity')" style="background:#eef2ff;color:#4338ca;">🔔 Activity</div>
    <div class="tab" data-tab="reserve" onclick="switchTab('reserve')" style="background:#fffbeb;color:#92400e;">🛍️ Reserve &amp; Collect</div>
    <div class="tab" data-tab="availability" onclick="switchTab('availability')">Availability</div>
    <div class="tab" data-tab="actions" onclick="switchTab('actions')">Quick Actions</div>
    <div class="tab" data-tab="statistics" onclick="switchTab('statistics')">Statistics</div>
    <div class="tab" data-tab="reminders" onclick="switchTab('reminders')">Reminders</div>
    <div class="tab" data-tab="reviews" onclick="switchTab('reviews')">Reviews</div>
    <div class="tab" data-tab="followups" onclick="switchTab('followups')">Follow-ups</div>
    <div class="tab" data-tab="referrals" onclick="switchTab('referrals')">Referrals</div>
    <div class="tab" data-tab="telemedicine" onclick="switchTab('telemedicine')" style="background:#fff7ed;color:#9a3412;">Telemedicine</div>
    <div class="tab" data-tab="linda" onclick="switchTab('linda')" style="background:#ecfdf5;color:#065f46;">Linda</div>
    <div class="tab" data-tab="lindastats" onclick="switchTab('lindastats')" style="background:#ecfdf5;color:#047857;">📊 Linda Reports</div>
    <div class="tab" data-tab="bloodtests" onclick="switchTab('bloodtests')" style="background:#fef2f2;color:#991b1b;">Blood Tests</div>
    <div class="tab" data-tab="dda" onclick="switchTab('dda')" style="background:#f5f3ff;color:#5b21b6;">&#x1F48A; DDAs</div>
    <div class="tab" data-tab="reschedule" onclick="switchTab('reschedule')" style="background:#eef2ff;color:#3730a3;">&#x1F504; Reschedule</div>
    <div class="tab" data-tab="availability-toggle" onclick="switchTab('availability-toggle')" style="background:#fef2f2;color:#b91c1c;">&#x1F6AB; Doctor Status</div>
    <div class="tab" data-tab="settings" onclick="switchTab('settings')">Settings</div>
  </div>

  <div class="msg" id="globalMsg"></div>

  <!-- SCHEDULE TAB -->
  <div class="tab-content" id="tab-activity" style="display:none;">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <h2 style="margin:0;">Recent activity</h2>
        <button class="btn btn-dark btn-sm" onclick="loadActivity()">Refresh</button>
      </div>
      <p class="subtitle" style="margin:6px 0 0;">Everything that's happened — new appointments, cancellations, telemedicine, and Reserve &amp; Collect orders. Newest first. So when you hear a beep, you'll know exactly what it was.</p>
      <div id="activityFeed" style="margin-top:12px;">Loading…</div>
    </div>
  </div>
  <div class="tab-content" id="tab-reserve" style="display:none;">
    <iframe id="reserveFrame" src="" data-loaded="0" title="Reserve & Collect" style="width:100%;height:80vh;border:0;border-radius:14px;box-shadow:var(--shadow);"></iframe>
  </div>

  <div class="tab-content" id="tab-schedule">
    <!-- Search -->
    <div class="search-wrap">
      <span class="search-icon">&#x1F50D;</span>
      <input type="text" id="searchInput" placeholder="Search patients by name or phone..." oninput="onSearchInput()">
      <button class="search-clear" id="searchClear" style="display:none;" onclick="clearSearch()">&times;</button>
    </div>

    <!-- Search results (hidden by default) -->
    <div id="searchResults" style="display:none;"></div>

    <!-- Normal schedule view -->
    <div id="scheduleView">
      <!-- Week overview -->
      <div class="card" id="weekCard">
        <div class="week-nav">
          <button class="btn btn-ghost btn-sm" onclick="changeWeek(-1)">&larr; Prev</button>
          <span class="week-label" id="weekLabel"></span>
          <button class="btn btn-ghost btn-sm" onclick="changeWeek(1)">Next &rarr;</button>
        </div>
        <div class="week-grid" id="weekGrid"></div>
      </div>

      <!-- Date navigator -->
      <div class="date-nav">
        <button class="btn btn-ghost btn-sm" onclick="changeDay(-1)">&larr;</button>
        <button class="btn btn-sm btn-dark" onclick="goToToday()">Today</button>
        <button class="btn btn-sm btn-ghost" onclick="goToTomorrow()">Tomorrow</button>
        <input type="date" id="schedDate" onchange="onSchedDateChange()">
        <button class="btn btn-ghost btn-sm" onclick="changeDay(1)">&rarr;</button>
      </div>

      <!-- Day appointments — separate tables per practitioner so blocking
           Potter's time / running quick actions never confuses Linda's
           physio bookings or Spinola appointments. -->
      <div class="card">
        <h3 id="schedHeader" class="date-header">Appointments</h3>

        <h4 style="margin:14px 0 6px 0;font-size:14px;color:#1e40af;font-weight:800;letter-spacing:.02em;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#2563eb;margin-right:6px;vertical-align:middle;"></span>
          Dr Kevin &middot; Potter&#39;s Pharmacy Clinic
        </h4>
        <div id="schedTable"></div>

        <h4 style="margin:18px 0 6px 0;font-size:14px;color:#6d28d9;font-weight:800;letter-spacing:.02em;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#8b5cf6;margin-right:6px;vertical-align:middle;"></span>
          Dr Kevin &middot; Spinola Clinic
        </h4>
        <div id="schedTableSpinola"></div>

        <h4 style="margin:18px 0 6px 0;font-size:14px;color:#047857;font-weight:800;letter-spacing:.02em;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#10b981;margin-right:6px;vertical-align:middle;"></span>
          Linda &middot; Physiotherapy
        </h4>
        <div id="schedTableLinda"></div>

        <h4 style="margin:18px 0 6px 0;font-size:14px;color:#991b1b;font-weight:800;letter-spacing:.02em;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#dc2626;margin-right:6px;vertical-align:middle;"></span>
          Blood Tests &middot; Potter&#39;s Pharmacy (08:00&ndash;09:00)
        </h4>
        <div id="schedTableBlood"></div>
      </div>

      <!-- Telemedicine — completely separate from Kevin/Spinola/Linda. Has no
           slot, no calendar event, no overlap with the appointments table.
           Shown in the Schedule view so the daily picture is complete. -->
      <div class="card" style="background:#fff7ed;border-left:4px solid #f97316;">
        <h3 style="margin:0;color:#9a3412;font-size:15px;">
          Telemedicine Calls
          <span style="font-weight:600;color:#7c2d12;font-size:12px;">&middot; 8pm&ndash;midnight &middot; &euro;25 each</span>
          <span id="schedTelemedSummary" style="font-weight:600;color:#6b7280;font-size:12px;margin-left:6px;"></span>
        </h3>
        <div id="schedTableTelemed" style="margin-top:8px;"></div>
      </div>
    </div>
  </div>

  <!-- SETTINGS TAB -->
  <!-- DOCTOR STATUS TAB -->
  <div class="tab-content" id="tab-availability-toggle" style="display:none;">
    <div class="card ds-card" id="dsCard">
      <div class="ds-head">
        <div>
          <h3 style="margin:0 0 2px;">Doctor Availability</h3>
          <p class="ds-sub">Control whether patients can reach the doctor booking page.</p>
        </div>
        <span class="ds-status" id="dsStatusPill">&hellip;</span>
      </div>

      <div class="ds-toggle-row">
        <div class="ds-toggle-copy">
          <div class="ds-toggle-title">Show &ldquo;doctor unavailable&rdquo; splash page</div>
          <div class="ds-toggle-desc">When ON, the public booking page is replaced by a splash telling patients the doctor is unavailable at Potter&rsquo;s Pharmacy and directing them to Spinola Clinic as walk&#8209;ins &mdash; with a live map, simple directions, and a QR code. Online booking (Potter&rsquo;s and Spinola) is closed while this is on. Turn OFF to restore normal booking.</div>
        </div>
        <label class="ds-switch">
          <input type="checkbox" id="dsToggle" onchange="setDoctorUnavailable(this.checked)">
          <span class="ds-slider"></span>
        </label>
      </div>

      <div class="ds-preview-note" id="dsNote"></div>
      <div class="msg" id="dsMsg"></div>

      <div class="ds-actions">
        <a class="btn" href="/" target="_blank" rel="noopener" style="background:#fff;border:1px solid var(--line);color:#374151;">&#x1F441;&#xFE0F; Preview booking page</a>
      </div>
    </div>
  </div>

  <div class="tab-content" id="tab-settings" style="display:none;">
    <div class="card">
      <h3>General Settings</h3>
      <div class="settings-grid">
        <div class="form-group"><label>Doctor Email</label><input type="email" id="setDoctorEmail"></div>
        <div class="form-group"><label>Timezone</label><input type="text" id="setTimezone" placeholder="e.g. Europe/Malta"></div>
        <div class="form-group"><label>Potter's Location</label><input type="text" id="setPottersLoc"></div>
        <div class="form-group"><label>Spinola Location</label><input type="text" id="setSpinolaLoc"></div>
        <div class="form-group"><label>Appointment Duration (minutes)</label><input type="number" id="setDuration" min="1" max="120"></div>
        <div class="form-group"><label>Advance Booking Days</label><input type="number" id="setAdvanceDays" min="1" max="90"></div>
        <div class="form-group"><label>Max Appointments Per Person (0 = unlimited)</label><input type="number" id="setMaxAppts" min="0"></div>
      </div>
    </div>

    <div class="card">
      <h3>Working Hours</h3>
      <div id="hoursEditor"></div>
    </div>

    <div style="margin-top:10px;">
      <button class="btn btn-dark" onclick="saveSettings()">Save Settings</button>
    </div>
    <div class="msg" id="settingsMsg"></div>

    <div class="card" style="margin-top:16px;">
      <h3>Data Maintenance</h3>
      <p style="font-size:13px;color:#666;margin:0 0 10px;">Archive appointment sheets older than 30 days into a single Archive sheet. This reduces the number of sheets in the spreadsheet and improves performance. Patient history, search, and reports will still access archived data normally.</p>
      <button class="btn" style="background:#6c757d;color:#fff;" onclick="archiveOldSheets()">Archive Old Sheets</button>
      <div class="msg" id="archiveMsg"></div>
    </div>
  </div>

  <!-- AVAILABILITY TAB -->
  <div class="tab-content" id="tab-availability" style="display:none;">
    <div class="card timeline-card">
      <h3>Daily Availability</h3>
      <div class="tl-date-nav">
        <button onclick="tlNavDate(-1)" title="Previous day">&#9664;</button>
        <div class="tl-date-label" id="tlDateLabel">Today</div>
        <button onclick="tlNavDate(1)" title="Next day">&#9654;</button>
      </div>
      <div class="tl-outer" id="tlOuter">
        <div class="tl-sel-label" id="tlSelLabel"></div>
        <div class="tl-wrap" id="tlBar">
          <div class="tl-tooltip" id="tlTip"></div>
        </div>
        <div class="tl-sel" id="tlSel"></div>
        <div class="tl-cursor" id="tlCursor"><div class="tl-cursor-label" id="tlCursorLabel"></div></div>
        <div class="tl-popover" id="tlPopover">
          <div class="tl-popover-type" id="tlPopType"></div>
          <div class="tl-popover-time" id="tlPopTime"></div>
          <div class="tl-popover-reason" id="tlPopReason"></div>
          <button class="tl-popover-del" id="tlPopDel">Remove</button>
        </div>
        <div class="tl-ticks" id="tlTicks"></div>
      </div>
      <div class="tl-legend">
        <span><span class="tl-legend-dot" style="background:var(--good);opacity:0.55;"></span>Regular hours</span>
        <span><span class="tl-legend-dot" style="background:var(--good);opacity:0.85;background-image:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.3) 2px,rgba(255,255,255,0.3) 4px);"></span>Extra hours</span>
        <span><span class="tl-legend-dot" style="background:var(--bad);opacity:0.7;"></span>Blocked</span>
        <span><span class="tl-legend-dot" style="background:#f3f4f6;border:1px solid var(--line);"></span>Off</span>
      </div>
      <div class="tl-actions" id="tlActions" style="display:none;">
        <button class="btn btn-good" id="tlAddBtn" onclick="tlAddExtra()">Add Extra Time</button>
        <button class="btn btn-danger" id="tlBlockBtn" onclick="tlBlockTime()">Block Time</button>
      </div>
    </div>

    <div class="card">
      <div class="avail-toggle">
        <div class="toggle-btn active-block" id="toggleBlock" onclick="setAvailMode('block')">Block Time</div>
        <div class="toggle-btn" id="toggleAdd" onclick="setAvailMode('add')">Add Extra Time</div>
      </div>

      <div class="presets" id="presets">
        <div class="preset-pill" onclick="applyPreset('today')">Today</div>
        <div class="preset-pill" onclick="applyPreset('tomorrow')">Tomorrow</div>
        <div class="preset-pill" onclick="applyPreset('week')">This week</div>
        <div class="preset-pill" onclick="applyPreset('custom')">Custom</div>
      </div>

      <div id="availForm" style="display:none;">
        <div class="form-row">
          <div class="form-group"><label>Start date</label><input type="date" id="avStartDate"></div>
          <div class="form-group"><label>End date</label><input type="date" id="avEndDate"></div>
        </div>
        <div class="time-label">Time range</div>
        <div class="time-pills" id="timePills">
          <div class="time-pill active" onclick="pickTime('allday')">All day</div>
          <div class="time-pill" onclick="pickTime('morning')">Morning 09:00-12:00</div>
          <div class="time-pill" onclick="pickTime('afternoon')">Afternoon 17:00-19:00</div>
          <div class="time-pill" onclick="pickTime('custom')">Custom</div>
        </div>
        <div id="avTimeRow" style="display:none;">
          <div class="time-spinner-row">
            <div class="time-spinner-group">
              <div class="time-label">Start</div>
              <div class="time-spinner" id="spinnerStart">
                <div class="time-drum" data-unit="h" data-spinner="start">
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','h',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="startH">09</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','h',-1)">&#x25BC;</button>
                </div>
                <div class="time-sep">:</div>
                <div class="time-drum" data-unit="m" data-spinner="start">
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','m',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="startM">00</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('start','m',-1)">&#x25BC;</button>
                </div>
              </div>
            </div>
            <div class="time-spinner-arrow">&#x2192;</div>
            <div class="time-spinner-group">
              <div class="time-label">End</div>
              <div class="time-spinner" id="spinnerEnd">
                <div class="time-drum" data-unit="h" data-spinner="end">
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','h',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="endH">12</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','h',-1)">&#x25BC;</button>
                </div>
                <div class="time-sep">:</div>
                <div class="time-drum" data-unit="m" data-spinner="end">
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','m',1)">&#x25B2;</button>
                  <div class="time-drum-val" id="endM">00</div>
                  <button type="button" class="time-drum-btn" onclick="drumStep('end','m',-1)">&#x25BC;</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Reason (optional)</label><input type="text" id="avReason" placeholder="e.g. Personal leave, Conference"></div>
        </div>
        <button class="btn btn-danger" id="avSubmitBtn" onclick="submitAvailability()">Block Time</button>
        <div class="msg" id="availMsg"></div>
      </div>
    </div>

    <div class="card">
      <h3>Active Overrides</h3>
      <div id="overridesList"><div class="empty">Loading...</div></div>
    </div>
  </div>

  <!-- QUICK ACTIONS TAB -->
  <div class="tab-content" id="tab-actions" style="display:none;">
    <div class="card">
      <h3>Cancel / Redirect / Push Appointments</h3>
      <p class="subtitle">Select a date to see appointments, then choose what to do with them.</p>
      <div class="form-row">
        <div class="form-group"><label>Date</label><input type="date" id="actionDate" onchange="loadActionAppts()"></div>
      </div>
      <div id="actionApptsList"></div>

      <div class="action-bar" id="actionBar" style="display:none;">
        <button class="btn btn-danger" onclick="processAction('cancel')">Cancel Selected</button>
        <button class="btn btn-blue" onclick="processAction('redirect_spinola')">Redirect to Spinola</button>
        <button class="btn btn-good" onclick="processAction('push_next_day')">Push to Next Day</button>
      </div>

      <div class="form-row" id="customMsgRow" style="display:none;margin-top:8px;">
        <div class="form-group"><label>Custom message for patients (optional)</label><textarea id="customMsg" rows="2" placeholder="Leave blank for default message"></textarea></div>
      </div>

      <div class="msg" id="actionMsg"></div>
    </div>

    <div class="card">
      <h3>Send Notification to Patients</h3>
      <p class="subtitle">Send a custom message to patients with appointments on a specific date.</p>
      <div class="form-row">
        <div class="form-group"><label>Date</label><input type="date" id="notifyDate" onchange="loadNotifyAppts()"></div>
      </div>
      <div id="notifyApptsList"></div>
      <div class="form-row" id="notifyMsgRow" style="display:none;">
        <div class="form-group"><label>Message</label><textarea id="notifyMsg" rows="3" placeholder="Type your message to patients..."></textarea></div>
      </div>
      <div id="notifyPresets" style="display:none;margin-bottom:8px;">
        <button class="btn btn-small" onclick="prefillNotifyMsg('reminder')">Appointment Reminder</button>
      </div>
      <button class="btn btn-blue" id="notifyBtn" style="display:none;" onclick="sendNotification()">Send Notification</button>
      <div class="msg" id="notifyResultMsg"></div>
    </div>
  </div>
</div>

<!-- STATISTICS TAB -->
<div class="tab-content" id="tab-statistics" style="display:none;">
  <div class="stats-refresh" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;">
    <div class="stats-toggle" id="statsPeriodToggle">
      <button class="stats-toggle-btn" data-period="week">This Week</button>
      <button class="stats-toggle-btn active" data-period="28">Last 28 Days</button>
      <button class="stats-toggle-btn" data-period="all">All Time</button>
    </div>
    <span class="stats-period" id="statsPeriod" style="font-size:11px;color:var(--muted);"></span>
    <button class="btn btn-sm btn-ghost" onclick="loadStatistics(_statsPeriod)">Refresh</button>
  </div>

  <!-- Hero metrics -->
  <div class="hero-stats" id="heroStats">
    <div class="hero-card">
      <svg class="progress-ring" width="72" height="72" viewBox="0 0 72 72" id="utilRing">
        <circle class="ring-bg" cx="36" cy="36" r="30"/>
        <circle class="ring-fg" cx="36" cy="36" r="30" stroke-dasharray="188.5" stroke-dashoffset="188.5" transform="rotate(-90 36 36)"/>
      </svg>
      <div class="hero-value" id="heroUtil">-</div>
      <div class="hero-label">Utilization</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroBooked">-</div>
      <div class="hero-label">Appointments</div>
      <div class="hero-sub" id="heroBookedSub">last 28 days</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroCancelRate">-</div>
      <div class="hero-label">Cancel Rate</div>
      <div class="hero-sub" id="heroCancelSub">lower is better</div>
    </div>
    <div class="hero-card">
      <div class="hero-value" id="heroPatients">-</div>
      <div class="hero-label">Unique Patients</div>
      <div class="hero-sub" id="heroRepeat">- returning</div>
    </div>
  </div>

  <!-- Charts row -->
  <div class="stats-grid">
    <div class="card" id="weeklyTrendCard">
      <h3>Weekly Trend</h3>
      <div class="bar-chart" id="weeklyTrendChart"></div>
      <div class="legend">
        <span><span class="legend-dot" style="background:#2563eb;"></span>Booked</span>
        <span><span class="legend-dot" style="background:#ef4444;"></span>Cancelled</span>
      </div>
    </div>
    <div class="card" id="peakHoursCard">
      <h3>Peak Hours</h3>
      <div class="heatmap" id="peakHoursMap"></div>
    </div>
  </div>

  <!-- Insights row -->
  <div class="stats-grid" style="margin-top:12px;">
    <div class="card" id="utilByDayCard">
      <h3>Utilization by Day</h3>
      <div id="utilByDay"></div>
    </div>
    <div class="card" id="upcomingLoadCard">
      <h3>Upcoming 7-Day Load</h3>
      <div id="upcomingLoadChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Location Split</h3>
      <div id="locationSplitChart"></div>
    </div>
    <div class="card">
      <h3>Top Patients</h3>
      <div id="topPatientsChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Cancellations</h3>
      <div id="cancelBreakdownChart"></div>
    </div>
    <div class="card">
      <h3>Busiest Day</h3>
      <div id="busiestDayChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Booking Lead Time</h3>
      <div id="leadTimeChart"></div>
    </div>
    <div class="card">
      <h3>Attendance</h3>
      <div id="attendanceChart"></div>
    </div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Doctor Actions</h3>
      <div id="doctorActionsChart"></div>
    </div>
    <div class="card">
      <h3>Bookings by Source</h3>
      <p style="margin:0 0 8px;font-size:12px;color:var(--muted);">Where bookings came from (use ?loc= on tablet URLs to track)</p>
      <div id="sourceChart"></div>
    </div>
    <div class="card">
      <h3>Bookings by Country</h3>
      <div id="countryChart"></div>
    </div>
  </div>

  <div class="card" style="margin-top:12px;">
    <h3>&#127976; Where Patients Are Staying &mdash; Hotels</h3>
    <p style="margin:0 0 10px;font-size:12px;color:var(--muted);">Which hotels &amp; accommodation send us the most visitors (from the optional field on the booking page). Shows who's referring guests to us &mdash; and how many tourists tell us where they're staying.</p>
    <div id="hotelCoverage"></div>
    <div id="hotelChart"></div>
  </div>

  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Top Cancellers</h3>
      <div id="topCancellersChart"></div>
    </div>
  </div>

  <!-- Spinola Clinic Section -->
  <div style="margin-top:24px;padding-top:16px;border-top:2px solid var(--line);">
    <h2 style="margin:0 0 4px;font-size:18px;color:#8b5cf6;">Spinola Clinic</h2>
    <p style="margin:0 0 14px;font-size:12px;color:var(--muted);">Booking statistics for Spinola (direct + redirected from Potter's)</p>

    <div class="hero-stats" id="spHeroStats">
      <div class="hero-card">
        <div class="hero-value" id="spHeroBooked" style="color:#8b5cf6;">-</div>
        <div class="hero-label">Total Bookings</div>
      </div>
      <div class="hero-card">
        <div class="hero-value" id="spHeroCancelRate">-</div>
        <div class="hero-label">Cancel Rate</div>
      </div>
      <div class="hero-card">
        <div class="hero-value" id="spHeroNoShowRate">-</div>
        <div class="hero-label">No-Show Rate</div>
      </div>
      <div class="hero-card">
        <div class="hero-value" id="spHeroPatients" style="color:#8b5cf6;">-</div>
        <div class="hero-label">Unique Patients</div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:12px;">
      <div class="card">
        <h3>Direct vs Redirected</h3>
        <div id="spDirectSplitChart"></div>
      </div>
      <div class="card" id="spWeeklyTrendCard">
        <h3>Weekly Trend</h3>
        <div class="bar-chart" id="spWeeklyTrendChart"></div>
        <div class="legend">
          <span><span class="legend-dot" style="background:#8b5cf6;"></span>Booked</span>
          <span><span class="legend-dot" style="background:#ef4444;"></span>Cancelled</span>
        </div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:12px;">
      <div class="card" id="spPeakHoursCard">
        <h3>Peak Hours</h3>
        <div class="heatmap" id="spPeakHoursMap"></div>
      </div>
      <div class="card">
        <h3>Top Patients</h3>
        <div id="spTopPatientsChart"></div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:12px;">
      <div class="card">
        <h3>Cancellations</h3>
        <div id="spCancelChart"></div>
      </div>
      <div class="card">
        <h3>Top Cancellers</h3>
        <div id="spCancellersChart"></div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:12px;">
      <div class="card">
        <h3>Bookings by Country</h3>
        <div id="spCountryChart"></div>
      </div>
      <div class="card"></div>
    </div>
  </div>

  <div class="msg" id="statsMsg"></div>
</div>

<!-- Reminders Tab -->
<div class="tab-content" id="tab-reminders" style="display:none;">
  <div class="rev-wrap">
    <h3 class="rev-title">Send Appointment Reminders</h3>
    <p class="rev-subtitle">Select patients to send a reminder email with confirm/cancel buttons.</p>

    <div class="rev-grid">
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title">Potter's Pharmacy</h3>
          <label class="rev-check-label"><input type="checkbox" onchange="toggleAllReminders(this, 'pottersReminderList')"> Select all</label>
        </div>
        <div class="rev-list" id="pottersReminderList"><div class="empty">Loading...</div></div>
        <div style="padding:10px 0;"><button class="btn btn-sm btn-dark" onclick="sendSelectedReminders('potters')">Send Reminder</button></div>
      </div>
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title" style="color:#8b5cf6;">Spinola Clinic</h3>
          <label class="rev-check-label"><input type="checkbox" onchange="toggleAllReminders(this, 'spinolaReminderList')"> Select all</label>
        </div>
        <div class="rev-list" id="spinolaReminderList"><div class="empty">Loading...</div></div>
        <div style="padding:10px 0;"><button class="btn btn-sm btn-dark" style="background:#8b5cf6;" onclick="sendSelectedReminders('spinola')">Send Reminder</button></div>
      </div>
    </div>
    <div class="msg" id="reminderMsg"></div>
  </div>
</div>

<!-- Reviews Tab -->
<div class="tab-content" id="tab-reviews" style="display:none;">
  <div class="rev-wrap">
    <h3 class="rev-title">Request Google Reviews</h3>
    <p class="rev-subtitle">Select patients to send a friendly review request email.</p>

    <div class="form-group" style="margin-bottom:14px;">
      <label>Date</label>
      <input type="date" id="reviewDate" onchange="loadReviewPatients()">
    </div>

    <div class="rev-team">
      <label class="rev-team-label">Team members present:</label>
      <div class="rev-team-checks">
        <label class="rev-check-label"><input type="checkbox" id="teamJohn" checked> John</label>
        <label class="rev-check-label"><input type="checkbox" id="teamLaura"> Laura</label>
        <label class="rev-check-label"><input type="checkbox" id="teamJovana"> Jovana</label>
      </div>
    </div>

    <div class="rev-grid">
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title">Potter's Pharmacy</h3>
          <label class="rev-check-label"><input type="checkbox" id="revSelectAllPotters" onchange="toggleRevAll('potters',this.checked)"> Select all</label>
        </div>
        <div class="rev-list" id="revPottersList"><div class="empty">Loading...</div></div>
        <div class="rev-card-footer">
          <button class="btn btn-sm btn-blue" onclick="sendReviewEmails('potters')">Send Review Request</button>
        </div>
      </div>
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title" style="color:#8b5cf6;">Spinola Clinic</h3>
          <label class="rev-check-label"><input type="checkbox" id="revSelectAllSpinola" onchange="toggleRevAll('spinola',this.checked)"> Select all</label>
        </div>
        <div class="rev-list" id="revSpinolaList"><div class="empty">Loading...</div></div>
        <div class="rev-card-footer">
          <button class="btn btn-sm" style="background:#8b5cf6;color:#fff;" onclick="sendReviewEmails('spinola')">Send Review Request</button>
        </div>
      </div>
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title" style="color:#10b981;">Linda — Physiotherapy</h3>
          <label class="rev-check-label"><input type="checkbox" id="revSelectAllLinda" onchange="toggleRevAll('linda',this.checked)"> Select all</label>
        </div>
        <div class="rev-list" id="revLindaList"><div class="empty">Loading...</div></div>
        <div class="rev-card-footer">
          <button class="btn btn-sm" style="background:#10b981;color:#fff;" onclick="sendReviewEmails('linda')">Send Review Request</button>
        </div>
      </div>
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title" style="color:#9a3412;">Telemedicine</h3>
          <label class="rev-check-label"><input type="checkbox" id="revSelectAllTelemedicine" onchange="toggleRevAll('telemedicine',this.checked)"> Select all</label>
        </div>
        <div class="rev-list" id="revTelemedicineList"><div class="empty">Loading...</div></div>
        <div class="rev-card-footer">
          <button class="btn btn-sm" style="background:#ea580c;color:#fff;" onclick="sendReviewEmails('telemedicine')">Send Review Request</button>
        </div>
      </div>
      <div class="card rev-card">
        <div class="rev-card-header">
          <h3 class="rev-card-title" style="color:#991b1b;">Blood Tests</h3>
          <label class="rev-check-label"><input type="checkbox" id="revSelectAllBloodTest" onchange="toggleRevAll('bloodtest',this.checked)"> Select all</label>
        </div>
        <div class="rev-list" id="revBloodTestList"><div class="empty">Loading...</div></div>
        <div class="rev-card-footer">
          <button class="btn btn-sm" style="background:#dc2626;color:#fff;" onclick="sendReviewEmails('bloodtest')">Send Review Request</button>
        </div>
      </div>
    </div>
    <div class="msg rev-msg" id="reviewsMsg"></div>
  </div>
</div>

<!-- Follow-ups Tab -->
<div class="tab-content" id="tab-followups" style="display:none;">
  <div class="card" style="padding:18px;">
    <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:900;">Patient Follow-ups</h3>
    <p style="margin:0 0 14px 0;color:#6b7280;font-size:13px;">Automated post-visit check-ins. Most recent first.</p>
    <div id="followUpAdminList"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- Referrals Tab -->
<div class="tab-content" id="tab-referrals" style="display:none;">
  <div class="card" style="padding:18px;">
    <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:900;">Patient Referrals</h3>
    <p style="margin:0 0 4px 0;color:#6b7280;font-size:13px;">Patients who shared your booking link and brought new patients.</p>
    <div id="referralStats" style="margin-bottom:14px;"></div>
    <div id="referralList"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- TELEMEDICINE TAB -->
<div class="tab-content" id="tab-telemedicine" style="display:none;">
  <div class="card" style="padding:18px;margin-bottom:14px;background:#fff7ed;border-left:4px solid #f97316;">
    <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:900;color:#9a3412;">Telemedicine Calls</h3>
    <p style="margin:0;color:#9a3412;font-size:13px;">Evening phone consultations between <b>8pm and midnight</b>. Flat fee <b>€25</b> per call. Notifications go to <b>info@spinolaclinic.com</b>.</p>
    <p id="telemedWindowState" style="margin:8px 0 0 0;font-size:13px;font-weight:700;"></p>
  </div>

  <!-- Period table: today / this week / last 30d / all time. -->
  <div class="card" style="padding:0;margin-bottom:14px;overflow:hidden;">
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
        <thead>
          <tr style="background:#f9fafb;text-align:left;">
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;">Period</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Calls</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Cancelled</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;color:#047857;">Doctor's revenue</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;color:#1d4ed8;">Medicine billed</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Patient bills</th>
            <th style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Avg / call</th>
          </tr>
        </thead>
        <tbody id="telPeriodTable">
          <tr><td colspan="7" style="padding:14px;text-align:center;color:#6b7280;">Loading…</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Side-by-side: status breakdown + source breakdown. -->
  <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:14px;">
    <div class="card" style="padding:16px;">
      <h4 style="margin:0 0 8px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Status (all time)</h4>
      <div id="telStatusBars" style="display:flex;flex-direction:column;gap:8px;font-size:13px;"></div>
    </div>
    <div class="card" style="padding:16px;">
      <h4 style="margin:0 0 8px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Booking source (last 30d)</h4>
      <div id="telSourceBars" style="display:flex;flex-direction:column;gap:8px;font-size:13px;"></div>
    </div>
    <div class="card" style="padding:16px;">
      <h4 style="margin:0 0 8px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Hour of call (last 30d)</h4>
      <div id="telHourly" style="display:flex;align-items:flex-end;gap:6px;height:88px;"></div>
      <div id="telHourlyLabels" style="display:flex;gap:6px;justify-content:space-between;font-size:11px;color:#9ca3af;margin-top:6px;"></div>
    </div>
  </div>

  <!-- 14-day trend bar chart. -->
  <div class="card" style="padding:16px;margin-bottom:14px;">
    <h4 style="margin:0 0 4px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Daily trend (last 14 days)</h4>
    <p style="margin:0 0 10px 0;font-size:11px;color:#9ca3af;">Each bar = billable calls that day. Hover for the doctor's revenue.</p>
    <div id="telDailyTrend" style="display:flex;align-items:flex-end;gap:4px;height:80px;"></div>
    <div id="telDailyLabels" style="display:flex;gap:4px;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:6px;"></div>
  </div>

  <!-- Top patients in last 90 days. -->
  <div class="card" style="padding:16px;margin-bottom:14px;">
    <h4 style="margin:0 0 8px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Most frequent callers (last 90 days)</h4>
    <div id="telTopPatients" style="font-size:13.5px;"></div>
  </div>

  <p style="margin:0 0 14px 0;font-size:12px;color:#6b7280;">Doctor's revenue = number of billable calls × €25. Medicine billed is what the pharmacy charges for the prescriptions written during these calls — it's added to each patient's combined bill but never counts toward the doctor's take.</p>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Add a Telemedicine Call</h3>
    <p style="margin:0 0 12px 0;color:#6b7280;font-size:13px;">Use this to log a call you've taken. The doctor and patient (if email given) will get a copy of the record.</p>
    <div class="form-row">
      <div class="form-group"><label>Patient name *</label><input type="text" id="telAddName" placeholder="Full name"></div>
      <div class="form-group"><label>Phone *</label><input type="tel" id="telAddPhone" placeholder="+356 ..."></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Email</label><input type="email" id="telAddEmail" placeholder="optional@example.com"></div>
      <div class="form-group"><label>Date</label><input type="date" id="telAddDate"></div>
    </div>
    <div class="form-group">
      <label>Comments</label>
      <textarea id="telAddComments" rows="2" placeholder="Optional notes about the call"></textarea>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <button class="btn btn-dark" onclick="addTelemedicineCall()">Add Call (€25)</button>
      <span id="telAddMsg" style="font-size:13px;"></span>
    </div>
  </div>

  <div class="card" style="padding:18px;">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <h3 style="margin:0;font-size:15px;font-weight:800;flex:1;">Calls on selected date</h3>
      <button class="btn btn-ghost btn-sm" onclick="changeTelDay(-1)">&larr;</button>
      <input type="date" id="telListDate" onchange="loadTelemedicineList()">
      <button class="btn btn-ghost btn-sm" onclick="changeTelDay(1)">&rarr;</button>
      <button class="btn btn-sm btn-dark" onclick="goTelToday()">Today</button>
    </div>
    <div id="telDaySummary" style="margin-bottom:10px;font-size:13px;color:#374151;"></div>
    <div id="telCallList"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- LINDA (PHYSIOTHERAPY) TAB -->
<div class="tab-content" id="tab-linda" style="display:none;">
  <div class="card" id="lindaIntroCard" style="padding:18px;margin-bottom:14px;background:#ecfdf5;border-left:4px solid #10b981;">
    <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:900;color:#065f46;">Linda &mdash; Physiotherapist</h3>
    <p style="margin:0;color:#065f46;font-size:13px;" id="lindaIntroLine">Potter's Clinic</p>
  </div>

  <!-- Full control center hub -->
  <a href="/linda" target="_blank" rel="noopener" class="card" style="display:flex;align-items:center;gap:14px;padding:18px;margin-bottom:14px;text-decoration:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 6px 18px rgba(16,185,129,.3);">
    <div style="font-size:30px;flex:0 0 auto;">🗓️</div>
    <div style="flex:1 1 auto;min-width:0;">
      <div style="font-size:16px;font-weight:900;">Open Linda's Diary &mdash; full control center &nbsp;&rarr;</div>
      <div style="font-size:12.5px;font-weight:700;opacity:.95;margin-top:3px;line-height:1.45;">Day &amp; week views, <b>create a new booking</b>, <b>reschedule</b> or cancel, mark attended / no-show, set booking periods, days off, block time, and add extra hours on the fly. Opens in a new tab (your admin login already grants access).</div>
    </div>
  </a>

  <!-- ═══ Appointments (day at a glance) + New booking ═══ -->
  <div class="card" style="padding:0;margin-bottom:14px;overflow:hidden;border:1px solid #d1fae5;">
    <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;background:#ecfdf5;border-bottom:1px solid #d1fae5;flex-wrap:wrap;">
      <b style="font-size:15px;color:#065f46;flex:1 1 auto;">📋 Appointments</b>
      <button class="btn btn-sm" style="background:#ecfdf5;color:#065f46;border:1px solid #10b981;" onclick="lcBulkOpen()">⇊ Bulk add</button>
      <button class="btn" style="background:#10b981;color:#fff;font-weight:800;" onclick="lcOpenNew()">＋ New booking</button>
    </div>
    <div style="display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid #eef2f0;flex-wrap:wrap;">
      <button class="btn btn-ghost btn-sm" onclick="lcNavDay(-1)">‹</button>
      <input type="date" id="lcDate" onchange="lcLoadDay()" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;flex:1 1 160px;">
      <button class="btn btn-ghost btn-sm" onclick="lcNavDay(1)">›</button>
      <button class="btn btn-sm" style="background:#ecfdf5;color:#065f46;border:1px solid #10b981;" onclick="lcToDay()">Today</button>
    </div>
    <div id="lcDayList" style="padding:12px 16px;"><div class="empty">Loading…</div></div>
  </div>

  <!-- ═══ Availability: booking periods + days off + per-day open/close ═══ -->
  <div class="card" style="padding:18px;margin-bottom:14px;border:1px solid #d1fae5;">
    <h3 style="margin:0 0 4px 0;font-size:15px;font-weight:800;color:#065f46;">🗓 Availability</h3>
    <p style="margin:0 0 14px 0;color:#6b7280;font-size:13px;">Set the stints Linda is in Malta, her weekly hours, days off, and open or block a specific day — all take effect instantly.</p>

    <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:0 0 6px;">Booking periods (stints)</div>
    <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;">Each stint = one visit's dates + its own hours. Pick the days and drag the hours; they apply to every day the stint covers.</p>
    <div id="lcWindows"><div class="empty" style="padding:8px 0;">Loading…</div></div>
    <button class="btn btn-sm" style="background:#10b981;color:#fff;margin-top:8px;" onclick="lasOpen(-1)">＋ Add a stint</button>
    <div id="lcWinMsg" style="font-size:13px;margin-top:6px;"></div>

    <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:18px 0 6px;">Days off</div>
    <div id="lcOffList"><div class="empty" style="padding:8px 0;">Loading…</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px;">
      <input type="date" id="lcOffFrom" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;">
      <span style="color:#6b7280;">→</span>
      <input type="date" id="lcOffTo" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;">
      <input type="text" id="lcOffReason" placeholder="Reason (optional)" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;flex:1 1 120px;">
      <button class="btn btn-sm btn-danger" onclick="lcAddOff()">Mark off</button>
    </div>
    <div id="lcOffMsg" style="font-size:13px;margin-top:6px;"></div>

    <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:18px 0 6px;">Open or block a specific day</div>
    <p style="margin:0 0 8px;color:#6b7280;font-size:12.5px;">Add extra hours on a quiet day, or block part of a day. For a precise drag-to-select bar, use the diary above.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <input type="date" id="lcPdDate" onchange="lcLoadPerDay()" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;">
      <input type="time" id="lcPdStart" step="900" value="09:00" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;">
      <span style="color:#6b7280;">→</span>
      <input type="time" id="lcPdEnd" step="900" value="13:00" style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;">
      <button class="btn btn-sm" style="background:#10b981;color:#fff;" onclick="lcAddExtra()">+ Extra hours</button>
      <button class="btn btn-sm btn-danger" onclick="lcAddBlock()">Block this</button>
    </div>
    <div id="lcPdList" style="margin-top:8px;"></div>
    <div id="lcPdMsg" style="font-size:13px;margin-top:6px;"></div>
  </div>

  <!-- Availability editor (quick settings — the diary above has full per-day control) -->
  <div class="card" style="padding:18px;margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;font-size:15px;font-weight:800;">Booking on/off &amp; slot length</h3>
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;cursor:pointer;">
        <input type="checkbox" id="lindaEnabled" style="width:18px;height:18px;cursor:pointer;">
        <span id="lindaEnabledLabel">Enabled</span>
      </label>
    </div>
    <p style="margin:0 0 12px 0;color:#6b7280;font-size:13px;">Turn Linda's booking button on/off and set the session length. <b>Hours are set per stint</b> (drag the bar in each stint above) — including evenings-only or mornings-only. The booking-page button shows only while she's enabled and inside a stint.</p>

    <!-- Legacy hour/date inputs kept hidden so existing load/save code stays safe; hours are now per stint. -->
    <div style="display:none;">
      <input type="date" id="lindaWinStart"><input type="date" id="lindaWinEnd">
      <input type="time" id="lindaMorningStart"><input type="time" id="lindaMorningEnd">
      <input type="time" id="lindaAfternoonStart"><input type="time" id="lindaAfternoonEnd">
      <input type="checkbox" id="lindaIncludeSat">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Slot duration (minutes)</label>
        <select id="lindaSlotMin">
          <option value="15">15</option><option value="20">20</option><option value="30">30</option><option value="45">45</option><option value="60">60</option>
        </select>
      </div>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="saveLindaConfig()">Save</button>
      <button class="btn btn-ghost" onclick="loadLindaConfig()">Reset</button>
      <span id="lindaCfgMsg" style="font-size:13px;"></span>
    </div>
  </div>

  <!-- Statistics, Reviews & Follow-ups moved to the dedicated "Linda Reports" tab. -->

  <!-- New booking / reschedule modal (Linda command center) -->
  <div id="lcModalBg" onclick="lcCloseModal(event)" style="display:none;position:fixed;inset:0;background:rgba(17,24,39,.6);z-index:9000;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;">
    <div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#ecfdf5;border-bottom:1px solid #d1fae5;">
        <b id="lcModalTitle" style="font-size:16px;color:#065f46;">New booking</b>
        <button onclick="lcCloseModal()" style="background:none;border:none;font-size:24px;line-height:1;color:#6b7280;cursor:pointer;">×</button>
      </div>
      <div style="padding:18px;">
        <div id="lcRescheduleInfo" style="display:none;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:13px;"></div>
        <div id="lcPatientFields">
          <div style="position:relative;margin-bottom:8px;">
            <input type="text" id="lcName" autocomplete="off" oninput="lcAcSearch()" onfocus="lcAcSearch()" onblur="setTimeout(lcAcHide,150)" placeholder="Full name (start typing to find past clients)" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;">
            <div id="lcAcList" onmousedown="event.preventDefault()" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:20;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.15);max-height:230px;overflow:auto;margin-top:4px;"></div>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <input type="tel" id="lcPhone" placeholder="Phone" style="flex:1;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;">
            <input type="email" id="lcEmail" placeholder="Email" style="flex:1;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;">
          </div>
          <textarea id="lcComments" placeholder="Comments (optional)" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;min-height:52px;margin-bottom:8px;"></textarea>
        </div>
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:4px 0 6px;">Date</div>
        <input type="date" id="lcBookDate" onchange="lcLoadSlots()" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:4px 0 6px;flex-wrap:wrap;">
          <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;">Time</span>
          <label id="lcCustomLabel" style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#065f46;cursor:pointer;"><input type="checkbox" id="lcCustomToggle" onchange="lcToggleCustom()"> Custom time</label>
        </div>
        <div id="lcSlots" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px;"><div style="color:#6b7280;font-size:13px;grid-column:1/-1;">Pick a date first.</div></div>
        <div id="lcCustomWrap" style="display:none;">
          <input type="time" id="lcCustomTime" step="300" oninput="lcUpdateBookBtn()" style="width:100%;padding:11px;border:1px solid #10b981;border-radius:9px;font-size:16px;">
          <div style="font-size:12px;color:#6b7280;margin-top:5px;">Any time — e.g. 18:15. Books off-grid regardless of the usual slots.</div>
        </div>
        <label id="lcNotifyWrap" style="display:none;align-items:center;gap:8px;font-size:13px;margin-top:12px;cursor:pointer;"><input type="checkbox" id="lcNotify" checked> Email the patient about the change</label>
        <button class="btn" id="lcBookBtn" style="background:#10b981;color:#fff;font-weight:800;width:100%;margin-top:14px;" onclick="lcSubmit()" disabled>Select a time</button>
        <div id="lcModalMsg" style="font-size:13px;margin-top:8px;"></div>
      </div>
    </div>
  </div>
</div>

<!-- Admin stint editor: date range + weekday pills + compose-hours bar -->
<div id="lasBg" onclick="lasClose(event)" style="display:none;position:fixed;inset:0;background:rgba(17,24,39,.6);z-index:9100;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;">
  <div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#ecfdf5;border-bottom:1px solid #d1fae5;">
      <b id="lasTitle" style="font-size:16px;color:#065f46;">Add a stint</b>
      <button onclick="lasClose()" style="background:none;border:none;font-size:24px;line-height:1;color:#6b7280;cursor:pointer;">×</button>
    </div>
    <div style="padding:18px;">
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:0 0 6px;">Dates Linda is here</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <input type="date" id="lasFrom" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;">
        <span style="color:#6b7280;font-weight:800;">→</span>
        <input type="date" id="lasTo" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;">
      </div>
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:0 0 6px;">Working days</div>
      <div id="lasPills" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;"></div>
      <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;margin:0 0 6px;">Hours (drag the bar)</div>
      <div id="lasBar" style="position:relative;height:58px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;cursor:crosshair;overflow:visible;touch-action:none;user-select:none;-webkit-user-select:none;"></div>
      <div style="position:relative;height:14px;margin-top:3px;">
        <span style="position:absolute;left:0;font-size:10px;color:#6b7280;font-weight:700;">07</span>
        <span style="position:absolute;left:20%;transform:translateX(-50%);font-size:10px;color:#6b7280;font-weight:700;">10</span>
        <span style="position:absolute;left:40%;transform:translateX(-50%);font-size:10px;color:#6b7280;font-weight:700;">13</span>
        <span style="position:absolute;left:60%;transform:translateX(-50%);font-size:10px;color:#6b7280;font-weight:700;">16</span>
        <span style="position:absolute;left:80%;transform:translateX(-50%);font-size:10px;color:#6b7280;font-weight:700;">19</span>
        <span style="position:absolute;right:0;font-size:10px;color:#6b7280;font-weight:700;">22</span>
      </div>
      <div id="lasSummary" style="font-size:13px;font-weight:700;margin-top:9px;"></div>
      <input type="text" id="lasNote" placeholder="Note (optional) — e.g. 'summer visit'" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;margin-top:12px;">
      <button class="btn" style="background:#10b981;color:#fff;font-weight:800;width:100%;margin-top:14px;" onclick="lasSave()">Save stint</button>
      <div id="lasMsg" style="font-size:13px;margin-top:8px;"></div>
    </div>
  </div>
</div>

<!-- Bulk booking: paste a table of Date, Time, Name, Phone, Email -->
<div id="lcBulkBg" onclick="lcBulkClose(event)" style="display:none;position:fixed;inset:0;background:rgba(17,24,39,.6);z-index:9100;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;">
  <div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:720px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#ecfdf5;border-bottom:1px solid #d1fae5;">
      <b style="font-size:16px;color:#065f46;">Bulk add bookings</b>
      <button onclick="lcBulkClose()" style="background:none;border:none;font-size:24px;line-height:1;color:#6b7280;cursor:pointer;">×</button>
    </div>
    <div style="padding:18px;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Paste rows from a spreadsheet — one booking per line, columns in this order: <b>Date, Time, Name, Phone, Email</b>. Dates like <code>2026-07-06</code> or <code>06/07/2026</code> and times like <code>16:30</code> or <code>4:30pm</code> both work. Phone or email — at least one.</p>
      <textarea id="lcBulkText" oninput="lcBulkParse()" placeholder="2026-07-06, 16:30, Maria Camilleri, +35679123456, maria@example.com&#10;06/07/2026, 5:00pm, John Grech, +35699887766, john@example.com" style="width:100%;min-height:120px;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:14px;font-family:monospace;white-space:pre;overflow:auto;"></textarea>
      <div id="lcBulkPreview" style="margin-top:12px;"></div>
      <button class="btn" id="lcBulkBtn" style="background:#10b981;color:#fff;font-weight:800;width:100%;margin-top:12px;" onclick="lcBulkSubmit()" disabled>Book all</button>
      <div id="lcBulkMsg" style="font-size:13px;margin-top:8px;"></div>
    </div>
  </div>
</div>

<!-- Edit appointment / client details -->
<div id="lcEditBg" onclick="lcEditClose(event)" style="display:none;position:fixed;inset:0;background:rgba(17,24,39,.6);z-index:9100;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;">
  <div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#f5f3ff;border-bottom:1px solid #ddd6fe;">
      <b style="font-size:16px;color:#5b21b6;">Edit details</b>
      <button onclick="lcEditClose()" style="background:none;border:none;font-size:24px;line-height:1;color:#6b7280;cursor:pointer;">×</button>
    </div>
    <div style="padding:18px;">
      <div id="lcEditWhen" style="font-size:13px;color:#6b7280;margin-bottom:10px;"></div>
      <input type="text" id="lcEditName" placeholder="Full name" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;margin-bottom:8px;" oninput="lcEditAutosave()" onchange="lcEditAutosave()">
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <input type="tel" id="lcEditPhone" placeholder="Phone" style="flex:1;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;" oninput="lcEditAutosave()" onchange="lcEditAutosave()">
        <input type="email" id="lcEditEmail" placeholder="Email" style="flex:1;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;" oninput="lcEditAutosave()" onchange="lcEditAutosave()">
      </div>
      <textarea id="lcEditComments" placeholder="Comments (optional)" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:9px;font-size:15px;min-height:52px;" oninput="lcEditAutosave()" onchange="lcEditAutosave()"></textarea>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin-top:10px;cursor:pointer;"><input type="checkbox" id="lcEditApply" onchange="lcEditAutosave()"> Also fix all their <b>upcoming</b> appointments</label>
      <div style="font-size:12px;color:#9ca3af;margin-top:8px;">Changes save automatically as you type.</div>
      <button class="btn" style="background:#7c3aed;color:#fff;font-weight:800;width:100%;margin-top:14px;" onclick="lcEditSave()">Done</button>
      <div id="lcEditMsg" style="font-size:13px;margin-top:8px;"></div>
    </div>
  </div>
</div>

<!-- LINDA REPORTS TAB (stats, reviews, follow-ups — kept out of the day-to-day Linda tab) -->
<div class="tab-content" id="tab-lindastats" style="display:none;">
  <div class="card" style="padding:18px;margin-bottom:14px;background:#ecfdf5;border-left:4px solid #10b981;">
    <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:900;color:#065f46;">Linda &mdash; Reports</h3>
    <p style="margin:0;color:#065f46;font-size:13px;">Statistics, review requests and follow-ups for the physiotherapy clinic.</p>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Statistics</h3>
    <div id="lindaStats"><div class="empty">Loading...</div></div>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Upcoming Appointments</h3>
    <div id="lindaUpcoming"><div class="empty">Loading...</div></div>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 6px 0;font-size:15px;font-weight:800;">Reviews</h3>
    <p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">Send Google review requests to Linda's patients from a selected date.</p>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
      <label style="font-size:13px;color:#374151;">Date:</label>
      <input type="date" id="lindaReviewDate" style="padding:6px;border:1px solid #e5e7eb;border-radius:6px;">
      <button class="btn" onclick="loadLindaReviews()">Load patients</button>
    </div>
    <div id="lindaReviewList"><div class="empty">Pick a date and click Load.</div></div>
    <button class="btn btn-primary" id="lindaReviewSendBtn" style="display:none;margin-top:10px;" onclick="sendLindaReviews()">Send Review Requests</button>
  </div>

  <div class="card" style="padding:18px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Follow-ups</h3>
    <div id="lindaFollowUps"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- BLOOD TESTS TAB -->
<div class="tab-content" id="tab-bloodtests" style="display:none;">
  <div class="card" style="padding:18px;background:#fef2f2;border-left:4px solid #dc2626;margin-bottom:14px;">
    <h3 style="margin:0 0 6px 0;color:#991b1b;font-size:16px;">Blood Tests, STI &amp; Urinalysis</h3>
    <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.5;">Staff-run test bookings on their own schedule. Independent of Dr Kevin's availability &mdash; a doctor-off event does not affect these. Use the <b>Location</b> toggle below to hold them at Spinola Clinic or Potter's Pharmacy.</p>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Configuration</h3>
    <div class="settings-grid">
      <div class="form-group">
        <label>Enabled</label>
        <select id="btEnabled"><option value="1">Yes &mdash; accept bookings</option><option value="0">No &mdash; hide button</option></select>
      </div>
      <div class="form-group">
        <label>Location</label>
        <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;font-size:14px;">
          <input type="checkbox" id="btAtPotters" style="width:auto;"> Run at Potter&#39;s Pharmacy <span style="color:#6b7280;">(unchecked = Spinola Clinic)</span>
        </label>
      </div>
      <div class="form-group">
        <label>Slot duration (minutes)</label>
        <input type="number" id="btSlotMin" min="5" max="60">
      </div>
      <div class="form-group">
        <label>Price (euros, 0 = TBD)</label>
        <input type="number" id="btPriceEuros" min="0" step="0.5">
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label>Test types (one per line, optional)</label>
        <textarea id="btTypes" rows="3" placeholder="Full blood count&#10;Glucose&#10;Cholesterol"></textarea>
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label>Hours (JSON per weekday, [{"start":"08:00","end":"09:00"}])</label>
        <textarea id="btHours" rows="4" style="font-family:monospace;font-size:12px;"></textarea>
      </div>
    </div>
    <div style="margin-top:10px;">
      <button class="btn btn-dark" onclick="saveBloodTestConfig()">Save Configuration</button>
    </div>
    <div class="msg" id="btConfigMsg"></div>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Day Off</h3>
    <p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">Mark a date as closed for blood tests (existing bookings on that date stay; admin should manually reschedule or send to Spinola).</p>
    <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
      <div class="form-group" style="margin:0;"><label>Date</label><input type="date" id="btOffDate"></div>
      <div class="form-group" style="margin:0;flex:1;min-width:200px;"><label>Reason (optional)</label><input type="text" id="btOffReason"></div>
      <button class="btn btn-dark" onclick="addBloodTestOff()">Add Day Off</button>
    </div>
    <div id="btOffList" style="margin-top:10px;"><div class="empty">Loading...</div></div>
  </div>

  <div class="card" style="padding:18px;">
    <h3 style="margin:0 0 10px 0;font-size:15px;font-weight:800;">Upcoming Bookings</h3>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
      <label style="font-size:13px;color:#374151;">Date:</label>
      <input type="date" id="btApptsDate" onchange="loadBloodTestAppts()">
      <button class="btn" onclick="loadBloodTestAppts()">Refresh</button>
    </div>
    <div id="btApptsList"><div class="empty">Pick a date.</div></div>
  </div>
</div>

<!-- DDA (CONTROLLED DRUGS) TAB -->
<div class="tab-content" id="tab-dda" style="display:none;">
  <div class="card" style="padding:18px;margin-bottom:14px;background:#f5f3ff;border-left:4px solid #7c3aed;">
    <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:900;color:#5b21b6;">&#x1F48A; DDA Register</h3>
    <p style="margin:0;color:#5b21b6;font-size:13px;line-height:1.5;">Paste one or more controlled-drug rows below (copied straight from the dispensing system, tab-separated). They&#39;re saved to the table &mdash; newest at the top &mdash; and any row can be reprinted as a <b>75&times;50&nbsp;mm</b> label.</p>
  </div>

  <div class="card" style="padding:18px;margin-bottom:14px;">
    <h3 style="margin:0 0 8px 0;font-size:15px;font-weight:800;">Paste rows</h3>
    <p style="margin:0 0 10px 0;color:#6b7280;font-size:12px;">Each line is one entry. Columns (tab-separated): Drug, Qty, Code, Patient, PV, Year, Prescriber, Doctor&nbsp;code, Date, Flag.</p>
    <textarea id="ddaPaste" rows="3" placeholder="Zolpidem 10mg (Tablet)&#9;7&#9;C960953&#9;Jose Pedro Dinis Lopes&#9;PV&#9;1985&#9;Kevin Navarro Gera&#9;E67579&#9;04/06/2026 00:00:00&#9;False" style="width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;white-space:pre;overflow-x:auto;"></textarea>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;">
      <button class="btn btn-dark" onclick="addDdaEntries()">Add to table</button>
      <span id="ddaAddMsg" style="font-size:13px;"></span>
    </div>
  </div>

  <div class="card" style="padding:18px;">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <h3 style="margin:0;font-size:15px;font-weight:800;flex:1;">Saved entries</h3>
      <button class="btn btn-sm" style="background:#7c3aed;color:#fff;" onclick="printSelectedDda()">&#x1F5A8;&#xFE0F; Print selected label</button>
      <button class="btn btn-ghost btn-sm" onclick="loadDdaList()">Refresh</button>
    </div>
    <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;">Click a row to select it, then print &mdash; or use the print button on the row.</p>
    <div id="ddaList"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- RESCHEDULE TAB -->
<div class="tab-content" id="tab-reschedule" style="display:none;">
  <div class="card" style="background:#eef2ff;border-left:4px solid #4f46e5;margin-bottom:14px;">
    <h3 style="margin:0 0 6px 0;color:#3730a3;font-size:16px;">Reschedule any appointment</h3>
    <p style="margin:0;color:#4338ca;font-size:13px;line-height:1.5;">Move <b>any</b> appointment &mdash; Dr Kevin (Potter&#39;s &amp; Spinola), Linda physiotherapy and blood tests &mdash; to any location, date and time. No slot restrictions. Search by name, phone or email, or browse a whole day. The patient is emailed their new details (you can switch that off per move).</p>
  </div>

  <div class="card">
    <div class="form-row">
      <div class="form-group">
        <label>Search patient (name / phone / email)</label>
        <input type="text" id="rsSearch" placeholder="Type at least 2 characters..." oninput="rsOnSearch()" autocomplete="off">
      </div>
      <div class="form-group" style="max-width:220px;">
        <label>Or browse by date</label>
        <input type="date" id="rsDate" onchange="rsLoadDate()">
      </div>
    </div>
    <div id="rsList"><div class="empty">Search for a patient or pick a date to see appointments.</div></div>
  </div>
</div>

<!-- Reschedule modal -->
<div class="overlay" id="rsOverlay" role="dialog" aria-modal="true">
  <div class="patient-modal" style="max-width:520px;">
    <div class="patient-modal-header">
      <h3 style="margin:0;">Reschedule appointment</h3>
      <button class="btn btn-ghost btn-sm" onclick="rsCloseForm()">&#x2715;</button>
    </div>
    <div id="rsCurrent" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.55;"></div>
    <div class="form-row">
      <div class="form-group"><label>New date</label><input type="date" id="rsNewDate" onchange="rsResetForce()"></div>
      <div class="form-group"><label>New time</label><input type="time" id="rsNewTime" step="300" onchange="rsResetForce()"></div>
      <div class="form-group" style="max-width:120px;"><label>Duration (min)</label><input type="number" id="rsNewDur" min="5" max="480" step="5" onchange="rsResetForce()"></div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Clinic</label>
        <select id="rsNewClinic" onchange="rsClinicChanged()">
          <option value="potters">Dr Kevin &middot; Potter&#39;s</option>
          <option value="spinola">Dr Kevin &middot; Spinola</option>
          <option value="linda">Linda &middot; Physiotherapy</option>
        </select>
      </div>
      <div class="form-group"><label>Location</label><input type="text" id="rsNewLoc" placeholder="Location address"></div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin:8px 0 2px;cursor:pointer;">
      <input type="checkbox" id="rsNotify" checked style="width:auto;margin:0;"> Email the patient their new appointment details
    </label>
    <div class="msg" id="rsMsg"></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button class="btn btn-ghost" onclick="rsCloseForm()">Cancel</button>
      <button class="btn btn-dark" id="rsSaveBtn" onclick="rsSubmit()">Reschedule</button>
    </div>
  </div>
</div>

<!-- Telemedicine Prescription modal -->
<div class="overlay" id="telPrescriptionOverlay" role="dialog" aria-modal="true">
  <div class="patient-modal" style="max-width:560px;">
    <div class="patient-modal-header">
      <h3 style="margin:0;">Prescription &amp; Receipt</h3>
      <button class="btn btn-ghost btn-sm" onclick="closeTelPrescription()">&#x2715;</button>
    </div>
    <div style="padding:18px;">
      <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:1.5;">Issues a professional prescription/receipt to the patient by email. Doctor's fee (€25) and medicine total are listed separately so it can be used for an insurance claim.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:14px;">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;font-weight:800;margin-bottom:6px;">Patient</div>
        <div style="font-weight:800;font-size:15px;color:#111827;" id="telRxPatientName">—</div>
        <div style="font-size:13px;color:#374151;margin-top:2px;" id="telRxPatientPhone">—</div>
        <div style="font-size:13px;color:#374151;" id="telRxPatientEmail">—</div>
      </div>
      <label class="label" style="font-weight:700;">Medicines (one per line)</label>
      <div id="telRxMedicineList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;"></div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;">
        <button type="button" class="btn btn-sm btn-ghost" onclick="addRxMedicineRow()">+ Add medicine</button>
        <span style="font-size:12px;color:#9ca3af;">No prices per medicine — only the total below is billed.</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div>
          <label class="label">Medicine total (€)</label>
          <input type="number" min="0" step="0.01" id="telRxMedTotal" placeholder="0.00">
        </div>
        <div>
          <label class="label">Doctor's fee (€)</label>
          <input type="text" id="telRxFee" value="25.00" disabled style="background:#f3f4f6;color:#6b7280;">
        </div>
      </div>
      <div style="background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:15px;">
        <span>Patient total due</span>
        <span id="telRxTotal">€25.00</span>
      </div>
      <div id="telRxMsg" style="margin-top:12px;font-size:13px;"></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;flex-wrap:wrap;">
        <button class="btn btn-ghost" onclick="closeTelPrescription()">Cancel</button>
        <button class="btn btn-ghost" id="telRxSaveBtn" onclick="saveTelPrescription(false)">Save only</button>
        <button class="btn btn-dark" id="telRxSendBtn" onclick="saveTelPrescription(true)" style="background:#ea580c;">Save &amp; Email Patient</button>
      </div>
    </div>
  </div>
</div>

<!-- Patient History modal -->
<div class="overlay" id="patientOverlay">
  <div class="patient-modal">
    <div class="patient-modal-header">
      <h3 id="patientTitle" style="margin:0;">Patient History</h3>
      <button class="btn btn-ghost btn-sm" onclick="hidePatientHistory()">&#x2715;</button>
    </div>
    <div id="patientContent"><div class="empty">Loading...</div></div>
  </div>
</div>

<!-- Confirm modal -->
<div class="overlay" id="confirmOverlay" role="dialog" aria-modal="true">
  <div class="loadingBox" style="flex-direction:column;align-items:stretch;gap:12px;max-width:420px;">
    <h3 id="confirmTitle" style="margin:0;font-size:15px;font-weight:800;">Confirm</h3>
    <p id="confirmBody" style="margin:0;font-size:13px;color:var(--muted);line-height:1.45;"></p>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
      <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
      <button class="btn btn-danger" id="confirmOk">Confirm</button>
    </div>
  </div>
</div>

<div class="overlay" id="loadingOverlay">
  <div class="loadingBox">
    <div class="spinner"></div>
    <div class="loadingText">
      <h4 id="loadingTitle">Loading...</h4>
      <div id="loadingDesc">Please wait.</div>
    </div>
  </div>
</div>

<div class="refresh-bar" id="refreshBar">
  <div class="refresh-info">
    <span><span class="refresh-dot"></span> Auto-refresh</span>
    <span id="refreshLastText">Last refreshed: just now</span>
  </div>
  <span class="refresh-countdown" id="refreshCountdown">Refreshes in: 30s</span>
</div>

<!-- Idle overlay — shown after inactivity to pause all background fetches -->
<div class="idle-overlay" id="idleOverlay">
  <div class="idle-card">
    <div class="idle-icon">⚙️</div>
    <div class="idle-title">Admin Dashboard Paused</div>
    <div class="idle-sub">Background updates are paused to<br>save resources. Tap to resume.</div>
    <div class="idle-cta">Resume Dashboard <span class="idle-arrow">→</span></div>
  </div>
</div>

<div id="liveToast" style="display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;background:#111827;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.3);transition:opacity 0.3s;pointer-events:none;">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:8px;animation:pulse-dot 1s ease-in-out;"></span>
  <span id="liveToastText">New booking received</span>
</div>
<style>@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}</style>

<script>
var SIG = ${JSON.stringify(sig)};
var RESERVE_URL = ${JSON.stringify((env.RESERVE_COLLECT_URL || '').replace(/\/$/, ''))};
var RESERVE_SIG = ${JSON.stringify(env.RESERVE_ADMIN_SIG || '')};
var _silentRefresh = false;
var _audioCtx = null;
var _userInteracted = false;

// Enable audio after first user interaction (Chrome requirement)
document.addEventListener('click', function() {
  if (!_userInteracted) {
    _userInteracted = true;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
}, { once: false });
document.addEventListener('keydown', function() {
  if (!_userInteracted) {
    _userInteracted = true;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
}, { once: false });

function playNotifSound() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
  }
  try {
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    var osc = _audioCtx.createOscillator();
    var gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, _audioCtx.currentTime);
    osc.frequency.setValueAtTime(1174, _audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, _audioCtx.currentTime + 0.4);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 0.4);
  } catch(e) {}
}

var _toastTimer = null;
function showLiveToast(msg) {
  var el = document.getElementById('liveToast');
  var txt = document.getElementById('liveToastText');
  if (!el || !txt) return;
  txt.textContent = msg || 'Schedule updated';
  el.style.display = 'block';
  el.style.opacity = '1';
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() {
    el.style.opacity = '0';
    setTimeout(function() { el.style.display = 'none'; }, 300);
  }, 4000);
}

// ── API Layer (fetch instead of google.script.run) ──
async function apiCall(endpoint, opts) {
  opts = opts || {};
  var sep = endpoint.includes('?') ? '&' : '?';
  var url = '/api/admin/' + endpoint + sep + 'sig=' + encodeURIComponent(SIG);
  var fetchOpts = { credentials: 'same-origin' };
  if (opts.method) fetchOpts.method = opts.method;
  if (opts.body) {
    fetchOpts.method = fetchOpts.method || 'POST';
    fetchOpts.headers = { 'Content-Type': 'application/json' };
    fetchOpts.body = JSON.stringify(opts.body);
  }
  var res = await fetch(url, fetchOpts);
  return res.json();
}

function gasCall(method, args) {
  // Map old GAS method names to REST endpoints
  var map = {
    'apiAdminGetDashboard': { ep: 'dashboard' },
    'apiAdminGetDateAppointments': { ep: 'appointments?date=' },
    'apiAdminProcessAppointments': { ep: 'process', post: true },
    'apiAdminCancelAppointment': { ep: 'cancel-appointment', post: true },
    'apiAdminMarkDoctorOff': { ep: 'doctor-off', post: true },
    'apiAdminRemoveDoctorOff': { ep: 'doctor-off/', del: true },
    'apiAdminAddExtraSlots': { ep: 'extra-slots', post: true },
    'apiAdminRemoveExtraSlots': { ep: 'extra-slots/', del: true },
    'apiAdminNotifyPatients': { ep: 'notify', post: true },
    'apiAdminMarkAttendance': { ep: 'attendance', post: true },
    'apiAdminGetWeekOverview': { ep: 'week-overview?week=' },
    'apiAdminSearchAppointments': { ep: 'search?q=' },
    'apiAdminGetStatistics': { ep: 'stats' },
    'apiAdminGetSettings': { ep: 'settings' },
    'apiAdminSaveSettings': { ep: 'settings', post: true },
    'apiAdminGetReviewPatients': { ep: 'reviews' },
    'apiAdminSendReviewRequests': { ep: 'reviews/send', post: true },
    'apiAdminGetPatientHistory': { ep: 'patient-history?email=' },
    'apiAdminSetDoctorOffDates': { ep: 'doctor-off-dates', post: true },
    'apiAdminArchiveOldSheets': { ep: 'archive', post: true },
    'apiPoll': { ep: '../poll', poll: true }
  };
  return map[method] || null;
}

// ── Response transformer: D1 snake_case → old GAS camelCase ──
function transformAppt(a) {
  if (!a) return a;
  return {
    appointmentId: a.id || a.appointmentId,
    dateKey: a.date_key || a.dateKey,
    startTime: a.start_time || a.startTime,
    endTime: a.end_time || a.endTime,
    serviceId: a.service_id || a.serviceId,
    serviceName: a.service_name || a.serviceName,
    fullName: a.full_name || a.fullName,
    email: a.email,
    phone: a.phone,
    comments: a.comments,
    hotel: a.hotel || '',
    status: a.status,
    location: a.location,
    createdAt: a.created_at || a.createdAt,
    updatedAt: a.updated_at || a.updatedAt,
    token: a.token,
    calendarEventId: a.calendar_event_id || a.calendarEventId,
    cancelledAt: a.cancelled_at || a.cancelledAt,
    cancelReason: a.cancel_reason || a.cancelReason,
    clinic: a.clinic,
    confirmed: a.confirmed || '',
    reminder_sent: a.reminder_sent || '',
    bookingSource: a.booking_source || a.bookingSource || ''
  };
}
function transformOff(o) {
  if (!o) return o;
  return {
    rowIndex: o.id || o.rowIndex,
    startDate: o.start_date || o.startDate,
    endDate: o.end_date || o.endDate,
    startTime: o.start_time || o.startTime,
    endTime: o.end_time || o.endTime,
    reason: o.reason
  };
}
function transformExtra(e) {
  if (!e) return e;
  return {
    rowIndex: e.id || e.rowIndex,
    date: e.date_key || e.date,
    startTime: e.start_time || e.startTime,
    endTime: e.end_time || e.endTime,
    reason: e.reason
  };
}
function transformResponse(method, res) {
  if (!res) return res;
  // Transform appointments arrays
  if (res.todayAppointments) res.todayAppointments = res.todayAppointments.map(transformAppt);
  if (res.tomorrowAppointments) res.tomorrowAppointments = res.tomorrowAppointments.map(transformAppt);
  if (res.appointments) res.appointments = res.appointments.map(transformAppt);
  if (res.results) res.results = res.results.map(transformAppt);
  // Transform off/extra entries
  if (res.doctorOffEntries) res.doctorOffEntries = res.doctorOffEntries.map(transformOff);
  if (res.extraSlotEntries) res.extraSlotEntries = res.extraSlotEntries.map(transformExtra);
  // Transform week overview
  if (res.days) {
    res.days.forEach(function(d) {
      if (d.appointments) d.appointments = d.appointments.map(transformAppt);
    });
  }
  // Patient history
  if (res.history) res.history = res.history.map(transformAppt);
  // Reviews
  if (res.potters) res.potters = res.potters.map(transformAppt);
  if (res.spinola) res.spinola = res.spinola.map(transformAppt);
  // Statistics: flatten res.stats to top level for old code compatibility
  if (method === 'apiAdminGetStatistics' && res.stats && !res.totalBooked) {
    var st = res.stats;
    for (var k in st) res[k] = st[k];
    // Map field names the old code expects
    res.totalBooked = st.totalBooked || st.total - st.cancelled || 0;
    res.totalCancelled = st.cancelled || 0;
    res.totalUniquePatients = st.totalUniquePatients || st.uniquePatients || 0;
    res.utilization = st.utilization || 0;
    res.repeatPatients = st.repeatPatients || 0;
    res.trendDirection = st.trendDirection || '';
    res.trendPct = st.trendPct || 0;
    res.weeklyTrend = st.weeklyTrend || [];
    res.hourlyDistribution = st.hourlyDistribution || [];
    res.utilizationByDay = st.utilizationByDay || st.byDay || {};
    res.locationSplit = st.locationSplit || { potters: st.pottersCount || 0, spinola: st.spinolaCount || 0 };
    res.busiestDay = st.busiestDay || null;
    res.upcomingLoad = st.upcomingLoad || [];
    res.countryBreakdown = st.countryBreakdown || [];
    res.sourceBreakdown = st.sourceBreakdown || [];
    res.hotelBreakdown = st.hotelBreakdown || [];
    res.hotelStats = st.hotelStats || { withHotel: 0, withoutHotel: 0, uniqueHotels: 0 };
    res.cancelBreakdown = st.cancelBreakdown || { byDoctor: st.cancelledDoctor || 0, byPatient: st.cancelledClient || 0 };
    res.period = st.period || { from: '', to: '' };
    res.generated = st.generated || '';
    // Spinola sub-object: alias hourlyDistribution -> peakHours for old rendering code
    if (res.spinola) {
      res.spinola.peakHours = res.spinola.hourlyDistribution || res.spinola.peakHours || [];
    }
  }
  return res;
}

// Shim: replaces google.script.run pattern
var google = { script: { run: null } };
(function() {
  function GasRunner() {
    this._onSuccess = function(){};
    this._onFailure = function(e){ console.error(e); };
  }
  GasRunner.prototype.withSuccessHandler = function(fn) { this._onSuccess = fn; return this; };
  GasRunner.prototype.withFailureHandler = function(fn) { this._onFailure = fn; return this; };

  // Dynamically add all known methods
  var methods = [
    'apiAdminGetDashboard', 'apiAdminGetDateAppointments', 'apiAdminProcessAppointments',
    'apiAdminCancelAppointment',
    'apiAdminMarkDoctorOff', 'apiAdminRemoveDoctorOff', 'apiAdminAddExtraSlots',
    'apiAdminRemoveExtraSlots', 'apiAdminNotifyPatients', 'apiAdminMarkAttendance',
    'apiAdminGetWeekOverview', 'apiAdminSearchAppointments', 'apiAdminGetStatistics',
    'apiAdminGetSettings', 'apiAdminSaveSettings', 'apiAdminGetReviewPatients',
    'apiAdminSendReviewRequests', 'apiAdminGetPatientHistory', 'apiAdminSetDoctorOffDates',
    'apiAdminArchiveOldSheets', 'apiPoll'
  ];

  methods.forEach(function(method) {
    GasRunner.prototype[method] = function(sig /*, ...args */) {
      var args = Array.prototype.slice.call(arguments, 1);
      var self = this;
      var info = gasCall(method, args);
      if (!info) { self._onFailure('Unknown method: ' + method); return; }

      var endpoint = info.ep;
      var opts = {};

      if (info.del) {
        // Delete: ID is the first arg
        endpoint += args[0];
        opts.method = 'DELETE';
      } else if (info.post) {
        opts.body = args[0] || {};
      } else if (endpoint.indexOf('=') > -1) {
        // GET with query param
        endpoint += encodeURIComponent(args[0] || '');
      } else if (info.poll) {
        // Poll endpoint
        endpoint = 'dashboard';
      }

      apiCall(endpoint, opts)
        .then(function(res) { self._onSuccess(transformResponse(method, res)); })
        .catch(function(err) { self._onFailure(err); });
    };
  });

  Object.defineProperty(google.script, 'run', {
    get: function() { return new GasRunner(); }
  });
})();

var _schedDate = ''; // currently viewed date in schedule tab
var _weekStart = ''; // Monday of currently viewed week
var _searchTimer = null;

function showLoading(title, desc) {
  document.getElementById('loadingTitle').textContent = title || 'Loading...';
  document.getElementById('loadingDesc').textContent = desc || 'Please wait.';
  var el = document.getElementById('loadingOverlay');
  el.style.display = 'flex';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('show'); }); });
}
function hideLoading() {
  var el = document.getElementById('loadingOverlay');
  el.classList.remove('show');
  setTimeout(function(){ el.style.display = 'none'; }, 200);
}

function showMsg(id, type, text) {
  var el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = text;
}

var _confirmCb = null;
function styledConfirm(title, body, btnLabel, btnClass, dismissLabel) {
  return new Promise(function(resolve) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmBody').textContent = body;
    var okBtn = document.getElementById('confirmOk');
    okBtn.className = 'btn ' + (btnClass || 'btn-danger');
    okBtn.textContent = btnLabel || 'Confirm';
    document.getElementById('confirmCancel').textContent = dismissLabel || 'Go Back';
    var overlay = document.getElementById('confirmOverlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ overlay.classList.add('show'); }); });
    _confirmCb = resolve;
  });
}
document.getElementById('confirmCancel').onclick = function(){
  var overlay = document.getElementById('confirmOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
  if (_confirmCb) { _confirmCb(false); _confirmCb = null; }
};
document.getElementById('confirmOk').onclick = function(){
  var overlay = document.getElementById('confirmOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
  if (_confirmCb) { _confirmCb(true); _confirmCb = null; }
};

function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
  if (name === 'settings') loadSettings();
  if (name === 'statistics') loadStatistics();
  if (name === 'actions') { loadActionAppts(); if (document.getElementById('notifyDate').value) loadNotifyAppts(); }
  if (name === 'reminders') loadReminderPatients();
  if (name === 'reviews') loadReviewPatients();
  if (name === 'followups') loadAdminFollowUps();
  if (name === 'referrals') loadReferrals();
  if (name === 'telemedicine') loadTelemedicineData();
  if (name === 'linda') loadLindaData();
  if (name === 'lindastats') loadLindaReports();
  if (name === 'bloodtests') loadBloodTestData();
  if (name === 'dda') loadDdaList();
  if (name === 'reschedule') loadRescheduleTab();
  if (name === 'activity') loadActivity();
  if (name === 'reserve') loadReserveTab();
  if (name === 'availability-toggle') loadDoctorStatus();
}

// ========== Doctor Status (unavailable splash toggle) ==========
function renderDoctorStatus(unavailable) {
  var card = document.getElementById('dsCard');
  var pill = document.getElementById('dsStatusPill');
  var note = document.getElementById('dsNote');
  document.getElementById('dsToggle').checked = !!unavailable;
  if (unavailable) {
    card.classList.add('on');
    pill.textContent = '\\u25CF Booking paused';
    pill.classList.add('off');
    note.innerHTML = '\\u26A0\\uFE0F <b>The booking page is currently hidden.</b> Patients see the &ldquo;doctor unavailable&rdquo; splash and online booking is closed \\u2014 they are directed to Spinola Clinic as walk\\u2011ins.';
  } else {
    card.classList.remove('on');
    pill.textContent = '\\u25CF Booking live';
    pill.classList.remove('off');
    note.innerHTML = '\\u2705 <b>The booking page is live.</b> Patients can book appointments as normal.';
  }
}

function loadDoctorStatus() {
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('dsMsg', 'bad', 'Failed to load status.'); return; }
      renderDoctorStatus(res.settings && res.settings.doctorUnavailable);
    })
    .withFailureHandler(function(err) {
      showMsg('dsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetSettings(SIG);
}

function setDoctorUnavailable(on) {
  var apply = function() {
    showLoading(on ? 'Pausing bookings...' : 'Restoring bookings...', 'Updating the public booking page.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('dsMsg', 'bad', res && res.reason ? res.reason : 'Failed to save.'); loadDoctorStatus(); return; }
        _settingsLoaded = false; // keep the Settings tab in sync
        renderDoctorStatus(on);
        showMsg('dsMsg', 'good', on ? 'Booking page is now hidden \\u2014 patients see the Spinola Clinic splash.' : 'Booking page is live again.');
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('dsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
        loadDoctorStatus();
      })
      .apiAdminSaveSettings(SIG, { doctorUnavailable: on });
  };

  if (on) {
    // Revert the optimistic toggle until the admin confirms.
    document.getElementById('dsToggle').checked = false;
    styledConfirm('Hide the booking page?', 'Patients will no longer be able to book. They will see a splash page telling them the doctor is unavailable and directing them to Spinola Clinic. You can turn this off again at any time.', 'Hide booking page', 'btn-danger', 'Cancel').then(function(ok) {
      if (!ok) { renderDoctorStatus(false); return; }
      document.getElementById('dsToggle').checked = true;
      apply();
    });
  } else {
    apply();
  }
}

function loadReserveTab() {
  var f = document.getElementById('reserveFrame');
  if (f && f.getAttribute('data-loaded') !== '1' && RESERVE_URL) {
    f.src = RESERVE_URL + '/admin?sig=' + encodeURIComponent(RESERVE_SIG);
    f.setAttribute('data-loaded', '1');
  }
}

// ─── Activity feed (appointments + telemedicine + reserve orders) ───
function actEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function actClinic(c){ return c==='spinola'?'Spinola':c==='linda'?'Physio':"Potter's"; }
function actWhen(ts){ if(!ts) return ''; var d=ts.slice(0,10), t=ts.slice(11,16); var today=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Malta'}); return (d===today?'Today':d)+' '+t; }
function actAppt(a){
  var who=actEsc(a.full_name||'Someone'), svc=actEsc(a.service_name||'appointment');
  var when=a.date_key?(' — '+a.date_key+' '+(a.start_time||'')):''; var cl=actClinic(a.clinic);
  var s=a.status, icon='📅', label='New appointment';
  if(s==='CANCELLED_CLIENT'){icon='❌';label='Cancelled by patient';}
  else if(s==='CANCELLED_DOCTOR'){icon='❌';label='Cancelled by clinic';}
  else if(s==='RELOCATED_SPINOLA'){icon='↗️';label='Moved to Spinola';}
  else if(s==='ATTENDED'){icon='✅';label='Attended';}
  else if(s==='NO_SHOW'){icon='⚠️';label='No-show';}
  else if(s==='BOOKED'&&a.created_at!==a.updated_at){icon='✏️';label='Appointment updated';}
  var time=((s==='CANCELLED_CLIENT'||s==='CANCELLED_DOCTOR')&&a.cancelled_at)?a.cancelled_at:a.updated_at;
  return {time:time, icon:icon, text:label+': '+who+' — '+svc+when+' ('+cl+')'};
}
function actTel(t){ return {time:t.updated_at||t.created_at, icon:'📞', text:'Telemedicine call: '+actEsc(t.patient_name||'')+' ('+actEsc(t.status||'')+')'}; }
function actDda(d){ var qty=d.quantity?(' \\u00d7'+actEsc(d.quantity)):''; return {time:d.created_at, icon:'💊', text:'DDA register: '+actEsc(d.patient_name||'')+' \\u2014 '+actEsc(d.drug||'')+qty}; }
function actResv(e){
  var who=actEsc(e.customer_name||''), ref=actEsc(e.reference||'');
  var map={SUBMITTED:['🛍️','New Reserve & Collect order'],READY:['📦','Order marked ready'],COLLECTED:['✅','Order collected'],CANCELLED:['❌','Order cancelled'],ITEMS_REVIEWED:['🔎','Order items reviewed'],NOTIFIED:['✉️','Customer notified'],REVIEW_SENT:['⭐','Review request sent']};
  var m=map[e.event]||['•',e.event];
  return {time:e.created_at, icon:m[0], text:m[1]+': '+who+(ref?' ('+ref+')':'')};
}
async function loadActivity(){
  var box=document.getElementById('activityFeed'); if(!box) return;
  var events=[];
  try{ var a=await apiCall('activity'); if(a&&a.ok){ (a.appts||[]).forEach(function(x){events.push(actAppt(x));}); (a.telemed||[]).forEach(function(x){events.push(actTel(x));}); (a.dda||[]).forEach(function(x){events.push(actDda(x));}); } }catch(e){}
  if(RESERVE_URL&&RESERVE_SIG){
    try{ var r=await (await fetch(RESERVE_URL+'/api/admin/activity?sig='+encodeURIComponent(RESERVE_SIG))).json();
      if(r&&r.ok){ (r.events||[]).forEach(function(x){events.push(actResv(x));}); } }catch(e){}
  }
  events=events.filter(function(e){return e.time;}).sort(function(x,y){return (y.time||'').localeCompare(x.time||'');}).slice(0,80);
  if(!events.length){ box.innerHTML='<p class="subtitle">No recent activity yet.</p>'; return; }
  box.innerHTML=events.map(function(e){
    return '<div style="display:flex;gap:10px;padding:9px 4px;border-bottom:1px solid var(--line);align-items:baseline;">'
      +'<span style="font-size:16px;">'+e.icon+'</span>'
      +'<span style="flex:1;">'+e.text+'</span>'
      +'<span class="subtitle" style="margin:0;white-space:nowrap;font-size:12px;">'+actWhen(e.time)+'</span></div>';
  }).join('');
}
setInterval(function(){ var el=document.getElementById('tab-activity'); if(el && el.style.display!=='none') loadActivity(); }, 15000);

// ─── Telemedicine (admin) ─────────────────────────────────
function telTodayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function escTelHtml(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function telFormatEur(cents) {
  if (cents == null) return '€0';
  return '€' + (cents/100).toFixed(2);
}
async function loadTelemedicineData() {
  var dateInput = document.getElementById('telListDate');
  if (!dateInput.value) dateInput.value = telTodayKey();
  var addDate = document.getElementById('telAddDate');
  if (!addDate.value) addDate.value = telTodayKey();
  await Promise.all([loadTelemedicineStats(), loadTelemedicineList()]);
}
async function loadTelemedicineStats() {
  try {
    var res = await apiCall('telemedicine-stats');
    if (!res || !res.ok) return;

    // ── Top counter on the stats bar (visible across all tabs)
    var s = res.stats || {};
    var topStat = document.getElementById('statTelemed');
    if (topStat) topStat.textContent = s.todayCalls != null ? s.todayCalls : 0;
    var liveBadge = document.getElementById('statTelemedLive');
    if (liveBadge) liveBadge.style.display = res.open ? 'inline-block' : 'none';

    // ── Window state line at the top of the Telemedicine tab
    var ws = document.getElementById('telemedWindowState');
    if (ws) {
      if (res.open) {
        ws.innerHTML = '<span style="color:#15803d;">&#9679; Telemedicine bookings are OPEN now (8pm-midnight)</span>';
      } else {
        ws.innerHTML = '<span style="color:#6b7280;">&#9675; Booking window closed (opens 8pm). You can still log calls below.</span>';
      }
    }

    // ── Rich periods table
    var rich = res.rich || null;
    if (!rich) return;
    renderTelPeriods(rich);
    renderTelStatusBars(rich.status, rich.periods.allTime);
    renderTelSourceBars(rich.source);
    renderTelHourly(rich.hourly);
    renderTelDailyTrend(rich.dailyTrend);
    renderTelTopPatients(rich.topPatients);
  } catch(e) {}
}

function renderTelPeriods(rich) {
  var tbody = document.getElementById('telPeriodTable');
  if (!tbody) return;
  // Build a row per period. Date-range strings make it crystal-clear what
  // the figures cover (the user pointed out the old "today=allTime"
  // looked confusing when a fresh DB only has one day of data).
  var rows = [
    { label: 'Today', range: rich.periods.today.calls === 0 && rich.firstCallDate ? '' : '', stats: rich.periods.today, dateRange: '' },
    { label: 'This week', range: '', stats: rich.periods.week, dateRange: 'from ' + escTelHtml(rich.weekStartKey) },
    { label: 'Last 30 days', range: '', stats: rich.periods.last30, dateRange: 'from ' + escTelHtml(rich.last30StartKey) },
    { label: 'All time', range: '', stats: rich.periods.allTime, dateRange: rich.firstCallDate ? 'since ' + escTelHtml(rich.firstCallDate) : '' },
  ];
  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var s = r.stats;
    var avg = s.calls > 0 ? telFormatEur(s.avgPatientCents) : '—';
    html += '<tr>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;"><b>' + r.label + '</b>' +
        (r.dateRange ? ' <span style="font-size:11px;color:#9ca3af;font-weight:400;">' + r.dateRange + '</span>' : '') + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;">' + s.calls + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;color:' + (s.cancelled ? '#b91c1c' : '#9ca3af') + ';">' + s.cancelled + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:800;color:#047857;">' + telFormatEur(s.doctorRevenueCents) + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#1d4ed8;">' + telFormatEur(s.medicineCents) + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#374151;">' + telFormatEur(s.patientTotalCents) + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#6b7280;font-size:12.5px;">' + avg + '</td>' +
    '</tr>';
  }
  tbody.innerHTML = html;
}

function telBar(label, value, total, color) {
  var pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return '<div>' +
    '<div style="display:flex;justify-content:space-between;font-weight:600;margin-bottom:3px;">' +
      '<span>' + escTelHtml(label) + '</span>' +
      '<span style="color:#6b7280;">' + value + (total > 0 ? ' (' + pct + '%)' : '') + '</span>' +
    '</div>' +
    '<div style="height:8px;background:#f3f4f6;border-radius:999px;overflow:hidden;">' +
      '<div style="height:100%;width:' + pct + '%;background:' + color + ';"></div>' +
    '</div>' +
  '</div>';
}
function renderTelStatusBars(status, allTime) {
  var el = document.getElementById('telStatusBars');
  if (!el) return;
  var total = (status.booked || 0) + (status.completed || 0) + (status.cancelled || 0);
  if (!total) { el.innerHTML = '<div style="color:#9ca3af;font-style:italic;">No calls yet.</div>'; return; }
  var html = '';
  html += telBar('Completed', status.completed || 0, total, '#10b981');
  html += telBar('Still booked', status.booked || 0, total, '#f59e0b');
  html += telBar('Cancelled', status.cancelled || 0, total, '#ef4444');
  el.innerHTML = html;
}
function renderTelSourceBars(source) {
  var el = document.getElementById('telSourceBars');
  if (!el) return;
  var pub = source.public || 0;
  var adm = source.admin || 0;
  var total = pub + adm;
  if (!total) { el.innerHTML = '<div style="color:#9ca3af;font-style:italic;">No calls in last 30 days.</div>'; return; }
  var html = '';
  html += telBar('Patient booking page', pub, total, '#3b82f6');
  html += telBar('Logged by admin', adm, total, '#a855f7');
  el.innerHTML = html;
}
function renderTelHourly(hourly) {
  var el = document.getElementById('telHourly');
  var lab = document.getElementById('telHourlyLabels');
  if (!el || !lab) return;
  var hours = ['20', '21', '22', '23', 'other'];
  var labels = ['8pm', '9pm', '10pm', '11pm', 'other'];
  var max = 0;
  for (var i = 0; i < hours.length; i++) {
    var v = hourly[hours[i]] || 0;
    if (v > max) max = v;
  }
  var bars = '';
  var labs = '';
  for (var i = 0; i < hours.length; i++) {
    var v = hourly[hours[i]] || 0;
    var pct = max > 0 ? Math.round((v / max) * 100) : 0;
    bars += '<div title="' + labels[i] + ': ' + v + ' call(s)" style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;">' +
      '<div style="font-size:11px;color:#374151;margin-bottom:2px;">' + (v || '') + '</div>' +
      '<div style="width:100%;background:#fed7aa;border-radius:6px 6px 0 0;height:' + pct + '%;min-height:' + (v ? 4 : 0) + 'px;"></div>' +
    '</div>';
    labs += '<div style="flex:1;text-align:center;">' + labels[i] + '</div>';
  }
  el.innerHTML = bars;
  lab.innerHTML = labs;
}
function renderTelDailyTrend(trend) {
  var el = document.getElementById('telDailyTrend');
  var lab = document.getElementById('telDailyLabels');
  if (!el || !lab) return;
  if (!trend || !trend.length) { el.innerHTML = '<div style="color:#9ca3af;font-style:italic;">No data yet.</div>'; lab.innerHTML = ''; return; }
  var max = 0;
  for (var i = 0; i < trend.length; i++) if (trend[i].calls > max) max = trend[i].calls;
  var bars = '';
  var labs = '';
  for (var i = 0; i < trend.length; i++) {
    var d = trend[i];
    var pct = max > 0 ? Math.round((d.calls / max) * 100) : 0;
    var rev = telFormatEur(d.revenueCents || 0);
    var dayLabel = d.dateKey.slice(8); // DD
    bars += '<div title="' + escTelHtml(d.dateKey) + ': ' + d.calls + ' call(s) · ' + escTelHtml(rev) + '" style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;">' +
      (d.calls ? '<div style="font-size:10px;color:#6b7280;margin-bottom:2px;">' + d.calls + '</div>' : '') +
      '<div style="width:100%;background:#fdba74;border-radius:4px 4px 0 0;height:' + pct + '%;min-height:' + (d.calls ? 3 : 0) + 'px;"></div>' +
    '</div>';
    labs += '<div style="flex:1;text-align:center;">' + dayLabel + '</div>';
  }
  el.innerHTML = bars;
  lab.innerHTML = labs;
}
function renderTelTopPatients(top) {
  var el = document.getElementById('telTopPatients');
  if (!el) return;
  if (!top || !top.length) { el.innerHTML = '<div style="color:#9ca3af;font-style:italic;">No frequent callers yet.</div>'; return; }
  var html = '';
  for (var i = 0; i < top.length; i++) {
    var p = top[i];
    html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">' +
      '<div>' +
        '<div style="font-weight:700;color:#111827;">' + escTelHtml(p.name) + '</div>' +
        '<div style="font-size:12px;color:#6b7280;">' + escTelHtml(p.phone) + ' &middot; last call ' + escTelHtml(p.lastCall) + '</div>' +
      '</div>' +
      '<div style="font-weight:800;color:#9a3412;align-self:center;">' + p.calls + ' call' + (p.calls === 1 ? '' : 's') + '</div>' +
    '</div>';
  }
  el.innerHTML = html;
}
async function loadTelemedicineList() {
  var dateKey = document.getElementById('telListDate').value || telTodayKey();
  var listEl = document.getElementById('telCallList');
  var sumEl = document.getElementById('telDaySummary');
  listEl.innerHTML = '<div class="empty">Loading...</div>';
  try {
    var res = await apiCall('telemedicine?date=' + encodeURIComponent(dateKey));
    if (!res || !res.ok) { listEl.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
    var calls = res.calls || [];
    // Lead with the DOCTOR'S total (count × €25, no medicine). The
    // combined patient bill is only relevant when admin is asking the
    // patient to pay at the counter, so it's shown smaller, in muted
    // grey, after the prominent doctor figure.
    sumEl.innerHTML = '<b>' + (res.billableCount || 0) + '</b> billable call(s) on ' + escTelHtml(dateKey) +
      ' &middot; <span style="font-size:15px;font-weight:800;color:#047857;">Doctor\\'s total: ' + escTelHtml(res.totalRevenueLabel || '€0') + '</span>' +
      '<span style="display:block;margin-top:2px;color:#6b7280;font-size:12px;">Medicine billed ' + escTelHtml(res.totalMedicineLabel || '€0') +
      ' &middot; combined patient bills ' + escTelHtml(res.totalPatientLabel || '€0') + ' (medicine + €25 each)</span>';
    if (!calls.length) {
      listEl.innerHTML = '<div class="empty">No telemedicine calls on this date.</div>';
      return;
    }
    var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13.5px;">' +
      '<thead><tr style="background:#f9fafb;text-align:left;">' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Email</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Comments</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Fee</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Medicine €</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Patient bill</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Status</th>' +
      '<th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">Actions</th>' +
      '</tr></thead><tbody>';
    for (var i = 0; i < calls.length; i++) {
      var c = calls[i];
      var time = (c.created_at || '').split(' ')[1] || '';
      time = time.split(':').slice(0,2).join(':');
      var rowStyle = c.status === 'CANCELLED' ? 'opacity:0.5;' : '';
      var emailCell = c.email ? '<a href="mailto:' + escTelHtml(c.email) + '">' + escTelHtml(c.email) + '</a>' : '<span style="color:#9ca3af;">—</span>';
      var srcBadge = c.source === 'admin' ? ' <span style="display:inline-block;font-size:10px;background:#fde68a;color:#92400e;padding:1px 6px;border-radius:8px;font-weight:700;">admin</span>' : '';
      var medCents = c.medicine_cents || 0;
      var medEur = (medCents / 100).toFixed(2);
      var patientCents = (c.fee_cents || 0) + medCents;
      html += '<tr style="' + rowStyle + '" id="telRow_' + escTelHtml(c.id) + '">' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + escTelHtml(time) + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;"><b>' + escTelHtml(c.patient_name) + '</b>' + srcBadge + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;"><a href="tel:' + escTelHtml(c.phone) + '">' + escTelHtml(c.phone) + '</a></td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + emailCell + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-style:italic;">' + escTelHtml(c.comments || '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + telFormatEur(c.fee_cents) + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' +
          '<div style="display:flex;align-items:center;gap:4px;">' +
            '<span style="color:#6b7280;">€</span>' +
            '<input type="number" min="0" step="0.01" value="' + escTelHtml(medEur) + '" id="telMed_' + escTelHtml(c.id) + '" style="width:80px;padding:6px 8px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;" onchange="saveTelemedMedicine(\\'' + escTelHtml(c.id) + '\\')">' +
          '</div>' +
        '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:800;color:#1e40af;" id="telPatTotal_' + escTelHtml(c.id) + '">' + telFormatEur(patientCents) + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + escTelHtml(c.status) + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">';
      // Prescription button — disabled when there's no patient email since
      // we can't send a receipt anyway, but the modal still opens for
      // saving medicines so the data is there when an email is added.
      var rxLabel = c.prescription_sent_at ? 'Re-send Rx' : 'Prescription';
      var rxStyle = c.prescription_sent_at ? 'background:#10b981;color:#fff;' : 'background:#ea580c;color:#fff;';
      html += '<button class="btn btn-sm" style="' + rxStyle + 'margin-right:4px;" onclick="openTelPrescription(\\'' + escTelHtml(c.id) + '\\')">' + rxLabel + '</button>';
      if (c.status === 'BOOKED') {
        html += '<button class="btn btn-sm" style="background:#10b981;color:#fff;margin-right:4px;" onclick="markTelemedicineStatus(\\'' + escTelHtml(c.id) + '\\',\\'COMPLETED\\')">Done</button>';
        html += '<button class="btn btn-sm" style="background:#9ca3af;color:#fff;margin-right:4px;" onclick="markTelemedicineStatus(\\'' + escTelHtml(c.id) + '\\',\\'CANCELLED\\')">Cancel</button>';
      } else {
        html += '<button class="btn btn-sm btn-ghost" style="margin-right:4px;" onclick="markTelemedicineStatus(\\'' + escTelHtml(c.id) + '\\',\\'BOOKED\\')">Reopen</button>';
      }
      html += '<button class="btn btn-sm" style="background:#ef4444;color:#fff;" onclick="deleteTelemedicineCall(\\'' + escTelHtml(c.id) + '\\')">Delete</button>';
      html += '</td></tr>';
    }
    html += '</tbody></table></div>';
    listEl.innerHTML = html;
  } catch(e) {
    listEl.innerHTML = '<div class="empty">Failed to load calls.</div>';
  }
}
async function saveTelemedMedicine(id) {
  var input = document.getElementById('telMed_' + id);
  if (!input) return;
  var euros = parseFloat(input.value || '0');
  if (!isFinite(euros) || euros < 0) {
    input.value = '0.00';
    euros = 0;
  }
  try {
    var res = await apiCall('telemedicine-medicine', { body: { id: id, medicineEuros: euros } });
    if (res && res.ok) {
      var totalEl = document.getElementById('telPatTotal_' + id);
      if (totalEl) totalEl.textContent = res.patientTotalLabel || telFormatEur(res.patientTotalCents);
      input.value = (res.medicineCents / 100).toFixed(2);
      // Refresh stats + summary so the daily/weekly totals update
      loadTelemedicineStats();
      // Recompute the summary line by re-fetching — cheaper than reflecting locally
      var dateKey = document.getElementById('telListDate').value || telTodayKey();
      try {
        var listRes = await apiCall('telemedicine?date=' + encodeURIComponent(dateKey));
        if (listRes && listRes.ok) {
          var sumEl = document.getElementById('telDaySummary');
          if (sumEl) sumEl.innerHTML = '<b>' + (listRes.billableCount || 0) + '</b> billable call(s) on ' + escTelHtml(dateKey) +
            ' &middot; <span style="font-size:15px;font-weight:800;color:#047857;">Doctor\\'s total: ' + escTelHtml(listRes.totalRevenueLabel || '€0') + '</span>' +
            '<span style="display:block;margin-top:2px;color:#6b7280;font-size:12px;">Medicine billed ' + escTelHtml(listRes.totalMedicineLabel || '€0') +
            ' &middot; combined patient bills ' + escTelHtml(listRes.totalPatientLabel || '€0') + ' (medicine + €25 each)</span>';
        }
      } catch(e) {}
    }
  } catch(e) {}
}
function changeTelDay(delta) {
  var di = document.getElementById('telListDate');
  var d = new Date(di.value || telTodayKey());
  d.setDate(d.getDate() + delta);
  di.value = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  loadTelemedicineList();
}
function goTelToday() {
  document.getElementById('telListDate').value = telTodayKey();
  loadTelemedicineList();
}
async function addTelemedicineCall() {
  var msg = document.getElementById('telAddMsg');
  var name = document.getElementById('telAddName').value.trim();
  var phone = document.getElementById('telAddPhone').value.trim();
  var email = document.getElementById('telAddEmail').value.trim();
  var comments = document.getElementById('telAddComments').value.trim();
  var dateKey = document.getElementById('telAddDate').value || telTodayKey();
  if (!name || !phone) {
    msg.style.color = '#b91c1c';
    msg.textContent = 'Patient name and phone are required.';
    return;
  }
  msg.style.color = '#6b7280';
  msg.textContent = 'Saving...';
  try {
    var res = await apiCall('telemedicine', { body: { patientName: name, phone: phone, email: email, comments: comments, dateKey: dateKey } });
    if (res && res.ok) {
      msg.style.color = '#059669';
      msg.textContent = 'Saved.';
      document.getElementById('telAddName').value = '';
      document.getElementById('telAddPhone').value = '';
      document.getElementById('telAddEmail').value = '';
      document.getElementById('telAddComments').value = '';
      loadTelemedicineStats();
      loadTelemedicineList();
    } else {
      msg.style.color = '#b91c1c';
      msg.textContent = (res && res.reason) || 'Failed.';
    }
  } catch(e) {
    msg.style.color = '#b91c1c';
    msg.textContent = 'Network error.';
  }
}
async function markTelemedicineStatus(id, status) {
  try {
    var res = await apiCall('telemedicine-status', { body: { id: id, status: status } });
    if (res && res.ok) {
      // Visible toast so the user knows the click registered, plus the
      // row will re-render with the new status from the reload below.
      showLiveToast('Marked ' + status.toLowerCase());
    } else {
      showLiveToast('Could not update status');
    }
    loadTelemedicineStats();
    loadTelemedicineList();
  } catch(e) {
    showLiveToast('Network error');
  }
}
// ── Prescription modal ──────────────────────────────────
var _telRxCurrent = null;  // currently-edited call object
function openTelPrescription(callId) {
  // Look up the call from the most recently rendered list — refetch the
  // day so we're working with the freshest data even if the row was
  // updated elsewhere (e.g. Done/Reopen).
  var dateKey = document.getElementById('telListDate').value || telTodayKey();
  apiCall('telemedicine?date=' + encodeURIComponent(dateKey)).then(function(res) {
    if (!res || !res.ok) return;
    var calls = res.calls || [];
    var c = calls.filter(function(x) { return x.id === callId; })[0];
    if (!c) { alert('Call not found.'); return; }
    _telRxCurrent = c;
    document.getElementById('telRxPatientName').textContent = c.patient_name || '—';
    document.getElementById('telRxPatientPhone').textContent = c.phone || '—';
    document.getElementById('telRxPatientEmail').textContent = c.email || '(no email — add one before sending)';
    var med = (c.medicine_cents || 0) / 100;
    document.getElementById('telRxMedTotal').value = med ? med.toFixed(2) : '';
    document.getElementById('telRxFee').value = ((c.fee_cents || 2500) / 100).toFixed(2);
    document.getElementById('telRxMsg').textContent = '';
    // Populate medicines as separate rows for "neat entry".
    var listEl = document.getElementById('telRxMedicineList');
    listEl.innerHTML = '';
    var lines = (c.medicines || '').split(/\\r?\\n/).filter(function(s) { return s.trim(); });
    if (!lines.length) lines = [''];
    for (var i = 0; i < lines.length; i++) addRxMedicineRow(lines[i]);
    updateRxTotal();
    document.getElementById('telRxSendBtn').disabled = !c.email;
    // Same overlay pattern the patient-history modal uses — set display
    // first, then add .show on the next frame so the opacity transition
    // runs and the inputs can take focus.
    var ov = document.getElementById('telPrescriptionOverlay');
    ov.style.display = 'flex';
    requestAnimationFrame(function() { requestAnimationFrame(function() { ov.classList.add('show'); }); });
    // Focus the medicine total field — most common edit. (Use a small
    // timeout so the show transition has started.)
    setTimeout(function() {
      var first = document.querySelector('#telRxMedicineList input');
      if (first && !first.value) try { first.focus(); } catch(e) {}
      else {
        var med = document.getElementById('telRxMedTotal');
        if (med) try { med.focus(); med.select && med.select(); } catch(e) {}
      }
    }, 80);
  });
}
function closeTelPrescription() {
  var ov = document.getElementById('telPrescriptionOverlay');
  ov.classList.remove('show');
  setTimeout(function() { ov.style.display = 'none'; }, 200);
  _telRxCurrent = null;
}
function addRxMedicineRow(value) {
  var listEl = document.getElementById('telRxMedicineList');
  var wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '6px';
  wrap.style.alignItems = 'center';
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g. Paracetamol 500mg — 1 tablet 3x daily';
  input.value = (typeof value === 'string') ? value : '';
  input.style.flex = '1';
  input.style.padding = '10px 12px';
  input.style.border = '1px solid #e5e7eb';
  input.style.borderRadius = '10px';
  input.style.fontSize = '14px';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '✕';
  btn.title = 'Remove';
  btn.style.background = '#fee2e2';
  btn.style.color = '#991b1b';
  btn.style.border = 'none';
  btn.style.borderRadius = '10px';
  btn.style.padding = '8px 12px';
  btn.style.cursor = 'pointer';
  btn.style.fontWeight = '700';
  btn.onclick = function() {
    listEl.removeChild(wrap);
    if (!listEl.children.length) addRxMedicineRow('');
  };
  wrap.appendChild(input);
  wrap.appendChild(btn);
  listEl.appendChild(wrap);
}
function collectRxMedicines() {
  var inputs = document.querySelectorAll('#telRxMedicineList input');
  var lines = [];
  for (var i = 0; i < inputs.length; i++) {
    var v = (inputs[i].value || '').trim();
    if (v) lines.push(v);
  }
  return lines.join('\\n');
}
function updateRxTotal() {
  var med = parseFloat(document.getElementById('telRxMedTotal').value || '0') || 0;
  if (med < 0) med = 0;
  var fee = parseFloat(document.getElementById('telRxFee').value || '0') || 0;
  document.getElementById('telRxTotal').textContent = '€' + (med + fee).toFixed(2);
}
async function saveTelPrescription(send) {
  if (!_telRxCurrent) return;
  var msg = document.getElementById('telRxMsg');
  msg.style.color = '#6b7280';
  msg.textContent = send ? 'Saving and sending…' : 'Saving…';
  var medicines = collectRxMedicines();
  var med = parseFloat(document.getElementById('telRxMedTotal').value || '0') || 0;
  if (med < 0) med = 0;
  var id = _telRxCurrent.id;
  try {
    if (send) {
      if (!_telRxCurrent.email) {
        msg.style.color = '#b91c1c';
        msg.textContent = 'No patient email on file. Add one first.';
        return;
      }
      var res = await apiCall('telemedicine-prescription', { body: { id: id, medicines: medicines, medicineEuros: med } });
      if (res && res.ok) {
        msg.style.color = '#059669';
        msg.textContent = 'Sent to ' + (res.sentTo || _telRxCurrent.email) + '. Patient total ' + (res.patientTotalLabel || '€?');
        loadTelemedicineStats();
        loadTelemedicineList();
        try { loadSchedTelemed(document.getElementById('telListDate').value || telTodayKey()); } catch(e) {}
      } else {
        msg.style.color = '#b91c1c';
        msg.textContent = (res && res.reason) || 'Failed to send.';
        return;
      }
    } else {
      // Save medicines + medicine total but don't send the email.
      await apiCall('telemedicine-medicines', { body: { id: id, medicines: medicines } });
      await apiCall('telemedicine-medicine', { body: { id: id, medicineEuros: med } });
      msg.style.color = '#059669';
      msg.textContent = 'Saved.';
      loadTelemedicineStats();
      loadTelemedicineList();
      try { loadSchedTelemed(document.getElementById('telListDate').value || telTodayKey()); } catch(e) {}
    }
  } catch(e) {
    msg.style.color = '#b91c1c';
    msg.textContent = 'Network error.';
  }
}
// Recompute the patient-total chip whenever the medicine total changes.
document.addEventListener('input', function(e) {
  if (e.target && e.target.id === 'telRxMedTotal') updateRxTotal();
});

async function deleteTelemedicineCall(id) {
  var ok = await styledConfirm('Delete telemedicine call?', 'This permanently removes the record. The fee will no longer be counted.', 'Delete', 'btn-danger');
  if (!ok) return;
  try {
    var res = await fetch('/api/admin/telemedicine/' + encodeURIComponent(id) + '?sig=' + encodeURIComponent(SIG), {
      method: 'DELETE', credentials: 'same-origin',
    });
    var data = await res.json();
    if (data && data.ok) {
      showLiveToast('Call deleted');
      loadTelemedicineStats();
      loadTelemedicineList();
    } else {
      showLiveToast('Delete failed');
    }
  } catch(e) {
    showLiveToast('Network error');
  }
}

// ─── Linda (Physiotherapy) admin ─────────────────────────────
async function loadLindaData() {
  loadLindaConfig();
  lcInit();
}

// Stats / reviews / follow-ups now live in the dedicated "Linda Reports" tab.
async function loadLindaReports() {
  loadLindaConfig();   // keeps the review-date picker bounded to the window
  loadLindaStats();
  loadLindaFollowUps();
}

/* ═══════════════ Linda Command Center ═══════════════
   Calls the same proven /api/linda-* portal endpoints. The admin_sig cookie
   authenticates them (credentials:'same-origin'), so admin gets full parity
   with Linda's diary: day glance, new booking, reschedule/cancel/mark, and
   availability (stints, days off, per-day open/block). */
var lcState = { bookMode: 'new', reschedId: '', slotIdx: -1, custom: false };
function lcToggleCustom(){
  lcState.custom = document.getElementById('lcCustomToggle').checked;
  document.getElementById('lcSlots').style.display = lcState.custom ? 'none' : 'grid';
  document.getElementById('lcCustomWrap').style.display = lcState.custom ? 'block' : 'none';
  lcState.slotIdx = -1;
  lcUpdateBookBtn();
}
function lcResetCustom(showToggle){
  lcState.custom = false;
  var t = document.getElementById('lcCustomToggle'); if (t) t.checked = false;
  var ct = document.getElementById('lcCustomTime'); if (ct) ct.value = '';
  document.getElementById('lcSlots').style.display = 'grid';
  document.getElementById('lcCustomWrap').style.display = 'none';
  var lbl = document.getElementById('lcCustomLabel'); if (lbl) lbl.style.display = showToggle ? 'flex' : 'none';
}
var lcAppts = [];
var lcSlots = [];

function lcPad(n){ return (n < 10 ? '0' : '') + n; }
function lcToday(){ var d = new Date(); return d.getFullYear() + '-' + lcPad(d.getMonth()+1) + '-' + lcPad(d.getDate()); }
function lcEsc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function lcAddDays(dk, n){ var p = String(dk).split('-'); var d = new Date(+p[0], +p[1]-1, +p[2]); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+lcPad(d.getMonth()+1)+'-'+lcPad(d.getDate()); }
function lcNiceDate(dk){ var p = String(dk).split('-'); var d = new Date(+p[0], +p[1]-1, +p[2]); return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+', '+d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear(); }

function lindaApi(path, opts){
  opts = opts || {};
  var f = { credentials: 'same-origin' };
  if (opts.method) f.method = opts.method;
  if (opts.body){ f.method = f.method || 'POST'; f.headers = { 'Content-Type': 'application/json' }; f.body = JSON.stringify(opts.body); }
  return fetch('/api/' + path, f).then(function(r){ return r.json(); }).catch(function(){ return { ok:false, reason:'Network error.' }; });
}

function lcInit(){
  var t = lcToday();
  var byId = function(id){ return document.getElementById(id); };
  if (byId('lcDate') && !byId('lcDate').value) byId('lcDate').value = t;
  if (byId('lcPdDate') && !byId('lcPdDate').value) byId('lcPdDate').value = t;
  if (byId('lcOffFrom') && !byId('lcOffFrom').value) byId('lcOffFrom').value = t;
  if (byId('lcWinStart') && !byId('lcWinStart').value) byId('lcWinStart').value = t;
  lcLoadDay(); lcLoadWindows(); lcLoadOff(); lcLoadPerDay();
}

function lcNavDay(delta){ var el = document.getElementById('lcDate'); el.value = lcAddDays(el.value || lcToday(), delta); lcLoadDay(); }
function lcToDay(){ document.getElementById('lcDate').value = lcToday(); lcLoadDay(); }

async function lcLoadDay(){
  var dk = document.getElementById('lcDate').value;
  var host = document.getElementById('lcDayList');
  if (!dk){ host.innerHTML = '<div class="empty">Pick a date.</div>'; return; }
  host.innerHTML = '<div class="empty">Loading…</div>';
  var res = await lindaApi('linda-day?date=' + encodeURIComponent(dk));
  if (!res || !res.ok){ host.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
  lcAppts = res.appointments || [];
  if (!lcAppts.length){ host.innerHTML = '<div class="empty" style="padding:18px;">No appointments on ' + lcEsc(lcNiceDate(dk)) + '.</div>'; return; }
  var html = '';
  lcAppts.forEach(function(a, i){
    var st = String(a.status||'BOOKED');
    var cancelled = st.indexOf('CANCELLED') >= 0;
    var badgeBg = cancelled ? '#fef2f2' : st==='ATTENDED' ? '#e0e7ff' : st==='NO_SHOW' ? '#fff7ed' : '#ecfdf5';
    var badgeC = cancelled ? '#991b1b' : st==='ATTENDED' ? '#3730a3' : st==='NO_SHOW' ? '#9a3412' : '#065f46';
    var badge = cancelled ? 'Cancelled' : st==='ATTENDED' ? 'Attended' : st==='NO_SHOW' ? 'No-show' : 'Booked';
    html += '<div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:8px;' + (cancelled?'opacity:.6;':'') + '">'
      + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
      +   '<b style="font-size:16px;">' + lcEsc(a.start_time) + '</b>'
      +   '<span onclick="lcEditOpen(' + i + ')" title="Edit details" style="font-size:16px;font-weight:700;flex:1 1 auto;color:#5b21b6;cursor:pointer;text-decoration:underline;text-underline-offset:3px;">' + lcEsc(a.full_name) + '</span>'
      +   '<span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;padding:3px 9px;border-radius:999px;background:' + badgeBg + ';color:' + badgeC + ';">' + badge + '</span>'
      + '</div>';
    var contact = [];
    if (a.phone) contact.push('<a href="tel:' + lcEsc(a.phone) + '" style="color:#065f46;font-weight:700;text-decoration:none;">📞 ' + lcEsc(a.phone) + '</a>');
    if (a.email) contact.push('<a href="mailto:' + lcEsc(a.email) + '" style="color:#2563eb;font-weight:700;text-decoration:none;">✉️ ' + lcEsc(a.email) + '</a>');
    if (contact.length) html += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:13px;">' + contact.join('') + '</div>';
    if (a.comments) html += '<div style="margin-top:6px;font-size:13px;color:#374151;background:#f9fafb;border-radius:8px;padding:8px 10px;">' + lcEsc(a.comments) + '</div>';
    if (!cancelled){
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">'
        + '<button class="btn btn-sm" style="background:#fffbeb;color:#92400e;border:1px solid #fde68a;" onclick="lcReschedule(' + i + ')">🔄 Reschedule</button>'
        + '<button class="btn btn-sm" style="background:#f5f3ff;color:#5b21b6;border:1px solid #ddd6fe;" onclick="lcEditOpen(' + i + ')">✎ Edit</button>'
        + '<button class="btn btn-sm" style="background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;" onclick="lcMark(' + i + ',1)">✓ Attended</button>'
        + '<button class="btn btn-sm" style="background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;" onclick="lcMark(' + i + ',2)">✗ No-show</button>'
        + '<button class="btn btn-sm btn-danger" onclick="lcCancel(' + i + ')">Cancel</button>'
        + '</div>';
    } else {
      html += '<div style="margin-top:8px;display:flex;gap:6px;"><button class="btn btn-sm" style="background:#f5f3ff;color:#5b21b6;border:1px solid #ddd6fe;" onclick="lcEditOpen(' + i + ')">✎ Edit</button><button class="btn btn-sm btn-ghost" onclick="lcMark(' + i + ',0)">↩ Reopen</button></div>';
    }
    html += '</div>';
  });
  host.innerHTML = html;
}

function lcOpenModal(){ document.getElementById('lcModalBg').style.display = 'flex'; }
function lcCloseModal(ev){ if (ev && ev.target && ev.target.id !== 'lcModalBg') return; document.getElementById('lcModalBg').style.display = 'none'; }

function lcOpenNew(){
  lcState.bookMode = 'new'; lcState.reschedId = ''; lcState.slotIdx = -1;
  document.getElementById('lcModalTitle').textContent = 'New booking';
  document.getElementById('lcPatientFields').style.display = '';
  document.getElementById('lcRescheduleInfo').style.display = 'none';
  ['lcName','lcPhone','lcEmail','lcComments'].forEach(function(id){ document.getElementById(id).value = ''; });
  document.getElementById('lcModalMsg').textContent = '';
  document.getElementById('lcBookDate').value = document.getElementById('lcDate').value || lcToday();
  lcAcHide(); lcResetCustom(true);
  lcOpenModal(); lcLoadSlots();
}

/* New-booking name autocomplete: suggest past Linda clients and autofill their
   latest details. Admin-only (the /api/linda-clients-autocomplete endpoint is
   auth-gated) so the public booking page never exposes these people. */
var lcAcResults = [];
var lcAcTimer = null;
function lcAcHide(){ var el = document.getElementById('lcAcList'); if (el){ el.style.display = 'none'; el.innerHTML = ''; } }
function lcAcSearch(){
  if (lcState.bookMode === 'reschedule') return; // patient fields hidden anyway
  clearTimeout(lcAcTimer);
  var q = document.getElementById('lcName').value.trim();
  if (q.length < 2){ lcAcHide(); return; }
  lcAcTimer = setTimeout(async function(){
    var res = await lindaApi('linda-clients-autocomplete?q=' + encodeURIComponent(q));
    if (!res || !res.ok || !res.results || !res.results.length){ lcAcHide(); return; }
    lcAcResults = res.results;
    var host = document.getElementById('lcAcList');
    host.innerHTML = res.results.map(function(r, i){
      var sub = [r.phone, r.email].filter(Boolean).join(' · ');
      return '<div onclick="lcAcPick(' + i + ')" style="padding:9px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;">'
        + '<div style="font-weight:700;font-size:14px;color:#111827;">' + lcEsc(r.fullName) + '</div>'
        + (sub ? '<div style="font-size:12px;color:#6b7280;margin-top:1px;">' + lcEsc(sub) + '</div>' : '')
        + '</div>';
    }).join('');
    host.style.display = 'block';
  }, 180);
}
function lcAcPick(i){
  var r = lcAcResults[i]; if (!r) return;
  document.getElementById('lcName').value = r.fullName || '';
  document.getElementById('lcPhone').value = r.phone || '';
  document.getElementById('lcEmail').value = r.email || '';
  lcAcHide();
  lcUpdateBookBtn();
}

function lcReschedule(i){
  var a = lcAppts[i]; if (!a) return;
  lcState.bookMode = 'reschedule'; lcState.reschedId = a.id; lcState.slotIdx = -1;
  document.getElementById('lcModalTitle').textContent = 'Reschedule';
  document.getElementById('lcPatientFields').style.display = 'none';
  var info = document.getElementById('lcRescheduleInfo');
  info.style.display = 'block';
  info.innerHTML = '<b>' + lcEsc(a.full_name) + '</b><br>Currently: ' + lcEsc(lcNiceDate(a.date_key)) + ' at ' + lcEsc(a.start_time) + '<br><span style="color:#6b7280;">The patient is emailed the new time automatically.</span>';
  document.getElementById('lcModalMsg').textContent = '';
  document.getElementById('lcBookDate').value = a.date_key;
  lcResetCustom(false);
  lcOpenModal(); lcLoadSlots();
}

async function lcLoadSlots(){
  lcState.slotIdx = -1; lcUpdateBookBtn();
  var dk = document.getElementById('lcBookDate').value;
  var host = document.getElementById('lcSlots');
  if (!dk){ host.innerHTML = '<div style="color:#6b7280;font-size:13px;grid-column:1/-1;">Pick a date first.</div>'; return; }
  host.innerHTML = '<div style="color:#6b7280;font-size:13px;grid-column:1/-1;">Loading…</div>';
  var res = await lindaApi('linda-slots?date=' + encodeURIComponent(dk));
  if (!res || !res.ok || !res.slots || !res.slots.length){
    var why = res && res.dayOff ? 'Marked as a day off.' : 'No hours set for this day. Open extra hours below, or pick another date.';
    host.innerHTML = '<div style="color:#92400e;font-size:13px;grid-column:1/-1;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px;">' + why + '</div>';
    lcSlots = []; return;
  }
  lcSlots = res.slots;
  host.innerHTML = lcSlots.map(function(s, i){
    var dis = !s.available;
    return '<button type="button" ' + (dis ? 'disabled' : 'onclick="lcPickSlot(' + i + ')"')
      + ' style="padding:10px 4px;border:1px solid ' + (dis?'#e5e7eb':'#10b981') + ';background:' + (dis?'#f9fafb':'#fff') + ';color:' + (dis?'#9ca3af':'#065f46') + ';border-radius:8px;font-weight:800;font-size:14px;cursor:' + (dis?'not-allowed':'pointer') + ';' + (dis?'text-decoration:line-through;':'') + '">' + lcEsc(s.start) + '</button>';
  }).join('');
}

function lcPickSlot(i){
  lcState.slotIdx = i;
  var host = document.getElementById('lcSlots');
  Array.prototype.forEach.call(host.children, function(c, idx){
    if (c.disabled) return;
    var on = idx === i;
    c.style.background = on ? '#10b981' : '#fff';
    c.style.color = on ? '#fff' : '#065f46';
  });
  lcUpdateBookBtn();
}

function lcUpdateBookBtn(){
  var btn = document.getElementById('lcBookBtn');
  var hasTime = lcState.custom ? !!document.getElementById('lcCustomTime').value : lcState.slotIdx >= 0;
  var ok = hasTime;
  if (lcState.bookMode === 'new'){
    var nm = document.getElementById('lcName').value.trim();
    // Contact details are optional for staff bookings — only a name is required.
    ok = hasTime && nm.length > 1;
  }
  btn.disabled = !ok;
  btn.textContent = !hasTime ? (lcState.custom ? 'Enter a time' : 'Select a time') : (lcState.bookMode === 'reschedule' ? 'Move appointment' : 'Create booking');
}

async function lcSubmit(){
  var dk = document.getElementById('lcBookDate').value;
  var start, custom = false;
  if (lcState.custom){ start = document.getElementById('lcCustomTime').value; if (!start) return; custom = true; }
  else { if (lcState.slotIdx < 0 || !lcSlots[lcState.slotIdx]) return; start = lcSlots[lcState.slotIdx].start; }
  var btn = document.getElementById('lcBookBtn'); btn.disabled = true;
  var msg = document.getElementById('lcModalMsg'); msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res;
  if (lcState.bookMode === 'reschedule'){
    res = await lindaApi('linda-reschedule', { body: { appointmentId: lcState.reschedId, dateKey: dk, startTime: start } });
  } else {
    res = await lindaApi('linda-new-booking', { body: {
      dateKey: dk, startTime: start, customTime: custom,
      fullName: document.getElementById('lcName').value.trim(),
      phone: document.getElementById('lcPhone').value.trim(),
      email: document.getElementById('lcEmail').value.trim(),
      comments: document.getElementById('lcComments').value.trim(),
    } });
  }
  if (res && res.ok){
    lcCloseModal();
    lcLoadDay(); loadLindaStats();
  } else {
    msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.';
    btn.disabled = false;
  }
}

var lcEditId = '';
function lcEditOpen(i){
  var a = lcAppts[i]; if (!a) return;
  lcEditId = a.id;
  document.getElementById('lcEditWhen').textContent = lcNiceDate(a.date_key) + ' at ' + a.start_time;
  document.getElementById('lcEditName').value = a.full_name || '';
  document.getElementById('lcEditPhone').value = a.phone || '';
  document.getElementById('lcEditEmail').value = a.email || '';
  document.getElementById('lcEditComments').value = a.comments || '';
  document.getElementById('lcEditApply').checked = false;
  document.getElementById('lcEditMsg').textContent = '';
  if (lcEditTimer){ clearTimeout(lcEditTimer); lcEditTimer = null; }
  document.getElementById('lcEditBg').style.display = 'flex';
}
function lcEditClose(ev){
  if (ev && ev.target && ev.target.id !== 'lcEditBg') return;
  if (lcEditTimer){ clearTimeout(lcEditTimer); lcEditTimer = null; }
  document.getElementById('lcEditBg').style.display = 'none';
}
var lcEditTimer = null;
// Shared save core. quiet=true ⇒ auto-save (keep modal open, refresh silently,
// show a subtle "Saved ✓"). quiet=false ⇒ the explicit "Done" button (close).
async function lcEditDoSave(quiet){
  var msg = document.getElementById('lcEditMsg');
  var name = document.getElementById('lcEditName').value.trim();
  var phone = document.getElementById('lcEditPhone').value.trim();
  var email = document.getElementById('lcEditEmail').value.trim();
  if (!name){ if (!quiet){ msg.style.color = '#dc2626'; msg.textContent = 'A name is required.'; } return; }
  msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res = await lindaApi('linda-edit-appointment', { body: {
    appointmentId: lcEditId, fullName: name, phone: phone, email: email,
    comments: document.getElementById('lcEditComments').value.trim(),
    applyToFuture: document.getElementById('lcEditApply').checked,
  } });
  if (res && res.ok){
    lcLoadDay();
    if (quiet){ msg.style.color = '#059669'; msg.textContent = 'Saved ✓'; }
    else {
      document.getElementById('lcEditBg').style.display = 'none';
      if (res.updatedFuture) alert('Updated this appointment and ' + res.updatedFuture + ' upcoming one' + (res.updatedFuture === 1 ? '' : 's') + '.');
    }
  } else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; }
}
function lcEditAutosave(){
  if (lcEditTimer) clearTimeout(lcEditTimer);
  var msg = document.getElementById('lcEditMsg');
  if (msg){ msg.style.color = '#9ca3af'; msg.textContent = 'Editing…'; }
  lcEditTimer = setTimeout(function(){ lcEditTimer = null; lcEditDoSave(true); }, 700);
}
async function lcEditSave(){
  if (lcEditTimer){ clearTimeout(lcEditTimer); lcEditTimer = null; }
  await lcEditDoSave(false);
}

async function lcMark(i, code){
  var a = lcAppts[i]; if (!a) return;
  var status = code === 1 ? 'ATTENDED' : code === 2 ? 'NO_SHOW' : 'BOOKED';
  var res = await lindaApi('linda-mark-status', { body: { appointmentId: a.id, status: status } });
  if (res && res.ok){ lcLoadDay(); loadLindaStats(); } else alert((res && res.reason) || 'Failed.');
}
async function lcCancel(i){
  var a = lcAppts[i]; if (!a) return;
  if (!confirm('Cancel ' + a.full_name + '’s appointment at ' + a.start_time + '? The patient will be emailed.')) return;
  var res = await lindaApi('linda-cancel', { body: { appointmentId: a.id } });
  if (res && res.ok){ lcLoadDay(); loadLindaStats(); } else alert((res && res.reason) || 'Failed.');
}

var lcWindowsCache = [];
function lcStintHoursText(w){
  if (!w.hours || !w.hours.ranges || !w.hours.ranges.length) return 'Uses default weekly hours';
  var days = (w.hours.days || []);
  var dTxt = days.length === 7 ? 'Every day'
    : days.slice().sort(function(a,b){ return LAS_DOW.indexOf(a) - LAS_DOW.indexOf(b); })
        .map(function(k){ return k.charAt(0) + k.slice(1).toLowerCase(); }).join(', ');
  return dTxt + ' · ' + w.hours.ranges.map(function(r){ return r.start + '–' + r.end; }).join(' & ');
}
async function lcLoadWindows(){
  var host = document.getElementById('lcWindows');
  var res = await lindaApi('linda-windows');
  if (!res || !res.ok){ host.innerHTML = '<div class="empty" style="padding:6px 0;">Failed to load.</div>'; return; }
  lcWindowsCache = (res.windows || []).filter(function(w){ return w.id; });
  if (!lcWindowsCache.length){ host.innerHTML = '<div class="empty" style="padding:6px 0;">No stints yet — tap “Add a stint”.</div>'; return; }
  function stintCard(i){
    var w = lcWindowsCache[i];
    return '<div style="padding:10px 12px;background:#f9fafb;border:1px solid #eef2f0;border-radius:10px;margin-bottom:6px;">'
      + '<div style="font-size:14px;font-weight:800;">' + lcEsc(lcNiceDate(w.start)) + ' → ' + lcEsc(lcNiceDate(w.end)) + (w.note?' <span style="color:#6b7280;font-weight:400;">· ' + lcEsc(w.note) + '</span>':'') + '</div>'
      + '<div style="font-size:13px;color:#065f46;font-weight:700;margin-top:2px;">' + lcEsc(lcStintHoursText(w)) + '</div>'
      + '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px;">'
      +   '<button class="btn btn-sm" style="background:#fffbeb;color:#92400e;border:1px solid #fde68a;" onclick="lasOpen(' + i + ')">Edit</button>'
      +   '<button class="btn btn-sm btn-ghost" onclick="lcDelWindow(' + w.id + ')">Remove</button>'
      + '</div></div>';
  }
  // Only current/upcoming stints (end date >= today) show by default; past
  // ones pile up over time so they collapse behind a toggle.
  var tk = lcToday(), upcoming = [], past = [];
  for (var i = 0; i < lcWindowsCache.length; i++){ if ((lcWindowsCache[i].end || '') >= tk) upcoming.push(i); else past.push(i); }
  var out = '';
  for (var u = 0; u < upcoming.length; u++) out += stintCard(upcoming[u]);
  if (!upcoming.length) out += '<div class="empty" style="padding:6px 0;">No current or upcoming periods — tap “Add a stint”.</div>';
  if (past.length){
    out += '<button id="lcPastStintsToggle" class="btn btn-sm btn-ghost" style="width:100%;border-style:dashed;color:#6b7280;margin:2px 0 4px;" onclick="lcTogglePastStints()">Show ' + past.length + ' past period' + (past.length===1?'':'s') + ' ▾</button>';
    out += '<div id="lcPastStints" style="display:none;opacity:.72;">';
    for (var p = 0; p < past.length; p++) out += stintCard(past[p]);
    out += '</div>';
  }
  host.innerHTML = out;
}
function lcTogglePastStints(){
  var list = document.getElementById('lcPastStints'), btn = document.getElementById('lcPastStintsToggle');
  if (!list || !btn) return;
  var show = list.style.display === 'none';
  list.style.display = show ? '' : 'none';
  if (show){ btn.textContent = 'Hide past periods ▴'; }
  else { var n = list.querySelectorAll('button[onclick^="lasOpen"]').length; btn.textContent = 'Show ' + n + ' past period' + (n===1?'':'s') + ' ▾'; }
}
async function lcDelWindow(id){ if (!confirm('Remove this stint? Existing bookings stay; no new bookings inside it.')) return; var res = await lindaApi('linda-windows?id=' + id, { method: 'DELETE' }); if (res && res.ok) lcLoadWindows(); else alert((res && res.reason) || 'Failed.'); }

/* ── Admin stint editor (compose hours on a drag bar) ── */
var LAS = { id: 0, ranges: [], days: {}, preview: null, mode: null, resizeIdx: -1, resizeEdge: '', insideIdx: -1, moved: false, drag: { active: false, start: 0 }, wired: false };
var LAS_S = 7 * 60, LAS_E = 22 * 60, LAS_T = LAS_E - LAS_S, LAS_SNAP = 15, LAS_EDGE_PX = 12;
var LAS_DOW = ['MON','TUE','WED','THU','FRI','SAT','SUN'], LAS_ONE = { MON:'M', TUE:'T', WED:'W', THU:'T', FRI:'F', SAT:'S', SUN:'S' };
function lasPct(m){ var c = Math.max(LAS_S, Math.min(LAS_E, m)); return ((c - LAS_S) / LAS_T) * 100; }
function lasX2M(x){ var b = document.getElementById('lasBar'); if (!b) return 0; var r = b.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (x - r.left) / r.width)); return Math.round((LAS_S + p * LAS_T) / LAS_SNAP) * LAS_SNAP; }
function lasM2T(m){ return lcPad(Math.floor(m/60)) + ':' + lcPad(m%60); }
function lasT2M(s){ var p = String(s).split(':'); return (+p[0]) * 60 + (+p[1]); }
function lasMerge(){ LAS.ranges.sort(function(a,b){ return a.s - b.s; }); var o = []; for (var i=0;i<LAS.ranges.length;i++){ var r=LAS.ranges[i]; if (o.length && r.s<=o[o.length-1].e) o[o.length-1].e=Math.max(o[o.length-1].e,r.e); else o.push({s:r.s,e:r.e}); } LAS.ranges=o; }
function lasTip(s, e){ return '<div style="position:absolute;top:5px;transform:translateX(-50%);background:#0f172a;color:#fff;font-size:12px;font-weight:800;padding:3px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:9;left:'+((lasPct(s)+lasPct(e))/2)+'%;">'+lasM2T(s)+' – '+lasM2T(e)+'</div>'; }
function lasRenderBar(){
  var bar = document.getElementById('lasBar'); if (!bar) return;
  var seg = 'position:absolute;top:0;bottom:0;background:#10b981;opacity:.62;pointer-events:none;';
  var grip = 'position:absolute;top:0;bottom:0;width:5px;background:#065f46;opacity:.65;border-radius:2px;';
  var html = '';
  for (var i=0;i<LAS.ranges.length;i++){ var r=LAS.ranges[i]; html += '<div style="'+seg+'left:'+lasPct(r.s)+'%;width:'+(lasPct(r.e)-lasPct(r.s))+'%;"><span style="'+grip+'left:0;"></span><span style="'+grip+'right:0;"></span></div>'; }
  if (LAS.drag.active && LAS.mode === 'create' && LAS.preview){ var pr=LAS.preview;
    html += '<div style="position:absolute;top:0;bottom:0;background:#0ea5e9;opacity:.85;pointer-events:none;left:'+lasPct(pr.s)+'%;width:'+(lasPct(pr.e)-lasPct(pr.s))+'%;"></div>' + lasTip(pr.s, pr.e);
  } else if (LAS.drag.active && LAS.mode === 'resize' && LAS.ranges[LAS.resizeIdx]){ var rr=LAS.ranges[LAS.resizeIdx]; html += lasTip(rr.s, rr.e); }
  bar.innerHTML = html;
  lasSummary();
}
function lasSummary(){
  var el = document.getElementById('lasSummary'); if (!el) return;
  var days = LAS_DOW.filter(function(k){ return LAS.days[k]; });
  var rTxt = LAS.ranges.length ? LAS.ranges.map(function(r){ return lasM2T(r.s)+'–'+lasM2T(r.e); }).join(' & ') : '—';
  var dTxt = days.length===7 ? 'Every day' : days.length ? days.map(function(k){ return k.charAt(0)+k.slice(1).toLowerCase(); }).join(', ') : 'No days';
  el.innerHTML = LAS.ranges.length ? ('<b>'+lcEsc(dTxt)+'</b> · <b>'+lcEsc(rTxt)+'</b>') : '<span style="color:#6b7280;">Drag across the bar to add hours · drag an edge to resize · tap a block to remove.</span>';
}
function lasHit(x){
  var bar = document.getElementById('lasBar'); if (!bar) return null; var rect = bar.getBoundingClientRect();
  for (var i=0;i<LAS.ranges.length;i++){ var r=LAS.ranges[i];
    var lpx = rect.left + lasPct(r.s)/100*rect.width, rpx = rect.left + lasPct(r.e)/100*rect.width;
    if (Math.abs(x-lpx) <= LAS_EDGE_PX) return { i:i, edge:'s' };
    if (Math.abs(x-rpx) <= LAS_EDGE_PX) return { i:i, edge:'e' };
  }
  var m = lasX2M(x);
  for (var j=0;j<LAS.ranges.length;j++){ if (m > LAS.ranges[j].s && m < LAS.ranges[j].e) return { i:j, edge:'inside' }; }
  return null;
}
function lasDown(x){
  if (!document.getElementById('lasBar')) return;
  LAS.drag.active=true; LAS.moved=false; LAS.preview=null;
  var hit = lasHit(x);
  if (hit && (hit.edge==='s'||hit.edge==='e')){ LAS.mode='resize'; LAS.resizeIdx=hit.i; LAS.resizeEdge=hit.edge; lasRenderBar(); return; }
  if (hit && hit.edge==='inside'){ LAS.mode='inside'; LAS.insideIdx=hit.i; return; }
  LAS.mode='create'; LAS.drag.start=lasX2M(x); LAS.preview={s:LAS.drag.start,e:LAS.drag.start+LAS_SNAP}; lasRenderBar();
}
function lasMove(x){
  if (!LAS.drag.active) return; LAS.moved=true; var m=lasX2M(x);
  if (LAS.mode==='resize'){ var r=LAS.ranges[LAS.resizeIdx]; if (!r) return; if (LAS.resizeEdge==='s') r.s=Math.max(LAS_S,Math.min(m,r.e-LAS_SNAP)); else r.e=Math.min(LAS_E,Math.max(m,r.s+LAS_SNAP)); lasRenderBar(); return; }
  if (LAS.mode==='create'){ var s=Math.min(LAS.drag.start,m),e=Math.max(LAS.drag.start,m); if (e-s<LAS_SNAP) e=s+LAS_SNAP; LAS.preview={s:s,e:e}; lasRenderBar(); }
}
function lasUp(){
  if (!LAS.drag.active) return; LAS.drag.active=false;
  if (LAS.mode==='resize'){ lasMerge(); }
  else if (LAS.mode==='inside'){ if (!LAS.moved) LAS.ranges.splice(LAS.insideIdx,1); }
  else if (LAS.mode==='create'){ if (LAS.moved && LAS.preview){ LAS.ranges.push({s:LAS.preview.s,e:LAS.preview.e}); lasMerge(); } }
  LAS.mode=null; LAS.preview=null; LAS.resizeIdx=-1; LAS.insideIdx=-1;
  lasRenderBar();
}
function lasWire(){ if (LAS.wired) return; LAS.wired=true; window.addEventListener('mousemove', function(e){ lasMove(e.clientX); }); window.addEventListener('mouseup', lasUp);
  var b = document.getElementById('lasBar');
  if (b){ b.addEventListener('mousedown', function(e){ lasDown(e.clientX); }); b.addEventListener('touchstart', function(e){ if (e.touches.length) lasDown(e.touches[0].clientX); }, { passive: true }); b.addEventListener('touchmove', function(e){ if (e.touches.length) lasMove(e.touches[0].clientX); }, { passive: true }); b.addEventListener('touchend', lasUp); }
}
function lasPills(){
  var host = document.getElementById('lasPills'); if (!host) return;
  host.innerHTML = LAS_DOW.map(function(k){ var on = LAS.days[k]; return '<button type="button" data-k="'+k+'" style="width:40px;height:40px;border-radius:50%;border:1.5px solid '+(on?'#10b981':'#e5e7eb')+';background:'+(on?'#ecfdf5':'#fff')+';color:'+(on?'#065f46':'#9ca3af')+';font-size:13px;font-weight:800;cursor:pointer;">'+LAS_ONE[k]+'</button>'; }).join('');
  Array.prototype.forEach.call(host.children, function(b){ b.addEventListener('click', function(){ var k=b.getAttribute('data-k'); LAS.days[k]=LAS.days[k]?0:1; lasPills(); lasSummary(); }); });
}
function lasOpen(i){
  lasWire();
  var win = i >= 0 ? lcWindowsCache[i] : null;
  LAS.id = win ? win.id : 0; LAS.ranges = []; LAS.preview = null; LAS.drag.active = false;
  LAS.days = { MON:1, TUE:1, WED:1, THU:1, FRI:1, SAT:1, SUN:0 };
  document.getElementById('lasMsg').textContent = '';
  if (win){
    document.getElementById('lasTitle').textContent = 'Edit stint';
    document.getElementById('lasFrom').value = win.start; document.getElementById('lasTo').value = win.end; document.getElementById('lasNote').value = win.note || '';
    if (win.hours && win.hours.ranges && win.hours.ranges.length){
      LAS.ranges = win.hours.ranges.map(function(r){ return { s: lasT2M(r.start), e: lasT2M(r.end) }; });
      var d = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 }; (win.hours.days || []).forEach(function(k){ d[k]=1; }); LAS.days = d;
    }
  } else {
    document.getElementById('lasTitle').textContent = 'Add a stint';
    document.getElementById('lasFrom').value = lcToday(); document.getElementById('lasTo').value = ''; document.getElementById('lasNote').value = '';
  }
  lasPills(); lasRenderBar();
  document.getElementById('lasBg').style.display = 'flex';
}
function lasClose(ev){ if (ev && ev.target && ev.target.id !== 'lasBg') return; document.getElementById('lasBg').style.display = 'none'; }
async function lasSave(){
  var s = document.getElementById('lasFrom').value, e = document.getElementById('lasTo').value, note = document.getElementById('lasNote').value.trim();
  var msg = document.getElementById('lasMsg');
  if (!s || !e){ msg.style.color = '#dc2626'; msg.textContent = 'Pick both dates.'; return; }
  if (e < s){ msg.style.color = '#dc2626'; msg.textContent = 'End date is before start.'; return; }
  var days = LAS_DOW.filter(function(k){ return LAS.days[k]; });
  var ranges = LAS.ranges.map(function(r){ return { start: lasM2T(r.s), end: lasM2T(r.e) }; });
  if (ranges.length && !days.length){ msg.style.color = '#dc2626'; msg.textContent = 'Pick at least one working day.'; return; }
  var body = { startDate: s, endDate: e, note: note, hours: ranges.length ? { days: days, ranges: ranges } : null };
  var method = 'POST'; if (LAS.id){ method = 'PUT'; body.id = LAS.id; }
  msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res = await lindaApi('linda-windows', { method: method, body: body });
  if (res && res.ok){ document.getElementById('lasBg').style.display = 'none'; lcLoadWindows(); }
  else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; }
}

/* ── Bulk bookings: paste a Date/Time/Name/Phone/Email table ── */
var lcBulkRows = [];
function lcBulkPDate(s){ s=(s||'').trim(); if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return s; var m=s.match(/^(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})$/); if(m){ var d=+m[1],mo=+m[2],y=+m[3]; if(y<100)y+=2000; if(mo>=1&&mo<=12&&d>=1&&d<=31) return y+'-'+lcPad(mo)+'-'+lcPad(d); } return null; }
function lcBulkPTime(s){ s=(s||'').trim().toLowerCase().replace(/\\s+/g,''); var ap=null; var a=s.match(/(am|pm)$/); if(a){ap=a[1];s=s.replace(/(am|pm)$/,'');} var h,mi; var t=s.match(/^(\\d{1,2}):(\\d{2})$/); if(t){h=+t[1];mi=+t[2];} else { var t2=s.match(/^(\\d{1,2})$/); if(!t2) return null; h=+t2[1]; mi=0; } if(ap==='pm'&&h<12)h+=12; if(ap==='am'&&h===12)h=0; if(h>23||mi>59) return null; return lcPad(h)+':'+lcPad(mi); }
function lcBulkParse(){
  var txt = document.getElementById('lcBulkText').value;
  var lines = txt.split(/\\r?\\n/).filter(function(l){ return l.trim(); });
  lcBulkRows = lines.map(function(line){
    var cells = (line.indexOf('\t') >= 0 ? line.split('\t') : line.split(',')).map(function(c){ return c.trim(); });
    var row = { dateKey: cells[0]||'', startTime: cells[1]||'', fullName: cells[2]||'', phone: cells[3]||'', email: cells[4]||'' };
    row._d = lcBulkPDate(row.dateKey); row._t = lcBulkPTime(row.startTime);
    row._ok = !!row._d && !!row._t && row.fullName.length > 1 && (row.phone.length >= 6 || row.email.indexOf('@') > 0);
    return row;
  });
  var host = document.getElementById('lcBulkPreview');
  var btn = document.getElementById('lcBulkBtn');
  if (!lcBulkRows.length){ host.innerHTML=''; btn.disabled=true; btn.textContent='Book all'; return; }
  var valid = lcBulkRows.filter(function(r){ return r._ok; }).length;
  var body = lcBulkRows.map(function(r){
    return '<tr style="background:'+(r._ok?'#f0fdf4':'#fef2f2')+';">'
      + '<td style="padding:5px 8px;">'+(r._ok?'✓':'✕')+'</td>'
      + '<td style="padding:5px 8px;white-space:nowrap;">'+lcEsc(r._d||r.dateKey||'—')+'</td>'
      + '<td style="padding:5px 8px;">'+lcEsc(r._t||r.startTime||'—')+'</td>'
      + '<td style="padding:5px 8px;">'+lcEsc(r.fullName||'—')+'</td>'
      + '<td style="padding:5px 8px;">'+lcEsc(r.phone||'')+'</td>'
      + '<td style="padding:5px 8px;">'+lcEsc(r.email||'')+'</td></tr>';
  }).join('');
  host.innerHTML = '<div style="max-height:230px;overflow:auto;border:1px solid #eef2f0;border-radius:8px;"><table style="width:100%;border-collapse:collapse;font-size:13px;">'
    + '<thead><tr style="background:#f9fafb;text-align:left;color:#6b7280;"><th style="padding:6px 8px;"></th><th style="padding:6px 8px;">Date</th><th style="padding:6px 8px;">Time</th><th style="padding:6px 8px;">Name</th><th style="padding:6px 8px;">Phone</th><th style="padding:6px 8px;">Email</th></tr></thead><tbody>'+body+'</tbody></table></div>'
    + '<div style="font-size:12.5px;color:#6b7280;margin-top:6px;">'+valid+' of '+lcBulkRows.length+' rows valid'+(valid<lcBulkRows.length?' — red rows are skipped':'')+'.</div>';
  btn.disabled = valid === 0;
  btn.textContent = valid ? ('Book ' + valid + ' booking' + (valid===1?'':'s')) : 'Nothing valid to book';
}
function lcBulkOpen(){ document.getElementById('lcBulkText').value=''; document.getElementById('lcBulkPreview').innerHTML=''; document.getElementById('lcBulkMsg').textContent=''; var b=document.getElementById('lcBulkBtn'); b.disabled=true; b.textContent='Book all'; document.getElementById('lcBulkBg').style.display='flex'; }
function lcBulkClose(ev){ if (ev && ev.target && ev.target.id !== 'lcBulkBg') return; document.getElementById('lcBulkBg').style.display='none'; }
async function lcBulkSubmit(){
  var valid = lcBulkRows.filter(function(r){ return r._ok; });
  if (!valid.length) return;
  var btn = document.getElementById('lcBulkBtn'); btn.disabled = true;
  var msg = document.getElementById('lcBulkMsg'); msg.style.color = '#6b7280'; msg.textContent = 'Booking ' + valid.length + '…';
  var rows = valid.map(function(r){ return { dateKey: r._d, startTime: r._t, fullName: r.fullName, phone: r.phone, email: r.email }; });
  var res = await lindaApi('linda-bulk-booking', { body: { rows: rows } });
  if (res && res.ok){
    var failed = (res.results||[]).filter(function(x){ return !x.ok; });
    msg.style.color = failed.length ? '#92400e' : '#059669';
    msg.textContent = 'Created ' + res.created + ' of ' + res.total + '.' + (failed.length ? (' ' + failed.length + ' skipped: ' + failed.slice(0,3).map(function(f){ return (f.startTime||'') + ' — ' + f.reason; }).join('; ') + (failed.length>3?'…':'')) : '');
    lcLoadDay(); loadLindaStats();
    if (!failed.length) setTimeout(function(){ lcBulkClose(); }, 1200); else btn.disabled = false;
  } else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; btn.disabled = false; }
}

async function lcLoadOff(){
  var host = document.getElementById('lcOffList');
  var res = await lindaApi('linda-off');
  if (!res || !res.ok){ host.innerHTML = '<div class="empty" style="padding:6px 0;">Failed to load.</div>'; return; }
  var offs = res.off || [];
  var future = offs.filter(function(o){ return o.date_key >= lcToday(); });
  if (!future.length){ host.innerHTML = '<div class="empty" style="padding:6px 0;">No upcoming days off.</div>'; return; }
  host.innerHTML = future.map(function(o){
    return '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fef2f2;border-radius:8px;margin-bottom:6px;">'
      + '<span style="flex:1 1 auto;font-size:14px;font-weight:700;color:#991b1b;">' + lcEsc(lcNiceDate(o.date_key)) + (o.reason?' <span style="color:#6b7280;font-weight:400;">· ' + lcEsc(o.reason) + '</span>':'') + '</span>'
      + '<button class="btn btn-sm btn-ghost" onclick="lcDelOff(' + o.id + ')">Undo</button></div>';
  }).join('');
}
async function lcAddOff(){
  var from = document.getElementById('lcOffFrom').value, to = document.getElementById('lcOffTo').value || from, reason = document.getElementById('lcOffReason').value.trim();
  var msg = document.getElementById('lcOffMsg');
  if (!from){ msg.style.color = '#dc2626'; msg.textContent = 'Pick a date.'; return; }
  msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res = await lindaApi('linda-off', { body: { dateKey: from, dateKeyEnd: to, reason: reason } });
  if (res && res.ok){ msg.textContent = ''; document.getElementById('lcOffReason').value = ''; lcLoadOff(); lcLoadDay(); }
  else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; }
}
async function lcDelOff(id){ var res = await lindaApi('linda-off?id=' + id, { method: 'DELETE' }); if (res && res.ok){ lcLoadOff(); lcLoadDay(); } else alert((res && res.reason) || 'Failed.'); }

async function lcLoadPerDay(){
  var dk = document.getElementById('lcPdDate').value;
  var host = document.getElementById('lcPdList');
  if (!dk){ host.innerHTML = ''; return; }
  var res = await lindaApi('linda-slots?date=' + encodeURIComponent(dk));
  if (!res || !res.ok){ host.innerHTML = ''; return; }
  var rows = '';
  (res.extras || []).forEach(function(x){
    rows += '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#ecfdf5;border-radius:8px;margin-bottom:5px;">'
      + '<span style="flex:0 0 auto;font-size:11px;font-weight:800;text-transform:uppercase;color:#065f46;">Extra</span>'
      + '<span style="flex:1 1 auto;font-size:13px;font-weight:700;">' + lcEsc(x.start_time) + ' – ' + lcEsc(x.end_time) + '</span>'
      + '<button class="btn btn-sm btn-ghost" onclick="lcDelExtra(' + x.id + ')">Remove</button></div>';
  });
  (res.blocks || []).forEach(function(b){
    rows += '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#fef2f2;border-radius:8px;margin-bottom:5px;">'
      + '<span style="flex:0 0 auto;font-size:11px;font-weight:800;text-transform:uppercase;color:#991b1b;">Block</span>'
      + '<span style="flex:1 1 auto;font-size:13px;font-weight:700;">' + lcEsc(b.start_time) + ' – ' + lcEsc(b.end_time) + '</span>'
      + '<button class="btn btn-sm btn-ghost" onclick="lcDelBlock(' + b.id + ')">Remove</button></div>';
  });
  if (res.dayOff) rows = '<div style="padding:7px 10px;background:#fef2f2;border-radius:8px;margin-bottom:5px;font-size:13px;font-weight:700;color:#991b1b;">This whole day is marked off.</div>' + rows;
  host.innerHTML = rows;
}
async function lcAddExtra(){
  var dk = document.getElementById('lcPdDate').value, s = document.getElementById('lcPdStart').value, e = document.getElementById('lcPdEnd').value;
  var msg = document.getElementById('lcPdMsg');
  if (!dk || !s || !e){ msg.style.color = '#dc2626'; msg.textContent = 'Pick a date and times.'; return; }
  msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res = await lindaApi('linda-extras', { body: { dateKey: dk, startTime: s, endTime: e } });
  if (res && res.ok){ msg.textContent = ''; lcLoadPerDay(); lcLoadDay(); }
  else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; }
}
async function lcAddBlock(){
  var dk = document.getElementById('lcPdDate').value, s = document.getElementById('lcPdStart').value, e = document.getElementById('lcPdEnd').value;
  var msg = document.getElementById('lcPdMsg');
  if (!dk || !s || !e){ msg.style.color = '#dc2626'; msg.textContent = 'Pick a date and times.'; return; }
  msg.style.color = '#6b7280'; msg.textContent = 'Saving…';
  var res = await lindaApi('linda-blocks', { body: { dateKey: dk, startTime: s, endTime: e } });
  if (res && res.ok){ msg.textContent = ''; lcLoadPerDay(); lcLoadDay(); }
  else { msg.style.color = '#dc2626'; msg.textContent = (res && res.reason) || 'Failed.'; }
}
async function lcDelExtra(id){ var res = await lindaApi('linda-extras?id=' + id, { method: 'DELETE' }); if (res && res.ok){ lcLoadPerDay(); lcLoadDay(); } else alert((res && res.reason) || 'Failed.'); }
async function lcDelBlock(id){ var res = await lindaApi('linda-blocks?id=' + id, { method: 'DELETE' }); if (res && res.ok){ lcLoadPerDay(); lcLoadDay(); } else alert((res && res.reason) || 'Failed.'); }

// ── Linda config (availability editor) ──
async function loadLindaConfig() {
  try {
    var res = await apiCall('linda-config');
    if (!res || !res.ok || !res.config) return;
    var c = res.config;
    document.getElementById('lindaEnabled').checked = !!c.enabled;
    document.getElementById('lindaEnabledLabel').textContent = c.enabled ? 'Enabled' : 'Disabled';
    document.getElementById('lindaWinStart').value = c.windowStart || '';
    document.getElementById('lindaWinEnd').value = c.windowEnd || '';
    var slot = document.getElementById('lindaSlotMin');
    slot.value = String(c.slotMin || 30);
    // Extract morning/afternoon blocks from MON (assumed representative)
    var mon = (c.hours && c.hours.MON) || [];
    var morning = mon[0] || { start: '', end: '' };
    var afternoon = mon[1] || { start: '', end: '' };
    document.getElementById('lindaMorningStart').value = morning.start || '';
    document.getElementById('lindaMorningEnd').value = morning.end || '';
    document.getElementById('lindaAfternoonStart').value = afternoon.start || '';
    document.getElementById('lindaAfternoonEnd').value = afternoon.end || '';
    document.getElementById('lindaIncludeSat').checked = !!(c.hours && c.hours.SAT && c.hours.SAT.length);

    // Update intro banner
    var intro = document.getElementById('lindaIntroLine');
    if (intro) {
      var line = 'Potter\\u2019s Clinic \\u00b7 ' + (c.windowStart || '?') + ' \\u2013 ' + (c.windowEnd || '?') + ' \\u00b7 ' + (c.slotMin || 30) + '-min sessions';
      if (!c.enabled) line += ' \\u00b7 DISABLED';
      intro.textContent = line;
    }

    // Keep review-date picker bounded by configured window
    var di = document.getElementById('lindaReviewDate');
    if (di) {
      if (c.windowStart) di.min = c.windowStart;
      if (c.windowEnd) di.max = c.windowEnd;
      if (!di.value && c.windowStart) {
        var today = new Date().toISOString().slice(0, 10);
        di.value = (today >= c.windowStart && today <= c.windowEnd) ? today : c.windowStart;
      }
    }
  } catch (e) { /* no-op */ }
}

async function saveLindaConfig() {
  var msgEl = document.getElementById('lindaCfgMsg');
  msgEl.textContent = 'Saving...';
  msgEl.style.color = '#6b7280';

  var ms = document.getElementById('lindaMorningStart').value;
  var me = document.getElementById('lindaMorningEnd').value;
  var as = document.getElementById('lindaAfternoonStart').value;
  var ae = document.getElementById('lindaAfternoonEnd').value;
  var blocks = [];
  if (ms && me) blocks.push({ start: ms, end: me });
  if (as && ae) blocks.push({ start: as, end: ae });

  var weekdayBlocks = blocks;
  var satBlocks = document.getElementById('lindaIncludeSat').checked ? blocks : [];

  var hours = {
    MON: weekdayBlocks, TUE: weekdayBlocks, WED: weekdayBlocks,
    THU: weekdayBlocks, FRI: weekdayBlocks, SAT: satBlocks, SUN: [],
  };

  var body = {
    enabled: document.getElementById('lindaEnabled').checked,
    windowStart: document.getElementById('lindaWinStart').value,
    windowEnd: document.getElementById('lindaWinEnd').value,
    slotMin: parseInt(document.getElementById('lindaSlotMin').value, 10) || 30,
    hours: hours,
  };

  try {
    var res = await apiCall('linda-config', { body: body });
    if (res && res.ok) {
      msgEl.textContent = 'Saved.';
      msgEl.style.color = '#059669';
      loadLindaConfig();
      loadLindaStats();
    } else {
      msgEl.textContent = (res && res.reason) || 'Save failed.';
      msgEl.style.color = '#dc2626';
    }
  } catch (e) {
    msgEl.textContent = 'Network error.';
    msgEl.style.color = '#dc2626';
  }
}

async function loadLindaStats() {
  var el = document.getElementById('lindaStats');
  var up = document.getElementById('lindaUpcoming');
  try {
    var res = await apiCall('linda-stats');
    if (!res || !res.ok) { el.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
    var t = res.totals;
    el.innerHTML =
      '<div class="stats-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;">' +
        '<div class="stat"><div class="num">' + t.total + '</div><div class="label">Total</div></div>' +
        '<div class="stat"><div class="num">' + t.booked + '</div><div class="label">Booked</div></div>' +
        '<div class="stat"><div class="num">' + t.attended + '</div><div class="label">Attended</div></div>' +
        '<div class="stat"><div class="num">' + t.cancelled + '</div><div class="label">Cancelled</div></div>' +
        '<div class="stat"><div class="num">' + t.noShow + '</div><div class="label">No-Show</div></div>' +
      '</div>';

    if (!res.upcoming || !res.upcoming.length) {
      up.innerHTML = '<div class="empty">No upcoming appointments.</div>';
    } else {
      var html = '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead><tbody>';
      res.upcoming.forEach(function(a){
        html += '<tr><td>' + esc(a.dateKey) + '</td><td>' + esc(a.startTime) + '</td><td>' + esc(a.fullName) + '</td><td>' + esc(a.email) + '</td><td>' + esc(a.phone) + '</td></tr>';
      });
      html += '</tbody></table></div>';
      up.innerHTML = html;
    }
  } catch (e) {
    el.innerHTML = '<div class="empty">Error loading stats.</div>';
  }
}

async function loadLindaReviews() {
  var dateInput = document.getElementById('lindaReviewDate');
  var date = dateInput.value;
  var list = document.getElementById('lindaReviewList');
  var btn = document.getElementById('lindaReviewSendBtn');
  if (!date) { list.innerHTML = '<div class="empty">Please pick a date.</div>'; btn.style.display = 'none'; return; }
  list.innerHTML = '<div class="empty">Loading...</div>';
  try {
    var res = await apiCall('linda-reviews?date=' + encodeURIComponent(date));
    if (!res || !res.ok || !res.patients || !res.patients.length) {
      list.innerHTML = '<div class="empty">No patients to review on this date.</div>';
      btn.style.display = 'none';
      return;
    }
    var html = '<div class="table-wrap"><table><thead><tr><th><input type="checkbox" onchange="toggleLinda(this)"></th><th>Time</th><th>Name</th><th>Email</th><th>Sent?</th></tr></thead><tbody>';
    res.patients.forEach(function(p){
      var disabled = p.reviewSent ? 'disabled' : '';
      var sentLabel = 'No';
      if (p.reviewSent) {
        sentLabel = p.reviewSource === 'auto' ? 'Yes (auto)' : 'Yes';
      }
      html += '<tr><td><input type="checkbox" class="linda-cb" data-id="' + esc(p.appointmentId) + '" ' + disabled + '></td>' +
        '<td>' + esc(p.startTime) + '</td>' +
        '<td>' + esc(p.fullName) + '</td>' +
        '<td>' + esc(p.email) + '</td>' +
        '<td title="' + esc(p.reviewSentAt || '') + '">' + sentLabel + '</td></tr>';
    });
    html += '</tbody></table></div>';
    list.innerHTML = html;
    btn.style.display = 'inline-block';
  } catch (e) {
    list.innerHTML = '<div class="empty">Error loading patients.</div>';
  }
}

function toggleLinda(master) {
  var cbs = document.querySelectorAll('#lindaReviewList .linda-cb:not([disabled])');
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = master.checked;
}

async function sendLindaReviews() {
  var boxes = document.querySelectorAll('#lindaReviewList .linda-cb:checked');
  var ids = Array.prototype.slice.call(boxes).map(function(b){ return b.getAttribute('data-id'); });
  if (!ids.length) { showMsg('globalMsg', 'bad', 'Select at least one patient.'); return; }
  var date = document.getElementById('lindaReviewDate').value;
  try {
    var res = await apiCall('linda-reviews/send', { body: { appointmentIds: ids, dateKey: date } });
    if (res && res.ok) {
      showMsg('globalMsg', 'good', res.message || ('Sent ' + res.sent + ' review request(s).'));
      loadLindaReviews();
    } else {
      showMsg('globalMsg', 'bad', (res && res.reason) || 'Failed to send.');
    }
  } catch (e) {
    showMsg('globalMsg', 'bad', 'Network error.');
  }
}

async function loadLindaFollowUps() {
  var el = document.getElementById('lindaFollowUps');
  try {
    var res = await apiCall('linda-follow-ups');
    if (!res || !res.ok || !res.followUps || !res.followUps.length) {
      el.innerHTML = '<div class="empty">No follow-ups yet.</div>';
      return;
    }
    var html = '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Patient</th><th>Email</th><th>Response</th><th>Status</th></tr></thead><tbody>';
    res.followUps.forEach(function(f){
      html += '<tr><td>' + esc(f.date_key) + '</td><td>' + esc(f.patient_name) + '</td><td>' + esc(f.email) + '</td><td>' + esc(f.response || '') + '</td><td>' + esc(f.status) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = '<div class="empty">Error loading follow-ups.</div>';
  }
}

function getStatusBadge(status) {
  if (status === 'ATTENDED') return { cls: 'badge-dark', text: 'Attended' };
  if (status === 'NO_SHOW') return { cls: 'badge-amber', text: 'No-Show' };
  if (status === 'RELOCATED_SPINOLA') return { cls: 'badge-green', text: 'Spinola' };
  if (status && status.indexOf('CANCELLED') >= 0) return { cls: 'badge-red', text: 'Cancelled' };
  return { cls: 'badge-green', text: 'Booked' };
}

function renderApptTable(appts, containerId, withCheckboxes, showDate) {
  var el = document.getElementById(containerId);
  if (!appts || !appts.length) {
    el.innerHTML = '<div class="empty">No appointments.</div>';
    return;
  }
  var html = '<div class="table-wrap"><table><thead><tr>';
  if (withCheckboxes) html += '<th><input type="checkbox" onchange="toggleAll(this, \\'' + containerId + '\\')"></th>';
  if (showDate) html += '<th>Date</th>';
  html += '<th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Source</th><th>Status</th><th></th></tr></thead><tbody>';
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var badge = getStatusBadge(a.status);
    html += '<tr' + (showDate ? ' style="cursor:pointer" onclick="goToDate(\\'' + esc(a.dateKey) + '\\')"' : '') + '>';
    if (withCheckboxes) html += '<td><input type="checkbox" class="appt-cb" value="' + esc(a.appointmentId) + '"></td>';
    if (showDate) html += '<td><b>' + esc(a.dateKey) + '</b></td>';
    html += '<td><b>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</b></td>';
    html += '<td><a class="patient-link" href="#" onclick="event.stopPropagation();event.preventDefault();showPatientHistory(\\'' + esc(a.email) + '\\',\\'' + esc(a.phone) + '\\')">' + esc(a.fullName) + '</a>' + (a.hotel ? '<div style="font-size:11px;color:var(--muted);margin-top:2px;">&#127976; ' + esc(a.hotel) + '</div>' : '') + '</td>';
    html += '<td>' + esc(a.phone) + '</td>';
    html += '<td>' + esc(a.serviceName) + '</td>';
    html += '<td>' + esc(a.location) + '</td>';
    html += '<td>' + (a.bookingSource ? '<span class="badge" style="background:#eff6ff;color:#1e40af;">' + esc(a.bookingSource) + '</span>' : '<span style="color:#d1d5db;">—</span>') + '</td>';
    html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span>' + (a.confirmed ? ' <span class="badge" style="background:#d1fae5;color:#065f46;">Confirmed</span>' : '') + '</td>';
    html += '<td>';
    if (a.status === 'BOOKED' || a.status === 'RELOCATED_SPINOLA') {
      html += '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();cancelSingleAppt(\\'' + esc(a.appointmentId) + '\\', \\'' + containerId + '\\')">Cancel</button>';
      html += '<span class="att-btns">';
      html += '<button class="btn btn-sm btn-good" onclick="event.stopPropagation();markAttendance(\\'' + esc(a.appointmentId) + '\\',\\'' + esc(a.dateKey) + '\\',true,\\'' + containerId + '\\')">Attended</button>';
      html += '<button class="btn btn-sm btn-warn" onclick="event.stopPropagation();markAttendance(\\'' + esc(a.appointmentId) + '\\',\\'' + esc(a.dateKey) + '\\',false,\\'' + containerId + '\\')">No-Show</button>';
      html += '</span>';
    }
    html += '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderOverrides(offEntries, extraEntries) {
  var el = document.getElementById('overridesList');
  var items = [];
  var todayStr = new Date().toISOString().slice(0, 10);

  (offEntries || []).forEach(function(e) {
    var dateLabel = formatDateNice(e.startDate);
    if (e.endDate && e.endDate !== e.startDate) dateLabel += ' - ' + formatDateNice(e.endDate);
    var timeLabel = (e.startTime && e.endTime) ? e.startTime + ' - ' + e.endTime : 'All day';
    items.push({
      type: 'block', sortDate: e.startDate, rowIndex: e.rowIndex,
      dateLabel: dateLabel, timeLabel: timeLabel, reason: e.reason || '',
      past: (e.endDate || e.startDate) < todayStr
    });
  });

  (extraEntries || []).forEach(function(e) {
    items.push({
      type: 'extra', sortDate: e.date, rowIndex: e.rowIndex,
      dateLabel: formatDateNice(e.date), timeLabel: e.startTime + ' - ' + e.endTime,
      reason: e.reason || '', past: e.date < todayStr
    });
  });

  items.sort(function(a, b) { return a.sortDate < b.sortDate ? -1 : a.sortDate > b.sortDate ? 1 : 0; });

  if (!items.length) {
    el.innerHTML = '<div class="empty">No overrides set.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var icon = it.type === 'block' ? '<span style="color:var(--bad)">&#x1f6ab;</span>' : '<span style="color:var(--good)">&#x2795;</span>';
    html += '<div class="override-item' + (it.past ? ' past' : '') + '">';
    html += '<div class="ov-icon">' + icon + '</div>';
    html += '<div class="ov-info">';
    html += '<span class="ov-date">' + esc(it.dateLabel) + '</span>';
    html += ' <span class="ov-detail">' + esc(it.timeLabel) + '</span>';
    if (it.reason) html += ' <span class="ov-reason"> &middot; ' + esc(it.reason) + '</span>';
    html += '</div>';
    html += '<button class="ov-remove" onclick="removeOverride(\\'' + it.type + '\\',' + it.rowIndex + ')" title="Remove">&times;</button>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function formatDateNice(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
}

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[d.getDay()] + ', ' + formatDateNice(dateStr);
}

// ========== DDA (controlled-drug) register ==========
var _ddaSelectedId = null;

async function loadDdaList() {
  var listEl = document.getElementById('ddaList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="empty">Loading...</div>';
  try {
    var res = await apiCall('dda');
    if (!res || !res.ok) { listEl.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
    renderDdaEntries(res.entries || []);
  } catch (err) {
    listEl.innerHTML = '<div class="empty">Failed to load entries.</div>';
  }
}

function renderDdaEntries(entries) {
  var listEl = document.getElementById('ddaList');
  if (!listEl) return;
  window._ddaEntries = {};
  if (!entries.length) {
    listEl.innerHTML = '<div class="empty">No DDA entries yet. Paste a row above to start the register.</div>';
    return;
  }
  var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
    '<thead><tr style="background:#f9fafb;text-align:left;">' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Drug</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Qty</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Code</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">PV</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Doctor</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;">Rx date</th>' +
    '<th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">Actions</th>' +
    '</tr></thead><tbody>';
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    window._ddaEntries[e.id] = e;
    var rxDate = String(e.rx_date || '').split(' ')[0];
    var sel = (_ddaSelectedId != null && String(_ddaSelectedId) === String(e.id));
    html += '<tr data-dda-id="' + esc(e.id) + '" onclick="selectDdaRow(' + esc(e.id) + ')" style="cursor:pointer;' + (sel ? 'background:#ede9fe;' : '') + '">' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;"><b>' + esc(e.patient_name) + '</b></td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + esc(e.drug) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + esc(e.quantity) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + esc(e.code) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + esc(e.pv) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + esc(e.doctor_code) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;white-space:nowrap;">' + esc(rxDate) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">' +
        '<button class="btn btn-sm" style="background:#7c3aed;color:#fff;margin-right:4px;" onclick="event.stopPropagation();printDdaEntry(' + esc(e.id) + ')">&#x1F5A8;&#xFE0F; Print</button>' +
        '<button class="btn btn-sm" style="background:#ef4444;color:#fff;" onclick="event.stopPropagation();deleteDdaEntry(' + esc(e.id) + ')">Delete</button>' +
      '</td></tr>';
  }
  html += '</tbody></table></div>';
  listEl.innerHTML = html;
}

function selectDdaRow(id) {
  _ddaSelectedId = id;
  var rows = document.querySelectorAll('#ddaList tr[data-dda-id]');
  for (var i = 0; i < rows.length; i++) {
    rows[i].style.background = (rows[i].getAttribute('data-dda-id') === String(id)) ? '#ede9fe' : '';
  }
}

async function addDdaEntries() {
  var msg = document.getElementById('ddaAddMsg');
  var ta = document.getElementById('ddaPaste');
  var raw = ta.value;
  if (!raw.trim()) { msg.style.color = '#b91c1c'; msg.textContent = 'Paste at least one row first.'; return; }
  msg.style.color = '#6b7280';
  msg.textContent = 'Saving...';
  try {
    var res = await apiCall('dda', { body: { raw: raw } });
    if (res && res.ok) {
      msg.style.color = '#059669';
      msg.textContent = 'Added ' + (res.added || 0) + ' row' + (res.added === 1 ? '' : 's') + '.';
      ta.value = '';
      renderDdaEntries(res.entries || []);
    } else {
      msg.style.color = '#b91c1c';
      msg.textContent = (res && res.reason) ? res.reason : 'Failed to add.';
    }
  } catch (err) {
    msg.style.color = '#b91c1c';
    msg.textContent = 'Failed to add.';
  }
}

async function deleteDdaEntry(id) {
  if (!confirm('Delete this DDA entry from the register?')) return;
  try {
    var res = await apiCall('dda/' + encodeURIComponent(id), { method: 'DELETE' });
    if (res && res.ok) {
      if (String(_ddaSelectedId) === String(id)) _ddaSelectedId = null;
      loadDdaList();
    } else {
      alert((res && res.reason) ? res.reason : 'Failed to delete.');
    }
  } catch (err) { alert('Failed to delete.'); }
}

// Derive the "7 Tablets" line: quantity + unit pulled from the drug's last
// parenthetical (e.g. "(Tablet)"), pluralised unless the quantity is 1.
function ddaQtyLine(drug, qty) {
  qty = (qty == null ? '' : String(qty)).trim();
  var unit = '';
  var matches = String(drug || '').match(/\\(([^)]*)\\)/g);
  if (matches && matches.length) unit = matches[matches.length - 1].replace(/[()]/g, '').trim();
  if (unit && qty) {
    var plural = (qty !== '1' && !/s$/i.test(unit)) ? unit + 's' : unit;
    return qty + ' ' + plural;
  }
  return qty || unit || '';
}

function ddaLabelLines(e) {
  return [
    e.patient_name || '',
    e.code || '',
    e.pv || '',
    e.drug || '',
    ddaQtyLine(e.drug, e.quantity),
    e.doctor_code || '',
    String(e.rx_date || '').split(' ')[0]
  ];
}

// Fixed pharmacy / pharmacist credentials printed as the second DDA label
// (page 2 on the roll) — required on its own sticker alongside every entry.
function ddaSecondLabelLines() {
  return [
    'Potters Pharmacy',
    'DL191',
    'John Agius',
    'Pharmacist',
    'Reg. 1269'
  ];
}

// Build a self-contained label document of two 75x50mm stickers: page 1 is the
// patient/drug entry, page 2 the fixed pharmacy credentials. Times New Roman
// Bold 16pt, a 3mm margin on every side, content clipped so a long entry can
// never spill onto the next sticker on the roll.
function ddaBuildLabelHtml(e) {
  function rows(lines) {
    var out = '';
    for (var i = 0; i < lines.length; i++) out += '<div class="ln">' + esc(lines[i]) + '</div>';
    return out;
  }
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>DDA Label</title><style>' +
    '@page{size:75mm 50mm;margin:0;}' +
    'html,body{margin:0;padding:0;}' +
    'body{width:75mm;}' +
    '.label{box-sizing:border-box;width:75mm;height:50mm;padding:3mm;overflow:hidden;' +
    'font-family:\\'Times New Roman\\',Times,serif;font-weight:bold;font-size:16pt;line-height:1.1;}' +
    '.label.page2{page-break-before:always;}' +
    '.label .ln{overflow:hidden;}' +
    '</style></head><body>' +
    '<div class="label">' + rows(ddaLabelLines(e)) + '</div>' +
    '<div class="label page2">' + rows(ddaSecondLabelLines()) + '</div>' +
    '<script>window.onload=function(){window.focus();window.print();};window.onafterprint=function(){window.close();};<\\/script>' +
    '</body></html>';
}

function printDdaEntry(id) {
  var e = (window._ddaEntries || {})[id];
  if (!e) { alert('Entry not found — refresh the list and try again.'); return; }
  var w = window.open('', '_blank', 'width=420,height=320');
  if (!w) { alert('Pop-up blocked. Allow pop-ups for this site so the label can print.'); return; }
  w.document.open();
  w.document.write(ddaBuildLabelHtml(e));
  w.document.close();
}

function printSelectedDda() {
  if (_ddaSelectedId == null) { alert('Click a row in the table to select it first.'); return; }
  printDdaEntry(_ddaSelectedId);
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleAll(masterCb, containerId) {
  var cbs = document.getElementById(containerId).querySelectorAll('.appt-cb');
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = masterCb.checked;
}

function getSelectedIds(containerId) {
  var cbs = document.getElementById(containerId).querySelectorAll('.appt-cb:checked');
  var ids = [];
  for (var i = 0; i < cbs.length; i++) ids.push(cbs[i].value);
  return ids;
}

// ========== Date helpers ==========

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function addDaysStr(dateStr, n) {
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function getMondayOf(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var dow = d.getDay();
  var diff = dow === 0 ? -6 : 1 - dow; // Monday = 1
  d.setDate(d.getDate() + diff);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ========== Load Dashboard ==========

function loadDashboard() {
  if (!_silentRefresh) showLoading('Loading dashboard...', 'Fetching appointment data.');
  google.script.run
    .withSuccessHandler(function(res) {
      _silentRefresh = false;
      hideLoading();
      if (!res || !res.ok) { showMsg('globalMsg', 'bad', 'Failed to load dashboard.'); return; }

      document.getElementById('statBooked').textContent = res.stats.weekBooked;
      document.getElementById('statCancelled').textContent = res.stats.weekCancelled;
      document.getElementById('statTomorrow').textContent = res.tomorrowAppointments.length;
      updateFillRing(res.todayAppointments.length, res.stats.todayCapacity || 0);
      try { loadTelemedicineStats(); } catch(e) {}

      renderOverrides(res.doctorOffEntries, res.extraSlotEntries);

      // Update timeline data
      _tlWorkingHours = res.workingHours || null;
      _tlOffEntries = res.doctorOffEntries || [];
      _tlExtraEntries = res.extraSlotEntries || [];
      if (!_tlDate) _tlDate = res.todayKey;
      renderTimeline();

      _cachedDashboard = _dashboardHash(res);
      if (res._v !== undefined) _cachedVersion = res._v;

      // Initialize schedule to today if not set
      if (!_schedDate) {
        _schedDate = res.todayKey;
        _weekStart = getMondayOf(_schedDate);
        document.getElementById('schedDate').value = _schedDate;
      }

      // Load schedule for current date and week
      loadSchedAppts();
      try { loadWeekOverview(); } catch(e) { console.error('Week overview error:', e); }

      // Refresh Quick Actions — preserve user-selected date, only default if empty
      if (!document.getElementById('actionDate').value) document.getElementById('actionDate').value = res.todayKey;
      loadActionAppts();
      if (!document.getElementById('notifyDate').value) document.getElementById('notifyDate').value = res.todayKey;
      loadNotifyAppts();

      // Refresh stats if they were loaded
      if (Object.keys(_statsCache).length) { _statsCache = {}; loadStatistics(); }


      // Reset poll timer after manual load
      _lastRefreshTime = Date.now();
      if (_pollTimerId) { clearInterval(_pollTimerId); }
      _pollTimerId = setInterval(doPollAndRefresh, POLL_INTERVAL_SEC * 1000);
    })
    .withFailureHandler(function(err) {
      _silentRefresh = false;
      hideLoading();
      showMsg('globalMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetDashboard(SIG);
}

// ========== Schedule Tab: Date Navigation ==========

function goToDate(dateStr) {
  _schedDate = dateStr;
  document.getElementById('schedDate').value = dateStr;
  clearSearch();
  var newWeek = getMondayOf(dateStr);
  if (newWeek !== _weekStart) {
    _weekStart = newWeek;
    loadWeekOverview();
  } else {
    highlightWeekCell();
  }
  loadSchedAppts();
}

function goToToday() { goToDate(todayStr()); }
function goToTomorrow() { goToDate(addDaysStr(todayStr(), 1)); }
function changeDay(dir) { goToDate(addDaysStr(_schedDate, dir)); }
function onSchedDateChange() { goToDate(document.getElementById('schedDate').value); }

function loadSchedAppts() {
  if (!_schedDate) return;
  document.getElementById('schedHeader').textContent = formatDateFull(_schedDate);

  function loadOne(clinic, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<div class="empty">Loading...</div>';
    var url = '/api/admin/appointments?date=' + encodeURIComponent(_schedDate)
            + '&clinic=' + encodeURIComponent(clinic)
            + '&sig=' + encodeURIComponent(SIG);
    fetch(url, { credentials: 'same-origin' })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (!res || !res.ok) {
          el.innerHTML = '<div class="empty">' + esc((res && res.reason) || 'Failed.') + '</div>';
          return;
        }
        var appts = (res.appointments || []).map(transformAppt);
        // An appointment redirected to Spinola (quick action) leaves a
        // RELOCATED_SPINOLA tombstone on clinic='potters' while the live copy
        // now sits in the Spinola table. Hide that tombstone from Potter's so
        // a moved appointment no longer shows under both clinics.
        if (clinic === 'potters') {
          appts = appts.filter(function(a) { return a.status !== 'RELOCATED_SPINOLA'; });
        }
        renderApptTable(appts, containerId, false);
      })
      .catch(function() { el.innerHTML = '<div class="empty">Error loading.</div>'; });
  }

  loadOne('potters', 'schedTable');
  loadOne('spinola', 'schedTableSpinola');
  loadOne('linda', 'schedTableLinda');
  // Telemedicine — separate from Linda. Same date as the rest of the schedule.
  try { loadSchedTelemed(_schedDate); } catch(e) {}
  // Blood tests — pharmacy service at Potter's, listed as its own subsection.
  try { loadSchedBlood(_schedDate); } catch(e) {}
}

function loadSchedBlood(dateKey) {
  var el = document.getElementById('schedTableBlood');
  if (!el) return;
  el.innerHTML = '<div class="empty">Loading...</div>';
  apiCall('blood-test-appointments?date=' + encodeURIComponent(dateKey)).then(function(res) {
    if (!res || !res.ok) { el.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
    // Only blood tests still at Potter's belong in this section. A blood test
    // rescheduled to another clinic (e.g. Spinola) shows under that clinic's
    // table instead, so exclude anything that has been moved off Potter's.
    var appts = (res.appointments || []).filter(function(a) {
      return (!a.clinic || a.clinic === 'potters') && a.status !== 'RELOCATED_SPINOLA';
    }).map(transformAppt);
    renderApptTable(appts, 'schedTableBlood', false);
  }).catch(function() { el.innerHTML = '<div class="empty">Error loading.</div>'; });
}

function loadSchedTelemed(dateKey) {
  var el = document.getElementById('schedTableTelemed');
  var sumEl = document.getElementById('schedTelemedSummary');
  if (!el) return;
  el.innerHTML = '<div class="empty">Loading...</div>';
  apiCall('telemedicine?date=' + encodeURIComponent(dateKey)).then(function(res) {
    if (!res || !res.ok) {
      el.innerHTML = '<div class="empty">Failed to load.</div>';
      if (sumEl) sumEl.textContent = '';
      return;
    }
    var calls = res.calls || [];
    if (sumEl) {
      sumEl.textContent = calls.length
        ? '(' + (res.billableCount || 0) + ' billable · doctor ' + (res.totalRevenueLabel || '€0') + ' · medicine ' + (res.totalMedicineLabel || '€0') + ')'
        : '(none)';
    }
    if (!calls.length) {
      el.innerHTML = '<div class="empty">No telemedicine calls on this date.</div>';
      return;
    }
    var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
      '<thead><tr style="background:#fff;text-align:left;">' +
      '<th style="padding:6px;border-bottom:1px solid #fed7aa;">Time</th>' +
      '<th style="padding:6px;border-bottom:1px solid #fed7aa;">Patient</th>' +
      '<th style="padding:6px;border-bottom:1px solid #fed7aa;">Phone</th>' +
      '<th style="padding:6px;border-bottom:1px solid #fed7aa;">Fee</th>' +
      '<th style="padding:6px;border-bottom:1px solid #fed7aa;">Status</th>' +
      '</tr></thead><tbody>';
    for (var i = 0; i < calls.length; i++) {
      var c = calls[i];
      var time = (c.created_at || '').split(' ')[1] || '';
      time = time.split(':').slice(0,2).join(':');
      var rowStyle = c.status === 'CANCELLED' ? 'opacity:0.5;' : '';
      html += '<tr style="' + rowStyle + '">' +
        '<td style="padding:6px;border-bottom:1px solid #ffedd5;">' + escTelHtml(time) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ffedd5;"><b>' + escTelHtml(c.patient_name) + '</b></td>' +
        '<td style="padding:6px;border-bottom:1px solid #ffedd5;"><a href="tel:' + escTelHtml(c.phone) + '">' + escTelHtml(c.phone) + '</a></td>' +
        '<td style="padding:6px;border-bottom:1px solid #ffedd5;">' + telFormatEur(c.fee_cents) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ffedd5;">' + escTelHtml(c.status) + '</td>' +
      '</tr>';
    }
    html += '</tbody></table></div>' +
      '<div style="text-align:right;margin-top:6px;"><a href="#" onclick="switchTab(\\'telemedicine\\');return false;" style="font-size:12px;color:#9a3412;">Open Telemedicine tab &rarr;</a></div>';
    el.innerHTML = html;
  }).catch(function() {
    el.innerHTML = '<div class="empty">Error loading.</div>';
  });
}

// ========== Week Overview ==========

function changeWeek(dir) {
  _weekStart = addDaysStr(_weekStart, dir * 7);
  loadWeekOverview();
}

function loadWeekOverview() {
  var grid = document.getElementById('weekGrid');
  var label = document.getElementById('weekLabel');
  var endStr = addDaysStr(_weekStart, 6);
  label.textContent = formatDateNice(_weekStart) + ' - ' + formatDateNice(endStr);

  // Show placeholder cells
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  for (var i = 0; i < 7; i++) {
    var dk = addDaysStr(_weekStart, i);
    var num = parseInt(dk.split('-')[2], 10);
    html += '<div class="week-cell' + (dk === todayStr() ? ' today' : '') + (dk === _schedDate ? ' selected' : '') + '" onclick="goToDate(\\'' + dk + '\\')">';
    html += '<div class="wc-day">' + days[i] + '</div>';
    html += '<div class="wc-num">' + num + '</div>';
    html += '<div class="wc-count" id="wc-' + dk + '">...</div>';
    html += '</div>';
  }
  grid.innerHTML = html;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) return;
      for (var i = 0; i < res.days.length; i++) {
        var d = res.days[i];
        var countEl = document.getElementById('wc-' + d.dateKey);
        if (!countEl) continue;
        var cell = countEl.closest('.week-cell');

        if (!d.hasHours && d.count === 0) {
          countEl.textContent = '--';
          cell.classList.add('no-hours');
        } else {
          var dots = '';
          if (d.hasBlock) dots += '<span class="wc-dot" style="background:var(--bad)"></span>';
          if (d.hasExtra) dots += '<span class="wc-dot" style="background:var(--good)"></span>';
          countEl.innerHTML = d.count + (dots ? ' ' + dots : '');
          if (d.hasBlock) cell.classList.add('blocked');
        }
      }
    })
    .withFailureHandler(function() {})
    .apiAdminGetWeekOverview(SIG, _weekStart);
}

function highlightWeekCell() {
  var cells = document.querySelectorAll('.week-cell');
  cells.forEach(function(c) { c.classList.remove('selected'); });
  // Find the cell for _schedDate by looking at onclick
  cells.forEach(function(c) {
    if (c.getAttribute('onclick') && c.getAttribute('onclick').indexOf(_schedDate) >= 0) {
      c.classList.add('selected');
    }
  });
}

// ========== Search ==========

function onSearchInput() {
  var q = document.getElementById('searchInput').value.trim();
  document.getElementById('searchClear').style.display = q ? 'block' : 'none';

  if (_searchTimer) clearTimeout(_searchTimer);

  if (q.length < 2) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('scheduleView').style.display = 'block';
    return;
  }

  _searchTimer = setTimeout(function() { doSearch(q); }, 400);
}

function doSearch(query) {
  document.getElementById('searchResults').style.display = 'block';
  document.getElementById('scheduleView').style.display = 'none';
  document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">Searching...</div></div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">' + esc(res.reason || 'Search failed.') + '</div></div>';
        return;
      }
      if (!res.results.length) {
        document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">No results found for "' + esc(query) + '".</div></div>';
        return;
      }
      var html = '<div class="card"><h3>Search Results (' + res.total + ')</h3>';
      html += '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th></tr></thead><tbody>';
      for (var i = 0; i < res.results.length; i++) {
        var r = res.results[i];
        var badge = getStatusBadge(r.status);
        html += '<tr style="cursor:pointer" onclick="goToDate(\\'' + esc(r.dateKey) + '\\')">';
        html += '<td><b>' + esc(r.dateKey) + '</b></td>';
        html += '<td>' + esc(r.startTime) + ' - ' + esc(r.endTime) + '</td>';
        html += '<td><a class="patient-link" href="#" onclick="event.stopPropagation();event.preventDefault();showPatientHistory(\\'' + esc(r.email) + '\\',\\'' + esc(r.phone) + '\\')">' + esc(r.fullName) + '</a></td>';
        html += '<td>' + esc(r.phone) + '</td>';
        html += '<td>' + esc(r.serviceName) + '</td>';
        html += '<td>' + esc(r.location) + '</td>';
        html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span>' + (r.confirmed ? ' <span class="badge" style="background:#d1fae5;color:#065f46;">Confirmed</span>' : '') + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      document.getElementById('searchResults').innerHTML = html;
    })
    .withFailureHandler(function() {
      document.getElementById('searchResults').innerHTML = '<div class="card"><div class="empty">Search error.</div></div>';
    })
    .apiAdminSearchAppointments(SIG, query);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('scheduleView').style.display = 'block';
}

// ========== Timeline Bar ==========

var _tlDate = null; // current timeline date string "YYYY-MM-DD"
var _tlWorkingHours = null; // working hours config from dashboard
var _tlOffEntries = []; // doctor off entries
var _tlExtraEntries = []; // extra slot entries
var _tlDayStart = 7; // timeline display range: 7am
var _tlDayEnd = 21; // to 9pm
var _tlSelStart = null; // drag selection start (minutes)
var _tlSelEnd = null; // drag selection end (minutes)
var _tlDragging = false;
var _tlResizing = false;

function tlNavDate(delta) {
  if (!_tlDate) return;
  var d = new Date(_tlDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  _tlDate = d.toISOString().slice(0, 10);
  renderTimeline();
}

function renderTimeline() {
  if (!_tlDate || !_tlWorkingHours) return;
  var bar = document.getElementById('tlBar');
  var label = document.getElementById('tlDateLabel');
  var ticksEl = document.getElementById('tlTicks');

  // Update date label
  var d = new Date(_tlDate + 'T12:00:00');
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  label.textContent = dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();

  // Clear old segments and popover
  bar.querySelectorAll('.tl-seg').forEach(function(el) { el.remove(); });
  document.getElementById('tlSel').style.display = 'none';
  document.getElementById('tlSelLabel').style.display = 'none';
  document.getElementById('tlPopover').style.display = 'none';
  document.getElementById('tlActions').style.display = 'none';
  _tlSelStart = null;
  _tlSelEnd = null;

  var totalMin = (_tlDayEnd - _tlDayStart) * 60;

  function minToPercent(m) {
    return ((m - _tlDayStart * 60) / totalMin * 100);
  }

  // Render tick marks below the bar (14 items for 14-hour span so flex positions match bar percentages)
  ticksEl.innerHTML = '';
  for (var h = _tlDayStart; h < _tlDayEnd; h++) {
    var tick = document.createElement('div');
    tick.className = 'tl-tick';
    var lbl = document.createElement('div');
    lbl.className = 'tl-tick-label';
    lbl.textContent = String(h).padStart(2, '0') + ':00';
    tick.appendChild(lbl);
    if (h === _tlDayEnd - 1) {
      var endLbl = document.createElement('div');
      endLbl.className = 'tl-tick-label tl-tick-label-end';
      endLbl.textContent = String(_tlDayEnd).padStart(2, '0') + ':00';
      tick.appendChild(endLbl);
    }
    ticksEl.appendChild(tick);
  }

  // Get day-of-week key
  var dowKeys = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  var dow = dowKeys[d.getDay()];

  // Regular working hours for this day
  var regularWindows = _tlWorkingHours[dow] || [];
  for (var i = 0; i < regularWindows.length; i++) {
    var w = regularWindows[i];
    addSegment(bar, w.start, w.end, 'regular', 'Regular: ' + w.start + ' - ' + w.end);
  }

  // Extra hours for this date
  for (var j = 0; j < _tlExtraEntries.length; j++) {
    var ex = _tlExtraEntries[j];
    if (ex.date === _tlDate && ex.startTime && ex.endTime) {
      addSegment(bar, ex.startTime, ex.endTime, 'extra', 'Extra: ' + ex.startTime + ' - ' + ex.endTime + (ex.reason ? ' (' + ex.reason + ')' : ''), {
        type: 'extra', rowIndex: ex.rowIndex, time: ex.startTime + ' - ' + ex.endTime, reason: ex.reason || ''
      });
    }
  }

  // Blocked hours for this date
  for (var k = 0; k < _tlOffEntries.length; k++) {
    var off = _tlOffEntries[k];
    var offStart = off.startDate;
    var offEnd = off.endDate || off.startDate;
    if (_tlDate >= offStart && _tlDate <= offEnd) {
      var isAllDay = !off.startTime || !off.endTime;
      var bStart = isAllDay ? String(_tlDayStart).padStart(2, '0') + ':00' : off.startTime;
      var bEnd = isAllDay ? String(_tlDayEnd).padStart(2, '0') + ':00' : off.endTime;
      var bLabel = isAllDay ? 'All day' : off.startTime + ' - ' + off.endTime;
      addSegment(bar, bStart, bEnd, 'blocked', 'Blocked: ' + bLabel + (off.reason ? ' (' + off.reason + ')' : ''), {
        type: 'block', rowIndex: off.rowIndex, time: bLabel, reason: off.reason || ''
      });
    }
  }

  function addSegment(container, start, end, cls, tip, meta) {
    var sMin = parseHHMM(start);
    var eMin = parseHHMM(end);
    var left = Math.max(0, minToPercent(sMin));
    var right = Math.min(100, minToPercent(eMin));
    if (right <= left) return;

    var seg = document.createElement('div');
    seg.className = 'tl-seg ' + cls;
    seg.style.left = left + '%';
    seg.style.width = (right - left) + '%';
    seg.title = tip;
    if (meta) {
      seg.addEventListener('click', function(e) {
        e.stopPropagation();
        showSegPopover(left + (right - left) / 2, meta);
      });
      // Add resize handles
      var handleL = document.createElement('div');
      handleL.className = 'tl-seg-handle handle-left';
      handleL.addEventListener('mousedown', function(e) { e.stopPropagation(); e.preventDefault(); startResize(meta, 'left', sMin, eMin, e); });
      seg.appendChild(handleL);

      var handleR = document.createElement('div');
      handleR.className = 'tl-seg-handle handle-right';
      handleR.addEventListener('mousedown', function(e) { e.stopPropagation(); e.preventDefault(); startResize(meta, 'right', sMin, eMin, e); });
      seg.appendChild(handleR);
    }
    seg.addEventListener('mouseenter', function() {
      if (!_tlDragging && !_tlResizing) {
        var tipEl = document.getElementById('tlTip');
        tipEl.textContent = tip;
        tipEl.style.left = (left + (right - left) / 2) + '%';
        tipEl.style.display = 'block';
      }
    });
    seg.addEventListener('mouseleave', function() {
      document.getElementById('tlTip').style.display = 'none';
    });
    container.insertBefore(seg, container.querySelector('.tl-tooltip'));
  }
}

function showSegPopover(pct, meta) {
  var pop = document.getElementById('tlPopover');
  var typeEl = document.getElementById('tlPopType');
  var timeEl = document.getElementById('tlPopTime');
  var reasonEl = document.getElementById('tlPopReason');
  var delBtn = document.getElementById('tlPopDel');

  typeEl.textContent = meta.type === 'extra' ? 'Extra Hours' : 'Blocked Time';
  typeEl.className = 'tl-popover-type ' + (meta.type === 'extra' ? 'pop-extra' : 'pop-blocked');
  timeEl.textContent = meta.time;
  if (meta.reason) {
    reasonEl.textContent = meta.reason;
    reasonEl.style.display = 'block';
  } else {
    reasonEl.style.display = 'none';
  }

  // Clamp popover position so it doesn't overflow
  pop.style.left = Math.max(10, Math.min(90, pct)) + '%';
  pop.style.display = 'block';

  delBtn.onclick = function() {
    pop.style.display = 'none';
    if (meta.type === 'extra') {
      showLoading('Removing...', 'Removing extra time slot.');
      google.script.run
        .withSuccessHandler(function(res) {
          hideLoading();
          if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
          showMsg('availMsg', 'good', res.message);
          loadDashboard();
        })
        .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
        .apiAdminRemoveExtraSlots(SIG, meta.rowIndex);
    } else {
      showLoading('Removing...', 'Removing blocked time.');
      google.script.run
        .withSuccessHandler(function(res) {
          hideLoading();
          if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
          showMsg('availMsg', 'good', res.message);
          loadDashboard();
        })
        .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
        .apiAdminRemoveDoctorOff(SIG, meta.rowIndex);
    }
  };

  // Close popover when clicking elsewhere
  function closePop(e) {
    if (!pop.contains(e.target)) {
      pop.style.display = 'none';
      document.removeEventListener('click', closePop);
    }
  }
  setTimeout(function() { document.addEventListener('click', closePop); }, 0);
}

function startResize(meta, side, origStartMin, origEndMin, mouseEvt) {
  _tlResizing = true;
  var bar = document.getElementById('tlBar');
  var totalMin = (_tlDayEnd - _tlDayStart) * 60;
  document.getElementById('tlPopover').style.display = 'none';
  document.getElementById('tlCursor').style.display = 'none';

  // Show the selection overlay to visualize the resize
  var sel = document.getElementById('tlSel');
  var selLabel = document.getElementById('tlSelLabel');
  var curStart = origStartMin;
  var curEnd = origEndMin;

  function getMin(e) {
    var rect = bar.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round((_tlDayStart * 60 + pct * totalMin) / 10) * 10;
  }

  function updateResize(e) {
    var m = getMin(e);
    if (side === 'left') {
      curStart = Math.min(m, curEnd - 10);
    } else {
      curEnd = Math.max(m, curStart + 10);
    }
    var left = (curStart - _tlDayStart * 60) / totalMin * 100;
    var width = (curEnd - curStart) / totalMin * 100;
    sel.style.left = left + '%';
    sel.style.width = width + '%';
    sel.style.display = 'block';
    selLabel.textContent = minToHHMM(curStart) + ' \u2192 ' + minToHHMM(curEnd);
    selLabel.style.left = (left + width / 2) + '%';
    selLabel.style.display = 'block';
  }

  updateResize(mouseEvt);

  function onMove(e) { updateResize(e); }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    _tlResizing = false;
    sel.style.display = 'none';
    selLabel.style.display = 'none';

    // Only save if the time actually changed
    if (curStart === origStartMin && curEnd === origEndMin) return;

    var newStart = minToHHMM(curStart);
    var newEnd = minToHHMM(curEnd);

    // Delete old entry, then create new one with updated times
    showLoading('Updating...', 'Resizing time range.');
    var removeFunc = meta.type === 'extra' ? 'apiAdminRemoveExtraSlots' : 'apiAdminRemoveDoctorOff';
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.ok) { hideLoading(); showMsg('availMsg', 'bad', res.reason || 'Failed to remove old entry.'); return; }
        // Now add the new resized entry
        var addFunc = meta.type === 'extra' ? 'apiAdminAddExtraSlots' : 'apiAdminMarkDoctorOff';
        var payload = meta.type === 'extra'
          ? { date: _tlDate, startTime: newStart, endTime: newEnd, reason: meta.reason || 'Extra hours' }
          : { startDate: _tlDate, startTime: newStart, endTime: newEnd, reason: meta.reason || 'Blocked' };
        google.script.run
          .withSuccessHandler(function(res2) {
            hideLoading();
            if (!res2 || !res2.ok) { showMsg('availMsg', 'bad', res2.reason || 'Failed.'); return; }
            showMsg('availMsg', 'good', 'Updated to ' + newStart + ' - ' + newEnd);
            loadDashboard();
          })
          .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
          [addFunc](SIG, payload);
      })
      .withFailureHandler(function(err) { hideLoading(); showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err))); })
      [removeFunc](SIG, meta.rowIndex);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function parseHHMM(str) {
  var parts = String(str).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
}

// Drag-to-select and hover cursor on timeline
(function initTimelineDrag() {
  var bar = document.getElementById('tlBar');
  var outer = document.getElementById('tlOuter');
  if (!bar) return;

  function getPctFromX(e) {
    var rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  function getMinFromX(e) {
    var totalMin = (_tlDayEnd - _tlDayStart) * 60;
    var rawMin = _tlDayStart * 60 + getPctFromX(e) * totalMin;
    return Math.round(rawMin / 10) * 10;
  }

  function updateSel() {
    if (_tlSelStart === null || _tlSelEnd === null) return;
    var s = Math.min(_tlSelStart, _tlSelEnd);
    var e = Math.max(_tlSelStart, _tlSelEnd);
    var selLabel = document.getElementById('tlSelLabel');
    if (e - s < 10) {
      document.getElementById('tlSel').style.display = 'none';
      selLabel.style.display = 'none';
      return;
    }
    var totalMin = (_tlDayEnd - _tlDayStart) * 60;
    var left = (s - _tlDayStart * 60) / totalMin * 100;
    var width = (e - s) / totalMin * 100;
    var sel = document.getElementById('tlSel');
    sel.style.left = left + '%';
    sel.style.width = width + '%';
    sel.style.display = 'block';
    // Position label above selection, centered
    selLabel.textContent = minToHHMM(s) + ' \u2192 ' + minToHHMM(e);
    selLabel.style.left = (left + width / 2) + '%';
    selLabel.style.display = 'block';
  }

  // Hover cursor
  bar.addEventListener('mousemove', function(e) {
    if (_tlDragging) return;
    var cursor = document.getElementById('tlCursor');
    var cursorLabel = document.getElementById('tlCursorLabel');
    var pct = getPctFromX(e);
    var m = getMinFromX(e);
    cursor.style.left = (pct * 100) + '%';
    cursorLabel.textContent = minToHHMM(m);
    cursor.style.display = 'block';
  });

  bar.addEventListener('mouseleave', function() {
    if (!_tlDragging) document.getElementById('tlCursor').style.display = 'none';
  });

  bar.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    _tlDragging = true;
    _tlSelStart = getMinFromX(e);
    _tlSelEnd = _tlSelStart;
    document.getElementById('tlActions').style.display = 'none';
    document.getElementById('tlCursor').style.display = 'none';
    updateSel();
  });

  bar.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    _tlDragging = true;
    _tlSelStart = getMinFromX(touch);
    _tlSelEnd = _tlSelStart;
    document.getElementById('tlActions').style.display = 'none';
    updateSel();
  }, {passive: true});

  document.addEventListener('mousemove', function(e) {
    if (!_tlDragging) return;
    _tlSelEnd = getMinFromX(e);
    updateSel();
  });

  document.addEventListener('touchmove', function(e) {
    if (!_tlDragging) return;
    _tlSelEnd = getMinFromX(e.touches[0]);
    updateSel();
  }, {passive: true});

  function finishDrag(e) {
    if (!_tlDragging) return;
    _tlDragging = false;
    var pos = e.changedTouches ? e.changedTouches[0] : e;
    _tlSelEnd = getMinFromX(pos);
    var s = Math.min(_tlSelStart, _tlSelEnd);
    var en = Math.max(_tlSelStart, _tlSelEnd);
    if (en - s >= 10) {
      document.getElementById('tlActions').style.display = 'flex';
      _tlSelStart = s;
      _tlSelEnd = en;
      updateSel();
    } else {
      document.getElementById('tlSel').style.display = 'none';
      document.getElementById('tlSelLabel').style.display = 'none';
      _tlSelStart = null;
      _tlSelEnd = null;
    }
  }

  document.addEventListener('mouseup', finishDrag);
  document.addEventListener('touchend', finishDrag);
})();

function minToHHMM(m) {
  var hh = String(Math.floor(m / 60)).padStart(2, '0');
  var mm = String(m % 60).padStart(2, '0');
  return hh + ':' + mm;
}

function tlAddExtra() {
  if (_tlSelStart === null || _tlSelEnd === null || !_tlDate) return;
  showLoading('Adding...', 'Adding extra time slot.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('availMsg', 'good', res.message);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminAddExtraSlots(SIG, {
      date: _tlDate,
      startTime: minToHHMM(_tlSelStart),
      endTime: minToHHMM(_tlSelEnd),
      reason: 'Added from timeline'
    });
}

function tlBlockTime() {
  if (_tlSelStart === null || _tlSelEnd === null || !_tlDate) return;
  showLoading('Blocking...', 'Blocking time slot.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('availMsg', 'good', res.message);
      loadDashboard();
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminMarkDoctorOff(SIG, {
      startDate: _tlDate,
      startTime: minToHHMM(_tlSelStart),
      endTime: minToHHMM(_tlSelEnd),
      reason: 'Blocked from timeline'
    });
}

// ========== Availability (unified Block / Extra) ==========

var _availMode = 'block'; // 'block' or 'add'

function setAvailMode(mode) {
  _availMode = mode;
  var blockBtn = document.getElementById('toggleBlock');
  var addBtn = document.getElementById('toggleAdd');
  var submitBtn = document.getElementById('avSubmitBtn');

  blockBtn.className = 'toggle-btn' + (mode === 'block' ? ' active-block' : '');
  addBtn.className = 'toggle-btn' + (mode === 'add' ? ' active-add' : '');

  if (mode === 'block') {
    submitBtn.className = 'btn btn-danger';
    submitBtn.textContent = 'Block Time';
    // Show all-day pill
    var allDayPill = document.querySelector('#timePills .time-pill');
    if (allDayPill) allDayPill.style.display = '';
    pickTime('allday');
  } else {
    submitBtn.className = 'btn btn-good';
    submitBtn.textContent = 'Add Extra Time';
    // Hide all-day pill — extra time needs specific hours
    var allDayPill = document.querySelector('#timePills .time-pill');
    if (allDayPill) allDayPill.style.display = 'none';
    // Default to morning if currently on all-day
    if (_selectedTime === 'allday') pickTime('morning');
  }
}

function applyPreset(preset) {
  var pills = document.querySelectorAll('.preset-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  event.target.classList.add('active');

  var today = new Date();
  var todayStr = toDateStr(today);

  var startDate = document.getElementById('avStartDate');
  var endDate = document.getElementById('avEndDate');

  if (preset === 'today') {
    startDate.value = todayStr;
    endDate.value = todayStr;
  } else if (preset === 'tomorrow') {
    var tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    var tomStr = toDateStr(tom);
    startDate.value = tomStr;
    endDate.value = tomStr;
  } else if (preset === 'week') {
    startDate.value = todayStr;
    var sun = new Date(today);
    sun.setDate(sun.getDate() + (7 - sun.getDay()));
    endDate.value = toDateStr(sun);
  } else {
    startDate.value = '';
    endDate.value = '';
  }

  // Reset time to all-day (block mode) or morning (add mode)
  if (_availMode === 'add') {
    pickTime('morning');
  } else {
    pickTime('allday');
  }
  document.getElementById('avReason').value = '';
  document.getElementById('availForm').style.display = 'block';
  document.getElementById('availMsg').className = 'msg';

  // Re-apply mode visibility (hides all-day pill for extra)
  setAvailMode(_availMode);
}

function toDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

var _selectedTime = 'allday';

function pickTime(mode) {
  _selectedTime = mode;
  var pills = document.querySelectorAll('#timePills .time-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  // Find and activate the matching pill
  var labels = {allday: 'All day', morning: 'Morning 09:00-12:00', afternoon: 'Afternoon 17:00-19:00', custom: 'Custom'};
  pills.forEach(function(p) { if (p.textContent === labels[mode]) p.classList.add('active'); });

  document.getElementById('avTimeRow').style.display = mode === 'custom' ? 'flex' : 'none';
}

function getTimeRange() {
  if (_selectedTime === 'allday') return {start: '', end: ''};
  if (_selectedTime === 'morning') return {start: '09:00', end: '12:00'};
  if (_selectedTime === 'afternoon') return {start: '17:00', end: '19:00'};
  var sh = document.getElementById('startH').textContent;
  var sm = document.getElementById('startM').textContent;
  var eh = document.getElementById('endH').textContent;
  var em = document.getElementById('endM').textContent;
  return {start: sh + ':' + sm, end: eh + ':' + em};
}

// ─── Time spinner logic ───

function drumStep(which, unit, dir) {
  var hEl = document.getElementById(which === 'start' ? 'startH' : 'endH');
  var mEl = document.getElementById(which === 'start' ? 'startM' : 'endM');
  var h = parseInt(hEl.textContent, 10);
  var m = parseInt(mEl.textContent, 10);

  if (unit === 'h') {
    h = (h + dir + 24) % 24;
  } else {
    m = m + dir * 10;
    if (m >= 60) { m = 0; h = (h + 1) % 24; }
    if (m < 0) { m = 50; h = (h - 1 + 24) % 24; }
  }

  hEl.textContent = String(h).padStart(2, '0');
  mEl.textContent = String(m).padStart(2, '0');
}

// Mouse wheel on drum values
document.addEventListener('wheel', function(e) {
  var drum = e.target.closest('.time-drum');
  if (!drum) return;
  e.preventDefault();
  var which = drum.dataset.spinner;
  var unit = drum.dataset.unit;
  var dir = e.deltaY < 0 ? 1 : -1;
  drumStep(which, unit, dir);
}, {passive: false});

// Drag on drum values
(function() {
  var dragDrum = null, dragUnit = null, dragWhich = null, dragStartY = 0, dragAccum = 0;

  function onPointerDown(e) {
    var val = e.target.closest('.time-drum-val');
    if (!val) return;
    var drum = val.closest('.time-drum');
    if (!drum) return;
    dragDrum = drum;
    dragUnit = drum.dataset.unit;
    dragWhich = drum.dataset.spinner;
    dragStartY = e.clientY;
    dragAccum = 0;
    e.preventDefault();
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragDrum) return;
    var dy = dragStartY - e.clientY;
    dragAccum += dy;
    dragStartY = e.clientY;
    var threshold = 20;
    while (dragAccum >= threshold) { drumStep(dragWhich, dragUnit, 1); dragAccum -= threshold; }
    while (dragAccum <= -threshold) { drumStep(dragWhich, dragUnit, -1); dragAccum += threshold; }
  }

  function onPointerUp() {
    dragDrum = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }

  document.addEventListener('pointerdown', onPointerDown);
})();

function submitAvailability() {
  var startDate = document.getElementById('avStartDate').value;
  var endDate = document.getElementById('avEndDate').value;
  var times = getTimeRange();
  var reason = document.getElementById('avReason').value;

  if (!startDate) { showMsg('availMsg', 'bad', 'Please select a start date.'); return; }

  if (_availMode === 'block') {
    showLoading('Blocking time...', 'Adding block entry.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
        var msg = 'Time blocked successfully.';
        if (res.affectedAppointments && res.affectedAppointments.length > 0) {
          msg += ' ' + res.affectedAppointments.length + ' appointment(s) affected. Go to Quick Actions to process them.';
        }
        showMsg('availMsg', 'good', msg);
        document.getElementById('availForm').style.display = 'none';
        document.querySelectorAll('.preset-pill').forEach(function(p) { p.classList.remove('active'); });
        loadDashboard();
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminMarkDoctorOff(SIG, {
        startDate: startDate,
        endDate: endDate || startDate,
        startTime: times.start,
        endTime: times.end,
        reason: reason || 'Doctor not available'
      });
  } else {
    if (!times.start) { showMsg('availMsg', 'bad', 'Please select a time range.'); return; }
    if (!times.end) { showMsg('availMsg', 'bad', 'Please select a time range.'); return; }

    showLoading('Adding extra time...', 'Adding extra working hours.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
        showMsg('availMsg', 'good', res.message);
        document.getElementById('availForm').style.display = 'none';
        document.querySelectorAll('.preset-pill').forEach(function(p) { p.classList.remove('active'); });
        loadDashboard();
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminAddExtraSlots(SIG, {
        date: startDate,
        endDate: endDate || '',
        startTime: times.start,
        endTime: times.end,
        reason: reason
      });
  }
}

function removeOverride(type, rowIndex) {
  var title = type === 'block' ? 'Remove Block' : 'Remove Extra Time';
  var body = type === 'block'
    ? 'Remove this block? Slots will re-open for booking.'
    : 'Remove this extra time entry?';

  styledConfirm(title, body, 'Remove', 'btn-danger').then(function(ok) {
    if (!ok) return;
    showLoading('Removing...', 'Removing entry.');

    var handler = function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('availMsg', 'bad', res.reason || 'Failed.'); return; }
      loadDashboard();
    };
    var errHandler = function(err) {
      hideLoading();
      showMsg('availMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    };

    if (type === 'block') {
      google.script.run.withSuccessHandler(handler).withFailureHandler(errHandler).apiAdminRemoveDoctorOff(SIG, rowIndex);
    } else {
      google.script.run.withSuccessHandler(handler).withFailureHandler(errHandler).apiAdminRemoveExtraSlots(SIG, rowIndex);
    }
  });
}

// ========== Quick Actions ==========

async function loadActionAppts() {
  var dateKey = document.getElementById('actionDate').value;
  if (!dateKey) return;

  document.getElementById('actionApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('actionBar').style.display = 'none';
  document.getElementById('customMsgRow').style.display = 'none';

  try {
    var byClinic = await fetchKevinApptsByClinic(dateKey);
    // Both of Dr Kevin's clinics. Drop the Potter's RELOCATED_SPINOLA tombstone
    // (its live Spinola copy is shown instead). Cancel + Push to Next Day act on
    // any row; Redirect to Spinola applies to the Potter's rows only — the
    // backend skips any already at Spinola.
    var potters = byClinic.potters.filter(function(a) { return a.status !== 'RELOCATED_SPINOLA'; });
    var appts = potters.concat(byClinic.spinola).map(transformAppt);
    appts.sort(function(a, b) { return (a.startTime || '').localeCompare(b.startTime || ''); });
    renderApptTable(appts, 'actionApptsList', true);
    if (appts.length > 0) {
      document.getElementById('actionBar').style.display = 'flex';
      document.getElementById('customMsgRow').style.display = 'flex';
    }
  } catch (err) {
    document.getElementById('actionApptsList').innerHTML = '<div class="empty">Error loading.</div>';
  }
}

function processAction(action) {
  var dateKey = document.getElementById('actionDate').value;
  var ids = getSelectedIds('actionApptsList');
  var customMsg = document.getElementById('customMsg').value;

  if (!dateKey) { showMsg('actionMsg', 'bad', 'Select a date first.'); return; }

  var actionLabel = action === 'cancel' ? 'CANCEL' : action === 'redirect_spinola' ? 'REDIRECT TO SPINOLA' : 'PUSH TO NEXT DAY';
  var target = ids.length > 0 ? ids.length + ' selected appointment(s)' : 'ALL appointments';
  var btnClass = action === 'cancel' ? 'btn-danger' : action === 'redirect_spinola' ? 'btn-blue' : 'btn-good';
  styledConfirm('Confirm Action', actionLabel + ' ' + target + ' on ' + dateKey + '?', actionLabel, btnClass).then(function(ok){
  if (!ok) return;

  showLoading('Processing...', 'Applying ' + actionLabel.toLowerCase() + ' to appointments.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('actionMsg', 'bad', res.reason || 'Failed.'); return; }

      var msg = res.message;
      if (res.results) {
        var details = [];
        for (var i = 0; i < res.results.length; i++) {
          var r = res.results[i];
          var d = r.patient + ': ' + r.action;
          if (r.newDate) d += ' -> ' + r.newDate + ' ' + r.newTime;
          details.push(d);
        }
        if (details.length) msg += '\\n' + details.join('\\n');
      }
      showMsg('actionMsg', 'good', msg);
      loadActionAppts();
      // Also refresh the notify table if it has the same date loaded
      if (document.getElementById('notifyDate').value) loadNotifyAppts();
      _scheduleStatsRefresh(); // Deferred dashboard refresh instead of full reload
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('actionMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminProcessAppointments(SIG, {
      dateKey: dateKey,
      action: action,
      appointmentIds: ids,
      customMessage: customMsg
    });
  });
}

function cancelSingleAppt(appointmentId, containerId) {
  var dateKey;
  if (containerId === 'actionApptsList') dateKey = document.getElementById('actionDate').value;
  else if (containerId === 'notifyApptsList') dateKey = document.getElementById('notifyDate').value;
  else dateKey = _schedDate;
  if (!dateKey) return;
  styledConfirm('Cancel Appointment', 'Are you sure you want to cancel this appointment?', 'Yes, Cancel', 'btn-danger', 'Go Back').then(function(ok){
  if (!ok) return;

  showLoading('Cancelling...', 'Cancelling appointment.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) {
        var msgId = containerId === 'actionApptsList' ? 'actionMsg' : 'notifyResultMsg';
        showMsg(msgId, 'bad', res.reason || 'Failed.');
        return;
      }
      var msgId = containerId === 'actionApptsList' ? 'actionMsg' : containerId === 'notifyApptsList' ? 'notifyResultMsg' : 'globalMsg';
      showMsg(msgId, 'good', 'Appointment cancelled.');
      // Reload both action tables so they stay in sync
      if (document.getElementById('actionDate').value) loadActionAppts();
      if (document.getElementById('notifyDate').value) loadNotifyAppts();
      if (containerId !== 'actionApptsList' && containerId !== 'notifyApptsList') loadSchedAppts();
      _scheduleStatsRefresh(); // Deferred dashboard refresh instead of immediate
    })
    .withFailureHandler(function(err) {
      hideLoading();
      var msgId = containerId === 'actionApptsList' ? 'actionMsg' : 'notifyResultMsg';
      showMsg(msgId, 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminCancelAppointment(SIG, {
      appointmentId: appointmentId,
      customMessage: ''
    });
  });
}

// ========== Notifications ==========

// Fetch Dr Kevin's appointments for a date, split by clinic. The admin
// dashboard payload only carries Potter's rows (and even includes the
// RELOCATED_SPINOLA tombstone of redirected bookings), so any feature that
// also needs Spinola pulls both clinics from the per-clinic endpoint, which
// filters by clinic server-side. Returns the raw appointment rows.
async function fetchKevinApptsByClinic(dateKey) {
  var res = await Promise.all([
    apiCall('appointments?clinic=potters&date=' + encodeURIComponent(dateKey)),
    apiCall('appointments?clinic=spinola&date=' + encodeURIComponent(dateKey))
  ]);
  return {
    potters: (res[0] && res[0].ok && res[0].appointments) || [],
    spinola: (res[1] && res[1].ok && res[1].appointments) || []
  };
}

async function loadNotifyAppts() {
  var dateKey = document.getElementById('notifyDate').value;
  if (!dateKey) return;

  document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('notifyMsgRow').style.display = 'none';
  document.getElementById('notifyPresets').style.display = 'none';
  document.getElementById('notifyBtn').style.display = 'none';

  try {
    var byClinic = await fetchKevinApptsByClinic(dateKey);
    // Potter's bookings (minus the redirected RELOCATED_SPINOLA tombstone)
    // plus Spinola, so a custom message can reach Dr Kevin's patients at
    // either clinic. Sending still only goes to the rows the admin ticks.
    var potters = byClinic.potters.filter(function(a) { return a.status !== 'RELOCATED_SPINOLA'; });
    // renderApptTable expects camelCase (the legacy shim mapped these); the raw
    // /appointments rows are snake_case, so transform them or the Patient/Time
    // columns and the checkbox ids come out blank.
    var appts = potters.concat(byClinic.spinola).map(transformAppt);
    renderApptTable(appts, 'notifyApptsList', true);
    if (appts.length > 0) {
      document.getElementById('notifyMsgRow').style.display = 'flex';
      document.getElementById('notifyPresets').style.display = 'block';
      document.getElementById('notifyBtn').style.display = 'inline-flex';
    }
  } catch (err) {
    document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Error loading.</div>';
  }
}

function prefillNotifyMsg(type) {
  var dateKey = document.getElementById('notifyDate').value || 'your appointment date';
  if (type === 'reminder') {
    document.getElementById('notifyMsg').value = 'This is a friendly reminder that your appointment is coming up soon on ' + dateKey + '. Please make sure to arrive on time. Thank you!';
  }
}

function sendNotification() {
  var dateKey = document.getElementById('notifyDate').value;
  var ids = getSelectedIds('notifyApptsList');
  var message = document.getElementById('notifyMsg').value;

  if (!dateKey) { showMsg('notifyResultMsg', 'bad', 'Select a date first.'); return; }
  if (!ids.length) { showMsg('notifyResultMsg', 'bad', 'Select at least one patient.'); return; }
  if (!message.trim()) { showMsg('notifyResultMsg', 'bad', 'Please type a message.'); return; }

  showLoading('Sending...', 'Sending notification to ' + ids.length + ' patient(s).');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('notifyResultMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('notifyResultMsg', 'good', res.message);
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('notifyResultMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminNotifyPatients(SIG, {
      dateKey: dateKey,
      appointmentIds: ids,
      message: message
    });
}

// ========== Init ==========
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(loadDashboard, 0);
} else {
  document.addEventListener('DOMContentLoaded', loadDashboard);
}

// ========== Auto-Refresh ==========
// ── Version-based polling ──
// Instead of fetching the full dashboard every 60s (~11 sheet reads),
// we poll a lightweight version counter (1 PropertiesService read).
// Full dashboard is only fetched when the version actually changed.
var POLL_INTERVAL_SEC = 999999; // Polling disabled — WebSocket handles real-time updates
var _lastRefreshTime = Date.now();
var _pollTimerId = null;
var _isRefreshing = false;
var _isPolling = false;
var _cachedVersion = 0;
var _cachedDashboard = null;

function doPollAndRefresh() {
  if (_isPolling || _isRefreshing) return;
  // Skip polling when tab is hidden — visibility handler will catch up
  if (document.hidden) return;
  _isPolling = true;

  google.script.run
    .withSuccessHandler(function(res) {
      _isPolling = false;
      if (!res) return;

      if (res.v !== _cachedVersion) {
        _cachedVersion = res.v;
        doFullRefresh();
      } else {
        _lastRefreshTime = Date.now();
      }
    })
    .withFailureHandler(function() {
      _isPolling = false;
    })
    .apiPoll();
}

function doFullRefresh() {
  if (_isRefreshing) return;
  _isRefreshing = true;

  google.script.run
    .withSuccessHandler(function(res) {
      _isRefreshing = false;
      _lastRefreshTime = Date.now();
      if (!res || !res.ok) return;

      if (res._v !== undefined) _cachedVersion = res._v;

      // Update stats bar
      document.getElementById('statBooked').textContent = res.stats.weekBooked;
      document.getElementById('statCancelled').textContent = res.stats.weekCancelled;
      document.getElementById('statTomorrow').textContent = res.tomorrowAppointments.length;
      updateFillRing(res.todayAppointments.length, res.stats.todayCapacity || 0);
      try { loadTelemedicineStats(); } catch(e) {}

      renderOverrides(res.doctorOffEntries, res.extraSlotEntries);

      // Only reload schedule/week if data shape changed (avoid 2 extra API calls)
      var newHash = _dashboardHash(res);
      if (!_cachedDashboard || _cachedDashboard !== newHash) {
        _cachedDashboard = newHash;
        loadSchedAppts();
        loadWeekOverview();
        // Refresh quick actions if that tab is active
        if (document.getElementById('tab-actions').style.display !== 'none') {
          loadActionAppts();
          if (document.getElementById('notifyDate').value) loadNotifyAppts();
        }
      }
    })
    .withFailureHandler(function() {
      _isRefreshing = false;
      _lastRefreshTime = Date.now();
    })
    .apiAdminGetDashboard(SIG);
}

// Keep the old name so _scheduleStatsRefresh still works
function doAutoRefresh() { doPollAndRefresh(); }

function _dashboardHash(res) {
  return res.stats.weekBooked + '|' + res.stats.weekCancelled + '|' +
    res.todayAppointments.length + '|' + res.tomorrowAppointments.length + '|' +
    (res.doctorOffEntries || []).length + '|' + (res.extraSlotEntries || []).length;
}

function updateRefreshDisplay() {
  var elapsed = Math.floor((Date.now() - _lastRefreshTime) / 1000);
  var remaining = Math.max(0, POLL_INTERVAL_SEC - elapsed);

  var lastEl = document.getElementById('refreshLastText');
  if (lastEl) {
    if (elapsed < 5) lastEl.textContent = 'Last refreshed: just now';
    else if (elapsed < 60) lastEl.textContent = 'Last refreshed: ' + elapsed + 's ago';
    else lastEl.textContent = 'Last refreshed: ' + Math.floor(elapsed / 60) + 'm ago';
  }

  var countEl = document.getElementById('refreshCountdown');
  if (countEl) countEl.textContent = 'Next check: ' + remaining + 's';
}

// ── Idle overlay ──
var _idlePaused = false;
var _IDLE_MS = 5 * 60 * 1000 + 10 * 1000; // 5 minutes 10 seconds
var _lastAdminActivity = Date.now();
var _idleOverlay = document.getElementById('idleOverlay');
var _displayTimerId = null;

function _isAdminIdle() { return _idlePaused; }

_pollTimerId = setInterval(function() {
  if (!_isAdminIdle()) doPollAndRefresh();
}, POLL_INTERVAL_SEC * 1000);

_displayTimerId = setInterval(function() {
  if (!_isAdminIdle()) updateRefreshDisplay();
}, 1000);

// Tab hidden → immediately go idle (zero API calls while backgrounded)
// Tab visible again → user must click overlay to resume
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    _idlePaused = true;
    if (_pollTimerId) { clearInterval(_pollTimerId); _pollTimerId = null; }
    _idleOverlay.classList.add('show');
  }
  // When visible again: do nothing — overlay is showing, user clicks to resume
});
window.addEventListener('focus', function() {
  // Do nothing if idle — user must click overlay
});

// Activity tracking
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
  document.addEventListener(evt, function() { _lastAdminActivity = Date.now(); }, { passive: true });
});

// Idle check (every 1s)
setInterval(function() {
  if (_idlePaused) return;
  if (Date.now() - _lastAdminActivity >= _IDLE_MS) {
    _idlePaused = true;
    // Stop polling timer entirely to save cycles
    if (_pollTimerId) { clearInterval(_pollTimerId); _pollTimerId = null; }
    _idleOverlay.classList.add('show');
  }
}, 1000);

// Wake on click
_idleOverlay.addEventListener('click', function() {
  _idlePaused = false;
  _lastAdminActivity = Date.now();
  _idleOverlay.classList.remove('show');
  // Restart polling
  _pollTimerId = setInterval(function() {
    if (!_isAdminIdle()) doPollAndRefresh();
  }, POLL_INTERVAL_SEC * 1000);
  // Immediate full refresh
  doFullRefresh();
});

// ========== Settings Tab ==========

var _settingsLoaded = false;
var _settingsData = null;

function loadSettings() {
  if (_settingsLoaded) return;
  showLoading('Loading settings...', 'Fetching configuration.');
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoading();
      if (!res || !res.ok) { showMsg('settingsMsg', 'bad', 'Failed to load settings.'); return; }
      _settingsLoaded = true;
      _settingsData = res.settings;
      populateSettings(res.settings);
    })
    .withFailureHandler(function(err) {
      hideLoading();
      showMsg('settingsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetSettings(SIG);
}

function populateSettings(s) {
  document.getElementById('setDoctorEmail').value = s.doctorEmail || '';
  document.getElementById('setTimezone').value = s.timezone || '';
  document.getElementById('setPottersLoc').value = s.pottersLocation || '';
  document.getElementById('setSpinolaLoc').value = s.spinolaLocation || '';
  document.getElementById('setDuration').value = s.apptDurationMin || 10;
  document.getElementById('setAdvanceDays').value = s.advanceDays || 7;
  document.getElementById('setMaxAppts').value = s.maxActiveApptsPerPerson || 0;
  renderHoursEditor(s.workingHours);
}

function renderHoursEditor(hours) {
  var dayNames = {MON:'Monday',TUE:'Tuesday',WED:'Wednesday',THU:'Thursday',FRI:'Friday',SAT:'Saturday',SUN:'Sunday'};
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var el = document.getElementById('hoursEditor');
  var html = '';

  for (var di = 0; di < dayOrder.length; di++) {
    var day = dayOrder[di];
    var blocks = hours[day] || [];
    var enabled = blocks.length > 0;

    html += '<div class="day-row" data-day="' + day + '">';
    html += '<div class="day-row-header">';
    html += '<span class="day-name">' + dayNames[day] + '</span>';
    html += '<label class="day-toggle"><input type="checkbox" ' + (enabled ? 'checked' : '') + ' onchange="toggleDay(\\'' + day + '\\', this.checked)"><span class="slider"></span></label>';
    html += '</div>';
    html += '<div class="day-blocks" id="blocks-' + day + '">';

    if (enabled) {
      for (var bi = 0; bi < blocks.length; bi++) {
        html += timeBlockRow(day, bi, blocks[bi].start, blocks[bi].end);
      }
    }

    html += '</div>';
    html += '<button type="button" class="add-block-btn" onclick="addTimeBlock(\\'' + day + '\\')" ' + (enabled ? '' : 'style="display:none"') + ' id="addBtn-' + day + '">+ Add time block</button>';
    html += '</div>';
  }

  el.innerHTML = html;
}

function timeBlockRow(day, idx, start, end) {
  return '<div class="time-block-row">' +
    '<input type="time" value="' + (start || '09:00') + '" step="600">' +
    '<span class="block-sep">to</span>' +
    '<input type="time" value="' + (end || '12:00') + '" step="600">' +
    '<button type="button" class="remove-block" onclick="this.parentElement.remove()" title="Remove">&times;</button>' +
    '</div>';
}

function toggleDay(day, enabled) {
  var blocksEl = document.getElementById('blocks-' + day);
  var addBtn = document.getElementById('addBtn-' + day);
  if (enabled) {
    if (blocksEl.children.length === 0) {
      blocksEl.innerHTML = timeBlockRow(day, 0, '09:00', '12:00');
    }
    addBtn.style.display = '';
  } else {
    blocksEl.innerHTML = '';
    addBtn.style.display = 'none';
  }
}

function addTimeBlock(day) {
  var blocksEl = document.getElementById('blocks-' + day);
  var div = document.createElement('div');
  div.innerHTML = timeBlockRow(day, blocksEl.children.length, '09:00', '12:00');
  blocksEl.appendChild(div.firstChild);
}

function collectSettings() {
  var settings = {
    doctorEmail: document.getElementById('setDoctorEmail').value,
    timezone: document.getElementById('setTimezone').value,
    pottersLocation: document.getElementById('setPottersLoc').value,
    spinolaLocation: document.getElementById('setSpinolaLoc').value,
    apptDurationMin: parseInt(document.getElementById('setDuration').value, 10),
    advanceDays: parseInt(document.getElementById('setAdvanceDays').value, 10),
    maxActiveApptsPerPerson: parseInt(document.getElementById('setMaxAppts').value, 10)
  };

  // Collect working hours
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var wh = {};
  for (var di = 0; di < dayOrder.length; di++) {
    var day = dayOrder[di];
    var blocksEl = document.getElementById('blocks-' + day);
    var rows = blocksEl.querySelectorAll('.time-block-row');
    wh[day] = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var inputs = rows[ri].querySelectorAll('input[type=time]');
      if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
        wh[day].push({ start: inputs[0].value.substring(0, 5), end: inputs[1].value.substring(0, 5) });
      }
    }
  }
  settings.workingHours = wh;
  return settings;
}

function saveSettings() {
  var settings = collectSettings();

  styledConfirm('Save Settings', 'Save all settings? This will affect the booking page immediately.', 'Save', 'btn-dark', 'Cancel').then(function(ok) {
    if (!ok) return;
    showLoading('Saving settings...', 'Applying configuration changes.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('settingsMsg', 'bad', res.reason || 'Failed to save.'); return; }
        showMsg('settingsMsg', 'good', res.message);
        _settingsLoaded = false; // Force reload on next tab switch
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('settingsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminSaveSettings(SIG, settings);
  });
}

// ========== Data Maintenance ==========

function archiveOldSheets() {
  styledConfirm('Archive Old Sheets', 'This will move appointment data older than 30 days into a single Archive sheet and delete the individual day sheets. All data remains accessible. Continue?', 'Archive', 'btn-dark', 'Cancel').then(function(ok) {
    if (!ok) return;
    showLoading('Archiving...', 'Moving old sheets to archive.');
    google.script.run
      .withSuccessHandler(function(res) {
        hideLoading();
        if (!res || !res.ok) { showMsg('archiveMsg', 'bad', res.reason || 'Archive failed.'); return; }
        showMsg('archiveMsg', 'good', res.message);
      })
      .withFailureHandler(function(err) {
        hideLoading();
        showMsg('archiveMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
      })
      .apiAdminArchiveOldSheets(SIG);
  });
}

// ========== Fill Ring ==========

function updateFillRing(booked, capacity) {
  var cap = capacity || 0;
  document.getElementById('statToday').textContent = booked + '/' + cap;
  document.getElementById('statTodayLabel').textContent = 'Today filled';
  var circumference = 2 * Math.PI * 22; // ~138.2
  var pct = cap > 0 ? booked / cap : 0;
  var offset = circumference * (1 - pct);
  var fg = document.getElementById('fillRingFg');
  fg.style.strokeDashoffset = offset;
  fg.style.stroke = pct >= 0.9 ? 'var(--bad)' : pct >= 0.75 ? '#f59e0b' : 'var(--good)';
}

// ========== Attendance Tracking ==========

function markAttendance(appointmentId, dateKey, attended, containerId) {
  // Optimistic UI: update the row immediately without refetching
  var newStatus = attended ? 'ATTENDED' : 'NO_SHOW';
  var badge = getStatusBadge(newStatus);
  // Update the row in ALL visible tables (action, notify, schedule)
  var containerIds = [containerId];
  if (containerId !== 'actionApptsList') containerIds.push('actionApptsList');
  if (containerId !== 'notifyApptsList') containerIds.push('notifyApptsList');
  for (var ci = 0; ci < containerIds.length; ci++) {
    var container = document.getElementById(containerIds[ci]);
    if (!container) continue;
    var rows = container.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
      var cb = rows[i].querySelector('.appt-cb');
      if (cb && cb.value === appointmentId) {
        var badgeEl = rows[i].querySelector('.badge');
        if (badgeEl) { badgeEl.className = 'badge ' + badge.cls; badgeEl.textContent = badge.text; }
        var lastTd = rows[i].querySelector('td:last-child');
        if (lastTd) lastTd.innerHTML = '';
        break;
      }
      // Also handle schedule table (no checkboxes)
      if (!cb) {
        var btns = rows[i].querySelectorAll('.att-btns button');
        for (var j = 0; j < btns.length; j++) {
          if (btns[j].getAttribute('onclick') && btns[j].getAttribute('onclick').indexOf(appointmentId) >= 0) {
            var badgeEl2 = rows[i].querySelector('.badge');
            if (badgeEl2) { badgeEl2.className = 'badge ' + badge.cls; badgeEl2.textContent = badge.text; }
            var lastTd2 = rows[i].querySelector('td:last-child');
            if (lastTd2) lastTd2.innerHTML = '';
            break;
          }
        }
      }
    }
  }

  // Fire-and-forget API call (no loading spinner, no refetch)
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('globalMsg', 'bad', res.reason || 'Failed. Refresh to see current state.'); }
      // Schedule a deferred stats bar refresh (debounced)
      _scheduleStatsRefresh();
    })
    .withFailureHandler(function(err) {
      showMsg('globalMsg', 'bad', 'Error saving: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminMarkAttendance(SIG, appointmentId, dateKey, attended);
}

// Debounced stats refresh — batches multiple rapid actions into one refresh.
// After a write action we know data changed, so skip the poll and go straight to full refresh.
var _statsRefreshTimer = null;
function _scheduleStatsRefresh() {
  if (_statsRefreshTimer) clearTimeout(_statsRefreshTimer);
  _statsRefreshTimer = setTimeout(function() {
    _statsRefreshTimer = null;
    _lastRefreshTime = Date.now();
    doFullRefresh();
  }, 3000);
}

// ========== Patient History ==========

function showPatientHistory(email, phone) {
  var overlay = document.getElementById('patientOverlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ overlay.classList.add('show'); }); });
  document.getElementById('patientTitle').textContent = 'Patient History';
  document.getElementById('patientContent').innerHTML = '<div class="empty">Loading...</div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('patientContent').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      var p = res.patient;
      document.getElementById('patientTitle').textContent = p.name || 'Patient History';

      var html = '';
      // Contact info
      html += '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">';
      if (p.email) html += p.email;
      if (p.email && p.phone) html += ' &middot; ';
      if (p.phone) html += p.phone;
      if (res.firstSeen) html += ' &middot; First seen: ' + res.firstSeen;
      html += '</div>';

      // Summary cards
      html += '<div class="patient-summary">';
      html += '<div class="patient-summary-item"><div class="psv">' + res.totalVisits + '</div><div class="psl">Visits</div></div>';
      html += '<div class="patient-summary-item"><div class="psv">' + res.cancelCount + '</div><div class="psl">Cancellations</div></div>';
      html += '<div class="patient-summary-item"><div class="psv">' + res.noShowCount + '</div><div class="psl">No-Shows</div></div>';
      html += '</div>';

      // Appointment table
      if (res.appointments && res.appointments.length > 0) {
        html += '<div class="table-wrap" style="margin-top:10px;"><table><thead><tr>';
        html += '<th>Date</th><th>Time</th><th>Status</th><th>Source</th><th>Location</th><th>Hotel</th><th>Notes</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < res.appointments.length; i++) {
          var a = res.appointments[i];
          var badge = getStatusBadge(a.status);
          html += '<tr>';
          html += '<td><b>' + esc(a.dateKey) + '</b></td>';
          html += '<td>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</td>';
          html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span>' + (a.confirmed ? ' <span class="badge" style="background:#d1fae5;color:#065f46;">Confirmed</span>' : '') + '</td>';
          html += '<td>' + (a.bookingSource ? '<span class="badge" style="background:#eff6ff;color:#1e40af;">' + esc(a.bookingSource) + '</span>' : '<span style="color:#d1d5db;">\u2014</span>') + '</td>';
          html += '<td>' + esc(a.location) + '</td>';
          html += '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (a.hotel ? esc(a.hotel) : '<span style="color:#d1d5db;">—</span>') + '</td>';
          html += '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(a.comments || '') + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
      } else {
        html += '<div class="empty">No appointment history found.</div>';
      }

      document.getElementById('patientContent').innerHTML = html;
    })
    .withFailureHandler(function(err) {
      document.getElementById('patientContent').innerHTML = '<div class="empty">Error: ' + esc(err && err.message ? err.message : String(err)) + '</div>';
    })
    .apiAdminGetPatientHistory(SIG, email, phone);
}

function hidePatientHistory() {
  var overlay = document.getElementById('patientOverlay');
  overlay.classList.remove('show');
  setTimeout(function(){ overlay.style.display = 'none'; }, 200);
}

// ========== Statistics Tab ==========

var _statsCache = {};
var _statsPeriod = '28';

function loadStatistics(period) {
  period = period || _statsPeriod;
  _statsPeriod = period;
  if (_statsCache[period]) { renderAllStats(_statsCache[period]); return; }
  showMsg('statsMsg', '', 'Loading statistics...');

  apiCall('stats?period=' + encodeURIComponent(period))
    .then(function(res) {
      if (!res || !res.ok) { showMsg('statsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('statsMsg', '', '');
      res = transformResponse('apiAdminGetStatistics', res);
      _statsCache[period] = res;
      renderAllStats(res);
    })
    .catch(function(err) {
      showMsg('statsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    });
}

// Period toggle click handler
document.getElementById('statsPeriodToggle').addEventListener('click', function(e) {
  var btn = e.target.closest('.stats-toggle-btn');
  if (!btn) return;
  var period = btn.dataset.period;
  _statsPeriod = period;
  document.querySelectorAll('.stats-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _statsCache = {}; // Clear cache on explicit switch
  loadStatistics(period);
});

function renderAllStats(s) {
  var pl = s.periodLabel || 'Last 28 Days';
  var is28 = (_statsPeriod === '28');
  // Period label
  document.getElementById('statsPeriod').textContent = s.period.from + ' to ' + s.period.to;

  // Hero metrics
  renderProgressRing(s.utilization || 0);
  document.getElementById('heroUtil').textContent = (s.utilization != null ? s.utilization + '%' : 'N/A');
  document.getElementById('heroBooked').textContent = s.totalBooked;
  var trendArrow = '';
  if (s.trendDirection === 'up') trendArrow = '<span class="trend-arrow trend-up">&uarr;' + s.trendPct + '%</span>';
  else if (s.trendDirection === 'down') trendArrow = '<span class="trend-arrow trend-down">&darr;' + s.trendPct + '%</span>';
  document.getElementById('heroBookedSub').innerHTML = pl + ' ' + trendArrow;
  document.getElementById('heroCancelRate').textContent = s.cancelRate + '%';
  var crEl = document.getElementById('heroCancelRate');
  crEl.style.color = s.cancelRate < 10 ? 'var(--good)' : s.cancelRate < 20 ? '#f59e0b' : 'var(--bad)';
  document.getElementById('heroPatients').textContent = s.totalUniquePatients;
  document.getElementById('heroRepeat').textContent = s.repeatPatients + ' returning';

  // Time-bounded sections: hide when data is null (non-28-day periods)
  var timeBounded = ['weeklyTrendCard','peakHoursCard','upcomingLoadCard'];
  timeBounded.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = is28 ? '' : 'none';
  });

  // Utilization by day — available for all periods (force card visible)
  var utilCard = document.getElementById('utilByDayCard');
  if (utilCard) utilCard.style.display = '';
  renderUtilByDay(s.utilizationByDay);

  if (is28) {
    renderWeeklyTrend(s.weeklyTrend);
    renderPeakHours(s.hourlyDistribution);
    renderUpcomingLoad(s.upcomingLoad);
  }

  renderLocationSplit(s.locationSplit);
  renderTopPatients(s.topPatients);
  renderCancelBreakdown(s);
  renderBusiestDay(s.busiestDay);
  renderLeadTime(s);
  renderAttendance(s);
  renderDoctorActions(s);
  renderSourceBreakdown(s.sourceBreakdown);
  renderCountryBreakdown(s.countryBreakdown);
  renderHotelBreakdown(s.hotelBreakdown, s.hotelStats);
  renderTopCancellers(s.topCancellers);
  renderSpinolaStats(s.spinola);

  // Spinola time-bounded
  var spTimeBounded = ['spWeeklyTrendCard','spPeakHoursCard'];
  spTimeBounded.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = is28 ? '' : 'none';
  });
}

function renderLeadTime(s) {
  var el = document.getElementById('leadTimeChart');
  var html = '<div style="text-align:center;padding:12px 0;">';
  html += '<div style="font-size:42px;font-weight:900;color:#2563eb;">' + (s.avgLeadTimeDays || 0) + '</div>';
  html += '<div style="font-size:14px;font-weight:700;margin-top:4px;">days average</div>';
  html += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">How far ahead patients book</div>';
  if (s.sameDayCancels > 0) {
    html += '<div style="margin-top:12px;padding:8px 12px;background:rgba(245,158,11,0.08);border-radius:10px;display:inline-block;">';
    html += '<span style="font-size:18px;font-weight:800;color:#b45309;">' + s.sameDayCancels + '</span>';
    html += '<span style="font-size:12px;color:#b45309;margin-left:6px;">same-day cancellations</span>';
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderAttendance(s) {
  var el = document.getElementById('attendanceChart');
  var attended = s.totalAttended || 0;
  var noShow = s.totalNoShow || 0;
  var total = attended + noShow;

  var html = '<div style="text-align:center;padding:8px 0;">';
  if (total > 0) {
    var noShowRate = s.noShowRate || 0;
    var noShowColor = noShowRate < 5 ? 'var(--good)' : noShowRate < 15 ? '#f59e0b' : 'var(--bad)';
    html += '<div style="font-size:36px;font-weight:900;color:' + noShowColor + ';">' + noShowRate + '%</div>';
    html += '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;">No-show rate</div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">Attended</div>';
    var pctA = total > 0 ? Math.round(attended / total * 100) : 0;
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctA + '%;background:var(--good);"></div></div>';
    html += '<div class="h-bar-pct">' + attended + '</div></div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">No-Show</div>';
    var pctN = 100 - pctA;
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctN + '%;background:#f59e0b;"></div></div>';
    html += '<div class="h-bar-pct">' + noShow + '</div></div>';
  } else {
    html += '<div class="empty">No attendance data yet.<br><span style="font-size:11px;">Use the &#x2713; and &#x2717; buttons on today\\'s appointments to track attendance.</span></div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderProgressRing(pct) {
  var circumference = 2 * Math.PI * 30; // r=30
  var offset = circumference - (pct / 100) * circumference;
  var fg = document.querySelector('#utilRing .ring-fg');
  if (fg) {
    fg.style.strokeDasharray = circumference;
    // Trigger animation by setting initially then updating
    setTimeout(function() { fg.style.strokeDashoffset = offset; }, 50);
  }
}

function renderWeeklyTrend(weeks) {
  var el = document.getElementById('weeklyTrendChart');
  if (!weeks || !weeks.length) { el.innerHTML = '<div class="empty">No data yet.</div>'; return; }

  var maxVal = 1;
  for (var i = 0; i < weeks.length; i++) {
    var total = weeks[i].booked + weeks[i].cancelled;
    if (total > maxVal) maxVal = total;
  }

  var html = '';
  for (var i = 0; i < weeks.length; i++) {
    var w = weeks[i];
    var bH = Math.round((w.booked / maxVal) * 100);
    var cH = Math.round((w.cancelled / maxVal) * 100);
    html += '<div class="bar-col">';
    html += '<div class="bar-val">' + w.booked + '</div>';
    html += '<div class="bar-stack" style="height:100%;">';
    html += '<div style="flex:1;"></div>'; // spacer
    if (w.cancelled > 0) html += '<div class="bar cancelled" style="height:' + cH + '%;"></div>';
    html += '<div class="bar booked" style="height:' + bH + '%;"></div>';
    html += '</div>';
    html += '<div class="bar-label">' + esc(w.label) + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderPeakHours(dist) {
  var el = document.getElementById('peakHoursMap');
  if (!dist) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  // Backend ships a 14-element array for hours 7..20 (index 0 = 7am).
  var maxCount = 1;
  for (var i = 0; i < dist.length; i++) { if (dist[i] > maxCount) maxCount = dist[i]; }

  var html = '';
  for (var h = 7; h <= 20; h++) {
    var count = dist[h - 7] || 0;
    var intensity = maxCount > 0 ? count / maxCount : 0;
    var r = Math.round(219 - intensity * 182);
    var g = Math.round(234 - intensity * 135);
    var b = Math.round(254 - intensity * 15);
    var textColor = intensity > 0.6 ? '#fff' : 'var(--fg)';
    if (count === 0) { r = 249; g = 250; b = 251; textColor = 'var(--muted)'; }
    var label = h < 12 ? h + 'am' : (h === 12 ? '12pm' : (h - 12) + 'pm');
    html += '<div class="heat-cell" style="background:rgb(' + r + ',' + g + ',' + b + ');color:' + textColor + ';">';
    html += '<span class="heat-hour">' + label + '</span>';
    html += count;
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderUtilByDay(utilByDay) {
  var el = document.getElementById('utilByDay');
  if (!utilByDay) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  var days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  for (var i = 0; i < days.length; i++) {
    var pct = utilByDay[days[i]] || 0;
    var color = pct >= 90 ? 'var(--bad)' : pct >= 70 ? '#f59e0b' : '#2563eb';
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label">' + labels[i] + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + pct + '%</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderUpcomingLoad(load) {
  var el = document.getElementById('upcomingLoadChart');
  if (!load || !load.length) { el.innerHTML = '<div class="empty">No upcoming data.</div>'; return; }

  var html = '';
  for (var i = 0; i < load.length; i++) {
    var d = load[i];
    if (d.capacity === 0) continue; // Skip closed days
    var pct = d.capacity > 0 ? Math.round(d.booked / d.capacity * 100) : 0;
    if (pct > 100) pct = 100;
    var color = pct >= 90 ? 'var(--bad)' : pct >= 75 ? '#f59e0b' : 'var(--good)';
    var dateNum = d.dateKey.substring(8);
    html += '<div class="capacity-row">';
    html += '<div class="capacity-label">' + d.dayLabel + ' ' + parseInt(dateNum, 10) + '</div>';
    html += '<div class="capacity-track"><div class="capacity-fill" style="width:' + pct + '%;background:' + color + ';"></div>';
    html += '<div class="capacity-text">' + d.booked + '/' + d.capacity + '</div></div>';
    html += '</div>';
  }
  el.innerHTML = html || '<div class="empty">No working days ahead.</div>';
}

function renderLocationSplit(split) {
  var el = document.getElementById('locationSplitChart');
  if (!split) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  var total = split.potters + split.spinola;
  if (total === 0) { el.innerHTML = '<div class="empty">No appointments yet.</div>'; return; }

  var pctP = Math.round(split.potters / total * 100);
  var pctS = 100 - pctP;

  var html = '';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:60px;">Potter\\'s</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctP + '%;background:#2563eb;"></div></div>';
  html += '<div class="h-bar-pct">' + split.potters + '</div></div>';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:60px;">Spinola</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctS + '%;background:#8b5cf6;"></div></div>';
  html += '<div class="h-bar-pct">' + split.spinola + '</div></div>';
  el.innerHTML = html;
}

function renderTopPatients(patients) {
  var el = document.getElementById('topPatientsChart');
  if (!patients || !patients.length) { el.innerHTML = '<div class="empty">No patient data yet.</div>'; return; }

  var html = '';
  for (var i = 0; i < patients.length; i++) {
    var p = patients[i];
    html += '<div class="patient-row">';
    html += '<div class="patient-rank">' + (i + 1) + '</div>';
    html += '<div class="patient-name">' + esc(p.name) + '</div>';
    html += '<div class="patient-count">' + p.count + ' visits</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderCancelBreakdown(s) {
  var el = document.getElementById('cancelBreakdownChart');
  var cb = s.cancelBreakdown;
  var total = cb.byDoctor + cb.byPatient;

  var html = '<div style="margin-bottom:12px;">';
  html += '<div style="font-size:36px;font-weight:900;color:' + (s.cancelRate < 10 ? 'var(--good)' : s.cancelRate < 20 ? '#f59e0b' : 'var(--bad)') + ';">' + s.cancelRate + '%</div>';
  html += '<div style="font-size:12px;color:var(--muted);">Overall cancel rate</div>';
  html += '</div>';

  if (total > 0) {
    var pctD = Math.round(cb.byDoctor / total * 100);
    var pctP = 100 - pctD;
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Doctor</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctD + '%;background:#f59e0b;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byDoctor + '</div></div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Patient</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctP + '%;background:#ef4444;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byPatient + '</div></div>';
  } else {
    html += '<div class="empty">No cancellations!</div>';
  }
  html += '<div style="margin-top:10px;font-size:12px;color:var(--muted);">Total cancelled: ' + s.totalCancelled + ' of ' + (s.totalBooked + s.totalCancelled) + '</div>';
  el.innerHTML = html;
}

function renderBusiestDay(day) {
  var el = document.getElementById('busiestDayChart');
  if (!day || !day.dateKey) { el.innerHTML = '<div class="empty">No data yet.</div>'; return; }

  el.innerHTML = '<div style="text-align:center;padding:12px 0;">'
    + '<div style="font-size:42px;font-weight:900;color:#2563eb;">' + day.count + '</div>'
    + '<div style="font-size:14px;font-weight:700;margin-top:4px;">' + day.dayName + ', ' + day.dateKey + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-top:2px;">Most appointments in a single day</div>'
    + '</div>';
}

function renderDoctorActions(s) {
  var el = document.getElementById('doctorActionsChart');
  var cb = s.cancelBreakdown || {};
  var html = '';

  var items = [
    { label: 'Cancelled by doctor', count: cb.byDoctor || 0, color: '#f59e0b' },
    { label: 'Cancelled by patient', count: cb.byPatient || 0, color: '#ef4444' },
    { label: 'Redirected to Spinola', count: s.relocatedSpinola || 0, color: '#8b5cf6' },
    { label: 'Pushed to next day', count: s.pushedNextDay || 0, color: '#2563eb' },
    { label: 'Pushed to next time', count: s.pushedSameDay || 0, color: '#06b6d4' }
  ];

  var maxCount = 1;
  for (var i = 0; i < items.length; i++) {
    if (items[i].count > maxCount) maxCount = items[i].count;
  }

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var pct = maxCount > 0 ? Math.round(it.count / maxCount * 100) : 0;
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:140px;font-size:12px;">' + it.label + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + it.color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + it.count + '</div>';
    html += '</div>';
  }

  if (!html) html = '<div class="empty">No data yet.</div>';
  el.innerHTML = html;
}

function renderSourceBreakdown(sources) {
  var el = document.getElementById('sourceChart');
  if (!sources || !sources.length) { el.innerHTML = '<div class="empty">No source data yet. Add ?loc=name to tablet URLs to start tracking.</div>'; return; }
  var maxCount = sources[0].count || 1;
  var colors = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];
  var html = '';
  for (var i = 0; i < sources.length; i++) {
    var s = sources[i];
    var pct = Math.round(s.count / maxCount * 100);
    var color = colors[i % colors.length];
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:100px;">' + esc(s.source) + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-count">' + s.count + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderCountryBreakdown(countries) {
  var el = document.getElementById('countryChart');
  if (!countries || !countries.length) { el.innerHTML = '<div class="empty">No country data yet.</div>'; return; }

  var maxCount = countries[0].count || 1;
  var colors = ['#2563eb','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316'];

  var html = '';
  for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
    var pct = Math.round(c.count / maxCount * 100);
    var color = colors[i % colors.length];
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:90px;font-size:12px;">' + esc(c.country) + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + c.count + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderHotelBreakdown(hotels, hstats) {
  var cov = document.getElementById('hotelCoverage');
  if (cov) {
    var total = hstats ? ((hstats.withHotel || 0) + (hstats.withoutHotel || 0)) : 0;
    if (hstats && total > 0 && hstats.withHotel > 0) {
      var pct = Math.round((hstats.withHotel || 0) / total * 100);
      var pill = function(v, l, c) {
        return '<div style="flex:1 1 120px;min-width:110px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;text-align:center;">' +
          '<div style="font-size:26px;font-weight:900;color:' + c + ';line-height:1;">' + v + '</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:5px;font-weight:600;">' + l + '</div>' +
        '</div>';
      }
      cov.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
        pill(hstats.withHotel || 0, 'told us their hotel', '#0ea5e9') +
        pill(hstats.uniqueHotels || 0, 'different hotels', '#8b5cf6') +
        pill(pct + '%', 'of bookings shared it', '#10b981') +
      '</div>';
    } else {
      cov.innerHTML = '';
    }
  }
  var el = document.getElementById('hotelChart');
  if (!el) return;
  if (!hotels || !hotels.length) {
    el.innerHTML = '<div class="empty">No hotel data yet. Guests can add where they are staying on the booking page (optional).</div>';
    return;
  }
  var maxCount = hotels[0].count || 1;
  var colors = ['#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#6366f1','#14b8a6','#f97316','#2563eb','#84cc16','#e11d48','#7c3aed','#0891b2'];
  var html = '';
  for (var i = 0; i < hotels.length; i++) {
    var h = hotels[i];
    var pct2 = Math.round(h.count / maxCount * 100);
    var color = colors[i % colors.length];
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:160px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + esc(h.hotel) + '">' + esc(h.hotel) + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct2 + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-count">' + h.count + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderTopCancellers(cancellers) {
  var el = document.getElementById('topCancellersChart');
  if (!cancellers || !cancellers.length) { el.innerHTML = '<div class="empty">No cancellation data yet.</div>'; return; }

  var html = '';
  for (var i = 0; i < cancellers.length; i++) {
    var c = cancellers[i];
    html += '<div class="patient-row">';
    html += '<div class="patient-rank" style="background:rgba(239,68,68,0.1);color:#ef4444;">' + (i + 1) + '</div>';
    html += '<div class="patient-name">' + esc(c.name) + '</div>';
    html += '<div class="patient-count" style="color:#ef4444;">' + c.count + ' cancelled</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

// ── Spinola Clinic Stats ──

function renderSpinolaStats(sp) {
  if (!sp) return;
  document.getElementById('spHeroBooked').textContent = sp.totalBooked;
  var crEl = document.getElementById('spHeroCancelRate');
  crEl.textContent = sp.cancelRate + '%';
  crEl.style.color = sp.cancelRate < 10 ? 'var(--good)' : sp.cancelRate < 20 ? '#f59e0b' : 'var(--bad)';
  var nsEl = document.getElementById('spHeroNoShowRate');
  nsEl.textContent = sp.noShowRate + '%';
  nsEl.style.color = sp.noShowRate < 5 ? 'var(--good)' : sp.noShowRate < 15 ? '#f59e0b' : 'var(--bad)';
  document.getElementById('spHeroPatients').textContent = sp.uniquePatients;

  renderSpDirectSplit(sp);
  renderSpWeeklyTrend(sp.weeklyTrend);
  renderSpPeakHours(sp.peakHours);
  renderSpTopPatients(sp.topPatients);
  renderSpCancelBreakdown(sp);
  renderSpTopCancellers(sp.topCancellers);
  renderSpCountryBreakdown(sp.countryBreakdown);
}

function renderSpDirectSplit(sp) {
  var el = document.getElementById('spDirectSplitChart');
  var direct = sp.directBookings || 0;
  var redir = sp.relocatedBookings || 0;
  var total = direct + redir;
  if (total === 0) { el.innerHTML = '<div class="empty">No Spinola bookings yet.</div>'; return; }

  var pctD = Math.round(direct / total * 100);
  var pctR = 100 - pctD;
  var html = '';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:80px;">Direct</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctD + '%;background:#8b5cf6;"></div></div>';
  html += '<div class="h-bar-pct">' + direct + '</div></div>';
  html += '<div class="h-bar-row"><div class="h-bar-label" style="width:80px;">Redirected</div>';
  html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctR + '%;background:#2563eb;"></div></div>';
  html += '<div class="h-bar-pct">' + redir + '</div></div>';
  html += '<div style="margin-top:8px;font-size:11px;color:var(--muted);">Direct = booked via system &bull; Redirected = moved from Potter\\'s</div>';
  el.innerHTML = html;
}

function renderSpWeeklyTrend(weeks) {
  var el = document.getElementById('spWeeklyTrendChart');
  if (!weeks || !weeks.length) { el.innerHTML = '<div class="empty">No weekly data yet.</div>'; return; }

  var maxVal = 1;
  for (var i = 0; i < weeks.length; i++) {
    var total = weeks[i].booked + weeks[i].cancelled;
    if (total > maxVal) maxVal = total;
  }
  var html = '';
  for (var i = 0; i < weeks.length; i++) {
    var w = weeks[i];
    var bH = Math.round((w.booked / maxVal) * 100);
    var cH = Math.round((w.cancelled / maxVal) * 100);
    html += '<div class="bar-col">';
    html += '<div class="bar-val">' + w.booked + '</div>';
    html += '<div class="bar-stack" style="height:100%;">';
    html += '<div style="flex:1;"></div>';
    if (w.cancelled > 0) html += '<div class="bar cancelled" style="height:' + cH + '%;"></div>';
    html += '<div class="bar" style="height:' + bH + '%;background:#8b5cf6;border-radius:4px 4px 0 0;"></div>';
    html += '</div>';
    html += '<div class="bar-label">' + esc(w.label) + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderSpPeakHours(dist) {
  var el = document.getElementById('spPeakHoursMap');
  if (!dist) { el.innerHTML = '<div class="empty">No data.</div>'; return; }

  // 14-element array for hours 7..20 (index 0 = 7am).
  var maxCount = 1;
  for (var i = 0; i < dist.length; i++) { if (dist[i] > maxCount) maxCount = dist[i]; }

  var html = '';
  for (var h = 7; h <= 20; h++) {
    var count = dist[h - 7] || 0;
    var intensity = maxCount > 0 ? count / maxCount : 0;
    var r = Math.round(245 - intensity * 106);
    var g = Math.round(243 - intensity * 151);
    var b = Math.round(255 - intensity * 9);
    var textColor = intensity > 0.6 ? '#fff' : 'var(--fg)';
    if (count === 0) { r = 249; g = 250; b = 251; textColor = 'var(--muted)'; }
    var label = h < 12 ? h + 'am' : (h === 12 ? '12pm' : (h - 12) + 'pm');
    html += '<div class="heat-cell" style="background:rgb(' + r + ',' + g + ',' + b + ');color:' + textColor + ';">';
    html += '<span class="heat-hour">' + label + '</span>';
    html += count;
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderSpTopPatients(patients) {
  var el = document.getElementById('spTopPatientsChart');
  if (!patients || !patients.length) { el.innerHTML = '<div class="empty">No patient data yet.</div>'; return; }

  var html = '';
  for (var i = 0; i < patients.length; i++) {
    var p = patients[i];
    html += '<div class="patient-row">';
    html += '<div class="patient-rank" style="background:rgba(139,92,246,0.15);color:#8b5cf6;">' + (i + 1) + '</div>';
    html += '<div class="patient-name">' + esc(p.name) + '</div>';
    html += '<div class="patient-count">' + p.count + ' visits</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderSpCancelBreakdown(sp) {
  var el = document.getElementById('spCancelChart');
  if (!el) return;
  var cb = sp.cancelBreakdown || { byDoctor: 0, byPatient: 0 };
  var total = cb.byDoctor + cb.byPatient;
  var html = '<div style="margin-bottom:12px;">';
  html += '<div style="font-size:36px;font-weight:900;color:' + (sp.cancelRate < 10 ? 'var(--good)' : sp.cancelRate < 20 ? '#f59e0b' : 'var(--bad)') + ';">' + sp.cancelRate + '%</div>';
  html += '<div style="font-size:12px;color:var(--muted);">Cancel rate</div></div>';
  if (total > 0) {
    var pctD = Math.round(cb.byDoctor / total * 100);
    var pctP = 100 - pctD;
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Doctor</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctD + '%;background:#f59e0b;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byDoctor + '</div></div>';
    html += '<div class="h-bar-row"><div class="h-bar-label" style="width:70px;">By Patient</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pctP + '%;background:#ef4444;"></div></div>';
    html += '<div class="h-bar-pct">' + cb.byPatient + '</div></div>';
  } else { html += '<div class="empty">No cancellations yet.</div>'; }
  el.innerHTML = html;
}

function renderSpTopCancellers(cancellers) {
  var el = document.getElementById('spCancellersChart');
  if (!el) return;
  if (!cancellers || !cancellers.length) { el.innerHTML = '<div class="empty">No cancellers yet.</div>'; return; }
  var html = '';
  for (var i = 0; i < cancellers.length; i++) {
    var c = cancellers[i];
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);">';
    html += '<div><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#ef4444;color:#fff;text-align:center;line-height:22px;font-size:11px;font-weight:900;margin-right:8px;">' + (i+1) + '</span>';
    html += '<span style="font-weight:700;">' + esc(c.name) + '</span></div>';
    html += '<span style="color:#ef4444;font-weight:700;font-size:13px;">' + c.count + ' cancelled</span></div>';
  }
  el.innerHTML = html;
}

function renderSpCountryBreakdown(countries) {
  var el = document.getElementById('spCountryChart');
  if (!countries || !countries.length) { el.innerHTML = '<div class="empty">No country data yet.</div>'; return; }

  var maxCount = countries[0].count || 1;
  var colors = ['#8b5cf6','#a78bfa','#c4b5fd','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#ddd6fe','#ede9fe','#f5f3ff'];

  var html = '';
  for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
    var pct = Math.round(c.count / maxCount * 100);
    var color = colors[i % colors.length];
    html += '<div class="h-bar-row">';
    html += '<div class="h-bar-label" style="width:90px;font-size:12px;">' + esc(c.country) + '</div>';
    html += '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
    html += '<div class="h-bar-pct">' + c.count + '</div>';
    html += '</div>';
  }
  el.innerHTML = html;
}

// ── Reviews Tab ──

var _reviewPotters = [];
var _reviewSpinola = [];
var _reviewLinda = [];
var _reviewTelemedicine = [];
var _reviewBloodTest = [];
var _reviewDateKey = '';

// ── Reminders Tab ──
async function loadReminderPatients() {
  var pList = document.getElementById('pottersReminderList');
  var sList = document.getElementById('spinolaReminderList');
  pList.innerHTML = '<div class="empty">Loading...</div>';
  sList.innerHTML = '<div class="empty">Loading...</div>';

  try {
    // The dashboard only carries Potter's (and its tombstones), so its Spinola
    // column was always empty. Pull both clinics for today + tomorrow from the
    // per-clinic endpoint instead.
    var dash = await apiCall('dashboard');
    if (!dash || !dash.ok) throw new Error('load');
    var days = [dash.todayKey, dash.tomorrowKey].filter(Boolean);
    var byClinic = await Promise.all(days.map(fetchKevinApptsByClinic));
    var pAppts = [], sAppts = [];
    byClinic.forEach(function(d) { pAppts = pAppts.concat(d.potters); sAppts = sAppts.concat(d.spinola); });

    var potters = [], spinola = [];
    pAppts.forEach(function(a) {
      // Potter's column: real Potter's bookings only. A booking that was
      // redirected to Spinola leaves a RELOCATED_SPINOLA tombstone here — drop
      // it so the patient isn't listed under the wrong clinic (their live copy
      // shows under Spinola).
      if (a.status !== 'BOOKED' || !a.email) return;
      potters.push(transformAppt(a));
    });
    sAppts.forEach(function(a) {
      // Spinola column: direct bookings (BOOKED) and appointments redirected
      // here from Potter's (RELOCATED_SPINOLA).
      if ((a.status !== 'BOOKED' && a.status !== 'RELOCATED_SPINOLA') || !a.email) return;
      spinola.push(transformAppt(a));
    });

    renderReminderList(pList, potters);
    renderReminderList(sList, spinola);
  } catch (e) {
    pList.innerHTML = '<div class="empty">Error loading.</div>';
    sList.innerHTML = '<div class="empty">Error loading.</div>';
  }
}

function renderReminderList(el, appts) {
  if (!appts.length) { el.innerHTML = '<div class="empty">No patients with email today.</div>'; return; }
  var html = '';
  appts.forEach(function(a) {
    var name = a.fullName || a.full_name || '';
    var email = a.email || '';
    var time = a.startTime || a.start_time || '';
    var service = a.serviceName || a.service_name || '';
    var id = a.appointmentId || a.id || '';
    var reminded = a.reminder_sent;
    var confirmed = a.confirmed;
    html += '<div class="rev-row">';
    html += '<label>';
    html += '<input type="checkbox" class="rem-cb" value="' + esc(id) + '">';
    html += '<div class="rev-patient-info">';
    html += '<div class="rev-patient-name">' + esc(name) + '</div>';
    html += '<div class="rev-patient-detail">' + esc(email) + ' · ' + esc(time) + ' · ' + esc(service) + '</div>';
    html += '</div>';
    html += '</label>';
    if (a.bookingSource) html += '<span class="badge" style="background:#eff6ff;color:#1e40af;">' + esc(a.bookingSource) + '</span>';
    if (reminded) html += '<span class="rev-sent-badge">Sent</span>';
    if (confirmed) html += '<span class="rev-sent-badge" style="background:#dbeafe;color:#1d4ed8;">Confirmed</span>';
    html += '</div>';
  });
  el.innerHTML = html;
}

function toggleAllReminders(master, containerId) {
  var boxes = document.getElementById(containerId).querySelectorAll('.rem-cb');
  for (var i = 0; i < boxes.length; i++) boxes[i].checked = master.checked;
}

function sendSelectedReminders(clinic) {
  var containerId = clinic === 'spinola' ? 'spinolaReminderList' : 'pottersReminderList';
  var boxes = document.getElementById(containerId).querySelectorAll('.rem-cb:checked');
  var ids = [];
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].value) ids.push(boxes[i].value);
  }
  if (!ids.length) { showMsg('reminderMsg', 'bad', 'No patients selected.'); return; }

  apiCall('send-reminders', { body: { appointmentIds: ids } }).then(function(res) {
    if (res && res.ok) {
      showMsg('reminderMsg', 'good', 'Reminders sent to ' + res.sent + ' patient(s).');
      loadReminderPatients();
    } else {
      showMsg('reminderMsg', 'bad', (res && res.reason) || 'Failed to send reminders.');
    }
  }).catch(function(err) {
    showMsg('reminderMsg', 'bad', 'Error: ' + err.message);
  });
}

function loadReviewPatients() {
  var dateInput = document.getElementById('reviewDate');
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  var dateKey = dateInput.value.replace(/-/g, '-');
  showMsg('reviewsMsg', '', 'Loading patients...');
  apiCall('reviews?date=' + encodeURIComponent(dateKey))
    .then(function(res) {
      if (!res || !res.ok) { showMsg('reviewsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('reviewsMsg', '', '');
      _reviewPotters = res.potters || [];
      _reviewSpinola = res.spinola || [];
      _reviewLinda = res.linda || [];
      _reviewTelemedicine = res.telemedicine || [];
      _reviewBloodTest = res.bloodTest || [];
      _reviewDateKey = dateKey;
      renderReviewList('potters', _reviewPotters);
      renderReviewList('spinola', _reviewSpinola);
      renderReviewList('linda', _reviewLinda);
      renderReviewList('telemedicine', _reviewTelemedicine);
      renderReviewList('bloodtest', _reviewBloodTest);
    })
    .catch(function(err) {
      showMsg('reviewsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    });
}

function renderReviewList(loc, patients) {
  var elId = loc === 'potters' ? 'revPottersList'
    : loc === 'linda' ? 'revLindaList'
    : loc === 'telemedicine' ? 'revTelemedicineList'
    : loc === 'bloodtest' ? 'revBloodTestList'
    : 'revSpinolaList';
  var el = document.getElementById(elId);
  if (!el) return;
  var emptyMsg = loc === 'telemedicine'
    ? 'No telemedicine calls with email today.'
    : loc === 'bloodtest'
      ? 'No blood-test bookings with email today.'
      : 'No patients with email today.';
  if (!patients.length) { el.innerHTML = '<div class="empty">' + emptyMsg + '</div>'; return; }

  var html = '';
  for (var i = 0; i < patients.length; i++) {
    var p = patients[i];
    var sent = p.reviewSent;
    var name = p.fullName || 'Unknown patient';
    var detail = [p.email, p.startTime, p.serviceName].filter(Boolean).join(' \u00b7 ') || 'No details';
    html += '<div class="rev-row">';
    html += '<label>';
    html += '<input type="checkbox" class="rev-cb-' + loc + '" value="' + esc(p.appointmentId) + '" data-email="' + esc(p.email) + '"' + (sent ? ' disabled' : '') + '>';
    html += '<div class="rev-patient-info">';
    html += '<div class="rev-patient-name">' + esc(name) + '</div>';
    html += '<div class="rev-patient-detail">' + esc(detail) + '</div>';
    html += '</div>';
    html += '</label>';
    if (p.bookingSource) html += '<span class="badge" style="background:#eff6ff;color:#1e40af;">' + esc(p.bookingSource) + '</span>';
    if (sent) {
      // Auto vs manual label + short "sent X min ago" tooltip so Linda/Kevin
      // can tell at a glance which reviews the cron took care of.
      var isAuto = p.reviewSource === 'auto';
      var ts = p.reviewSentAt ? p.reviewSentAt.replace(/\\..*$/, '') : '';
      var title = isAuto ? 'Automatically sent 1 hour post-visit' : 'Sent manually';
      html += '<span class="rev-sent-badge" title="' + esc(title + (ts ? ' · ' + ts : '')) + '" ' +
        (isAuto ? 'style="background:#e0e7ff;color:#3730a3;border-color:rgba(55,48,163,0.25);"' : '') + '>' +
        (isAuto ? 'Sent (auto)' : 'Sent') + '</span>';
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

function toggleRevAll(loc, checked) {
  var cbs = document.querySelectorAll('.rev-cb-' + loc);
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = checked;
}

function getSelectedTeamNames() {
  var names = [];
  if (document.getElementById('teamJohn').checked) names.push('John');
  if (document.getElementById('teamLaura').checked) names.push('Laura');
  if (document.getElementById('teamJovana').checked) names.push('Jovana');
  return names;
}

function sendReviewEmails(loc) {
  var cbs = document.querySelectorAll('.rev-cb-' + loc + ':checked');
  if (!cbs.length) { showMsg('reviewsMsg', 'bad', 'No patients selected.'); return; }

  var ids = [];
  for (var i = 0; i < cbs.length; i++) ids.push(cbs[i].value);

  var teamNames = getSelectedTeamNames();
  if (!teamNames.length) { showMsg('reviewsMsg', 'bad', 'Please select at least one team member.'); return; }

  // Blood tests route through the standard 'potters' send path — they live in
  // the appointments table with clinic='potters' so the existing email helper
  // (and Potter's Google Place ID) is the right one.
  var clinicLoc = loc === 'linda' ? 'linda'
    : loc === 'spinola' ? 'spinola'
    : loc === 'telemedicine' ? 'telemedicine'
    : 'potters';
  showMsg('reviewsMsg', '', 'Sending ' + ids.length + ' email(s)...');

  apiCall('reviews/send', { body: { appointmentIds: ids, location: clinicLoc, teamNames: teamNames, dateKey: _reviewDateKey } })
    .then(function(res) {
      if (!res || !res.ok) { showMsg('reviewsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('reviewsMsg', 'good', res.message);
      for (var i = 0; i < cbs.length; i++) {
        cbs[i].checked = false;
        cbs[i].disabled = true;
        var row = cbs[i].closest('.rev-row');
        if (row && !row.querySelector('.rev-sent-badge')) {
          var badge = document.createElement('span');
          badge.className = 'rev-sent-badge';
          badge.textContent = 'Sent';
          row.appendChild(badge);
        }
      }
      var selAllId = loc === 'potters' ? 'revSelectAllPotters'
        : loc === 'linda' ? 'revSelectAllLinda'
        : loc === 'telemedicine' ? 'revSelectAllTelemedicine'
        : loc === 'bloodtest' ? 'revSelectAllBloodTest'
        : 'revSelectAllSpinola';
      var selAll = document.getElementById(selAllId);
      if (selAll) selAll.checked = false;
    })
    .catch(function(err) {
      showMsg('reviewsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    });
}


// ─── Blood Tests (admin) ────────────────────────────────────
var _btConfig = null;

async function loadBloodTestData() {
  loadBloodTestConfig();
  loadBloodTestOff();
  // Default the upcoming-appts date to today on first open.
  var di = document.getElementById('btApptsDate');
  if (di && !di.value) di.value = todayStr();
  loadBloodTestAppts();
}

async function loadBloodTestConfig() {
  try {
    var res = await apiCall('blood-test-config');
    if (!res || !res.ok || !res.config) return;
    var c = res.config;
    _btConfig = c;
    document.getElementById('btEnabled').value = c.enabled ? '1' : '0';
    document.getElementById('btAtPotters').checked = (c.location === 'potters');
    document.getElementById('btSlotMin').value = String(c.slotMin || 10);
    document.getElementById('btPriceEuros').value = ((c.priceCents || 0) / 100).toFixed(2);
    document.getElementById('btTypes').value = (c.types || []).join('\\n');
    document.getElementById('btHours').value = JSON.stringify(c.hours || {}, null, 2);
  } catch (e) { console.error('Blood-test config load error:', e); }
}

async function saveBloodTestConfig() {
  var enabled = document.getElementById('btEnabled').value === '1';
  var location = document.getElementById('btAtPotters').checked ? 'potters' : 'spinola';
  var slotMin = parseInt(document.getElementById('btSlotMin').value, 10);
  var euros = parseFloat(document.getElementById('btPriceEuros').value);
  if (!isFinite(euros) || euros < 0) euros = 0;
  var priceCents = Math.round(euros * 100);
  var types = document.getElementById('btTypes').value.split(/\\r?\\n/).map(function(s){ return s.trim(); }).filter(Boolean);
  var hours;
  try { hours = JSON.parse(document.getElementById('btHours').value); }
  catch(e) { showMsg('btConfigMsg', 'bad', 'Invalid hours JSON.'); return; }

  showMsg('btConfigMsg', '', 'Saving...');
  try {
    var res = await apiCall('blood-test-config', { body: { enabled: enabled, location: location, slotMin: slotMin, priceCents: priceCents, types: types, hours: hours } });
    if (!res || !res.ok) { showMsg('btConfigMsg', 'bad', (res && res.reason) || 'Failed.'); return; }
    showMsg('btConfigMsg', 'good', 'Saved.');
    _btConfig = res.config;
  } catch (e) { showMsg('btConfigMsg', 'bad', 'Error: ' + e.message); }
}

async function loadBloodTestOff() {
  var el = document.getElementById('btOffList');
  el.innerHTML = '<div class="empty">Loading...</div>';
  try {
    var res = await apiCall('blood-test-off');
    if (!res || !res.ok) { el.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
    var rows = res.rows || [];
    if (!rows.length) { el.innerHTML = '<div class="empty">No off-days set.</div>'; return; }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="text-align:left;color:#6b7280;"><th style="padding:6px;">Date</th><th style="padding:6px;">Reason</th><th style="padding:6px;text-align:right;">&nbsp;</th></tr></thead><tbody>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html += '<tr><td style="padding:6px;border-top:1px solid #f3f4f6;"><b>' + esc(r.date_key) + '</b></td>' +
              '<td style="padding:6px;border-top:1px solid #f3f4f6;color:#374151;">' + esc(r.reason || '') + '</td>' +
              '<td style="padding:6px;border-top:1px solid #f3f4f6;text-align:right;"><button class="btn btn-ghost btn-sm" onclick="removeBloodTestOff(' + r.id + ')">Remove</button></td></tr>';
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  } catch (e) { el.innerHTML = '<div class="empty">Error: ' + esc(e.message) + '</div>'; }
}

async function addBloodTestOff() {
  var d = document.getElementById('btOffDate').value;
  var r = document.getElementById('btOffReason').value.trim();
  if (!d) return;
  await apiCall('blood-test-off', { body: { dateKey: d, reason: r } });
  document.getElementById('btOffReason').value = '';
  loadBloodTestOff();
}

async function removeBloodTestOff(id) {
  if (!confirm('Remove this off-day?')) return;
  await fetch('/api/admin/blood-test-off/' + id + '?sig=' + encodeURIComponent(SIG), { method: 'DELETE', credentials: 'same-origin' });
  loadBloodTestOff();
}

async function loadBloodTestAppts() {
  var di = document.getElementById('btApptsDate');
  if (!di.value) return;
  var el = document.getElementById('btApptsList');
  el.innerHTML = '<div class="empty">Loading...</div>';
  try {
    var res = await apiCall('blood-test-appointments?date=' + encodeURIComponent(di.value));
    if (!res || !res.ok) { el.innerHTML = '<div class="empty">Failed.</div>'; return; }
    var appts = res.appointments || [];
    if (!appts.length) { el.innerHTML = '<div class="empty">No blood-test bookings on this date.</div>'; return; }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="text-align:left;color:#6b7280;"><th style="padding:6px;">Time</th><th style="padding:6px;">Patient</th><th style="padding:6px;">Phone</th><th style="padding:6px;">Email</th><th style="padding:6px;">Service</th><th style="padding:6px;">Status</th><th style="padding:6px;text-align:right;">Actions</th></tr></thead><tbody>';
    for (var i = 0; i < appts.length; i++) {
      var a = appts[i];
      var rowStyle = a.status === 'RELOCATED_SPINOLA' ? 'opacity:0.6;' : '';
      html += '<tr style="' + rowStyle + '">';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;"><b>' + esc(a.start_time) + '</b></td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;">' + esc(a.full_name) + '</td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;"><a href="tel:' + esc(a.phone) + '">' + esc(a.phone) + '</a></td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;">' + esc(a.email) + '</td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;">' + esc(a.service_name) + '</td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;">' + esc(a.status) + '</td>';
      html += '<td style="padding:6px;border-top:1px solid #f3f4f6;text-align:right;white-space:nowrap;">';
      if (a.status === 'BOOKED') {
        html += '<button class="btn btn-sm btn-ghost" onclick="bloodTestSendSpinola(\\'' + a.id + '\\')">Send to Spinola</button> ';
        html += '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="' + esc(a.rescheduleUrl) + '">Reschedule</a> ';
        html += '<a class="btn btn-sm btn-ghost" style="color:#991b1b;" target="_blank" rel="noopener" href="' + esc(a.cancelUrl) + '">Cancel</a>';
      }
      html += '</td></tr>';
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  } catch (e) { el.innerHTML = '<div class="empty">Error: ' + esc(e.message) + '</div>'; }
}

async function bloodTestSendSpinola(appointmentId) {
  if (!confirm('Move this blood test to Spinola Clinic? Patient will be emailed the new location.')) return;
  try {
    var res = await apiCall('blood-test-send-spinola', { body: { appointmentId: appointmentId } });
    if (res && res.ok) { alert(res.message || 'Moved to Spinola.'); loadBloodTestAppts(); }
    else alert((res && res.reason) || 'Failed.');
  } catch (e) { alert('Error: ' + e.message); }
}


// ── WebSocket for real-time updates (with exponential backoff) ──
var _ws = null;
var _wsReconnectDelay = 1000;
var _wsReconnectTimer = null;
function connectWS() {
  if (_wsReconnectTimer) { clearTimeout(_wsReconnectTimer); _wsReconnectTimer = null; }
  var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  try { _ws = new WebSocket(proto + '//' + location.host + '/api/ws'); } catch(e) { scheduleReconnect(); return; }
  _ws.onopen = function() {
    _wsReconnectDelay = 1000; // Reset backoff on successful connect
    try { _ws.send(JSON.stringify({ subscribe: 'admin' })); } catch(e) {}
    console.log('[WS] Connected and subscribed to admin channel');
    var dot = document.getElementById('sseDot');
    if (dot) dot.className = 'sseDot connected';
    var refreshDot = document.querySelector('.refresh-dot');
    if (refreshDot) refreshDot.style.background = '#10b981';
    var lastEl = document.getElementById('refreshLastText');
    if (lastEl) lastEl.textContent = 'Connected';
  };
  _ws.onmessage = function(ev) {
    try {
      if (ev.data === 'pong' || ev.data === 'ping') return;
      var msg = JSON.parse(ev.data);
      // DDA register changed on another device — refresh the table (and the
      // activity feed) live wherever they're open. No booking sound for this.
      if (msg.type === 'dda_updated') {
        var ddaTab = document.getElementById('tab-dda');
        if (ddaTab && ddaTab.style.display !== 'none' && typeof loadDdaList === 'function') loadDdaList();
        var actTabEl = document.getElementById('tab-activity');
        if (actTabEl && actTabEl.style.display !== 'none' && typeof loadActivity === 'function') loadActivity();
        showLiveToast('DDA register updated');
        var ddaLastEl = document.getElementById('refreshLastText');
        if (ddaLastEl) ddaLastEl.textContent = 'Live update received';
        _lastRefreshTime = Date.now();
        return;
      }
      var isTelemed = msg.type === 'telemedicine_updated';
      if (isTelemed || msg.type === 'slots_updated' || msg.type === 'slots_data' || msg.type === 'dashboard_data' || msg.type === 'appointment_changed') {
        showLiveToast(isTelemed ? 'New telemedicine call' : 'New booking or schedule change detected');
        playNotifSound();
        _silentRefresh = true;
        if (typeof loadDashboard === 'function') loadDashboard();
        if (document.getElementById('tab-followups').style.display !== 'none') loadAdminFollowUps();
        if (document.getElementById('tab-referrals').style.display !== 'none') loadReferrals();
        // Telemedicine sections live in two places: the dedicated tab
        // and the schedule-view subsection. Refresh whichever is visible.
        try {
          if (typeof loadTelemedicineStats === 'function') loadTelemedicineStats();
          var telTab = document.getElementById('tab-telemedicine');
          if (telTab && telTab.style.display !== 'none' && typeof loadTelemedicineList === 'function') {
            loadTelemedicineList();
          }
          var schedTab = document.getElementById('tab-schedule');
          if (schedTab && schedTab.style.display !== 'none' && typeof loadSchedTelemed === 'function') {
            loadSchedTelemed(_schedDate || telTodayKey());
          }
        } catch(e) {}
        var lastEl = document.getElementById('refreshLastText');
        if (lastEl) lastEl.textContent = 'Live update received';
        _lastRefreshTime = Date.now();
      }
    } catch(e) {}
  };
  _ws.onclose = function() {
    var dot = document.getElementById('sseDot');
    if (dot) dot.className = 'sseDot';
    var refreshDot = document.querySelector('.refresh-dot');
    if (refreshDot) refreshDot.style.background = '#ef4444';
    var lastEl = document.getElementById('refreshLastText');
    if (lastEl) lastEl.textContent = 'Reconnecting...';
    scheduleReconnect();
  };
  _ws.onerror = function() { try { _ws.close(); } catch(e) {} };
}
function scheduleReconnect() {
  if (_wsReconnectTimer) return;
  _wsReconnectTimer = setTimeout(function() {
    _wsReconnectTimer = null;
    connectWS();
  }, _wsReconnectDelay);
  _wsReconnectDelay = Math.min(_wsReconnectDelay * 2, 30000); // Cap at 30s
}
// Reconnect immediately when tab becomes visible again
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && (!_ws || _ws.readyState !== 1)) {
    _wsReconnectDelay = 1000;
    connectWS();
  }
});
setInterval(function() { if (_ws && _ws.readyState === 1) try { _ws.send('ping'); } catch(e) {} }, 30000);
connectWS();

// ── Follow-ups ──
function loadAdminFollowUps() {
  var el = document.getElementById('followUpAdminList');
  el.innerHTML = '<div class="empty">Loading...</div>';
  apiCall('follow-ups').then(function(res) {
    if (!res || !res.ok || !res.followUps || !res.followUps.length) {
      el.innerHTML = '<div class="empty">No follow-ups yet.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < res.followUps.length; i++) {
      var f = res.followUps[i];
      var border = f.response === 'question' ? 'border-left:4px solid #3b82f6;' : '';
      html += '<div style="border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:8px;background:#fff;' + border + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
      html += '<div>';
      html += '<div style="font-weight:800;font-size:14px;">' + esc(f.patient_name) + '</div>';
      html += '<div style="font-size:13px;margin-top:3px;">';
      if (f.phone) html += '<a href="tel:' + esc(f.phone) + '" style="color:#2563eb;text-decoration:none;font-weight:600;">' + esc(f.phone) + '</a> \\u2022 ';
      if (f.email) html += '<a href="mailto:' + esc(f.email) + '" style="color:#2563eb;text-decoration:none;font-weight:600;">' + esc(f.email) + '</a>';
      html += '</div>';
      html += '<div style="font-size:12px;color:#6b7280;margin-top:2px;">' + esc(f.date_key) + ' \\u2022 ' + esc(f.clinic === 'spinola' ? 'Spinola' : 'Potters') + '</div>';
      html += '</div>';
      html += '<div>';
      if (f.response === 'great') {
        html += '<span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;background:#d1fae5;color:#065f46;">GREAT</span>';
      } else if (f.response === 'question') {
        html += '<span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;background:#dbeafe;color:#1e40af;">QUESTION</span>';
      } else if (f.response === 'rebook') {
        html += '<span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;background:#fef3c7;color:#92400e;">REBOOK</span>';
      } else {
        html += '<span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;background:#f3f4f6;color:#6b7280;">SENT</span>';
      }
      html += '</div>';
      html += '</div>';
      if (f.question_text) {
        html += '<div style="margin-top:8px;padding:8px 10px;background:#f0f9ff;border-radius:10px;border:1px solid #bfdbfe;color:#1e40af;font-size:13px;font-style:italic;">' + esc(f.question_text) + '</div>';
      }
      if (f.response) {
        html += '<label style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:#6b7280;cursor:pointer;"><input type="checkbox" ' + (f.status === 'handled' ? 'checked' : '') + ' onchange="toggleHandled(' + f.id + ',this.checked)"> Handled</label>';
      }
      html += '</div>';
    }
    el.innerHTML = html;
  }).catch(function() {
    el.innerHTML = '<div class="empty">Error loading follow-ups.</div>';
  });
}
function toggleHandled(id, checked) {
  apiCall('follow-up-handled', { body: { id: id, handled: checked } }).catch(function(){});
}

// ── Referrals ──
function loadReferrals() {
  var el = document.getElementById('referralList');
  var statsEl = document.getElementById('referralStats');
  el.innerHTML = '<div class="empty">Loading...</div>';
  apiCall('referrals').then(function(res) {
    if (!res || !res.ok || !res.referrals || !res.referrals.length) {
      el.innerHTML = '<div class="empty">No referrals yet. Referral links are included in all patient emails.</div>';
      statsEl.innerHTML = '';
      return;
    }
    var referrals = res.referrals;
    // Stats
    var uniqueReferrers = {};
    for (var s = 0; s < referrals.length; s++) {
      var key = referrals[s].referrer_email;
      if (!uniqueReferrers[key]) uniqueReferrers[key] = { name: referrals[s].referrer_name, count: 0 };
      uniqueReferrers[key].count++;
    }
    var topList = Object.keys(uniqueReferrers).map(function(k) { return uniqueReferrers[k]; }).sort(function(a,b) { return b.count - a.count; });
    statsEl.innerHTML = '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;">' +
      '<div style="padding:12px 16px;border-radius:14px;background:#d1fae5;font-weight:800;font-size:18px;color:#065f46;">' + referrals.length + '<div style="font-size:11px;font-weight:600;">Total Referrals</div></div>' +
      '<div style="padding:12px 16px;border-radius:14px;background:#eff6ff;font-weight:800;font-size:18px;color:#1e40af;">' + topList.length + '<div style="font-size:11px;font-weight:600;">Ambassadors</div></div>' +
      (topList[0] ? '<div style="padding:12px 16px;border-radius:14px;background:#fef3c7;font-weight:800;font-size:14px;color:#92400e;">' + esc(topList[0].name) + '<div style="font-size:11px;font-weight:600;">Top Referrer (' + topList[0].count + ')</div></div>' : '') +
      '</div>';
    // List
    var html = '';
    for (var i = 0; i < referrals.length; i++) {
      var r = referrals[i];
      html += '<div style="border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:8px;background:#fff;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
      html += '<div>';
      html += '<div style="font-size:13px;color:#6b7280;">Referred by</div>';
      html += '<div style="font-weight:800;font-size:14px;">' + esc(r.referrer_name) + '</div>';
      html += '<div style="font-size:12px;color:#6b7280;">' + esc(r.referrer_email) + '</div>';
      html += '</div>';
      html += '<div style="text-align:right;">';
      html += '<div style="font-size:13px;color:#10b981;font-weight:700;">New patient</div>';
      html += '<div style="font-weight:800;font-size:14px;">' + esc(r.referred_name) + '</div>';
      html += '<div style="font-size:12px;color:#6b7280;">' + esc(r.referred_email) + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:#9ca3af;margin-top:6px;">' + esc(r.created_at ? r.created_at.slice(0, 16) : '') + (r.thanked ? ' \\u2022 Thanked' : '') + '</div>';
      html += '</div>';
    }
    el.innerHTML = html;
  }).catch(function() {
    el.innerHTML = '<div class="empty">Error loading referrals.</div>';
  });
}

// ─── Reschedule (universal — any clinic) ──────────────────
var rsListData = [];
var rsCurrentAppt = null;
var rsSearchTimer = null;
var rsForce = false;

function rsEsc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function rsClinicLabel(a){
  if (a.clinic === 'spinola') return 'Spinola';
  if (a.clinic === 'linda') return 'Physio (Linda)';
  if (a.serviceId === 'blood-test') return 'Blood Test';
  return "Potter's";
}
function rsClinicBadge(a){
  var l = rsClinicLabel(a);
  var bg = '#111827';
  if (l === 'Spinola') bg = '#6d28d9';
  else if (l === 'Physio (Linda)') bg = '#047857';
  else if (l === 'Blood Test') bg = '#b91c1c';
  else bg = '#1d4ed8';
  return '<span class="badge" style="background:' + bg + ';color:#fff;">' + l + '</span>';
}
function rsFmt12(hhmm){
  if (!hhmm) return '';
  var p = hhmm.split(':');
  var h = parseInt(p[0], 10), m = p[1] || '00';
  var ap = h >= 12 ? 'PM' : 'AM';
  var h12 = (h % 12) === 0 ? 12 : (h % 12);
  return h12 + ':' + m + ' ' + ap;
}
function rsDuration(s, e){
  if (!s || !e) return 0;
  var ps = s.split(':'), pe = e.split(':');
  return (parseInt(pe[0],10)*60 + parseInt(pe[1],10)) - (parseInt(ps[0],10)*60 + parseInt(ps[1],10));
}
function rsNormClinic(c){ return (c === 'spinola' || c === 'linda') ? c : 'potters'; }

function loadRescheduleTab(){
  // Default the browse-date to today the first time the tab opens.
  var dEl = document.getElementById('rsDate');
  if (dEl && !dEl.value && !document.getElementById('rsSearch').value) {
    dEl.value = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Malta' });
    rsLoadDate();
  }
}
function rsOnSearch(){
  clearTimeout(rsSearchTimer);
  rsSearchTimer = setTimeout(rsDoSearch, 300);
}
async function rsDoSearch(){
  var q = document.getElementById('rsSearch').value.trim();
  var box = document.getElementById('rsList');
  if (q.length < 2) { box.innerHTML = '<div class="empty">Type at least 2 characters, or pick a date.</div>'; return; }
  document.getElementById('rsDate').value = '';
  box.innerHTML = '<div class="empty">Searching\\u2026</div>';
  try {
    var res = await apiCall('reschedule-list?q=' + encodeURIComponent(q));
    rsRender((res && res.appointments) || []);
  } catch(e) { box.innerHTML = '<div class="empty">Error searching.</div>'; }
}
async function rsLoadDate(){
  var d = document.getElementById('rsDate').value;
  if (!d) return;
  document.getElementById('rsSearch').value = '';
  var box = document.getElementById('rsList');
  box.innerHTML = '<div class="empty">Loading\\u2026</div>';
  try {
    var res = await apiCall('reschedule-list?date=' + encodeURIComponent(d));
    rsRender((res && res.appointments) || []);
  } catch(e) { box.innerHTML = '<div class="empty">Error loading.</div>'; }
}
function rsRender(list){
  rsListData = list || [];
  var box = document.getElementById('rsList');
  if (!rsListData.length) { box.innerHTML = '<div class="empty">No appointments found.</div>'; return; }
  var html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Date</th><th>Time</th><th>Patient</th><th>Service</th><th>Clinic</th><th>Status</th><th></th>' +
    '</tr></thead><tbody>';
  for (var i = 0; i < rsListData.length; i++) {
    var a = rsListData[i];
    html += '<tr>' +
      '<td>' + rsEsc(a.dateKey) + '</td>' +
      '<td>' + rsEsc(rsFmt12(a.startTime)) + '</td>' +
      '<td>' + rsEsc(a.fullName || '') + '<div class="subtitle" style="margin:0;font-size:11px;">' + rsEsc(a.phone || '') + '</div></td>' +
      '<td>' + rsEsc(a.serviceName || '') + '</td>' +
      '<td>' + rsClinicBadge(a) + '</td>' +
      '<td>' + rsEsc(a.status || '') + '</td>' +
      '<td><button class="btn btn-blue btn-sm" onclick="rsOpen(' + i + ')">Reschedule</button></td>' +
      '</tr>';
  }
  html += '</tbody></table></div>';
  box.innerHTML = html;
}
function rsOpen(i){
  var a = rsListData[i];
  if (!a) return;
  rsCurrentAppt = a;
  document.getElementById('rsCurrent').innerHTML =
    '<b>' + rsEsc(a.fullName || '') + '</b> &mdash; ' + rsEsc(a.serviceName || '') + ' ' + rsClinicBadge(a) + '<br>' +
    '<span style="color:#6b7280;">Currently:</span> ' + rsEsc(a.dateKey) + ' &middot; ' + rsEsc(rsFmt12(a.startTime)) +
      (a.endTime ? ('\\u2013' + rsEsc(rsFmt12(a.endTime))) : '') + '<br>' +
    '<span style="color:#6b7280;">Location:</span> ' + rsEsc(a.location || '\\u2014');
  document.getElementById('rsNewDate').value = a.dateKey || '';
  document.getElementById('rsNewTime').value = a.startTime || '';
  var dur = rsDuration(a.startTime, a.endTime);
  document.getElementById('rsNewDur').value = dur > 0 ? dur : 30;
  document.getElementById('rsNewClinic').value = rsNormClinic(a.clinic);
  document.getElementById('rsNewLoc').value = a.location || '';
  document.getElementById('rsNewLoc').placeholder = 'Location address';
  document.getElementById('rsNotify').checked = true;
  // Reset the action button every time the modal opens — otherwise the
  // disabled state left over from a previous reschedule would carry over.
  rsForce = false;
  var sb = document.getElementById('rsSaveBtn');
  sb.disabled = false;
  sb.textContent = 'Reschedule';
  rsMsgClear();
  var ov = document.getElementById('rsOverlay');
  ov.style.display = 'flex';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('show'); }); });
}
function rsClinicChanged(){
  rsResetForce();
  // Moving to a different clinic: clear the location so the server fills that
  // clinic's default. Moving back to the original: restore the original.
  var c = document.getElementById('rsNewClinic').value;
  var loc = document.getElementById('rsNewLoc');
  var orig = rsCurrentAppt ? rsNormClinic(rsCurrentAppt.clinic) : 'potters';
  if (c === orig) {
    loc.value = rsCurrentAppt ? (rsCurrentAppt.location || '') : '';
    loc.placeholder = 'Location address';
  } else {
    loc.value = '';
    loc.placeholder = 'Leave blank to use the ' + c + ' default';
  }
}
// Editing the slot clears any pending "book anyway" override so a changed
// time can never be force-booked over a fresh clash without a new warning.
function rsResetForce(){
  if (!rsForce) return;
  rsForce = false;
  var sb = document.getElementById('rsSaveBtn');
  sb.textContent = 'Reschedule';
  rsMsgClear();
}
function rsMsg(type, text){
  var m = document.getElementById('rsMsg');
  m.style.display = 'block';
  m.className = 'msg' + (type ? (' ' + type) : '');
  m.textContent = text;
}
function rsMsgClear(){ var m = document.getElementById('rsMsg'); m.style.display = 'none'; m.textContent = ''; }
function rsCloseForm(){
  var ov = document.getElementById('rsOverlay');
  ov.classList.remove('show');
  setTimeout(function(){ ov.style.display = 'none'; }, 200);
}
async function rsSubmit(){
  if (!rsCurrentAppt) return;
  var date = document.getElementById('rsNewDate').value;
  var time = document.getElementById('rsNewTime').value;
  var dur = parseInt(document.getElementById('rsNewDur').value, 10);
  var clinic = document.getElementById('rsNewClinic').value;
  var loc = document.getElementById('rsNewLoc').value.trim();
  var notify = document.getElementById('rsNotify').checked;
  if (!date || !time) { rsMsg('bad', 'Please choose a new date and time.'); return; }
  var endTime = '';
  if (dur && dur > 0) {
    var p = time.split(':');
    var mins = parseInt(p[0],10)*60 + parseInt(p[1],10) + dur;
    endTime = String(Math.floor(mins/60)).padStart(2,'0') + ':' + String(mins%60).padStart(2,'0');
  }
  var btn = document.getElementById('rsSaveBtn');
  btn.disabled = true;
  rsMsg('', 'Rescheduling\\u2026');
  try {
    var res = await apiCall('reschedule-appointment', { body: {
      appointmentId: rsCurrentAppt.appointmentId,
      dateKey: date, startTime: time, endTime: endTime,
      clinic: clinic, location: loc, notify: notify, force: rsForce
    }});
    if (res && res.ok) {
      rsForce = false;
      rsMsg('good', 'Moved to ' + res.dateKey + ' at ' + rsFmt12(res.startTime) + '.');
      setTimeout(function(){
        rsCloseForm();
        if (document.getElementById('rsDate').value) rsLoadDate();
        else if (document.getElementById('rsSearch').value) rsDoSearch();
      }, 900);
    } else if (res && res.conflict) {
      // Double-booking detected. Let the admin override deliberately — the
      // next click sends force:true and goes through.
      rsForce = true;
      rsMsg('bad', (res.reason || 'That time is already booked.') + ' Click again to book it anyway.');
      btn.textContent = 'Reschedule anyway';
      btn.disabled = false;
    } else {
      rsForce = false;
      rsMsg('bad', (res && res.reason) || 'Could not reschedule.');
      btn.disabled = false;
    }
  } catch(e) {
    rsMsg('bad', 'Error: ' + e.message);
    btn.disabled = false;
  }
}
</script>
</body>
</html>
`;
}
