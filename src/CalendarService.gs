/***************
 * CalendarService.gs
 ***************/

function getKevinCalendar_() {
  var calId = getScriptProps_().getProperty(CFG().PROP_CALENDAR_ID);
  if (!calId) throw new Error('Calendar ID missing. Run install().');
  return CalendarApp.getCalendarById(calId);
}

function createCalendarEvent_(appt) {
  var cal = getKevinCalendar_();
  var dateObj = parseDateKey_(appt.dateKey);

  var start = combineDateAndTime_(dateObj, appt.startTime);
  var end = combineDateAndTime_(dateObj, appt.endTime);

  var title = appt.serviceName + ' - ' + appt.fullName;

  var descLines = [];
  descLines.push('Patient: ' + appt.fullName);
  descLines.push('Email: ' + appt.email);
  descLines.push('Phone: ' + appt.phone);
  if (appt.comments) descLines.push('Comments: ' + appt.comments);
  descLines.push('Status: ' + appt.status);
  descLines.push('Token: ' + appt.token);

  var ev = cal.createEvent(title, start, end, {
    description: descLines.join('\n'),
    location: appt.location
  });

  return ev.getId();
}

function deleteCalendarEvent_(eventId) {
  if (!eventId) return;
  var cal = getKevinCalendar_();
  try {
    var ev = cal.getEventById(eventId);
    if (ev) ev.deleteEvent();
  } catch (e) {}
}

function updateCalendarEventLocation_(eventId, newLocation, newTitleOptional, newDescriptionOptional) {
  if (!eventId) return false;
  var cal = getKevinCalendar_();
  try {
    var ev = cal.getEventById(eventId);
    if (!ev) return false;

    if (newTitleOptional) ev.setTitle(newTitleOptional);
    if (newDescriptionOptional) ev.setDescription(newDescriptionOptional);
    if (newLocation) ev.setLocation(newLocation);

    return true;
  } catch (e) {
    return false;
  }
}

function listCalendarTakenSlots_(dateKey) {
  var cal = getKevinCalendar_();
  var dateObj = parseDateKey_(dateKey);
  var dur = CFG().APPT_DURATION_MIN;

  var start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  var end = addMinutes_(start, 24 * 60);

  var events = cal.getEvents(start, end);
  var taken = {};

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var evStartMin = parseTimeToMinutes_(Utilities.formatDate(ev.getStartTime(), getTimeZone_(), 'HH:mm'));
    var evEndMin = parseTimeToMinutes_(Utilities.formatDate(ev.getEndTime(), getTimeZone_(), 'HH:mm'));
    // Handle events that end at or after midnight
    if (evEndMin <= evStartMin) evEndMin = 1440;
    // Mark every slot that overlaps with this event
    for (var m = evStartMin; m + dur <= evEndMin; m += dur) {
      taken[minutesToTime_(m)] = true;
    }
  }
  return taken;
}
