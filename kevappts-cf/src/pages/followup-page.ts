export function followupPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>How are you feeling?</title>
  <style>
    :root{--bg:#f6f7fb;--card:#ffffff;--muted:#6b7280;--text:#111827;--accent:#f5b301;--line:#e5e7eb;--good:#10b981;--blue:#3b82f6;--bad:#ef4444;--shadow:0 10px 30px rgba(17,24,39,0.08);--radius:18px;}
    *{box-sizing:border-box;}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text);font-size:15px;}
    .wrap{max-width:520px;margin:24px auto;padding:0 14px 30px 14px;}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid rgba(229,231,235,0.9);padding:22px;text-align:center;}
    h1{margin:0 0 8px 0;font-size:20px;font-weight:900;}
    p{margin:0 0 14px 0;color:var(--muted);font-size:15px;line-height:1.5;}
    .emoji{font-size:48px;margin-bottom:14px;}
    textarea{width:100%;padding:12px;border-radius:14px;border:1.5px solid var(--line);font-size:15px;font-family:inherit;resize:vertical;min-height:100px;margin-bottom:12px;}
    textarea:focus{outline:none;border-color:var(--blue);}
    .btn{border:none;border-radius:999px;padding:14px 24px;font-weight:750;cursor:pointer;font-size:15px;width:100%;transition:transform 0.12s;}
    .btn:active{transform:scale(0.97);}
    .btn-green{background:var(--good);color:#fff;}
    .btn-blue{background:var(--blue);color:#fff;}
    .btn-accent{background:var(--accent);color:#fff;}
    .btn-ghost{background:#f3f4f6;color:var(--text);margin-top:8px;}
    .msg{margin-top:14px;padding:14px;border-radius:14px;font-size:14px;line-height:1.45;display:none;}
    .msg.good{display:block;background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;}
    .review-box{margin-top:18px;padding:18px;border-radius:16px;background:#eff6ff;border:1px solid #dbeafe;display:none;}
    .review-box h3{margin:0 0 8px 0;font-size:16px;font-weight:800;color:#1e40af;}
    .review-box p{color:#1e40af;font-size:13px;}
    .review-btn{display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:15px;}
    .hidden{display:none;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <!-- Great response -->
      <div id="viewGreat" class="hidden">
        <div class="emoji">\u2728</div>
        <h1>Wonderful to hear!</h1>
        <p>We're glad you're feeling well. Thank you for visiting us.</p>
        <div class="msg good">Your response has been recorded. Thank you!</div>
        <div id="reviewBox" class="review-box">
          <h3>One small favour?</h3>
          <p>If you have a moment, a quick Google review would mean the world to the team.</p>
          <a id="reviewLink" href="#" class="review-btn" target="_blank">Leave a Review</a>
        </div>
      </div>

      <!-- Question form -->
      <div id="viewQuestion" class="hidden">
        <div class="emoji">\ud83d\udcac</div>
        <h1>What's on your mind?</h1>
        <p>Type your question below and the doctor will get back to you.</p>
        <textarea id="questionText" placeholder="Your question..."></textarea>
        <button class="btn btn-blue" onclick="submitQuestion()">Send Question</button>
        <div id="questionMsg" class="msg"></div>
      </div>

      <!-- Question sent confirmation -->
      <div id="viewQuestionSent" class="hidden">
        <div class="emoji">\u2705</div>
        <h1>Question sent!</h1>
        <p>The doctor will review your question and get back to you. If it's urgent, please call the clinic directly.</p>
      </div>

      <!-- Rebook redirect -->
      <div id="viewRebook" class="hidden">
        <div class="emoji">\ud83d\udcc5</div>
        <h1>Let's get you booked</h1>
        <p>Redirecting you to the booking page...</p>
      </div>

      <!-- Loading -->
      <div id="viewLoading">
        <p>Loading...</p>
      </div>

      <!-- Error -->
      <div id="viewError" class="hidden">
        <div class="emoji">\u26a0\ufe0f</div>
        <h1>Something went wrong</h1>
        <p id="errorText">Unable to process your response.</p>
      </div>
    </div>
  </div>
  <script>
    var params = new URLSearchParams(location.search);
    var ID = params.get('id') || '';
    var SIG = params.get('sig') || '';
    var RESPONSE = params.get('r') || '';

    async function init() {
      if (!ID || !SIG || !RESPONSE) { showView('viewError'); return; }

      if (RESPONSE === 'rebook') {
        // Record response then redirect to booking page
        showView('viewRebook');
        try {
          await fetch('/api/followup-response', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: ID, sig: SIG, response: 'rebook' })
          });
        } catch(e) {}
        setTimeout(function() { window.location.href = '/'; }, 1500);
        return;
      }

      if (RESPONSE === 'great') {
        try {
          var res = await fetch('/api/followup-response', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: ID, sig: SIG, response: 'great' })
          });
          var data = await res.json();
          showView('viewGreat');
          if (data.reviewUrl) {
            document.getElementById('reviewBox').style.display = 'block';
            document.getElementById('reviewLink').href = data.reviewUrl;
          }
        } catch(e) {
          showView('viewGreat');
        }
        return;
      }

      if (RESPONSE === 'question') {
        showView('viewQuestion');
        return;
      }

      showView('viewError');
    }

    async function submitQuestion() {
      var text = document.getElementById('questionText').value.trim();
      if (!text) {
        var msg = document.getElementById('questionMsg');
        msg.style.display = 'block';
        msg.style.background = '#fee2e2';
        msg.style.color = '#991b1b';
        msg.style.border = '1px solid #fecaca';
        msg.textContent = 'Please type your question before sending.';
        return;
      }
      try {
        await fetch('/api/followup-response', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ id: ID, sig: SIG, response: 'question', text: text })
        });
      } catch(e) {}
      showView('viewQuestionSent');
    }

    function showView(id) {
      var views = ['viewGreat','viewQuestion','viewQuestionSent','viewRebook','viewLoading','viewError'];
      for (var i = 0; i < views.length; i++) {
        document.getElementById(views[i]).classList.add('hidden');
      }
      document.getElementById(id).classList.remove('hidden');
    }

    init();
  </script>
</body>
</html>`;
}
