ALTER TABLE payments
  ADD COLUMN card_number_ciphertext LONGBLOB NULL,
  ADD COLUMN card_number_iv BINARY(12) NULL;

-- Transitional cleanup for rows created before encryption-at-rest existed.
DELETE FROM payments;

ALTER TABLE payments
  MODIFY COLUMN card_number_ciphertext LONGBLOB NOT NULL,
  MODIFY COLUMN card_number_iv BINARY(12) NOT NULL;
