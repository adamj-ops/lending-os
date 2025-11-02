"use client";

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
import { Textarea } from "@/components/ui/textarea";
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
import { useRecordDistribution } from "@/hooks/useFundDistributions";
import { distributionFormSchema, type DistributionFormValues } from "./distribution-form.schema";
import { cn } from "@/lib/utils";

interface FundDistributionFormProps {
  fundId: string;
  onSuccess?: () => void;
}

export function FundDistributionForm({ fundId, onSuccess }: FundDistributionFormProps) {
  const recordDistribution = useRecordDistribution();

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      distributionDate: new Date(),
      totalAmount: "",
      distributionType: "return_of_capital",
      notes: "",
    },
  });

  const onSubmit = async (data: DistributionFormValues) => {
    try {
      await recordDistribution.mutateAsync({
        fundId,
        distributionDate: data.distributionDate,
        totalAmount: data.totalAmount,
        distributionType: data.distributionType,
        notes: data.notes,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isPending = recordDistribution.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distribution Amount</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="100000" {...field} />
              </FormControl>
              <FormDescription>Total amount to distribute to investors</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distributionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distribution Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select distribution type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="return_of_capital">Return of Capital</SelectItem>
                  <SelectItem value="profit">Profit Distribution</SelectItem>
                  <SelectItem value="interest">Interest Payment</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Classification of the distribution</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distributionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Distribution Date</FormLabel>
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this distribution..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
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
            Record Distribution
          </Button>
        </div>
      </form>
    </Form>
  );
}

