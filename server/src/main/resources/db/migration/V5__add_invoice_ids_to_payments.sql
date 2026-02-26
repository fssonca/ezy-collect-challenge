ALTER TABLE payments
  ADD COLUMN invoice_ids_json LONGTEXT NULL;

UPDATE payments
SET invoice_ids_json = '[]'
WHERE invoice_ids_json IS NULL;

ALTER TABLE payments
  MODIFY COLUMN invoice_ids_json LONGTEXT NOT NULL;
