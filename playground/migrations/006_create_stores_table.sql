-- Migration 006: Create stores table
-- Date: 2025-11-21
-- Description: Store/merchant information

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name text NOT NULL,
  description text,
  wallet_url text,

  -- Contact information
  email varchar(255),
  phone varchar(50),
  website text,

  -- Location
  address_line1 text,
  address_line2 text,
  city varchar(100),
  state varchar(100),
  postal_code varchar(20),
  country varchar(2),

  -- Business info
  category varchar(50),
  logo_url text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Status
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at DESC);

-- Comment on table
COMMENT ON TABLE stores IS 'Merchant/store information for payment transactions';

-- Insert a default store for existing transactions
INSERT INTO stores (id, name, description, category, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Store',
  'Default store for legacy transactions',
  'general',
  'active'
)
ON CONFLICT (id) DO NOTHING;
