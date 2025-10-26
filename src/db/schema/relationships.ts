import { pgTable, uuid, primaryKey, timestamp, text, boolean, numeric, index } from "drizzle-orm/pg-core";
import { borrowers } from "./borrowers";
import { lenders } from "./lenders";
import { loans } from "./loans";

/**
 * Many-to-many relationship between borrowers and loans
 * A loan can have multiple borrowers, and a borrower can have multiple loans
 * 
 * Hybrid Model:
 * - loans.borrower_id = primary borrower (direct FK for performance)
 * - borrower_loans = all borrowers including primary (with roles)
 */
export const borrowerLoans = pgTable(
  "borrower_loans",
  {
    borrowerId: uuid("borrower_id")
      .notNull()
      .references(() => borrowers.id, { onDelete: "cascade" }),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    // Role in the loan: 'primary' | 'co-borrower' | 'guarantor'
    role: text("role").notNull().default("primary"),
    // Quick flag to identify primary borrower (matches loans.borrower_id)
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.borrowerId, table.loanId] }),
    // Index for finding primary borrower quickly
    isPrimaryIdx: index("borrower_loans_is_primary_idx").on(table.isPrimary),
    // Index for finding all borrowers by loan
    loanIdx: index("borrower_loans_loan_id_idx").on(table.loanId),
  })
);

/**
 * Many-to-many relationship between lenders and loans
 * A loan can have multiple lenders, and a lender can fund multiple loans
 * 
 * Hybrid Model:
 * - loans.lender_id = primary lender (direct FK for performance)
 * - lender_loans = all lenders including primary (with participation %)
 */
export const lenderLoans = pgTable(
  "lender_loans",
  {
    lenderId: uuid("lender_id")
      .notNull()
      .references(() => lenders.id, { onDelete: "cascade" }),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    // Role in the loan: 'primary' | 'participant'
    role: text("role").notNull().default("primary"),
    // Quick flag to identify primary lender (matches loans.lender_id)
    isPrimary: boolean("is_primary").notNull().default(false),
    // Participation percentage (e.g., 25.50 for 25.5%)
    percentage: numeric("percentage", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.lenderId, table.loanId] }),
    // Index for finding primary lender quickly
    isPrimaryIdx: index("lender_loans_is_primary_idx").on(table.isPrimary),
    // Index for finding all lenders by loan
    loanIdx: index("lender_loans_loan_id_idx").on(table.loanId),
  })
);
