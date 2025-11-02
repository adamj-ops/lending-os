/**
 * Script to create a Clerk user programmatically
 * 
 * Usage: npx tsx scripts/create-clerk-user.ts
 */

import { config } from "dotenv";
import { createClerkClient } from "@clerk/backend";

// Load environment variables
config({ path: ".env.local" });

async function createClerkUser() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const email = "adam@opsfx.io";
  const password = "Lending12345$";
  const firstName = "Adam";
  const lastName = "Jude";
  const phoneNumber = "+12025551234"; // Placeholder phone number for dev (valid E.164 format)

  try {
    console.log(`🔧 Creating Clerk user: ${email}...`);

    // Check if user already exists
    try {
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });

      if (existingUsers.data.length > 0) {
        console.log(`✅ User ${email} already exists in Clerk`);
        const userId = existingUsers.data[0].id;
        console.log(`📝 User ID: ${userId}`);
        
        // Try to update password if needed
        try {
          await clerk.users.updateUser(userId, {
            password: password,
          });
          console.log("🔑 Password updated");
        } catch (error: any) {
          console.log("⚠️  Could not update password (may require user to reset)");
        }
        
        return userId;
      }
    } catch (error: any) {
      if (!error.message?.includes("not found")) {
        throw error;
      }
    }

    // Create new user
    // Note: Clerk instance requires both phone_number and username
    const user = await clerk.users.createUser({
      emailAddress: [email],
      phoneNumber: [phoneNumber],
      username: email.split('@')[0], // Use email prefix as username (adam)
      password: password,
      firstName: firstName,
      lastName: lastName,
      skipPasswordChecks: true, // Skip for dev accounts
      skipPasswordRequirement: true,
    });

    console.log(`✅ User created successfully!`);
    console.log(`📝 User ID: ${user.id}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

    return user.id;
  } catch (error: any) {
    console.error("❌ Error creating user:", error);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.error(`   - ${err.message}`);
      });
    }
    throw error;
  }
}

createClerkUser()
  .then((userId) => {
    console.log(`\n✨ Done! User ID: ${userId}`);
    console.log("\n💡 You can now login with:");
    console.log(`   Email: adam@opsfx.io`);
    console.log(`   Password: Lending12345$`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
