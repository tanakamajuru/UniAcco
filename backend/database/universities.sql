-- ============================================================
-- UniAcco — Zimbabwe universities & campuses
-- Idempotent + additive: safe to run against a live DB. It only
-- adds rows that don't already exist and never drops anything.
--   psql "$DATABASE_URL" -f backend/database/universities.sql
-- ============================================================

-- Campuses gain city/province so we can show where each centre is.
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS city     TEXT;
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS province TEXT;

-- ---------- Universities (21) ----------
-- Insert any missing universities, then update coordinates for all.
INSERT INTO universities (name, short, city, lat, lng)
SELECT v.name, v.short, v.city, v.lat, v.lng
FROM (VALUES
  ('University of Zimbabwe','UZ','Harare',-17.78537,31.05311),
  ('National University of Science and Technology','NUST','Bulawayo',-20.09520,28.38341),
  ('Midlands State University','MSU','Gweru',-19.30500,29.50303),
  ('Africa University','AU','Mutare',-18.53400,32.36047),
  ('Bindura University of Science Education','BUSE','Bindura',-17.19280,31.19588),
  ('Chinhoyi University of Technology','CUT','Chinhoyi',-17.21120,30.12209),
  ('Harare Institute of Technology','HIT','Harare',-17.50220,31.00270),
  ('Great Zimbabwe University','GZU','Masvingo',-20.06120,30.51379),
  ('Lupane State University','LSU','Lupane',-18.55550,27.46030),
  ('Gwanda State University','GSU','Gwanda',-20.57108,29.00435),
  ('Manicaland State University of Applied Sciences','MSUAS','Mutare',-18.57270,32.38339),
  ('Marondera University of Agricultural Sciences and Technology','MUAST','Marondera',-18.20460,31.43109),
  ('Zimbabwe Open University','ZOU','Harare',-17.49470,31.02500),
  ('Women''s University in Africa','WUA','Harare',-17.47240,31.02305),
  ('Catholic University of Zimbabwe','CUZ','Harare',-17.52080,31.04026),
  ('Arrupe Jesuit University','AJU','Harare',-17.46360,31.03289),
  ('Reformed Church University','RCU','Masvingo',-20.06020,30.49208),
  ('Solusi University','SU','Bulawayo',-20.11550,28.09108),
  ('Zimbabwe Ezekiel Guti University','ZEGU','Bindura',-17.18530,31.21587),
  ('Zimbabwe National Defence University','ZNDU','Mazowe',-17.43560,31.01082),
  ('Pan African Minerals University of Science and Technology','PAMUST','Kwekwe',-18.92810,29.81490)
) AS v(name, short, city, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM universities u WHERE u.name = v.name);

-- Update coordinates for any existing rows to match authoritative data.
UPDATE universities SET lat = v.lat, lng = v.lng, city = v.city
FROM (VALUES
  ('University of Zimbabwe','Harare',-17.78537,31.05311),
  ('National University of Science and Technology','Bulawayo',-20.09520,28.38341),
  ('Midlands State University','Gweru',-19.30500,29.50303),
  ('Africa University','Mutare',-18.53400,32.36047),
  ('Bindura University of Science Education','Bindura',-17.19280,31.19588),
  ('Chinhoyi University of Technology','Chinhoyi',-17.21120,30.12209),
  ('Harare Institute of Technology','Harare',-17.50220,31.00270),
  ('Great Zimbabwe University','Masvingo',-20.06120,30.51379),
  ('Lupane State University','Lupane',-18.55550,27.46030),
  ('Gwanda State University','Gwanda',-20.57108,29.00435),
  ('Manicaland State University of Applied Sciences','Mutare',-18.57270,32.38339),
  ('Marondera University of Agricultural Sciences and Technology','Marondera',-18.20460,31.43109),
  ('Zimbabwe Open University','Harare',-17.49470,31.02500),
  ('Women''s University in Africa','Harare',-17.47240,31.02305),
  ('Catholic University of Zimbabwe','Harare',-17.52080,31.04026),
  ('Arrupe Jesuit University','Harare',-17.46360,31.03289),
  ('Reformed Church University','Masvingo',-20.06020,30.49208),
  ('Solusi University','Bulawayo',-20.11550,28.09108),
  ('Zimbabwe Ezekiel Guti University','Bindura',-17.18530,31.21587),
  ('Zimbabwe National Defence University','Mazowe',-17.43560,31.01082),
  ('Pan African Minerals University of Science and Technology','Kwekwe',-18.92810,29.81490)
) AS v(name, city, lat, lng)
WHERE universities.name = v.name;

-- ---------- Campuses (49) ----------
INSERT INTO campuses (university_id, name, city, province)
SELECT u.id, c.campus, c.city, c.province
FROM (VALUES
  ('University of Zimbabwe','Mount Pleasant Main Campus','Harare','Harare'),
  ('University of Zimbabwe','Parirenyatwa Campus','Harare','Harare'),
  ('University of Zimbabwe','Kariba Research Station','Kariba','Mashonaland West'),
  ('National University of Science and Technology','Main Campus','Bulawayo','Bulawayo'),
  ('National University of Science and Technology','Medical School','Bulawayo','Bulawayo'),
  ('Midlands State University','Senga Campus','Gweru','Midlands'),
  ('Midlands State University','Batanai Campus','Gweru','Midlands'),
  ('Midlands State University','TelOne Campus','Gweru','Midlands'),
  ('Midlands State University','Zvishavane Campus','Zvishavane','Midlands'),
  ('Midlands State University','Harare Campus','Harare','Harare'),
  ('Midlands State University','Mutare Campus','Mutare','Manicaland'),
  ('Africa University','Main Campus','Mutare','Manicaland'),
  ('Bindura University of Science Education','Main Campus','Bindura','Mashonaland Central'),
  ('Chinhoyi University of Technology','Main Campus','Chinhoyi','Mashonaland West'),
  ('Harare Institute of Technology','Main Campus','Harare','Harare'),
  ('Great Zimbabwe University','Mucheke Campus','Masvingo','Masvingo'),
  ('Great Zimbabwe University','Mashava Campus','Mashava','Masvingo'),
  ('Great Zimbabwe University','Herbert Chitepo Law School','Masvingo','Masvingo'),
  ('Great Zimbabwe University','School of Agriculture','Masvingo','Masvingo'),
  ('Lupane State University','Main Campus','Lupane','Matabeleland North'),
  ('Lupane State University','Bulawayo Campus','Bulawayo','Bulawayo'),
  ('Gwanda State University','Main Campus','Gwanda','Matabeleland South'),
  ('Gwanda State University','Epoch Mine Campus','Filabusi','Matabeleland South'),
  ('Manicaland State University of Applied Sciences','Main Campus','Mutare','Manicaland'),
  ('Marondera University of Agricultural Sciences and Technology','Main Campus','Marondera','Mashonaland East'),
  ('Zimbabwe Open University','National Centre','Harare','Harare'),
  ('Zimbabwe Open University','Bulawayo Regional Campus','Bulawayo','Bulawayo'),
  ('Zimbabwe Open University','Gweru Regional Campus','Gweru','Midlands'),
  ('Zimbabwe Open University','Mutare Regional Campus','Mutare','Manicaland'),
  ('Zimbabwe Open University','Masvingo Regional Campus','Masvingo','Masvingo'),
  ('Zimbabwe Open University','Chinhoyi Regional Campus','Chinhoyi','Mashonaland West'),
  ('Zimbabwe Open University','Bindura Regional Campus','Bindura','Mashonaland Central'),
  ('Zimbabwe Open University','Marondera Regional Campus','Marondera','Mashonaland East'),
  ('Zimbabwe Open University','Gwanda Regional Campus','Gwanda','Matabeleland South'),
  ('Zimbabwe Open University','Lupane Regional Campus','Lupane','Matabeleland North'),
  ('Women''s University in Africa','Main Campus','Harare','Harare'),
  ('Women''s University in Africa','Marondera Campus','Marondera','Mashonaland East'),
  ('Women''s University in Africa','Bulawayo Campus','Bulawayo','Bulawayo'),
  ('Catholic University of Zimbabwe','Main Campus','Harare','Harare'),
  ('Catholic University of Zimbabwe','Bulawayo Campus','Bulawayo','Bulawayo'),
  ('Catholic University of Zimbabwe','Gweru Campus','Gweru','Midlands'),
  ('Arrupe Jesuit University','Main Campus','Harare','Harare'),
  ('Reformed Church University','Main Campus','Masvingo','Masvingo'),
  ('Reformed Church University','Marondera Campus','Marondera','Mashonaland East'),
  ('Solusi University','Main Campus','Bulawayo','Bulawayo'),
  ('Zimbabwe Ezekiel Guti University','Main Campus','Bindura','Mashonaland Central'),
  ('Zimbabwe Ezekiel Guti University','Harare Centre','Harare','Harare'),
  ('Zimbabwe National Defence University','Main Campus','Mazowe','Mashonaland Central'),
  ('Pan African Minerals University of Science and Technology','Main Campus','Kwekwe','Midlands')
) AS c(uni, campus, city, province)
JOIN universities u ON u.name = c.uni
WHERE NOT EXISTS (
  SELECT 1 FROM campuses x WHERE x.university_id = u.id AND x.name = c.campus
);
