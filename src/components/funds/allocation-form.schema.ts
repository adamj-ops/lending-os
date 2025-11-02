import { z } from "zod";

/**
 * Fund Allocation Form Validation Schema
 */
export const allocationFormSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
  allocatedAmount: z.string().min(1, "Allocation amount is required"),
  allocationDate: z.date({
    required_error: "Allocation date is required",
  }),
});

export type AllocationFormValues = z.infer<typeof allocationFormSchema>;

