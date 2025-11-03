# Loan Builder v2 - Implementation Plan

**Date**: Current Session  
**Status**: Ready to Execute  
**Estimated Time**: 2.5 hours

---

## 🎯 **Goal**

Transform the existing 7-step wizard into an adaptive Loan Builder that supports:
- **Asset-Backed Loans** (borrower + property)
- **Yield Notes** (investor agreements)
- **Hybrid Loans** (capital pool with TBD collateral)

---

## ✅ **Foundation Status**

**COMPLETED** (from previous session):
- ✅ Database schemas updated (17 files)
- ✅ Zod validation schemas (`schemas.ts`)
- ✅ TypeScript types (`types.ts`)
- ✅ Zustand store with persistence (`store.ts`)
- ✅ Step 0 (Category), Step 5 (Collateral), Step 6 (Forecast)
- ✅ API endpoints (`/api/v1/loans/v2`, `/api/v1/analytics/forecast`)
- ✅ AI forecast stub (`lib/ai/forecast.ts`)
- ✅ Helper components (DrawScheduleBuilder, ParticipationSplits)

**REMAINING**:
- ⏳ Database migration generation
- ⏳ Refactor 4 existing wizard steps
- ⏳ Update main wizard with FormProvider
- ⏳ Update type definitions
- ⏳ End-to-end testing

---

## 📋 **Implementation Steps**

### **Step 1: Generate Database Migration** (~10 min)

**Task**: Resolve drizzle-kit prompts and create migration SQL

**Commands**:
```bash
# Generate migration (will prompt)
npm run db:generate

# Answer prompts:
# - organization_id in properties = CREATE NEW COLUMN (not rename)
# - Review generated SQL

# Apply migration
npm run db:migrate
```

**Files**:
- `src/db/migrations/0004_loan_builder_v2.sql` (generated)

**Success Criteria**: Migration applies successfully, no errors

---

### **Step 2: Update Type Definitions** (~15 min)

**Task**: Add v2 fields to existing type files

**Files to Modify**:

1. **`src/types/loan.ts`**
   - Add `LoanCategory` enum: `"asset_backed" | "yield_note" | "hybrid"`
   - Add `loanCategory` field to `Loan` interface
   - Add `paymentType`, `paymentFrequency` fields
   - Add fee fields: `originationFeeBps`, `lateFeeBps`, `defaultInterestBps`
   - Add `escrowEnabled` boolean
   - Add `createdBy` uuid

2. **`src/types/borrower.ts`**
   - Add `type` field: `"individual" | "entity"`
   - Add `name` field (for entities)
   - Add `taxIdEncrypted` field
   - Make `firstName`, `lastName`, `companyName` optional

3. **`src/types/lender.ts`**
   - Add `contactPhone` field
   - Update `entityType` to include `"ira"`

4. **`src/types/property.ts`**
   - Add `occupancy` field: `"owner_occupied" | "tenant_occupied" | "vacant"`
   - Add `estimatedValue`, `rehabBudget` numbers
   - Add `photos` array: `Array<{ key: string; url?: string }>`

**Success Criteria**: No TypeScript errors, types match schema

---

### **Step 3: Refactor Wizard Steps** (~45 min)

#### **3a. Update Step 1: Party Information**

**File**: `src/app/(main)/dashboard/loans/_components/wizard-steps/borrower-step.tsx`

**Changes**:
- Rename file to `StepParty.tsx` in `src/features/loan-builder/steps/`
- Wrap all inputs in `<FormField>` components
- Add conditional rendering based on `loanCategory`:
  - Show borrower section for `asset_backed` and `hybrid`
  - Show lender section for `yield_note` and `hybrid`
- Use `useFormContext<CreateLoanFormData>()`
- Remove `useWizardStore` state management
- Validate with `Step1PartySchema`

**Key Changes**:
```typescript
// Add at top
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { CreateLoanFormData } from "@/features/loan-builder/types";

// Inside component
const { control, watch } = useFormContext<CreateLoanFormData>();
const loanCategory = watch("loanCategory");

// Conditional rendering
{loanCategory === "asset_backed" || loanCategory === "hybrid" ? (
  <BorrowerFormSection />
) : null}
{loanCategory === "yield_note" || loanCategory === "hybrid" ? (
  <LenderFormSection />
) : null}
```

#### **3b. Update Step 2: Asset/Capital**

**File**: `src/app/(main)/dashboard/loans/_components/wizard-steps/property-step.tsx`

**Changes**:
- Rename to `StepAsset.tsx` in `src/features/loan-builder/steps/`
- Add conditional rendering:
  - `asset_backed`: Show property fields (address, type, values, occupancy, rehab, photos)
  - `yield_note`: Show investment fields (type, committed amount, return rate, compounding, dates)
  - `hybrid`: Show both sections with TBD options
- Wrap in `<FormField>` components
- Connect FileUpload for property photos
- Validate with `Step2AssetSchema`

#### **3c. Update Step 3: Loan Terms**

**File**: `src/app/(main)/dashboard/loans/_components/wizard-steps/loan-terms-step.tsx`

**Changes**:
- Add payment type selector (interest_only | amortized)
- Add payment frequency selector (monthly | quarterly | maturity)
- Add fee input fields (origination, late, default) in BPS
- Add escrow enabled toggle
- Wrap all fields in `<FormField>`
- Remove wizard store usage
- Use form context

**New Fields to Add**:
```typescript
<FormField
  control={control}
  name="terms.paymentType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Payment Type</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="interest_only">Interest Only</SelectItem>
          <SelectItem value="amortized">Amortized</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### **3d. Update Step 4: Documents**

**File**: `src/app/(main)/dashboard/loans/_components/wizard-steps/documents-step.tsx`

**Changes**:
- Minor: Wrap FileUpload in form context
- Connect documents to form data
- Add category-aware document type suggestions

#### **3e. Integrate Step 0 in Wizard**

**File**: Use existing `src/features/loan-builder/steps/StepCategory.tsx`

**No changes needed** - Already created ✅

---

### **Step 4: Refactor Main Wizard** (~30 min)

**File**: `src/app/(main)/dashboard/loans/_components/loan-wizard.tsx`

**Changes**:

1. **Add FormProvider wrapper**:
```typescript
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLoanSchema } from "@/features/loan-builder/schemas";

// Inside component
const methods = useForm<CreateLoanFormData>({
  resolver: zodResolver(CreateLoanSchema),
  defaultValues: {
    loanCategory: "asset_backed",
  },
  mode: "onChange",
});
```

2. **Add Step 0 to flow**:
```typescript
const STEPS = [
  { id: 0, title: "Category", component: StepCategory },
  { id: 1, title: "Party", component: StepParty },
  { id: 2, title: "Asset", component: StepAsset },
  { id: 3, title: "Terms", component: LoanTermsStep },
  { id: 4, title: "Documents", component: DocumentsStep },
  { id: 5, title: "Collateral", component: StepCollateral },
  { id: 6, title: "Forecast", component: StepForecast },
  { id: 7, title: "Review", component: ReviewStep },
];
```

3. **Conditional step rendering**:
```typescript
const loanCategory = methods.watch("loanCategory");

// Skip steps based on category
const visibleSteps = STEPS.filter((step) => {
  if (step.id === 0) return true; // Always show category
  if (step.id === 1) return true; // Always show party
  if (step.id === 2) return loanCategory !== null; // Asset/capital
  if (step.id === 3) return true; // Always show terms
  if (step.id === 4) return true; // Always show documents
  if (step.id === 5) return loanCategory === "asset_backed" || loanCategory === "hybrid";
  if (step.id === 6) return true; // Show forecast
  if (step.id === 7) return true; // Always show review
  return true;
});
```

4. **Update handleSubmit**:
```typescript
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    const isValid = await methods.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors");
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
```

5. **Add draft save/resume**:
```typescript
import { useLoanWizard } from "@/features/loan-builder/store";

const { saveDraft, loadDraft, hasDraft } = useLoanWizard();

// On mount
useEffect(() => {
  if (open && hasDraft()) {
    const draft = loadDraft();
    if (draft) {
      methods.reset(draft.formData);
      setCurrentStep(draft.currentStep);
    }
  }
}, [open]);

// Save draft button
<Button variant="outline" onClick={() => {
  saveDraft({
    formData: methods.getValues(),
    currentStep,
  });
  toast.success("Draft saved");
}}>
  Save Draft
</Button>
```

**Success Criteria**: Wizard loads with FormProvider, validation works, draft saves

---

### **Step 5: Update Review Step** (~20 min)

**File**: `src/app/(main)/dashboard/loans/_components/wizard-steps/review-step.tsx`

**Changes**:
- Use `useFormContext` to read form data
- Render category-specific summaries
- Show investment details for yield_note
- Show collateral for asset_backed/hybrid
- Display forecast summary
- Add "Save Draft" button

**Example conditional rendering**:
```typescript
const { watch } = useFormContext<CreateLoanFormData>();
const loanCategory = watch("loanCategory");

{loanCategory === "asset_backed" && (
  <Card>
    <CardHeader>
      <CardTitle>Borrower & Property</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Show borrower + property summary */}
    </CardContent>
  </Card>
)}

{loanCategory === "yield_note" && (
  <Card>
    <CardHeader>
      <CardTitle>Investor & Investment</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Show lender + investment summary */}
    </CardContent>
  </Card>
)}
```

**Success Criteria**: Review step shows correct data for each category

---

### **Step 6: End-to-End Testing** (~30 min)

**Test Cases**:

1. **Asset-Backed Loan**:
   - Select "Asset-Backed" category
   - Fill borrower info (individual)
   - Fill property details with photos
   - Set loan terms (principal, rate, payment type/frequency)
   - Upload documents
   - Review and submit
   - Verify loan appears in database

2. **Yield Note**:
   - Select "Yield Note" category
   - Fill lender/investor info
   - Fill investment details (type, committed amount, return rate)
   - Set loan terms
   - Upload documents
   - Review and submit
   - Verify loan appears in database

3. **Hybrid Loan**:
   - Select "Hybrid" category
   - Fill optional borrower/lender
   - Fill optional property/investment
   - Set loan terms
   - Upload documents
   - Add collateral (TBD)
   - Review and submit
   - Verify loan appears in database

4. **Draft Persistence**:
   - Fill steps 0-3
   - Click "Save Draft"
   - Close wizard
   - Reopen wizard
   - Verify draft loads
   - Continue and submit

5. **Validation**:
   - Try to submit with missing required fields
   - Verify error messages appear
   - Verify cannot proceed to next step

**Success Criteria**: All 3 categories work end-to-end, no errors

---

## 📝 **File Changes Summary**

### **Create New** (6 files):
- `src/features/loan-builder/steps/StepParty.tsx` (refactored from borrower-step)
- `src/features/loan-builder/steps/StepAsset.tsx` (refactored from property-step)
- `src/db/migrations/0004_loan_builder_v2.sql` (generated)

### **Modify Existing** (9 files):
- `src/app/(main)/dashboard/loans/_components/loan-wizard.tsx`
- `src/app/(main)/dashboard/loans/_components/wizard-steps/loan-terms-step.tsx`
- `src/app/(main)/dashboard/loans/_components/wizard-steps/documents-step.tsx`
- `src/app/(main)/dashboard/loans/_components/wizard-steps/review-step.tsx`
- `src/types/loan.ts`
- `src/types/borrower.ts`
- `src/types/lender.ts`
- `src/types/property.ts`
- `src/app/(main)/dashboard/loans/page.tsx` (update imports)

### **Delete** (2 files):
- `src/app/(main)/dashboard/loans/_components/wizard-steps/loan-type-step.tsx` (replaced by StepCategory)
- `src/app/(main)/dashboard/loans/_components/wizard-steps/lender-step.tsx` (integrated into StepParty)

---

## 🎯 **Success Criteria**

✅ Database migration applied successfully  
✅ All 3 loan categories work end-to-end  
✅ React Hook Form validates at each step  
✅ Form data persists via localStorage  
✅ API creates loans with v2 schema  
✅ No TypeScript errors  
✅ No console errors during wizard flow  
✅ All existing functionality preserved (backward compatible)

---

## 🚀 **Ready to Execute**

All foundation work is complete. This plan focuses on:
1. Completing the database migration
2. Refactoring existing wizard steps to use React Hook Form
3. Integrating everything into the main wizard
4. Testing end-to-end

**Estimated Total Time**: 2.5 hours  
**Risk Level**: Low (foundation is solid)  
**Dependencies**: None (all infrastructure ready)

Let's build it! 🎉

