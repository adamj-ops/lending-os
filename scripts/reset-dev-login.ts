/**
 * Reset dev login - ensures account is set up correctly for BetterAuth
 * 
 * Usage: npx tsx scripts/reset-dev-login.ts
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function resetDevLogin() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Resetting dev login...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    // Find or create dev user
    const [existingUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, "dev@lendingos.com"))
      .limit(1);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      console.log(`✅ Found user: ${existingUser.email} (${userId})`);
    } else {
      console.log("Creating dev user...");
      const newUserId = `user_dev_${Date.now()}`;
      const [newUser] = await db
        .insert(schema.user)
        .values({
          id: newUserId,
          email: "dev@lendingos.com",
          name: "Dev User",
          emailVerified: true,
          image: null,
        })
        .returning();
      userId = newUser.id;
      console.log(`✅ Created user: ${userId}`);
    }

    // Delete any existing accounts (to ensure clean state)
    console.log("Cleaning up existing accounts...");
    await db.delete(schema.account).where(eq(schema.account.userId, userId));

    // Create account with correct format for BetterAuth
    // For credential accounts: accountId MUST equal userId
    // Password must be at least 8 characters (BetterAuth default)
    console.log("Creating account with correct BetterAuth format...");
    const password = "dev123456"; // 9 characters - meets BetterAuth minimum
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(schema.account).values({
      id: `account_${Date.now()}`,
      accountId: userId, // MUST equal userId for credential accounts
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
    });

    console.log("\n" + "=".repeat(50));
    console.log("✅ DEV LOGIN RESET COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📧 Email: dev@lendingos.com");
    console.log("🔑 Password: dev123456 (9 characters - meets BetterAuth minimum)");
    console.log("\n🚀 Try logging in at:");
    console.log("   http://localhost:3000/auth/v2/login");
    console.log("   or");
    console.log("   http://localhost:3001/auth/v2/login");
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

resetDevLogin()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

