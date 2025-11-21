-- Migration 005: Enhance transactions table
-- Date: 2025-11-21
-- Description: Add relationships and metadata to transactions

-- Add new columns to existing transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES wallets(id) ON DELETE RESTRICT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;

-- Payment metadata
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_type varchar(20) DEFAULT 'outgoing' CHECK (payment_type IN ('outgoing', 'incoming', 'transfer'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS interledger_payment_id text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS grant_id uuid REFERENCES grants_manager(id) ON DELETE SET NULL;

-- Biometric data
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS snapshot_s3_key text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS face_image_id uuid REFERENCES face_images(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS face_match_confidence numeric(5, 2);

-- Voice/transcript data
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS voice_s3_key text;
-- transcript column already exists

-- Additional metadata
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Backfill snapshot_s3_key from existing snapshot UUID
UPDATE transactions
SET snapshot_s3_key = 'snapshot-' || snapshot || '.png'
WHERE snapshot IS NOT NULL AND snapshot_s3_key IS NULL;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING gin(metadata);

-- Comment on enhanced columns
COMMENT ON COLUMN transactions.user_id IS 'Links transaction to user account';
COMMENT ON COLUMN transactions.wallet_id IS 'Links transaction to specific wallet';
COMMENT ON COLUMN transactions.face_match_confidence IS 'AWS Rekognition match confidence (0-100)';
