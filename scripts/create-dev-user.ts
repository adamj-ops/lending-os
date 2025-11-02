/**
 * Create Dev User with Clerk SDK
 * 
 * Creates a development user using Clerk authentication.
 * This script replaces the old BetterAuth-based version.
 * 
 * Usage: npx tsx scripts/create-dev-user.ts [email] [password]
 * 
 * Examples:
 *   npx tsx scripts/create-dev-user.ts dev@lendingos.com dev123
 *   npx tsx scripts/create-dev-user.ts
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { createClerkClient } from "@clerk/backend";
import { appUsers, organizations, userPortalAccess } from "../src/db/schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function createDevUser() {
  // Get email and password from command line or use defaults
  const email = process.argv[2] || "dev@lendingos.com";
  const password = process.argv[3] || "DevPassword123!";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  console.log("🔧 Creating dev user with Clerk...");
  console.log(`📧 Email: ${email}\n`);

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  try {
    // Step 1: Check if user exists in Clerk
    console.log("Step 1: Checking if user exists in Clerk...");
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [email],
    });

    let clerkUser;
    
    if (existingUsers.data.length > 0) {
      console.log("✓ User already exists in Clerk");
      clerkUser = existingUsers.data[0];
    } else {
      // Create user in Clerk
      console.log("Creating user in Clerk...");
      
      const nameParts = "Dev User".split(" ");
      
      // Try creating with phone number first (Clerk instance may require it)
      try {
        clerkUser = await clerk.users.createUser({
          emailAddress: [email],
          password,
          firstName: nameParts[0] || "Dev",
          lastName: nameParts.slice(1).join(" ") || "User",
          username: email.split("@")[0].padEnd(4, "0"),
          phoneNumber: ["+17633521593"], // Valid E.164 format
          skipPasswordChecks: true,
          skipPasswordRequirement: false,
        });
      } catch (e: any) {
        // If phone not required, try without it
        if (e.code === 'form_data_missing') {
          clerkUser = await clerk.users.createUser({
            emailAddress: [email],
            password,
            firstName: nameParts[0] || "Dev",
            lastName: nameParts.slice(1).join(" ") || "User",
            username: email.split("@")[0].padEnd(4, "0"),
            skipPasswordChecks: true,
            skipPasswordRequirement: false,
          });
        } else {
          throw e;
        }
      }
      
      console.log(`✅ Created user in Clerk (ID: ${clerkUser.id})`);
    }

    // Step 2: Ensure user exists in app_users
    console.log("\nStep 2: Syncing to app_users...");
    await db.insert(appUsers).values({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: "Dev User",
      firstName: "Dev",
      lastName: "User",
      imageUrl: clerkUser.imageUrl,
    }).onConflictDoNothing();
    
    console.log("✅ User synced to app_users");

    // Step 3: Find or create Dev Organization
    console.log("\nStep 3: Setting up organization...");
    
    let org = await db.query.organizations.findFirst({
      where: eq(organizations.name, "Dev Organization"),
    });

    if (!org) {
      console.log("Creating Dev Organization...");
      const [newOrg] = await db.insert(organizations).values({
        name: "Dev Organization",
        logoUrl: null,
      }).returning();
      org = newOrg;
      console.log(`✅ Created organization (ID: ${org.id})`);
    } else {
      console.log(`✓ Organization already exists (ID: ${org.id})`);
    }

    // Step 4: Assign portal access
    console.log("\nStep 4: Assigning portal access...");
    
    const existingAccess = await db.query.userPortalAccess.findFirst({
      where: eq(userPortalAccess.userId, clerkUser.id),
    });

    if (!existingAccess) {
      await db.insert(userPortalAccess).values({
        userId: clerkUser.id,
        organizationId: org.id,
        portalType: "ops",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Portal access assigned");
    } else {
      console.log("✓ Portal access already exists");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DEV USER SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🏢 Organization: Dev Organization (${org.id})`);
    console.log(`👤 Clerk User ID: ${clerkUser.id}`);
    console.log("\n🚀 You can now log in at:");
    console.log("   http://localhost:3000/auth/v2/login\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    throw error;
  } finally {
    await connection.end();
  }
}

createDevUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
