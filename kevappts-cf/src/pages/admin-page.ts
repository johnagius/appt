/**
 * Admin dashboard — full-featured management panel.
 * Ported from GAS Admin.html to Cloudflare Workers.
 */
export function adminPage(sig: string): string {
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
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="schedule" onclick="switchTab('schedule')">Schedule</div>
    <div class="tab" data-tab="availability" onclick="switchTab('availability')">Availability</div>
    <div class="tab" data-tab="actions" onclick="switchTab('actions')">Quick Actions</div>
    <div class="tab" data-tab="statistics" onclick="switchTab('statistics')">Statistics</div>
    <div class="tab" data-tab="reviews" onclick="switchTab('reviews')">Reviews</div>
    <div class="tab" data-tab="settings" onclick="switchTab('settings')">Settings</div>
  </div>

  <div class="msg" id="globalMsg"></div>

  <!-- SCHEDULE TAB -->
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

      <!-- Day appointments -->
      <div class="card">
        <h3 id="schedHeader" class="date-header">Appointments</h3>
        <div id="schedTable"></div>
      </div>
    </div>
  </div>

  <!-- SETTINGS TAB -->
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
  <div class="stats-refresh">
    <span class="stats-period" id="statsPeriod">Last 28 days</span>
    <button class="btn btn-sm btn-ghost" onclick="_statsLoaded=false;loadStatistics()">Refresh</button>
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
    <div class="card">
      <h3>Weekly Trend</h3>
      <div class="bar-chart" id="weeklyTrendChart"></div>
      <div class="legend">
        <span><span class="legend-dot" style="background:#2563eb;"></span>Booked</span>
        <span><span class="legend-dot" style="background:#ef4444;"></span>Cancelled</span>
      </div>
    </div>
    <div class="card">
      <h3>Peak Hours</h3>
      <div class="heatmap" id="peakHoursMap"></div>
    </div>
  </div>

  <!-- Insights row -->
  <div class="stats-grid" style="margin-top:12px;">
    <div class="card">
      <h3>Utilization by Day</h3>
      <div id="utilByDay"></div>
    </div>
    <div class="card">
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
      <h3>Bookings by Country</h3>
      <div id="countryChart"></div>
    </div>
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
      <div class="card">
        <h3>Weekly Trend</h3>
        <div class="bar-chart" id="spWeeklyTrendChart"></div>
        <div class="legend">
          <span><span class="legend-dot" style="background:#8b5cf6;"></span>Booked</span>
          <span><span class="legend-dot" style="background:#ef4444;"></span>Cancelled</span>
        </div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:12px;">
      <div class="card">
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
        <h3>Bookings by Country</h3>
        <div id="spCountryChart"></div>
      </div>
      <div class="card"></div>
    </div>
  </div>

  <div class="msg" id="statsMsg"></div>
</div>

<!-- Reviews Tab -->
<div class="tab-content" id="tab-reviews" style="display:none;">
  <div class="rev-wrap">
    <h3 class="rev-title">Request Google Reviews</h3>
    <p class="rev-subtitle">Select today's patients to send a friendly review request email.</p>

    <div class="rev-team">
      <label class="rev-team-label">Team members present today:</label>
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
    </div>
    <div class="msg rev-msg" id="reviewsMsg"></div>
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


<script>
var SIG = ${JSON.stringify(sig)};
var _silentRefresh = false;

// Notification sound (short ping tone generated via Web Audio API)
var _notifSound = (function() {
  return {
    play: function() {
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch(e) {}
    }
  };
})();

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
    status: a.status,
    location: a.location,
    createdAt: a.created_at || a.createdAt,
    updatedAt: a.updated_at || a.updatedAt,
    token: a.token,
    calendarEventId: a.calendar_event_id || a.calendarEventId,
    cancelledAt: a.cancelled_at || a.cancelledAt,
    cancelReason: a.cancel_reason || a.cancelReason,
    clinic: a.clinic
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
    res.totalBooked = st.total || 0;
    res.totalUniquePatients = st.uniquePatients || 0;
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
  if (name === 'reviews') loadReviewPatients();
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
  html += '<th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th><th></th></tr></thead><tbody>';
  for (var i = 0; i < appts.length; i++) {
    var a = appts[i];
    var badge = getStatusBadge(a.status);
    html += '<tr' + (showDate ? ' style="cursor:pointer" onclick="goToDate(\\'' + esc(a.dateKey) + '\\')"' : '') + '>';
    if (withCheckboxes) html += '<td><input type="checkbox" class="appt-cb" value="' + esc(a.appointmentId) + '"></td>';
    if (showDate) html += '<td><b>' + esc(a.dateKey) + '</b></td>';
    html += '<td><b>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</b></td>';
    html += '<td><a class="patient-link" href="#" onclick="event.stopPropagation();event.preventDefault();showPatientHistory(\\'' + esc(a.email) + '\\',\\'' + esc(a.phone) + '\\')">' + esc(a.fullName) + '</a></td>';
    html += '<td>' + esc(a.phone) + '</td>';
    html += '<td>' + esc(a.serviceName) + '</td>';
    html += '<td>' + esc(a.location) + '</td>';
    html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
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

      // Set default dates for Quick Actions
      document.getElementById('actionDate').value = res.todayKey;
      loadActionAppts();
      document.getElementById('notifyDate').value = res.todayKey;
      loadNotifyAppts();

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
  document.getElementById('schedTable').innerHTML = '<div class="empty">Loading...</div>';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('schedTable').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'schedTable', false);
    })
    .withFailureHandler(function() {
      document.getElementById('schedTable').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, _schedDate);
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
        html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
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

  // Render tick marks below the bar
  ticksEl.innerHTML = '';
  for (var h = _tlDayStart; h <= _tlDayEnd; h++) {
    var tick = document.createElement('div');
    tick.className = 'tl-tick';
    var lbl = document.createElement('div');
    lbl.className = 'tl-tick-label';
    lbl.textContent = String(h).padStart(2, '0') + ':00';
    tick.appendChild(lbl);
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

function loadActionAppts() {
  var dateKey = document.getElementById('actionDate').value;
  if (!dateKey) return;

  document.getElementById('actionApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('actionBar').style.display = 'none';
  document.getElementById('customMsgRow').style.display = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('actionApptsList').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'actionApptsList', true);
      if (res.appointments && res.appointments.length > 0) {
        document.getElementById('actionBar').style.display = 'flex';
        document.getElementById('customMsgRow').style.display = 'flex';
      }
    })
    .withFailureHandler(function(err) {
      document.getElementById('actionApptsList').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, dateKey);
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
    .apiAdminProcessAppointments(SIG, {
      dateKey: dateKey,
      action: 'cancel',
      appointmentIds: [appointmentId],
      customMessage: ''
    });
  });
}

// ========== Notifications ==========

function loadNotifyAppts() {
  var dateKey = document.getElementById('notifyDate').value;
  if (!dateKey) return;

  document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Loading...</div>';
  document.getElementById('notifyMsgRow').style.display = 'none';
  document.getElementById('notifyPresets').style.display = 'none';
  document.getElementById('notifyBtn').style.display = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) {
        document.getElementById('notifyApptsList').innerHTML = '<div class="empty">' + esc(res.reason || 'Failed.') + '</div>';
        return;
      }
      renderApptTable(res.appointments, 'notifyApptsList', true);
      if (res.appointments && res.appointments.length > 0) {
        document.getElementById('notifyMsgRow').style.display = 'flex';
        document.getElementById('notifyPresets').style.display = 'block';
        document.getElementById('notifyBtn').style.display = 'inline-flex';
      }
    })
    .withFailureHandler(function(err) {
      document.getElementById('notifyApptsList').innerHTML = '<div class="empty">Error loading.</div>';
    })
    .apiAdminGetDateAppointments(SIG, dateKey);
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
        html += '<th>Date</th><th>Time</th><th>Status</th><th>Location</th><th>Notes</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < res.appointments.length; i++) {
          var a = res.appointments[i];
          var badge = getStatusBadge(a.status);
          html += '<tr>';
          html += '<td><b>' + esc(a.dateKey) + '</b></td>';
          html += '<td>' + esc(a.startTime) + ' - ' + esc(a.endTime) + '</td>';
          html += '<td><span class="badge ' + badge.cls + '">' + badge.text + '</span></td>';
          html += '<td>' + esc(a.location) + '</td>';
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

var _statsLoaded = false;

function loadStatistics() {
  if (_statsLoaded) return;
  showMsg('statsMsg', '', 'Loading statistics...');

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('statsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('statsMsg', '', '');
      _statsLoaded = true;
      renderAllStats(res);
    })
    .withFailureHandler(function(err) {
      showMsg('statsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetStatistics(SIG);
}

function renderAllStats(s) {
  // Period label
  document.getElementById('statsPeriod').textContent = s.period.from + ' to ' + s.period.to + ' (generated ' + s.generated + ')';

  // Hero metrics
  renderProgressRing(s.utilization);
  document.getElementById('heroUtil').textContent = s.utilization + '%';
  document.getElementById('heroBooked').textContent = s.totalBooked;
  // Trend arrow on appointments
  var trendArrow = '';
  if (s.trendDirection === 'up') trendArrow = '<span class="trend-arrow trend-up">&uarr;' + s.trendPct + '%</span>';
  else if (s.trendDirection === 'down') trendArrow = '<span class="trend-arrow trend-down">&darr;' + s.trendPct + '%</span>';
  document.getElementById('heroBookedSub').innerHTML = 'last 28 days ' + trendArrow;
  document.getElementById('heroCancelRate').textContent = s.cancelRate + '%';
  var crEl = document.getElementById('heroCancelRate');
  crEl.style.color = s.cancelRate < 10 ? 'var(--good)' : s.cancelRate < 20 ? '#f59e0b' : 'var(--bad)';
  document.getElementById('heroPatients').textContent = s.totalUniquePatients;
  document.getElementById('heroRepeat').textContent = s.repeatPatients + ' returning';

  renderWeeklyTrend(s.weeklyTrend);
  renderPeakHours(s.hourlyDistribution);
  renderUtilByDay(s.utilizationByDay);
  renderUpcomingLoad(s.upcomingLoad);
  renderLocationSplit(s.locationSplit);
  renderTopPatients(s.topPatients);
  renderCancelBreakdown(s);
  renderBusiestDay(s.busiestDay);
  renderLeadTime(s);
  renderAttendance(s);
  renderDoctorActions(s);
  renderCountryBreakdown(s.countryBreakdown);
  renderTopCancellers(s.topCancellers);
  renderSpinolaStats(s.spinola);
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

  // Only show hours that have data or are in working range (7-21)
  var maxCount = 1;
  for (var h = 0; h < 24; h++) { if (dist[h] > maxCount) maxCount = dist[h]; }

  var html = '';
  for (var h = 7; h <= 20; h++) {
    var count = dist[h] || 0;
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

  var maxCount = 1;
  for (var h = 0; h < 24; h++) { if (dist[h] > maxCount) maxCount = dist[h]; }

  var html = '';
  for (var h = 7; h <= 20; h++) {
    var count = dist[h] || 0;
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

function loadReviewPatients() {
  showMsg('reviewsMsg', '', 'Loading today\\'s patients...');
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('reviewsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('reviewsMsg', '', '');
      _reviewPotters = res.potters || [];
      _reviewSpinola = res.spinola || [];
      renderReviewList('potters', _reviewPotters);
      renderReviewList('spinola', _reviewSpinola);
    })
    .withFailureHandler(function(err) {
      showMsg('reviewsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminGetReviewPatients(SIG);
}

function renderReviewList(loc, patients) {
  var elId = loc === 'potters' ? 'revPottersList' : 'revSpinolaList';
  var el = document.getElementById(elId);
  if (!patients.length) { el.innerHTML = '<div class="empty">No patients with email today.</div>'; return; }

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
    if (sent) html += '<span class="rev-sent-badge">Sent</span>';
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

  var location = loc === 'potters' ? 'potters' : 'spinola';
  showMsg('reviewsMsg', '', 'Sending ' + ids.length + ' email(s)...');

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.ok) { showMsg('reviewsMsg', 'bad', res.reason || 'Failed.'); return; }
      showMsg('reviewsMsg', 'good', res.message);
      // Mark sent patients in UI
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
      var selAll = document.getElementById(loc === 'potters' ? 'revSelectAllPotters' : 'revSelectAllSpinola');
      if (selAll) selAll.checked = false;
    })
    .withFailureHandler(function(err) {
      showMsg('reviewsMsg', 'bad', 'Error: ' + (err && err.message ? err.message : String(err)));
    })
    .apiAdminSendReviewRequests(SIG, { appointmentIds: ids, location: location, teamNames: teamNames });
}


// ── WebSocket for real-time updates ──
var _ws = null;
function connectWS() {
  var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  try { _ws = new WebSocket(proto + '//' + location.host + '/api/ws'); } catch(e) { return; }
  _ws.onopen = function() {
    try { _ws.send(JSON.stringify({ subscribe: 'admin' })); } catch(e) {}
    var dot = document.getElementById('sseDot');
    if (dot) dot.className = 'sseDot connected';
  };
  _ws.onmessage = function(ev) {
    try {
      var msg = JSON.parse(ev.data);
      if (msg.type === 'slots_updated' || msg.type === 'slots_data' || msg.type === 'dashboard_data') {
        // Silent refresh — no loading overlay
        _silentRefresh = true;
        if (typeof loadDashboard === 'function') loadDashboard();
        // Play notification sound
        try { _notifSound.play(); } catch(e2) {}
      }
    } catch(e) {}
  };
  _ws.onclose = function() {
    var dot = document.getElementById('sseDot');
    if (dot) dot.className = 'sseDot';
    setTimeout(connectWS, 2000);
  };
  _ws.onerror = function() { try { _ws.close(); } catch(e) {} };
}
setInterval(function() { if (_ws && _ws.readyState === 1) try { _ws.send('ping'); } catch(e) {} }, 30000);
connectWS();
</script>
</body>
</html>
`;
}
