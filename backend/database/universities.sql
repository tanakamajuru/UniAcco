-- ============================================================
-- UniAcco — Zimbabwe universities & campuses
-- Idempotent + additive: safe to run against a live DB. It only
-- adds rows that don't already exist and never drops anything.
--   psql "$DATABASE_URL" -f backend/database/universities.sql
-- ============================================================

-- Campuses gain city/province so we can show where each centre is.
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS city     TEXT;
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS province TEXT;

-- ---------- Universities (20) ----------
INSERT INTO universities (name, short, city, lat, lng)
SELECT v.name, v.short, v.city, v.lat, v.lng
FROM (VALUES
  ('University of Zimbabwe','UZ','Harare',-17.785600,31.048900),
  ('National University of Science and Technology','NUST','Bulawayo',-20.175600,28.568900),
  ('Midlands State University','MSU','Gweru',-19.516000,29.834000),
  ('Africa University','AU','Mutare',-18.876000,32.612000),
  ('Bindura University of Science Education','BUSE','Bindura',-17.301000,31.330000),
  ('Chinhoyi University of Technology','CUT','Chinhoyi',-17.349000,30.197000),
  ('Harare Institute of Technology','HIT','Harare',-17.857000,31.027000),
  ('Great Zimbabwe University','GZU','Masvingo',-20.063000,30.833000),
  ('Lupane State University','LSU','Lupane',-18.931000,27.807000),
  ('Gwanda State University','GSU','Gwanda',-20.939000,29.000000),
  ('Manicaland State University of Applied Sciences','MSUAS','Mutare',-18.970000,32.670000),
  ('Marondera University of Agricultural Sciences and Technology','MUAST','Marondera',-18.186000,31.551000),
  ('Zimbabwe Open University','ZOU','Harare',-17.824000,31.053000),
  ('Women''s University in Africa','WUA','Harare',-17.830000,31.050000),
  ('Catholic University of Zimbabwe','CUZ','Harare',-17.800000,31.070000),
  ('Arrupe Jesuit University','AJU','Harare',-17.780000,31.100000),
  ('Reformed Church University','RCU','Masvingo',-20.060000,30.830000),
  ('Solusi University','SU','Bulawayo',-20.100000,28.400000),
  ('Zimbabwe Ezekiel Guti University','ZEGU','Bindura',-17.300000,31.330000),
  ('Zimbabwe National Defence University','ZNDU','Mazowe',-17.510000,30.970000),
  ('Pan African Minerals University of Science and Technology','PAMUST','Kwekwe',-18.928000,29.814000)
) AS v(name, short, city, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM universities u WHERE u.name = v.name);

-- ---------- Campuses (49) ----------
INSERT INTO campuses (university_id, name, city, province)
SELECT u.id, c.campus, c.city, c.province
FROM (VALUES
  ('University of Zimbabwe','Mount Pleasant Main Campus','Harare','Harare Metropolitan'),
  ('University of Zimbabwe','Parirenyatwa Campus','Harare','Harare Metropolitan'),
  ('University of Zimbabwe','Kariba Research Station','Kariba','Mashonaland West'),
  ('National University of Science and Technology','Main Campus','Bulawayo','Bulawayo Metropolitan'),
  ('National University of Science and Technology','Medical School Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Midlands State University','Senga Campus','Gweru','Midlands'),
  ('Midlands State University','Batanai Campus','Gweru','Midlands'),
  ('Midlands State University','TelOne Campus','Gweru','Midlands'),
  ('Midlands State University','Zvishavane Campus','Zvishavane','Midlands'),
  ('Midlands State University','Harare Campus','Harare','Harare Metropolitan'),
  ('Midlands State University','Mutare Campus','Mutare','Manicaland'),
  ('Africa University','Main Campus','Mutare','Manicaland'),
  ('Bindura University of Science Education','Main Campus','Bindura','Mashonaland Central'),
  ('Chinhoyi University of Technology','Main Campus','Chinhoyi','Mashonaland West'),
  ('Harare Institute of Technology','Main Campus','Harare','Harare Metropolitan'),
  ('Great Zimbabwe University','Mashava Campus','Mashava','Masvingo'),
  ('Great Zimbabwe University','Mucheke Campus','Masvingo','Masvingo'),
  ('Great Zimbabwe University','Herbert Chitepo Law School','Masvingo','Masvingo'),
  ('Great Zimbabwe University','School of Agriculture Campus','Masvingo','Masvingo'),
  ('Lupane State University','Main Campus','Lupane','Matabeleland North'),
  ('Lupane State University','Bulawayo Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Gwanda State University','Main Campus','Gwanda','Matabeleland South'),
  ('Gwanda State University','Epoch Mine Campus','Filabusi','Matabeleland South'),
  ('Manicaland State University of Applied Sciences','Main Campus','Mutare','Manicaland'),
  ('Marondera University of Agricultural Sciences and Technology','Main Campus','Marondera','Mashonaland East'),
  ('Zimbabwe Open University','National Centre','Harare','Harare Metropolitan'),
  ('Zimbabwe Open University','Bulawayo Regional Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Zimbabwe Open University','Gweru Regional Campus','Gweru','Midlands'),
  ('Zimbabwe Open University','Mutare Regional Campus','Mutare','Manicaland'),
  ('Zimbabwe Open University','Masvingo Regional Campus','Masvingo','Masvingo'),
  ('Zimbabwe Open University','Chinhoyi Regional Campus','Chinhoyi','Mashonaland West'),
  ('Zimbabwe Open University','Bindura Regional Campus','Bindura','Mashonaland Central'),
  ('Zimbabwe Open University','Marondera Regional Campus','Marondera','Mashonaland East'),
  ('Zimbabwe Open University','Gwanda Regional Campus','Gwanda','Matabeleland South'),
  ('Zimbabwe Open University','Lupane Regional Campus','Lupane','Matabeleland North'),
  ('Women''s University in Africa','Main Campus','Harare','Harare Metropolitan'),
  ('Women''s University in Africa','Marondera Campus','Marondera','Mashonaland East'),
  ('Women''s University in Africa','Bulawayo Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Catholic University of Zimbabwe','Main Campus','Harare','Harare Metropolitan'),
  ('Catholic University of Zimbabwe','Bulawayo Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Catholic University of Zimbabwe','Gweru Campus','Gweru','Midlands'),
  ('Arrupe Jesuit University','Main Campus','Harare','Harare Metropolitan'),
  ('Reformed Church University','Main Campus','Masvingo','Masvingo'),
  ('Reformed Church University','Marondera Campus','Marondera','Mashonaland East'),
  ('Solusi University','Solusi Main Campus','Bulawayo','Bulawayo Metropolitan'),
  ('Zimbabwe Ezekiel Guti University','Main Campus','Bindura','Mashonaland Central'),
  ('Zimbabwe Ezekiel Guti University','Harare Centre','Harare','Harare Metropolitan'),
  ('Zimbabwe National Defence University','Main Campus','Mazowe','Mashonaland Central'),
  ('Pan African Minerals University of Science and Technology','Main Campus','Kwekwe','Midlands')
) AS c(uni, campus, city, province)
JOIN universities u ON u.name = c.uni
WHERE NOT EXISTS (
  SELECT 1 FROM campuses x WHERE x.university_id = u.id AND x.name = c.campus
);
