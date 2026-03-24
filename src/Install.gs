/***************
 * Install.gs
 ***************/

function install() {
  var props = getScriptProps_();

  if (!props.getProperty(CFG().PROP_TIMEZONE)) {
    props.setProperty(CFG().PROP_TIMEZONE, 'Europe/Malta');
  }

  getOrCreateSigningSecret_();
  getOrCreateAdminSecret_();

  // Create or reuse spreadsheets
  var configId = props.getProperty(CFG().PROP_CONFIG_SSID);
  var apptsId = props.getProperty(CFG().PROP_APPTS_SSID);

  if (!configId) {
    var ss1 = SpreadsheetApp.create('Kevin Booking - CONFIG');
    configId = ss1.getId();
    props.setProperty(CFG().PROP_CONFIG_SSID, configId);
  }
  if (!apptsId) {
    var ss2 = SpreadsheetApp.create('Kevin Booking - APPOINTMENTS');
    apptsId = ss2.getId();
    props.setProperty(CFG().PROP_APPTS_SSID, apptsId);
  }

  ensureConfigSheets_();
  ensureDefaultConfigProperties_();
  ensureCalendar_();
  ensureTriggers_();

  var adminLink = '';
  try { adminLink = buildAdminLink_(); } catch (e) {}

  return {
    ok: true,
    configSpreadsheetId: configId,
    appointmentsSpreadsheetId: apptsId,
    calendarId: getScriptProps_().getProperty(CFG().PROP_CALENDAR_ID),
    timezone: getTimeZone_(),
    adminLink: adminLink
  };
}

function ensureDefaultConfigProperties_() {
  var props = getScriptProps_();

  if (!props.getProperty(CFG().PROP_DOCTOR_EMAIL)) {
    props.setProperty(CFG().PROP_DOCTOR_EMAIL, '');
  }
  if (!props.getProperty(CFG().PROP_POTTERS_LOCATION)) {
    props.setProperty(CFG().PROP_POTTERS_LOCATION, "Potter's Pharmacy Clinic");
  }
  if (!props.getProperty(CFG().PROP_SPINOLA_LOCATION)) {
    props.setProperty(CFG().PROP_SPINOLA_LOCATION, 'Spinola Clinic');
  }

  // Calendar double-check ON prevents stale "free slots"
  if (!props.getProperty(CFG().PROP_DOUBLECHECK_CALENDAR)) {
    props.setProperty(CFG().PROP_DOUBLECHECK_CALENDAR, 'true');
  }

  // NEW: allow multiple appointments; optional cap
  // Default 0 = unlimited
  if (!props.getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON)) {
    props.setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, '0');
  }
}

function ensureSheetHeader_(sheet, headers) {
  sheet.setFrozenRows(1);

  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var mismatch = false;

  for (var i = 0; i < headers.length; i++) {
    if (String(existing[i] || '').trim() !== String(headers[i]).trim()) {
      mismatch = true;
      break;
    }
  }

  if (mismatch) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function ensureConfigSheets_() {
  var configSs = SpreadsheetApp.openById(getScriptProps_().getProperty(CFG().PROP_CONFIG_SSID));

  var clients = configSs.getSheetByName(CFG().SHEET_CLIENTS);
  if (!clients) clients = configSs.insertSheet(CFG().SHEET_CLIENTS);

  ensureSheetHeader_(clients, [
    'ClientId', 'FullName', 'Email', 'Phone', 'CreatedAt', 'LastUpdated'
  ]);

  // Force text formatting (prevents phone corruption)
  clients.getRange(1, 1, clients.getMaxRows(), 6).setNumberFormat('@');

  var off = configSs.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!off) off = configSs.insertSheet(CFG().SHEET_DOCTOR_OFF);

  // NEW DoctorOff format (ranges + optional time windows)
  ensureSheetHeader_(off, [
    'StartDate(yyyy-MM-dd)',
    'EndDate(yyyy-MM-dd)',
    'StartTime(HH:mm)',
    'EndTime(HH:mm)',
    'Reason'
  ]);

  off.getRange(1, 1, off.getMaxRows(), 5).setNumberFormat('@');

  // DoctorExtra sheet (extra time slots the doctor adds)
  var extra = configSs.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!extra) extra = configSs.insertSheet(CFG().SHEET_DOCTOR_EXTRA);

  ensureSheetHeader_(extra, [
    'Date(yyyy-MM-dd)',
    'StartTime(HH:mm)',
    'EndTime(HH:mm)',
    'Reason'
  ]);

  extra.getRange(1, 1, extra.getMaxRows(), 4).setNumberFormat('@');
}


function ensureCalendar_() {
  var props = getScriptProps_();
  var calId = props.getProperty(CFG().PROP_CALENDAR_ID);
  var calName = 'KevinAppts';

  if (calId) {
    try {
      CalendarApp.getCalendarById(calId).getName();
      return;
    } catch (e) {}
  }

  var cals = CalendarApp.getCalendarsByName(calName);
  var cal;
  if (cals && cals.length > 0) {
    cal = cals[0];
  } else {
    cal = CalendarApp.createCalendar(calName);
  }
  props.setProperty(CFG().PROP_CALENDAR_ID, cal.getId());
}

function ensureTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    if (t.getHandlerFunction && t.getHandlerFunction() === 'sendDailyDoctorSchedule_') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('sendDailyDoctorSchedule_')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}

/**
 * SAFE: run once after you update code.
 * - Does NOT clear data
 * - Fixes formatting issues (phone/email becoming numbers)
 * - Applies text formatting to existing day tabs in appointments spreadsheet
 */
function repairSheets() {
  ensureConfigSheets_();

  var apptSs = SpreadsheetApp.openById(getScriptProps_().getProperty(CFG().PROP_APPTS_SSID));
  var sheets = apptSs.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (/^\d{4}-\d{2}-\d{2}$/.test(name)) {
      sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
      sh.setFrozenRows(1);
    }
  }

  return { ok: true };
}

/***************
 * Convenience setters
 ***************/
function setWebAppUrl(url) {
  if (!url || typeof url !== 'string') throw new Error('Missing url');
  getScriptProps_().setProperty(CFG().PROP_WEBAPP_URL, url);
  return { ok: true, webAppUrl: url };
}

function setDoctorEmail(email) {
  if (!email || typeof email !== 'string') throw new Error('Missing email');
  getScriptProps_().setProperty(CFG().PROP_DOCTOR_EMAIL, email.trim());
  return { ok: true, doctorEmail: email.trim() };
}

function setPottersLocation(text) {
  if (!text || typeof text !== 'string') throw new Error('Missing location');
  getScriptProps_().setProperty(CFG().PROP_POTTERS_LOCATION, text.trim());
  return { ok: true, pottersLocation: text.trim() };
}

function setSpinolaLocation(text) {
  if (!text || typeof text !== 'string') throw new Error('Missing location');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_LOCATION, text.trim());
  return { ok: true, spinolaLocation: text.trim() };
}

/**
 * Run this from the GAS editor to configure Spinola Clinic.
 * (The editor Run button can't pass arguments, so IDs are hardcoded here.)
 */
function setupSpinola() {
  var calId = '28e57ccf7bdb512322b38bc751b3903ab95c7a3ad7d9dc17cdeac2f0273ceab5@group.calendar.google.com';
  var ssId  = '18aCZuV0GAL8yJPXEKblAJwH9DqAUKvZeWeQW8V9ChP4';

  setSpinolaCalendarId(calId);
  setSpinolaSpreadsheetId(ssId);

  Logger.log('Spinola Calendar ID set: ' + calId);
  Logger.log('Spinola Spreadsheet ID set: ' + ssId);
  return { ok: true, calendarId: calId, spreadsheetId: ssId };
}

function setSpinolaCalendarId(id) {
  if (!id || typeof id !== 'string') throw new Error('Missing calendar ID');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_CALENDAR_ID, id.trim());
  return { ok: true, spinolaCalendarId: id.trim() };
}

function setSpinolaSpreadsheetId(id) {
  if (!id || typeof id !== 'string') throw new Error('Missing spreadsheet ID');
  getScriptProps_().setProperty(CFG().PROP_SPINOLA_APPTS_SSID, id.trim());
  return { ok: true, spinolaSpreadsheetId: id.trim() };
}

function setDoubleCheckCalendar(enabled) {
  getScriptProps_().setProperty(CFG().PROP_DOUBLECHECK_CALENDAR, String(!!enabled));
  return { ok: true, doubleCheckCalendar: String(!!enabled) };
}

/**
 * NEW: cap active appointments per person in next 7 days
 * 0 = unlimited (recommended)
 */
function setMaxActiveAppointmentsPerPerson(n) {
  if (n === null || n === undefined || n === '') throw new Error('Missing number');
  var v = Number(n);
  if (isNaN(v) || v < 0) throw new Error('Invalid number. Use 0 for unlimited.');
  getScriptProps_().setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, String(Math.floor(v)));
  return { ok: true, MAX_ACTIVE_APPTS_PER_PERSON: String(Math.floor(v)) };
}

/**
 * Generate and return the admin panel URL.
 * Run this after install() and setWebAppUrlAuto() to get your admin bookmark.
 */
function generateAdminLink() {
  var link = buildAdminLink_();
  Logger.log('=== ADMIN LINK ===');
  Logger.log(link);
  Logger.log('==================');
  return { ok: true, adminLink: link };
}

function generateDoctorLink() {
  var base = getWebAppUrl_();
  var sig = computeAdminSig_();
  var link = base + '?mode=doctor&sig=' + encodeURIComponent(sig);
  Logger.log('=== DOCTOR LINK ===');
  Logger.log(link);
  Logger.log('===================');
  return { ok: true, doctorLink: link };
}

function setWebAppUrlAuto() {
  var auto = ScriptApp.getService().getUrl();
  auto = String(auto || '').trim();
  if (!auto) {
    throw new Error(
      'No Web App URL detected. Deploy: Deploy → New deployment → Web app, then run setWebAppUrlAuto() again.'
    );
  }
  getScriptProps_().setProperty(CFG().PROP_WEBAPP_URL, auto);
  Logger.log('Web App URL set to: ' + auto);
  return { ok: true, WEBAPP_URL: auto };
}

