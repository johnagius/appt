/***************
 * Utils.gs
 ***************/

function pad2_(n) {
  n = String(n);
  return n.length === 1 ? '0' + n : n;
}

function toDateKey_(dateObj) {
  return Utilities.formatDate(dateObj, getTimeZone_(), CFG().APPT_SHEET_DATE_FORMAT);
}

function parseDateKey_(dateKey) {
  var parts = dateKey.split('-');
  if (parts.length !== 3) throw new Error('Invalid dateKey: ' + dateKey);
  var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseTimeToMinutes_(hhmm) {
  var p = hhmm.split(':');
  if (p.length !== 2) throw new Error('Invalid time: ' + hhmm);
  return Number(p[0]) * 60 + Number(p[1]);
}

function minutesToTime_(mins) {
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return pad2_(h) + ':' + pad2_(m);
}

function combineDateAndTime_(dateObj, hhmm) {
  var mins = parseTimeToMinutes_(hhmm);
  var d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  d.setMinutes(mins);
  return d;
}

function addMinutes_(dateObj, minutes) {
  return new Date(dateObj.getTime() + minutes * 60000);
}

function dayOfWeekKey_(dateObj) {
  var dow = dateObj.getDay();
  if (dow === 0) return 'SUN';
  if (dow === 1) return 'MON';
  if (dow === 2) return 'TUE';
  if (dow === 3) return 'WED';
  if (dow === 4) return 'THU';
  if (dow === 5) return 'FRI';
  return 'SAT';
}

function isSunday_(dateObj) {
  return dateObj.getDay() === 0;
}

function todayLocal_() {
  var tz = getTimeZone_();
  var now = new Date();
  var s = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  return parseDateKey_(s);
}

function todayKeyLocal_() {
  return toDateKey_(todayLocal_());
}

function nowMinutesLocal_() {
  var s = Utilities.formatDate(new Date(), getTimeZone_(), 'HH:mm');
  return parseTimeToMinutes_(s);
}

function sanitizePhone_(phone) {
  phone = String(phone || '').trim();
  phone = phone.replace(/\s+/g, ' ');
  return phone;
}

function sanitizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeName_(name) {
  return String(name || '').trim();
}

/**
 * Public holidays / closed days
 */
function isHolidayOrClosed_(dateObj) {
  if (isSunday_(dateObj)) {
    return { closed: true, reason: 'Sunday (Closed)' };
  }

  var y = dateObj.getFullYear();
  var dk = toDateKey_(dateObj);

  var fixed = [
    '01-01', '02-10', '03-19', '03-31', '05-01',
    '06-07', '06-29', '08-15', '09-08', '09-21',
    '12-08', '12-13', '12-25'
  ];

  var mmdd = pad2_(dateObj.getMonth() + 1) + '-' + pad2_(dateObj.getDate());
  if (fixed.indexOf(mmdd) >= 0) {
    return { closed: true, reason: 'Public holiday' };
  }

  var gf = goodFriday_(y);
  if (toDateKey_(gf) === dk) {
    return { closed: true, reason: 'Good Friday' };
  }

  return { closed: false, reason: '' };
}

function easterSunday_(year) {
  var a = year % 19;
  var b = Math.floor(year / 100);
  var c = year % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31);
  var day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function goodFriday_(year) {
  var easter = easterSunday_(year);
  return addMinutes_(easter, -2 * 24 * 60);
}

function inAdvanceWindow_(dateObj) {
  var today = todayLocal_();
  var max = addMinutes_(today, CFG().ADVANCE_DAYS * 24 * 60);
  return dateObj.getTime() >= today.getTime() && dateObj.getTime() <= max.getTime();
}

/**
 * Build slots for a date from normal working hours + optional extra windows.
 * Extra windows come from DoctorExtra sheet (doctor adding more hours).
 */
function buildSlotsForDate_(dateObj, extraWindows) {
  var dowKey = dayOfWeekKey_(dateObj);
  var windows = (CFG().HOURS[dowKey] || []).slice();

  if (extraWindows && extraWindows.length) {
    for (var i = 0; i < extraWindows.length; i++) {
      windows.push(extraWindows[i]);
    }
  }

  windows.sort(function(a, b) {
    return parseTimeToMinutes_(a.start) - parseTimeToMinutes_(b.start);
  });

  var slots = [];
  var dur = CFG().APPT_DURATION_MIN;
  var usedMinutes = {};

  for (var w = 0; w < windows.length; w++) {
    var startMin = parseTimeToMinutes_(windows[w].start);
    var endMin = parseTimeToMinutes_(windows[w].end);

    for (var m = startMin; m + dur <= endMin; m += dur) {
      if (!usedMinutes[m]) {
        usedMinutes[m] = true;
        slots.push({ start: minutesToTime_(m), end: minutesToTime_(m + dur) });
      }
    }
  }

  slots.sort(function(a, b) {
    return parseTimeToMinutes_(a.start) - parseTimeToMinutes_(b.start);
  });

  return slots;
}

/***************
 * Signing helpers for email links
 ***************/

function computeSig_(payloadString) {
  payloadString = String(payloadString || '');
  var secret = getOrCreateSigningSecret_();
  var raw = Utilities.computeHmacSha256Signature(payloadString, secret);
  return Utilities.base64EncodeWebSafe(raw);
}

function safeEqual_(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (a.length !== b.length) return false;
  var res = 0;
  for (var i = 0; i < a.length; i++) {
    res |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return res === 0;
}

function verifyCancelSig_(token, sig) {
  token = String(token || '').trim();
  sig = String(sig || '').trim();
  if (!token || !sig) return false;

  var candidates = [
    token,
    'cancel|' + token,
    'mode=cancel&token=' + token
  ];

  for (var i = 0; i < candidates.length; i++) {
    var expected = computeSig_(candidates[i]);
    if (safeEqual_(expected, sig)) return true;
  }
  return false;
}

function verifyDocActionSig_(token, act, sig) {
  token = String(token || '').trim();
  act = String(act || '').trim();
  sig = String(sig || '').trim();
  if (!token || !act || !sig) return false;

  var candidates = [
    token + '|' + act,
    'docAction|' + token + '|' + act
  ];

  for (var i = 0; i < candidates.length; i++) {
    var expected = computeSig_(candidates[i]);
    if (safeEqual_(expected, sig)) return true;
  }
  return false;
}

/***************
 * Admin signing helpers
 ***************/

function computeAdminSig_() {
  var secret = getOrCreateAdminSecret_();
  var raw = Utilities.computeHmacSha256Signature('admin_access', secret);
  return Utilities.base64EncodeWebSafe(raw);
}

function verifyAdminSig_(sig) {
  sig = String(sig || '').trim();
  if (!sig) return false;
  var expected = computeAdminSig_();
  return safeEqual_(expected, sig);
}

function buildAdminLink_() {
  var base = getWebAppUrl_();
  var sig = computeAdminSig_();
  return base + '?mode=admin&sig=' + encodeURIComponent(sig);
}

function getWebAppUrl_() {
  var props = getScriptProps_();
  var url = String(props.getProperty(CFG().PROP_WEBAPP_URL) || '').trim();

  if (!url) {
    try {
      var auto = ScriptApp.getService().getUrl();
      auto = String(auto || '').trim();
      if (auto) {
        props.setProperty(CFG().PROP_WEBAPP_URL, auto);
        url = auto;
      }
    } catch (e) {}
  }

  if (!url) {
    throw new Error(
      'WEBAPP_URL not set. Deploy as Web app (not test) and then run setWebAppUrlAuto() or set it in Script Properties.'
    );
  }

  return url;
}
