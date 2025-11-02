import { z } from "zod";

/**
 * Fund Form Validation Schema
 * 
 * Mirrors src/components/lenders/LenderForm.tsx lines 31-38 pattern
 */
export const fundFormSchema = z.object({
  name: z.string().min(1, "Fund name is required"),
  fundType: z.enum(["private", "syndicated", "institutional"], {
    required_error: "Please select a fund type",
  }),
  totalCapacity: z.string().min(1, "Total capacity is required"),
  inceptionDate: z.date({
    required_error: "Inception date is required",
  }),
  strategy: z.string().optional(),
  targetReturn: z.string().optional(),
  managementFeeBps: z.coerce.number().min(0).max(10000).optional(),
  performanceFeeBps: z.coerce.number().min(0).max(10000).optional(),
});

export type FundFormValues = z.infer<typeof fundFormSchema>;

