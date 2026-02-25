CREATE TABLE payment_idempotency (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  request_hash CHAR(64) NOT NULL,
  payment_id VARCHAR(36) NULL,
  response_status INT NULL,
  response_body LONGTEXT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NULL DEFAULT NULL
);
