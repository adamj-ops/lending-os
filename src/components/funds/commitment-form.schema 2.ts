import { z } from "zod";

/**
 * Fund Commitment Form Validation Schema
 */
export const commitmentFormSchema = z.object({
  lenderId: z.string().uuid("Invalid lender ID"),
  committedAmount: z.string().min(1, "Commitment amount is required"),
  commitmentDate: z.date({
    required_error: "Commitment date is required",
  }),
});

export type CommitmentFormValues = z.infer<typeof commitmentFormSchema>;

