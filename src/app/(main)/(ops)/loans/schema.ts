/**
 * Loan Domain Validation Schemas
 *
 * Zod schemas for validating loan-related forms and API requests.
 * These schemas ensure data integrity and provide type safety.
 */

import { z } from 'zod';

/**
 * Loan Category Enum
 */
export const loanCategorySchema = z.enum(['asset_backed', 'yield_note', 'hybrid']);

/**
 * Loan Status Enum
 */
export const loanStatusSchema = z.enum([
  'draft',
  'submitted',
  'verification',
  'underwriting',
  'approved',
  'closing',
  'funded',
  'rejected',
]);

/**
 * Payment Type Enum
 */
export const paymentTypeSchema = z.enum(['interest_only', 'amortized']);

/**
 * Payment Frequency Enum
 */
export const paymentFrequencySchema = z.enum(['monthly', 'quarterly', 'maturity']);

/**
 * Create Loan Schema
 *
 * Used for creating new loans via forms or API.
 */
export const createLoanSchema = z.object({
  // Organization (required)
  organizationId: z.string().uuid('Invalid organization ID'),

  // Loan Category
  loanCategory: loanCategorySchema.default('asset_backed'),

  // Related Entities (optional - depends on loan type)
  borrowerId: z.string().uuid('Invalid borrower ID').optional().nullable(),
  lenderId: z.string().uuid('Invalid lender ID').optional().nullable(),
  propertyId: z.string().uuid('Invalid property ID').optional().nullable(),
  propertyAddress: z.string().min(1, 'Property address is required').optional().nullable(),

  // Core Loan Details
  principal: z.number()
    .positive('Principal must be greater than 0')
    .max(100000000, 'Principal cannot exceed $100M'),

  rate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),

  termMonths: z.number()
    .int('Term must be a whole number')
    .min(1, 'Term must be at least 1 month')
    .max(360, 'Term cannot exceed 360 months'),

  // Payment Structure
  paymentType: paymentTypeSchema.default('amortized'),
  paymentFrequency: paymentFrequencySchema.default('monthly'),

  // Fees (in basis points)
  originationFeeBps: z.number().int().min(0).max(10000).default(0),
  lateFeeBps: z.number().int().min(0).max(10000).default(0),
  defaultInterestBps: z.number().int().min(0).max(10000).default(0),

  // Features
  escrowEnabled: z.boolean().default(false),

  // Dates (optional)
  fundedDate: z.date().optional().nullable(),
  maturityDate: z.date().optional().nullable(),

  // Metadata
  createdBy: z.string().uuid().optional().nullable(),
});

/**
 * Update Loan Schema
 *
 * Partial update - all fields optional.
 */
export const updateLoanSchema = createLoanSchema.partial();

/**
 * Loan Status Transition Schema
 *
 * Used for changing loan status with validation.
 */
export const transitionLoanStatusSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  newStatus: loanStatusSchema,
  reason: z.string().min(1).max(500).optional(),
  userId: z.string().uuid().optional(),
});

/**
 * Fund Loan Schema
 *
 * Specific validation for funding a loan.
 */
export const fundLoanSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  fundedAmount: z.number().positive('Funded amount must be greater than 0'),
  fundedDate: z.date().default(() => new Date()),
  fundedBy: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Loan Terms Schema
 *
 * Extended loan terms configuration.
 */
export const loanTermsSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  amortizationMonths: z.number().int().min(1).optional().nullable(),
  compounding: z.enum(['simple', 'compound']).default('simple'),
  notes: z.string().max(2000).optional().nullable(),
});

/**
 * Collateral Schema
 *
 * Collateral information for asset-backed loans.
 */
export const collateralSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  lienPosition: z.enum(['1st', '2nd', 'subordinate']),
  description: z.string().min(1).max(1000),
  drawSchedule: z.array(z.object({
    n: z.number().int().min(1),
    amount: z.number().positive(),
    note: z.string().max(200).optional(),
  })).optional(),
});

/**
 * Loan Search/Filter Schema
 *
 * Used for filtering loan lists.
 */
export const loanFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  status: loanStatusSchema.optional(),
  loanCategory: loanCategorySchema.optional(),
  borrowerId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  minPrincipal: z.number().positive().optional(),
  maxPrincipal: z.number().positive().optional(),
  minRate: z.number().min(0).max(100).optional(),
  maxRate: z.number().min(0).max(100).optional(),
  fundedAfter: z.date().optional(),
  fundedBefore: z.date().optional(),
  search: z.string().max(100).optional(), // For text search
});

/**
 * Borrower Relationship Schema
 *
 * For managing borrower-loan relationships.
 */
export const borrowerLoanSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  borrowerId: z.string().uuid('Invalid borrower ID'),
  role: z.enum(['primary', 'co-borrower', 'guarantor']),
  isPrimary: z.boolean().default(false),
});

/**
 * Lender Relationship Schema
 *
 * For managing lender-loan relationships (syndication).
 */
export const lenderLoanSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  lenderId: z.string().uuid('Invalid lender ID'),
  role: z.enum(['primary', 'participant', 'servicer']),
  isPrimary: z.boolean().default(false),
  percentage: z.number().min(0).max(100).default(100),
});

// ============================================
// TypeScript Type Exports
// ============================================

export type LoanCategory = z.infer<typeof loanCategorySchema>;
export type LoanStatus = z.infer<typeof loanStatusSchema>;
export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type PaymentFrequency = z.infer<typeof paymentFrequencySchema>;

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type TransitionLoanStatusInput = z.infer<typeof transitionLoanStatusSchema>;
export type FundLoanInput = z.infer<typeof fundLoanSchema>;
export type LoanTermsInput = z.infer<typeof loanTermsSchema>;
export type CollateralInput = z.infer<typeof collateralSchema>;
export type LoanFilterInput = z.infer<typeof loanFilterSchema>;
export type BorrowerLoanInput = z.infer<typeof borrowerLoanSchema>;
export type LenderLoanInput = z.infer<typeof lenderLoanSchema>;
