"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCreateLender, useUpdateLender } from "@/hooks/useLenders";
import { LenderLoanSelector } from "@/components/lenders/LenderLoanSelector";
import type { Lender } from "@/types/lender";

const lenderFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  entityType: z.enum(["individual", "company", "fund", "ira"]),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  totalCommitted: z.string().optional(),
  totalDeployed: z.string().optional(),
});

type LenderFormValues = z.infer<typeof lenderFormSchema>;

interface LenderFormProps {
  lender?: Lender;
  onSuccess?: () => void;
}

export function LenderForm({ lender, onSuccess }: LenderFormProps) {
  const createLender = useCreateLender();
  const updateLender = useUpdateLender();

  const isEditing = !!lender;

  const form = useForm<LenderFormValues>({
    resolver: zodResolver(lenderFormSchema),
    defaultValues: {
      name: lender?.name || "",
      entityType: lender?.entityType || "company",
      contactEmail: lender?.contactEmail || "",
      contactPhone: lender?.contactPhone || "",
      totalCommitted: lender?.totalCommitted || "0",
      totalDeployed: lender?.totalDeployed || "0",
    },
  });

  // Reset form when lender prop changes
  useEffect(() => {
    if (lender) {
      form.reset({
        name: lender.name,
        entityType: lender.entityType,
        contactEmail: lender.contactEmail,
        contactPhone: lender.contactPhone || "",
        totalCommitted: lender.totalCommitted,
        totalDeployed: lender.totalDeployed,
      });
    }
  }, [lender, form]);

  const onSubmit = async (data: LenderFormValues) => {
    try {
      const payload = {
        name: data.name,
        entityType: data.entityType,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || undefined,
        totalCommitted: data.totalCommitted || "0",
        totalDeployed: data.totalDeployed || "0",
      };

      if (isEditing) {
        await updateLender.mutateAsync({ id: lender.id, data: payload });
      } else {
        await createLender.mutateAsync(payload);
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Form submission error:", error);
    }
  };

  const isPending = createLender.isPending || updateLender.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lender Name</FormLabel>
              <FormControl>
                <Input placeholder="ABC Capital Partners" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="ira">IRA</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Type of lending entity</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@lender.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalCommitted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Committed (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Total capital committed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalDeployed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Deployed (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Capital currently deployed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && lender?.id && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Loan Associations</h3>
                <p className="text-muted-foreground text-sm">
                  Manage the loans funded by this lender
                </p>
              </div>
              <LenderLoanSelector lenderId={lender.id} onSuccess={onSuccess} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? "Update" : "Create"} Lender
          </Button>
        </div>
      </form>
    </Form>
  );
}
