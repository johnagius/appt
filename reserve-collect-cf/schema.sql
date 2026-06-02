-- Reserve & Collect — D1 Schema
-- Conventions mirror kevappts-cf/schema.sql: TEXT primary keys (crypto.randomUUID),
-- ISO timestamp strings, INSERT OR IGNORE seeds, CREATE INDEX IF NOT EXISTS.

-- ── Users (verified customers) ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,             -- 'U-' + uuid
  email          TEXT NOT NULL,                -- always stored lowercased
  email_verified INTEGER NOT NULL DEFAULT 0,   -- 1 once verified (Google = 1 immediately)
  auth_provider  TEXT NOT NULL DEFAULT 'email',-- 'google' | 'email'
  google_sub     TEXT DEFAULT '',              -- Google OIDC subject id (stable per user)
  full_name      TEXT DEFAULT '',
  phone          TEXT DEFAULT '',              -- collected at reservation time (pickup contact)
  referral_code  TEXT DEFAULT '',              -- this user's own share code
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  last_login_at  TEXT DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);

-- ── Email verification / OTP (passwordless) ─────────────────
-- One active code per email at a time; INSERT OR REPLACE on (email) keeps it tidy.
CREATE TABLE IF NOT EXISTS email_verifications (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,                   -- lowercased
  code_hash   TEXT NOT NULL,                   -- HMAC(code, SIGNING_SECRET) — never store raw OTP
  purpose     TEXT NOT NULL DEFAULT 'login',
  attempts    INTEGER NOT NULL DEFAULT 0,      -- lock after 5 wrong tries
  expires_at  TEXT NOT NULL,                   -- ISO; 10-min TTL
  consumed_at TEXT DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_emailverif_email ON email_verifications(email);

-- ── Sessions ────────────────────────────────────────────────
-- Stored server-side for revocation; the cookie carries the signed session id.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,                -- 'S-' + uuid (signed into the cookie)
  user_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,                   -- 30-day
  revoked_at  TEXT DEFAULT '',
  user_agent  TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ── Reservations (order header) ─────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id             TEXT PRIMARY KEY,             -- 'R-' + uuid
  reference      TEXT NOT NULL,                -- short code e.g. 'PC-7F3K' (collection ref)
  user_id        TEXT NOT NULL,
  customer_name  TEXT NOT NULL,                -- snapshot at order time
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'SUBMITTED',
  notes          TEXT DEFAULT '',              -- free-text from customer
  staff_note     TEXT DEFAULT '',              -- pharmacist-facing note
  preferred_day  TEXT DEFAULT '',              -- optional pickup day (NOT delivery)
  preferred_time TEXT DEFAULT '',              -- optional pickup window text
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  ready_at       TEXT DEFAULT '',
  collected_at   TEXT DEFAULT '',
  notified_ready_at       TEXT DEFAULT '',     -- dedup guard for the ready email
  notified_unavailable_at TEXT DEFAULT ''      -- dedup guard for the unavailable email
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_resv_reference ON reservations(reference);
CREATE INDEX IF NOT EXISTS idx_resv_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_resv_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_resv_created ON reservations(created_at);

-- ── Reservation line items ──────────────────────────────────
-- Each item carries its OWN availability status so staff can mark a single
-- line "unavailable" while the rest of the order proceeds.
CREATE TABLE IF NOT EXISTS reservation_items (
  id             TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  product_id     TEXT DEFAULT '',              -- optional FK to products (free-text allowed too)
  item_name      TEXT NOT NULL,                -- free-text or catalogue name snapshot
  quantity       INTEGER NOT NULL DEFAULT 1,
  item_status    TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|AVAILABLE|RESERVED_ALREADY|UNAVAILABLE
  staff_note     TEXT DEFAULT '',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resv_items_resv ON reservation_items(reservation_id);

-- ── Photos (item OR prescription images, stored in R2) ──────
CREATE TABLE IF NOT EXISTS photos (
  id             TEXT PRIMARY KEY,
  reservation_id TEXT DEFAULT '',              -- linked at submit; uploaded pre-submit then linked
  item_id        TEXT DEFAULT '',
  user_id        TEXT NOT NULL,
  r2_key         TEXT NOT NULL,                -- object key in reserve-collect-photos bucket
  kind           TEXT NOT NULL DEFAULT 'item', -- 'item' | 'prescription'
  content_type   TEXT NOT NULL,
  size_bytes     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_resv ON photos(reservation_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);

-- ── Status history (staff audit trail) ──────────────────────
CREATE TABLE IF NOT EXISTS reservation_events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id TEXT NOT NULL,
  event          TEXT NOT NULL,                -- 'SUBMITTED','ACCEPTED','READY','COLLECTED',...
  detail         TEXT DEFAULT '',
  actor          TEXT NOT NULL DEFAULT 'system', -- 'customer'|'staff'|'system'
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resv_events_resv ON reservation_events(reservation_id);

-- ── Optional product catalogue (Phase 2; ships empty) ───────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT DEFAULT '',
  description TEXT DEFAULT '',
  stock_state TEXT NOT NULL DEFAULT 'in_stock', -- 'in_stock'|'low'|'out'
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ── Referrals (loyalty / share-a-friend) ────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL,                  -- referrer's code that was used
  referred_email TEXT NOT NULL,               -- who signed up / ordered via the code
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

-- ── Data version (lightweight dashboard polling) ────────────
CREATE TABLE IF NOT EXISTS data_version (
  id INTEGER PRIMARY KEY DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO data_version (id, version) VALUES (1, 0);

-- ── Config (admin-tunable) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO config (key, value) VALUES ('OTP_TTL_MIN', '10');
INSERT OR IGNORE INTO config (key, value) VALUES ('MAX_PHOTO_MB', '8');
INSERT OR IGNORE INTO config (key, value) VALUES ('CATALOGUE_MODE', 'freetext');
INSERT OR IGNORE INTO config (key, value) VALUES ('PHOTO_RETENTION_DAYS', '90');
