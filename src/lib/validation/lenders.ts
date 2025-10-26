import { z } from "zod";

/**
 * Validation schema for creating a lender
 */
export const createLenderSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  entityType: z.enum(["individual", "company", "fund", "ira"]),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  totalCommitted: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === "number") return val.toString();
    return val || "0";
  }),
  totalDeployed: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === "number") return val.toString();
    return val || "0";
  }),
});

/**
 * Validation schema for updating a lender
 */
export const updateLenderSchema = z.object({
  name: z.string().min(1).optional(),
  entityType: z.enum(["individual", "company", "fund", "ira"]).optional(),
  contactEmail: z.string().email("Invalid email address").optional(),
  contactPhone: z.string().optional().nullable(),
  totalCommitted: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === "number") return val.toString();
    return val;
  }),
  totalDeployed: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === "number") return val.toString();
    return val;
  }),
});

export type CreateLenderInput = z.infer<typeof createLenderSchema>;
export type UpdateLenderInput = z.infer<typeof updateLenderSchema>;
