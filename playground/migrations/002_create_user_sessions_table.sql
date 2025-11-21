-- Migration 002: Create user_sessions table
-- Date: 2025-11-21
-- Description: Session management for user authentication

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session data
  session_token text UNIQUE NOT NULL,
  refresh_token text,

  -- Device/client info
  device_type varchar(50),
  device_name varchar(100),
  user_agent text,
  ip_address inet,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,

  -- Status
  is_active boolean DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON user_sessions(created_at DESC);

-- Comment on table
COMMENT ON TABLE user_sessions IS 'User authentication sessions with 5-minute expiration';
