-- ============================================================
-- UniAcco — additional listings across Zimbabwe
-- Idempotent + additive (guarded by title). Real images are reused
-- from backend/uploads/accommodations. Run after universities.sql:
--   psql "$DATABASE_URL" -f backend/database/properties.sql
-- ============================================================

-- ---------- Accommodations ----------
-- landlord ids are the seeded hosts (Rumbi / Tendai / Grace).
INSERT INTO accommodations
  (landlord_id, title, description, type, suburb, city, university_id, campus_id,
   price_per_month, bedrooms, bathrooms, people_per_room, walk_minutes, lat, lng,
   available_from, lease_terms, status, rooms_total, rooms_filled)
SELECT
  v.landlord_id::uuid, v.title, v.description, v.type, v.suburb, v.city, u.id, camp.id,
  v.price, v.bedrooms, v.bathrooms, v.cap, v.walk, v.lat, v.lng,
  v.available_from::date, v.lease, 'active', v.rooms_total, v.rooms_filled
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111','Ensuite near NUST, Hillside','A bright ensuite room a short walk from the NUST main gate. Fast fibre, solar backup and secure parking in quiet Hillside.','Ensuite room','Hillside','Bulawayo','NUST',150.00,1,1,1,7,-20.158000,28.585000,'2026-08-01','Per semester or 12 mo',1,0),
  ('22222222-2222-2222-2222-222222222222','Student flat, Famona','Self-contained studio in Famona, ideal for a focused NUST student. Prepaid power and borehole water.','Studio flat','Famona','Bulawayo','NUST',210.00,1,1,1,12,-20.170000,28.600000,'2026-09-01','6 or 12 months',1,0),
  ('33333333-3333-3333-3333-333333333333','4-bed house near MSU, Senga','Spacious shared house in Senga, minutes from MSU. Big lounge, walled yard and DSTV.','Shared house','Senga','Gweru','MSU',135.00,4,2,1,9,-19.455000,29.815000,'2026-08-25','12 month lease',4,1),
  ('11111111-1111-1111-1111-111111111111','Cozy room, Mkoba','Affordable twin-share room in Mkoba with WiFi and a shared kitchen. Great value for first-years.','Ensuite room','Mkoba','Gweru','MSU',95.00,1,1,2,15,-19.480000,29.780000,'2026-08-01','Per semester',1,0),
  ('22222222-2222-2222-2222-222222222222','Garden room near Africa University','Private garden room in leafy Mutare, a gentle walk to Africa University. Furnished with a proper study desk.','Ensuite room','Fairbridge Park','Mutare','AU',160.00,1,1,1,10,-18.880000,32.620000,'2026-09-01','12 month lease',1,0),
  ('33333333-3333-3333-3333-333333333333','Modern studio near CUT, Chikonohono','Compact modern studio close to Chinhoyi University of Technology. Tiled, secure and move-in ready.','Studio flat','Chikonohono','Chinhoyi','CUT',180.00,1,1,1,8,-17.352000,30.190000,'2026-08-15','6 or 12 months',1,0),
  ('11111111-1111-1111-1111-111111111111','4-bed near GZU, Rujeko','Friendly four-bedroom house in Rujeko, a short combi ride to Great Zimbabwe University. Borehole and generator.','Shared house','Rujeko','Masvingo','GZU',130.00,4,2,1,16,-20.070000,30.840000,'2026-09-01','12 month lease',4,2),
  ('22222222-2222-2222-2222-222222222222','Ensuite near BUSE, Chipadze','Neat ensuite room in Chipadze, walking distance to Bindura University. Quiet and well-secured.','Ensuite room','Chipadze','Bindura','BUSE',120.00,1,1,1,11,-17.300000,31.335000,'2026-08-01','Per semester or 12 mo',1,0),
  ('33333333-3333-3333-3333-333333333333','City studio near HIT, Belvedere','Bright studio in Belvedere, an easy ride to Harare Institute of Technology. Fibre and solar backup.','Studio flat','Belvedere','Harare','HIT',240.00,1,1,1,13,-17.860000,31.030000,'2026-08-25','12 month lease',1,1),
  ('11111111-1111-1111-1111-111111111111','Quiet room near MUAST, Dombotombo','Peaceful ensuite in Dombotombo, close to Marondera University of Agricultural Sciences. Great for study.','Ensuite room','Dombotombo','Marondera','MUAST',110.00,1,1,1,14,-18.190000,31.555000,'2026-09-01','Per semester',1,0),
  ('22222222-2222-2222-2222-222222222222','Student lodge, Lupane Centre','Shared student lodge near Lupane State University. Communal kitchen, borehole and a safe walled yard.','Shared house','Lupane Centre','Lupane','LSU',105.00,3,2,1,6,-18.930000,27.810000,'2026-08-01','12 month lease',3,1),
  ('33333333-3333-3333-3333-333333333333','Room near GSU, Jahunda','Comfortable ensuite room in Jahunda, a short walk to Gwanda State University. Prepaid power, secure.','Ensuite room','Jahunda','Gwanda','GSU',100.00,1,1,1,9,-20.940000,29.005000,'2026-08-15','Per semester or 12 mo',1,0)
) AS v(landlord_id, title, description, type, suburb, city, uni_short, price, bedrooms, bathrooms, cap, walk, lat, lng, available_from, lease, rooms_total, rooms_filled)
JOIN universities u ON u.short = v.uni_short
LEFT JOIN LATERAL (
  SELECT id FROM campuses WHERE university_id = u.id ORDER BY name LIMIT 1
) camp ON true
WHERE NOT EXISTS (SELECT 1 FROM accommodations a WHERE a.title = v.title);

-- ---------- Amenities ----------
INSERT INTO accommodation_amenities (accommodation_id, amenity_id)
SELECT a.id, m.amenity_id
FROM (VALUES
  ('Ensuite near NUST, Hillside','wifi'),('Ensuite near NUST, Hillside','furnished'),('Ensuite near NUST, Hillside','heating'),('Ensuite near NUST, Hillside','parking'),
  ('Student flat, Famona','wifi'),('Student flat, Famona','kitchen'),('Student flat, Famona','water'),('Student flat, Famona','heating'),
  ('4-bed house near MSU, Senga','wifi'),('4-bed house near MSU, Senga','furnished'),('4-bed house near MSU, Senga','kitchen'),('4-bed house near MSU, Senga','parking'),('4-bed house near MSU, Senga','tv'),
  ('Cozy room, Mkoba','wifi'),('Cozy room, Mkoba','kitchen'),
  ('Garden room near Africa University','wifi'),('Garden room near Africa University','furnished'),('Garden room near Africa University','kitchen'),('Garden room near Africa University','heating'),
  ('Modern studio near CUT, Chikonohono','wifi'),('Modern studio near CUT, Chikonohono','furnished'),('Modern studio near CUT, Chikonohono','kitchen'),('Modern studio near CUT, Chikonohono','tv'),
  ('4-bed near GZU, Rujeko','wifi'),('4-bed near GZU, Rujeko','kitchen'),('4-bed near GZU, Rujeko','parking'),('4-bed near GZU, Rujeko','water'),
  ('Ensuite near BUSE, Chipadze','wifi'),('Ensuite near BUSE, Chipadze','furnished'),('Ensuite near BUSE, Chipadze','parking'),
  ('City studio near HIT, Belvedere','wifi'),('City studio near HIT, Belvedere','furnished'),('City studio near HIT, Belvedere','kitchen'),('City studio near HIT, Belvedere','heating'),('City studio near HIT, Belvedere','tv'),
  ('Quiet room near MUAST, Dombotombo','wifi'),('Quiet room near MUAST, Dombotombo','kitchen'),('Quiet room near MUAST, Dombotombo','heating'),
  ('Student lodge, Lupane Centre','wifi'),('Student lodge, Lupane Centre','kitchen'),('Student lodge, Lupane Centre','parking'),('Student lodge, Lupane Centre','water'),
  ('Room near GSU, Jahunda','wifi'),('Room near GSU, Jahunda','furnished'),('Room near GSU, Jahunda','heating')
) AS m(title, amenity_id)
JOIN accommodations a ON a.title = m.title
WHERE NOT EXISTS (
  SELECT 1 FROM accommodation_amenities x WHERE x.accommodation_id = a.id AND x.amenity_id = m.amenity_id
);

-- ---------- Images (real files from /uploads/accommodations) ----------
INSERT INTO accommodation_images (accommodation_id, image_url, position)
SELECT a.id, i.url, i.pos
FROM (VALUES
  ('Ensuite near NUST, Hillside','/uploads/accommodations/accommodation-08068794bd7dce0159991ba7cb8b3720.png',0),
  ('Ensuite near NUST, Hillside','/uploads/accommodations/accommodation-0f1b674a59005bf10b2827cba4fe2022.png',1),
  ('Student flat, Famona','/uploads/accommodations/accommodation-18d10fcdbaa9210d5e71c011f997f95a.png',0),
  ('Student flat, Famona','/uploads/accommodations/accommodation-20c32a2b15deedfe95183b0d0046ba60.png',1),
  ('4-bed house near MSU, Senga','/uploads/accommodations/accommodation-24c490a8aeffe6edacbce0beb561f686.png',0),
  ('4-bed house near MSU, Senga','/uploads/accommodations/accommodation-33f75145eb29555baf954a94775e9f87.png',1),
  ('Cozy room, Mkoba','/uploads/accommodations/accommodation-3768c133ef6dc7f3a3531c9f869c2fa7.png',0),
  ('Cozy room, Mkoba','/uploads/accommodations/accommodation-489d16a83e54947a85306865e9c02d3a.png',1),
  ('Garden room near Africa University','/uploads/accommodations/accommodation-4fcff43480d287edf87b377e8139d202.png',0),
  ('Garden room near Africa University','/uploads/accommodations/accommodation-7a728543a6f4b1f281d8cf1176d2f77e.png',1),
  ('Modern studio near CUT, Chikonohono','/uploads/accommodations/accommodation-d5854e9c28758ed65e5598c6b4fafd3c.png',0),
  ('Modern studio near CUT, Chikonohono','/uploads/accommodations/accommodation-db5c94cc223ad4aed09a06ca482011c8.png',1),
  ('4-bed near GZU, Rujeko','/uploads/accommodations/accommodation-ed7a8636615893d44eb72ee29dc517a6.jpg',0),
  ('4-bed near GZU, Rujeko','/uploads/accommodations/accommodation-f1566f99544534964e13502098cd1e4f.png',1),
  ('Ensuite near BUSE, Chipadze','/uploads/accommodations/accommodation-f1cef596ca3373617db50591969a373e.jpg',0),
  ('Ensuite near BUSE, Chipadze','/uploads/accommodations/accommodation-fbf803d02cbe465ec3ec02324e7633a8.jpg',1),
  ('City studio near HIT, Belvedere','/uploads/accommodations/accommodation-04712b7fa62a4ea1208e2b71bc1b05ac.jpg',0),
  ('City studio near HIT, Belvedere','/uploads/accommodations/accommodation-0ab11187c859488b5763af2a04367bb5.jpg',1),
  ('Quiet room near MUAST, Dombotombo','/uploads/accommodations/accommodation-29c40ef5fe099f23c582cd966acba3ce.jpg',0),
  ('Quiet room near MUAST, Dombotombo','/uploads/accommodations/accommodation-4d05d49d374b6055bd2f696c4aa623ad.jpg',1),
  ('Student lodge, Lupane Centre','/uploads/accommodations/accommodation-6a0233d8bf2f292bb1be2ed4592d22a8.jpg',0),
  ('Student lodge, Lupane Centre','/uploads/accommodations/accommodation-74d77c05ab5e28ee22e8acefe6fe96a9.jpg',1),
  ('Room near GSU, Jahunda','/uploads/accommodations/accommodation-900fa876484751c49810cd39fdedbb83.jpg',0),
  ('Room near GSU, Jahunda','/uploads/accommodations/accommodation-aca652b7fc4d6017eaa04b421d9ed00a.jpg',1)
) AS i(title, url, pos)
JOIN accommodations a ON a.title = i.title
WHERE NOT EXISTS (
  SELECT 1 FROM accommodation_images x WHERE x.accommodation_id = a.id AND x.image_url = i.url
);

-- ---------- A few reviews ----------
INSERT INTO reviews (accommodation_id, author_name, rating, body, created_at)
SELECT a.id, r.author, r.rating, r.body, now() - (r.days || ' days')::interval
FROM (VALUES
  ('Ensuite near NUST, Hillside','Sipho N.',4.8,'Five minutes to campus and the solar backup is brilliant during cuts.',12),
  ('4-bed house near MSU, Senga','Rutendo M.',4.6,'Great housemates and a big yard. Borehole means water is never a problem.',20),
  ('Modern studio near CUT, Chikonohono','Tinashe G.',4.9,'Spotless studio, very secure. Perfect for finals.',8),
  ('City studio near HIT, Belvedere','Anesu D.',4.7,'Bright and central, easy ride to HIT. Landlord is responsive.',15)
) AS r(title, author, rating, body, days)
JOIN accommodations a ON a.title = r.title
WHERE NOT EXISTS (
  SELECT 1 FROM reviews x WHERE x.accommodation_id = a.id AND x.author_name = r.author
);

-- ============================================================
-- Round 2 — a second listing for each university that had only one
-- ============================================================
INSERT INTO accommodations
  (landlord_id, title, description, type, suburb, city, university_id, campus_id,
   price_per_month, bedrooms, bathrooms, people_per_room, walk_minutes, lat, lng,
   available_from, lease_terms, status, rooms_total, rooms_filled)
SELECT
  v.landlord_id::uuid, v.title, v.description, v.type, v.suburb, v.city, u.id, camp.id,
  v.price, v.bedrooms, v.bathrooms, v.cap, v.walk, v.lat, v.lng,
  v.available_from::date, v.lease, 'active', v.rooms_total, v.rooms_filled
FROM (VALUES
  ('22222222-2222-2222-2222-222222222222','Studio near Africa University, Dangamvura','Self-contained studio in Dangamvura, a short combi ride to Africa University. Prepaid power and quiet surrounds.','Studio flat','Dangamvura','Mutare','AU',175.00,1,1,1,13,-18.990000,32.640000,'2026-08-15','6 or 12 months',1,0),
  ('11111111-1111-1111-1111-111111111111','Shared house near CUT, Cold Stream','Roomy shared house in Cold Stream for a group at Chinhoyi University of Technology. Walled yard and borehole.','Shared house','Cold Stream','Chinhoyi','CUT',125.00,4,2,1,12,-17.360000,30.200000,'2026-09-01','12 month lease',4,1),
  ('33333333-3333-3333-3333-333333333333','Ensuite near GZU, Mucheke','Bright ensuite room in Mucheke, close to Great Zimbabwe University''s town campus. WiFi and solar backup.','Ensuite room','Mucheke','Masvingo','GZU',140.00,1,1,1,10,-20.080000,30.825000,'2026-08-01','Per semester or 12 mo',1,0),
  ('22222222-2222-2222-2222-222222222222','Studio near BUSE, Aerodrome','Neat studio in Aerodrome, walking distance to Bindura University of Science Education. Tiled and secure.','Studio flat','Aerodrome','Bindura','BUSE',150.00,1,1,1,9,-17.295000,31.340000,'2026-09-01','6 or 12 months',1,0),
  ('11111111-1111-1111-1111-111111111111','Ensuite near HIT, Milton Park','Private ensuite in Milton Park with a proper study desk, fibre and solar backup. Easy ride to HIT.','Ensuite room','Milton Park','Harare','HIT',200.00,1,1,1,15,-17.825000,31.025000,'2026-08-25','12 month lease',1,0),
  ('33333333-3333-3333-3333-333333333333','Shared house near MUAST, Cherutombo','Friendly shared house in Cherutombo for Marondera University students. Big kitchen, garden and parking.','Shared house','Cherutombo','Marondera','MUAST',115.00,3,2,1,12,-18.195000,31.560000,'2026-09-01','12 month lease',3,1),
  ('22222222-2222-2222-2222-222222222222','Ensuite near LSU, Lupane','Comfortable ensuite a short walk from Lupane State University. Solar backup and a quiet, safe yard.','Ensuite room','Lupane','Lupane','LSU',110.00,1,1,1,8,-18.935000,27.805000,'2026-08-01','Per semester',1,0),
  ('11111111-1111-1111-1111-111111111111','Studio near GSU, Spitzkop','Modern studio in Spitzkop, minutes from Gwanda State University. Prepaid ZESA and secure parking.','Studio flat','Spitzkop','Gwanda','GSU',130.00,1,1,1,11,-20.945000,29.010000,'2026-08-15','6 or 12 months',1,0)
) AS v(landlord_id, title, description, type, suburb, city, uni_short, price, bedrooms, bathrooms, cap, walk, lat, lng, available_from, lease, rooms_total, rooms_filled)
JOIN universities u ON u.short = v.uni_short
LEFT JOIN LATERAL (
  SELECT id FROM campuses WHERE university_id = u.id ORDER BY name LIMIT 1
) camp ON true
WHERE NOT EXISTS (SELECT 1 FROM accommodations a WHERE a.title = v.title);

INSERT INTO accommodation_amenities (accommodation_id, amenity_id)
SELECT a.id, m.amenity_id
FROM (VALUES
  ('Studio near Africa University, Dangamvura','wifi'),('Studio near Africa University, Dangamvura','furnished'),('Studio near Africa University, Dangamvura','kitchen'),('Studio near Africa University, Dangamvura','heating'),
  ('Shared house near CUT, Cold Stream','wifi'),('Shared house near CUT, Cold Stream','kitchen'),('Shared house near CUT, Cold Stream','parking'),('Shared house near CUT, Cold Stream','water'),
  ('Ensuite near GZU, Mucheke','wifi'),('Ensuite near GZU, Mucheke','furnished'),('Ensuite near GZU, Mucheke','heating'),
  ('Studio near BUSE, Aerodrome','wifi'),('Studio near BUSE, Aerodrome','furnished'),('Studio near BUSE, Aerodrome','kitchen'),('Studio near BUSE, Aerodrome','tv'),
  ('Ensuite near HIT, Milton Park','wifi'),('Ensuite near HIT, Milton Park','furnished'),('Ensuite near HIT, Milton Park','kitchen'),('Ensuite near HIT, Milton Park','heating'),('Ensuite near HIT, Milton Park','parking'),
  ('Shared house near MUAST, Cherutombo','wifi'),('Shared house near MUAST, Cherutombo','kitchen'),('Shared house near MUAST, Cherutombo','parking'),
  ('Ensuite near LSU, Lupane','wifi'),('Ensuite near LSU, Lupane','heating'),('Ensuite near LSU, Lupane','water'),
  ('Studio near GSU, Spitzkop','wifi'),('Studio near GSU, Spitzkop','furnished'),('Studio near GSU, Spitzkop','kitchen'),('Studio near GSU, Spitzkop','parking')
) AS m(title, amenity_id)
JOIN accommodations a ON a.title = m.title
WHERE NOT EXISTS (
  SELECT 1 FROM accommodation_amenities x WHERE x.accommodation_id = a.id AND x.amenity_id = m.amenity_id
);

INSERT INTO accommodation_images (accommodation_id, image_url, position)
SELECT a.id, i.url, i.pos
FROM (VALUES
  ('Studio near Africa University, Dangamvura','/uploads/accommodations/accommodation-18d10fcdbaa9210d5e71c011f997f95a.png',0),
  ('Studio near Africa University, Dangamvura','/uploads/accommodations/accommodation-20c32a2b15deedfe95183b0d0046ba60.png',1),
  ('Shared house near CUT, Cold Stream','/uploads/accommodations/accommodation-24c490a8aeffe6edacbce0beb561f686.png',0),
  ('Shared house near CUT, Cold Stream','/uploads/accommodations/accommodation-33f75145eb29555baf954a94775e9f87.png',1),
  ('Ensuite near GZU, Mucheke','/uploads/accommodations/accommodation-3768c133ef6dc7f3a3531c9f869c2fa7.png',0),
  ('Ensuite near GZU, Mucheke','/uploads/accommodations/accommodation-489d16a83e54947a85306865e9c02d3a.png',1),
  ('Studio near BUSE, Aerodrome','/uploads/accommodations/accommodation-4fcff43480d287edf87b377e8139d202.png',0),
  ('Studio near BUSE, Aerodrome','/uploads/accommodations/accommodation-7a728543a6f4b1f281d8cf1176d2f77e.png',1),
  ('Ensuite near HIT, Milton Park','/uploads/accommodations/accommodation-d5854e9c28758ed65e5598c6b4fafd3c.png',0),
  ('Ensuite near HIT, Milton Park','/uploads/accommodations/accommodation-db5c94cc223ad4aed09a06ca482011c8.png',1),
  ('Shared house near MUAST, Cherutombo','/uploads/accommodations/accommodation-ed7a8636615893d44eb72ee29dc517a6.jpg',0),
  ('Shared house near MUAST, Cherutombo','/uploads/accommodations/accommodation-f1566f99544534964e13502098cd1e4f.png',1),
  ('Ensuite near LSU, Lupane','/uploads/accommodations/accommodation-f1cef596ca3373617db50591969a373e.jpg',0),
  ('Ensuite near LSU, Lupane','/uploads/accommodations/accommodation-fbf803d02cbe465ec3ec02324e7633a8.jpg',1),
  ('Studio near GSU, Spitzkop','/uploads/accommodations/accommodation-08068794bd7dce0159991ba7cb8b3720.png',0),
  ('Studio near GSU, Spitzkop','/uploads/accommodations/accommodation-0f1b674a59005bf10b2827cba4fe2022.png',1)
) AS i(title, url, pos)
JOIN accommodations a ON a.title = i.title
WHERE NOT EXISTS (
  SELECT 1 FROM accommodation_images x WHERE x.accommodation_id = a.id AND x.image_url = i.url
);
