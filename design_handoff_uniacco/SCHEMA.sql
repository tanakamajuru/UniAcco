-- ============================================================
-- UniAcco — PostgreSQL schema
-- Extends the existing accommodations + payments tables with the
-- entities the prototype introduces: applications, messages,
-- favourites, universities/campuses, amenities, and map coords.
-- Tables are ordered so this runs top-to-bottom with no forward refs.
-- Adjust to fit your existing migrations.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ---------- Universities & campuses ----------
CREATE TABLE IF NOT EXISTS universities (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,            -- 'University of Zimbabwe'
  short     TEXT NOT NULL,            -- 'UZ'
  city      TEXT NOT NULL,            -- 'Harare'
  lat       NUMERIC(9,6),             -- campus centre for map
  lng       NUMERIC(9,6)
);

CREATE TABLE IF NOT EXISTS campuses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id   UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name            TEXT NOT NULL       -- 'Main Campus'
);

-- ---------- Amenities (lookup) ----------
CREATE TABLE IF NOT EXISTS amenities (
  id     TEXT PRIMARY KEY,            -- 'wifi','furnished','kitchen','laundry','heating','parking','tv','water'
  label  TEXT NOT NULL,
  icon   TEXT                         -- lucide name, e.g. 'Wifi'
);

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student'      -- 'student' | 'landlord'
                  CHECK (role IN ('student','landlord')),
  -- student profile
  university_id   UUID REFERENCES universities(id),
  year_of_study   TEXT,
  course          TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,       -- .ac.zw / doc verified
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Accommodations ----------
CREATE TABLE IF NOT EXISTS accommodations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT,                          -- 'Ensuite room' | 'Studio flat' | 'Shared house'
  address           TEXT,
  suburb            TEXT,                          -- 'Mount Pleasant'
  city              TEXT,                          -- 'Harare'
  university_id     UUID REFERENCES universities(id),
  campus_id         UUID REFERENCES campuses(id),
  price_per_month   NUMERIC(10,2) NOT NULL,        -- USD
  bedrooms          INT NOT NULL DEFAULT 1,
  bathrooms         INT NOT NULL DEFAULT 1,
  people_per_room   INT NOT NULL DEFAULT 1,
  walk_minutes      INT,                           -- to campus
  lat               NUMERIC(9,6),
  lng               NUMERIC(9,6),
  available_from    DATE,
  lease_terms       TEXT,                          -- 'Per semester or 12 mo'
  status            TEXT NOT NULL DEFAULT 'draft'  -- 'draft'|'pending'|'active'|'rented'|'rejected'
                    CHECK (status IN ('draft','pending','active','rented','rejected')),
  views             INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_acc_university ON accommodations(university_id);
CREATE INDEX IF NOT EXISTS idx_acc_status     ON accommodations(status);

-- images (ordered)
CREATE TABLE IF NOT EXISTS accommodation_images (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  image_url         TEXT NOT NULL,
  position          INT NOT NULL DEFAULT 0
);

-- amenities join
CREATE TABLE IF NOT EXISTS accommodation_amenities (
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  amenity_id        TEXT NOT NULL REFERENCES amenities(id),
  PRIMARY KEY (accommodation_id, amenity_id)
);

-- ---------- Reviews (optional, later phase) ----------
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  rating            NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 0 AND 5),
  body              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- accommodations.rating / reviews_count are computed as aggregates over this table.

-- ---------- Favourites (saved homes) ----------
CREATE TABLE IF NOT EXISTS favourites (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, accommodation_id)
);

-- ---------- Payments (existing — PayNow, 30-day validity) ----------
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_id  UUID REFERENCES accommodations(id) ON DELETE SET NULL,
  feature           TEXT NOT NULL,        -- 'accommodation_details' | 'messaging' | 'advanced_search' | ...
  amount            NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  currency          TEXT NOT NULL DEFAULT 'USD',
  method            TEXT,                 -- 'web' | 'mobile'
  mobile_provider   TEXT,                 -- 'ecocash' | 'onemoney'
  paynow_reference  TEXT,
  poll_url          TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'   -- 'pending'|'paid'|'failed'|'cancelled'
                    CHECK (status IN ('pending','paid','failed','cancelled')),
  paid_at           TIMESTAMPTZ,
  valid_until       TIMESTAMPTZ,          -- paid_at + 30 days
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pay_lookup ON payments(user_id, accommodation_id, feature, status);

-- "Has the user unlocked this accommodation?" =
--   SELECT 1 FROM payments
--   WHERE user_id=$1 AND accommodation_id=$2 AND feature='accommodation_details'
--     AND status='paid' AND (valid_until IS NULL OR valid_until > now())
--   LIMIT 1;

-- ---------- Applications ----------
CREATE TABLE IF NOT EXISTS applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  year_of_study     TEXT,
  move_in_date      DATE,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'   -- 'pending'|'accepted'|'declined'|'withdrawn'
                    CHECK (status IN ('pending','accepted','declined','withdrawn')),
  payment_id        UUID REFERENCES payments(id),     -- the $2 access fee that gated this
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_accommodation ON applications(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_app_student       ON applications(student_id);

-- ---------- Messaging ----------
CREATE TABLE IF NOT EXISTS message_threads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID REFERENCES accommodations(id) ON DELETE SET NULL,
  student_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (accommodation_id, student_id, landlord_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msg_thread ON messages(thread_id, created_at);

-- ============================================================
-- Seed lookups
-- ============================================================
INSERT INTO amenities (id,label,icon) VALUES
  ('wifi','WiFi','Wifi'),
  ('furnished','Furnished','Sofa'),
  ('kitchen','Kitchen','Utensils'),
  ('laundry','Laundry','WashingMachine'),
  ('heating','Solar backup','Sun'),
  ('parking','Parking','Car'),
  ('tv','DSTV','Tv2'),
  ('water','Borehole','Droplets')
ON CONFLICT (id) DO NOTHING;

INSERT INTO universities (name,short,city) VALUES
  ('University of Zimbabwe','UZ','Harare'),
  ('National University of Science and Technology','NUST','Bulawayo'),
  ('Midlands State University','MSU','Gweru'),
  ('Africa University','AU','Mutare'),
  ('Chinhoyi University of Technology','CUT','Chinhoyi')
ON CONFLICT DO NOTHING;
