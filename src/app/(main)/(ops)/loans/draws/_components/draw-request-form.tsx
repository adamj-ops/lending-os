"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPlus, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { requestDrawSchema, type RequestDrawInput } from "../schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DrawRequestFormProps {
  loanId: string;
  availableBalance?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DrawRequestForm({
  loanId,
  availableBalance,
  onSuccess,
  onCancel,
}: DrawRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestDrawInput>({
    resolver: zodResolver(requestDrawSchema),
    defaultValues: {
      loanId,
      drawType: "progress",
      amount: 0,
      workDescription: "",
      budgetLineItems: [
        {
          description: "",
          budgetedAmount: 0,
          requestedAmount: 0,
          previousDraws: 0,
        },
      ],
      contractorName: "",
      contractorLicense: "",
      contractorPhone: "",
      contractorEmail: "",
      percentComplete: 0,
      inspectionRequired: true,
      inspectionNotes: "",
      documentUrls: [],
      notes: "",
      requestedDate: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "budgetLineItems",
  });

  const amount = form.watch("amount");
  const budgetLineItems = form.watch("budgetLineItems");

  // Calculate total from line items
  const lineItemsTotal = budgetLineItems.reduce(
    (sum, item) => sum + (item.requestedAmount || 0),
    0
  );
  const totalsMatch = Math.abs(lineItemsTotal - amount) < 0.01;

  const onSubmit = async (data: RequestDrawInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v2/loans/${loanId}/draws`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to request draw");
      }

      toast.success("Draw request submitted successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Draw request error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to request draw"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Draw Type and Amount */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="drawType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Draw Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select draw type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="initial">Initial Draw</SelectItem>
                    <SelectItem value="progress">Progress Draw</SelectItem>
                    <SelectItem value="final">Final Draw</SelectItem>
                    <SelectItem value="contingency">Contingency Draw</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Draw Amount</FormLabel>
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
                    max={availableBalance || 100000000}
                  />
                </FormControl>
                {availableBalance && (
                  <FormDescription>
                    Available balance: ${availableBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Description */}
        <FormField
          control={form.control}
          name="workDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the work completed or to be completed (min 20 characters)..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of the work for this draw request
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Line Items</CardTitle>
                <CardDescription>
                  Break down the draw amount by budget categories
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    budgetedAmount: 0,
                    requestedAmount: 0,
                    previousDraws: 0,
                  })
                }
              >
                <IconPlus size={20} stroke={2} className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-lg border p-4 relative"
              >
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => remove(index)}
                  >
                    <IconTrash size={20} stroke={2} className="h-4 w-4 text-destructive" />
                  </Button>
                )}

                <FormField
                  control={form.control}
                  name={`budgetLineItems.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Foundation, Framing, Electrical" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`budgetLineItems.${index}.budgetedAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budgeted</FormLabel>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`budgetLineItems.${index}.previousDraws`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Draws</FormLabel>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`budgetLineItems.${index}.requestedAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested</FormLabel>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {/* Line Items Total */}
            <div className="flex justify-between border-t pt-3">
              <span className="font-medium">Total from Line Items:</span>
              <span
                className={cn(
                  "font-bold",
                  totalsMatch ? "text-green-600" : "text-destructive"
                )}
              >
                ${lineItemsTotal.toFixed(2)}
              </span>
            </div>

            {!totalsMatch && amount > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />
                <span>Line items total must equal draw amount</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contractor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contractor Information</CardTitle>
            <CardDescription>Optional contractor details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contractorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Contractor or company name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractorLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="License #" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contractor@example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Progress */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="percentComplete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percent Complete</FormLabel>
                <FormControl>
                  <NumberInput
                    suffix="%"
                    decimalScale={0}
                    placeholder="0"
                    value={field.value}
                    onValueChange={field.onChange}
                    min={0}
                    max={100}
                  />
                </FormControl>
                <FormDescription>
                  Overall project completion percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inspectionRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Inspection Required</FormLabel>
                  <FormDescription>
                    This draw requires an on-site inspection
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  value={field.value || ""}
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
          <Button type="submit" disabled={isSubmitting || !totalsMatch}>
            {isSubmitting && <IconLoader2 size={20} stroke={2} className="mr-2 h-4 w-4 animate-spin" />}
            Submit Draw Request
          </Button>
        </div>
      </form>
    </Form>
  );
}
