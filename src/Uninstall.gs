/************************************
 * Uninstall.gs
 *
 * Purpose:
 * - Allows you to fully remove everything created by install():
 *   - Triggers
 *   - CONFIG spreadsheet (Drive file -> trashed)
 *   - APPOINTMENTS spreadsheet (Drive file -> trashed)
 *   - KevinAppts calendar (requires Advanced Calendar Service)
 *   - Script properties
 *
 * Safety model:
 * 1) Run armUninstall() first (valid for 15 minutes)
 * 2) Then run uninstallEverything()
 *
 * If you want to force-delete even if names don't match, run armUninstallForce()
 ************************************/

/**
 * Run this first. It arms uninstall for 15 minutes.
 */
function armUninstall() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var until = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  props.setProperty('UNINSTALL_ARMED', 'true');
  props.setProperty('UNINSTALL_ARMED_AT', now.toISOString());
  props.setProperty('UNINSTALL_ARMED_UNTIL', until.toISOString());
  props.setProperty('UNINSTALL_FORCE', 'false');

  return {
    ok: true,
    message: 'Uninstall armed for 15 minutes. Now run uninstallEverything().',
    armedAt: now.toISOString(),
    armedUntil: until.toISOString(),
    force: false
  };
}

/**
 * Same as armUninstall(), but allows deletion even if the resource name does not match expected names.
 * Use only if you know what you are doing.
 */
function armUninstallForce() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var until = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  props.setProperty('UNINSTALL_ARMED', 'true');
  props.setProperty('UNINSTALL_ARMED_AT', now.toISOString());
  props.setProperty('UNINSTALL_ARMED_UNTIL', until.toISOString());
  props.setProperty('UNINSTALL_FORCE', 'true');

  return {
    ok: true,
    message: 'FORCE uninstall armed for 15 minutes. Now run uninstallEverything().',
    armedAt: now.toISOString(),
    armedUntil: until.toISOString(),
    force: true
  };
}

/**
 * Disarm uninstall.
 */
function disarmUninstall() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('UNINSTALL_ARMED');
  props.deleteProperty('UNINSTALL_ARMED_AT');
  props.deleteProperty('UNINSTALL_ARMED_UNTIL');
  props.deleteProperty('UNINSTALL_FORCE');

  return { ok: true, message: 'Uninstall disarmed.' };
}

/**
 * Dry-run: shows what WOULD be deleted/trashed, but does not delete anything.
 */
function uninstallDryRun() {
  return uninstallCore_({ execute: false, deleteCalendar: true, trashFiles: true, wipeProperties: false });
}

/**
 * Full uninstall:
 * - Deletes triggers
 * - Trashes spreadsheets
 * - Deletes calendar (requires Advanced Calendar Service)
 * - Wipes script properties
 */
function uninstallEverything() {
  assertUninstallArmed_();
  return uninstallCore_({ execute: true, deleteCalendar: true, trashFiles: true, wipeProperties: true });
}

/**
 * Uninstall but keep the calendar (useful if you reused an existing calendar and don’t want it removed).
 * - Deletes triggers
 * - Trashes spreadsheets
 * - Keeps calendar
 * - Wipes script properties
 */
function uninstallKeepCalendar() {
  assertUninstallArmed_();
  return uninstallCore_({ execute: true, deleteCalendar: false, trashFiles: true, wipeProperties: true });
}

/************************************
 * Internals
 ************************************/

function assertUninstallArmed_() {
  var props = PropertiesService.getScriptProperties();
  var armed = props.getProperty('UNINSTALL_ARMED') === 'true';
  var untilStr = props.getProperty('UNINSTALL_ARMED_UNTIL');

  if (!armed || !untilStr) {
    throw new Error('Uninstall is NOT armed. Run armUninstall() first, then run uninstallEverything().');
  }

  var until = new Date(untilStr);
  var now = new Date();
  if (now.getTime() > until.getTime()) {
    disarmUninstall();
    throw new Error('Uninstall arming expired. Run armUninstall() again.');
  }
}

function uninstallCore_(opts) {
  opts = opts || {};
  var execute = !!opts.execute;
  var deleteCalendar = !!opts.deleteCalendar;
  var trashFiles = !!opts.trashFiles;
  var wipeProperties = !!opts.wipeProperties;

  var props = PropertiesService.getScriptProperties();
  var force = props.getProperty('UNINSTALL_FORCE') === 'true';

  var report = {
    ok: true,
    execute: execute,
    deleteCalendar: deleteCalendar,
    trashFiles: trashFiles,
    wipeProperties: wipeProperties,
    force: force,
    actions: [],
    warnings: [],
    errors: []
  };

  // 1) Remove triggers
  try {
    var trigRes = removeAllProjectTriggers_(execute);
    report.actions.push(trigRes);
  } catch (e1) {
    report.errors.push('Trigger removal failed: ' + (e1 && e1.message ? e1.message : String(e1)));
  }

  // 2) Trash spreadsheets created/used by install
  var configId = props.getProperty('CONFIG_SPREADSHEET_ID');
  var apptsId = props.getProperty('APPOINTMENTS_SPREADSHEET_ID');

  if (trashFiles) {
    try {
      var s1 = trashSpreadsheetById_(configId, 'Kevin Booking - CONFIG', execute, force);
      report.actions.push(s1);
    } catch (e2) {
      report.errors.push('Config spreadsheet trash failed: ' + (e2 && e2.message ? e2.message : String(e2)));
    }

    try {
      var s2 = trashSpreadsheetById_(apptsId, 'Kevin Booking - APPOINTMENTS', execute, force);
      report.actions.push(s2);
    } catch (e3) {
      report.errors.push('Appointments spreadsheet trash failed: ' + (e3 && e3.message ? e3.message : String(e3)));
    }
  } else {
    report.actions.push({ type: 'spreadsheets', action: 'skipped', reason: 'trashFiles=false' });
  }

  // 3) Delete calendar (requires Advanced Calendar service)
  var calId = props.getProperty('KEVINAPPTS_CALENDAR_ID');

  if (deleteCalendar) {
    try {
      var c1 = deleteCalendarById_(calId, 'KevinAppts', execute, force);
      report.actions.push(c1);
    } catch (e4) {
      report.errors.push('Calendar delete failed: ' + (e4 && e4.message ? e4.message : String(e4)));
    }
  } else {
    report.actions.push({ type: 'calendar', action: 'skipped', reason: 'deleteCalendar=false', calendarId: calId || '' });
  }

  // 4) Wipe properties (do this last)
  if (wipeProperties) {
    try {
      var p1 = wipeScriptProperties_(execute);
      report.actions.push(p1);
    } catch (e5) {
      report.errors.push('Property wipe failed: ' + (e5 && e5.message ? e5.message : String(e5)));
    }
  } else {
    report.actions.push({ type: 'properties', action: 'skipped', reason: 'wipeProperties=false' });
  }

  // Always disarm after execute=true (even if errors)
  if (execute) {
    try { disarmUninstall(); } catch (e6) {}
  }

  if (report.errors.length) {
    report.ok = false;
  }

  return report;
}

function removeAllProjectTriggers_(execute) {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = [];
  var kept = [];

  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    var handler = '';
    try { handler = t.getHandlerFunction(); } catch (e) { handler = ''; }

    if (execute) {
      ScriptApp.deleteTrigger(t);
      removed.push(handler || '(unknown handler)');
    } else {
      removed.push('[dry-run] ' + (handler || '(unknown handler)'));
    }
  }

  return {
    type: 'triggers',
    action: execute ? 'deleted' : 'dry-run',
    removedCount: removed.length,
    removedHandlers: removed,
    keptHandlers: kept
  };
}

function trashSpreadsheetById_(fileId, expectedName, execute, force) {
  if (!fileId) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'No fileId stored in Script Properties',
      expectedName: expectedName
    };
  }

  var file;
  try {
    file = DriveApp.getFileById(fileId);
  } catch (e) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'File not accessible / not found: ' + fileId,
      fileId: fileId,
      expectedName: expectedName
    };
  }

  var actualName = file.getName();
  var nameMatches = (actualName === expectedName);

  if (!nameMatches && !force) {
    return {
      type: 'spreadsheet',
      action: 'skipped',
      reason: 'Name mismatch (safety). Run armUninstallForce() to override.',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName
    };
  }

  if (execute) {
    file.setTrashed(true);
    return {
      type: 'spreadsheet',
      action: 'trashed',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName,
      note: 'File moved to Trash. You can restore from Drive Trash if needed.'
    };
  } else {
    return {
      type: 'spreadsheet',
      action: 'dry-run',
      fileId: fileId,
      expectedName: expectedName,
      actualName: actualName,
      wouldTrash: true
    };
  }
}

function deleteCalendarById_(calendarId, expectedName, execute, force) {
  if (!calendarId) {
    return {
      type: 'calendar',
      action: 'skipped',
      reason: 'No calendarId stored in Script Properties',
      expectedName: expectedName
    };
  }

  // Confirm name (via CalendarApp) where possible
  var actualName = '';
  try {
    var cal = CalendarApp.getCalendarById(calendarId);
    actualName = cal ? cal.getName() : '';
  } catch (e) {
    actualName = '';
  }

  var nameMatches = (actualName && actualName === expectedName);

  if (!nameMatches && !force) {
    return {
      type: 'calendar',
      action: 'skipped',
      reason: 'Name mismatch (safety). Run armUninstallForce() to override.',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName
    };
  }

  // Calendar deletion requires Advanced Calendar Service
  // Uses: Calendar.Calendars.remove(calendarId)
  if (typeof Calendar === 'undefined' || !Calendar.Calendars || !Calendar.Calendars.remove) {
    throw new Error(
      'Advanced Google Service "Google Calendar API" is not enabled.\n' +
      'Enable it in Apps Script: Services (+) -> Google Calendar API -> Add.\n' +
      'Then run uninstallEverything() again.'
    );
  }

  if (execute) {
    Calendar.Calendars.remove(calendarId);
    return {
      type: 'calendar',
      action: 'deleted',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName,
      note: 'Calendar removed via Calendar API (this is permanent).'
    };
  } else {
    return {
      type: 'calendar',
      action: 'dry-run',
      calendarId: calendarId,
      expectedName: expectedName,
      actualName: actualName,
      wouldDelete: true
    };
  }
}

function wipeScriptProperties_(execute) {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();

  // Keep uninstall safety keys out of counting? (we will remove them anyway if execute=true)
  var keys = Object.keys(all);

  if (execute) {
    props.deleteAllProperties();
    return {
      type: 'properties',
      action: 'deleted',
      deletedCount: keys.length,
      deletedKeys: keys
    };
  } else {
    return {
      type: 'properties',
      action: 'dry-run',
      wouldDeleteCount: keys.length,
      wouldDeleteKeys: keys
    };
  }
}
