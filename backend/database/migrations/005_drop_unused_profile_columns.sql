-- Data minimization: drop unused student-profile columns from users.
-- Keeps `phone` (landlord contact, used for the Call/WhatsApp handoff) and
-- `university_id`. Safe to run repeatedly.
ALTER TABLE users
  DROP COLUMN IF EXISTS year_of_study,
  DROP COLUMN IF EXISTS course,
  DROP COLUMN IF EXISTS budget,
  DROP COLUMN IF EXISTS move_in;
