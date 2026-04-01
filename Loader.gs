/***********************************************************************
 * Loader.gs — THE ONLY FILE IN YOUR GOOGLE APPS SCRIPT PROJECT
 *
 * Everything else is stored in Script Properties (permanent) and
 * refreshed from GitHub only when you run clearBundleCache().
 *
 * SETUP (one-time):
 *   1. Create a new Apps Script project
 *   2. Paste this entire file as the only Code.gs (or Loader.gs)
 *   3. Set Script Properties (Project Settings → Script properties):
 *        GITHUB_OWNER   = johnagius
 *        GITHUB_REPO    = appt
 *        GITHUB_BRANCH  = main
 *      (optional, if repo is private):
 *        GITHUB_TOKEN   = ghp_your_personal_access_token
 *   4. Also copy these Script Properties from your OLD project:
 *        CONFIG_SPREADSHEET_ID
 *        APPOINTMENTS_SPREADSHEET_ID
 *        KEVINAPPTS_CALENDAR_ID
 *        DOCTOR_EMAIL
 *        SIGNING_SECRET
 *        TIMEZONE
 *        POTTERS_LOCATION
 *        SPINOLA_LOCATION
 *        DOUBLECHECK_CALENDAR
 *        SPINOLA_CALENDAR_ID
 *        SPINOLA_APPOINTMENTS_SPREADSHEET_ID
 *   5. Deploy → New deployment → Web app
 *   6. Run setWebAppUrlAuto() from the editor
 *   7. Run repairSheets() to set up new sheets (DoctorExtra, etc.)
 *   8. Run generateAdminLink() and check the execution log for your admin URL
 *   9. Run generateDoctorLink() for the simplified doctor schedule page URL
 *
 * HOW IT WORKS:
 *   - The bundle is stored permanently in Script Properties (never expires)
 *   - A fast CacheService layer avoids reassembling chunks on every call
 *   - GitHub is ONLY contacted when you run clearBundleCache()
 *   - Zero GitHub API calls during normal operation = no rate limits
 *
 * TO UPDATE CODE:
 *   - Edit files in src/ on GitHub
 *   - Run build.py to regenerate dist/bundle.gs
 *   - Push to GitHub
 *   - Run clearBundleCache() from the editor (fetches once, stores permanently)
 *   - NO other changes needed!
 ***********************************************************************/

// ===== Configuration =====
var CACHE_TTL = 21600;  // CacheService TTL in seconds (6 hours max). Just a fast read layer.
var BUNDLE_PATH = 'dist/bundle.gs';
var CHUNK_SIZE = 90000;  // CacheService limit is 100KB per key; leave margin

// ===== Persistent storage in Script Properties =====
var SP_CHUNK_SIZE = 8000;  // Script Properties limit is 9KB per key; leave margin
var SP_PREFIX = '_SB';

// ===== Bundle loading =====
var _app = null;
var _htmlTemplates = null;

function _getApp() {
  if (_app) return _app;
  var code = _loadBundle();
  // eval the bundle - it sets global _BUNDLE and _HTML_TEMPLATES
  eval(code);
  _app = _BUNDLE;
  _htmlTemplates = _HTML_TEMPLATES;
  return _app;
}

function _loadBundle() {
  // Layer 1: CacheService (fast, but expires)
  var cache = CacheService.getScriptCache();
  var chunks = [];
  for (var i = 0; i < 20; i++) {
    var chunk = cache.get('_B' + i);
    if (chunk === null) break;
    chunks.push(chunk);
  }
  if (chunks.length > 0) return chunks.join('');

  // Layer 2: Script Properties (permanent, survives everything)
  var props = PropertiesService.getScriptProperties();
  var code = _readStoredBundle(props);

  if (code) {
    // Repopulate CacheService for fast reads
    _writeCache(cache, code);
    return code;
  }

  // Layer 3: First-time setup — fetch from GitHub and store permanently
  code = _fetchFromGitHub(props);
  _writeStoredBundle(props, code);
  _writeCache(cache, code);
  return code;
}

function _writeCache(cache, code) {
  var cacheObj = {};
  for (var i = 0; i * CHUNK_SIZE < code.length; i++) {
    cacheObj['_B' + i] = code.substr(i * CHUNK_SIZE, CHUNK_SIZE);
  }
  cache.putAll(cacheObj, CACHE_TTL);
}

function _fetchFromGitHub(props) {
  if (!props) props = PropertiesService.getScriptProperties();
  var owner = props.getProperty('GITHUB_OWNER') || '';
  var repo = props.getProperty('GITHUB_REPO') || '';
  var branch = props.getProperty('GITHUB_BRANCH') || 'main';
  var token = props.getProperty('GITHUB_TOKEN') || '';

  if (!owner || !repo) {
    throw new Error(
      'Loader: Set GITHUB_OWNER and GITHUB_REPO in Script Properties. '
      + 'See setup instructions in Loader.gs comments.'
    );
  }

  var url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + BUNDLE_PATH + '?ref=' + branch;

  var options = { muteHttpExceptions: true, headers: { 'Accept': 'application/vnd.github.v3.raw', 'User-Agent': 'GAS-Loader' } };
  if (token) {
    options.headers['Authorization'] = 'token ' + token;
  }

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error(
      'Loader: Failed to fetch bundle from GitHub (HTTP ' + response.getResponseCode() + '). '
      + 'URL: ' + url
    );
  }

  return response.getContentText();
}

function _writeStoredBundle(props, code) {
  var obj = {};
  var numChunks = Math.ceil(code.length / SP_CHUNK_SIZE);
  for (var i = 0; i < numChunks; i++) {
    obj[SP_PREFIX + i] = code.substr(i * SP_CHUNK_SIZE, SP_CHUNK_SIZE);
  }
  obj[SP_PREFIX + '_N'] = String(numChunks);
  // Clear any old extra chunks
  for (var j = numChunks; j < 200; j++) {
    var old = props.getProperty(SP_PREFIX + j);
    if (old === null) break;
    props.deleteProperty(SP_PREFIX + j);
  }
  props.setProperties(obj);
}

function _readStoredBundle(props) {
  var n = parseInt(props.getProperty(SP_PREFIX + '_N') || '0', 10);
  if (!n) return null;
  var chunks = [];
  for (var i = 0; i < n; i++) {
    var chunk = props.getProperty(SP_PREFIX + i);
    if (chunk === null) return null;
    chunks.push(chunk);
  }
  return chunks.join('');
}

/**
 * Run this after pushing code changes to GitHub.
 * Fetches fresh bundle from GitHub, stores it permanently, and refreshes the cache.
 */
function clearBundleCache() {
  var cache = CacheService.getScriptCache();
  var keys = [];
  for (var i = 0; i < 20; i++) keys.push('_B' + i);
  cache.removeAll(keys);
  _app = null;
  _htmlTemplates = null;

  var props = PropertiesService.getScriptProperties();
  var code = _fetchFromGitHub(props);
  _writeStoredBundle(props, code);
  _writeCache(cache, code);

  return { ok: true, message: 'Bundle updated (' + (code.length / 1024).toFixed(1) + ' KB). Changes are now live.' };
}

/**
 * Test that GitHub connection works. Run this after setting Script Properties.
 */
function testGitHubConnection() {
  try {
    var code = _fetchFromGitHub();
    return {
      ok: true,
      message: 'Connected! Bundle fetched (' + (code.length / 1024).toFixed(1) + ' KB).'
    };
  } catch (e) {
    return { ok: false, message: 'Failed: ' + e.message };
  }
}

/**
 * Run this to diagnose issues. Check the Execution Log after running.
 */
function diagnoseBundleIssues() {
  var results = [];

  // 1. Check script properties
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty('GITHUB_OWNER') || '(not set)';
  var repo = props.getProperty('GITHUB_REPO') || '(not set)';
  var branch = props.getProperty('GITHUB_BRANCH') || 'main (default)';
  results.push('GITHUB_OWNER: ' + owner);
  results.push('GITHUB_REPO: ' + repo);
  results.push('GITHUB_BRANCH: ' + branch);

  // 2. Check stored bundle
  var stored = _readStoredBundle(props);
  var storedN = parseInt(props.getProperty(SP_PREFIX + '_N') || '0', 10);
  results.push('Stored bundle: ' + (stored ? (stored.length / 1024).toFixed(1) + ' KB in ' + storedN + ' chunks' : 'NOT STORED'));

  // 3. Check cache state
  var cache = CacheService.getScriptCache();
  var cachedChunks = 0;
  var cachedSize = 0;
  for (var i = 0; i < 20; i++) {
    var chunk = cache.get('_B' + i);
    if (chunk === null) break;
    cachedChunks++;
    cachedSize += chunk.length;
  }
  results.push('Cache: ' + cachedChunks + ' chunks (' + (cachedSize/1024).toFixed(1) + ' KB)');

  // 4. Try fresh fetch from GitHub
  results.push('--- Fetching fresh from GitHub ---');
  try {
    var freshCode = _fetchFromGitHub(props);
    results.push('Fresh fetch: ' + (freshCode.length/1024).toFixed(1) + ' KB');
  } catch(e) {
    results.push('FETCH ERROR: ' + e.message);
  }

  var output = results.join('\n');
  Logger.log(output);
  return output;
}


// ==========================================================================
// PROXY FUNCTIONS — these are the real GAS entry points.
// Each one loads the bundle (cached) and delegates to the real implementation.
// ==========================================================================

// ----- Web App -----
function doGet(e)                            { return _getApp().doGet(e); }

// ----- Booking API (called from Index.html via google.script.run) -----
function apiInit()                           { return _getApp().apiInit(); }
function apiGetDateOptions(m)                { return _getApp().apiGetDateOptions(m); }
function apiRefreshDates()                   { return _getApp().apiRefreshDates(); }
function apiGetAvailability(dk)              { return _getApp().apiGetAvailability(dk); }
function apiBook(p)                          { return _getApp().apiBook(p); }
function apiGetSpinolaAvailability(dk)       { return _getApp().apiGetSpinolaAvailability(dk); }
function apiBookSpinola(p)                   { return _getApp().apiBookSpinola(p); }

// ----- Polling (called from Admin.html via google.script.run) -----
function apiPoll()                           { return _getApp().apiPoll(); }

// ----- Cancel API (called from Cancel.html) -----
function apiGetCancelInfo(t, s)              { return _getApp().apiGetCancelInfo(t, s); }
function apiCancelAppointment(t, s)          { return _getApp().apiCancelAppointment(t, s); }

// ----- Doctor Action API (called from DocAction.html) -----
function apiDoctorAction(t, a, s)            { return _getApp().apiDoctorAction(t, a, s); }

// ----- Admin API (called from Admin.html) -----
function apiAdminGetDashboard(s)             { return _getApp().apiAdminGetDashboard(s); }
function apiAdminGetDateAppointments(s, dk)  { return _getApp().apiAdminGetDateAppointments(s, dk); }
function apiAdminMarkDoctorOff(s, p)         { return _getApp().apiAdminMarkDoctorOff(s, p); }
function apiAdminAddExtraSlots(s, p)         { return _getApp().apiAdminAddExtraSlots(s, p); }
function apiAdminProcessAppointments(s, p)   { return _getApp().apiAdminProcessAppointments(s, p); }
function apiAdminSetDoctorOffDates(s, p)     { return _getApp().apiAdminSetDoctorOffDates(s, p); }
function apiAdminRemoveDoctorOff(s, ri)      { return _getApp().apiAdminRemoveDoctorOff(s, ri); }
function apiAdminRemoveExtraSlots(s, ri)     { return _getApp().apiAdminRemoveExtraSlots(s, ri); }
function apiAdminNotifyPatients(s, p)        { return _getApp().apiAdminNotifyPatients(s, p); }
function apiAdminGetReviewPatients(s)        { return _getApp().apiAdminGetReviewPatients(s); }
function apiAdminSendReviewRequests(s, p)    { return _getApp().apiAdminSendReviewRequests(s, p); }
function apiAdminGetWeekOverview(s, w)       { return _getApp().apiAdminGetWeekOverview(s, w); }
function apiAdminSearchAppointments(s, q)    { return _getApp().apiAdminSearchAppointments(s, q); }
function apiAdminGetSettings(s)              { return _getApp().apiAdminGetSettings(s); }
function apiAdminSaveSettings(s, p)          { return _getApp().apiAdminSaveSettings(s, p); }
function apiAdminGetStatistics(s)            { return _getApp().apiAdminGetStatistics(s); }
function apiAdminMarkAttendance(s, a, d, t)  { return _getApp().apiAdminMarkAttendance(s, a, d, t); }
function apiAdminGetPatientHistory(s, e, p)  { return _getApp().apiAdminGetPatientHistory(s, e, p); }
function apiAdminArchiveOldSheets(s)         { return _getApp().apiAdminArchiveOldSheets(s); }

// ----- Trigger (daily schedule email at 7am) -----
function sendDailyDoctorSchedule_()          { return _getApp()['sendDailyDoctorSchedule_'](); }

// ----- Install / Setup (run from GAS editor) -----
function install()                           { return _getApp().install(); }
function repairSheets()                      { return _getApp().repairSheets(); }
function setWebAppUrl(u)                     { return _getApp().setWebAppUrl(u); }
function setDoctorEmail(e)                   { return _getApp().setDoctorEmail(e); }
function setPottersLocation(t)               { return _getApp().setPottersLocation(t); }
function setSpinolaLocation(t)               { return _getApp().setSpinolaLocation(t); }
function setupSpinola()                      { return _getApp().setupSpinola(); }
function setSpinolaCalendarId(id)            { return _getApp().setSpinolaCalendarId(id); }
function setSpinolaSpreadsheetId(id)         { return _getApp().setSpinolaSpreadsheetId(id); }
function setDoubleCheckCalendar(v)           { return _getApp().setDoubleCheckCalendar(v); }
function setMaxActiveAppointmentsPerPerson(n){ return _getApp().setMaxActiveAppointmentsPerPerson(n); }
function generateAdminLink()                 { return _getApp().generateAdminLink(); }
function generateDoctorLink()                { return _getApp().generateDoctorLink(); }
function setWebAppUrlAuto()                  { return _getApp().setWebAppUrlAuto(); }

// ----- Uninstall (run from GAS editor) -----
function armUninstall()                      { return _getApp().armUninstall(); }
function armUninstallForce()                 { return _getApp().armUninstallForce(); }
function disarmUninstall()                   { return _getApp().disarmUninstall(); }
function uninstallDryRun()                   { return _getApp().uninstallDryRun(); }
function uninstallEverything()               { return _getApp().uninstallEverything(); }
function uninstallKeepCalendar()             { return _getApp().uninstallKeepCalendar(); }
