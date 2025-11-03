"use client";

import { Controller, useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import type { CreateLoanFormData, LoanCategory } from "../types";

const LOAN_CATEGORIES = [
  {
    id: "asset_backed" as LoanCategory,
    title: "Asset-Backed Loan",
    description: "Traditional loan secured by property collateral",
    color: "text-green-500",
  },
  {
    id: "yield_note" as LoanCategory,
    title: "Yield Note / Capital Placement",
    description: "Investor return agreement without property collateral",
    color: "text-yellow-500",
  },
  {
    id: "hybrid" as LoanCategory,
    title: "Hybrid Loan",
    description: "Capital pool with future collateral assignment",
    color: "text-brand-danger",
  },
];

export function StepCategory() {
  const { control } = useFormContext<CreateLoanFormData>();

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="mb-1 text-xl font-bold">Select Loan Category</h2>
        <p className="text-sm text-muted-foreground">
          Choose the type of loan to create. This determines the workflow and required information.
        </p>
      </motion.div>

      <FieldGroup>
        <Controller
          name="loanCategory"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend>Loan Type</FieldLegend>
              <FieldDescription>
                Each category has a different workflow and requirements
              </FieldDescription>
              <RadioGroup
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                aria-invalid={fieldState.invalid}
              >
                {LOAN_CATEGORIES.map((category) => {
                  return (
                    <FieldLabel
                      key={category.id}
                      htmlFor={`loan-category-${category.id}`}
                    >
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent>
                          <FieldTitle className={category.color}>{category.title}</FieldTitle>
                          <FieldDescription>{category.description}</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value={category.id}
                          id={`loan-category-${category.id}`}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    </FieldLabel>
                  );
                })}
              </RadioGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldSet>
          )}
        />
      </FieldGroup>
    </div>
  );
}
