"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { recordPaymentSchema, type RecordPaymentInput } from "../schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PaymentEntryFormProps {
  loanId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentEntryForm({
  loanId,
  onSuccess,
  onCancel,
}: PaymentEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      loanId,
      paymentType: "combined",
      amount: 0,
      principalAmount: 0,
      interestAmount: 0,
      feeAmount: 0,
      paymentMethod: "ach",
      paymentDate: new Date(),
      notes: "",
    },
  });

  const paymentType = form.watch("paymentType");
  const amount = form.watch("amount");
  const principalAmount = form.watch("principalAmount");
  const interestAmount = form.watch("interestAmount");
  const feeAmount = form.watch("feeAmount");

  // Auto-calculate breakdown validation
  const breakdownSum = principalAmount + interestAmount + feeAmount;
  const breakdownValid = Math.abs(breakdownSum - amount) < 0.01;

  const onSubmit = async (data: RecordPaymentInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v2/loans/${loanId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to record payment");
      }

      toast.success("Payment recorded successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Payment recording error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to record payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment Type */}
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="combined">Combined (P+I)</SelectItem>
                  <SelectItem value="principal_only">Principal Only</SelectItem>
                  <SelectItem value="interest_only">Interest Only</SelectItem>
                  <SelectItem value="fee">Fee Payment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Payment Amount</FormLabel>
              <FormControl>
                <NumberInput
                  prefix="$"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="0.00"
                  value={field.value}
                  onValueChange={field.onChange}
                  min={0}
                  max={100000000}
                />
              </FormControl>
              <FormDescription>
                Total amount of this payment transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Breakdown Section (only for combined payments) */}
        {paymentType === "combined" && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Payment Breakdown</h3>
              {!breakdownValid && amount > 0 && (
                <span className="text-sm text-destructive">
                  Breakdown must equal total amount
                </span>
              )}
            </div>

            {/* Principal Amount */}
            <FormField
              control={form.control}
              name="principalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount</FormLabel>
                  <FormControl>
                    <NumberInput
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      placeholder="0.00"
                      value={field.value}
                      onValueChange={field.onChange}
                      min={0}
                      max={amount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interest Amount */}
            <FormField
              control={form.control}
              name="interestAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Amount</FormLabel>
                  <FormControl>
                    <NumberInput
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      placeholder="0.00"
                      value={field.value}
                      onValueChange={field.onChange}
                      min={0}
                      max={amount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Amount */}
            <FormField
              control={form.control}
              name="feeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Amount</FormLabel>
                  <FormControl>
                    <NumberInput
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      placeholder="0.00"
                      value={field.value}
                      onValueChange={field.onChange}
                      min={0}
                      max={amount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between border-t pt-2 text-sm">
              <span className="font-medium">Breakdown Total:</span>
              <span
                className={cn(
                  "font-medium",
                  breakdownValid ? "text-brand-success" : "text-destructive"
                )}
              >
                ${breakdownSum.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ach">ACH Transfer</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Date */}
        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Payment Date</FormLabel>
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
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The date when the payment was received
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Reference */}
        <FormField
          control={form.control}
          name="transactionReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Reference (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., TXN-12345, Check #5678"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                External transaction ID for tracking purposes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this payment..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !breakdownValid}>
            {isSubmitting && <IconLoader2 size={20} stroke={2} className="mr-2 h-4 w-4 animate-spin" />}
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
