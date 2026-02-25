CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  card_last4 VARCHAR(4) NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL
  -- TODO: add encrypted card number/expiry columns in encryption phase.
);

