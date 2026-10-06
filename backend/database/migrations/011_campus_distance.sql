-- Campus coordinates and property-to-campus distance.
-- Coordinates are only set where a source was found (see the verification notes).
-- Campuses without coordinates keep a NULL distance rather than a guessed one.
-- Idempotent: safe to run on every boot.

ALTER TABLE campuses ADD COLUMN IF NOT EXISTS lat NUMERIC(9,6);
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS lng NUMERIC(9,6);
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS distance_to_campus_m INTEGER;

-- Great-circle distance in metres (haversine, Earth radius 6,371 km).
CREATE OR REPLACE FUNCTION haversine_m(lat1 NUMERIC, lng1 NUMERIC, lat2 NUMERIC, lng2 NUMERIC)
RETURNS INTEGER LANGUAGE sql IMMUTABLE AS $$
  SELECT round(2 * 6371000 * asin(sqrt(
    power(sin(radians((lat2 - lat1) / 2)), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians((lng2 - lng1) / 2)), 2)
  )))::INTEGER
$$;

-- 1. Coordinates for campuses with a source. Only fills blanks.
UPDATE campuses c SET lat = v.lat, lng = v.lng
  FROM universities u, (VALUES
    ('UZ',   'Mount Pleasant Main Campus',                  -17.771390, 31.046110),
    ('NUST', 'Main Campus (Ascot)',                         -20.165000, 28.642000),
    ('MSU',  'Main Campus (Senga Road)',                    -19.516300, 29.835700),
    ('LSU',  'Main Campus',                                 -18.930013, 27.759327),
    ('BUSE', 'Main Campus',                                 -17.324500, 31.332500),
    ('CUT',  'Main Campus',                                 -17.353000, 30.206000),
    ('HIT',  'Main Campus (Belvedere)',                     -17.838000, 31.008000),
    ('GZU',  'Main Campus (Masvingo Teachers'' College site)', -20.103000, 30.863000)
  ) AS v(short, name, lat, lng)
 WHERE u.id = c.university_id AND u.short = v.short AND c.name = v.name AND c.lat IS NULL;

-- 2. Listings on the wrong campus, corrected by suburb.
--    Lupane listings belong to Lupane State's main campus, not the Bulawayo centre.
UPDATE accommodations a SET campus_id = main.id
  FROM campuses bulawayo, campuses main, universities u
 WHERE u.short = 'LSU'
   AND bulawayo.university_id = u.id AND bulawayo.name = 'Bulawayo Campus'
   AND main.university_id = u.id AND main.name = 'Main Campus'
   AND a.campus_id = bulawayo.id
   AND a.suburb ILIKE 'Lupane%';
--    Senga listings belong to Midlands State's main campus, not Batanai.
UPDATE accommodations a SET campus_id = main.id
  FROM campuses batanai, campuses main, universities u
 WHERE u.short = 'MSU'
   AND batanai.university_id = u.id AND batanai.name = 'Batanai Campus'
   AND main.university_id = u.id AND main.name = 'Main Campus (Senga Road)'
   AND a.campus_id = batanai.id
   AND a.suburb ILIKE 'Senga%';

-- 3. Remove test data left by automated tests (reserved example.com domain, and
--    the test listing titles). Listings first, then the test accounts.
DELETE FROM accommodations
 WHERE landlord_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')
    OR title LIKE 'UI upload %'
    OR title LIKE 'E2E test %'
    OR title = 'Test studio near UZ';
DELETE FROM users WHERE email LIKE '%@example.com';

-- 4. Distance from each listing to its campus, in metres. Recomputed for every
--    listing that has both a pin and a campus with coordinates.
UPDATE accommodations a SET distance_to_campus_m = haversine_m(a.lat, a.lng, c.lat, c.lng)
  FROM campuses c
 WHERE c.id = a.campus_id
   AND c.lat IS NOT NULL AND c.lng IS NOT NULL
   AND a.lat IS NOT NULL AND a.lng IS NOT NULL;
