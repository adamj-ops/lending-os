/**
 * Update the development user's password directly in Clerk.
 *
 * Usage: npx tsx scripts/fix-dev-password.ts [email] [newPassword]
 * Defaults: dev@lendingos.com / dev123
 */

import { config } from "dotenv";
import { createClerkClient } from "@clerk/backend";

config({ path: ".env.local" });

const DEFAULT_EMAIL = "dev@lendingos.com";
const DEFAULT_PASSWORD = "dev123";

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  const email = process.argv[2] ?? DEFAULT_EMAIL;
  const password = process.argv[3] ?? DEFAULT_PASSWORD;

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  console.log(`🔧 Updating password for ${email}`);

  const users = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
  if (users.data.length === 0) {
    console.error("❌ Clerk user not found. Run create-dev-user.ts first.");
    process.exit(1);
  }

  const user = users.data[0];

  await clerk.users.updateUser(user.id, {
    password,
  });

  console.log("✅ Password updated successfully");
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main().catch((err) => {
  console.error("❌ Failed to update password:", err);
  process.exit(1);
});
