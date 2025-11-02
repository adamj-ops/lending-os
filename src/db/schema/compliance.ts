import { pgTable, text, timestamp, uuid, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { loans } from "./loans";
import { funds } from "./funds";
import { borrowers } from "./borrowers";
import { appUsers } from "./auth";

/**
 * Compliance Domain Schema
 * 
 * Manages e-signatures, KYC verification, compliance filings, licenses, and audit logs.
 */

// Compliance Document Type Enum (different from borrower document types)
export const complianceDocumentTypeEnum = pgEnum("compliance_document_type_enum", [
  "loan_agreement",
  "ppm", // Private Placement Memorandum
  "subscription_agreement",
  "compliance_disclosure",
  "other",
]);

// Signature Status Enum
export const signatureStatusEnum = pgEnum("signature_status_enum", [
  "draft",      // Envelope created but not sent
  "sent",       // Envelope sent to signers
  "viewed",     // At least one signer viewed
  "signed",     // At least one signer signed
  "completed",  // All signers completed
  "declined",   // Envelope declined
  "voided",     // Envelope voided
]);

// Signature Provider Enum
export const signatureProviderEnum = pgEnum("signature_provider_enum", [
  "docusign",
  "dropbox_sign",
  "other",
]);

/**
 * Document Signatures Table
 * Tracks signature envelopes and their status
 */
export const documentSignatures = pgTable(
  "document_signatures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Document Reference
    documentType: complianceDocumentTypeEnum("document_type").notNull(),
    documentId: uuid("document_id"), // References loan, fund, or other entity
    loanId: uuid("loan_id").references(() => loans.id, { onDelete: "cascade" }),
    fundId: uuid("fund_id").references(() => funds.id, { onDelete: "cascade" }),

    // Provider Information
    provider: signatureProviderEnum("provider").notNull().default("docusign"),
    envelopeId: text("envelope_id").notNull(), // Provider's envelope ID
    status: signatureStatusEnum("status").notNull().default("draft"),

    // Signers Information (JSONB array of signer objects)
    signers: jsonb("signers").notNull(), // [{ email, name, role, status, signedAt }]

    // Timing
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Metadata
    documentUrl: text("document_url"), // URL to view/download document
    signedDocumentUrl: text("signed_document_url"), // URL to signed document

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    documentIdIdx: index("document_signatures_document_id_idx").on(table.documentId),
    envelopeIdIdx: index("document_signatures_envelope_id_idx").on(table.envelopeId),
    statusIdx: index("document_signatures_status_idx").on(table.status),
    loanIdIdx: index("document_signatures_loan_id_idx").on(table.loanId),
    fundIdIdx: index("document_signatures_fund_id_idx").on(table.fundId),
  })
);

/**
 * Document Templates Table
 * Manages document templates for signature workflows
 */
export const documentTemplates = pgTable(
  "document_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Template Information
    name: text("name").notNull(),
    type: complianceDocumentTypeEnum("type").notNull(),
    description: text("description"),

    // Provider Template ID (e.g., DocuSign template ID)
    providerTemplateId: text("provider_template_id"),

    // Template Content (JSONB for variables and structure)
    content: jsonb("content"), // Template structure, placeholders, etc.
    variables: jsonb("variables"), // Available variables for template

    // Status
    isActive: text("is_active").notNull().default("true"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("document_templates_organization_id_idx").on(table.organizationId),
    typeIdx: index("document_templates_type_idx").on(table.type),
  })
);

// KYC Status Enum
export const kycStatusEnum = pgEnum("kyc_status_enum", [
  "pending",        // Verification not started
  "in_progress",    // Verification in progress
  "approved",       // Verification approved
  "rejected",       // Verification rejected
  "requires_review", // Manual review required
]);

// KYC Provider Enum
export const kycProviderEnum = pgEnum("kyc_provider_enum", [
  "persona",
  "onfido",
  "sumsub",
  "other",
]);

/**
 * KYC Verifications Table
 * Tracks KYC/AML verification requests and results
 */
export const kycVerifications = pgTable(
  "kyc_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Entity References
    borrowerId: uuid("borrower_id").references(() => borrowers.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => appUsers.id, { onDelete: "set null" }),

    // Provider Information
    provider: kycProviderEnum("provider").notNull().default("persona"),
    verificationId: text("verification_id").notNull(), // Provider's verification ID
    status: kycStatusEnum("status").notNull().default("pending"),

    // Timing
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Results (JSONB for provider-specific data)
    result: jsonb("result"), // Provider response, risk scores, etc.

    // Metadata
    reviewNotes: text("review_notes"), // Manual review notes if required
    reviewedBy: text("reviewed_by").references(() => appUsers.id),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    borrowerIdIdx: index("kyc_verifications_borrower_id_idx").on(table.borrowerId),
    verificationIdIdx: index("kyc_verifications_verification_id_idx").on(table.verificationId),
    statusIdx: index("kyc_verifications_status_idx").on(table.status),
  })
);

/**
 * KYC Documents Table
 * Tracks documents uploaded for KYC verification
 */
export const kycDocuments = pgTable(
  "kyc_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verificationId: uuid("verification_id")
      .notNull()
      .references(() => kycVerifications.id, { onDelete: "cascade" }),

    // Document Information
    documentType: text("document_type").notNull(), // 'id', 'proof_of_address', 'tax_return', etc.
    s3Key: text("s3_key").notNull(), // S3 object key
    fileUrl: text("file_url").notNull(), // Presigned URL or public URL

    // Provider Document ID (if uploaded to provider)
    providerDocumentId: text("provider_document_id"),

    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    verificationIdIdx: index("kyc_documents_verification_id_idx").on(table.verificationId),
  })
);

// Filing Status Enum
export const filingStatusEnum = pgEnum("filing_status_enum", [
  "pending",    // Filing not yet submitted
  "submitted",  // Filing submitted
  "accepted",   // Filing accepted by regulatory body
  "rejected",   // Filing rejected
]);

// License Status Enum
export const licenseStatusEnum = pgEnum("license_status_enum", [
  "active",     // License is active
  "expired",    // License has expired
  "pending",    // License renewal pending
  "revoked",    // License revoked
]);

/**
 * Compliance Filings Table
 * Tracks regulatory filing records
 */
export const complianceFilings = pgTable(
  "compliance_filings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Filing Information
    filingType: text("filing_type").notNull(), // 'sec_filing', 'state_filing', etc.
    filingName: text("filing_name").notNull(),
    description: text("description"),

    // Dates
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    submittedDate: timestamp("submitted_date", { withTimezone: true }),
    status: filingStatusEnum("status").notNull().default("pending"),

    // Document Reference
    documentId: uuid("document_id"), // Reference to signed document or filing document

    // Metadata
    filingNumber: text("filing_number"), // Regulatory filing number
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("compliance_filings_organization_id_idx").on(table.organizationId),
    dueDateIdx: index("compliance_filings_due_date_idx").on(table.dueDate),
    statusIdx: index("compliance_filings_status_idx").on(table.status),
  })
);

/**
 * Licenses Table
 * Tracks lender licenses and permits
 */
export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // License Information
    licenseType: text("license_type").notNull(), // 'state_lending', 'nmls', 'business', etc.
    licenseNumber: text("license_number").notNull(),
    issuer: text("issuer").notNull(), // State, federal agency, etc.

    // Dates
    issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
    expirationDate: timestamp("expiration_date", { withTimezone: true }).notNull(),
    status: licenseStatusEnum("status").notNull().default("active"),

    // Metadata
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("licenses_organization_id_idx").on(table.organizationId),
    expirationDateIdx: index("licenses_expiration_date_idx").on(table.expirationDate),
    statusIdx: index("licenses_status_idx").on(table.status),
  })
);

/**
 * Audit Logs Table
 * Comprehensive audit trail for compliance
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Event Information
    eventType: text("event_type").notNull(), // Domain event type
    entityType: text("entity_type").notNull(), // 'loan', 'payment', 'fund', etc.
    entityId: uuid("entity_id").notNull(),

    // User Information
    userId: text("user_id").references(() => appUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(), // 'create', 'update', 'delete', 'view', etc.

    // Change Tracking
    changes: jsonb("changes"), // Before/after values, field changes

    // Request Information
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("audit_logs_organization_id_idx").on(table.organizationId),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    timestampIdx: index("audit_logs_timestamp_idx").on(table.timestamp),
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  })
);

/**
 * Compliance Rules Table
 * Configurable compliance rules for automation
 */
export const complianceRules = pgTable(
  "compliance_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Rule Information
    ruleType: text("rule_type").notNull(), // 'filing_reminder', 'license_check', etc.
    ruleName: text("rule_name").notNull(),
    description: text("description"),

    // Rule Configuration (JSONB)
    conditions: jsonb("conditions").notNull(), // Rule conditions
    actions: jsonb("actions").notNull(), // Actions to take when rule matches

    // Status
    enabled: text("enabled").notNull().default("true"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("compliance_rules_organization_id_idx").on(table.organizationId),
    ruleTypeIdx: index("compliance_rules_rule_type_idx").on(table.ruleType),
  })
);

