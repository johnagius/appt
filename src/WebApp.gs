/***************
 * WebApp.gs
 ***************/

function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) ? String(e.parameter.mode) : 'book';

  if (mode === 'cancel') {
    var cancelHtml = _serveHtml('Cancel', {
      token: String((e.parameter && e.parameter.token) || ''),
      sig: String((e.parameter && e.parameter.sig) || '')
    });
    return cancelHtml
      .setTitle('Cancel Appointment')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  if (mode === 'docaction') {
    var docHtml = _serveHtml('DocAction', {
      token: String((e.parameter && e.parameter.token) || ''),
      act: String((e.parameter && e.parameter.act) || ''),
      sig: String((e.parameter && e.parameter.sig) || '')
    });
    return docHtml
      .setTitle('Doctor Action')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  if (mode === 'admin') {
    var adminSig = String((e.parameter && e.parameter.sig) || '');
    if (!verifyAdminSig_(adminSig)) {
      return HtmlService.createHtmlOutput('<h2>Access Denied</h2><p>Invalid or missing admin signature.</p>')
        .setTitle('Access Denied');
    }
    var adminHtml = _serveHtml('Admin', { adminSig: adminSig });
    return adminHtml
      .setTitle('Admin - Dr Kevin Navarro Gera')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }

  return _serveHtml('Index', {})
    .setTitle('Dr Kevin Navarro Gera - Booking')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Serve an HTML page from the _HTML_TEMPLATES global (populated by the bundle).
 * Replaces <?= varName ?> scriptlet placeholders with actual values.
 */
function _serveHtml(name, vars) {
  var html = (_HTML_TEMPLATES && _HTML_TEMPLATES[name]) || '';
  if (!html) throw new Error('HTML template not found: ' + name);

  // Replace GAS-style scriptlet placeholders: <?= varName ?>
  for (var key in vars) {
    // Escape the value for safe HTML embedding inside a JS string
    var safeVal = String(vars[key]).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
    html = html.replace(new RegExp('<\\?=\\s*' + key + '\\s*\\?>', 'g'), safeVal);
  }

  return HtmlService.createHtmlOutput(html);
}

function apiInit() {
  var extraMap = getDoctorExtraSlots_();
  return {
    config: {
      doctorName: 'Dr Kevin Navarro Gera',
      clinicName: "Potter's Pharmacy Clinic",
      apptMinutes: CFG().APPT_DURATION_MIN,
      services: CFG().SERVICES,
      timezone: getTimeZone_(),
      bookingPolicy: 'Choose a service and then select your time slot. You will receive confirmation by email. You can CANCEL your appointment from the email.',
      pottersLocation: (getScriptProps_().getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic"),
      spinolaLocation: (getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic')
    },
    dateOptions: apiGetDateOptions(extraMap)
  };
}

function apiGetDateOptions(extraMap) {
  var today = todayLocal_();
  var todayKey = toDateKey_(today);
  var nowMin = nowMinutesLocal_();

  var offMap = getDoctorOffDates_();
  if (!extraMap) extraMap = getDoctorExtraSlots_();
  var out = [];

  for (var i = 0; i <= CFG().ADVANCE_DAYS; i++) {
    var d = addMinutes_(today, i * 24 * 60);
    var dk = toDateKey_(d);

    var holiday = isHolidayOrClosed_(d);
    var reason = '';
    var disabled = false;

    var offEntry = getDoctorOffEntryForDate_(offMap, dk);

    if (!inAdvanceWindow_(d)) {
      disabled = true;
      reason = 'Outside booking window';
    } else if (holiday.closed) {
      disabled = true;
      reason = holiday.reason;
    } else if (offEntry && offEntry.allDay) {
      disabled = true;
      reason = doctorOffReason_(offEntry);
    } else {
      var extras = extraMap[dk] || null;
      var slots = buildSlotsForDate_(d, extras);

      if (!slots.length) {
        disabled = true;
        reason = 'Closed';
      } else if (dk === todayKey) {
        // Only disable today if the last slot has already ended.
        // Detailed per-slot availability (taken, past, blocked) is handled by apiGetAvailability.
        var lastEnd = 0;
        for (var s = 0; s < slots.length; s++) {
          var endM = parseTimeToMinutes_(slots[s].end);
          if (endM > lastEnd) lastEnd = endM;
        }
        if (nowMin >= lastEnd) {
          disabled = true;
          reason = 'No slots remaining today';
        }
      } else {
        var remaining = 0;
        for (var u = 0; u < slots.length; u++) {
          if (slotBlockedByDoctorOff_(offEntry, slots[u].start, slots[u].end)) continue;
          remaining++;
        }
        if (remaining === 0) {
          disabled = true;
          reason = offEntry ? doctorOffReason_(offEntry) : 'No slots available';
        }
      }
    }

    out.push({
      dateKey: dk,
      label: Utilities.formatDate(d, getTimeZone_(), 'EEE dd MMM yyyy'),
      disabled: disabled,
      reason: reason
    });
  }

  return out;
}

function apiRefreshDates() {
  return apiGetDateOptions(null);
}

function apiGetAvailability(dateKey) {
  dateKey = String(dateKey || '').trim();
  if (!dateKey) throw new Error('Missing dateKey');

  var d = parseDateKey_(dateKey);
  var today = todayLocal_();
  var todayKey = toDateKey_(today);

  if (d.getTime() < today.getTime()) {
    return { ok: false, reason: 'Date is in the past', dateKey: dateKey, slots: [] };
  }

  if (!inAdvanceWindow_(d)) {
    return { ok: false, reason: 'Outside booking window', dateKey: dateKey, slots: [] };
  }

  var holiday = isHolidayOrClosed_(d);
  if (holiday.closed) {
    return { ok: false, reason: holiday.reason, dateKey: dateKey, slots: [] };
  }

  var offMap = getDoctorOffDates_();
  var offEntry = getDoctorOffEntryForDate_(offMap, dateKey);

  if (offEntry && offEntry.allDay) {
    return { ok: false, reason: doctorOffReason_(offEntry), dateKey: dateKey, slots: [] };
  }

  var extraMap = getDoctorExtraSlots_();
  var extras = extraMap[dateKey] || null;
  var baseSlots = buildSlotsForDate_(d, extras);

  var appts = listAppointmentsForDate_(dateKey);
  var taken = {};
  var cancelledSlots = {};
  for (var i = 0; i < appts.length; i++) {
    var st = String(appts[i].startTime || '').trim();
    if (apptIsActive_(appts[i])) {
      taken[st] = true;
    } else {
      cancelledSlots[st] = true;
    }
  }

  var dc = (getScriptProps_().getProperty(CFG().PROP_DOUBLECHECK_CALENDAR) || 'true') === 'true';
  if (dc) {
    var calTaken = listCalendarTakenSlots_(dateKey);
    Object.keys(calTaken).forEach(function(k) {
      // DB is source of truth: don't let stale calendar events block cancelled slots
      if (!cancelledSlots[k]) {
        taken[k] = true;
      }
    });
  }

  var nowMin = nowMinutesLocal_();

  var outSlots = [];
  for (var s = 0; s < baseSlots.length; s++) {
    var slot = baseSlots[s];
    var startMin = parseTimeToMinutes_(slot.start);

    var past = (dateKey === todayKey) ? (startMin < nowMin) : false;
    var isTaken = !!taken[slot.start];
    var isOff = slotBlockedByDoctorOff_(offEntry, slot.start, slot.end);

    outSlots.push({
      start: slot.start,
      end: slot.end,
      available: (!past && !isTaken && !isOff)
    });
  }

  return { ok: true, dateKey: dateKey, slots: outSlots };
}

function getDoctorOffEntryForDate_(offMap, dateKey) {
  if (!offMap) return null;
  var e = offMap[dateKey];
  return e ? e : null;
}

function doctorOffReason_(offEntry) {
  if (!offEntry) return 'Doctor not available';
  var r = String(offEntry.reason || '').trim();
  return r ? r : 'Doctor not available';
}

function slotBlockedByDoctorOff_(offEntry, slotStart, slotEnd) {
  if (!offEntry) return false;
  if (offEntry.allDay) return true;

  var blocks = offEntry.blocks || [];
  if (!blocks.length) return false;

  var stMin = parseTimeToMinutes_(slotStart);
  var enMin = parseTimeToMinutes_(slotEnd);

  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    var bStart = Number(b.startMin);
    var bEnd = Number(b.endMin);

    if (stMin < bEnd && enMin > bStart) return true;
  }

  return false;
}


function apiBook(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    payload = payload || {};
    var dateKey = String(payload.dateKey || '').trim();
    var startTime = String(payload.startTime || '').trim();
    var serviceId = String(payload.serviceId || '').trim();

    var fullName = sanitizeName_(payload.fullName);
    var email = sanitizeEmail_(payload.email);
    var phone = sanitizePhone_(payload.phone);
    var comments = String(payload.comments || '').trim();

    if (!dateKey) throw new Error('Missing date');
    if (!startTime) throw new Error('Missing time');
    if (!serviceId) throw new Error('Missing service');
    if (!fullName) throw new Error('Missing full name');
    if (!email) throw new Error('Missing email');
    if (!phone) throw new Error('Missing phone');

    var d = parseDateKey_(dateKey);
    var today = todayLocal_();
    var todayKey = toDateKey_(today);

    if (d.getTime() < today.getTime()) throw new Error('You cannot book a past date.');
    if (!inAdvanceWindow_(d)) throw new Error('You can only book up to 7 days in advance.');

    var holiday = isHolidayOrClosed_(d);
    if (holiday.closed) throw new Error('Closed: ' + holiday.reason);

    var offMap = getDoctorOffDates_();
    var offEntry = getDoctorOffEntryForDate_(offMap, dateKey);

    if (offEntry && offEntry.allDay) throw new Error('Doctor not available: ' + doctorOffReason_(offEntry));

    if (dateKey === todayKey) {
      var nowMin = nowMinutesLocal_();
      var stMin = parseTimeToMinutes_(startTime);
      if (stMin < nowMin) {
        throw new Error('That time is already in the past. Please choose a later slot.');
      }
    }

    var maxActive = Number(getScriptProps_().getProperty(CFG().PROP_MAX_ACTIVE_APPTS_PER_PERSON) || '0');
    if (isNaN(maxActive) || maxActive < 0) maxActive = 0;

    if (maxActive > 0) {
      var activeCount = countActiveAppointmentsInWindow_(email, phone);
      if (activeCount >= maxActive) {
        throw new Error('You already have ' + activeCount + ' active appointment(s) in the next 7 days. Please cancel one before booking another.');
      }
    }

    if (personAlreadyBookedSameSlot_(dateKey, startTime, email, phone)) {
      throw new Error('You already booked this exact time slot. Please choose a different time.');
    }

    var extraMap = getDoctorExtraSlots_();
    var extras = extraMap[dateKey] || null;
    var slots = buildSlotsForDate_(d, extras);
    var slotFound = null;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].start === startTime) {
        slotFound = slots[i];
        break;
      }
    }
    if (!slotFound) throw new Error('Invalid slot');

    if (slotBlockedByDoctorOff_(offEntry, slotFound.start, slotFound.end)) {
      throw new Error('Doctor not available: ' + doctorOffReason_(offEntry));
    }

    var appts = listAppointmentsForDate_(dateKey);
    for (var j = 0; j < appts.length; j++) {
      if (apptIsActive_(appts[j]) && String(appts[j].startTime || '').trim() === startTime) {
        throw new Error('That slot was just taken. Please pick another.');
      }
    }

    var cancelledSlotsBook = {};
    for (var c = 0; c < appts.length; c++) {
      if (!apptIsActive_(appts[c])) {
        cancelledSlotsBook[String(appts[c].startTime || '').trim()] = true;
      }
    }
    var calTaken = listCalendarTakenSlots_(dateKey);
    if (calTaken[startTime] && !cancelledSlotsBook[startTime]) {
      throw new Error('That slot was just taken. Please pick another.');
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    var service = null;
    for (var k = 0; k < CFG().SERVICES.length; k++) {
      if (CFG().SERVICES[k].id === serviceId) { service = CFG().SERVICES[k]; break; }
    }
    if (!service) throw new Error('Unknown service');

    getOrCreateClient_(fullName, email, phone);

    var appointmentId = 'A-' + Utilities.getUuid();
    var token = Utilities.getUuid();

    var location = (getScriptProps_().getProperty(CFG().PROP_POTTERS_LOCATION) || "Potter's Pharmacy Clinic");

    var apptObj = {
      appointmentId: appointmentId,
      dateKey: dateKey,
      startTime: slotFound.start,
      endTime: slotFound.end,
      serviceId: service.id,
      serviceName: service.name,
      fullName: fullName,
      email: email,
      phone: phone,
      comments: comments,
      status: 'BOOKED',
      location: location,
      createdAt: nowStr,
      updatedAt: nowStr,
      token: token,
      calendarEventId: '',
      cancelledAt: '',
      cancelReason: ''
    };

    var eventId = createCalendarEvent_(apptObj);
    apptObj.calendarEventId = eventId;

    appendAppointment_(dateKey, apptObj);

    sendClientConfirmationEmail_(apptObj);
    var dayList = listAppointmentsForDate_(dateKey);
    sendDoctorBookingEmail_(apptObj, dayList);

    return {
      ok: true,
      appointmentId: appointmentId,
      dateKey: dateKey,
      startTime: apptObj.startTime,
      endTime: apptObj.endTime,
      serviceName: apptObj.serviceName,
      location: apptObj.location
    };
  } finally {
    lock.releaseLock();
  }
}


function apiGetCancelInfo(token, sig) {
  token = String(token || '').trim();
  sig = String(sig || '').trim();

  if (!verifyCancelSig_(token, sig)) {
    return { ok: false, reason: 'Invalid or expired cancel link.' };
  }

  var found = findAppointmentByToken_(token);
  if (!found) return { ok: false, reason: 'Appointment not found.' };

  var appt = found.appointment;
  return {
    ok: true,
    appointment: {
      appointmentId: appt.appointmentId,
      dateKey: appt.dateKey,
      startTime: appt.startTime,
      endTime: appt.endTime,
      serviceName: appt.serviceName,
      fullName: appt.fullName,
      email: appt.email,
      phone: appt.phone,
      status: appt.status,
      location: appt.location
    }
  };
}

function apiCancelAppointment(token, sig) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    token = String(token || '').trim();
    sig = String(sig || '').trim();

    if (!verifyCancelSig_(token, sig)) {
      return { ok: false, reason: 'Invalid or expired cancel link.' };
    }

    var found = findAppointmentByToken_(token);
    if (!found) return { ok: false, reason: 'Appointment not found.' };

    var appt = found.appointment;

    if (!apptIsActive_(appt)) {
      return { ok: true, alreadyCancelled: true, message: 'This appointment is already cancelled.', appointmentId: appt.appointmentId };
    }

    var eventId = String(appt.calendarEventId || '').trim();
    if (eventId) {
      deleteCalendarEvent_(eventId);
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    updateAppointmentStatus_(found.sheetName, found.rowIndex, {
      status: 'CANCELLED_CLIENT',
      cancelledAt: nowStr,
      cancelReason: 'Cancelled by client via email link',
      calendarEventId: ''
    });

    try { sendClientCancelledEmail_(appt, 'Your appointment has been cancelled.'); } catch (e1) {}
    try { sendDoctorCancellationEmail_(appt, 'Client cancelled via email link.'); } catch (e2) {}

    return {
      ok: true,
      alreadyCancelled: false,
      message: 'Appointment cancelled successfully.',
      appointmentId: appt.appointmentId
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Doctor action from email link (cancel or redirect to Spinola).
 */
function apiDoctorAction(token, act, sig) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    token = String(token || '').trim();
    act = String(act || '').trim();
    sig = String(sig || '').trim();

    if (!verifyDocActionSig_(token, act, sig)) {
      return { ok: false, reason: 'Invalid or expired link.' };
    }

    var found = findAppointmentByToken_(token);
    if (!found) return { ok: false, reason: 'Appointment not found.' };

    var appt = found.appointment;

    if (!apptIsActive_(appt)) {
      return { ok: true, message: 'This appointment is already cancelled or processed.' };
    }

    var now = new Date();
    var nowStr = Utilities.formatDate(now, getTimeZone_(), "yyyy-MM-dd HH:mm:ss");

    if (act === 'cancel') {
      var eventId = String(appt.calendarEventId || '').trim();
      if (eventId) {
        deleteCalendarEvent_(eventId);
      }

      updateAppointmentStatus_(found.sheetName, found.rowIndex, {
        status: 'CANCELLED_DOCTOR',
        cancelledAt: nowStr,
        cancelReason: 'Cancelled by doctor',
        calendarEventId: ''
      });

      try { sendClientCancelledEmail_(appt, 'Your appointment has been cancelled by the clinic. Please rebook if needed.'); } catch (e1) {}
      try { sendDoctorCancellationEmail_(appt, 'You cancelled this appointment.'); } catch (e2) {}

      return { ok: true, message: 'Appointment cancelled and patient notified.' };
    }

    if (act === 'redirect') {
      var spinolaLocation = getScriptProps_().getProperty(CFG().PROP_SPINOLA_LOCATION) || 'Spinola Clinic';

      updateAppointmentStatus_(found.sheetName, found.rowIndex, {
        status: 'RELOCATED_SPINOLA',
        location: spinolaLocation
      });

      var calEventId = String(appt.calendarEventId || '').trim();
      if (calEventId) {
        try {
          updateCalendarEventLocation_(calEventId, spinolaLocation,
            appt.serviceName + ' - ' + appt.fullName + ' [SPINOLA]');
        } catch (e3) {}
      }

      try { sendRedirectToSpinolaEmail_(appt, spinolaLocation); } catch (e4) {}
      try { sendDoctorCancellationEmail_(appt, 'Appointment redirected to ' + spinolaLocation + '.'); } catch (e5) {}

      return { ok: true, message: 'Appointment redirected to ' + spinolaLocation + ' and patient notified.' };
    }

    return { ok: false, reason: 'Unknown action: ' + act };

  } finally {
    lock.releaseLock();
  }
}
