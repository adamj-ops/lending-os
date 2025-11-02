import { pgTable, uuid, numeric, text, date, timestamp, integer, index, unique, pgEnum, boolean } from "drizzle-orm/pg-core";
import { loans } from "./loans";
import { appUsers } from "./auth";

/**
 * Draw Status Enum
 * - requested: Draw request submitted
 * - approved: Draw approved for disbursement
 * - inspected: Work inspected and verified
 * - disbursed: Funds disbursed to borrower
 * - rejected: Draw request rejected
 */
export const drawStatusEnum = pgEnum("draw_status_enum", [
  "requested",
  "approved",
  "inspected",
  "disbursed",
  "rejected",
]);

/**
 * Draws Table
 * Tracks construction draw requests and disbursements
 */
export const draws = pgTable(
  "draws",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),

    // Draw Details
    drawNumber: integer("draw_number").notNull(), // Sequential per loan
    amountRequested: numeric("amount_requested", { precision: 14, scale: 2 }).notNull(),
    amountApproved: numeric("amount_approved", { precision: 14, scale: 2 }),
    amountDisbursed: numeric("amount_disbursed", { precision: 14, scale: 2 }),

    // Work Description
    workDescription: text("work_description").notNull(),
    budgetLineItem: text("budget_line_item"), // Links to collateral.draw_schedule
    contractorName: text("contractor_name"),
    contractorContact: text("contractor_contact"),

    // Status & Workflow
    status: drawStatusEnum("status").default("requested"),
    requestedBy: text("requested_by").references(() => appUsers.id),
    approvedBy: text("approved_by").references(() => appUsers.id),
    inspectedBy: text("inspected_by").references(() => appUsers.id),

    // Dates
    requestedDate: date("requested_date").defaultNow(),
    approvedDate: date("approved_date"),
    inspectionDate: date("inspection_date"),
    disbursedDate: date("disbursed_date"),

    // Metadata
    notes: text("notes"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Indexes
    loanIdIdx: index("draws_loan_id_idx").on(table.loanId),
    statusIdx: index("draws_status_idx").on(table.status),
    requestedDateIdx: index("draws_requested_date_idx").on(table.requestedDate),
    // Unique constraint: only one draw per number per loan
    uniqueDrawNumber: unique("draws_loan_id_draw_number_unique").on(table.loanId, table.drawNumber),
  })
);

/**
 * Inspection Type Enum
 * - progress: Progress inspection during construction
 * - final: Final inspection upon completion
 * - quality: Quality control inspection
 * - safety: Safety compliance inspection
 * - compliance: General compliance inspection
 * - other: Other type of inspection
 */
export const inspectionTypeEnum = pgEnum("inspection_type_enum", [
  "progress",
  "final",
  "quality",
  "safety",
  "compliance",
  "other",
]);

/**
 * Inspection Status Enum
 * - scheduled: Inspection scheduled but not started
 * - in_progress: Inspection currently in progress
 * - completed: Inspection completed
 * - failed: Inspection failed or could not be completed
 * - cancelled: Inspection was cancelled
 */
export const inspectionStatusEnum = pgEnum("inspection_status_enum", [
  "scheduled",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

/**
 * Inspections Table
 * Tracks construction inspections for draw requests
 */
export const inspections = pgTable(
  "inspections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    drawId: uuid("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" }),

    // Inspection Details
    inspectionType: inspectionTypeEnum("inspection_type").notNull(),
    status: inspectionStatusEnum("status").default("scheduled"),

    // Inspector & Location
    inspectorName: text("inspector_name").notNull(),
    inspectorContact: text("inspector_contact"),
    inspectionLocation: text("inspection_location"), // Property address or specific area

    // Results
    workCompletionPercentage: integer("work_completion_percentage"), // 0-100
    qualityRating: integer("quality_rating"), // 1-5
    safetyCompliant: boolean("safety_compliant").default(true),

    // Findings
    findings: text("findings"),
    recommendations: text("recommendations"),
    photos: text("photos"), // JSONB stored as text - array of photo metadata
    signatures: text("signatures"), // JSONB stored as text - digital signatures

    // Timing
    scheduledDate: date("scheduled_date"),
    completedDate: date("completed_date"),
    inspectionDurationMinutes: integer("inspection_duration_minutes"),

    // Metadata
    weatherConditions: text("weather_conditions"),
    equipmentUsed: text("equipment_used"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    drawIdIdx: index("inspections_draw_id_idx").on(table.drawId),
    statusIdx: index("inspections_status_idx").on(table.status),
    completedDateIdx: index("inspections_completed_date_idx").on(table.completedDate),
  })
);

/**
 * Draw Schedules Table
 * Stores planned draw schedules for construction loans
 */
export const drawSchedules = pgTable(
  "draw_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),

    // Schedule Details
    totalDraws: integer("total_draws").notNull(),
    totalBudget: numeric("total_budget", { precision: 14, scale: 2 }).notNull(),
    scheduleData: text("schedule_data").notNull(), // JSONB stored as text - detailed draw breakdown

    // Status
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: text("created_by").references(() => appUsers.id),
  },
  (table) => ({
    loanIdIdx: index("draw_schedules_loan_id_idx").on(table.loanId),
    isActiveIdx: index("draw_schedules_is_active_idx").on(table.isActive),
  })
);

/**
 * CANONICAL SOURCE for Inspection Type Definitions
 *
 * Import these types from '@/db/schema' or '@/db/schema/draws', NOT from '@/types/inspection' or '@/types/draw'.
 *
 * The database enum and TypeScript types are kept in sync via Drizzle's type inference.
 * This pattern follows the established convention in this codebase (see portal-roles.ts).
 *
 * DO NOT create duplicate enum definitions in other files.
 */
export type InspectionStatus = (typeof inspectionStatusEnum.enumValues)[number];
export type InspectionType = (typeof inspectionTypeEnum.enumValues)[number];
export type DrawStatus = (typeof drawStatusEnum.enumValues)[number];

/**
 * Enum-like constants for backward compatibility with existing code
 * These provide InspectionStatus.SCHEDULED style syntax while using the canonical types
 */
export const InspectionStatusValues = {
  SCHEDULED: "scheduled" as InspectionStatus,
  IN_PROGRESS: "in_progress" as InspectionStatus,
  COMPLETED: "completed" as InspectionStatus,
  FAILED: "failed" as InspectionStatus,
  CANCELLED: "cancelled" as InspectionStatus,
} as const;

export const InspectionTypeValues = {
  PROGRESS: "progress" as InspectionType,
  FINAL: "final" as InspectionType,
  QUALITY: "quality" as InspectionType,
  SAFETY: "safety" as InspectionType,
  COMPLIANCE: "compliance" as InspectionType,
  OTHER: "other" as InspectionType,
} as const;

export const DrawStatusValues = {
  REQUESTED: "requested" as DrawStatus,
  APPROVED: "approved" as DrawStatus,
  INSPECTED: "inspected" as DrawStatus,
  DISBURSED: "disbursed" as DrawStatus,
  REJECTED: "rejected" as DrawStatus,
} as const;
