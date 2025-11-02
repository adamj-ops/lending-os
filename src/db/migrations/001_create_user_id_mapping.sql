-- Migration 001: Create user_id_mapping and app_users tables
-- This is Phase 1.1 of the Clerk Auth Integration Fix
-- Run FIRST before any other migration scripts

-- Create mapping table to track BetterAuth → Clerk ID conversions
CREATE TABLE IF NOT EXISTS user_id_mapping (
  legacy_id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  migrated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_mapping_email ON user_id_mapping(email);
CREATE INDEX idx_user_mapping_clerk ON user_id_mapping(clerk_id);

-- Create app_users table (needed for Step 1.4 backfill)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  
  -- Soft delete support (preserve audit trail)
  deleted_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_active ON app_users(is_active) WHERE is_active = TRUE;

-- Add comment for documentation
COMMENT ON TABLE user_id_mapping IS 'Temporary mapping table for BetterAuth to Clerk ID migration';
COMMENT ON TABLE app_users IS 'Application users synced from Clerk (replaces deprecated user table)';

