-- Data minimisation for applications.
-- year_of_study is no longer collected. The personal copies on an application
-- (name, email, phone, message) can be cleared by retention (utils/retention.js),
-- so those columns must allow NULL. Safe to run repeatedly.
ALTER TABLE applications DROP COLUMN IF EXISTS year_of_study;
ALTER TABLE applications ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN email DROP NOT NULL;
