-- Migration 007: Enhance grants_manager table
-- Date: 2025-11-21
-- Description: Add relationships and grant lifecycle tracking

-- Add new columns to existing grants_manager table
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE;

-- Grant status
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'used'));

-- Grant metadata
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS grant_type varchar(30) DEFAULT 'outgoing_payment';
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS amount_authorized numeric(15, 2);
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS currency varchar(10);

-- Timestamps (rename existing timestamp column to created_at if needed)
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;

-- Interledger metadata
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS interact_redirect_url text;
ALTER TABLE grants_manager ADD COLUMN IF NOT EXISTS interact_nonce text;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_grants_user_id ON grants_manager(user_id);
CREATE INDEX IF NOT EXISTS idx_grants_wallet_id ON grants_manager(wallet_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants_manager(status);
CREATE INDEX IF NOT EXISTS idx_grants_created_at ON grants_manager(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grants_expires_at ON grants_manager(expires_at);

-- Comment on enhanced columns
COMMENT ON COLUMN grants_manager.status IS 'Grant lifecycle status (pending, accepted, rejected, expired, used)';
COMMENT ON COLUMN grants_manager.expires_at IS 'When the grant expires (for automatic cleanup)';
