import { z } from "zod";

/**
 * Compliance Validation Schemas
 * 
 * Zod schemas for validating compliance-related API requests.
 */

// Filing status enum
export const filingStatusEnum = z.enum(["pending", "submitted", "accepted", "rejected"]);

// License status enum
export const licenseStatusEnum = z.enum(["active", "expired", "pending", "revoked"]);

/**
 * Filing Schemas
 */

export const createFilingSchema = z.object({
  filingType: z.string().min(1, "Filing type is required"),
  filingName: z.string().min(1, "Filing name is required"),
  dueDate: z.coerce.date(),
  description: z.string().optional(),
  documentId: z.string().uuid().optional(),
});

export const updateFilingSchema = z.object({
  filingType: z.string().min(1).optional(),
  filingName: z.string().min(1).optional(),
  dueDate: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  status: filingStatusEnum.optional(),
  documentId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const submitFilingSchema = z.object({
  submittedDate: z.coerce.date(),
  filingNumber: z.string().optional(),
});

export const filingFilterSchema = z.object({
  status: filingStatusEnum.optional(),
  dueDateStart: z.coerce.date().optional(),
  dueDateEnd: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * License Schemas
 */

export const trackLicenseSchema = z.object({
  licenseType: z.string().min(1, "License type is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.coerce.date(),
  expirationDate: z.coerce.date(),
  notes: z.string().optional(),
}).refine(
  (data) => data.expirationDate > data.issueDate,
  {
    message: "Expiration date must be after issue date",
    path: ["expirationDate"],
  }
);

export const updateLicenseSchema = z.object({
  licenseType: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  issuer: z.string().min(1).optional(),
  issueDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  status: licenseStatusEnum.optional(),
  notes: z.string().optional().nullable(),
});

export const licenseFilterSchema = z.object({
  status: licenseStatusEnum.optional(),
  expirationDateStart: z.coerce.date().optional(),
  expirationDateEnd: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Audit Log Schemas
 */

export const auditLogFilterSchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Type exports
 */

export type CreateFilingInput = z.infer<typeof createFilingSchema>;
export type UpdateFilingInput = z.infer<typeof updateFilingSchema>;
export type SubmitFilingInput = z.infer<typeof submitFilingSchema>;
export type FilingFilterInput = z.infer<typeof filingFilterSchema>;

export type TrackLicenseInput = z.infer<typeof trackLicenseSchema>;
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>;
export type LicenseFilterInput = z.infer<typeof licenseFilterSchema>;

export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;

