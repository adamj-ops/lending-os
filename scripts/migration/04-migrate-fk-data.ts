/**
 * Phase 1.5: Migrate FK Data to Clerk IDs
 * 
 * This script updates all foreign key references from legacy BetterAuth IDs to Clerk IDs.
 * CRITICAL: This MUST run AFTER backfill (script 03) and BEFORE FK constraint changes.
 * 
 * PREREQUISITES:
 * - Migration 001_create_user_id_mapping.sql must be run
 * - Scripts 01, 02, and 03 must be complete (import, map, backfill)
 * - user_id_mapping table must be complete
 * - app_users table must be populated
 * 
 * EXECUTION ORDER: Run this FIFTH (after script 03, BEFORE migration 002)
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

interface MigrationStats {
  userPortalAccessUpdated: number;
  userOrganizationsUpdated: number;
  otherTablesUpdated: Record<string, number>;
  orphanedRecords: Record<string, number>;
}

async function migrateFkData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Phase 1.5: Migrating FK data to Clerk IDs...\n");
  console.log("⚠️  THIS IS A CRITICAL MIGRATION - Updating all user FK references\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  const stats: MigrationStats = {
    userPortalAccessUpdated: 0,
    userOrganizationsUpdated: 0,
    otherTablesUpdated: {},
    orphanedRecords: {},
  };

  try {
    // STEP 1: Verify prerequisites
    console.log("Step 1: Verifying prerequisites...");
    
    const mappingTableExists = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_id_mapping'
      );
    `;

    if (!mappingTableExists[0].exists) {
      throw new Error("user_id_mapping table does not exist. Run migration 001 first.");
    }

    const appUsersExists = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'app_users'
      );
    `;

    if (!appUsersExists[0].exists) {
      throw new Error("app_users table does not exist. Run migration 001 first.");
    }

    // STEP 2: Verify mapping table completeness
    console.log("Step 2: Verifying mapping table completeness...");
    
    // Note: Table is still called 'user' until migration 002
    const legacyUserCount = await connection`SELECT COUNT(*) FROM "user"`;
    const mappingCount = await connection`SELECT COUNT(*) FROM user_id_mapping`;
    const appUsersCount = await connection`SELECT COUNT(*) FROM app_users`;

    console.log(`  Legacy users:     ${legacyUserCount[0].count}`);
    console.log(`  Mappings:         ${mappingCount[0].count}`);
    console.log(`  App users:        ${appUsersCount[0].count}`);

    if (parseInt(mappingCount[0].count) !== parseInt(legacyUserCount[0].count)) {
      console.warn(`\n⚠️  WARNING: Partial mapping detected!`);
      console.warn(`  Legacy users: ${legacyUserCount[0].count}`);
      console.warn(`  Mappings:     ${mappingCount[0].count}`);
      console.warn(`  This means ${parseInt(legacyUserCount[0].count) - parseInt(mappingCount[0].count)} users don't exist in Clerk yet.`);
      console.warn(`  These users will need to register fresh or be manually created in Clerk.`);
      console.warn(`  Proceeding with migration for mapped users only...\n`);
    }

    if (parseInt(appUsersCount[0].count) === 0) {
      throw new Error("app_users table is empty. Run script 03-backfill-app-users.ts first.");
    }

    console.log("  ✅ Prerequisites verified\n");

    // STEP 3: Migrate user_portal_access
    console.log("Step 3: Migrating user_portal_access...");
    
    const portalAccessResult = await connection`
      UPDATE user_portal_access
      SET user_id = (
        SELECT clerk_id 
        FROM user_id_mapping 
        WHERE legacy_id = user_portal_access.user_id
      )
      WHERE user_id IN (SELECT legacy_id FROM user_id_mapping)
      AND user_id NOT IN (SELECT id FROM app_users)
    `;

    stats.userPortalAccessUpdated = portalAccessResult.count || 0;
    console.log(`  ✅ Updated ${stats.userPortalAccessUpdated} records\n`);

    // Check for orphaned records
    const orphanedPortalAccess = await connection`
      SELECT COUNT(*) FROM user_portal_access 
      WHERE user_id NOT IN (SELECT clerk_id FROM user_id_mapping)
      AND user_id NOT IN (SELECT id FROM app_users)
    `;

    if (parseInt(orphanedPortalAccess[0].count) > 0) {
      stats.orphanedRecords.user_portal_access = parseInt(orphanedPortalAccess[0].count);
      console.warn(`  ⚠️  Found ${orphanedPortalAccess[0].count} orphaned portal access records`);
      
      // Log details for manual review
      const orphanedDetails = await connection`
        SELECT id, user_id, organization_id, portal_type 
        FROM user_portal_access 
        WHERE user_id NOT IN (SELECT clerk_id FROM user_id_mapping)
        AND user_id NOT IN (SELECT id FROM app_users)
        LIMIT 10
      `;
      
      console.warn("  Sample orphaned records (first 10):");
      orphanedDetails.forEach(record => {
        console.warn(`    - ID: ${record.id}, user_id: ${record.user_id}, org: ${record.organization_id}`);
      });
      console.warn("  ⚠️  DO NOT DELETE - Flag for manual review\n");
    }

    // STEP 4: Migrate user_organizations
    console.log("Step 4: Migrating user_organizations...");
    
    const userOrgsResult = await connection`
      UPDATE user_organizations
      SET user_id = (
        SELECT clerk_id 
        FROM user_id_mapping 
        WHERE legacy_id = user_organizations.user_id
      )
      WHERE user_id IN (SELECT legacy_id FROM user_id_mapping)
      AND user_id NOT IN (SELECT id FROM app_users)
    `;

    stats.userOrganizationsUpdated = userOrgsResult.count || 0;
    console.log(`  ✅ Updated ${stats.userOrganizationsUpdated} records\n`);

    // Check for orphaned records
    const orphanedUserOrgs = await connection`
      SELECT COUNT(*) FROM user_organizations 
      WHERE user_id NOT IN (SELECT clerk_id FROM user_id_mapping)
      AND user_id NOT IN (SELECT id FROM app_users)
    `;

    if (parseInt(orphanedUserOrgs[0].count) > 0) {
      stats.orphanedRecords.user_organizations = parseInt(orphanedUserOrgs[0].count);
      console.warn(`  ⚠️  Found ${orphanedUserOrgs[0].count} orphaned user_organizations records\n`);
    }

    // STEP 5: Find and migrate other tables with user FKs
    console.log("Step 5: Checking for other tables with user FKs...");
    
    // Check if payments table exists and has created_by
    const paymentsHasCreatedBy = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
        AND column_name = 'created_by'
      );
    `;

    if (paymentsHasCreatedBy[0].exists) {
      console.log("  Migrating payments.created_by...");
      const paymentsResult = await connection`
        UPDATE payments
        SET created_by = (
          SELECT clerk_id 
          FROM user_id_mapping 
          WHERE legacy_id = payments.created_by
        )
        WHERE created_by IN (SELECT legacy_id FROM user_id_mapping)
        AND created_by IS NOT NULL
      `;
      stats.otherTablesUpdated.payments = paymentsResult.count || 0;
      console.log(`    ✅ Updated ${stats.otherTablesUpdated.payments} records`);
    }

    // Check if draws table exists and has created_by
    const drawsHasCreatedBy = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'draws'
        AND column_name = 'created_by'
      );
    `;

    if (drawsHasCreatedBy[0].exists) {
      console.log("  Migrating draws.created_by...");
      const drawsResult = await connection`
        UPDATE draws
        SET created_by = (
          SELECT clerk_id 
          FROM user_id_mapping 
          WHERE legacy_id = draws.created_by
        )
        WHERE created_by IN (SELECT legacy_id FROM user_id_mapping)
        AND created_by IS NOT NULL
      `;
      stats.otherTablesUpdated.draws = drawsResult.count || 0;
      console.log(`    ✅ Updated ${stats.otherTablesUpdated.draws} records`);
    }

    console.log();

    // STEP 6: Final verification
    console.log("Step 6: Final verification...");
    
    const invalidPortalAccess = await connection`
      SELECT COUNT(*) FROM user_portal_access 
      WHERE user_id NOT IN (SELECT id FROM app_users)
    `;

    const invalidUserOrgs = await connection`
      SELECT COUNT(*) FROM user_organizations 
      WHERE user_id NOT IN (SELECT id FROM app_users)
    `;

    console.log(`  Invalid user_portal_access FKs: ${invalidPortalAccess[0].count}`);
    console.log(`  Invalid user_organizations FKs: ${invalidUserOrgs[0].count}`);

    if (parseInt(invalidPortalAccess[0].count) > 0 || parseInt(invalidUserOrgs[0].count) > 0) {
      console.warn("\n  ⚠️  WARNING: Some FK references don't match app_users");
      console.warn("  These may be from users not yet in Clerk or orphaned records");
      console.warn("  Review orphaned records above before proceeding\n");
    } else {
      console.log("  ✅ All FK references valid\n");
    }

    // Print summary
    console.log("=".repeat(60));
    console.log("MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`user_portal_access updated:   ${stats.userPortalAccessUpdated}`);
    console.log(`user_organizations updated:   ${stats.userOrganizationsUpdated}`);
    
    if (Object.keys(stats.otherTablesUpdated).length > 0) {
      console.log("\nOther tables updated:");
      Object.entries(stats.otherTablesUpdated).forEach(([table, count]) => {
        console.log(`  ${table}: ${count}`);
      });
    }

    if (Object.keys(stats.orphanedRecords).length > 0) {
      console.log("\n⚠️  Orphaned records found:");
      Object.entries(stats.orphanedRecords).forEach(([table, count]) => {
        console.log(`  ${table}: ${count}`);
      });
      console.log("\nThese records have been flagged for manual review.");
    }

    console.log("\n✅ Phase 1.5 complete!");
    console.log("⚠️  CRITICAL: Now you can run migration 002_update_fk_constraints.sql\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateFkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

