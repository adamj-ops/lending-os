import { z } from "zod";

/**
 * Validation schema for creating a borrower
 */
export const createBorrowerSchema = z.object({
  type: z.enum(["individual", "entity"]).default("individual"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  name: z.string().min(1, "Name is required").optional(), // For entities
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditScore: z.number().int().min(300).max(850).optional(),
  companyName: z.string().optional(), // Deprecated, kept for backward compatibility
}).refine(
  (data) => {
    // If type is individual, firstName and lastName are required
    if (data.type === "individual") {
      return data.firstName && data.lastName;
    }
    // If type is entity, name is required
    if (data.type === "entity") {
      return data.name;
    }
    return true;
  },
  {
    message: "Individual borrowers require firstName and lastName; entity borrowers require name",
  }
);

/**
 * Validation schema for updating a borrower
 */
export const updateBorrowerSchema = z.object({
  type: z.enum(["individual", "entity"]).optional(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
  name: z.string().min(1).optional().nullable(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  creditScore: z.number().int().min(300).max(850).optional().nullable(),
  companyName: z.string().optional().nullable(),
});

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>;
export type UpdateBorrowerInput = z.infer<typeof updateBorrowerSchema>;
