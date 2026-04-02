-- KevAppts D1 Schema

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  date_key TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  comments TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'BOOKED',
  location TEXT NOT NULL,
  clinic TEXT NOT NULL DEFAULT 'potters',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  calendar_event_id TEXT DEFAULT '',
  cancelled_at TEXT DEFAULT '',
  cancel_reason TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_appt_date ON appointments(date_key);
CREATE INDEX IF NOT EXISTS idx_appt_token ON appointments(token);
CREATE INDEX IF NOT EXISTS idx_appt_date_status ON appointments(date_key, status);
CREATE INDEX IF NOT EXISTS idx_appt_clinic_date ON appointments(clinic, date_key);
CREATE INDEX IF NOT EXISTS idx_appt_email ON appointments(email);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_email_phone ON clients(email, phone);

CREATE TABLE IF NOT EXISTS doctor_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  reason TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS doctor_extra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_version (
  id INTEGER PRIMARY KEY DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_sent (
  appointment_id TEXT PRIMARY KEY,
  sent_at TEXT NOT NULL
);

-- Seed data version
INSERT OR IGNORE INTO data_version (id, version) VALUES (1, 0);

-- Seed default config
INSERT OR IGNORE INTO config (key, value) VALUES ('APPT_DURATION_MIN', '10');
INSERT OR IGNORE INTO config (key, value) VALUES ('ADVANCE_DAYS', '7');
INSERT OR IGNORE INTO config (key, value) VALUES ('MAX_ACTIVE_APPTS_PER_PERSON', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('DOUBLECHECK_CALENDAR', 'true');
INSERT OR IGNORE INTO config (key, value) VALUES ('WORKING_HOURS', '{"MON":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"TUE":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"WED":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"THU":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"FRI":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"SAT":[{"start":"10:00","end":"12:00"}],"SUN":[]}');
INSERT OR IGNORE INTO config (key, value) VALUES ('SPINOLA_WORKING_HOURS', '{"MON":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"TUE":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"WED":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"THU":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"FRI":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"SAT":[{"start":"09:00","end":"13:00"},{"start":"16:00","end":"19:00"}],"SUN":[{"start":"10:00","end":"12:00"}]}');
INSERT OR IGNORE INTO config (key, value) VALUES ('POTTERS_LOCATION', 'Potter''s Pharmacy Clinic');
INSERT OR IGNORE INTO config (key, value) VALUES ('SPINOLA_LOCATION', 'Spinola Clinic');
