-- Flags listings priced far below comparable homes at the same university, so they
-- are reviewed before publishing. Idempotent.
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT FALSE;
