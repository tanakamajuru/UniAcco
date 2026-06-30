-- ============================================================
-- UniAcco — canonical PostgreSQL schema + core seed
-- Implements design_handoff_uniacco/SCHEMA.sql.
-- WARNING: drops the marketplace tables and recreates them.
--
-- Full setup (run in order):
--   1. psql ... -f backend/database/uniacco.sql       (schema + core seed)
--   2. psql ... -f backend/database/universities.sql  (all ZW universities/campuses, idempotent)
--   3. psql ... -f backend/database/properties.sql    (national listings, idempotent)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- Drop in dependency order so re-runs are clean.
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_threads CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS accommodation_amenities CASCADE;
DROP TABLE IF EXISTS accommodation_images CASCADE;
DROP TABLE IF EXISTS accommodations CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS campuses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

-- ---------- Universities & campuses ----------
CREATE TABLE universities (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  short     TEXT NOT NULL,
  city      TEXT NOT NULL,
  lat       NUMERIC(9,6),
  lng       NUMERIC(9,6)
);

CREATE TABLE campuses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id   UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  city            TEXT,
  province        TEXT
);

-- ---------- Amenities (lookup) ----------
CREATE TABLE amenities (
  id     TEXT PRIMARY KEY,
  label  TEXT NOT NULL,
  icon   TEXT
);

-- ---------- Users ----------
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student','landlord')),
  university_id   UUID REFERENCES universities(id),
  year_of_study   TEXT,
  course          TEXT,
  budget          TEXT,
  move_in         TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Accommodations ----------
CREATE TABLE accommodations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT,
  address           TEXT,
  suburb            TEXT,
  city              TEXT,
  university_id     UUID REFERENCES universities(id),
  campus_id         UUID REFERENCES campuses(id),
  price_per_month   NUMERIC(10,2) NOT NULL,
  bedrooms          INT NOT NULL DEFAULT 1,
  bathrooms         INT NOT NULL DEFAULT 1,
  people_per_room   INT NOT NULL DEFAULT 1,
  walk_minutes      INT,
  lat               NUMERIC(9,6),
  lng               NUMERIC(9,6),
  available_from    DATE,
  lease_terms       TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','pending','active','rented','rejected')),
  views             INT NOT NULL DEFAULT 0,
  rooms_total       INT NOT NULL DEFAULT 1,
  rooms_filled      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_acc_university ON accommodations(university_id);
CREATE INDEX idx_acc_status     ON accommodations(status);
CREATE INDEX idx_acc_landlord   ON accommodations(landlord_id);

CREATE TABLE accommodation_images (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  image_url         TEXT NOT NULL,
  position          INT NOT NULL DEFAULT 0
);

CREATE TABLE accommodation_amenities (
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  amenity_id        TEXT NOT NULL REFERENCES amenities(id),
  PRIMARY KEY (accommodation_id, amenity_id)
);

-- ---------- Reviews ----------
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name       TEXT,
  rating            NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 0 AND 5),
  body              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Favourites ----------
CREATE TABLE favourites (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, accommodation_id)
);

-- ---------- Payments (Pesepay, 30-day validity) ----------
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_id  UUID REFERENCES accommodations(id) ON DELETE SET NULL,
  feature           TEXT NOT NULL,
  amount            NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  currency          TEXT NOT NULL DEFAULT 'USD',
  method            TEXT,                 -- 'web' | 'mobile'
  mobile_provider   TEXT,                 -- 'ecocash' | 'innbucks'
  email             TEXT,
  phone             TEXT,
  gateway_reference TEXT,                 -- Pesepay reference number
  poll_url          TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','failed','cancelled')),
  paid_at           TIMESTAMPTZ,
  valid_until       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_lookup ON payments(user_id, accommodation_id, feature, status);
CREATE INDEX idx_pay_reference ON payments(gateway_reference);

-- ---------- Applications ----------
CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  year_of_study     TEXT,
  move_in_date      DATE,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','declined','withdrawn')),
  payment_id        UUID REFERENCES payments(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_app_accommodation ON applications(accommodation_id);
CREATE INDEX idx_app_student       ON applications(student_id);

-- ---------- Messaging ----------
CREATE TABLE message_threads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID REFERENCES accommodations(id) ON DELETE SET NULL,
  student_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (accommodation_id, student_id, landlord_id)
);

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_thread ON messages(thread_id, created_at);

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
  ('tv','DSTV','Tv'),
  ('water','Borehole','Droplets');

INSERT INTO universities (name,short,city,lat,lng) VALUES
  ('University of Zimbabwe','UZ','Harare',-17.785600,31.048900),
  ('National University of Science and Technology','NUST','Bulawayo',-20.175600,28.568900),
  ('Midlands State University','MSU','Gweru',-19.516000,29.834000),
  ('Africa University','AU','Mutare',-18.876000,32.612000),
  ('Chinhoyi University of Technology','CUT','Chinhoyi',-17.349000,30.197000);

INSERT INTO campuses (university_id, name)
SELECT id, 'Main Campus' FROM universities;

-- ============================================================
-- Seed users  (password for all: "password123")
-- ============================================================
-- Landlords (hosts)
INSERT INTO users (id, full_name, email, phone, password_hash, role, is_verified) VALUES
  ('11111111-1111-1111-1111-111111111111','Rumbi Chikomo','rumbi@uniacco.test','+263 77 412 8890','$2b$10$I.gftAd3E/n7TEc45BDfzu/yZRHdMRybgJaJJdMxrIGIVJVxBaibW','landlord',true),
  ('22222222-2222-2222-2222-222222222222','Tendai Nyathi','tendai@uniacco.test','+263 71 220 5567','$2b$10$I.gftAd3E/n7TEc45BDfzu/yZRHdMRybgJaJJdMxrIGIVJVxBaibW','landlord',true),
  ('33333333-3333-3333-3333-333333333333','Grace Madziva','grace@uniacco.test','+263 78 905 1123','$2b$10$I.gftAd3E/n7TEc45BDfzu/yZRHdMRybgJaJJdMxrIGIVJVxBaibW','landlord',true);

-- Students
INSERT INTO users (id, full_name, email, phone, password_hash, role, university_id, year_of_study, course, budget, move_in, is_verified)
SELECT
  '44444444-4444-4444-4444-444444444444','Tariro Moyo','tariro@students.uz.ac.zw','+263 77 555 0101',
  '$2b$10$I.gftAd3E/n7TEc45BDfzu/yZRHdMRybgJaJJdMxrIGIVJVxBaibW','student',
  (SELECT id FROM universities WHERE short='UZ'),'2nd year','BSc Computer Science','$120–260','Aug 2026',true;

INSERT INTO users (id, full_name, email, phone, password_hash, role, university_id, year_of_study, course, is_verified)
SELECT
  '55555555-5555-5555-5555-555555555555','Panashe Kuda','panashe@students.uz.ac.zw','+263 77 555 0202',
  '$2b$10$I.gftAd3E/n7TEc45BDfzu/yZRHdMRybgJaJJdMxrIGIVJVxBaibW','student',
  (SELECT id FROM universities WHERE short='UZ'),'3rd year','LLB Law',true;

-- ============================================================
-- Seed accommodations (mirrors the prototype's six homes)
-- ============================================================
DO $$
DECLARE
  uz   UUID := (SELECT id FROM universities WHERE short='UZ');
  cuz  UUID := (SELECT id FROM campuses WHERE university_id=(SELECT id FROM universities WHERE short='UZ') LIMIT 1);
  rumbi  UUID := '11111111-1111-1111-1111-111111111111';
  tendai UUID := '22222222-2222-2222-2222-222222222222';
  grace  UUID := '33333333-3333-3333-3333-333333333333';
  a1 UUID; a2 UUID; a3 UUID; a4 UUID; a5 UUID; a6 UUID;
BEGIN
  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (rumbi,'Sunny ensuite, Mount Pleasant','A bright, private ensuite room in a secure four-bedroom house shared with three other UZ students. Fast fibre, a backup solar inverter for load-shedding, and an 8-minute walk to the main gate. Quiet street in Mount Pleasant, walking distance to Avondale shops.','Ensuite room','Mount Pleasant','Harare',uz,cuz,180,1,1,1,8,-17.782000,31.045000,'2026-08-25','Per semester or 12 mo','active',412,4,3)
  RETURNING id INTO a1;

  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (tendai,'4-bed student house, Avondale','Spacious shared house perfect for a group of friends. Big communal kitchen and lounge, walled yard with parking and a borehole so water is never a problem. Five minutes from Avondale shopping centre and a short combi ride to campus.','Shared house','Avondale','Harare',uz,cuz,140,4,2,1,14,-17.790000,31.038000,CURRENT_DATE,'12 month lease','active',286,4,1)
  RETURNING id INTO a2;

  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (grace,'Compact studio, Belgravia','Self-contained studio with its own entrance, kitchenette and ensuite — total privacy and quiet for finals. Prepaid ZESA and solar backup lighting. Leafy Belgravia street, close to the Avenues and an easy walk to UZ.','Studio flat','Belgravia','Harare',uz,cuz,230,1,1,1,11,-17.796000,31.050000,'2026-09-01','6 or 12 months','active',190,1,0)
  RETURNING id INTO a3;

  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (rumbi,'Modern room, Hatcliffe','Affordable twin-share room in a friendly student house close to campus. Great value with WiFi and a shared kitchen included. Suits first-years looking for a budget option with good company.','Ensuite room','Hatcliffe','Harare',uz,cuz,120,1,1,2,6,-17.770000,31.060000,CURRENT_DATE,'Per semester','pending',0,1,0)
  RETURNING id INTO a4;

  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (grace,'Garden cottage, Milton Park','A charming private garden cottage behind a family home in leafy Milton Park. Fully furnished with a proper desk for study, fast WiFi, solar backup and secure parking. Landlord lives on-site — safe and well looked after.','Studio flat','Milton Park','Harare',uz,cuz,260,1,1,1,16,-17.810000,31.030000,'2026-08-25','12 month lease','active',587,1,1)
  RETURNING id INTO a5;

  INSERT INTO accommodations (landlord_id,title,description,type,suburb,city,university_id,campus_id,price_per_month,bedrooms,bathrooms,people_per_room,walk_minutes,lat,lng,available_from,lease_terms,status,views,rooms_total,rooms_filled)
  VALUES (tendai,'5-bed, Greendale','Large five-bedroom house ideal for a group renting together. Three bathrooms means no morning queues, plus a big garden, DSTV in the lounge and a generator for load-shedding. Quiet, leafy Greendale neighbourhood.','Shared house','Greendale','Harare',uz,cuz,155,5,3,1,19,-17.800000,31.110000,'2026-09-01','12 month lease','active',221,5,2)
  RETURNING id INTO a6;

  -- amenities
  INSERT INTO accommodation_amenities (accommodation_id, amenity_id) VALUES
    (a1,'wifi'),(a1,'furnished'),(a1,'kitchen'),(a1,'laundry'),(a1,'heating'),(a1,'parking'),
    (a2,'wifi'),(a2,'furnished'),(a2,'kitchen'),(a2,'parking'),(a2,'tv'),(a2,'water'),
    (a3,'wifi'),(a3,'furnished'),(a3,'kitchen'),(a3,'laundry'),(a3,'heating'),(a3,'tv'),
    (a4,'wifi'),(a4,'kitchen'),(a4,'parking'),
    (a5,'wifi'),(a5,'furnished'),(a5,'kitchen'),(a5,'laundry'),(a5,'heating'),(a5,'parking'),(a5,'tv'),
    (a6,'wifi'),(a6,'furnished'),(a6,'kitchen'),(a6,'parking'),(a6,'tv'),(a6,'laundry');

  -- images (reuse files already in backend/uploads/accommodations)
  INSERT INTO accommodation_images (accommodation_id, image_url, position) VALUES
    (a1,'/uploads/accommodations/accommodation-04712b7fa62a4ea1208e2b71bc1b05ac.jpg',0),
    (a1,'/uploads/accommodations/accommodation-0ab11187c859488b5763af2a04367bb5.jpg',1),
    (a1,'/uploads/accommodations/accommodation-29c40ef5fe099f23c582cd966acba3ce.jpg',2),
    (a2,'/uploads/accommodations/accommodation-4d05d49d374b6055bd2f696c4aa623ad.jpg',0),
    (a2,'/uploads/accommodations/accommodation-6a0233d8bf2f292bb1be2ed4592d22a8.jpg',1),
    (a3,'/uploads/accommodations/accommodation-74d77c05ab5e28ee22e8acefe6fe96a9.jpg',0),
    (a3,'/uploads/accommodations/accommodation-900fa876484751c49810cd39fdedbb83.jpg',1),
    (a4,'/uploads/accommodations/accommodation-aca652b7fc4d6017eaa04b421d9ed00a.jpg',0),
    (a5,'/uploads/accommodations/accommodation-ad104380a0b34487f023779211b09163.jpg',0),
    (a5,'/uploads/accommodations/accommodation-c9ab3d9fb9c723125ae3c0e497ff0807.jpg',1),
    (a6,'/uploads/accommodations/accommodation-d177adebd078e2d00581046ed1dda434.jpg',0),
    (a6,'/uploads/accommodations/accommodation-d432f73f2ac026ebecd9ef30588e87a0.jpg',1);

  -- reviews
  INSERT INTO reviews (accommodation_id, author_name, rating, body, created_at) VALUES
    (a1,'Panashe K.',5.0,'Rumbi is a fantastic host. Room is exactly as pictured and the solar backup is a lifesaver during load-shedding.', now() - interval '14 days'),
    (a1,'Anesu M.',4.8,'Super quiet street, fast WiFi and a 10-min walk to UZ. Would recommend to any student.', now() - interval '32 days'),
    (a2,'Kuda T.',4.7,'Great housemates and the borehole means water is never an issue. Good value.', now() - interval '20 days'),
    (a3,'Rufaro N.',4.8,'Perfect little studio for finals — total privacy and quiet.', now() - interval '10 days'),
    (a5,'Chido M.',5.0,'The cottage is spotless and the landlord is lovely. Felt safe the whole year.', now() - interval '40 days'),
    (a6,'Tatenda S.',4.6,'Loads of space for the group, DSTV in the lounge was a bonus.', now() - interval '25 days');
END $$;
