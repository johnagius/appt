/***************
 * EmailService.gs
 ***************/

function buildCancelLink_(token) {
  var base = getWebAppUrl_();
  token = String(token || '').trim();
  var sig = computeSig_('cancel|' + token);
  var url = base + '?mode=cancel'
    + '&token=' + encodeURIComponent(token)
    + '&sig=' + encodeURIComponent(sig);
  return url;
}

function buildDocActionLink_(token, action) {
  var base = getWebAppUrl_();
  token = String(token || '').trim();
  action = String(action || '').trim();
  var sig = computeSig_('docAction|' + token + '|' + action);
  var url = base + '?mode=docaction'
    + '&token=' + encodeURIComponent(token)
    + '&act=' + encodeURIComponent(action)
    + '&sig=' + encodeURIComponent(sig);
  return url;
}

function sendClientConfirmationEmail_(appt) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var cancelUrl = buildCancelLink_(appt.token);

  var subject = 'Appointment Confirmed - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Confirmed</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment has been confirmed.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">'
    + '<p style="margin:0 0 10px 0;color:#111827;"><b>Cancel appointment</b></p>'
    + '<a href="' + cancelUrl + '" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Cancel Appointment</a>'
    + '<p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;">If the button does not work, copy and paste this link into your browser:<br>'
    + '<span style="word-break:break-all;">' + escapeHtml_(cancelUrl) + '</span></p>'
    + '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendSpinolaConfirmationEmail_(appt) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var cancelUrl = buildCancelLink_(appt.token);
  var spinolaLocation = appt.location || 'Spinola Clinic';

  var subject = 'Appointment Confirmed - Dr James at ' + spinolaLocation + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Confirmed - Spinola Clinic</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment with <b>Dr James</b> at <b>' + escapeHtml_(spinolaLocation) + '</b> has been confirmed.</p>'
    + '<p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">Location: Near McDonald\'s, Love Statue, near bus stop, in Spinola</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Doctor</td><td style="padding:6px 0;"><b>Dr James</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(spinolaLocation) + '</b></td></tr>'
    + '</table>'
    + '<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">'
    + '<p style="margin:0 0 10px 0;color:#111827;"><b>Cancel appointment</b></p>'
    + '<a href="' + cancelUrl + '" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Cancel Appointment</a>'
    + '<p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;">If the button does not work, copy and paste this link into your browser:<br>'
    + '<span style="word-break:break-all;">' + escapeHtml_(cancelUrl) + '</span></p>'
    + '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendDoctorBookingEmail_(appt, dayList) {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var subject = 'New Booking: ' + appt.serviceName + ' - ' + appt.dateKey + ' ' + appt.startTime;

  var active = [];
  for (var i = 0; i < (dayList || []).length; i++) {
    if (apptIsActive_(dayList[i])) {
      active.push(dayList[i]);
    }
  }
  active.sort(function(a, b) {
    return parseTimeToMinutes_(a.startTime) - parseTimeToMinutes_(b.startTime);
  });

  var rowsHtml = '';
  for (var j = 0; j < active.length; j++) {
    var cancelLink = buildDocActionLink_(active[j].token, 'cancel');
    var redirectLink = buildDocActionLink_(active[j].token, 'redirect');
    rowsHtml += ''
      + '<tr>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].startTime) + ' - ' + escapeHtml_(active[j].endTime) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].serviceName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].fullName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(active[j].phone) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">'
      + '<a href="' + cancelLink + '" style="color:#ef4444;font-size:12px;">Cancel</a> | '
      + '<a href="' + redirectLink + '" style="color:#10b981;font-size:12px;">Spinola</a>'
      + '</td>'
      + '</tr>';
  }

  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No active appointments found.</td></tr>';
  }

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">New Appointment Booked</h2>'
    + '<table style="border-collapse:collapse;width:100%;max-width:620px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.fullName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.phone) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.email) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<h3 style="margin:16px 0 8px 0;">Appointments for the day</h3>'
    + '<table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">'
    + '<thead>'
    + '<tr style="background:#f9fafb;">'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Actions</th>'
    + '</tr>'
    + '</thead>'
    + '<tbody>' + rowsHtml + '</tbody>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

function sendClientCancelledEmail_(appt, messageText) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var bookingUrl = getWebAppUrl_();
  var subject = 'Appointment Cancelled - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(messageText || 'Your appointment has been cancelled.') + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<p style="margin:14px 0 0 0;"><a href="' + bookingUrl + '" style="color:#2563eb;">Book a new appointment</a></p>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendDoctorCancellationEmail_(appt, messageText) {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var subject = 'Appointment Cancelled: ' + appt.serviceName + ' - ' + appt.dateKey + ' ' + appt.startTime;

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(messageText || 'Appointment was cancelled.') + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:620px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.fullName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.phone) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.email) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Email patient that their appointment has been redirected to Spinola Clinic.
 */
function sendRedirectToSpinolaEmail_(appt, spinolaLocation) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Appointment Location Changed - ' + appt.serviceName + ' (' + appt.dateKey + ' ' + appt.startTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Location Changed</h2>'
    + '<p style="margin:0 0 10px 0;">Your appointment has been moved to <b>' + escapeHtml_(spinolaLocation) + '</b>. The date and time remain the same.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">New Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(spinolaLocation) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Email patient that their appointment has been rescheduled.
 */
function sendAppointmentPushedEmail_(appt, newDateKey, newStartTime, newEndTime) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Appointment Rescheduled - ' + appt.serviceName + ' (moved to ' + newDateKey + ' ' + newStartTime + ')';

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Rescheduled</h2>'
    + '<p style="margin:0 0 10px 0;">Due to doctor unavailability, your appointment has been rescheduled.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#ef4444;">Original Date</td><td style="padding:6px 0;"><s>' + escapeHtml_(appt.dateKey) + ' ' + escapeHtml_(appt.startTime) + '</s></td></tr>'
    + '<tr><td style="padding:6px 0;color:#10b981;">New Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(newDateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#10b981;">New Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(newStartTime) + ' - ' + escapeHtml_(newEndTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '<p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">If this new time does not work for you, please cancel and rebook.</p>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Daily schedule email sent to doctor at 7am via trigger.
 */
function sendDailyDoctorSchedule_() {
  var doctorEmail = String(getScriptProps_().getProperty(CFG().PROP_DOCTOR_EMAIL) || '').trim();
  if (!doctorEmail) return;

  var todayKey = todayKeyLocal_();
  var active = listActiveAppointmentsForDate_(todayKey);

  var subject = 'Daily Schedule - ' + todayKey + ' (' + active.length + ' appointment' + (active.length !== 1 ? 's' : '') + ')';

  var rowsHtml = '';
  for (var i = 0; i < active.length; i++) {
    var a = active[i];
    rowsHtml += ''
      + '<tr>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.startTime) + ' - ' + escapeHtml_(a.endTime) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.serviceName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.fullName) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.phone) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #e5e7eb;">' + escapeHtml_(a.location) + '</td>'
      + '</tr>';
  }

  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No appointments today.</td></tr>';
  }

  var adminLink = '';
  try { adminLink = buildAdminLink_(); } catch (e) {}

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Daily Schedule - ' + escapeHtml_(todayKey) + '</h2>'
    + '<p style="margin:0 0 10px 0;">' + active.length + ' appointment' + (active.length !== 1 ? 's' : '') + ' today.</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">'
    + '<thead>'
    + '<tr style="background:#f9fafb;">'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>'
    + '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Location</th>'
    + '</tr>'
    + '</thead>'
    + '<tbody>' + rowsHtml + '</tbody>'
    + '</table>';

  if (adminLink) {
    html += '<p style="margin:16px 0 0 0;"><a href="' + adminLink + '" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Open Admin Panel</a></p>';
  }

  html += '</div>';

  MailApp.sendEmail({
    to: doctorEmail,
    subject: subject,
    htmlBody: html
  });
}

/**
 * Send custom notification to a patient.
 */
function sendCustomNotificationEmail_(appt, customMessage) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var subject = 'Important: Your Appointment on ' + appt.dateKey + ' at ' + appt.startTime;

  var html = ''
    + '<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">'
    + '<h2 style="margin:0 0 10px 0;">Appointment Notice</h2>'
    + '<p style="margin:0 0 10px 0;">' + escapeHtml_(customMessage) + '</p>'
    + '<table style="border-collapse:collapse;width:100%;max-width:520px;">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.serviceName) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.dateKey) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.startTime) + ' - ' + escapeHtml_(appt.endTime) + '</b></td></tr>'
    + '<tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>' + escapeHtml_(appt.location) + '</b></td></tr>'
    + '</table>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function sendReviewRequestEmail_(appt, location, teamNames) {
  var to = String(appt.email || '').trim();
  if (!to) return;

  var firstName = String(appt.fullName || '').split(' ')[0] || 'there';
  var isPotters = location === 'potters';
  var placeName = isPotters ? "Potter's Pharmacy" : 'Spinola Clinic';
  var reviewUrl = isPotters
    ? 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE'
    : 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE';

  var teamLine = '';
  if (teamNames.length === 1) {
    teamLine = teamNames[0];
  } else if (teamNames.length === 2) {
    teamLine = teamNames[0] + ' &amp; ' + teamNames[1];
  } else if (teamNames.length >= 3) {
    teamLine = teamNames.slice(0, -1).join(', ') + ' &amp; ' + teamNames[teamNames.length - 1];
  }

  var accentColor = isPotters ? '#2563eb' : '#8b5cf6';

  var subject = "We'd love your feedback - " + placeName;

  var html = ''
    + '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">'
    + '<tr><td align="center" style="padding:32px 16px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">'

    // Header accent bar
    + '<tr><td style="height:6px;background:' + accentColor + ';"></td></tr>'

    // Main content
    + '<tr><td style="padding:36px 32px 24px;">'
    + '<h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#111827;line-height:1.3;">Thank you for visiting ' + escapeHtml_(placeName) + '!</h1>'

    + '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">'
    + 'Hi ' + escapeHtml_(firstName) + ',</p>'

    + '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">'
    + 'We hope you had a great experience with us today. If you were happy with the service, we\'d really appreciate it if you could take a moment to leave us a quick Google review.</p>'

    + '<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">'
    + 'Your feedback helps others discover us and means the world to our team.</p>'

    // CTA Button
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td align="center" style="padding:4px 0 28px;">'
    + '<a href="' + reviewUrl + '" style="display:inline-block;background:' + accentColor + ';color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:700;letter-spacing:0.3px;">'
    + '&#9733; Leave a Review'
    + '</a>'
    + '</td></tr></table>'

    // Divider
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="border-top:1px solid #e5e7eb;padding-top:20px;">'
    + '<p style="margin:0;font-size:14px;line-height:1.5;color:#6b7280;">Warm regards,</p>'
    + '<p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">' + teamLine + '</p>'
    + '<p style="margin:2px 0 0;font-size:13px;color:#9ca3af;">The Potter\'s Pharmacy Team</p>'
    + '</td></tr></table>'

    + '</td></tr>'

    // Footer
    + '<tr><td style="padding:16px 32px 24px;background:#f9fafb;border-top:1px solid #f3f4f6;">'
    + '<p style="margin:0;font-size:11px;line-height:1.5;color:#9ca3af;text-align:center;">'
    + 'This email was sent because you visited ' + escapeHtml_(placeName) + ' today.<br>'
    + 'If you received this by mistake, please disregard it.'
    + '</p>'
    + '</td></tr>'

    + '</table>'
    + '</td></tr></table>'
    + '</body></html>';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html
  });
}

function escapeHtml_(s) {
  s = String(s === null || s === undefined ? '' : s);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
