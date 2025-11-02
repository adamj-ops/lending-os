/**
 * Draw Domain Validation Schemas
 *
 * Zod schemas for validating draw-related forms and API requests.
 */

import { z } from 'zod';

/**
 * Draw Status Enum
 */
export const drawStatusSchema = z.enum([
  'draft',
  'submitted',
  'under_review',
  'inspection_scheduled',
  'inspection_complete',
  'approved',
  'rejected',
  'disbursed',
  'cancelled',
]);

/**
 * Draw Type Enum
 */
export const drawTypeSchema = z.enum([
  'initial',
  'progress',
  'final',
  'contingency',
]);

/**
 * Inspection Status Enum
 */
export const inspectionStatusSchema = z.enum([
  'not_required',
  'scheduled',
  'in_progress',
  'completed',
  'failed',
]);

/**
 * Request Draw Schema (Base)
 *
 * Base schema without refinement for reuse
 */
const requestDrawSchemaBase = z.object({
  // Loan Reference
  loanId: z.string().uuid('Invalid loan ID'),

  // Draw Details
  drawType: drawTypeSchema.default('progress'),
  amount: z.number()
    .positive('Draw amount must be greater than 0')
    .max(100000000, 'Draw amount cannot exceed $100M'),

  // Work Description
  workDescription: z.string()
    .min(20, 'Work description must be at least 20 characters')
    .max(2000, 'Work description cannot exceed 2000 characters'),

  // Budget Line Items (from draw schedule)
  budgetLineItems: z.array(z.object({
    lineItemId: z.string().uuid().optional(),
    description: z.string().max(200),
    budgetedAmount: z.number().positive(),
    requestedAmount: z.number().positive(),
    previousDraws: z.number().min(0).default(0),
  })).min(1, 'At least one budget line item is required'),

  // Contractor Information
  contractorName: z.string().max(200).optional().nullable(),
  contractorLicense: z.string().max(100).optional().nullable(),
  contractorPhone: z.string().max(20).optional().nullable(),
  contractorEmail: z.string().email().optional().nullable(),

  // Work Details
  workStartDate: z.date().optional().nullable(),
  workCompletionDate: z.date().optional().nullable(),
  percentComplete: z.number().min(0).max(100).default(0),

  // Inspection
  inspectionRequired: z.boolean().default(true),
  inspectionDate: z.date().optional().nullable(),
  inspectionNotes: z.string().max(1000).optional().nullable(),

  // Supporting Documents
  documentUrls: z.array(z.string().url()).max(20).default([]),

  // Metadata
  requestedBy: z.string().uuid().optional().nullable(),
  requestedDate: z.date().default(() => new Date()),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Request Draw Schema
 *
 * Used for creating a new draw request.
 */
export const requestDrawSchema = requestDrawSchemaBase.refine(
  (data) => {
    // Total requested across line items should equal draw amount
    const totalRequested = data.budgetLineItems.reduce((sum, item) => sum + item.requestedAmount, 0);
    return Math.abs(totalRequested - data.amount) < 0.01; // Allow for rounding
  },
  {
    message: 'Total line item amounts must equal draw amount',
    path: ['amount'],
  }
);

/**
 * Update Draw Schema
 *
 * Partial update for existing draws.
 */
export const updateDrawSchema = requestDrawSchemaBase.partial().extend({
  drawId: z.string().uuid('Invalid draw ID'),
});

/**
 * Approve Draw Schema
 *
 * Approve a draw request.
 */
export const approveDrawSchema = z.object({
  drawId: z.string().uuid('Invalid draw ID'),
  approvedAmount: z.number().positive('Approved amount must be greater than 0'),
  approvedBy: z.string().uuid('Approver ID is required'),
  approvalDate: z.date().default(() => new Date()),
  approvalNotes: z.string().max(1000).optional().nullable(),
  conditions: z.array(z.string().max(500)).max(10).default([]),
});

/**
 * Reject Draw Schema
 *
 * Reject a draw request.
 */
export const rejectDrawSchema = z.object({
  drawId: z.string().uuid('Invalid draw ID'),
  rejectedBy: z.string().uuid('Rejector ID is required'),
  rejectionDate: z.date().default(() => new Date()),
  rejectionReason: z.string()
    .min(20, 'Rejection reason must be at least 20 characters')
    .max(1000, 'Rejection reason cannot exceed 1000 characters'),
  allowResubmission: z.boolean().default(true),
});

/**
 * Disburse Draw Schema
 *
 * Mark an approved draw as disbursed.
 */
export const disburseDrawSchema = z.object({
  drawId: z.string().uuid('Invalid draw ID'),
  disbursedAmount: z.number().positive('Disbursed amount must be greater than 0'),
  disbursedDate: z.date().default(() => new Date()),
  disbursedBy: z.string().uuid().optional().nullable(),

  // Disbursement Details
  disbursementMethod: z.enum(['wire', 'ach', 'check']),
  transactionReference: z.string().max(100).optional().nullable(),
  bankReference: z.string().max(100).optional().nullable(),
  checkNumber: z.string().max(50).optional().nullable(),

  // Recipient
  recipientName: z.string().max(200),
  recipientAccount: z.string().max(100).optional().nullable(),

  // Metadata
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Schedule Inspection Schema
 *
 * Schedule an inspection for a draw.
 */
export const scheduleInspectionSchema = z.object({
  drawId: z.string().uuid('Invalid draw ID'),
  inspectionDate: z.date(),
  inspectorId: z.string().uuid().optional().nullable(),
  inspectorName: z.string().max(200),
  inspectorPhone: z.string().max(20).optional().nullable(),
  inspectorEmail: z.string().email().optional().nullable(),
  scheduledBy: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Complete Inspection Schema
 *
 * Record inspection results.
 */
export const completeInspectionSchema = z.object({
  drawId: z.string().uuid('Invalid draw ID'),
  inspectionDate: z.date().default(() => new Date()),
  inspectorId: z.string().uuid().optional().nullable(),

  // Inspection Results
  passed: z.boolean(),
  percentComplete: z.number().min(0).max(100),
  findings: z.string().max(2000),

  // Photos/Documents
  photoUrls: z.array(z.string().url()).max(50).default([]),
  reportUrl: z.string().url().optional().nullable(),

  // Recommendations
  recommendedDrawAmount: z.number().min(0).optional().nullable(),
  deficiencies: z.array(z.object({
    description: z.string().max(500),
    severity: z.enum(['minor', 'major', 'critical']),
    mustFixBeforeDisbursement: z.boolean().default(false),
  })).default([]),

  // Metadata
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Create Draw Schedule Schema
 *
 * Define the draw schedule for a construction loan.
 */
export const createDrawScheduleSchema = z.object({
  loanId: z.string().uuid('Invalid loan ID'),
  totalBudget: z.number().positive('Total budget must be greater than 0'),

  // Schedule Items
  scheduleItems: z.array(z.object({
    drawNumber: z.number().int().min(1),
    description: z.string().max(200),
    budgetedAmount: z.number().positive(),
    percentOfTotal: z.number().min(0).max(100),
    inspectionRequired: z.boolean().default(true),
    milestone: z.string().max(100).optional(),
  })).min(1),

  // Configuration
  autoNumbering: z.boolean().default(true),
  allowOverdraw: z.boolean().default(false),
  maxOverdrawPercent: z.number().min(0).max(20).default(0),

  // Metadata
  createdBy: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => {
    // Schedule items must sum to total budget
    const totalScheduled = data.scheduleItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
    return Math.abs(totalScheduled - data.totalBudget) < 0.01;
  },
  {
    message: 'Schedule items must sum to total budget',
    path: ['totalBudget'],
  }
);

/**
 * Update Draw Schedule Schema
 *
 * Modify an existing draw schedule.
 */
export const updateDrawScheduleSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule ID'),
  scheduleItems: z.array(z.object({
    drawNumber: z.number().int().min(1),
    description: z.string().max(200),
    budgetedAmount: z.number().positive(),
    percentOfTotal: z.number().min(0).max(100),
    inspectionRequired: z.boolean().default(true),
    milestone: z.string().max(100).optional(),
  })).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Draw Filter Schema
 *
 * For filtering draw lists.
 */
export const drawFilterSchema = z.object({
  loanId: z.string().uuid().optional(),
  status: drawStatusSchema.optional(),
  drawType: drawTypeSchema.optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  requestedDateFrom: z.date().optional(),
  requestedDateTo: z.date().optional(),
  inspectionStatus: inspectionStatusSchema.optional(),
  search: z.string().max(100).optional(),
});

/**
 * Draw Analytics Schema
 *
 * For querying draw analytics and reports.
 */
export const drawAnalyticsSchema = z.object({
  loanId: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  groupBy: z.enum(['month', 'quarter', 'year', 'status', 'type']).default('month'),
});

// ============================================
// TypeScript Type Exports
// ============================================

export type DrawStatus = z.infer<typeof drawStatusSchema>;
export type DrawType = z.infer<typeof drawTypeSchema>;
export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;

export type RequestDrawInput = z.infer<typeof requestDrawSchema>;
export type UpdateDrawInput = z.infer<typeof updateDrawSchema>;
export type ApproveDrawInput = z.infer<typeof approveDrawSchema>;
export type RejectDrawInput = z.infer<typeof rejectDrawSchema>;
export type DisburseDrawInput = z.infer<typeof disburseDrawSchema>;
export type ScheduleInspectionInput = z.infer<typeof scheduleInspectionSchema>;
export type CompleteInspectionInput = z.infer<typeof completeInspectionSchema>;
export type CreateDrawScheduleInput = z.infer<typeof createDrawScheduleSchema>;
export type UpdateDrawScheduleInput = z.infer<typeof updateDrawScheduleSchema>;
export type DrawFilterInput = z.infer<typeof drawFilterSchema>;
export type DrawAnalyticsInput = z.infer<typeof drawAnalyticsSchema>;
