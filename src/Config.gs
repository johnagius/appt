/***************
 * Config.gs
 ***************/

var _cfgCache = null;
var _propsCache = null;
var _tzCache = null;

var DEFAULT_HOURS = {
  MON: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  TUE: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  WED: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  THU: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  FRI: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  SAT: [{ start: '10:00', end: '12:00' }],
  SUN: []
};

function CFG() {
  if (_cfgCache) return _cfgCache;

  var props = getScriptProps_();

  // Read working hours from script property, fallback to defaults
  var hours = DEFAULT_HOURS;
  var hoursJson = props.getProperty('WORKING_HOURS');
  if (hoursJson) {
    try { hours = JSON.parse(hoursJson); } catch (e) { hours = DEFAULT_HOURS; }
  }

  // Read numeric settings from script properties with defaults
  var durationStr = props.getProperty('APPT_DURATION_MIN');
  var duration = durationStr ? parseInt(durationStr, 10) : 10;
  if (isNaN(duration) || duration < 1) duration = 10;

  var advStr = props.getProperty('ADVANCE_DAYS');
  var advDays = advStr ? parseInt(advStr, 10) : 7;
  if (isNaN(advDays) || advDays < 1) advDays = 7;

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

    // Appointment settings (now configurable via admin)
    APPT_DURATION_MIN: duration,
    ADVANCE_DAYS: advDays,

    // Services
    SERVICES: [
      { id: 'clinic', name: 'Clinic Consultation', minutes: duration }
    ],

    // Working hours (now configurable via admin)
    HOURS: hours
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

/** Data version counter — stored in Script Properties for cheapest possible reads. */
var _PROP_DATA_VERSION = 'DATA_VERSION';

function getDataVersion_() {
  return Number(getScriptProps_().getProperty(_PROP_DATA_VERSION) || '0');
}

function bumpVersion_() {
  var props = getScriptProps_();
  var v = Number(props.getProperty(_PROP_DATA_VERSION) || '0') + 1;
  props.setProperty(_PROP_DATA_VERSION, String(v));
  return v;
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
