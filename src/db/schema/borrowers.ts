import { pgTable, text, timestamp, uuid, integer, pgEnum, primaryKey, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const documentTypeEnum = pgEnum("document_type", [
  "id",
  "tax_return",
  "bank_statement",
  "other",
]);

export const borrowerTypeEnum = pgEnum("borrower_type", [
  "individual",
  "entity",
]);

export const borrowers = pgTable("borrowers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // v2: Type determines required fields
  type: borrowerTypeEnum("type").notNull().default("individual"),

  // Name fields (firstName+lastName for individuals, or combined name for entities)
  firstName: text("first_name"),
  lastName: text("last_name"),
  name: text("name"), // Entity name

  // Contact
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),

  // Business info
  companyName: text("company_name"),

  // Financial
  creditScore: integer("credit_score"),
  taxIdEncrypted: text("tax_id_encrypted"), // v2: KMS field for future

  // KYC Status (Sprint 6 - Phase 2)
  kycStatus: text("kyc_status").default("pending"), // pending, in_progress, approved, rejected, requires_review

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Indexes for Epic E2
  organizationIdx: index("borrowers_organization_id_idx").on(table.organizationId),
  emailIdx: index("borrowers_email_idx").on(table.email),
}));

export const borrowerDocuments = pgTable("borrower_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .notNull()
    .references(() => borrowers.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

