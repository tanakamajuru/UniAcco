-- Roommate profiles: a student looking for a flatmate. Minimal by design: first
-- name only, optional phone (shown only if the student adds it), and every profile
-- expires after 30 days. Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS roommate_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  university_id  UUID REFERENCES universities(id) ON DELETE SET NULL,
  budget         NUMERIC(10,2),
  move_in        DATE,
  note           TEXT,
  phone          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days'
);
