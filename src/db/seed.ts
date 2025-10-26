import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🌱 Seeding database...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    // Create test organization
    console.log("Creating test organization...");
    const [organization] = await db
      .insert(schema.organizations)
      .values({
        name: "Test Lending Company",
        logoUrl: null,
      })
      .returning();

    // Create roles
    console.log("Creating roles...");
    const [adminRole] = await db
      .insert(schema.roles)
      .values({
        name: "admin",
        description: "Full access to all features",
      })
      .returning();

    const [managerRole] = await db
      .insert(schema.roles)
      .values({
        name: "manager",
        description: "Can create/edit loans, view reports",
      })
      .returning();

    const [analystRole] = await db
      .insert(schema.roles)
      .values({
        name: "analyst",
        description: "Read-only access to reports and data",
      })
      .returning();

    // Create test user
    console.log("Creating test user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const [user] = await db
      .insert(schema.users)
      .values({
        email: "admin@lendingos.com",
        name: "Admin User",
        hashedPassword: hashedPassword,
        emailVerified: false,
      })
      .returning();

    // Link user to organization
    console.log("Linking user to organization...");
    await db.insert(schema.userOrganizations).values({
      userId: user.id,
      organizationId: organization.id,
      role: "admin",
    });

    // Assign admin role
    console.log("Assigning admin role...");
    await db.insert(schema.userRoles).values({
      userId: user.id,
      roleId: adminRole.id,
    });

    // Create sample borrowers
    console.log("Creating sample borrowers...");
    const borrowersData = [
      {
        organizationId: organization.id,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "(555) 123-4567",
        companyName: "Smith Construction LLC",
        creditScore: 720,
      },
      {
        organizationId: organization.id,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.j@example.com",
        phone: "(555) 234-5678",
        companyName: null,
        creditScore: 680,
      },
      {
        organizationId: organization.id,
        firstName: "Michael",
        lastName: "Davis",
        email: "mdavis@example.com",
        phone: "(555) 345-6789",
        companyName: "Davis Properties Inc",
        creditScore: 750,
      },
      {
        organizationId: organization.id,
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.r@example.com",
        phone: "(555) 456-7890",
        companyName: null,
        creditScore: 690,
      },
      {
        organizationId: organization.id,
        firstName: "David",
        lastName: "Chen",
        email: "dchen@example.com",
        phone: "(555) 567-8901",
        companyName: "Chen Development Group",
        creditScore: 740,
      },
    ];

    const borrowerIds = [];
    for (const borrowerData of borrowersData) {
      const [borrower] = await db.insert(schema.borrowers).values(borrowerData).returning();
      borrowerIds.push(borrower.id);
    }

    // Create sample lenders
    console.log("Creating sample lenders...");
    const [lender1] = await db
      .insert(schema.lenders)
      .values({
        organizationId: organization.id,
        name: "Capital Fund Partners",
        entityType: "fund",
        contactEmail: "invest@capitalfund.com",
        totalCommitted: "5000000",
        totalDeployed: "3250000",
      })
      .returning();

    const [lender2] = await db
      .insert(schema.lenders)
      .values({
        organizationId: organization.id,
        name: "Robert Williams",
        entityType: "individual",
        contactEmail: "rwilliams@example.com",
        totalCommitted: "1500000",
        totalDeployed: "875000",
      })
      .returning();

    // Create sample properties and loans
    console.log("Creating sample properties and loans...");
    const propertiesAndLoans = [
      {
        property: {
          address: "123 Main St",
          city: "Denver",
          state: "CO",
          zip: "80202",
          propertyType: "single_family" as const,
          purchasePrice: "425000",
          appraisedValue: "450000",
          appraisalDate: new Date("2024-01-10"),
        },
        loan: {
          borrowerId: borrowerIds[0],
          lenderId: lender1.id,
          loanAmount: "450000",
          interestRate: "12.5",
          termMonths: 12,
          status: "funded" as const,
          fundedDate: new Date("2024-01-15"),
          maturityDate: new Date("2025-01-15"),
        },
      },
      {
        property: {
          address: "456 Oak Ave",
          city: "Austin",
          state: "TX",
          zip: "78701",
          propertyType: "multi_family" as const,
          purchasePrice: "325000",
          appraisedValue: "350000",
          appraisalDate: new Date("2024-02-01"),
        },
        loan: {
          borrowerId: borrowerIds[1],
          lenderId: lender1.id,
          loanAmount: "350000",
          interestRate: "11.0",
          termMonths: 18,
          status: "funded" as const,
          fundedDate: new Date("2024-02-01"),
          maturityDate: new Date("2025-08-01"),
        },
      },
      {
        property: {
          address: "789 Pine Rd",
          city: "Seattle",
          state: "WA",
          zip: "98101",
          propertyType: "commercial" as const,
          purchasePrice: "575000",
          appraisedValue: "625000",
          appraisalDate: new Date("2024-03-05"),
        },
        loan: {
          borrowerId: borrowerIds[2],
          lenderId: lender2.id,
          loanAmount: "625000",
          interestRate: "13.0",
          termMonths: 24,
          status: "funded" as const,
          fundedDate: new Date("2024-03-10"),
          maturityDate: new Date("2026-03-10"),
        },
      },
      {
        property: {
          address: "321 Elm St",
          city: "Miami",
          state: "FL",
          zip: "33101",
          propertyType: "single_family" as const,
          purchasePrice: "250000",
          appraisedValue: "275000",
          appraisalDate: new Date("2024-04-01"),
        },
        loan: {
          borrowerId: borrowerIds[3],
          lenderId: lender1.id,
          loanAmount: "275000",
          interestRate: "10.5",
          termMonths: 12,
          status: "funded" as const,
          fundedDate: new Date("2024-04-05"),
          maturityDate: new Date("2025-04-05"),
        },
      },
      {
        property: {
          address: "555 Maple Dr",
          city: "Phoenix",
          state: "AZ",
          zip: "85001",
          propertyType: "single_family" as const,
          purchasePrice: "475000",
          appraisedValue: "500000",
          appraisalDate: new Date("2024-08-25"),
        },
        loan: {
          borrowerId: borrowerIds[4],
          lenderId: lender2.id,
          loanAmount: "500000",
          interestRate: "12.0",
          termMonths: 15,
          status: "closing" as const,
          fundedDate: null,
          maturityDate: null,
        },
      },
      {
        property: {
          address: "888 Cedar Ln",
          city: "Portland",
          state: "OR",
          zip: "97201",
          propertyType: "multi_family" as const,
          purchasePrice: "375000",
          appraisedValue: "400000",
          appraisalDate: new Date("2024-09-15"),
        },
        loan: {
          borrowerId: borrowerIds[0],
          lenderId: lender1.id,
          loanAmount: "400000",
          interestRate: "11.5",
          termMonths: 12,
          status: "underwriting" as const,
          fundedDate: null,
          maturityDate: null,
        },
      },
      {
        property: {
          address: "999 Birch Way",
          city: "Nashville",
          state: "TN",
          zip: "37201",
          propertyType: "land" as const,
          purchasePrice: "300000",
          appraisedValue: "325000",
          appraisalDate: new Date("2024-10-01"),
        },
        loan: {
          borrowerId: borrowerIds[1],
          lenderId: lender2.id,
          loanAmount: "325000",
          interestRate: "10.0",
          termMonths: 18,
          status: "draft" as const,
          fundedDate: null,
          maturityDate: null,
        },
      },
      {
        property: {
          address: "111 Spruce Ct",
          city: "Atlanta",
          state: "GA",
          zip: "30301",
          propertyType: "commercial" as const,
          purchasePrice: "525000",
          appraisedValue: "550000",
          appraisalDate: new Date("2023-11-10"),
        },
        loan: {
          borrowerId: borrowerIds[2],
          lenderId: lender1.id,
          loanAmount: "550000",
          interestRate: "13.5",
          termMonths: 24,
          status: "funded" as const,
          fundedDate: new Date("2023-11-15"),
          maturityDate: new Date("2025-11-15"),
        },
      },
    ];

    for (const item of propertiesAndLoans) {
      const [property] = await db.insert(schema.properties).values({
        ...item.property,
        organizationId: organization.id, // v2: required field
      }).returning();
      
      await db.insert(schema.loans).values({
        ...item.loan,
        organizationId: organization.id,
        loanCategory: "asset_backed", // v2: required field (seed creates asset-backed loans)
        principal: item.loan.loanAmount, // v2: renamed from loanAmount
        rate: item.loan.interestRate, // v2: renamed from interestRate
        paymentType: "amortized", // v2: default
        paymentFrequency: "monthly", // v2: default
        propertyId: property.id,
        propertyAddress: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
      });
    }

    console.log("✅ Seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   Email: admin@lendingos.com");
    console.log("   Password: password123");
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Borrowers: ${borrowerIds.length}`);
    console.log(`   Lenders: 2`);
    console.log(`   Properties: ${propertiesAndLoans.length}`);
    console.log(`   Loans: ${propertiesAndLoans.length}`);
    console.log(`   Roles: 3 (admin, manager, analyst)`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
