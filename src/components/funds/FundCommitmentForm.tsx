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
import { useAddCommitment } from "@/hooks/useFundCommitments";
import { useLenders } from "@/hooks/useLenders";
import { useFund } from "@/hooks/useFunds";
import { commitmentFormSchema, type CommitmentFormValues } from "./commitment-form.schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FundCommitmentFormProps {
  fundId: string;
  onSuccess?: () => void;
}

export function FundCommitmentForm({ fundId, onSuccess }: FundCommitmentFormProps) {
  const addCommitment = useAddCommitment();
  const { data: lenders, isLoading: lendersLoading } = useLenders();
  const { data: fund } = useFund(fundId);

  const form = useForm<CommitmentFormValues>({
    resolver: zodResolver(commitmentFormSchema),
    defaultValues: {
      lenderId: "",
      committedAmount: "",
      commitmentDate: new Date(),
    },
  });

  const onSubmit = async (data: CommitmentFormValues) => {
    try {
      // Validate against fund capacity
      if (fund) {
        const currentCommitted = parseFloat(fund.totalCommitted);
        const newCommitment = parseFloat(data.committedAmount);
        const totalCapacity = parseFloat(fund.totalCapacity);

        if (currentCommitted + newCommitment > totalCapacity) {
          toast.error(
            `Commitment exceeds fund capacity. Available: $${(totalCapacity - currentCommitted).toLocaleString()}`
          );
          return;
        }
      }

      await addCommitment.mutateAsync({
        fundId,
        lenderId: data.lenderId,
        committedAmount: data.committedAmount,
        commitmentDate: data.commitmentDate,
        status: "active",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isPending = addCommitment.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lenderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lender/Investor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lendersLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading lenders...
                    </SelectItem>
                  ) : lenders && lenders.length > 0 ? (
                    lenders.map((lender) => (
                      <SelectItem key={lender.id} value={lender.id}>
                        {lender.name} ({lender.entityType})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No lenders available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the lender making this commitment</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="committedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commitment Amount</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="1000000" {...field} />
              </FormControl>
              <FormDescription>
                {fund && `Available capacity: $${fund.uncommittedCapacity.toLocaleString()}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commitmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Commitment Date</FormLabel>
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
            Add Commitment
          </Button>
        </div>
      </form>
    </Form>
  );
}

