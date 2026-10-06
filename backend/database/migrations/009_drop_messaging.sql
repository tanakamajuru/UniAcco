-- Messaging was retired for privacy: contact is shared on unlock instead.
-- Drops the unused conversation tables. Safe to run repeatedly.
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_threads CASCADE;
