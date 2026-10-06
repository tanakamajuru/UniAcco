-- Fingerprint of each uploaded photo, used to catch copied listings. Idempotent.
ALTER TABLE accommodation_images ADD COLUMN IF NOT EXISTS image_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_images_hash ON accommodation_images(image_hash);
