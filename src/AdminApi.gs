/***************
 * AdminApi.gs - Admin panel API endpoints
 ***************/

/**
 * Dashboard data for admin panel.
 */
function apiAdminGetDashboard(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var tomorrow = addMinutes_(today, 24 * 60);
  var tomorrowKey = toDateKey_(tomorrow);

  var todayAppts = listNonCancelledAppointmentsForDate_(todayKey);
  var tomorrowAppts = listNonCancelledAppointmentsForDate_(tomorrowKey);

  // Get doctor-off entries for upcoming days
  var offRows = getDoctorOffRows_();
  var futureOffRows = [];
  for (var i = 0; i < offRows.length; i++) {
    if (offRows[i].endDate >= todayKey || offRows[i].startDate >= todayKey) {
      futureOffRows.push(offRows[i]);
    }
  }

  // Get extra slots entries
  var extraRows = getDoctorExtraRows_();
  var futureExtraRows = [];
  for (var j = 0; j < extraRows.length; j++) {
    if (extraRows[j].date >= todayKey) {
      futureExtraRows.push(extraRows[j]);
    }
  }

  // Week stats
  var weekBooked = 0;
  var weekCancelled = 0;
  for (var d = 0; d <= 6; d++) {
    var dk = toDateKey_(addMinutes_(today, d * 24 * 60));
    var vals = getDayRows_(dk);
    for (var r = 0; r < vals.length; r++) {
      var status = String(vals[r][10] || '');
      if (status === 'BOOKED' || status === 'RELOCATED_SPINOLA' || status === 'ATTENDED') weekBooked++;
      if (status.indexOf('CANCELLED') >= 0) weekCancelled++;
    }
  }

  // Today's capacity
  var offMap = getDoctorOffDates_();
  var extraMap = getDoctorExtraSlots_();
  var todaySlots = buildSlotsForDate_(today, extraMap[todayKey] || null);
  var todayCapacity = todaySlots.length;
  var offEntry = offMap[todayKey];
  if (offEntry) {
    if (offEntry.allDay) { todayCapacity = 0; }
    else if (offEntry.blocks) {
      for (var s = 0; s < todaySlots.length; s++) {
        var slotMin = parseTimeToMinutes_(todaySlots[s].start);
        for (var bl = 0; bl < offEntry.blocks.length; bl++) {
          if (slotMin >= offEntry.blocks[bl].startMin && slotMin < offEntry.blocks[bl].endMin) {
            todayCapacity--; break;
          }
        }
      }
    }
  }

  return {
    ok: true,
    todayKey: todayKey,
    tomorrowKey: tomorrowKey,
    todayAppointments: todayAppts,
    tomorrowAppointments: tomorrowAppts,
    doctorOffEntries: futureOffRows,
    extraSlotEntries: futureExtraRows,
    stats: {
      weekBooked: weekBooked,
      weekCancelled: weekCancelled,
      todayCapacity: todayCapacity
    },
    _v: getDataVersion_()
  };
}

/**
 * Get appointments for a specific date (admin).
 */
function apiAdminGetDateAppointments(sig, dateKey) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  dateKey = String(dateKey || '').trim();
  if (!dateKey) return { ok: false, reason: 'Missing date.' };

  var appts = listNonCancelledAppointmentsForDate_(dateKey);
  return { ok: true, dateKey: dateKey, appointments: appts };
}

/**
 * Mark doctor as unavailable for a date range.
 */
function apiAdminMarkDoctorOff(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var startDate = String(payload.startDate || '').trim();
  var endDate = String(payload.endDate || startDate).trim();
  var startTime = String(payload.startTime || '').trim();
  var endTime = String(payload.endTime || '').trim();
  var reason = String(payload.reason || 'Doctor not available').trim();

  if (!startDate) return { ok: false, reason: 'Missing start date.' };

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { ok: false, reason: 'Invalid start date format. Use YYYY-MM-DD.' };
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return { ok: false, reason: 'Invalid end date format. Use YYYY-MM-DD.' };

  // Validate time format if provided
  if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) return { ok: false, reason: 'Invalid start time format. Use HH:mm.' };
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) return { ok: false, reason: 'Invalid end time format. Use HH:mm.' };

  addDoctorOffRow_(startDate, endDate, startTime, endTime, reason);
  bumpVersion_();

  // Find affected appointments
  var affected = [];
  var sd = parseDateKey_(startDate);
  var ed = parseDateKey_(endDate || startDate);
  if (ed.getTime() < sd.getTime()) { var tmp = sd; sd = ed; ed = tmp; }

  var d = new Date(sd.getTime());
  while (d.getTime() <= ed.getTime()) {
    var dk = toDateKey_(d);
    var appts = listActiveAppointmentsForDate_(dk);
    for (var i = 0; i < appts.length; i++) {
      // If no time specified (all day), all appointments are affected
      if (!startTime && !endTime) {
        affected.push(appts[i]);
      } else {
        // Check if appointment overlaps with the blocked time window
        var aStart = parseTimeToMinutes_(appts[i].startTime);
        var aEnd = parseTimeToMinutes_(appts[i].endTime);
        var bStart = startTime ? parseTimeToMinutes_(startTime) : 0;
        var bEnd = endTime ? parseTimeToMinutes_(endTime) : 1440;
        if (aStart < bEnd && aEnd > bStart) {
          affected.push(appts[i]);
        }
      }
    }
    d = addMinutes_(d, 24 * 60);
  }

  return {
    ok: true,
    message: 'Doctor marked as unavailable.',
    affectedAppointments: affected
  };
}

/**
 * Add extra time slots for a date.
 */
function apiAdminAddExtraSlots(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var date = String(payload.date || '').trim();
  var endDate = String(payload.endDate || '').trim();
  var startTime = String(payload.startTime || '').trim();
  var endTime = String(payload.endTime || '').trim();
  var reason = String(payload.reason || 'Extra hours').trim();

  if (!date) return { ok: false, reason: 'Missing date.' };
  if (!startTime) return { ok: false, reason: 'Missing start time.' };
  if (!endTime) return { ok: false, reason: 'Missing end time.' };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'Invalid date format.' };
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return { ok: false, reason: 'Invalid end date format.' };
  if (!/^\d{2}:\d{2}$/.test(startTime)) return { ok: false, reason: 'Invalid start time format.' };
  if (!/^\d{2}:\d{2}$/.test(endTime)) return { ok: false, reason: 'Invalid end time format.' };

  var stMin = parseTimeToMinutes_(startTime);
  var enMin = parseTimeToMinutes_(endTime);
  if (enMin <= stMin) return { ok: false, reason: 'End time must be after start time.' };

  // Support date ranges: add a row for each date in the range
  var startD = new Date(date + 'T00:00:00');
  var endD = endDate ? new Date(endDate + 'T00:00:00') : startD;
  if (endD < startD) { var tmp = startD; startD = endD; endD = tmp; }

  var daysAdded = 0;
  var cur = new Date(startD);
  while (cur <= endD) {
    var key = Utilities.formatDate(cur, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    addDoctorExtraRow_(key, startTime, endTime, reason);
    daysAdded++;
    cur.setDate(cur.getDate() + 1);
  }

  bumpVersion_();

  var slotsPerDay = Math.floor((enMin - stMin) / CFG().APPT_DURATION_MIN);
  var totalSlots = slotsPerDay * daysAdded;

  var msg = 'Added extra time: ' + startTime + ' - ' + endTime;
  if (daysAdded === 1) {
    msg += ' on ' + date + ' (' + totalSlots + ' slots).';
  } else {
    msg += ' for ' + daysAdded + ' days (' + totalSlots + ' total slots).';
  }

  return { ok: true, message: msg };
}

/**
 * Process affected appointments for a date: cancel, redirect, or push.
 */
function apiAdminProcessAppointments(sig, payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

    payload = payload || {};
    var dateKey = String(payload.dateKey || '').trim();
    var action = String(payload.action || '').trim();
    var customMessage = String(payload.customMessage || '').trim();
    var appointmentIds = payload.appointmentIds || [];

    if (!dateKey) return { ok: false, reason: 'Missing date.' };
    if (!action) return { ok: false, reason: 'Missing action.' };

    var validActions = ['cancel', 'redirect_spinola', 'push_next_day'];
    if (validActions.indexOf(action) < 0) return { ok: false, reason: 'Invalid action. Use: cancel, redirect_spinola, or push_next_day.' };

    var allAppts = listActiveAppointmentsForDate_(dateKey);

    // Filter to selected appointments if IDs provided
    var appts = [];
    if (appointmentIds.length > 0) {
      var idSet = {};
      for (var a = 0; a < appointmentIds.length; a++) {
        idSet[String(appointmentIds[a])] = true;
      }
      for (var b = 0; b < allAppts.length; b++) {
        if (idSet[allAppts[b].appointmentId]) appts.push(allAppts[b]);
      }
    } else {
      appts = allAppts;
    }

    if (!appts.length) return { ok: true, message: 'No appointments to process.', processed: 0 };

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");
    var results = [];

    if (action === 'cancel') {
      for (var i = 0; i < appts.length; i++) {
        var appt = appts[i];
        var found = findAppointmentByToken_(appt.token);
        if (!found) continue;

        var eventId = String(appt.calendarEventId || '').trim();
        if (eventId) { try { deleteCalendarEvent_(eventId); } catch (e) {} }

        updateAppointmentStatus_(found.sheetName, found.rowIndex, {
          status: 'CANCELLED_DOCTOR',
          cancelledAt: nowStr,
          cancelReason: customMessage || 'Doctor unavailable',
          calendarEventId: ''
        });

        var msg = customMessage || 'We apologise, the doctor is unavailable on ' + dateKey + '. Your appointment has been cancelled. Please rebook at your convenience.';
        try { sendClientCancelledEmail_(appt, msg); } catch (e1) {}

        results.push({ appointmentId: appt.appointmentId, action: 'cancelled', patient: appt.fullName });
      }
    }

    if (action === 'redirect_spinola') {
      var spinolaLoc = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

      for (var j = 0; j < appts.length; j++) {
        var appt2 = appts[j];
        var found2 = findAppointmentByToken_(appt2.token);
        if (!found2) continue;

        updateAppointmentStatus_(found2.sheetName, found2.rowIndex, {
          status: 'RELOCATED_SPINOLA',
          location: spinolaLoc
        });

        var calEvId = String(appt2.calendarEventId || '').trim();
        if (calEvId) {
          try { updateCalendarEventLocation_(calEvId, spinolaLoc, appt2.serviceName + ' - ' + appt2.fullName + ' [SPINOLA]'); } catch (e2) {}
        }

        try { sendRedirectToSpinolaEmail_(appt2, spinolaLoc); } catch (e3) {}

        results.push({ appointmentId: appt2.appointmentId, action: 'redirected_spinola', patient: appt2.fullName });
      }
    }

    if (action === 'push_next_day') {
      var offMap = getDoctorOffDates_();
      var nextDay = findNextAvailableDay_(dateKey, offMap);

      if (!nextDay) {
        return { ok: false, reason: 'Could not find an available day in the next 30 days to push appointments to.' };
      }

      var nextDateObj = parseDateKey_(nextDay);
      var extraMap = getDoctorExtraSlots_();
      var extras = extraMap[nextDay] || null;
      var availableSlots = buildSlotsForDate_(nextDateObj, extras);

      // Check which slots are already taken on the target day
      var nextDayAppts = listActiveAppointmentsForDate_(nextDay);
      var takenOnNextDay = {};
      for (var t = 0; t < nextDayAppts.length; t++) {
        takenOnNextDay[nextDayAppts[t].startTime] = true;
      }

      for (var k = 0; k < appts.length; k++) {
        var appt3 = appts[k];
        var found3 = findAppointmentByToken_(appt3.token);
        if (!found3) continue;

        // Try to find the same time slot on the next day
        var newStartTime = null;
        var newEndTime = null;

        // First try same time
        if (!takenOnNextDay[appt3.startTime]) {
          for (var sl = 0; sl < availableSlots.length; sl++) {
            if (availableSlots[sl].start === appt3.startTime) {
              if (!slotBlockedByDoctorOff_(getDoctorOffEntryForDate_(offMap, nextDay), availableSlots[sl].start, availableSlots[sl].end)) {
                newStartTime = availableSlots[sl].start;
                newEndTime = availableSlots[sl].end;
                break;
              }
            }
          }
        }

        // If same time not available, find next available slot
        if (!newStartTime) {
          for (var sl2 = 0; sl2 < availableSlots.length; sl2++) {
            if (!takenOnNextDay[availableSlots[sl2].start]) {
              if (!slotBlockedByDoctorOff_(getDoctorOffEntryForDate_(offMap, nextDay), availableSlots[sl2].start, availableSlots[sl2].end)) {
                newStartTime = availableSlots[sl2].start;
                newEndTime = availableSlots[sl2].end;
                break;
              }
            }
          }
        }

        if (!newStartTime) {
          // No slot available — cancel instead
          var evId = String(appt3.calendarEventId || '').trim();
          if (evId) { try { deleteCalendarEvent_(evId); } catch (e4) {} }

          updateAppointmentStatus_(found3.sheetName, found3.rowIndex, {
            status: 'CANCELLED_DOCTOR',
            cancelledAt: nowStr,
            cancelReason: 'No available slot on ' + nextDay,
            calendarEventId: ''
          });

          try { sendClientCancelledEmail_(appt3, 'Your appointment could not be rescheduled as no slots were available. Please rebook at your convenience.'); } catch (e5) {}
          results.push({ appointmentId: appt3.appointmentId, action: 'cancelled_no_slot', patient: appt3.fullName });
          continue;
        }

        // Cancel old calendar event
        var oldEvId = String(appt3.calendarEventId || '').trim();
        if (oldEvId) { try { deleteCalendarEvent_(oldEvId); } catch (e6) {} }

        // Cancel old appointment
        updateAppointmentStatus_(found3.sheetName, found3.rowIndex, {
          status: 'CANCELLED_DOCTOR',
          cancelledAt: nowStr,
          cancelReason: 'Pushed to ' + nextDay + ' ' + newStartTime,
          calendarEventId: ''
        });

        // Create new appointment on next day
        var newToken = Utilities.getUuid();
        var newAppt = {
          appointmentId: 'A-' + Utilities.getUuid(),
          dateKey: nextDay,
          startTime: newStartTime,
          endTime: newEndTime,
          serviceId: appt3.serviceId,
          serviceName: appt3.serviceName,
          fullName: appt3.fullName,
          email: appt3.email,
          phone: appt3.phone,
          comments: appt3.comments,
          status: 'BOOKED',
          location: appt3.location,
          createdAt: nowStr,
          updatedAt: nowStr,
          token: newToken,
          calendarEventId: '',
          cancelledAt: '',
          cancelReason: ''
        };

        var newEventId = '';
        try { newEventId = createCalendarEvent_(newAppt); } catch (e7) {}
        newAppt.calendarEventId = newEventId;

        appendAppointment_(nextDay, newAppt);
        takenOnNextDay[newStartTime] = true;

        try { sendAppointmentPushedEmail_(appt3, nextDay, newStartTime, newEndTime); } catch (e8) {}

        results.push({ appointmentId: newAppt.appointmentId, action: 'pushed', patient: appt3.fullName, newDate: nextDay, newTime: newStartTime });
      }
    }

    if (results.length > 0) bumpVersion_();

    return {
      ok: true,
      message: 'Processed ' + results.length + ' appointment(s).',
      processed: results.length,
      results: results,
      nextDay: action === 'push_next_day' ? (nextDay || null) : undefined
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Remove a DoctorOff entry by row index.
 */
function apiAdminRemoveDoctorOff(sig, rowIndex) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  rowIndex = Number(rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return { ok: false, reason: 'Invalid row index.' };
  deleteDoctorOffRow_(rowIndex);
  bumpVersion_();
  return { ok: true, message: 'Doctor-off entry removed. Slots are now available for booking.' };
}

/**
 * Remove a DoctorExtra entry by row index.
 */
function apiAdminRemoveExtraSlots(sig, rowIndex) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };
  rowIndex = Number(rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return { ok: false, reason: 'Invalid row index.' };
  deleteDoctorExtraRow_(rowIndex);
  bumpVersion_();
  return { ok: true, message: 'Extra slots entry removed.' };
}

/**
 * Send custom notification to selected patients.
 */
function apiAdminNotifyPatients(sig, payload) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  payload = payload || {};
  var dateKey = String(payload.dateKey || '').trim();
  var appointmentIds = payload.appointmentIds || [];
  var message = String(payload.message || '').trim();

  if (!dateKey) return { ok: false, reason: 'Missing date.' };
  if (!message) return { ok: false, reason: 'Missing message.' };
  if (!appointmentIds.length) return { ok: false, reason: 'No appointments selected.' };

  var allAppts = listActiveAppointmentsForDate_(dateKey);
  var idSet = {};
  for (var i = 0; i < appointmentIds.length; i++) {
    idSet[String(appointmentIds[i])] = true;
  }

  var sent = 0;
  for (var j = 0; j < allAppts.length; j++) {
    if (!idSet[allAppts[j].appointmentId]) continue;
    try {
      sendCustomNotificationEmail_(allAppts[j], message);
      sent++;
    } catch (e) {}
  }

  return { ok: true, message: 'Notification sent to ' + sent + ' patient(s).', sent: sent };
}

/**
 * Get week overview: appointment counts per day for a given week.
 */
function apiAdminGetWeekOverview(sig, weekStartDate) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  weekStartDate = String(weekStartDate || '').trim();
  if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    return { ok: false, reason: 'Invalid week start date.' };
  }

  var offRows = getDoctorOffRows_();
  var extraRows = getDoctorExtraRows_();
  var days = [];

  for (var d = 0; d < 7; d++) {
    var dt = new Date(weekStartDate + 'T00:00:00');
    dt.setDate(dt.getDate() + d);
    var dk = toDateKey_(dt);

    var count = 0;
    var vals = getDayRows_(dk);
    for (var r = 0; r < vals.length; r++) {
      var st = String(vals[r][10] || '');
      if (st === 'BOOKED' || st === 'RELOCATED_SPINOLA' || st === 'ATTENDED') count++;
    }

    // Check for blocks on this date
    var hasBlock = false;
    for (var b = 0; b < offRows.length; b++) {
      if (offRows[b].startDate <= dk && offRows[b].endDate >= dk) { hasBlock = true; break; }
    }

    // Check for extras on this date
    var hasExtra = false;
    for (var e = 0; e < extraRows.length; e++) {
      if (extraRows[e].date === dk) { hasExtra = true; break; }
    }

    // Check if this day has working hours
    var dowKey = dayOfWeekKey_(dt);
    var hasHours = (CFG().HOURS[dowKey] || []).length > 0;

    days.push({ dateKey: dk, count: count, hasBlock: hasBlock, hasExtra: hasExtra, hasHours: hasHours });
  }

  return { ok: true, days: days };
}

/**
 * Search appointments by patient name or phone.
 */
function apiAdminSearchAppointments(sig, query) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  query = String(query || '').trim().toLowerCase();
  if (!query || query.length < 2) return { ok: false, reason: 'Query too short.' };

  var today = todayLocal_();
  var results = [];
  var seenDates = {};

  // Search live sheets: past 30 days + future 14 days
  for (var d = -30; d <= 14; d++) {
    if (results.length >= 50) break;
    var dt = addMinutes_(today, d * 24 * 60);
    var dk = toDateKey_(dt);
    seenDates[dk] = true;
    var vals = getDayRows_(dk);
    if (!vals.length) continue;
    for (var r = 0; r < vals.length; r++) {
      if (results.length >= 50) break;
      var name = String(vals[r][6] || '').toLowerCase();
      var phone = String(vals[r][8] || '').toLowerCase();
      var status = String(vals[r][10] || '');
      if (name.indexOf(query) >= 0 || phone.indexOf(query) >= 0) {
        results.push({
          dateKey: dk,
          appointmentId: String(vals[r][0] || ''),
          startTime: normalizeTimeCell_(vals[r][2]),
          endTime: normalizeTimeCell_(vals[r][3]),
          serviceName: String(vals[r][5] || ''),
          fullName: String(vals[r][6] || ''),
          email: String(vals[r][7] || ''),
          phone: String(vals[r][8] || ''),
          status: status,
          location: String(vals[r][11] || '')
        });
      }
    }
  }

  // Also search full archive for dates outside the live window
  if (results.length < 50) {
    var archive = loadArchiveData_();
    var archiveDates = Object.keys(archive).sort().reverse();
    for (var a = 0; a < archiveDates.length; a++) {
      if (results.length >= 50) break;
      var adk = archiveDates[a];
      if (seenDates[adk]) continue;
      var avals = archive[adk];
      for (var ar = 0; ar < avals.length; ar++) {
        if (results.length >= 50) break;
        var aname = String(avals[ar][6] || '').toLowerCase();
        var aphone = String(avals[ar][8] || '').toLowerCase();
        if (aname.indexOf(query) >= 0 || aphone.indexOf(query) >= 0) {
          results.push({
            dateKey: adk,
            appointmentId: String(avals[ar][0] || ''),
            startTime: normalizeTimeCell_(avals[ar][2]),
            endTime: normalizeTimeCell_(avals[ar][3]),
            serviceName: String(avals[ar][5] || ''),
            fullName: String(avals[ar][6] || ''),
            email: String(avals[ar][7] || ''),
            phone: String(avals[ar][8] || ''),
            status: String(avals[ar][10] || ''),
            location: String(avals[ar][11] || '')
          });
        }
      }
    }
  }

  // Sort by date descending (most recent first)
  results.sort(function(a, b) { return a.dateKey > b.dateKey ? -1 : a.dateKey < b.dateKey ? 1 : 0; });

  return { ok: true, results: results, total: results.length };
}

/**
 * Get admin settings.
 */
function apiAdminGetSettings(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var props = getScriptProps_();
  var hoursJson = props.getProperty('WORKING_HOURS');
  var hours = null;
  if (hoursJson) { try { hours = JSON.parse(hoursJson); } catch (e) {} }
  if (!hours) hours = DEFAULT_HOURS;

  return {
    ok: true,
    settings: {
      doctorEmail: props.getProperty(CFG().PROP_DOCTOR_EMAIL) || '',
      timezone: props.getProperty(CFG().PROP_TIMEZONE) || 'Europe/Malta',
      pottersLocation: props.getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic",
      spinolaLocation: props.getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic',
      apptDurationMin: CFG().APPT_DURATION_MIN,
      advanceDays: CFG().ADVANCE_DAYS,
      maxActiveApptsPerPerson: parseInt(props.getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON) || '0', 10),
      workingHours: hours
    }
  };
}

/**
 * Save admin settings.
 */
function apiAdminSaveSettings(sig, settings) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  settings = settings || {};
  var props = getScriptProps_();

  // Save simple string properties
  if (settings.doctorEmail !== undefined) props.setProperty(CFG().PROP_DOCTOR_EMAIL, String(settings.doctorEmail).trim());
  if (settings.timezone !== undefined) props.setProperty(CFG().PROP_TIMEZONE, String(settings.timezone).trim());
  if (settings.pottersLocation !== undefined) props.setProperty(CFG().PROP_POTTERS_LOCATION, String(settings.pottersLocation).trim());
  if (settings.spinolaLocation !== undefined) props.setProperty(CFG().PROP_SPINOLA_LOCATION, String(settings.spinolaLocation).trim());

  // Save numeric properties
  if (settings.apptDurationMin !== undefined) {
    var dur = parseInt(settings.apptDurationMin, 10);
    if (isNaN(dur) || dur < 1) return { ok: false, reason: 'Appointment duration must be at least 1 minute.' };
    props.setProperty('APPT_DURATION_MIN', String(dur));
  }
  if (settings.advanceDays !== undefined) {
    var adv = parseInt(settings.advanceDays, 10);
    if (isNaN(adv) || adv < 1) return { ok: false, reason: 'Advance days must be at least 1.' };
    props.setProperty('ADVANCE_DAYS', String(adv));
  }
  if (settings.maxActiveApptsPerPerson !== undefined) {
    var max = parseInt(settings.maxActiveApptsPerPerson, 10);
    if (isNaN(max) || max < 0) max = 0;
    props.setProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON, String(max));
  }

  // Save working hours
  if (settings.workingHours !== undefined) {
    var wh = settings.workingHours;
    // Validate structure
    var validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    for (var i = 0; i < validDays.length; i++) {
      var dayKey = validDays[i];
      if (!wh[dayKey]) wh[dayKey] = [];
      if (!Array.isArray(wh[dayKey])) return { ok: false, reason: 'Working hours for ' + dayKey + ' must be an array.' };
      for (var j = 0; j < wh[dayKey].length; j++) {
        var block = wh[dayKey][j];
        if (!block.start || !block.end) return { ok: false, reason: 'Each time block must have start and end times.' };
        if (!/^\d{2}:\d{2}$/.test(block.start) || !/^\d{2}:\d{2}$/.test(block.end)) {
          return { ok: false, reason: 'Time format must be HH:mm.' };
        }
      }
    }
    props.setProperty('WORKING_HOURS', JSON.stringify(wh));
  }

  // Clear config cache so changes take effect
  _cfgCache = null;
  _propsCache = null;
  _tzCache = null;

  return { ok: true, message: 'Settings saved successfully.' };
}

/**
 * Statistics data for admin analytics dashboard.
 * Scans 28 days back + 7 days forward.
 */
function apiAdminGetStatistics(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var offMap = getDoctorOffDates_();
  var extraMap = getDoctorExtraSlots_();

  var PAST_DAYS = 28;
  var FUTURE_DAYS = 7;
  var dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dowKeys = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  // Accumulators
  var totalBooked = 0, totalCancelled = 0;
  var cancelByDoctor = 0, cancelByPatient = 0;
  var locationPotters = 0, locationSpinola = 0;
  var totalNoShow = 0, totalAttended = 0, sameDayCancels = 0;
  var leadTimes = [];
  var recentBooked = 0, prevBooked = 0; // for period comparison
  var hourCounts = []; for (var h = 0; h < 24; h++) hourCounts.push(0);
  var dowBooked = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 };
  var dowSlots = { MON:0, TUE:0, WED:0, THU:0, FRI:0, SAT:0, SUN:0 };
  var patientMap = {}; // email/phone -> { name, count }
  var busiestDay = { dateKey: '', count: 0, dayName: '' };

  // Weekly trend: bucket by week (Mon-Sun)
  var weekBuckets = {}; // mondayKey -> { booked, cancelled, label }

  // Upcoming load (future days only)
  var upcomingLoad = [];

  var fromKey = toDateKey_(addMinutes_(today, -PAST_DAYS * 1440));
  var toKey = toDateKey_(addMinutes_(today, FUTURE_DAYS * 1440));

  for (var i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
    var d = addMinutes_(today, i * 1440);
    var dk = toDateKey_(d);
    var dow = dayOfWeekKey_(d);

    // Compute available slots for this day
    var holiday = isHolidayOrClosed_(d);
    var daySlotCount = 0;
    if (!holiday.closed) {
      var offEntry = offMap[dk];
      if (!offEntry || !offEntry.allDay) {
        var extraSlots = extraMap[dk] || [];
        var slots = buildSlotsForDate_(d, extraSlots);
        // Subtract blocked time slots
        if (offEntry && offEntry.blocks) {
          var unblockedSlots = [];
          for (var s = 0; s < slots.length; s++) {
            var slotMin = parseTimeToMinutes_(slots[s].start);
            var blocked = false;
            for (var b = 0; b < offEntry.blocks.length; b++) {
              if (slotMin >= offEntry.blocks[b].startMin && slotMin < offEntry.blocks[b].endMin) {
                blocked = true; break;
              }
            }
            if (!blocked) unblockedSlots.push(slots[s]);
          }
          daySlotCount = unblockedSlots.length;
        } else {
          daySlotCount = slots.length;
        }
      }
    }
    dowSlots[dow] += daySlotCount;

    // Read appointments for this day (live sheet or archive)
    var vals = getDayRows_(dk);
    var dayBooked = 0;
    var dayCancelled = 0;
    if (vals.length) {
        for (var r = 0; r < vals.length; r++) {
          var status = String(vals[r][10] || '');
          var startTime = normalizeTimeCell_(vals[r][2]);

          if (status === 'BOOKED' || status === 'RELOCATED_SPINOLA' || status === 'ATTENDED') {
            totalBooked++;
            dayBooked++;

            // Hour distribution
            if (startTime) {
              var hr = Math.floor(parseTimeToMinutes_(startTime) / 60);
              if (hr >= 0 && hr < 24) hourCounts[hr]++;
            }

            // Location
            var loc = String(vals[r][11] || '').toLowerCase();
            if (loc.indexOf('spinola') >= 0) locationSpinola++;
            else locationPotters++;

            // DOW booked count
            dowBooked[dow]++;

            // Patient tracking
            var email = String(vals[r][7] || '').trim().toLowerCase();
            var phone = String(vals[r][8] || '').trim();
            var pKey = email || phone;
            if (pKey) {
              if (!patientMap[pKey]) {
                patientMap[pKey] = { name: String(vals[r][6] || ''), count: 0 };
              }
              patientMap[pKey].count++;
            }

            // Lead time (days between booking creation and appointment date)
            var createdAt = String(vals[r][12] || '');
            if (createdAt && createdAt.length >= 10) {
              var createdDate = createdAt.substring(0, 10);
              var leadDays = daysBetween_(createdDate, dk);
              if (leadDays >= 0) leadTimes.push(leadDays);
            }

            // Attendance tracking
            if (status === 'ATTENDED') totalAttended++;
          } else if (status === 'NO_SHOW') {
            totalNoShow++;
            dayBooked++; // Count in booked totals for capacity purposes
            totalBooked++;
            dowBooked[dow]++;
          } else if (status.indexOf('CANCELLED') >= 0) {
            totalCancelled++;
            dayCancelled++;
            if (status === 'CANCELLED_DOCTOR') cancelByDoctor++;
            else cancelByPatient++;

            // Same-day cancellation check
            var cancelledAt = String(vals[r][16] || '');
            if (cancelledAt && cancelledAt.length >= 10 && cancelledAt.substring(0, 10) === dk) {
              sameDayCancels++;
            }
          }
        }
    }

    // Period comparison (recent 14 days vs previous 14 days)
    if (i >= -PAST_DAYS && i < -PAST_DAYS / 2) prevBooked += dayBooked;
    else if (i >= -PAST_DAYS / 2 && i <= 0) recentBooked += dayBooked;

    // Busiest day
    if (dayBooked > busiestDay.count) {
      busiestDay = { dateKey: dk, count: dayBooked, dayName: dayLabels[d.getDay()] };
    }

    // Weekly trend bucketing (find Monday of this day's week)
    var dayOfWeek = d.getDay(); // 0=Sun
    var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    var monday = addMinutes_(d, mondayOffset * 1440);
    var mondayKey = toDateKey_(monday);
    if (!weekBuckets[mondayKey]) {
      var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      weekBuckets[mondayKey] = { booked: 0, cancelled: 0, label: monthNames[monday.getMonth()] + ' ' + monday.getDate() };
    }
    weekBuckets[mondayKey].booked += dayBooked;
    weekBuckets[mondayKey].cancelled += dayCancelled;

    // Upcoming load (future days including today)
    if (i >= 0 && i <= FUTURE_DAYS) {
      upcomingLoad.push({
        dateKey: dk,
        dayLabel: dayLabels[d.getDay()],
        booked: dayBooked,
        capacity: daySlotCount
      });
    }
  }

  // Compute utilization
  var totalSlots = 0, totalUsed = 0;
  var utilizationByDay = {};
  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  for (var di = 0; di < dayOrder.length; di++) {
    var dayK = dayOrder[di];
    totalSlots += dowSlots[dayK];
    totalUsed += dowBooked[dayK];
    utilizationByDay[dayK] = dowSlots[dayK] > 0 ? Math.round(dowBooked[dayK] / dowSlots[dayK] * 100) : 0;
  }
  var utilization = totalSlots > 0 ? Math.round(totalUsed / totalSlots * 1000) / 10 : 0;

  // Cancel rate
  var totalAll = totalBooked + totalCancelled;
  var cancelRate = totalAll > 0 ? Math.round(totalCancelled / totalAll * 1000) / 10 : 0;

  // Enrich patient map with archive data (so repeat/unique counts are accurate)
  var archive = loadArchiveData_();
  var archiveDates = Object.keys(archive);
  for (var ai = 0; ai < archiveDates.length; ai++) {
    var adk = archiveDates[ai];
    // Skip dates already covered by the live window
    if (adk >= fromKey && adk <= toKey) continue;
    var avals = archive[adk];
    for (var ar = 0; ar < avals.length; ar++) {
      var ast = String(avals[ar][10] || '');
      if (ast === 'BOOKED' || ast === 'RELOCATED_SPINOLA' || ast === 'ATTENDED' || ast === 'NO_SHOW') {
        var aemail = String(avals[ar][7] || '').trim().toLowerCase();
        var aphone = String(avals[ar][8] || '').trim();
        var apKey = aemail || aphone;
        if (apKey) {
          if (!patientMap[apKey]) {
            patientMap[apKey] = { name: String(avals[ar][6] || ''), count: 0 };
          }
          patientMap[apKey].count++;
        }
      }
    }
  }

  // Patient insights
  var patientKeys = Object.keys(patientMap);
  var totalUniquePatients = patientKeys.length;
  var repeatPatients = 0;
  var patientList = [];
  for (var pi = 0; pi < patientKeys.length; pi++) {
    var p = patientMap[patientKeys[pi]];
    if (p.count >= 2) repeatPatients++;
    patientList.push(p);
  }
  patientList.sort(function(a, b) { return b.count - a.count; });
  var topPatients = patientList.slice(0, 5).map(function(p) { return { name: p.name, count: p.count }; });

  // Weekly trend: sort by date and take last 4 weeks
  var weekKeys = Object.keys(weekBuckets).sort();
  var weeklyTrend = [];
  for (var wi = 0; wi < weekKeys.length; wi++) {
    weeklyTrend.push(weekBuckets[weekKeys[wi]]);
  }
  // Take last 4 weeks
  if (weeklyTrend.length > 4) weeklyTrend = weeklyTrend.slice(weeklyTrend.length - 4);

  // Lead time average
  var avgLeadTimeDays = 0;
  if (leadTimes.length > 0) {
    var sum = 0;
    for (var li = 0; li < leadTimes.length; li++) sum += leadTimes[li];
    avgLeadTimeDays = Math.round(sum / leadTimes.length * 10) / 10;
  }

  // No-show rate
  var attendanceTotal = totalAttended + totalNoShow;
  var noShowRate = attendanceTotal > 0 ? Math.round(totalNoShow / attendanceTotal * 1000) / 10 : 0;

  // Trend direction
  var trendDirection = recentBooked > prevBooked ? 'up' : recentBooked < prevBooked ? 'down' : 'flat';
  var trendPct = prevBooked > 0 ? Math.round(Math.abs(recentBooked - prevBooked) / prevBooked * 100) : 0;

  return {
    ok: true,
    generated: Utilities.formatDate(new Date(), getTimeZone_(), "yyyy-MM-dd HH:mm"),
    period: { from: fromKey, to: toKey },
    totalBooked: totalBooked,
    totalCancelled: totalCancelled,
    cancelRate: cancelRate,
    utilization: utilization,
    utilizationByDay: utilizationByDay,
    weeklyTrend: weeklyTrend,
    hourlyDistribution: hourCounts,
    busiestDay: busiestDay,
    locationSplit: { potters: locationPotters, spinola: locationSpinola },
    cancelBreakdown: { byDoctor: cancelByDoctor, byPatient: cancelByPatient },
    totalUniquePatients: totalUniquePatients,
    repeatPatients: repeatPatients,
    topPatients: topPatients,
    upcomingLoad: upcomingLoad,
    avgLeadTimeDays: avgLeadTimeDays,
    totalNoShow: totalNoShow,
    totalAttended: totalAttended,
    noShowRate: noShowRate,
    sameDayCancels: sameDayCancels,
    trendDirection: trendDirection,
    trendPct: trendPct
  };
}

/**
 * Mark appointment as attended or no-show.
 */
function apiAdminMarkAttendance(sig, appointmentId, dateKey, attended) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  appointmentId = String(appointmentId || '').trim();
  dateKey = String(dateKey || '').trim();
  if (!appointmentId || !dateKey) return { ok: false, reason: 'Missing appointment ID or date.' };

  var ss = getAppointmentsSpreadsheet_();
  var sh = ss.getSheetByName(dateKey);
  if (!sh) return { ok: false, reason: 'Date sheet not found.' };

  var lr = sh.getLastRow();
  if (lr < 2) return { ok: false, reason: 'No appointments on this date.' };

  var vals = sh.getRange(2, 1, lr - 1, 18).getValues();
  for (var r = 0; r < vals.length; r++) {
    if (String(vals[r][0] || '') === appointmentId) {
      var newStatus = attended ? 'ATTENDED' : 'NO_SHOW';
      updateAppointmentStatus_(dateKey, r + 2, { status: newStatus });
      bumpVersion_();
      return { ok: true, message: 'Marked as ' + (attended ? 'attended' : 'no-show') + '.' };
    }
  }

  return { ok: false, reason: 'Appointment not found.' };
}

/**
 * Get patient history by email or phone.
 */
function apiAdminGetPatientHistory(sig, email, phone) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  email = String(email || '').trim().toLowerCase();
  phone = String(phone || '').trim();
  if (!email && !phone) return { ok: false, reason: 'Missing email or phone.' };

  var today = todayLocal_();
  var results = [];
  var patientName = '';
  var patientEmail = '';
  var patientPhone = '';
  var firstSeen = '';
  var seenDates = {};

  // Search live sheets: 90 days back + 14 forward
  for (var d = -90; d <= 14; d++) {
    var dt = addMinutes_(today, d * 1440);
    var dk = toDateKey_(dt);
    seenDates[dk] = true;
    var vals = getDayRows_(dk);
    if (!vals.length) continue;
    for (var r = 0; r < vals.length; r++) {
      var e = String(vals[r][7] || '').trim().toLowerCase();
      var p = String(vals[r][8] || '').trim();
      var match = false;
      if (email && e === email) match = true;
      if (phone && p === phone) match = true;
      if (!match) continue;

      if (!patientName) patientName = String(vals[r][6] || '');
      if (!patientEmail && e) patientEmail = e;
      if (!patientPhone && p) patientPhone = p;
      if (!firstSeen || dk < firstSeen) firstSeen = dk;

      results.push({
        dateKey: dk,
        startTime: normalizeTimeCell_(vals[r][2]),
        endTime: normalizeTimeCell_(vals[r][3]),
        serviceName: String(vals[r][5] || ''),
        status: String(vals[r][10] || ''),
        location: String(vals[r][11] || ''),
        comments: String(vals[r][9] || ''),
        createdAt: String(vals[r][12] || '')
      });
    }
  }

  // Also search full archive for dates outside the live window
  var archive = loadArchiveData_();
  var archiveDates = Object.keys(archive);
  for (var a = 0; a < archiveDates.length; a++) {
    var adk = archiveDates[a];
    if (seenDates[adk]) continue;
    var avals = archive[adk];
    for (var ar = 0; ar < avals.length; ar++) {
      var ae = String(avals[ar][7] || '').trim().toLowerCase();
      var ap = String(avals[ar][8] || '').trim();
      var amatch = false;
      if (email && ae === email) amatch = true;
      if (phone && ap === phone) amatch = true;
      if (!amatch) continue;

      if (!patientName) patientName = String(avals[ar][6] || '');
      if (!patientEmail && ae) patientEmail = ae;
      if (!patientPhone && ap) patientPhone = ap;
      if (!firstSeen || adk < firstSeen) firstSeen = adk;

      results.push({
        dateKey: adk,
        startTime: normalizeTimeCell_(avals[ar][2]),
        endTime: normalizeTimeCell_(avals[ar][3]),
        serviceName: String(avals[ar][5] || ''),
        status: String(avals[ar][10] || ''),
        location: String(avals[ar][11] || ''),
        comments: String(avals[ar][9] || ''),
        createdAt: String(avals[ar][12] || '')
      });
    }
  }

  // Sort by date descending
  results.sort(function(a, b) { return a.dateKey > b.dateKey ? -1 : a.dateKey < b.dateKey ? 1 : 0; });

  // Compute stats
  var totalVisits = 0, cancelCount = 0, noShowCount = 0;
  for (var i = 0; i < results.length; i++) {
    var st = results[i].status;
    if (st === 'BOOKED' || st === 'RELOCATED_SPINOLA' || st === 'ATTENDED') totalVisits++;
    else if (st.indexOf('CANCELLED') >= 0) cancelCount++;
    else if (st === 'NO_SHOW') noShowCount++;
  }

  return {
    ok: true,
    patient: { name: patientName, email: patientEmail, phone: patientPhone },
    totalVisits: totalVisits,
    cancelCount: cancelCount,
    noShowCount: noShowCount,
    firstSeen: firstSeen,
    appointments: results
  };
}

/**
 * Archive old day sheets (older than 30 days) into a single Archive sheet.
 * Reduces spreadsheet sheet count for better performance.
 */
function apiAdminArchiveOldSheets(sig) {
  if (!verifyAdminSig_(sig)) return { ok: false, reason: 'Access denied.' };

  try {
    var result = archiveOldDaySheets_(30);
    if (result.archivedSheets === 0) {
      return { ok: true, message: 'Nothing to archive. All sheets are within the last 30 days.' };
    }
    return {
      ok: true,
      message: 'Archived ' + result.archivedSheets + ' day sheet' + (result.archivedSheets !== 1 ? 's' : '') +
               ' (' + result.archivedRows + ' appointment' + (result.archivedRows !== 1 ? 's' : '') + ') into the Archive sheet.'
    };
  } catch (e) {
    return { ok: false, reason: 'Archive failed: ' + (e.message || String(e)) };
  }
}
