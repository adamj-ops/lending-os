# Clerk Auth Migration Guide

This directory contains scripts for migrating from BetterAuth to Clerk authentication.

## ⚠️ CRITICAL: Execution Order

**These scripts MUST be run in the exact order specified below:**

### Phase 1: Pre-Migration (ID Mapping & Data Migration)

1. **Run SQL Migration 001**
   ```bash
   # Apply to database (using your preferred method)
   psql $DATABASE_URL < src/db/migrations/001_create_user_id_mapping.sql
   ```
   Creates `user_id_mapping` and `app_users` tables.

2. **Import Legacy Users to Clerk**
   ```bash
   npx tsx scripts/migration/01-import-legacy-users-to-clerk.ts
   ```
   Creates Clerk accounts for users that exist only in legacy table.

3. **Map Clerk Users to Legacy IDs**
   ```bash
   npx tsx scripts/migration/02-map-legacy-to-clerk-ids.ts
   ```
   Creates ID mappings for users that exist in both systems.

4. **Backfill app_users from Clerk**
   ```bash
   npx tsx scripts/migration/03-backfill-app-users.ts
   ```
   Populates `app_users` table from ALL Clerk users.
   **CRITICAL**: Run BEFORE step 5.

5. **Migrate FK Data**
   ```bash
   npx tsx scripts/migration/04-migrate-fk-data.ts
   ```
   Updates all foreign key references from legacy IDs to Clerk IDs.
   **CRITICAL**: Run AFTER step 4, BEFORE migration 002.

### Phase 2: Schema Migration

6. **Run SQL Migration 002**
   ```bash
   psql $DATABASE_URL < src/db/migrations/002_update_fk_constraints.sql
   ```
   Renames `user` table to `user_legacy` and updates FK constraints to point to `app_users`.
   **CRITICAL**: Run AFTER step 5.

### Phase 3: Deploy Code

7. **Deploy Application Code**
   - Deploy updated codebase with webhook handler
   - Configure Clerk webhook endpoint in Clerk dashboard
   - Set `CLERK_WEBHOOK_SECRET` environment variable

## Validation

After completing all steps:

```bash
# Verify migration completeness
npx tsx scripts/validate-migration.ts
```

## Rollback Strategy

If issues occur:

1. **Before Migration 002**: Restore database from backup
2. **After Migration 002**: FK constraints must be reverted manually, then restore data

## Prerequisites

- Database backup completed
- `CLERK_SECRET_KEY` environment variable set
- `DATABASE_URL` environment variable set
- All npm dependencies installed

## Common Issues

### Issue: "Missing mappings" error in step 5
**Solution**: Run steps 2 and 3 again to ensure all users are mapped.

### Issue: "app_users table is empty" in step 5
**Solution**: Run step 4 (backfill) before step 5.

### Issue: FK violation errors after migration 002
**Solution**: Check that step 5 completed without errors. Review orphaned records log.

## Support

For issues, check:
1. Migration script output logs
2. Database error logs
3. Clerk dashboard user list
4. `user_id_mapping` table contents

