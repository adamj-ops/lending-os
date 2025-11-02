-- Migration 002: Update FK Constraints to point to app_users
-- This is Phase 2.2 of the Clerk Auth Integration Fix
-- 
-- PREREQUISITES:
-- - Migration 001 must be run (creates user_id_mapping and app_users)
-- - Script 04-migrate-fk-data.ts must be run (updates FK data to Clerk IDs)
-- 
-- CRITICAL: Run this AFTER Phase 1 scripts complete (01, 02, 03, 04)

-- Step 1: Rename legacy user table
ALTER TABLE IF EXISTS "user" RENAME TO user_legacy;

-- Step 2: Drop old FK constraints
-- user_portal_access
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_portal_access_user_id_user_id_fk'
  ) THEN
    ALTER TABLE user_portal_access DROP CONSTRAINT user_portal_access_user_id_user_id_fk;
  END IF;
END $$;

-- user_organizations
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_organizations_user_id_user_id_fk'
  ) THEN
    ALTER TABLE user_organizations DROP CONSTRAINT user_organizations_user_id_user_id_fk;
  END IF;
END $$;

-- payments (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'created_by'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE 'payments%created_by%'
    ) THEN
      EXECUTE 'ALTER TABLE payments DROP CONSTRAINT IF EXISTS ' || 
        (SELECT constraint_name FROM information_schema.table_constraints 
         WHERE table_name = 'payments' AND constraint_name LIKE '%created_by%' LIMIT 1);
    END IF;
  END IF;
END $$;

-- draws (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'draws' AND column_name = 'created_by'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE 'draws%created_by%'
    ) THEN
      EXECUTE 'ALTER TABLE draws DROP CONSTRAINT IF EXISTS ' || 
        (SELECT constraint_name FROM information_schema.table_constraints 
         WHERE table_name = 'draws' AND constraint_name LIKE '%created_by%' LIMIT 1);
    END IF;
  END IF;
END $$;

-- Step 3: Add new FK constraints to app_users with CASCADE
ALTER TABLE user_portal_access 
  ADD CONSTRAINT user_portal_access_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE user_organizations 
  ADD CONSTRAINT user_organizations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Add FK for payments if created_by column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE payments 
      ADD CONSTRAINT payments_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add FK for draws if created_by column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'draws' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE draws 
      ADD CONSTRAINT draws_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 4: Validation checks
DO $$ 
DECLARE 
  invalid_count INTEGER;
  table_name TEXT;
BEGIN
  -- Check user_portal_access
  SELECT COUNT(*) INTO invalid_count 
  FROM user_portal_access 
  WHERE user_id NOT IN (SELECT id FROM app_users);
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid user_portal_access FK references. Run script 04 again.', invalid_count;
  END IF;
  
  -- Check user_organizations
  SELECT COUNT(*) INTO invalid_count 
  FROM user_organizations 
  WHERE user_id NOT IN (SELECT id FROM app_users);
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid user_organizations FK references. Run script 04 again.', invalid_count;
  END IF;
  
  RAISE NOTICE 'Validation successful - all FK references are valid';
END $$;

-- Step 5: Add comments
COMMENT ON TABLE user_legacy IS 'Deprecated BetterAuth user table - kept for historical reference only';
COMMENT ON TABLE app_users IS 'Active user table synced from Clerk authentication';

-- Migration complete
SELECT 'Migration 002 complete - FK constraints updated to app_users' AS status;

