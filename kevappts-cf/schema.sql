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
  booking_source TEXT DEFAULT '',
  -- Optional free-text accommodation/hotel the patient is staying at (tourists).
  -- Powers the "Where patients are staying" admin statistics so we can see which
  -- hotels send us the most visitors. Existing DBs created before this column:
  -- run once to migrate (CREATE TABLE IF NOT EXISTS is a no-op on existing tables
  -- so it never adds the column on its own):
  --   npx wrangler d1 execute kevappts-db --remote \
  --     --command "ALTER TABLE appointments ADD COLUMN hotel TEXT DEFAULT '';"
  hotel TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_appt_date ON appointments(date_key);
CREATE INDEX IF NOT EXISTS idx_appt_token ON appointments(token);
CREATE INDEX IF NOT EXISTS idx_appt_date_status ON appointments(date_key, status);
CREATE INDEX IF NOT EXISTS idx_appt_clinic_date ON appointments(clinic, date_key);
CREATE INDEX IF NOT EXISTS idx_appt_email ON appointments(email);
-- Partial unique index: only one BOOKED row per (clinic, service_id, date_key, start_time).
-- Cancelled / attended / no-show rows are unconstrained so history is preserved.
-- Backstops the application-level isSlotTaken check against simultaneous books.
-- service_id is in the key so a doctor visit at 08:30 and a blood-test at 08:30
-- (both clinic='potters') can coexist without violating the constraint.
DROP INDEX IF EXISTS idx_appt_unique_booked_slot;
CREATE UNIQUE INDEX IF NOT EXISTS idx_appt_unique_booked_slot
  ON appointments(clinic, service_id, date_key, start_time) WHERE status = 'BOOKED';

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

-- Linda partial-day blocks. Distinct from linda_off (which always blocks the
-- whole date) so the data model stays unambiguous: a row here ALWAYS has both
-- start_time and end_time and only knocks out slots in that range. Multiple
-- rows per date are allowed. Existing bookings inside the range are NOT
-- cancelled — Linda will reschedule them via the normal flow, same as
-- full-day off.
CREATE TABLE IF NOT EXISTS linda_block (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_linda_block_date ON linda_block(date_key);

-- Telemedicine calls (8pm-midnight phone consults, EUR 25 flat fee).
-- Tracked separately from appointments because they have no slot, no
-- doctor-off interaction, no calendar event — just a simple log of who
-- called and when.
--   fee_cents       — doctor's flat €25 fee (kept separate so the doctor's
--                     totals never include medicine the patient bought).
--   medicine_cents  — pharmacy total for that visit (entered by admin).
--   The patient's bill = fee_cents + medicine_cents. The doctor's total
--   stays as SUM(fee_cents) only.
CREATE TABLE IF NOT EXISTS telemedicine_calls (
  id TEXT PRIMARY KEY,
  date_key TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  comments TEXT DEFAULT '',
  fee_cents INTEGER NOT NULL DEFAULT 2500,
  medicine_cents INTEGER NOT NULL DEFAULT 0,
  -- Newline-separated medicine names (entered in admin). Used to build the
  -- prescription/receipt email; we never store per-medicine prices, only
  -- the medicine_cents total above is billed.
  medicines TEXT DEFAULT '',
  prescription_sent_at TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'BOOKED',
  source TEXT NOT NULL DEFAULT 'public',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_telemed_date ON telemedicine_calls(date_key);
CREATE INDEX IF NOT EXISTS idx_telemed_created ON telemedicine_calls(created_at);

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

-- Blood Tests (pharmacy-staff service, 8-9am at Potter's). Independent of
-- Dr Kevin's availability — pharmacy staff take blood, doctor not needed.
-- Slots live in the main `appointments` table with clinic='potters' and
-- service_id='blood-test' so cancel/reschedule/review flows are reused;
-- the doctor-off filter explicitly excludes blood-test rows so a doctor-off
-- event never cancels a blood test. Hours, slot duration, price and test
-- types are admin-editable via config.
INSERT OR IGNORE INTO config (key, value) VALUES ('BLOOD_TEST_ENABLED', '1');
INSERT OR IGNORE INTO config (key, value) VALUES ('BLOOD_TEST_SLOT_MIN', '10');
INSERT OR IGNORE INTO config (key, value) VALUES ('BLOOD_TEST_PRICE_CENTS', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('BLOOD_TEST_TYPES', '[]');
INSERT OR IGNORE INTO config (key, value) VALUES ('BLOOD_TEST_HOURS', '{"MON":[{"start":"08:00","end":"09:00"}],"TUE":[{"start":"08:00","end":"09:00"}],"WED":[{"start":"08:00","end":"09:00"}],"THU":[{"start":"08:00","end":"09:00"}],"FRI":[{"start":"08:00","end":"09:00"}],"SAT":[{"start":"08:00","end":"09:00"}],"SUN":[]}');

-- Blood-test day-off: dates pharmacy isn't taking blood. Overrides BLOOD_TEST_HOURS.
CREATE TABLE IF NOT EXISTS blood_test_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_blood_test_off_date ON blood_test_off(date_key);

-- DDA (Dangerous Drugs Act / controlled-drug) register. Admin pastes
-- tab-separated rows exported from the dispensing system; each row is stored
-- here so it can be reprinted on demand as a 75×50mm controlled-drug label.
-- Newest entries show at the top of the admin table (ORDER BY id DESC). The
-- columns mirror the pasted export order:
--   drug · quantity · code · patient · pv · year · prescriber · doctor code
--   · prescription date · flag — plus `raw` (the original pasted line).
CREATE TABLE IF NOT EXISTS dda_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drug TEXT NOT NULL DEFAULT '',
  quantity TEXT NOT NULL DEFAULT '',
  code TEXT DEFAULT '',
  patient_name TEXT NOT NULL DEFAULT '',
  pv TEXT DEFAULT '',
  year TEXT DEFAULT '',
  prescriber TEXT DEFAULT '',
  doctor_code TEXT DEFAULT '',
  rx_date TEXT DEFAULT '',
  flag TEXT DEFAULT '',
  raw TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dda_created ON dda_entries(created_at);
