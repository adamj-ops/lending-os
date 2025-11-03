/**
 * Phase 1.4: Backfill app_users from Clerk
 * 
 * This script populates the app_users table from Clerk users.
 * CRITICAL: This MUST run BEFORE script 04 (FK migration).
 * 
 * PREREQUISITES:
 * - Migration 001_create_user_id_mapping.sql must be run
 * - Scripts 01 and 02 must be run (import + mapping complete)
 * - CLERK_SECRET_KEY must be set in environment
 * 
 * EXECUTION ORDER: Run this FOURTH (after scripts 01 and 02, BEFORE script 04)
 * 
 * NOTE: Uses proper cursor pagination to avoid duplicates
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";
import { createClerkClient } from "@clerk/backend";

config({ path: ".env.local" });

interface BackfillStats {
  totalProcessed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

async function backfillAppUsers() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  console.log("🔧 Phase 1.4: Backfilling app_users from Clerk...\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const stats: BackfillStats = {
    totalProcessed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Check prerequisites
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

    console.log("Fetching all Clerk users...");
    console.log("Using proper pagination to avoid duplicates\n");

    // Use proper limit/offset pagination (NOT cursor-based for getUserList)
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        // Fetch batch of users
        const response = await clerk.users.getUserList({
          limit,
          offset,
        });

        const users = response.data;
        
        if (users.length === 0) {
          hasMore = false;
          break;
        }

        console.log(`Processing batch: ${offset + 1} to ${offset + users.length}...`);

        for (const clerkUser of users) {
          try {
            const email = clerkUser.emailAddresses[0]?.emailAddress || '';
            const firstName = clerkUser.firstName || '';
            const lastName = clerkUser.lastName || '';
            const name = [firstName, lastName]
              .filter(Boolean)
              .join(' ') || clerkUser.username || 'Unknown';

            // Upsert into app_users
            const result = await connection`
              INSERT INTO app_users (
                id, email, name, first_name, last_name, image_url, is_active
              ) VALUES (
                ${clerkUser.id},
                ${email},
                ${name},
                ${firstName || null},
                ${lastName || null},
                ${clerkUser.imageUrl || null},
                ${!clerkUser.banned && !clerkUser.locked}
              )
              ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                image_url = EXCLUDED.image_url,
                is_active = EXCLUDED.is_active,
                updated_at = NOW()
              RETURNING (xmax = 0) AS inserted
            `;

            if (result[0].inserted) {
              stats.inserted++;
            } else {
              stats.updated++;
            }

            stats.totalProcessed++;

          } catch (error: any) {
            console.error(`❌ Error processing user ${clerkUser.id}:`, error.message);
            stats.errors++;
          }
        }

        console.log(`  Processed ${stats.totalProcessed} users so far...`);

        // Check if there are more pages
        hasMore = users.length === limit;
        offset += limit;

      } catch (error: any) {
        console.error(`❌ Error fetching batch at offset ${offset}:`, error.message);
        throw error;
      }
    }

    // Verify count
    const appUsersCount = await connection`SELECT COUNT(*) FROM app_users`;
    
    console.log("\n" + "=".repeat(60));
    console.log("BACKFILL SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Clerk users processed: ${stats.totalProcessed}`);
    console.log(`Inserted into app_users:     ${stats.inserted}`);
    console.log(`Updated in app_users:        ${stats.updated}`);
    console.log(`Errors:                      ${stats.errors}`);
    console.log(`\nFinal app_users count:       ${appUsersCount[0].count}`);

    if (stats.errors > 0) {
      console.warn("\n⚠️  Some users failed to sync. Check error messages above.");
    }

    console.log("\n✅ Phase 1.4 complete!");
    console.log("⚠️  CRITICAL: Now run script 04-migrate-fk-data.ts BEFORE running any schema migrations\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

backfillAppUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
