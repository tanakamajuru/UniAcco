-- Epoch Mine campus (Gwanda State University), from a published source.
-- Batanai, the Herbert Chitepo Law School and Dozmery have no exact source yet,
-- so they keep NULL coordinates and no distance. Idempotent.
UPDATE campuses c SET lat = -20.441888, lng = 29.270234
  FROM universities u
 WHERE u.id = c.university_id AND u.short = 'GSU' AND c.name = 'Epoch Mine Campus' AND c.lat IS NULL;

UPDATE accommodations a SET distance_to_campus_m = haversine_m(a.lat, a.lng, c.lat, c.lng)
  FROM campuses c
 WHERE c.id = a.campus_id AND c.lat IS NOT NULL AND a.lat IS NOT NULL;
