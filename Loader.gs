/***********************************************************************
 * Loader.gs — THE ONLY FILE IN YOUR GOOGLE APPS SCRIPT PROJECT
 *
 * Everything else is fetched live from GitHub at runtime.
 * When you push changes to GitHub, they go live automatically
 * (after the cache expires, default 1 hour).
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
 *   5. Deploy → New deployment → Web app
 *   6. Run setWebAppUrlAuto() from the editor
 *   7. Run repairSheets() to set up new sheets (DoctorExtra, etc.)
 *   8. Run generateAdminLink() and check the execution log for your admin URL
 *
 * HOW IT WORKS:
 *   - On first call per execution, fetches dist/bundle.gs from GitHub
 *   - bundle.gs contains all .gs code + HTML templates in one file
 *   - The bundle is cached in CacheService for 1 hour (saves GitHub calls)
 *   - Each public function below is a thin proxy to the bundle
 *   - To force-refresh: run clearBundleCache() from the editor
 *
 * TO UPDATE CODE:
 *   - Edit files in src/ on GitHub
 *   - Run build.py to regenerate dist/bundle.gs
 *   - Push to GitHub
 *   - Wait up to 1 hour (or run clearBundleCache() for immediate refresh)
 *   - NO changes needed in this file or the GAS editor!
 ***********************************************************************/

// ===== Configuration =====
var BUNDLE_CACHE_TTL = 3600;  // seconds (1 hour). Max 21600 (6 hours).
var BUNDLE_PATH = 'dist/bundle.gs';
var CHUNK_SIZE = 90000;  // CacheService limit is 100KB per key; leave margin

// ===== Bundle loading =====
var _app = null;
var _htmlTemplates = null;

function _getApp() {
  if (_app) return _app;
  var code = _fetchBundle();
  // eval the bundle - it sets global _BUNDLE and _HTML_TEMPLATES
  eval(code);
  _app = _BUNDLE;
  _htmlTemplates = _HTML_TEMPLATES;
  return _app;
}

function _fetchBundle() {
  var cache = CacheService.getScriptCache();

  // Try reading from chunked cache
  var chunks = [];
  for (var i = 0; i < 20; i++) {
    var chunk = cache.get('_B' + i);
    if (chunk === null) break;
    chunks.push(chunk);
  }
  if (chunks.length > 0) return chunks.join('');

  // Fetch from GitHub
  var props = PropertiesService.getScriptProperties();
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

  // Use GitHub API (more reliable, no CDN caching issues like raw.githubusercontent.com)
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

  var code = response.getContentText();

  // Cache in chunks (CacheService has 100KB per-key limit)
  var cacheObj = {};
  for (var i = 0; i * CHUNK_SIZE < code.length; i++) {
    cacheObj['_B' + i] = code.substr(i * CHUNK_SIZE, CHUNK_SIZE);
  }
  cache.putAll(cacheObj, BUNDLE_CACHE_TTL);

  return code;
}

/**
 * Run this to force-refresh the code from GitHub immediately.
 */
function clearBundleCache() {
  var cache = CacheService.getScriptCache();
  var keys = [];
  for (var i = 0; i < 20; i++) keys.push('_B' + i);
  cache.removeAll(keys);
  _app = null;
  _htmlTemplates = null;
  return { ok: true, message: 'Bundle cache cleared. Next call will fetch fresh code from GitHub.' };
}

/**
 * Test that GitHub connection works. Run this after setting Script Properties.
 */
function testGitHubConnection() {
  try {
    var code = _fetchBundle();
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

  // 2. Check cache state
  var cache = CacheService.getScriptCache();
  var cachedChunks = 0;
  var cachedSize = 0;
  for (var i = 0; i < 20; i++) {
    var chunk = cache.get('_B' + i);
    if (chunk === null) break;
    cachedChunks++;
    cachedSize += chunk.length;
  }
  results.push('Cached chunks: ' + cachedChunks + ' (' + (cachedSize/1024).toFixed(1) + ' KB)');

  // 3. Check if cached bundle has key features
  if (cachedSize > 0) {
    var cached = [];
    for (var j = 0; j < cachedChunks; j++) cached.push(cache.get('_B' + j));
    var cachedCode = cached.join('');
    results.push('Cached bundle has ccBtn (country selector): ' + (cachedCode.indexOf('ccBtn') > -1));
    results.push('Cached bundle has langQuickFlags (language flags): ' + (cachedCode.indexOf('langQuickFlags') > -1));
    results.push('Cached bundle has POPULAR_LANGS: ' + (cachedCode.indexOf('POPULAR_LANGS') > -1));
    results.push('Cached bundle has Lietuvių (Lithuanian): ' + (cachedCode.indexOf('Lietuvių') > -1));
  }

  // 4. Force fresh fetch from GitHub
  results.push('--- Fetching fresh from GitHub ---');
  try {
    // Clear cache first
    var keys = [];
    for (var k = 0; k < 20; k++) keys.push('_B' + k);
    cache.removeAll(keys);

    var freshCode = _fetchBundle();
    results.push('Fresh fetch size: ' + (freshCode.length/1024).toFixed(1) + ' KB');
    results.push('Fresh bundle has ccBtn (country selector): ' + (freshCode.indexOf('ccBtn') > -1));
    results.push('Fresh bundle has langQuickFlags (language flags): ' + (freshCode.indexOf('langQuickFlags') > -1));
    results.push('Fresh bundle has POPULAR_LANGS: ' + (freshCode.indexOf('POPULAR_LANGS') > -1));
    results.push('Fresh bundle has Lietuvių (Lithuanian): ' + (freshCode.indexOf('Lietuvių') > -1));
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
function apiAdminRemoveDoctorOff(s, ri)      { return _getApp().apiAdminRemoveDoctorOff(s, ri); }
function apiAdminRemoveExtraSlots(s, ri)     { return _getApp().apiAdminRemoveExtraSlots(s, ri); }
function apiAdminNotifyPatients(s, p)        { return _getApp().apiAdminNotifyPatients(s, p); }
function apiAdminGetWeekOverview(s, w)       { return _getApp().apiAdminGetWeekOverview(s, w); }
function apiAdminSearchAppointments(s, q)    { return _getApp().apiAdminSearchAppointments(s, q); }
function apiAdminGetSettings(s)              { return _getApp().apiAdminGetSettings(s); }
function apiAdminSaveSettings(s, p)          { return _getApp().apiAdminSaveSettings(s, p); }
function apiAdminGetStatistics(s)            { return _getApp().apiAdminGetStatistics(s); }
function apiAdminMarkAttendance(s, a, d, t)  { return _getApp().apiAdminMarkAttendance(s, a, d, t); }
function apiAdminGetPatientHistory(s, e, p)  { return _getApp().apiAdminGetPatientHistory(s, e, p); }

// ----- Trigger (daily schedule email at 7am) -----
function sendDailyDoctorSchedule_()          { return _getApp()['sendDailyDoctorSchedule_'](); }

// ----- Install / Setup (run from GAS editor) -----
function install()                           { return _getApp().install(); }
function repairSheets()                      { return _getApp().repairSheets(); }
function setWebAppUrl(u)                     { return _getApp().setWebAppUrl(u); }
function setDoctorEmail(e)                   { return _getApp().setDoctorEmail(e); }
function setPottersLocation(t)               { return _getApp().setPottersLocation(t); }
function setSpinolaLocation(t)               { return _getApp().setSpinolaLocation(t); }
function setDoubleCheckCalendar(v)           { return _getApp().setDoubleCheckCalendar(v); }
function setMaxActiveAppointmentsPerPerson(n){ return _getApp().setMaxActiveAppointmentsPerPerson(n); }
function generateAdminLink()                 { return _getApp().generateAdminLink(); }
function setWebAppUrlAuto()                  { return _getApp().setWebAppUrlAuto(); }

// ----- Uninstall (run from GAS editor) -----
function armUninstall()                      { return _getApp().armUninstall(); }
function armUninstallForce()                 { return _getApp().armUninstallForce(); }
function disarmUninstall()                   { return _getApp().disarmUninstall(); }
function uninstallDryRun()                   { return _getApp().uninstallDryRun(); }
function uninstallEverything()               { return _getApp().uninstallEverything(); }
function uninstallKeepCalendar()             { return _getApp().uninstallKeepCalendar(); }
