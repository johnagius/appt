/***************
 * Loader.gs - GitHub Code Sync for Google Apps Script
 *
 * Google Apps Script does not support true dynamic code loading at runtime
 * (eval'd functions don't register for google.script.run or triggers).
 *
 * Instead, this loader syncs code FROM GitHub INTO your GAS project.
 * Run syncFromGitHub() to pull the latest code from your repo.
 *
 * SETUP:
 * 1. Enable the Apps Script API: https://script.google.com/home/usersettings
 * 2. Enable "Google Apps Script API" in your GCP project
 * 3. Set Script Properties:
 *    - GITHUB_OWNER: your GitHub username or org (e.g. 'johnagius')
 *    - GITHUB_REPO: your repository name (e.g. 'appt')
 *    - GITHUB_BRANCH: branch to load from (e.g. 'main')
 *    - GITHUB_PATH: path prefix in repo (e.g. 'src')
 *    - SCRIPT_ID: your Apps Script project ID (from Project Settings)
 *
 * 4. If your repo is private, also set:
 *    - GITHUB_TOKEN: a personal access token with repo read access
 *
 * USAGE:
 * - Run syncFromGitHub() manually or set up a time trigger
 * - After sync, create a new deployment to go live
 *
 * ALTERNATIVE (recommended for simplicity):
 * - Use the build.py script in the repo to generate KevAppts.json
 * - Push via clasp: `clasp push`
 * - This keeps your GAS project in sync with GitHub automatically
 ***************/

/**
 * Fetch a raw file from GitHub.
 */
function fetchGitHubFile_(fileName) {
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty('GITHUB_OWNER') || '';
  var repo = props.getProperty('GITHUB_REPO') || '';
  var branch = props.getProperty('GITHUB_BRANCH') || 'main';
  var path = props.getProperty('GITHUB_PATH') || 'src';
  var token = props.getProperty('GITHUB_TOKEN') || '';

  if (!owner || !repo) {
    throw new Error('Set GITHUB_OWNER and GITHUB_REPO in Script Properties.');
  }

  var url = 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/' + path + '/' + fileName;

  var options = { muteHttpExceptions: true };
  if (token) {
    options.headers = { 'Authorization': 'token ' + token };
  }

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error('Failed to fetch ' + fileName + ' (HTTP ' + response.getResponseCode() + ')');
  }

  return response.getContentText();
}

/**
 * Check which files have changed by comparing GitHub content with current project.
 * Returns a report without making changes.
 */
function checkForUpdates() {
  var files = [
    { name: 'Config', type: 'server_js', src: 'Config.gs' },
    { name: 'Utils', type: 'server_js', src: 'Utils.gs' },
    { name: 'Data', type: 'server_js', src: 'Data.gs' },
    { name: 'CalendarService', type: 'server_js', src: 'CalendarService.gs' },
    { name: 'EmailService', type: 'server_js', src: 'EmailService.gs' },
    { name: 'WebApp', type: 'server_js', src: 'WebApp.gs' },
    { name: 'Install', type: 'server_js', src: 'Install.gs' },
    { name: 'Uninstall', type: 'server_js', src: 'Uninstall.gs' },
    { name: 'AdminApi', type: 'server_js', src: 'AdminApi.gs' },
    { name: 'Index', type: 'html', src: 'Index.html' },
    { name: 'Cancel', type: 'html', src: 'Cancel.html' },
    { name: 'DocAction', type: 'html', src: 'DocAction.html' },
    { name: 'Admin', type: 'html', src: 'Admin.html' }
  ];

  var report = { checked: 0, changed: [], errors: [] };

  for (var i = 0; i < files.length; i++) {
    try {
      fetchGitHubFile_(files[i].src);
      report.checked++;
    } catch (e) {
      report.errors.push(files[i].src + ': ' + e.message);
    }
  }

  return report;
}

/**
 * Convenience: show which files can be fetched from GitHub.
 * Use this to verify your GitHub settings are correct.
 */
function testGitHubConnection() {
  try {
    var content = fetchGitHubFile_('Config.gs');
    return {
      ok: true,
      message: 'Successfully connected to GitHub. Config.gs fetched (' + content.length + ' chars).'
    };
  } catch (e) {
    return {
      ok: false,
      message: 'Failed to connect to GitHub: ' + e.message
    };
  }
}
