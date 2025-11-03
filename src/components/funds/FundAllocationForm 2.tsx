"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAllocateToLoan } from "@/hooks/useFundAllocations";
import { useLoans } from "@/hooks/useLoans";
import { useFund } from "@/hooks/useFunds";
import { allocationFormSchema, type AllocationFormValues } from "./allocation-form.schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FundAllocationFormProps {
  fundId: string;
  onSuccess?: () => void;
}

export function FundAllocationForm({ fundId, onSuccess }: FundAllocationFormProps) {
  const allocateToLoan = useAllocateToLoan();
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { data: fund } = useFund(fundId);

  // Filter for active loans only
  const activeLoans = loans?.filter((loan: any) => 
    loan.status === "active" || loan.status === "approved" || loan.status === "funded"
  );

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      loanId: "",
      allocatedAmount: "",
      allocationDate: new Date(),
    },
  });

  const onSubmit = async (data: AllocationFormValues) => {
    try {
      // Validate against available capital
      if (fund) {
        const availableCapital = fund.availableCapital;
        const allocationAmount = parseFloat(data.allocatedAmount);

        if (allocationAmount > availableCapital) {
          toast.error(
            `Allocation exceeds available capital. Available: $${availableCapital.toLocaleString()}`
          );
          return;
        }
      }

      await allocateToLoan.mutateAsync({
        fundId,
        loanId: data.loanId,
        allocatedAmount: data.allocatedAmount,
        allocationDate: data.allocationDate,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isPending = allocateToLoan.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fund && (
          <Alert>
            <AlertDescription>
              <strong>Available Capital:</strong> ${fund.availableCapital.toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="loanId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a loan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loansLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading loans...
                    </SelectItem>
                  ) : activeLoans && activeLoans.length > 0 ? (
                    activeLoans.map((loan: any) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        Loan #{loan.id.slice(0, 8)} - ${parseFloat(loan.loanAmount).toLocaleString()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No active loans available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the loan to allocate capital to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allocatedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocation Amount</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="250000" {...field} />
              </FormControl>
              <FormDescription>Amount to allocate from fund to loan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allocationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Allocation Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <IconCalendar size={16} stroke={2} className="ml-auto opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <IconLoader2 size={20} stroke={2} className="mr-2 size-4 animate-spin" />}
            Allocate Capital
          </Button>
        </div>
      </form>
    </Form>
  );
}

