-- Tag each listing photo as interior/exterior so we can require both at
-- listing time (and group them later). Safe to run repeatedly.
ALTER TABLE accommodation_images ADD COLUMN IF NOT EXISTS kind TEXT;
