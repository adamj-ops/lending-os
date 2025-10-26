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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCreateBorrower, useUpdateBorrower } from "@/hooks/useBorrowers";
import { BorrowerLoanSelector } from "@/components/borrowers/BorrowerLoanSelector";
import type { Borrower } from "@/types/borrower";

const borrowerFormSchema = z
  .object({
    type: z.enum(["individual", "entity"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(), // For entities
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
    creditScore: z.string().optional(),
  })
  .refine(
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
      message: "Individual borrowers require first and last name; entity borrowers require name",
      path: ["firstName"], // This will show the error on firstName field
    }
  );

type BorrowerFormValues = z.infer<typeof borrowerFormSchema>;

interface BorrowerFormProps {
  borrower?: Borrower;
  onSuccess?: () => void;
}

export function BorrowerForm({ borrower, onSuccess }: BorrowerFormProps) {
  const createBorrower = useCreateBorrower();
  const updateBorrower = useUpdateBorrower();

  const isEditing = !!borrower;

  const form = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerFormSchema),
    defaultValues: {
      type: borrower?.type || "individual",
      firstName: borrower?.firstName || "",
      lastName: borrower?.lastName || "",
      name: borrower?.name || "",
      email: borrower?.email || "",
      phone: borrower?.phone || "",
      address: borrower?.address || "",
      creditScore: borrower?.creditScore?.toString() || "",
    },
  });

  const borrowerType = form.watch("type");

  // Reset form when borrower prop changes
  useEffect(() => {
    if (borrower) {
      form.reset({
        type: borrower.type,
        firstName: borrower.firstName || "",
        lastName: borrower.lastName || "",
        name: borrower.name || "",
        email: borrower.email,
        phone: borrower.phone || "",
        address: borrower.address || "",
        creditScore: borrower.creditScore?.toString() || "",
      });
    }
  }, [borrower, form]);

  const onSubmit = async (data: BorrowerFormValues) => {
    try {
      const payload = {
        type: data.type,
        firstName: data.type === "individual" ? data.firstName : undefined,
        lastName: data.type === "individual" ? data.lastName : undefined,
        name: data.type === "entity" ? data.name : undefined,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        creditScore: data.creditScore ? parseInt(data.creditScore) : undefined,
      };

      if (isEditing) {
        await updateBorrower.mutateAsync({ id: borrower.id, data: payload });
      } else {
        await createBorrower.mutateAsync(payload);
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Form submission error:", error);
    }
  };

  const isPending = createBorrower.isPending || updateBorrower.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Borrower Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select borrower type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="entity">Entity</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose whether this is an individual or business entity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {borrowerType === "individual" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Name</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Company LLC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="borrower@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, City, State, ZIP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creditScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Score (Optional)</FormLabel>
              <FormControl>
                <Input type="number" min="300" max="850" placeholder="720" {...field} />
              </FormControl>
              <FormDescription>Enter a value between 300 and 850</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && borrower?.id && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Loan Associations</h3>
                <p className="text-muted-foreground text-sm">
                  Manage the loans associated with this borrower
                </p>
              </div>
              <BorrowerLoanSelector borrowerId={borrower.id} onSuccess={onSuccess} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? "Update" : "Create"} Borrower
          </Button>
        </div>
      </form>
    </Form>
  );
}
