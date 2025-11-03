/**
 * Phase 1.5b: Clean Up Orphaned Records
 * 
 * This script deletes FK records that reference users not in app_users.
 * Run this AFTER script 04 and BEFORE migration 002 if there are orphaned records.
 * 
 * EXECUTION ORDER: Run between script 04 and migration 002
 */

import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

async function cleanupOrphanedRecords() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Phase 1.5b: Cleaning up orphaned records...\n");
  console.log("⚠️  This will DELETE records that reference non-existent users\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    // Find and delete orphaned user_portal_access records
    const orphanedPortalAccess = await connection`
      SELECT * FROM user_portal_access 
      WHERE user_id NOT IN (SELECT id FROM app_users)
    `;

    console.log(`Found ${orphanedPortalAccess.length} orphaned user_portal_access records`);
    
    if (orphanedPortalAccess.length > 0) {
      console.log("Sample orphaned records:");
      orphanedPortalAccess.slice(0, 5).forEach(record => {
        console.log(`  - user_id: ${record.user_id}, org: ${record.organization_id}`);
      });

      const deletePortalResult = await connection`
        DELETE FROM user_portal_access 
        WHERE user_id NOT IN (SELECT id FROM app_users)
      `;

      console.log(`✅ Deleted ${deletePortalResult.count} orphaned user_portal_access records\n`);
    }

    // Find and delete orphaned user_organizations records
    const orphanedUserOrgs = await connection`
      SELECT * FROM user_organizations 
      WHERE user_id NOT IN (SELECT id FROM app_users)
    `;

    console.log(`Found ${orphanedUserOrgs.length} orphaned user_organizations records`);
    
    if (orphanedUserOrgs.length > 0) {
      console.log("Sample orphaned records:");
      orphanedUserOrgs.slice(0, 5).forEach(record => {
        console.log(`  - user_id: ${record.user_id}, org: ${record.organization_id}`);
      });

      const deleteUserOrgsResult = await connection`
        DELETE FROM user_organizations 
        WHERE user_id NOT IN (SELECT id FROM app_users)
      `;

      console.log(`✅ Deleted ${deleteUserOrgsResult.count} orphaned user_organizations records\n`);
    }

    // Check for other orphaned FK records
    const paymentsExists = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'created_by'
      );
    `;

    if (paymentsExists[0].exists) {
      const orphanedPayments = await connection`
        SELECT COUNT(*) FROM payments 
        WHERE created_by IS NOT NULL 
        AND created_by NOT IN (SELECT id FROM app_users)
      `;

      if (parseInt(orphanedPayments[0].count) > 0) {
        console.log(`Found ${orphanedPayments[0].count} orphaned payments.created_by records`);
        
        const deletePaymentsResult = await connection`
          DELETE FROM payments 
          WHERE created_by IS NOT NULL 
          AND created_by NOT IN (SELECT id FROM app_users)
        `;

        console.log(`✅ Deleted ${deletePaymentsResult.count} orphaned payments records\n`);
      }
    }

    console.log("============================================================");
    console.log("CLEANUP COMPLETE");
    console.log("============================================================");
    console.log("✅ All orphaned records have been cleaned up");
    console.log("⚠️  Users who had these records will need to:");
    console.log("   1. Register fresh through Clerk");
    console.log("   2. Or be manually created in Clerk + app_users");
    console.log("\n✅ You can now safely run migration 002_update_fk_constraints.sql\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

cleanupOrphanedRecords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

