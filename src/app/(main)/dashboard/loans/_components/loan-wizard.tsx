"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateLoanSchema } from "@/features/loan-builder/schemas";
import { useLoanBuilder } from "@/features/loan-builder/store";
import type { CreateLoanFormData } from "@/features/loan-builder/types";
import { motionPresets } from "@/features/loan-builder/motion.config";
import { StepCategory } from "@/features/loan-builder/steps/StepCategory";
import { StepParty } from "@/features/loan-builder/steps/StepParty";
import { StepAsset } from "@/features/loan-builder/steps/StepAsset";
import { LoanTermsStep } from "./wizard-steps/loan-terms-step";
import { DocumentsStep } from "./wizard-steps/documents-step";
import { StepCollateral } from "@/features/loan-builder/steps/StepCollateral";
import { StepForecast } from "@/features/loan-builder/steps/StepForecast";
import { ReviewStep } from "./wizard-steps/review-step";
import { toast } from "sonner";

interface LoanWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const ALL_STEPS = [
  { id: 0, title: "Category", component: StepCategory, key: "category" },
  { id: 1, title: "Party", component: StepParty, key: "party" },
  { id: 2, title: "Asset", component: StepAsset, key: "asset" },
  { id: 3, title: "Terms", component: LoanTermsStep, key: "terms" },
  { id: 4, title: "Documents", component: DocumentsStep, key: "documents" },
  { id: 5, title: "Collateral", component: StepCollateral, key: "collateral" },
  { id: 6, title: "Forecast", component: StepForecast, key: "forecast" },
  { id: 7, title: "Review", component: ReviewStep, key: "review" },
];

export function LoanWizard({ open, onOpenChange, onComplete }: LoanWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loanBuilderStore = useLoanBuilder();

  const methods = useForm<CreateLoanFormData>({
    resolver: zodResolver(CreateLoanSchema),
    defaultValues: {
      loanCategory: "asset_backed",
      terms: {
        principal: 0,
        rate: 0,
        termMonths: 0,
        paymentType: "amortized",
        paymentFrequency: "monthly",
      },
    },
    mode: "onChange",
  });

  const loanCategory = methods.watch("loanCategory");

  // Load draft on mount
  useEffect(() => {
    if (open) {
      const storedData = loanBuilderStore.formData;
      const storedStep = loanBuilderStore.step;
      
      if (Object.keys(storedData).length > 0 && confirm("Resume from draft?")) {
        methods.reset(storedData as any);
        setCurrentStep(storedStep);
      }
    }
  }, [open]);

  // Get visible steps based on loan category
  const getVisibleSteps = () => {
    if (!loanCategory) return ALL_STEPS.slice(0, 1);

    return ALL_STEPS.filter((step) => {
      if (step.id === 0) return true;
      if (step.id === 1) return true;
      if (step.id === 2) return true;
      if (step.id === 3) return true;
      if (step.id === 4) return true;
      if (step.id === 5) return loanCategory === "asset_backed" || loanCategory === "hybrid";
      if (step.id === 6) return true;
      if (step.id === 7) return true;
      return true;
    });
  };

  const visibleSteps = getVisibleSteps();
  const currentStepIndex = visibleSteps.findIndex((s) => s.id === currentStep);

  const handleClose = () => {
    if (currentStep > 0) {
      if (!confirm("Are you sure you want to close? Unsaved progress will be lost.")) {
        return;
      }
    }
    methods.reset();
    setCurrentStep(0);
    loanBuilderStore.clearDraft();
    onOpenChange(false);
  };

  const handleNext = async () => {
    // Only validate specific fields for current step, not entire form
    let fieldsToValidate: any[] = [];
    
    switch (currentStep) {
      case 0: // Category
        fieldsToValidate = ["loanCategory"];
        break;
      case 1: // Party
        if (loanCategory === "asset_backed" || loanCategory === "hybrid") {
          fieldsToValidate = ["borrower"];
        }
        if (loanCategory === "yield_note" || loanCategory === "hybrid") {
          fieldsToValidate = ["lender"];
        }
        break;
      case 2: // Asset
        if (loanCategory === "asset_backed" || loanCategory === "hybrid") {
          fieldsToValidate = ["property"];
        }
        if (loanCategory === "yield_note" || loanCategory === "hybrid") {
          fieldsToValidate = ["investment"];
        }
        break;
      case 3: // Terms
        fieldsToValidate = ["terms"];
        break;
      case 4: // Documents (optional)
        fieldsToValidate = [];
        break;
      case 5: // Collateral (optional for asset-backed)
        fieldsToValidate = [];
        break;
      case 6: // Forecast (optional)
        fieldsToValidate = [];
        break;
      default:
        fieldsToValidate = [];
    }

    // Only validate if there are fields to validate
    if (fieldsToValidate.length > 0) {
      const isValid = await methods.trigger(fieldsToValidate as any);
      if (!isValid) {
        toast.error("Please fix validation errors before continuing");
        return;
      }
    }

    loanBuilderStore.setFormData(methods.getValues() as any);
    loanBuilderStore.saveDraft();

    if (currentStepIndex < visibleSteps.length - 1) {
      const nextStep = visibleSteps[currentStepIndex + 1].id;
      setCurrentStep(nextStep);
      loanBuilderStore.setStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(visibleSteps[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: number) => {
    const clickedIndex = visibleSteps.findIndex((s) => s.id === stepId);
    if (clickedIndex < currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleSaveDraft = () => {
    loanBuilderStore.setFormData(methods.getValues() as any);
    loanBuilderStore.setStep(currentStep);
    loanBuilderStore.saveDraft();
    toast.success("Draft saved successfully");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isValid = await methods.trigger();
      if (!isValid) {
        toast.error("Please fix all validation errors");
        setIsSubmitting(false);
        return;
      }

      const formData = methods.getValues();

      const response = await fetch("/api/v1/loans/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Loan created successfully!");
        methods.reset();
        setCurrentStep(0);
        loanBuilderStore.clearDraft();
        onOpenChange(false);
        onComplete();
      } else {
        toast.error(result.error || "Failed to create loan");
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      toast.error("Failed to create loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = visibleSteps[currentStepIndex]?.component;
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            {loanCategory === "asset_backed"
              ? "Asset-backed loan with property collateral"
              : loanCategory === "yield_note"
                ? "Yield note / investor return agreement"
                : loanCategory === "hybrid"
                  ? "Hybrid loan with capital pool"
                  : "Select loan category to begin"}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0">
            {/* Progress Bar - Animated */}
            <div className="space-y-2 pb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <motion.div
                className="flex items-center justify-between text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
                <span>{visibleSteps[currentStepIndex]?.title}</span>
              </motion.div>
            </div>

            {/* Step Content - Animated Transitions */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  {...motionPresets.fadeInScale}
                >
                  {CurrentStepComponent && (
                    <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons - Fixed at bottom with animations */}
            <motion.div
              className="flex justify-between items-center border-t pt-4 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                >
                  Back
                </Button>
              </motion.div>

              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="button" variant="ghost" onClick={handleSaveDraft}>
                    Save Draft
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {currentStepIndex < visibleSteps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Loan"}
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
