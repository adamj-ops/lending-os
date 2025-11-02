import { z } from "zod";

/**
 * Capital Call Form Validation Schema
 */
export const callFormSchema = z.object({
  callNumber: z.coerce.number().int().min(1, "Call number must be at least 1"),
  callAmount: z.string().min(1, "Call amount is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  purpose: z.string().optional(),
  notes: z.string().optional(),
});

export type CallFormValues = z.infer<typeof callFormSchema>;

