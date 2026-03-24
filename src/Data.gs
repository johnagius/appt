/***************
 * Data.gs
 ***************/

var _configSsCache = null;
var _apptsSsCache = null;
var _spinolaSsCache = null;
var _daySheetFormatted = {};
var _spinolaDaySheetFormatted = {};
var _archiveDataCache = null;

function getConfigSpreadsheet_() {
  if (_configSsCache) return _configSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_CONFIG_SSID);
  if (!id) throw new Error('CONFIG spreadsheet ID not set. Run install().');
  _configSsCache = SpreadsheetApp.openById(id);
  return _configSsCache;
}

function getAppointmentsSpreadsheet_() {
  if (_apptsSsCache) return _apptsSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_APPTS_SSID);
  if (!id) throw new Error('APPOINTMENTS spreadsheet ID not set. Run install().');
  _apptsSsCache = SpreadsheetApp.openById(id);
  return _apptsSsCache;
}

function getSpinolaSpreadsheet_() {
  if (_spinolaSsCache) return _spinolaSsCache;
  var id = getScriptProps_().getProperty(CFG().PROP_SPINOLA_APPTS_SSID);
  if (!id) throw new Error('SPINOLA APPOINTMENTS spreadsheet ID not set. Run setSpinolaSpreadsheetId().');
  _spinolaSsCache = SpreadsheetApp.openById(id);
  return _spinolaSsCache;
}

function ensureSpinolaDaySheet_(dateKey) {
  var ss = getSpinolaSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);

  if (!sh) {
    sh = ss.insertSheet(dateKey);
    sh.getRange(1, 1, 1, 18).setValues([[
      'AppointmentId',
      'Date(yyyy-MM-dd)',
      'StartTime',
      'EndTime',
      'ServiceId',
      'ServiceName',
      'FullName',
      'Email',
      'Phone',
      'Comments',
      'Status',
      'Location',
      'CreatedAt',
      'UpdatedAt',
      'Token',
      'CalendarEventId',
      'CancelledAt',
      'CancelReason'
    ]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _spinolaDaySheetFormatted[dateKey] = true;
  } else if (!_spinolaDaySheetFormatted[dateKey]) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _spinolaDaySheetFormatted[dateKey] = true;
  }

  return sh;
}

function appendSpinolaAppointment_(dateKey, apptObj) {
  var sh = ensureSpinolaDaySheet_(dateKey);

  sh.appendRow([
    apptObj.appointmentId,
    apptObj.dateKey,
    apptObj.startTime,
    apptObj.endTime,
    apptObj.serviceId,
    apptObj.serviceName,
    apptObj.fullName,
    apptObj.email,
    apptObj.phone,
    apptObj.comments,
    apptObj.status,
    apptObj.location,
    apptObj.createdAt,
    apptObj.updatedAt,
    apptObj.token,
    apptObj.calendarEventId,
    apptObj.cancelledAt,
    apptObj.cancelReason
  ]);

  return sh.getLastRow();
}

function listSpinolaAppointmentsForDate_(dateKey) {
  var sh = ensureSpinolaDaySheet_(dateKey);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 18).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    rows.push(appointmentRowToObj_(values[i]));
  }
  return rows;
}

function ensureDaySheet_(dateKey) {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);

  if (!sh) {
    sh = ss.insertSheet(dateKey);
    sh.getRange(1, 1, 1, 18).setValues([[
      'AppointmentId',
      'Date(yyyy-MM-dd)',
      'StartTime',
      'EndTime',
      'ServiceId',
      'ServiceName',
      'FullName',
      'Email',
      'Phone',
      'Comments',
      'Status',
      'Location',
      'CreatedAt',
      'UpdatedAt',
      'Token',
      'CalendarEventId',
      'CancelledAt',
      'CancelReason'
    ]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[dateKey] = true;
  } else if (!_daySheetFormatted[dateKey]) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[dateKey] = true;
  }

  return sh;
}

function getDoctorOffDates_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var values = sh.getRange(2, 1, lastRow - 1, 5).getValues();
  var map = {};

  for (var i = 0; i < values.length; i++) {
    var startKey = normalizeDateKeyCell_(values[i][0]);
    if (!startKey) continue;

    var endKey = normalizeDateKeyCell_(values[i][1]) || startKey;
    var startTimeStr = normalizeTimeCell_(values[i][2]);
    var endTimeStr = normalizeTimeCell_(values[i][3]);
    var reason = String(values[i][4] || '').trim();

    var startDate = parseDateKey_(startKey);
    var endDate = parseDateKey_(endKey);

    if (endDate.getTime() < startDate.getTime()) {
      var tmp = startDate;
      startDate = endDate;
      endDate = tmp;
    }

    var hasTime = !!(String(startTimeStr || '').trim() || String(endTimeStr || '').trim());
    var blockStartMin = 0;
    var blockEndMin = 1440;

    if (hasTime) {
      blockStartMin = startTimeStr ? parseTimeToMinutes_(startTimeStr) : 0;
      blockEndMin = endTimeStr ? parseTimeToMinutes_(endTimeStr) : 1440;

      if (endTimeStr === '00:00' && blockStartMin > 0) {
        blockEndMin = 1440;
      }

      if (blockStartMin < 0) blockStartMin = 0;
      if (blockStartMin > 1440) blockStartMin = 1440;
      if (blockEndMin < 0) blockEndMin = 0;
      if (blockEndMin > 1440) blockEndMin = 1440;

      if (blockEndMin < blockStartMin) {
        var t2 = blockStartMin;
        blockStartMin = blockEndMin;
        blockEndMin = t2;
      }

      if (blockEndMin === blockStartMin) continue;
    }

    var d = new Date(startDate.getTime());
    while (d.getTime() <= endDate.getTime()) {
      var dk = toDateKey_(d);

      if (!map[dk]) {
        map[dk] = { allDay: false, reason: '', blocks: [], _reasons: [] };
      }

      var entry = map[dk];
      var isAllDay = (!hasTime) || (blockStartMin <= 0 && blockEndMin >= 1440);

      if (isAllDay) {
        entry.allDay = true;
        entry.blocks = [{ startMin: 0, endMin: 1440, reason: reason }];
      } else if (!entry.allDay) {
        entry.blocks.push({ startMin: blockStartMin, endMin: blockEndMin, reason: reason });
      }

      if (reason) entry._reasons.push(reason);
      d = addMinutes_(d, 24 * 60);
    }
  }

  Object.keys(map).forEach(function(dk) {
    var entry = map[dk];
    entry.reason = dedupeJoinReasons_(entry._reasons);
    delete entry._reasons;

    if (entry.blocks && entry.blocks.length > 1) {
      entry.blocks.sort(function(a, b) { return Number(a.startMin) - Number(b.startMin); });
    }
  });

  return map;
}

/**
 * Get raw DoctorOff rows with their sheet row indices (for admin delete).
 */
function getDoctorOffRows_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 5).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var startKey = normalizeDateKeyCell_(values[i][0]);
    if (!startKey) continue;
    rows.push({
      rowIndex: i + 2,
      startDate: startKey,
      endDate: normalizeDateKeyCell_(values[i][1]) || startKey,
      startTime: normalizeTimeCell_(values[i][2]),
      endTime: normalizeTimeCell_(values[i][3]),
      reason: String(values[i][4] || '').trim()
    });
  }
  return rows;
}

/**
 * Read DoctorExtra sheet: extra time windows the doctor has added.
 * Returns map by dateKey => [{start, end}]
 */
function getDoctorExtraSlots_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) return {};

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var values = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  var map = {};

  for (var i = 0; i < values.length; i++) {
    var dk = normalizeDateKeyCell_(values[i][0]);
    if (!dk) continue;

    var startTime = normalizeTimeCell_(values[i][1]);
    var endTime = normalizeTimeCell_(values[i][2]);
    if (!startTime || !endTime) continue;

    if (!map[dk]) map[dk] = [];
    map[dk].push({ start: startTime, end: endTime });
  }

  return map;
}

/**
 * Get raw DoctorExtra rows with their sheet row indices (for admin delete).
 */
function getDoctorExtraRows_() {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var dk = normalizeDateKeyCell_(values[i][0]);
    if (!dk) continue;
    rows.push({
      rowIndex: i + 2,
      date: dk,
      startTime: normalizeTimeCell_(values[i][1]),
      endTime: normalizeTimeCell_(values[i][2]),
      reason: String(values[i][3] || '').trim()
    });
  }
  return rows;
}

function normalizeDateKeyCell_(cell) {
  if (cell === null || cell === undefined) return '';
  if (Object.prototype.toString.call(cell) === '[object Date]' && !isNaN(cell.getTime())) {
    return Utilities.formatDate(cell, getTimeZone_(), 'yyyy-MM-dd');
  }

  var s = String(cell || '').trim();
  if (!s) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  var p = s.split('-');
  if (p.length === 3) {
    var y = String(p[0]).trim();
    var m = String(p[1]).trim();
    var d = String(p[2]).trim();
    if (/^\d{4}$/.test(y) && /^\d{1,2}$/.test(m) && /^\d{1,2}$/.test(d)) {
      return y + '-' + pad2_(Number(m)) + '-' + pad2_(Number(d));
    }
  }

  return '';
}

function normalizeTimeCell_(cell) {
  if (cell === null || cell === undefined) return '';

  if (Object.prototype.toString.call(cell) === '[object Date]' && !isNaN(cell.getTime())) {
    return Utilities.formatDate(cell, getTimeZone_(), 'HH:mm');
  }

  if (typeof cell === 'number' && !isNaN(cell)) {
    var mins = Math.round(cell * 24 * 60);
    if (mins < 0) mins = 0;
    if (mins > 1440) mins = 1440;
    return minutesToTime_(mins);
  }

  var s = String(cell || '').trim();
  if (!s) return '';

  var m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    var hh = Number(m[1]);
    var mm = Number(m[2]);
    if (isNaN(hh) || isNaN(mm)) return '';
    if (hh < 0 || hh > 24) return '';
    if (mm < 0 || mm > 59) return '';
    return pad2_(hh) + ':' + pad2_(mm);
  }

  return '';
}

function dedupeJoinReasons_(reasons) {
  reasons = reasons || [];
  var out = [];
  var seen = {};
  for (var i = 0; i < reasons.length; i++) {
    var r = String(reasons[i] || '').trim();
    if (!r) continue;
    if (!seen[r]) {
      seen[r] = true;
      out.push(r);
    }
  }
  return out.join(' / ');
}


function getOrCreateClient_(fullName, email, phone) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_CLIENTS);
  if (!sh) throw new Error('Clients sheet missing.');

  sh.getRange(1, 1, sh.getMaxRows(), 6).setNumberFormat('@');

  var lastRow = sh.getLastRow();
  var now = new Date();
  var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);
  fullName = sanitizeName_(fullName);

  if (lastRow >= 2) {
    var data = sh.getRange(2, 1, lastRow - 1, 6).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowEmail = String(data[i][2] || '').trim().toLowerCase();
      var rowPhone = String(data[i][3] || '').trim();

      if (email && rowEmail === email) {
        var r = i + 2;
        sh.getRange(r, 2, 1, 3).setValues([[fullName || data[i][1], email || data[i][2], phone || data[i][3]]]);
        sh.getRange(r, 6).setValue(nowStr);
        return { clientId: String(data[i][0]), row: r };
      }

      if (!email && phone && rowPhone === phone) {
        var r2 = i + 2;
        sh.getRange(r2, 2, 1, 3).setValues([[fullName || data[i][1], email || data[i][2], phone || data[i][3]]]);
        sh.getRange(r2, 6).setValue(nowStr);
        return { clientId: String(data[i][0]), row: r2 };
      }
    }
  }

  var clientId = 'C-' + Utilities.getUuid();
  sh.appendRow([clientId, fullName, email, phone, nowStr, nowStr]);
  return { clientId: clientId, row: sh.getLastRow() };
}

function listAppointmentsForDate_(dateKey) {
  var sh = ensureDaySheet_(dateKey);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  var values = sh.getRange(2, 1, lastRow - 1, 18).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    rows.push(appointmentRowToObj_(values[i]));
  }
  return rows;
}

/**
 * List active (BOOKED / RELOCATED_SPINOLA) appointments for a date.
 */
function listActiveAppointmentsForDate_(dateKey) {
  var all = listAppointmentsForDate_(dateKey);
  var active = [];
  for (var i = 0; i < all.length; i++) {
    if (apptIsActive_(all[i])) active.push(all[i]);
  }
  active.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });
  return active;
}

function appointmentRowToObj_(r) {
  return {
    appointmentId: String(r[0] || ''),
    dateKey: String(r[1] || ''),
    startTime: normalizeTimeCell_(r[2]),
    endTime: normalizeTimeCell_(r[3]),
    serviceId: String(r[4] || ''),
    serviceName: String(r[5] || ''),
    fullName: String(r[6] || ''),
    email: String(r[7] || ''),
    phone: String(r[8] || ''),
    comments: String(r[9] || ''),
    status: String(r[10] || ''),
    location: String(r[11] || ''),
    createdAt: String(r[12] || ''),
    updatedAt: String(r[13] || ''),
    token: String(r[14] || ''),
    calendarEventId: String(r[15] || ''),
    cancelledAt: String(r[16] || ''),
    cancelReason: String(r[17] || '')
  };
}

function findAppointmentByToken_(token) {
  token = String(token || '').trim();
  if (!token) return null;

  var today = todayLocal_();
  var ss = getAppointmentsSpreadsheet_();

  // Search -30 to +ADVANCE_DAYS+7 days (narrower than old 241-day window)
  var pastDays = 30;
  var futureDays = CFG().ADVANCE_DAYS + 7;

  for (var i = -pastDays; i <= futureDays; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    // Check live sheet first (need rowIndex for writes), then archive
    var sh = ss.getSheetByName(dk);
    if (sh) {
      var lastRow = sh.getLastRow();
      if (lastRow >= 2) {
        var vals = sh.getRange(2, 1, lastRow - 1, 18).getValues();
        for (var r = 0; r < vals.length; r++) {
          if (String(vals[r][14] || '') === token) {
            return { sheetName: dk, rowIndex: r + 2, appointment: appointmentRowToObj_(vals[r]) };
          }
        }
      }
    } else {
      var archiveRows = getDayRows_(dk);
      for (var r = 0; r < archiveRows.length; r++) {
        if (String(archiveRows[r][14] || '') === token) {
          return { sheetName: dk, rowIndex: -1, appointment: appointmentRowToObj_(archiveRows[r]), archived: true };
        }
      }
    }
  }

  // Also search Spinola spreadsheet if token not found in Potter's
  try {
    var spinolaSs = getSpinolaSpreadsheet_();
    for (var j = -pastDays; j <= futureDays; j++) {
      var d2 = addMinutes_(today, j * 24 * 60);
      var dk2 = toDateKey_(d2);

      var sh2 = spinolaSs.getSheetByName(dk2);
      if (sh2) {
        var lastRow2 = sh2.getLastRow();
        if (lastRow2 >= 2) {
          var vals2 = sh2.getRange(2, 1, lastRow2 - 1, 18).getValues();
          for (var r2 = 0; r2 < vals2.length; r2++) {
            if (String(vals2[r2][14] || '') === token) {
              return { sheetName: dk2, rowIndex: r2 + 2, appointment: appointmentRowToObj_(vals2[r2]), spinola: true };
            }
          }
        }
      }
    }
  } catch (e) {
    // Spinola spreadsheet not configured — skip
  }

  return null;
}

function updateAppointmentStatus_(sheetName, rowIndex, updates, isSpinola) {
  var ss = isSpinola ? getSpinolaSpreadsheet_() : getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet not found: ' + sheetName);

  if (!_daySheetFormatted[sheetName]) {
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
    _daySheetFormatted[sheetName] = true;
  }

  var now = new Date();
  var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

  if (updates.status !== undefined) sh.getRange(rowIndex, 11).setValue(updates.status);
  if (updates.location !== undefined) sh.getRange(rowIndex, 12).setValue(updates.location);
  sh.getRange(rowIndex, 14).setValue(nowStr);

  if (updates.calendarEventId !== undefined) sh.getRange(rowIndex, 16).setValue(updates.calendarEventId);
  if (updates.cancelledAt !== undefined) sh.getRange(rowIndex, 17).setValue(updates.cancelledAt);
  if (updates.cancelReason !== undefined) sh.getRange(rowIndex, 18).setValue(updates.cancelReason);
}

function appendAppointment_(dateKey, apptObj) {
  var sh = ensureDaySheet_(dateKey);

  sh.appendRow([
    apptObj.appointmentId,
    apptObj.dateKey,
    apptObj.startTime,
    apptObj.endTime,
    apptObj.serviceId,
    apptObj.serviceName,
    apptObj.fullName,
    apptObj.email,
    apptObj.phone,
    apptObj.comments,
    apptObj.status,
    apptObj.location,
    apptObj.createdAt,
    apptObj.updatedAt,
    apptObj.token,
    apptObj.calendarEventId,
    apptObj.cancelledAt,
    apptObj.cancelReason
  ]);

  return sh.getLastRow();
}

function apptIsActive_(appt) {
  var st = String(appt.status || '').trim();
  return (st === 'BOOKED' || st === 'RELOCATED_SPINOLA');
}

/**
 * List non-cancelled appointments for a date (includes ATTENDED and NO_SHOW).
 */
function listNonCancelledAppointmentsForDate_(dateKey) {
  var all = listAppointmentsForDate_(dateKey);
  var result = [];
  for (var i = 0; i < all.length; i++) {
    var st = String(all[i].status || '').trim();
    if (st.indexOf('CANCELLED') < 0) result.push(all[i]);
  }
  result.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });
  return result;
}

/**
 * Calculate days between two YYYY-MM-DD date strings.
 */
function daysBetween_(dateStr1, dateStr2) {
  var d1 = parseDateKey_(dateStr1);
  var d2 = parseDateKey_(dateStr2);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

function countActiveAppointmentsInWindow_(email, phone) {
  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);

  if (!email && !phone) return 0;

  var count = 0;
  var today = todayLocal_();
  var ss = getAppointmentsSpreadsheet_();

  for (var i = 0; i <= CFG().ADVANCE_DAYS; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    var sh = ss.getSheetByName(dk);
    if (!sh) continue;

    var lr = sh.getLastRow();
    if (lr < 2) continue;

    var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
    for (var r = 0; r < vals.length; r++) {
      var status = String(vals[r][10] || '');
      if (status !== 'BOOKED' && status !== 'RELOCATED_SPINOLA') continue;

      var e = String(vals[r][7] || '').trim().toLowerCase();
      var p = String(vals[r][8] || '').trim();

      if (email && phone) {
        if (e === email || p === phone) count++;
      } else if (email) {
        if (e === email) count++;
      } else if (phone) {
        if (p === phone) count++;
      }
    }
  }

  return count;
}

function personAlreadyBookedSameSlot_(dateKey, startTime, email, phone) {
  email = sanitizeEmail_(email);
  phone = sanitizePhone_(phone);

  var appts = listAppointmentsForDate_(dateKey);
  for (var i = 0; i < appts.length; i++) {
    if (!apptIsActive_(appts[i])) continue;
    if (String(appts[i].startTime || '').trim() !== String(startTime || '').trim()) continue;

    var e = String(appts[i].email || '').trim().toLowerCase();
    var p = String(appts[i].phone || '').trim();

    if (email && e === email) return true;
    if (phone && p === phone) return true;
  }
  return false;
}

/**
 * Add a DoctorOff row to the sheet.
 */
function addDoctorOffRow_(startDate, endDate, startTime, endTime, reason) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');
  sh.appendRow([startDate, endDate || startDate, startTime || '', endTime || '', reason || '']);
}

/**
 * Delete a DoctorOff row by sheet row index.
 */
function deleteDoctorOffRow_(rowIndex) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_OFF);
  if (!sh) throw new Error('DoctorOff sheet missing.');
  sh.deleteRow(rowIndex);
}

/**
 * Add a DoctorExtra row to the sheet.
 */
function addDoctorExtraRow_(date, startTime, endTime, reason) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) throw new Error('DoctorExtra sheet missing. Run install() again.');
  sh.appendRow([date, startTime, endTime, reason || '']);
}

/**
 * Delete a DoctorExtra row by sheet row index.
 */
function deleteDoctorExtraRow_(rowIndex) {
  var ss = getConfigSpreadsheet_();
  var sh = ss.getSheetByName(CFG().SHEET_DOCTOR_EXTRA);
  if (!sh) throw new Error('DoctorExtra sheet missing.');
  sh.deleteRow(rowIndex);
}

/**
 * Find the next available working day after the given date.
 * Skips holidays, Sundays, and full-day doctor-off dates.
 */
function findNextAvailableDay_(afterDateKey, offMap) {
  var d = parseDateKey_(afterDateKey);
  for (var i = 1; i <= 30; i++) {
    d = addMinutes_(d, 24 * 60);
    var dk = toDateKey_(d);
    var holiday = isHolidayOrClosed_(d);
    if (holiday.closed) continue;
    var offEntry = offMap ? offMap[dk] : null;
    if (offEntry && offEntry.allDay) continue;
    // Check if it has working hours
    var slots = buildSlotsForDate_(d);
    if (slots.length > 0) return dk;
  }
  return null;
}

// ========== Archive helpers ==========

var ARCHIVE_SHEET_NAME = 'Archive';

/**
 * Get or create the Archive sheet (same 18-column structure as day sheets).
 */
function ensureArchiveSheet_() {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(ARCHIVE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(ARCHIVE_SHEET_NAME);
    sh.getRange(1, 1, 1, 18).setValues([[
      'AppointmentId', 'Date(yyyy-MM-dd)', 'StartTime', 'EndTime',
      'ServiceId', 'ServiceName', 'FullName', 'Email', 'Phone',
      'Comments', 'Status', 'Location', 'CreatedAt', 'UpdatedAt',
      'Token', 'CalendarEventId', 'CancelledAt', 'CancelReason'
    ]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 18).setNumberFormat('@');
  }
  return sh;
}

/**
 * Load all archive data, indexed by dateKey. Cached per execution.
 */
function loadArchiveData_() {
  if (_archiveDataCache) return _archiveDataCache;
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(ARCHIVE_SHEET_NAME);
  if (!sh) { _archiveDataCache = {}; return _archiveDataCache; }
  var lr = sh.getLastRow();
  if (lr < 2) { _archiveDataCache = {}; return _archiveDataCache; }

  var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
  var byDate = {};
  for (var i = 0; i < vals.length; i++) {
    var dk = String(vals[i][1] || '');
    if (!byDate[dk]) byDate[dk] = [];
    byDate[dk].push(vals[i]);
  }
  _archiveDataCache = byDate;
  return _archiveDataCache;
}

/**
 * Get raw 18-column rows for a dateKey.
 * Checks the live day sheet first; falls back to archive.
 */
function getDayRows_(dateKey) {
  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);
  if (sh) {
    var lr = sh.getLastRow();
    if (lr >= 2) return sh.getRange(2, 1, lr - 1, 18).getValues();
    return [];
  }
  // Fall back to archive
  var archive = loadArchiveData_();
  return archive[dateKey] || [];
}

function getSpinolaRows_(dateKey) {
  try {
    var ss = getSpinolaSpreadsheet_();
    if (!ss) return [];
    var sh = ss.getSheetByName(dateKey);
    if (!sh) return [];
    var lr = sh.getLastRow();
    if (lr < 2) return [];
    return sh.getRange(2, 1, lr - 1, 18).getValues();
  } catch(e) { return []; }
}

/**
 * Archive day sheets older than daysToKeep and delete them.
 * Returns { archivedSheets, archivedRows }.
 */
function archiveOldDaySheets_(daysToKeep) {
  daysToKeep = daysToKeep || 30;
  var today = todayLocal_();
  var cutoff = toDateKey_(addMinutes_(today, -daysToKeep * 1440));
  var ss = getAppointmentsSpreadsheet_();
  var sheets = ss.getSheets();
  var archiveSh = ensureArchiveSheet_();

  var datePattern = /^\d{4}-\d{2}-\d{2}$/;
  var allRows = [];
  var toDelete = [];

  // Collect all data first, then write once (avoid per-sheet API calls)
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (!datePattern.test(name)) continue;
    if (name >= cutoff) continue; // Keep recent sheets

    var lr = sheets[i].getLastRow();
    if (lr >= 2) {
      var vals = sheets[i].getRange(2, 1, lr - 1, 18).getValues();
      for (var r = 0; r < vals.length; r++) allRows.push(vals[r]);
    }
    toDelete.push(sheets[i]);
  }

  // Single batch write
  if (allRows.length > 0) {
    archiveSh.getRange(archiveSh.getLastRow() + 1, 1, allRows.length, 18).setValues(allRows);
  }

  // Delete old sheets
  for (var d = 0; d < toDelete.length; d++) {
    ss.deleteSheet(toDelete[d]);
  }

  // Invalidate cache since we just changed archive
  _archiveDataCache = null;

  return { archivedSheets: toDelete.length, archivedRows: allRows.length };
}
