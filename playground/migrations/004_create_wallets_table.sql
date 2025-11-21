-- Migration 004: Create wallets table
-- Date: 2025-11-21
-- Description: Multi-wallet support with balance tracking

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Wallet info
  name varchar(100) NOT NULL,
  wallet_url text NOT NULL UNIQUE,
  currency_code varchar(10) NOT NULL,

  -- Balance
  initial_amount numeric(15, 2) DEFAULT 0,
  current_balance numeric(15, 2) DEFAULT 0,

  -- Primary wallet
  is_primary boolean DEFAULT false,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,

  -- Status
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),

  -- Interledger metadata
  asset_code varchar(10),
  asset_scale int,
  auth_server text,
  resource_server text,

  -- Grant token (moved from clients table)
  current_grant_token text,
  grant_expires_at timestamp with time zone
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency_code ON wallets(currency_code);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);
CREATE INDEX IF NOT EXISTS idx_wallets_created_at ON wallets(created_at DESC);

-- Ensure only one primary wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_wallet_per_user
  ON wallets(user_id)
  WHERE is_primary = true;

-- Comment on table
COMMENT ON TABLE wallets IS 'User payment wallets with Interledger integration (max 5 per user)';
