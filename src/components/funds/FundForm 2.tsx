"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCreateFund, useUpdateFund } from "@/hooks/useFunds";
import type { Fund } from "@/types/fund";
import { fundFormSchema, type FundFormValues } from "./fund-form.schema";
import { cn } from "@/lib/utils";

interface FundFormProps {
  fund?: Fund;
  onSuccess?: () => void;
}

export function FundForm({ fund, onSuccess }: FundFormProps) {
  const createFund = useCreateFund();
  const updateFund = useUpdateFund();

  const isEditing = !!fund;

  const form = useForm<FundFormValues>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      name: fund?.name || "",
      fundType: fund?.fundType || "private",
      totalCapacity: fund?.totalCapacity || "",
      inceptionDate: fund?.inceptionDate ? new Date(fund.inceptionDate) : new Date(),
      strategy: fund?.strategy || "",
      targetReturn: fund?.targetReturn || "",
      managementFeeBps: fund?.managementFeeBps || 0,
      performanceFeeBps: fund?.performanceFeeBps || 0,
    },
  });

  // Reset form when fund prop changes
  useEffect(() => {
    if (fund) {
      form.reset({
        name: fund.name,
        fundType: fund.fundType,
        totalCapacity: fund.totalCapacity,
        inceptionDate: new Date(fund.inceptionDate),
        strategy: fund.strategy || "",
        targetReturn: fund.targetReturn || "",
        managementFeeBps: fund.managementFeeBps,
        performanceFeeBps: fund.performanceFeeBps,
      });
    }
  }, [fund, form]);

  const onSubmit = async (data: FundFormValues) => {
    try {
      const payload = {
        name: data.name,
        fundType: data.fundType,
        totalCapacity: data.totalCapacity,
        inceptionDate: data.inceptionDate,
        strategy: data.strategy || undefined,
        targetReturn: data.targetReturn || undefined,
        managementFeeBps: data.managementFeeBps,
        performanceFeeBps: data.performanceFeeBps,
      };

      if (isEditing) {
        await updateFund.mutateAsync({ id: fund.id, data: payload });
      } else {
        await createFund.mutateAsync(payload);
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Form submission error:", error);
    }
  };

  const isPending = createFund.isPending || updateFund.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Name</FormLabel>
              <FormControl>
                <Input placeholder="Growth Fund I" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fundType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private Fund</SelectItem>
                  <SelectItem value="syndicated">Syndicated Fund</SelectItem>
                  <SelectItem value="institutional">Institutional Fund</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Type of investment fund</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="10000000" {...field} />
                </FormControl>
                <FormDescription>Maximum fund size</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inceptionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Inception Date</FormLabel>
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
                <FormDescription>Date fund was established</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Strategy (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the fund's investment strategy and focus areas..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetReturn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Return % (Optional)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="15.5" {...field} />
              </FormControl>
              <FormDescription>Target annual return percentage</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="managementFeeBps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Management Fee (BPS)</FormLabel>
                <FormControl>
                  <NumberInput 
                    min={0} 
                    max={10000} 
                    placeholder="200"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Basis points (e.g., 200 = 2%)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="performanceFeeBps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance Fee (BPS)</FormLabel>
                <FormControl>
                  <NumberInput 
                    min={0} 
                    max={10000} 
                    placeholder="2000"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Basis points (e.g., 2000 = 20%)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <IconLoader2 size={20} stroke={2} className="mr-2 size-4 animate-spin" />}
            {isEditing ? "Update" : "Create"} Fund
          </Button>
        </div>
      </form>
    </Form>
  );
}

