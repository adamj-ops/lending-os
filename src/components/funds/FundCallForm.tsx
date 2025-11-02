"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconCalendar } from "@tabler/icons-react";
import { format, addDays } from "date-fns";
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
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCreateCall } from "@/hooks/useFundCalls";
import { useFundCalls } from "@/hooks/useFundCalls";
import { callFormSchema, type CallFormValues } from "./call-form.schema";
import { cn } from "@/lib/utils";

interface FundCallFormProps {
  fundId: string;
  onSuccess?: () => void;
}

export function FundCallForm({ fundId, onSuccess }: FundCallFormProps) {
  const createCall = useCreateCall();
  const { data: existingCalls } = useFundCalls(fundId);

  // Calculate next call number
  const nextCallNumber = existingCalls && existingCalls.length > 0
    ? Math.max(...existingCalls.map(c => c.callNumber)) + 1
    : 1;

  const form = useForm<CallFormValues>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      callNumber: nextCallNumber,
      callAmount: "",
      dueDate: addDays(new Date(), 30), // Default 30 days from today
      purpose: "",
      notes: "",
    },
  });

  // Update call number when existing calls change
  useEffect(() => {
    if (existingCalls) {
      form.setValue("callNumber", nextCallNumber);
    }
  }, [existingCalls, nextCallNumber, form]);

  const onSubmit = async (data: CallFormValues) => {
    try {
      await createCall.mutateAsync({
        fundId,
        callNumber: data.callNumber,
        callAmount: data.callAmount,
        dueDate: data.dueDate,
        purpose: data.purpose,
        notes: data.notes,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isPending = createCall.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="callNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Number</FormLabel>
                <FormControl>
                  <NumberInput 
                    min={1} 
                    placeholder="1"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Sequential call number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Amount</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="500000" {...field} />
                </FormControl>
                <FormDescription>Total capital to call</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When capital is due from investors</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Loan origination, operational expenses, etc." {...field} />
              </FormControl>
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
                  placeholder="Additional details about this capital call..." 
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
            Issue Capital Call
          </Button>
        </div>
      </form>
    </Form>
  );
}

