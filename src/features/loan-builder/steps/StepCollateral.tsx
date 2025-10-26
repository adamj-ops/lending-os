"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { CreateLoanFormData } from "../types";

export function StepCollateral() {
  const { control, watch } = useFormContext<CreateLoanFormData>();
  const loanCategory = watch("loanCategory");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "collateral.drawSchedule",
  });

  const showCollateral = loanCategory === "asset_backed" || loanCategory === "hybrid";
  const showDraws = loanCategory === "asset_backed";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Collateral & Funding Structure</h2>
        <p className="text-muted-foreground">
          Define collateral details, draw schedules, and funding allocation
        </p>
      </div>

      {showCollateral && (
        <Card>
          <CardHeader>
            <CardTitle>Collateral Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="collateral.lienPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien Position</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lien position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1st">1st Position</SelectItem>
                      <SelectItem value="2nd">2nd Position</SelectItem>
                      <SelectItem value="subordinate">Subordinate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Priority of this loan in case of default
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="collateral.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collateral Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the collateral securing this loan..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of assets securing the loan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      {showDraws && (
        <Card>
          <CardHeader>
            <CardTitle>Draw Schedule (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3 rounded-lg border p-3">
                  <FormField
                    control={control}
                    name={`collateral.drawSchedule.${index}.n`}
                    render={({ field }) => (
                      <FormItem className="flex-shrink-0">
                        <FormLabel>Draw #</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            className="w-20"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.drawSchedule.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.drawSchedule.${index}.note`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Input placeholder="Foundation work" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ n: fields.length + 1, amount: 0, note: "" })}
            >
              <Plus className="mr-2 size-4" />
              Add Draw
            </Button>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No draws added. Click "Add Draw" to create a draw schedule for construction loans.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Funding Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="funding.fundingSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="escrow">Escrow</SelectItem>
                    <SelectItem value="internal">Internal Funds</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Where will the loan funds be sourced from?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="funding.escrowBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escrow Balance (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Initial escrow account balance
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

