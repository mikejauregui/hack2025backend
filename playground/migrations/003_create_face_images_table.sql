-- Migration 003: Create face_images table
-- Date: 2025-11-21
-- Description: Track face images for biometric authentication

CREATE TABLE IF NOT EXISTS face_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- S3 storage
  s3_key text NOT NULL,
  s3_bucket varchar(100) DEFAULT 'hacky-ando',

  -- AWS Rekognition
  rekognition_face_id text,
  rekognition_image_id text,

  -- Image metadata
  is_primary boolean DEFAULT false,
  uploaded_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  match_count int DEFAULT 0,

  -- Status
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_face_images_user_id ON face_images(user_id);
CREATE INDEX IF NOT EXISTS idx_face_images_rekognition_image_id ON face_images(rekognition_image_id);
CREATE INDEX IF NOT EXISTS idx_face_images_status ON face_images(status);
CREATE INDEX IF NOT EXISTS idx_face_images_uploaded_at ON face_images(uploaded_at DESC);

-- Ensure only one primary face per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_user
  ON face_images(user_id)
  WHERE is_primary = true;

-- Comment on table
COMMENT ON TABLE face_images IS 'Face images for biometric authentication (max 5 per user)';
