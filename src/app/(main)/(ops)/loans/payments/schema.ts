/**
 * Payment Domain Validation Schemas
 *
 * Zod schemas for validating payment-related forms and API requests.
 */

import { z } from 'zod';

/**
 * Payment Method Enum
 */
export const paymentMethodSchema = z.enum(['wire', 'ach', 'check', 'cash', 'other']);

/**
 * Payment Status Enum
 */
export const paymentStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled']);

/**
 * Payment Type Enum
 */
export const paymentTypeEnumSchema = z.enum(['principal', 'interest', 'fee', 'combined']);

/**
 * Schedule Type Enum
 */
export const scheduleTypeSchema = z.enum(['amortized', 'interest_only', 'balloon']);

/**
 * Record Payment Schema (Base)
 *
 * Base schema without refinement for reuse
 */
const recordPaymentSchemaBase = z.object({
  // Loan Reference
  loanId: z.string().uuid('Invalid loan ID'),

  // Payment Details
  paymentType: paymentTypeEnumSchema,
  amount: z.number()
    .positive('Payment amount must be greater than 0')
    .max(100000000, 'Payment amount cannot exceed $100M'),

  // Amount Breakdown
  principalAmount: z.number().min(0).default(0),
  interestAmount: z.number().min(0).default(0),
  feeAmount: z.number().min(0).default(0),

  // Payment Method
  paymentMethod: paymentMethodSchema,
  status: paymentStatusSchema.default('pending'),

  // Transaction Details
  transactionReference: z.string().max(100).optional().nullable(),
  bankReference: z.string().max(100).optional().nullable(),
  checkNumber: z.string().max(50).optional().nullable(),

  // Dates
  paymentDate: z.date(),
  receivedDate: z.date().optional().nullable(),

  // Metadata
  notes: z.string().max(1000).optional().nullable(),
  createdBy: z.string().uuid().optional().nullable(),
});

/**
 * Record Payment Schema
 *
 * Used for recording a new payment against a loan.
 */
export const recordPaymentSchema = recordPaymentSchemaBase.refine(
  (data) => {
    // For 'combined' type, breakdown should sum to total amount
    if (data.paymentType === 'combined') {
      const breakdown = data.principalAmount + data.interestAmount + data.feeAmount;
      return Math.abs(breakdown - data.amount) < 0.01; // Allow for rounding
    }
    return true;
  },
  {
    message: 'Payment breakdown must equal total amount for combined payments',
    path: ['amount'],
  }
);

/**
 * Update Payment Schema
 *
 * Partial update for existing payments.
 */
export const updatePaymentSchema = recordPaymentSchemaBase.partial().extend({
  paymentId: z.string().uuid('Invalid payment ID'),
});

/**
 * Process Payment Schema
 *
 * Mark a pending payment as completed.
 */
export const processPaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  processedDate: z.date().default(() => new Date()),
  transactionReference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Reverse Payment Schema
 *
 * Reverse a completed payment.
 */
export const reversePaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  reversedBy: z.string().uuid().optional(),
});

/**
 * Create Payment Schedule Schema
 *
 * Generate a payment schedule for a loan.
 */
export const createPaymentScheduleSchema = z.object({
  // Loan Reference
  loanId: z.string().uuid('Invalid loan ID'),

  // Schedule Configuration
  scheduleType: scheduleTypeSchema,
  paymentFrequency: z.enum(['monthly', 'quarterly', 'maturity']),

  // Schedule Details
  totalPayments: z.number().int().min(1).max(360),
  paymentAmount: z.number().positive(),

  // Schedule Data (JSONB)
  scheduleData: z.string(), // JSON stringified payment schedule

  // Status
  isActive: z.boolean().default(true),

  // Metadata
  generatedBy: z.string().uuid().optional().nullable(),
});

/**
 * Update Payment Schedule Schema
 *
 * Modify an existing payment schedule.
 */
export const updatePaymentScheduleSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule ID'),
  scheduleData: z.string().optional(), // Updated schedule JSON
  isActive: z.boolean().optional(),
});

/**
 * Payment Schedule Calculation Input
 *
 * Input for calculating a payment schedule (before saving).
 */
export const calculateScheduleSchema = z.object({
  principal: z.number().positive('Principal must be greater than 0'),
  annualRate: z.number().min(0).max(100, 'Rate must be between 0 and 100'),
  termMonths: z.number().int().min(1).max(360),
  scheduleType: scheduleTypeSchema,
  paymentFrequency: z.enum(['monthly', 'quarterly', 'maturity']),
  startDate: z.date().default(() => new Date()),
});

/**
 * Payment Filter Schema
 *
 * For filtering payment lists.
 */
export const paymentFilterSchema = z.object({
  loanId: z.string().uuid().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  status: paymentStatusSchema.optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  paymentDateFrom: z.date().optional(),
  paymentDateTo: z.date().optional(),
  search: z.string().max(100).optional(),
});

/**
 * Bulk Payment Import Schema
 *
 * For importing multiple payments at once (e.g., from CSV).
 */
export const bulkPaymentImportSchema = z.object({
  payments: z.array(recordPaymentSchemaBase).min(1).max(1000),
  validateOnly: z.boolean().default(false), // Dry run mode
});

/**
 * Payment Reconciliation Schema
 *
 * For reconciling payments with bank statements.
 */
export const paymentReconciliationSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  bankStatementDate: z.date(),
  bankStatementAmount: z.number(),
  isReconciled: z.boolean().default(true),
  reconciledBy: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Payment Allocation Schema
 *
 * For allocating a payment across multiple loans (syndication).
 */
export const paymentAllocationSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  allocations: z.array(z.object({
    loanId: z.string().uuid(),
    amount: z.number().positive(),
    principalAmount: z.number().min(0).default(0),
    interestAmount: z.number().min(0).default(0),
  })).min(1),
}).refine(
  (data) => {
    // Total allocation must not exceed payment amount
    const totalAllocation = data.allocations.reduce((sum, a) => sum + a.amount, 0);
    return totalAllocation > 0;
  },
  {
    message: 'Payment must be allocated to at least one loan',
  }
);

// ============================================
// TypeScript Type Exports
// ============================================

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentTypeEnum = z.infer<typeof paymentTypeEnumSchema>;
export type ScheduleType = z.infer<typeof scheduleTypeSchema>;

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type ReversePaymentInput = z.infer<typeof reversePaymentSchema>;
export type CreatePaymentScheduleInput = z.infer<typeof createPaymentScheduleSchema>;
export type UpdatePaymentScheduleInput = z.infer<typeof updatePaymentScheduleSchema>;
export type CalculateScheduleInput = z.infer<typeof calculateScheduleSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type BulkPaymentImportInput = z.infer<typeof bulkPaymentImportSchema>;
export type PaymentReconciliationInput = z.infer<typeof paymentReconciliationSchema>;
export type PaymentAllocationInput = z.infer<typeof paymentAllocationSchema>;
