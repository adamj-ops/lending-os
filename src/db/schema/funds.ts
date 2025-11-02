import { pgTable, text, timestamp, uuid, numeric, pgEnum, index, integer } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { lenders } from "./lenders";

/**
 * Fund Domain Schema
 * 
 * Manages investor funds, capital commitments, calls, distributions, and loan allocations.
 * Lenders can act as both direct loan participants AND fund investors.
 */

// Fund Type Enum
export const fundTypeEnum = pgEnum("fund_type", [
  "private",      // Private fund with limited investors
  "syndicated",   // Syndicated fund with multiple institutional investors
  "institutional" // Institutional fund managed by a financial institution
]);

// Fund Status Enum
export const fundStatusEnum = pgEnum("fund_status", [
  "active",      // Accepting commitments and deploying capital
  "closed",      // No longer accepting new commitments
  "liquidated"   // Fully liquidated and closed
]);

// Commitment Status Enum
export const commitmentStatusEnum = pgEnum("commitment_status", [
  "pending",    // Commitment made but not yet active
  "active",     // Commitment is active and capital can be called
  "fulfilled",  // Commitment fully called and returned
  "cancelled"   // Commitment cancelled before fulfillment
]);

// Capital Call Status Enum
export const capitalCallStatusEnum = pgEnum("capital_call_status", [
  "pending",   // Call created but not yet sent
  "sent",      // Call sent to investors
  "funded",    // Call fully funded by investors
  "overdue"    // Call past due date and not fully funded
]);

// Distribution Type Enum
export const distributionTypeEnum = pgEnum("distribution_type", [
  "return_of_capital", // Return of original capital
  "profit",            // Profit distribution
  "interest"           // Interest payment
]);

// Distribution Status Enum
export const distributionStatusEnum = pgEnum("distribution_status", [
  "scheduled",  // Distribution scheduled but not yet processed
  "processed",  // Distribution completed
  "cancelled"   // Distribution cancelled
]);

/**
 * Funds Table
 * 
 * Core fund entity representing investment vehicles
 */
export const funds = pgTable("funds", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  
  // Basic Information
  name: text("name").notNull(),
  fundType: fundTypeEnum("fund_type").notNull(),
  status: fundStatusEnum("status").notNull().default("active"),
  
  // Financial Tracking
  totalCapacity: numeric("total_capacity", { precision: 15, scale: 2 }).notNull(), // Max fund size
  totalCommitted: numeric("total_committed", { precision: 15, scale: 2 }).notNull().default("0"),
  totalDeployed: numeric("total_deployed", { precision: 15, scale: 2 }).notNull().default("0"),
  totalReturned: numeric("total_returned", { precision: 15, scale: 2 }).notNull().default("0"),
  
  // Dates
  inceptionDate: timestamp("inception_date", { withTimezone: true }).notNull(),
  closingDate: timestamp("closing_date", { withTimezone: true }), // Date fund closed to new commitments
  liquidationDate: timestamp("liquidation_date", { withTimezone: true }), // Date fund fully liquidated
  
  // Metadata
  strategy: text("strategy"), // Investment strategy description
  targetReturn: numeric("target_return", { precision: 5, scale: 2 }), // Target return percentage
  managementFeeBps: integer("management_fee_bps").notNull().default(0), // Management fee in basis points
  performanceFeeBps: integer("performance_fee_bps").notNull().default(0), // Performance fee in basis points
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdx: index("funds_organization_id_idx").on(table.organizationId),
  statusIdx: index("funds_status_idx").on(table.status),
  fundTypeIdx: index("funds_fund_type_idx").on(table.fundType),
}));

/**
 * Fund Commitments Table
 * 
 * Tracks investor capital commitments to funds.
 * Lenders act as investors when committing capital to a fund.
 */
export const fundCommitments = pgTable("fund_commitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id, { onDelete: "cascade" }),
  lenderId: uuid("lender_id")
    .notNull()
    .references(() => lenders.id, { onDelete: "cascade" }),
  
  // Capital Tracking
  committedAmount: numeric("committed_amount", { precision: 15, scale: 2 }).notNull(),
  calledAmount: numeric("called_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  returnedAmount: numeric("returned_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  
  // Status and Dates
  status: commitmentStatusEnum("status").notNull().default("pending"),
  commitmentDate: timestamp("commitment_date", { withTimezone: true }).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  fundIdx: index("fund_commitments_fund_id_idx").on(table.fundId),
  lenderIdx: index("fund_commitments_lender_id_idx").on(table.lenderId),
  statusIdx: index("fund_commitments_status_idx").on(table.status),
  fundStatusIdx: index("fund_commitments_fund_status_idx").on(table.fundId, table.status),
}));

/**
 * Fund Calls Table
 * 
 * Tracks capital call events when fund managers request capital from investors
 */
export const fundCalls = pgTable("fund_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id, { onDelete: "cascade" }),
  
  // Call Information
  callNumber: integer("call_number").notNull(), // Sequential call number for this fund
  callAmount: numeric("call_amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  
  // Status and Purpose
  status: capitalCallStatusEnum("status").notNull().default("pending"),
  purpose: text("purpose"), // Purpose of the capital call
  notes: text("notes"), // Additional notes
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  fundIdx: index("fund_calls_fund_id_idx").on(table.fundId),
  statusIdx: index("fund_calls_status_idx").on(table.status),
  dueDateIdx: index("fund_calls_due_date_idx").on(table.dueDate),
  fundStatusIdx: index("fund_calls_fund_status_idx").on(table.fundId, table.status),
}));

/**
 * Fund Distributions Table
 * 
 * Tracks distributions (returns) from fund to investors
 */
export const fundDistributions = pgTable("fund_distributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id, { onDelete: "cascade" }),
  
  // Distribution Information
  distributionDate: timestamp("distribution_date", { withTimezone: true }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  distributionType: distributionTypeEnum("distribution_type").notNull(),
  
  // Status and Metadata
  status: distributionStatusEnum("status").notNull().default("scheduled"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  fundIdx: index("fund_distributions_fund_id_idx").on(table.fundId),
  statusIdx: index("fund_distributions_status_idx").on(table.status),
  distributionDateIdx: index("fund_distributions_date_idx").on(table.distributionDate),
  fundTypeIdx: index("fund_distributions_fund_type_idx").on(table.fundId, table.distributionType),
}));

/**
 * Fund Loan Allocations Table
 * 
 * Tracks capital allocated from funds to specific loans
 */
export const fundLoanAllocations = pgTable("fund_loan_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id, { onDelete: "cascade" }),
  loanId: uuid("loan_id").notNull(), // Reference to loans table (imported separately to avoid circular deps)
  
  // Allocation Tracking
  allocatedAmount: numeric("allocated_amount", { precision: 15, scale: 2 }).notNull(),
  returnedAmount: numeric("returned_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  
  // Dates
  allocationDate: timestamp("allocation_date", { withTimezone: true }).notNull(),
  fullReturnDate: timestamp("full_return_date", { withTimezone: true }), // Date when fully returned
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  fundIdx: index("fund_loan_allocations_fund_id_idx").on(table.fundId),
  loanIdx: index("fund_loan_allocations_loan_id_idx").on(table.loanId),
  fundLoanIdx: index("fund_loan_allocations_fund_loan_idx").on(table.fundId, table.loanId),
}));
