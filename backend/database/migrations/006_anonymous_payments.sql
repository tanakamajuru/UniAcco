-- Anonymous unlock: a payment no longer has to belong to a registered user.
-- The Pesepay gateway_reference is the capability that reveals the contact,
-- so we allow user_id to be NULL. Safe to run repeatedly.
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
