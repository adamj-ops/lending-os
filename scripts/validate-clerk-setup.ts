/**
 * Validate Clerk Setup
 * 
 * This script validates that Clerk is properly configured:
 * - Environment variables are set
 * - Clerk SDK can be imported
 * - Basic configuration is correct
 * 
 * Usage: npx tsx scripts/validate-clerk-setup.ts
 */

import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn("⚠️  .env.local not found, checking process.env");
}

async function validateClerkSetup() {
  console.log("🔍 Validating Clerk Setup...\n");

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check environment variables
  console.log("📋 Checking Environment Variables:");
  
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkSecretKey) {
    errors.push("❌ CLERK_SECRET_KEY is not set");
  } else {
    if (clerkSecretKey.startsWith("sk_test_") || clerkSecretKey.startsWith("sk_live_")) {
      console.log("   ✅ CLERK_SECRET_KEY is set (format looks correct)");
      if (clerkSecretKey.startsWith("sk_test_")) {
        console.log("   ℹ️  Using test key (development)");
      } else {
        console.log("   ⚠️  Using live key (production)");
      }
    } else {
      warnings.push("⚠️  CLERK_SECRET_KEY format may be incorrect (should start with sk_test_ or sk_live_)");
      console.log("   ⚠️  CLERK_SECRET_KEY is set but format may be incorrect");
    }
  }

  if (!clerkPublishableKey) {
    errors.push("❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set");
  } else {
    if (clerkPublishableKey.startsWith("pk_test_") || clerkPublishableKey.startsWith("pk_live_")) {
      console.log("   ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set (format looks correct)");
      if (clerkPublishableKey.startsWith("pk_test_")) {
        console.log("   ℹ️  Using test key (development)");
      } else {
        console.log("   ⚠️  Using live key (production)");
      }
    } else {
      warnings.push("⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format may be incorrect (should start with pk_test_ or pk_live_)");
      console.log("   ⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set but format may be incorrect");
    }
  }

  // Check key consistency
  if (clerkSecretKey && clerkPublishableKey) {
    const secretEnv = clerkSecretKey.startsWith("sk_test_") ? "test" : "live";
    const publishableEnv = clerkPublishableKey.startsWith("pk_test_") ? "test" : "live";
    
    if (secretEnv !== publishableEnv) {
      errors.push(`❌ Environment mismatch: Secret key is ${secretEnv} but Publishable key is ${publishableEnv}`);
      console.log(`   ❌ Environment mismatch: Secret key is ${secretEnv} but Publishable key is ${publishableEnv}`);
    } else {
      console.log(`   ✅ Both keys are from ${secretEnv} environment`);
    }
  }

  console.log("");

  // Check Clerk package installation
  console.log("📦 Checking Package Installation:");
  try {
    // Try multiple ways to check for the package
    let clerkPackage;
    try {
      clerkPackage = require("@clerk/nextjs/package.json");
    } catch {
      // Alternative check - try importing the package
      const clerkModule = require("@clerk/nextjs");
      if (clerkModule) {
        // Package is installed, get version from package.json in node_modules
        try {
          const fs = require("fs");
          const path = require("path");
          const packagePath = path.join(process.cwd(), "node_modules", "@clerk", "nextjs", "package.json");
          if (fs.existsSync(packagePath)) {
            clerkPackage = JSON.parse(fs.readFileSync(packagePath, "utf8"));
          }
        } catch {
          // If we can't get version, at least confirm it's installed
          console.log(`   ✅ @clerk/nextjs is installed (version check failed, but package exists)`);
          return;
        }
      }
    }
    
    if (clerkPackage && clerkPackage.version) {
      console.log(`   ✅ @clerk/nextjs is installed (version: ${clerkPackage.version})`);
    } else {
      console.log(`   ✅ @clerk/nextjs is installed (version info unavailable)`);
    }
  } catch (error: any) {
    errors.push("❌ @clerk/nextjs package is not installed");
    console.log("   ❌ @clerk/nextjs package is not installed");
    console.log(`   Error: ${error.message}`);
    console.log("   Run: npm install @clerk/nextjs");
  }

  console.log("");

  // Check file structure
  console.log("📁 Checking File Structure:");
  
  const filesToCheck = [
    { path: "src/lib/clerk.ts", description: "Clerk config file" },
    { path: "src/lib/clerk-server.ts", description: "Clerk server utilities" },
    { path: "src/app/layout.tsx", description: "Layout with ClerkProvider" },
    { path: "src/middleware.ts", description: "Middleware with clerkMiddleware" },
  ];

  for (const file of filesToCheck) {
    if (existsSync(file.path)) {
      console.log(`   ✅ ${file.description} exists`);
    } else {
      errors.push(`❌ ${file.description} is missing: ${file.path}`);
      console.log(`   ❌ ${file.description} is missing: ${file.path}`);
    }
  }

  console.log("");

  // Summary
  console.log("=".repeat(60));
  if (errors.length === 0) {
    console.log("✅ Clerk Setup Validation: PASSED");
    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach(w => console.log(`   ${w}`));
    }
    console.log("\n🚀 Your Clerk setup looks good! You can now:");
    console.log("   1. Start the dev server: npm run dev");
    console.log("   2. Test registration at: http://localhost:3000/auth/v2/register");
    console.log("   3. Test login at: http://localhost:3000/auth/v2/login");
  } else {
    console.log("❌ Clerk Setup Validation: FAILED");
    console.log("\nErrors:");
    errors.forEach(e => console.log(`   ${e}`));
    if (warnings.length > 0) {
      console.log("\nWarnings:");
      warnings.forEach(w => console.log(`   ${w}`));
    }
    console.log("\n📚 See .cursor/docs/technical/clerk-setup.md for setup instructions");
    process.exit(1);
  }
  console.log("=".repeat(60));
}

validateClerkSetup().catch((error) => {
  console.error("❌ Validation error:", error);
  process.exit(1);
});

