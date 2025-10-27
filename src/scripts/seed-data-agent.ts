import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql, and, eq, inArray } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../db/schema";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Utility types
type UUID = string;

// Random data helpers
const firstNames = [
  "John",
  "Sarah",
  "Michael",
  "Emily",
  "David",
  "Olivia",
  "Daniel",
  "Sophia",
  "James",
  "Ava",
  "Liam",
  "Mia",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
];

const companySuffixes = [
  "LLC",
  "Inc",
  "Group",
  "Holdings",
  "Capital",
  "Partners",
];

const cities = [
  { city: "Denver", state: "CO", zips: ["80202", "80203", "80205"] },
  { city: "Austin", state: "TX", zips: ["78701", "78702", "78703"] },
  { city: "Seattle", state: "WA", zips: ["98101", "98102", "98103"] },
  { city: "Miami", state: "FL", zips: ["33101", "33130", "33131"] },
  { city: "Phoenix", state: "AZ", zips: ["85001", "85004", "85008"] },
  { city: "Portland", state: "OR", zips: ["97201", "97202", "97203"] },
  { city: "Atlanta", state: "GA", zips: ["30301", "30303", "30305"] },
  { city: "Nashville", state: "TN", zips: ["37201", "37203", "37204"] },
];

const streetNames = [
  "Main St",
  "Oak Ave",
  "Pine Rd",
  "Elm St",
  "Maple Dr",
  "Cedar Ln",
  "Birch Way",
  "Spruce Ct",
  "Willow Blvd",
  "Sunset Ave",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

function randomAddress() {
  const { city, state, zips } = pickRandom(cities);
  const house = randomInt(100, 999);
  const street = pickRandom(streetNames);
  const zip = pickRandom(zips);
  return { address: `${house} ${street}`, city, state, zip };
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

// Domain helpers
function calcMaturity(start: Date, months: number): Date {
  const d = new Date(start);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toDateOnlyString(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Payment schedule calculation (aligned with PaymentService)
function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  paymentType: "amortized" | "interest_only"
) {
  const monthlyRate = annualRate / 12 / 100;
  const schedule: Array<{
    paymentNumber: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
  }> = [];

  let remainingBalance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;

    let principalPayment: number;
    if (paymentType === "interest_only") {
      principalPayment = month === termMonths ? remainingBalance : 0;
    } else {
      const totalPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);
      principalPayment = totalPayment - interestPayment;
    }

    remainingBalance -= principalPayment;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + month);

    schedule.push({
      paymentNumber: month,
      dueDate,
      principalAmount: principalPayment,
      interestAmount: interestPayment,
      totalAmount: principalPayment + interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
    });
  }

  return schedule;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🤖 Data Seeder Agent starting...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    // 1) Ensure base org, roles, admin user
    console.log("Ensuring base organization, roles, and admin user...");

    const orgName = "Dev Lending Co";
    const [existingOrg] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.name, orgName))
      .limit(1);

    const organization =
      existingOrg ||
      (await db
        .insert(schema.organizations)
        .values({ name: orgName, logoUrl: null })
        .returning()
        .then((r) => r[0]!));

    const roleNames = [
      { name: "admin", description: "Full access to all features" },
      { name: "manager", description: "Create/edit loans, view reports" },
      { name: "analyst", description: "Read-only access" },
    ] as const;

    for (const r of roleNames) {
      await db
        .insert(schema.roles)
        .values({ name: r.name, description: r.description })
        .onConflictDoNothing()
        .returning();
    }

    const [adminRole] = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "admin"))
      .limit(1);

    const adminEmail = "admin@lendingos.com";
    const [existingAdmin] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail))
      .limit(1);

    const adminUser =
      existingAdmin ||
      (await (async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const [user] = await db
          .insert(schema.users)
          .values({
            email: adminEmail,
            name: "Admin User",
            hashedPassword,
            emailVerified: false,
          })
          .returning();
        return user!;
      })());

    await db
      .insert(schema.userOrganizations)
      .values({ userId: adminUser.id, organizationId: organization.id, role: "admin" })
      .onConflictDoNothing();

    if (adminRole) {
      await db
        .insert(schema.userRoles)
        .values({ userId: adminUser.id, roleId: adminRole.id })
        .onConflictDoNothing();
    }

    // 2) Create lenders
    console.log("Creating lenders...");
    const lenderNames = [
      "Capital Fund Partners",
      "North Star Capital",
      "Pioneer Lending Group",
      "Robert Williams",
      "Sunset Equity Partners",
    ];

    const lenderEntityTypes: Array<schema.EntityType | "individual"> = [
      "fund",
      "company",
      "company",
      "individual",
      "fund",
    ];

    const createdLenders: Array<{ id: UUID; name: string }> = [];
    for (let i = 0; i < lenderNames.length; i++) {
      const [lender] = await db
        .insert(schema.lenders)
        .values({
          organizationId: organization.id,
          name: lenderNames[i]!,
          entityType: lenderEntityTypes[i] as any,
          contactEmail: `${slugify(lenderNames[i]!)}@example.com`,
          contactPhone: randomPhone(),
          totalCommitted: String(randomInt(1_000_000, 8_000_000)),
          totalDeployed: String(randomInt(500_000, 5_000_000)),
        })
        .onConflictDoNothing()
        .returning();

      if (lender) createdLenders.push({ id: lender.id, name: lender.name });
    }

    // Fetch all lenders (including any preexisting)
    const lendersAll =
      createdLenders.length > 0
        ? createdLenders
        : (await db.select().from(schema.lenders).where(eq(schema.lenders.organizationId, organization.id))).map(
            (l) => ({ id: l.id, name: l.name })
          );

    // 3) Create borrowers
    console.log("Creating borrowers...");
    const createdBorrowers: Array<{ id: UUID; firstName: string; lastName: string; email: string }>
      = [];

    const borrowerCount = 12;
    for (let i = 0; i < borrowerCount; i++) {
      const fn = pickRandom(firstNames);
      const ln = pickRandom(lastNames);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}+${randomInt(1000, 9999)}@example.com`;

      const [borrower] = await db
        .insert(schema.borrowers)
        .values({
          organizationId: organization.id,
          type: Math.random() < 0.7 ? ("individual" as const) : ("entity" as const),
          firstName: fn,
          lastName: ln,
          name: Math.random() < 0.3 ? `${titleCase(ln)} ${pickRandom(companySuffixes)}` : null,
          email,
          phone: randomPhone(),
          address: `${randomInt(100, 999)} ${pickRandom(streetNames)}, ${pickRandom(cities).city}`,
          companyName: null,
          creditScore: randomInt(640, 780),
          taxIdEncrypted: null,
        })
        .returning();

      if (borrower) createdBorrowers.push({ id: borrower.id, firstName: fn, lastName: ln, email });
    }

    // 4) Create properties
    console.log("Creating properties...");
    const propertyTypes: Array<schema.PropertyType> = [
      "single_family",
      "multi_family",
      "commercial",
      "land",
    ];

    const createdProperties: Array<{ id: UUID; fullAddress: string }> = [];
    const propertyCount = 12;
    for (let i = 0; i < propertyCount; i++) {
      const { address, city, state, zip } = randomAddress();
      const purchasePrice = randomInt(250_000, 900_000);
      const appraisedValue = purchasePrice + randomInt(10_000, 100_000);

      const [property] = await db
        .insert(schema.properties)
        .values({
          organizationId: organization.id,
          address,
          city,
          state,
          zip,
          propertyType: pickRandom(propertyTypes),
          purchasePrice: String(purchasePrice),
          appraisedValue: String(appraisedValue),
          appraisalDate: new Date(),
          occupancy: Math.random() < 0.5 ? "vacant" : "tenant_occupied",
          estimatedValue: String(appraisedValue + randomInt(5_000, 50_000)),
          rehabBudget: String(randomInt(25_000, 250_000)),
          photos: null,
        })
        .returning();

      if (property) {
        createdProperties.push({
          id: property.id,
          fullAddress: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
        });
      }
    }

    // 5) Create loans
    console.log("Creating loans, schedules, payments, draws, inspections...");

    const loanCount = 10;
    const createdLoans: Array<{ id: UUID; status: schema.LoanStatus; principal: number; rate: number; term: number }>
      = [];

    for (let i = 0; i < loanCount; i++) {
      const borrower = pickRandom(createdBorrowers);
      const lender = pickRandom(lendersAll);
      const property = pickRandom(createdProperties);

      const principal = randomInt(250_000, 900_000);
      const rate = randomInt(9, 14) + Math.random();
      const termMonths = pickRandom([12, 15, 18, 24]);

      const status: schema.LoanStatus = pickRandom([
        "funded",
        "closing",
        "underwriting",
        "draft",
      ]);

      const fundedDate = status === "funded" ? new Date(new Date().setMonth(new Date().getMonth() - randomInt(1, 6))) : null;
      const maturityDate = fundedDate ? calcMaturity(fundedDate, termMonths) : null;

      const [loan] = await db
        .insert(schema.loans)
        .values({
          organizationId: organization.id,
          loanCategory: "asset_backed",
          borrowerId: borrower.id,
          lenderId: lender.id,
          propertyId: property.id,
          propertyAddress: property.fullAddress,
          principal: String(principal),
          rate: String(rate.toFixed(3)),
          termMonths,
          paymentType: Math.random() < 0.8 ? "amortized" : "interest_only",
          paymentFrequency: "monthly",
          originationFeeBps: randomInt(50, 300),
          lateFeeBps: randomInt(0, 200),
          defaultInterestBps: randomInt(0, 300),
          escrowEnabled: Math.random() < 0.3,
          status,
          statusChangedAt: new Date(),
          loanAmount: String(principal),
          interestRate: String(rate.toFixed(2)),
          fundedDate,
          maturityDate,
          createdBy: adminUser.id,
        })
        .returning();

      if (!loan) continue;

      // Hybrid relations
      await db
        .insert(schema.borrowerLoans)
        .values({ borrowerId: borrower.id, loanId: loan.id, role: "primary", isPrimary: true })
        .onConflictDoNothing();
      await db
        .insert(schema.lenderLoans)
        .values({ lenderId: lender.id, loanId: loan.id, role: "primary", isPrimary: true, percentage: "100" })
        .onConflictDoNothing();

      createdLoans.push({ id: loan.id, status: loan.status as schema.LoanStatus, principal, rate, term: termMonths });

      // Add contextual loan notes
      await db.insert(schema.loanNotes).values({
        loanId: loan.id,
        content: `Loan created for ${borrower.firstName} ${borrower.lastName} at ${rate.toFixed(2)}% for ${termMonths} months.`,
        createdBy: adminUser.id,
      });

      // Generate payment schedule
      const schedule = calculateAmortizationSchedule(
        principal,
        rate,
        termMonths,
        (loan.paymentType as any) || "amortized"
      );

      const [savedSchedule] = await db
        .insert(schema.paymentSchedules)
        .values({
          loanId: loan.id,
          scheduleType: loan.paymentType === "interest_only" ? "interest_only" : "amortized",
          paymentFrequency: loan.paymentFrequency,
          totalPayments: String(termMonths),
          paymentAmount: schedule[0] ? schedule[0].totalAmount.toFixed(2) : "0",
          scheduleData: JSON.stringify(schedule.map((s) => ({
            paymentNumber: s.paymentNumber,
            dueDate: toDateOnlyString(s.dueDate),
            principalAmount: s.principalAmount.toFixed(2),
            interestAmount: s.interestAmount.toFixed(2),
            totalAmount: s.totalAmount.toFixed(2),
            remainingBalance: s.remainingBalance.toFixed(2),
          }))),
          isActive: "1",
        })
        .returning();

      if (savedSchedule) {
        await db.insert(schema.loanNotes).values({
          loanId: loan.id,
          content: `Payment schedule generated (${savedSchedule.totalPayments} payments).`,
          createdBy: adminUser.id,
        });
      }

      // Seed payments for funded loans
      if (status === "funded") {
        const paymentsToCreate = randomInt(1, Math.min(6, termMonths));
        for (let p = 0; p < paymentsToCreate; p++) {
          const item = schedule[p];
          if (!item) break;

          const paymentDate = new Date();
          paymentDate.setMonth(paymentDate.getMonth() - (paymentsToCreate - p));

          const [payment] = await db
            .insert(schema.payments)
            .values({
              loanId: loan.id,
              paymentType: loan.paymentType === "interest_only" ? "interest" : "combined",
              amount: item.totalAmount.toFixed(2),
              principalAmount: item.principalAmount.toFixed(2),
              interestAmount: item.interestAmount.toFixed(2),
              feeAmount: "0",
              paymentMethod: Math.random() < 0.7 ? "ach" : "wire",
              status: "completed",
              paymentDate: toDateOnlyString(paymentDate),
              receivedDate: toDateOnlyString(paymentDate),
              processedDate: new Date(),
              transactionReference: `TX-${randomInt(100000, 999999)}`,
              bankReference: `BNK-${randomInt(10000, 99999)}`,
              notes: Math.random() < 0.3 ? "Auto-debit" : null,
              createdBy: adminUser.id,
            })
            .returning();

          if (payment) {
            await db.insert(schema.loanNotes).values({
              loanId: loan.id,
              content: `Payment #${item.paymentNumber} posted: $${item.totalAmount.toFixed(2)} (${item.principalAmount.toFixed(2)} principal, ${item.interestAmount.toFixed(2)} interest).`,
              createdBy: adminUser.id,
            });
          }
        }
      }

      // Seed draw schedule and draws for subset of funded loans
      if (status === "funded" && Math.random() < 0.7) {
        const totalDraws = randomInt(3, 5);
        const budgetTotal = principal * 0.6; // assume 60% towards rehab budget
        const perDraw = budgetTotal / totalDraws;

        const drawScheduleData = Array.from({ length: totalDraws }).map((_, idx) => ({
          drawNumber: idx + 1,
          description: idx === 0 ? "Initial demo and site prep" : idx === totalDraws - 1 ? "Final finishes and cleanup" : `Phase ${idx + 1} construction` ,
          budgetAmount: perDraw.toFixed(2),
          scheduledDate: toDateOnlyString(calcMaturity(new Date(), idx)),
        }));

        const [drawSchedule] = await db
          .insert(schema.drawSchedules)
          .values({
            loanId: loan.id,
            totalDraws,
            totalBudget: String(budgetTotal.toFixed(2)),
            scheduleData: JSON.stringify(drawScheduleData),
            isActive: true,
            createdBy: adminUser.id,
          })
          .returning();

        if (drawSchedule) {
          await db.insert(schema.loanNotes).values({
            loanId: loan.id,
            content: `Draw schedule created (${totalDraws} draws, total budget $${budgetTotal.toFixed(2)}).`,
            createdBy: adminUser.id,
          });
        }

        // Create some draws
        const drawCount = randomInt(1, totalDraws);
        for (let d = 0; d < drawCount; d++) {
          const ds = drawScheduleData[d]!;

          // Determine next draw number
          const existingDraws = await db
            .select()
            .from(schema.draws)
            .where(eq(schema.draws.loanId, loan.id))
            .orderBy(sql`${schema.draws.drawNumber} DESC`);
          const nextDrawNumber = existingDraws[0]?.drawNumber ? existingDraws[0].drawNumber + 1 : 1;

          const [draw] = await db
            .insert(schema.draws)
            .values({
              loanId: loan.id,
              drawNumber: nextDrawNumber,
              amountRequested: (parseFloat(ds.budgetAmount) * (0.9 + Math.random() * 0.2)).toFixed(2),
              workDescription: ds.description,
              budgetLineItem: `Phase ${ds.drawNumber}`,
              contractorName: `${pickRandom(lastNames)} Construction` ,
              contractorContact: randomPhone(),
              status: "requested",
              requestedBy: adminUser.id,
              requestedDate: toDateOnlyString(new Date()),
            })
            .returning();

          if (!draw) continue;

          // Approve most draws
          const approve = Math.random() < 0.85;
          if (approve) {
            const [updated] = await db
              .update(schema.draws)
              .set({
                status: "approved",
                amountApproved: (parseFloat(draw.amountRequested || "0") * (0.98 + Math.random() * 0.04)).toFixed(2),
                approvedBy: adminUser.id,
                approvedDate: toDateOnlyString(new Date()),
              })
              .where(eq(schema.draws.id, draw.id))
              .returning();

            if (updated) {
              await db.insert(schema.loanNotes).values({
                loanId: loan.id,
                content: `Draw #${updated.drawNumber} approved for $${updated.amountApproved}.`,
                createdBy: adminUser.id,
              });

              // Schedule and complete an inspection
              const [inspection] = await db
                .insert(schema.inspections)
                .values({
                  drawId: updated.id,
                  inspectionType: Math.random() < 0.8 ? "progress" : "final",
                  status: "completed",
                  inspectorName: `${pickRandom(firstNames)} ${pickRandom(lastNames)}`,
                  inspectorContact: `${randomInt(100, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
                  inspectionLocation: property.fullAddress,
                  workCompletionPercentage: randomInt(60, 100),
                  qualityRating: randomInt(3, 5),
                  safetyCompliant: true,
                  findings: Math.random() < 0.5 ? "Work meets expectations." : "Minor punch list items.",
                  recommendations: Math.random() < 0.5 ? null : "Proceed with next phase.",
                  photos: JSON.stringify([]),
                  signatures: JSON.stringify([]),
                  scheduledDate: toDateOnlyString(new Date()),
                  completedDate: toDateOnlyString(new Date()),
                })
                .returning();

              if (inspection) {
                await db.update(schema.draws)
                  .set({ status: "inspected", inspectedBy: inspection.id, inspectionDate: toDateOnlyString(new Date()) })
                  .where(eq(schema.draws.id, updated.id));

                await db.insert(schema.loanNotes).values({
                  loanId: loan.id,
                  content: `Inspection completed for draw #${updated.drawNumber} by ${inspection.inspectorName}.`,
                  createdBy: adminUser.id,
                });
              }

              // Disburse many approved draws
              if (Math.random() < 0.9) {
                const disbursedAmount = parseFloat(updated.amountApproved || "0") * (0.95 + Math.random() * 0.05);
                const [disbursed] = await db
                  .update(schema.draws)
                  .set({
                    status: "disbursed",
                    amountDisbursed: disbursedAmount.toFixed(2),
                    disbursedDate: toDateOnlyString(new Date()),
                  })
                  .where(eq(schema.draws.id, updated.id))
                  .returning();

                if (disbursed) {
                  await db.insert(schema.loanNotes).values({
                    loanId: loan.id,
                    content: `Disbursed $${disbursed.amountDisbursed} for draw #${disbursed.drawNumber}.`,
                    createdBy: adminUser.id,
                  });
                }
              }
            }
          } else {
            // Rejected draw
            await db
              .update(schema.draws)
              .set({ status: "rejected", rejectionReason: "Insufficient documentation" })
              .where(eq(schema.draws.id, draw.id));
            await db.insert(schema.loanNotes).values({
              loanId: loan.id,
              content: `Draw #${draw.drawNumber} rejected due to insufficient documentation.`,
              createdBy: adminUser.id,
            });
          }
        }
      }
    }

    // Final quick summary counts
    const [loanCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.loans);
    const [borrowerCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.borrowers);
    const [lenderCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.lenders);
    const [paymentCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.payments);
    const [drawCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.draws);
    const [inspectionCountRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.inspections);

    console.log("✅ Seed complete.");
    console.log(`Org: ${orgName}`);
    console.log(`Borrowers: ${borrowerCountRow.c}`);
    console.log(`Lenders: ${lenderCountRow.c}`);
    console.log(`Loans: ${loanCountRow.c}`);
    console.log(`Payments: ${paymentCountRow.c}`);
    console.log(`Draws: ${drawCountRow.c}`);
    console.log(`Inspections: ${inspectionCountRow.c}`);

    console.log("\n📝 Test Credentials:");
    console.log("   Email: admin@lendingos.com");
    console.log("   Password: password123");
  } catch (error) {
    console.error("❌ Seed agent failed:", error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

// Allow optional '--reset' flag to truncate before seeding (safe for dev only)
async function maybeReset() {
  const args = process.argv.slice(2);
  if (args.includes("--reset")) {
    console.log("🗑️  Reset flag detected - clearing key tables...");

    const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(connection);
    try {
      await db.execute(sql`TRUNCATE borrower_loans, lender_loans, loan_notes, payments, inspections, draws, draw_schedules, payment_schedules, loans, properties, borrowers, lenders, user_roles, user_organizations, users, organizations RESTART IDENTITY CASCADE`);
      console.log("✅ Database reset complete");
    } finally {
      await connection.end();
    }
  }
}

(async () => {
  await maybeReset();
  await main();
})();
