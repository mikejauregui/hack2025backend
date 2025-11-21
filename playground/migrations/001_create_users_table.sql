-- Migration 001: Create users table
-- Date: 2025-11-21
-- Description: Create core users table with authentication and profile fields

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email varchar(255) UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  password_hash text NOT NULL,

  -- Profile
  name text NOT NULL,
  phone varchar(50),
  phone_verified boolean DEFAULT false,
  date_of_birth date NOT NULL,
  avatar_url text,

  -- Preferences
  language varchar(10) DEFAULT 'en',
  timezone varchar(50) DEFAULT 'UTC',

  -- Status
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  -- Neon Auth integration (optional for future)
  neon_auth_user_id text UNIQUE,
  neon_auth_provider varchar(50),

  -- Email verification
  email_verification_token text,
  email_verification_expires_at timestamp with time zone,
  email_verified_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_neon_auth_user_id ON users(neon_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Comment on table
COMMENT ON TABLE users IS 'Core user accounts with authentication and profile information';
