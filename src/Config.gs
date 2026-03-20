/***************
 * Config.gs
 ***************/

var _cfgCache = null;
var _propsCache = null;
var _tzCache = null;

function CFG() {
  if (_cfgCache) return _cfgCache;
  _cfgCache = {
    // Script Properties keys
    PROP_CONFIG_SSID: 'CONFIG_SPREADSHEET_ID',
    PROP_APPTS_SSID: 'APPOINTMENTS_SPREADSHEET_ID',
    PROP_DOCTOR_EMAIL: 'DOCTOR_EMAIL',
    PROP_WEBAPP_URL: 'WEBAPP_URL',
    PROP_SECRET: 'SIGNING_SECRET',
    PROP_ADMIN_SECRET: 'ADMIN_SECRET',
    PROP_TIMEZONE: 'TIMEZONE',
    PROP_POTTERS_LOCATION: 'POTTERS_LOCATION',
    PROP_SPINOLA_LOCATION: 'SPINOLA_LOCATION',
    PROP_CALENDAR_ID: 'KEVINAPPTS_CALENDAR_ID',
    PROP_DOUBLECHECK_CALENDAR: 'DOUBLECHECK_CALENDAR',
    PROP_MAX_ACTIVE_APPTS_PER_PERSON: 'MAX_ACTIVE_APPTS_PER_PERSON',

    // Sheet names
    SHEET_CLIENTS: 'Clients',
    SHEET_DOCTOR_OFF: 'DoctorOff',
    SHEET_DOCTOR_EXTRA: 'DoctorExtra',

    // Appointment day sheet format
    APPT_SHEET_DATE_FORMAT: 'yyyy-MM-dd',

    // Appointment settings
    APPT_DURATION_MIN: 10,
    ADVANCE_DAYS: 7,

    // Services
    SERVICES: [
      { id: 'clinic', name: 'Clinic Consultation', minutes: 10 }
    ],

    // Working hours
    HOURS: {
      MON: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      TUE: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      WED: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      THU: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      FRI: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
      SAT: [{ start: '10:00', end: '12:00' }],
      SUN: []
    }
  };
  return _cfgCache;
}

function getScriptProps_() {
  if (_propsCache) return _propsCache;
  _propsCache = PropertiesService.getScriptProperties();
  return _propsCache;
}

function getTimeZone_() {
  if (_tzCache) return _tzCache;
  var props = getScriptProps_();
  _tzCache = props.getProperty(CFG().PROP_TIMEZONE) || Session.getScriptTimeZone() || 'Europe/Malta';
  return _tzCache;
}

function getOrCreateSigningSecret_() {
  var props = getScriptProps_();
  var s = props.getProperty(CFG().PROP_SECRET);
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(CFG().PROP_SECRET, s);
  }
  return s;
}

function getOrCreateAdminSecret_() {
  var props = getScriptProps_();
  var s = props.getProperty(CFG().PROP_ADMIN_SECRET);
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(CFG().PROP_ADMIN_SECRET, s);
  }
  return s;
}
