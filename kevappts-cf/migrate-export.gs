/**
 * TEMPORARY: Paste this into your existing GAS project (Code.gs or a new file).
 * Run exportAllDataAsSQL() from the Script Editor.
 * It will open a dialog with SQL INSERT statements.
 * Copy all the SQL, save as migrate.sql, and run:
 *   npx wrangler d1 execute kevappts-db --remote --file=migrate.sql
 *
 * DELETE THIS FILE after migration.
 */

function exportAllDataAsSQL() {
  var props = PropertiesService.getScriptProperties();
  var configId = props.getProperty('CONFIG_SPREADSHEET_ID');
  var apptsId = props.getProperty('APPOINTMENTS_SPREADSHEET_ID');
  var spinolaId = props.getProperty('SPINOLA_SPREADSHEET_ID');

  var sql = [];
  sql.push('-- Migration from Google Sheets to D1');
  sql.push('-- Generated: ' + new Date().toISOString());
  sql.push('');

  // ── Config: DoctorOff ──
  try {
    var configSS = SpreadsheetApp.openById(configId);

    var offSheet = configSS.getSheetByName('DoctorOff');
    if (offSheet && offSheet.getLastRow() > 1) {
      var offData = offSheet.getRange(2, 1, offSheet.getLastRow() - 1, 5).getValues();
      for (var i = 0; i < offData.length; i++) {
        var r = offData[i];
        var startDate = String(r[0]).trim();
        var endDate = String(r[1]).trim();
        var startTime = String(r[2]).trim();
        var endTime = String(r[3]).trim();
        var reason = String(r[4]).trim();
        if (!startDate) continue;
        sql.push("INSERT OR IGNORE INTO doctor_off (id, start_date, end_date, start_time, end_time, reason) VALUES ('" +
          generateMigrateId() + "', " + esc(startDate) + ", " + esc(endDate || startDate) + ", " + esc(startTime) + ", " + esc(endTime) + ", " + esc(reason) + ");");
      }
      sql.push('');
    }

    // ── Config: DoctorExtra ──
    var extraSheet = configSS.getSheetByName('DoctorExtra');
    if (extraSheet && extraSheet.getLastRow() > 1) {
      var extraData = extraSheet.getRange(2, 1, extraSheet.getLastRow() - 1, 4).getValues();
      for (var i = 0; i < extraData.length; i++) {
        var r = extraData[i];
        var dateVal = String(r[0]).trim();
        var st = String(r[1]).trim();
        var et = String(r[2]).trim();
        var rsn = String(r[3]).trim();
        if (!dateVal) continue;
        sql.push("INSERT OR IGNORE INTO doctor_extra (id, date_key, start_time, end_time, reason) VALUES ('" +
          generateMigrateId() + "', " + esc(dateVal) + ", " + esc(st) + ", " + esc(et) + ", " + esc(rsn) + ");");
      }
      sql.push('');
    }

    // ── Config: Clients ──
    var clientSheet = configSS.getSheetByName('Clients');
    if (clientSheet && clientSheet.getLastRow() > 1) {
      var clientData = clientSheet.getRange(2, 1, clientSheet.getLastRow() - 1, 6).getValues();
      for (var i = 0; i < clientData.length; i++) {
        var r = clientData[i];
        var cid = String(r[0]).trim();
        var name = String(r[1]).trim();
        var email = String(r[2]).trim();
        var phone = String(r[3]).trim();
        var created = String(r[4]).trim();
        var updated = String(r[5]).trim();
        if (!cid || !name) continue;
        sql.push("INSERT OR IGNORE INTO clients (id, full_name, email, phone, created_at, updated_at) VALUES (" +
          esc(cid) + ", " + esc(name) + ", " + esc(email) + ", " + esc(phone) + ", " + esc(created) + ", " + esc(updated) + ");");
      }
      sql.push('');
    }
  } catch (e) {
    sql.push('-- Error reading config spreadsheet: ' + e.message);
  }

  // ── Appointments (Potter's) ──
  try {
    var apptSS = SpreadsheetApp.openById(apptsId);
    var apptSheets = apptSS.getSheets();
    for (var s = 0; s < apptSheets.length; s++) {
      var sheet = apptSheets[s];
      var sheetName = sheet.getName();
      // Skip non-date sheets
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sheetName) && sheetName !== 'Archive') continue;
      if (sheet.getLastRow() <= 1) continue;

      var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
      for (var i = 0; i < data.length; i++) {
        var r = data[i];
        var apptId = String(r[0]).trim();
        if (!apptId) continue;
        sql.push("INSERT OR IGNORE INTO appointments (id, date_key, start_time, end_time, service_id, service_name, full_name, email, phone, comments, status, location, created_at, updated_at, token, calendar_event_id, cancelled_at, cancel_reason, clinic) VALUES (" +
          esc(apptId) + ", " + esc(String(r[1]).trim()) + ", " + esc(String(r[2]).trim()) + ", " + esc(String(r[3]).trim()) + ", " +
          esc(String(r[4]).trim()) + ", " + esc(String(r[5]).trim()) + ", " + esc(String(r[6]).trim()) + ", " + esc(String(r[7]).trim()) + ", " +
          esc(String(r[8]).trim()) + ", " + esc(String(r[9]).trim()) + ", " + esc(String(r[10]).trim()) + ", " + esc(String(r[11]).trim()) + ", " +
          esc(String(r[12]).trim()) + ", " + esc(String(r[13]).trim()) + ", " + esc(String(r[14]).trim()) + ", " + esc(String(r[15]).trim()) + ", " +
          esc(String(r[16]).trim()) + ", " + esc(String(r[17]).trim()) + ", 'potters');");
      }
    }
    sql.push('');
  } catch (e) {
    sql.push('-- Error reading appointments spreadsheet: ' + e.message);
  }

  // ── Appointments (Spinola) ──
  if (spinolaId) {
    try {
      var spinolaSS = SpreadsheetApp.openById(spinolaId);
      var spinolaSheets = spinolaSS.getSheets();
      for (var s = 0; s < spinolaSheets.length; s++) {
        var sheet = spinolaSheets[s];
        var sheetName = sheet.getName();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(sheetName) && sheetName !== 'Archive') continue;
        if (sheet.getLastRow() <= 1) continue;

        var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
        for (var i = 0; i < data.length; i++) {
          var r = data[i];
          var apptId = String(r[0]).trim();
          if (!apptId) continue;
          sql.push("INSERT OR IGNORE INTO appointments (id, date_key, start_time, end_time, service_id, service_name, full_name, email, phone, comments, status, location, created_at, updated_at, token, calendar_event_id, cancelled_at, cancel_reason, clinic) VALUES (" +
            esc(apptId) + ", " + esc(String(r[1]).trim()) + ", " + esc(String(r[2]).trim()) + ", " + esc(String(r[3]).trim()) + ", " +
            esc(String(r[4]).trim()) + ", " + esc(String(r[5]).trim()) + ", " + esc(String(r[6]).trim()) + ", " + esc(String(r[7]).trim()) + ", " +
            esc(String(r[8]).trim()) + ", " + esc(String(r[9]).trim()) + ", " + esc(String(r[10]).trim()) + ", " + esc(String(r[11]).trim()) + ", " +
            esc(String(r[12]).trim()) + ", " + esc(String(r[13]).trim()) + ", " + esc(String(r[14]).trim()) + ", " + esc(String(r[15]).trim()) + ", " +
            esc(String(r[16]).trim()) + ", " + esc(String(r[17]).trim()) + ", 'spinola');");
        }
      }
    } catch (e) {
      sql.push('-- Error reading spinola spreadsheet: ' + e.message);
    }
  }

  // Output — show in a dialog the user can copy
  var output = sql.join('\n');
  var html = HtmlService.createHtmlOutput(
    '<textarea id="sql" style="width:100%;height:90%;font-family:monospace;font-size:11px;">' +
    escHtml(output) +
    '</textarea><br><button onclick="document.getElementById(\'sql\').select();document.execCommand(\'copy\');this.textContent=\'Copied!\';">Copy All</button>'
  ).setWidth(800).setHeight(600).setTitle('Migration SQL');
  SpreadsheetApp.getUi().showModalDialog(html, 'Migration SQL — Copy this');
}

function esc(val) {
  if (val === null || val === undefined || val === '' || val === 'undefined') return "''";
  var s = String(val).replace(/'/g, "''");
  return "'" + s + "'";
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateMigrateId() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';
  for (var i = 0; i < 12; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'M-' + id;
}
