-- Campus corrections from source checks (see the verification notes in the PR).
-- Renames and fixes are idempotent. Duplicates are merged only after every
-- accommodation on the duplicate is moved to the campus being kept.
-- Campuses with no source yet (Batanai, the Catholic University learning centres,
-- and the other ZOU regional centres) are left untouched.

DO $$
DECLARE
  rec RECORD;
  keep_id UUID;
  dup_id UUID;
BEGIN
  -- 1. Merge duplicates: (university short, duplicate name, campus to keep).
  FOR rec IN
    SELECT * FROM (VALUES
      ('UZ',    'Main Campus',                 'Mount Pleasant Main Campus'),
      ('NUST',  'Medical School Campus',       'Medical School'),
      ('MSU',   'Senga Campus',                'Main Campus'),
      ('GZU',   'School of Agriculture Campus','School of Agriculture'),
      ('SU',    'Main Campus',                 'Solusi Main Campus'),
      ('RCU',   'Marondera Campus',            'Main Campus')
    ) AS t(short, dup_name, keep_name)
  LOOP
    SELECT c.id INTO keep_id FROM campuses c JOIN universities u ON u.id = c.university_id
     WHERE u.short = rec.short AND c.name = rec.keep_name LIMIT 1;
    SELECT c.id INTO dup_id FROM campuses c JOIN universities u ON u.id = c.university_id
     WHERE u.short = rec.short AND c.name = rec.dup_name LIMIT 1;
    IF keep_id IS NOT NULL AND dup_id IS NOT NULL AND keep_id <> dup_id THEN
      UPDATE accommodations SET campus_id = keep_id WHERE campus_id = dup_id;
      DELETE FROM campuses WHERE id = dup_id;
    END IF;
  END LOOP;

  -- 2. Rename and correct the remaining entries.
  UPDATE campuses c SET name = 'Mount Pleasant Main Campus', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'UZ' AND c.name = 'Mount Pleasant Main Campus';
  UPDATE campuses c SET name = 'Main Campus (Ascot)', city = 'Bulawayo'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'NUST' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Medical School (Mpilo Hospital)', city = 'Bulawayo'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'NUST' AND c.name = 'Medical School';
  UPDATE campuses c SET name = 'Main Campus (Senga Road)', city = 'Gweru'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'MSU' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Gary Magadzire School of Agriculture', city = 'Masvingo'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'GZU' AND c.name = 'School of Agriculture';
  UPDATE campuses c SET name = 'Solusi Main Campus', city = 'Bulawayo'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'SU' AND c.name = 'Solusi Main Campus';
  UPDATE campuses c SET name = 'Masvingo Main Campus (Reibeek Farm)', city = 'Masvingo'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'RCU' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Harare Campus (Mount Pleasant)', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'WUA' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Main Campus (Marondera)', city = 'Marondera'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'WUA' AND c.name = 'Marondera Campus';
  UPDATE campuses c SET name = 'Harare Teaching and Learning Centre (Belvedere)', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'ZEGU' AND c.name = 'Harare Centre';
  UPDATE campuses c SET name = 'Bindura Campus (Main)', city = 'Bindura'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'ZEGU' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Main Campus (Thornpark)', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'ZNDU' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Main Campus (Mount Pleasant)', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'AJU' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Main Campus (Belvedere)', city = 'Harare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'HIT' AND c.name = 'Main Campus';
  UPDATE campuses c SET city = 'Mutare'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'AU' AND c.name = 'Main Campus';
  UPDATE campuses c SET city = 'Chinhoyi'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'CUT' AND c.name = 'Main Campus';
  UPDATE campuses c SET name = 'Dozmery Campus', city = 'Marondera'
    FROM universities u WHERE u.id = c.university_id AND u.short = 'MUAST' AND c.name = 'Main Campus';

  -- 3. Add verified campuses that were missing.
  INSERT INTO campuses (university_id, name, city, province)
  SELECT u.id, v.name, v.city, v.province
    FROM (VALUES
      ('RCU',  'Highfield Campus',                   'Harare',    'Harare Metropolitan'),
      ('WUA',  'Avondale Campus',                    'Harare',    'Harare Metropolitan'),
      ('WUA',  'Kadoma Campus',                      'Kadoma',    'Mashonaland West'),
      ('WUA',  'Mutare Campus',                      'Mutare',    'Manicaland'),
      ('AU',   'Harare Campus',                      'Harare',    'Harare Metropolitan'),
      ('GZU',  'Main Campus (Masvingo Teachers'' College site)', 'Masvingo', 'Masvingo'),
      ('MUAST','CSC Campus',                         'Marondera', 'Mashonaland East'),
      ('ZEGU', 'Harare Teaching and Learning Centre (Belvedere)', 'Harare', 'Harare Metropolitan')
    ) AS v(short, name, city, province)
    JOIN universities u ON u.short = v.short
   WHERE NOT EXISTS (
     SELECT 1 FROM campuses c WHERE c.university_id = u.id AND c.name = v.name
   );
END $$;
