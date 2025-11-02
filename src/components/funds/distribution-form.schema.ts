import { z } from "zod";

/**
 * Fund Distribution Form Validation Schema
 */
export const distributionFormSchema = z.object({
  distributionDate: z.date({
    required_error: "Distribution date is required",
  }),
  totalAmount: z.string().min(1, "Distribution amount is required"),
  distributionType: z.enum(["return_of_capital", "profit", "interest"], {
    required_error: "Please select a distribution type",
  }),
  notes: z.string().optional(),
});

export type DistributionFormValues = z.infer<typeof distributionFormSchema>;

