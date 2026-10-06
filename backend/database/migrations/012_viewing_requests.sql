-- Viewing requests: a paid student asks to see a property at a chosen time.
-- Personal fields are cleared by retention (utils/retention.js) after the viewing.
-- Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS viewing_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id  UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  student_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name         TEXT,
  phone             TEXT,
  requested_at      TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested','confirmed','declined','cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_viewing_accommodation ON viewing_requests(accommodation_id);
