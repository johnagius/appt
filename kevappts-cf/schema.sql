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
  cancel_reason TEXT DEFAULT '',
  reminder_sent TEXT DEFAULT '',
  confirmed TEXT DEFAULT '',
  booking_source TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_appt_date ON appointments(date_key);
CREATE INDEX IF NOT EXISTS idx_appt_token ON appointments(token);
CREATE INDEX IF NOT EXISTS idx_appt_date_status ON appointments(date_key, status);
CREATE INDEX IF NOT EXISTS idx_appt_clinic_date ON appointments(clinic, date_key);
CREATE INDEX IF NOT EXISTS idx_appt_email ON appointments(email);
-- Partial unique index: only one BOOKED row per (clinic, date_key, start_time).
-- Cancelled / attended / no-show rows are unconstrained so history is preserved.
-- Backstops the application-level isSlotTaken check against simultaneous books.
CREATE UNIQUE INDEX IF NOT EXISTS idx_appt_unique_booked_slot
  ON appointments(clinic, date_key, start_time) WHERE status = 'BOOKED';

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
  sent_at TEXT NOT NULL,
  source TEXT DEFAULT 'manual'
);
-- Existing DBs that were created before the source column: run once to migrate.
--   npx wrangler d1 execute kevappts-db --remote \
--     --command "ALTER TABLE review_sent ADD COLUMN source TEXT DEFAULT 'manual';"
-- (The ALTER isn't in this file because CREATE TABLE IF NOT EXISTS is a no-op
-- on existing tables, so it'd never actually add the column; and a standalone
-- ALTER would fail on fresh DBs where the column already exists.)

CREATE TABLE IF NOT EXISTS follow_ups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id TEXT NOT NULL,
  clinic TEXT NOT NULL DEFAULT 'potters',
  patient_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_key TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  response TEXT DEFAULT '',
  response_at TEXT DEFAULT '',
  question_text TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_followup_status ON follow_ups(status);
-- Drop any pre-existing non-unique index so the UNIQUE version below takes effect
-- in prod. Unique so INSERT OR IGNORE in the cron acts as an atomic claim —
-- only one scheduled() run can create the row for a given appointment_id.
DROP INDEX IF EXISTS idx_followup_appt;
CREATE UNIQUE INDEX IF NOT EXISTS idx_followup_appt ON follow_ups(appointment_id);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_email TEXT NOT NULL,
  referrer_name TEXT NOT NULL,
  referrer_phone TEXT DEFAULT '',
  referred_email TEXT NOT NULL,
  referred_name TEXT NOT NULL,
  referred_appointment_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  thanked INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referrals(referrer_email);

-- Linda extra availability slots (ad-hoc dates/time ranges Linda adds beyond her weekly schedule)
CREATE TABLE IF NOT EXISTS linda_extra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_linda_extra_date ON linda_extra(date_key);

-- Linda booking windows — she lives abroad and comes for multiple stints.
-- Each row is a continuous working period (start + end dates). A booking is
-- "in window" if any row covers its date. Legacy LINDA_WINDOW_START/END in
-- the config table are auto-migrated into one row on first load.
CREATE TABLE IF NOT EXISTS linda_windows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_linda_windows_dates ON linda_windows(start_date, end_date);

-- Linda day-off: dates she's cancelled her base availability for. Any booking
-- already made on that date stays (she'll reschedule via the normal flow);
-- no NEW bookings are offered. Overrides the base weekly schedule and any
-- extras on the same date.
CREATE TABLE IF NOT EXISTS linda_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_linda_off_date ON linda_off(date_key);

-- Seed data version
INSERT OR IGNORE INTO data_version (id, version) VALUES (1, 0);

-- Seed default config
INSERT OR IGNORE INTO config (key, value) VALUES ('APPT_DURATION_MIN', '10');
INSERT OR IGNORE INTO config (key, value) VALUES ('ADVANCE_DAYS', '7');
INSERT OR IGNORE INTO config (key, value) VALUES ('MAX_ACTIVE_APPTS_PER_PERSON', '0');

INSERT OR IGNORE INTO config (key, value) VALUES ('WORKING_HOURS', '{"MON":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"TUE":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"WED":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"THU":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"FRI":[{"start":"09:00","end":"12:00"},{"start":"17:00","end":"19:00"}],"SAT":[{"start":"10:00","end":"12:00"}],"SUN":[]}');
INSERT OR IGNORE INTO config (key, value) VALUES ('SPINOLA_WORKING_HOURS', '{"MON":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"TUE":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"WED":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"THU":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"FRI":[{"start":"09:00","end":"14:00"},{"start":"16:00","end":"19:00"}],"SAT":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"19:00"}],"SUN":[{"start":"10:00","end":"12:00"}]}');
INSERT OR IGNORE INTO config (key, value) VALUES ('POTTERS_LOCATION', 'Potter''s Pharmacy Clinic');
INSERT OR IGNORE INTO config (key, value) VALUES ('SPINOLA_LOCATION', 'Spinola Clinic');

-- Linda (physiotherapy) admin-editable config
INSERT OR IGNORE INTO config (key, value) VALUES ('LINDA_ENABLED', '1');
INSERT OR IGNORE INTO config (key, value) VALUES ('LINDA_WINDOW_START', '2026-04-28');
INSERT OR IGNORE INTO config (key, value) VALUES ('LINDA_WINDOW_END', '2026-05-07');
INSERT OR IGNORE INTO config (key, value) VALUES ('LINDA_SLOT_MIN', '30');
INSERT OR IGNORE INTO config (key, value) VALUES ('LINDA_HOURS', '{"MON":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"18:30"}],"TUE":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"18:30"}],"WED":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"18:30"}],"THU":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"18:30"}],"FRI":[{"start":"09:30","end":"13:00"},{"start":"16:00","end":"18:30"}],"SAT":[],"SUN":[]}');
