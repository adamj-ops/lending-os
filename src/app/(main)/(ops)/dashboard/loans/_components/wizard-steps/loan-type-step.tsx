"use client";

import { useState, useEffect } from "react";
import { IconHome } from "@tabler/icons-react";
import { Building2, Construction, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWizardStore, LoanPurpose } from "@/lib/wizard-state";

interface LoanTypeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function LoanTypeStep({ onNext }: LoanTypeStepProps) {
  const { loanPurpose, estimatedAmount, propertyType, setLoanType } = useWizardStore();
  
  const [purpose, setPurpose] = useState<LoanPurpose | null>(loanPurpose);
  const [amount, setAmount] = useState<string>(estimatedAmount?.toString() || "");
  const [type, setType] = useState<string>(propertyType || "");

  const purposeOptions = [
    {
      value: LoanPurpose.PURCHASE,
      label: "Purchase",
      icon: Home,
      description: "Financing for property purchase",
    },
    {
      value: LoanPurpose.REFINANCE,
      label: "Refinance",
      icon: Building2,
      description: "Refinance existing loan",
    },
    {
      value: LoanPurpose.CONSTRUCTION,
      label: "Construction",
      icon: Construction,
      description: "Construction or renovation financing",
    },
  ];

  const handleContinue = () => {
    if (purpose && amount && type) {
      setLoanType(purpose, parseFloat(amount), type);
      onNext();
    }
  };

  const isValid = purpose && amount && parseFloat(amount) > 0 && type;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Select Loan Purpose</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {purposeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  purpose === option.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setPurpose(option.value)}
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Icon className="mb-3 size-12 text-primary" />
                  <h4 className="mb-1 font-semibold">{option.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Estimated Loan Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="1000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_family">Single Family</SelectItem>
              <SelectItem value="multi_family">Multi Family</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isValid && (
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">
            Creating a {purpose} loan for approximately ${parseFloat(amount).toLocaleString()} on a {type.replace("_", " ")} property
          </p>
        </div>
      )}
    </div>
  );
}

