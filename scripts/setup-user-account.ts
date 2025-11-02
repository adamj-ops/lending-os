/**
 * Set up user account with BetterAuth organization and portal access
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

config({ path: ".env.local" });

async function setupUserAccount() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    const email = "adam@everydayhomebuyers.com";
    const password = "Frankie071222$";

    console.log(`🔧 Setting up account for ${email}...`);

    // Find user
    const [user] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    let userId: string;
    if (user) {
      userId = user.id;
      console.log(`✅ Found user: ${email} (${userId})`);
    } else {
      console.log(`❌ User not found: ${email}`);
      console.log("   Please register first at http://localhost:3000/auth/v2/register");
      process.exit(1);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    const [account] = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, userId))
      .limit(1);

    if (account) {
      await db
        .update(schema.account)
        .set({ password: hashedPassword })
        .where(eq(schema.account.id, account.id));
      console.log("✅ Password updated");
    } else {
      // Create account if it doesn't exist
      await db.insert(schema.account).values({
        id: `account_${Date.now()}`,
        accountId: "email-password",
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
      });
      console.log("✅ Account created");
    }

    // Check if BetterAuth organization table exists
    const orgTableExists = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organization'
      );
    `;

    let orgId: string;

    if (orgTableExists[0].exists) {
      // Find or create BetterAuth organization
      const existingOrg = await connection`
        SELECT id, name FROM organization WHERE slug = 'everyday-homebuyers' LIMIT 1;
      `;

      if (existingOrg.length > 0) {
        orgId = existingOrg[0].id;
        console.log(`✅ Using existing organization: ${existingOrg[0].name} (${orgId})`);
      } else {
        // Create BetterAuth organization
        const newOrg = await connection`
          INSERT INTO organization (id, name, slug, created_at, updated_at)
          VALUES ('org_' || substr(md5(random()::text), 1, 20), 'Everyday Homebuyers', 'everyday-homebuyers', NOW(), NOW())
          RETURNING id, name;
        `;
        orgId = newOrg[0].id;
        console.log(`✅ Created organization: ${newOrg[0].name} (${orgId})`);
      }

      // Add user to organization
      const existingMember = await connection`
        SELECT * FROM member 
        WHERE user_id = ${userId} AND organization_id = ${orgId}
        LIMIT 1;
      `;

      if (existingMember.length === 0) {
        await connection`
          INSERT INTO member (id, user_id, organization_id, role, created_at, updated_at)
          VALUES ('member_' || substr(md5(random()::text), 1, 20), ${userId}, ${orgId}, 'admin', NOW(), NOW());
        `;
        console.log("✅ User added to organization");
      } else {
        console.log("✅ User already a member");
      }
    } else {
      // Fallback: use legacy organization
      const [legacyOrg] = await db
        .select()
        .from(schema.organizations)
        .limit(1);

      if (legacyOrg) {
        orgId = legacyOrg.id;
        await db.insert(schema.userOrganizations).values({
          userId: userId,
          organizationId: orgId,
          role: "admin",
        }).onConflictDoNothing();
        console.log(`✅ Using legacy organization: ${legacyOrg.name} (${orgId})`);
      } else {
        console.log("⚠️  No organization found, creating one...");
        const [newLegacyOrg] = await db
          .insert(schema.organizations)
          .values({
            name: "Everyday Homebuyers",
            logoUrl: null,
          })
          .returning();
        orgId = newLegacyOrg.id;
        await db.insert(schema.userOrganizations).values({
          userId: userId,
          organizationId: orgId,
          role: "admin",
        });
        console.log(`✅ Created legacy organization: ${newLegacyOrg.name} (${orgId})`);
      }
    }

    // Ensure portal access exists
    const existingPortalAccess = await db
      .select()
      .from(schema.userPortalAccess)
      .where(
        and(
          eq(schema.userPortalAccess.userId, userId),
          eq(schema.userPortalAccess.organizationId, orgId),
          eq(schema.userPortalAccess.portalType, "ops")
        )
      )
      .limit(1);

    if (existingPortalAccess.length === 0) {
      await db.insert(schema.userPortalAccess).values({
        userId: userId,
        organizationId: orgId,
        portalType: "ops",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Portal access created");
    } else {
      // Update existing to ensure it's active
      await db
        .update(schema.userPortalAccess)
        .set({
          isActive: true,
          role: "admin",
          organizationId: orgId, // Update to current org ID
        })
        .where(eq(schema.userPortalAccess.id, existingPortalAccess[0].id));
      console.log("✅ Portal access updated");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ ACCOUNT SETUP COMPLETE!");
    console.log("=".repeat(50));
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🏢 Organization ID: ${orgId}`);
    console.log("\n🚀 You can now log in at:");
    console.log("   http://localhost:3000/auth/v2/login");
    console.log("\n");

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

setupUserAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

