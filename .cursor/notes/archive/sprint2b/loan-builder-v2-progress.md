# Loan Builder v2 - Implementation Progress

**Date**: October 25, 2025  
**Status**: In Progress - Foundation Complete

---

## ✅ Completed (Phase 1-3)

### Database Schema Enhancements
- ✅ **loans table** - Added loan_category, payment enums, fee fields (BPS), escrow
- ✅ **loan_terms table** - NEW: Extended terms with amortization, compounding
- ✅ **collateral table** - NEW: Lien position, description, JSONB draw schedule
- ✅ **borrowers** - Added type (individual/entity), taxIdEncrypted, name field
- ✅ **lenders** - Added "ira" to entity_type enum, contactPhone field
- ✅ **properties** - Added occupancy, estimatedValue, rehabBudget, photos (JSONB)

### Zod Validation Schemas (`src/features/loan-builder/schemas.ts`)
- ✅ LoanCategorySchema - asset_backed, yield_note, hybrid
- ✅ BaseTermsSchema - Common loan terms with fee validation
- ✅ AssetBackedSchema - Borrower + Property validation
- ✅ YieldNoteSchema - Lender + Investment validation
- ✅ HybridSchema - Flexible validation for hybrid loans
- ✅ Step schemas - Individual step validation (Step0-Step5)
- ✅ CreateLoanSchema - Complete form with category-based refinement

### TypeScript Types (`src/features/loan-builder/types.ts`)
- ✅ All enums: LoanCategory, BorrowerType, LenderType, InvestmentType
- ✅ Form data structures for all loan categories
- ✅ DrawScheduleItem, CollateralFormData, FundingStructureFormData
- ✅ AssetBackedFormData, YieldNoteFormData, HybridFormData
- ✅ ForecastInput, ForecastOutput
- ✅ WizardDraft for persistence

### Zustand Store with Persistence (`src/features/loan-builder/store.ts`)
- ✅ Step navigation: setStep, nextStep, prevStep, goToStep
- ✅ Form data management: patch, setFormData
- ✅ Draft persistence: saveDraft, loadDraft, clearDraft
- ✅ localStorage integration with zustand/persist
- ✅ Helper functions: hasDraft(), getDraft()

### AI Forecast Infrastructure (`src/lib/ai/forecast.ts`)
- ✅ forecastLoan() - Heuristic-based ROI and risk calculations
- ✅ calculateLTV() - Loan-to-value ratio
- ✅ calculateMonthlyPayment() - Amortization formula
- ✅ calculateInterestOnlyPayment() - Interest-only calculations
- ✅ Risk adjustments by category, credit score, LTV

### New Components
- ✅ **StepCategory** - Loan category selection with 3 cards
- ✅ **StepCollateral** - Collateral details, draw schedule builder
- ✅ **StepForecast** - AI risk assessment and ROI visualization
- ✅ **DrawScheduleBuilder** - Reusable draw schedule table
- ✅ **ParticipationSplits** - Multi-investor allocation UI

### Service Layers
- ✅ **CollateralService** - CRUD for collateral records
- ✅ **LoanTermsService** - CRUD for extended loan terms
- ✅ Collateral and Forecast types defined

### API Endpoints
- ✅ **POST /api/v1/loans/v2** - Create loan with v2 schema and validation
- ✅ **POST /api/v1/analytics/forecast** - AI forecast endpoint
- ✅ **POST /api/v1/uploads/sign** - Renamed from presigned-url (spec compliant)

### Dependencies Installed
- ✅ react-hook-form
- ✅ @hookform/resolvers
- ✅ zustand (already installed)

### Documentation
- ✅ **docs/loan-builder-v2-spec.md** - Complete specification document

---

## 🚧 Remaining Work

### Phase 4: Adaptive Wizard Steps

**Step 1: Party Information (REFACTOR EXISTING)**
- Update `borrower-step.tsx` to:
  - Add type selector (individual/entity)
  - Conditional fields based on type
  - Wrap in RHF FormField
  - Rename to `StepParty.tsx`

**Step 2: Asset/Capital (REFACTOR EXISTING)**  
- Combine `property-step.tsx` and create investment form
- Conditional rendering based on loanCategory
- Property section for asset_backed
- Investment section for yield_note
- Both sections for hybrid (with TBD options)
- Rename to `StepAsset.tsx`

**Step 3: Loan Terms (ENHANCE EXISTING)**
- Update `loan-terms-step.tsx`:
  - Add payment type selector
  - Add payment frequency selector
  - Add fee fields (BPS inputs)
  - Add escrow toggle
  - Add funding source selector
  - Wrap all in RHF FormField

**Step 4: Documents (MINOR UPDATE)**
- Already good, just wrap in RHF if needed
- Add category-aware document type suggestions

### Phase 5: Main Wizard Refactoring

**loan-wizard.tsx Updates**
- Add Step 0 (category selection) before current steps
- Integrate FormProvider from React Hook Form
- Add CreateLoanSchema validation
- Conditional step rendering based on loanCategory
- Update step array to include new steps
- Add draft save button
- Add draft resume on mount
- Update API call to `/api/v1/loans/v2`

### Phase 6: Update Review Step

**review-step.tsx Enhancements**
- Category-specific summaries
- Show investment details for yield_note
- Show collateral for asset_backed/hybrid
- Show forecast summary
- Add "Save Draft" button
- Add "Submit for Approval" vs "Create Loan" options

### Phase 7: Database Migration

**Generate and Apply Migration**
- Resolve interactive prompts (organization_id = create new column)
- Generate migration `0004_loan_builder_v2.sql`
- Review migration SQL
- Run `npm run db:migrate`
- Update seed data for new fields

### Phase 8: Update Types

**Update Existing Type Files**
- `src/types/loan.ts` - Add v2 fields, LoanCategory enum
- `src/types/borrower.ts` - Add type field
- `src/types/lender.ts` - Add IRA to entity type
- `src/types/property.ts` - Add new v2 fields

### Phase 9: Testing

**Test Each Category**
- Asset-backed loan creation end-to-end
- Yield note creation end-to-end  
- Hybrid loan creation end-to-end
- Draft save/resume functionality
- Forecast calculations
- Validation error handling

---

## 📊 Progress Summary

**Files Created**: 12  
**Files Modified**: 6  
**Schemas Defined**: ✅  
**Types Created**: ✅  
**State Management**: ✅  
**API Endpoints**: ✅ (v2 + forecast)  
**AI Forecast**: ✅ (heuristic stub)  
**New Components**: ✅ (3 steps + 2 helpers)

**Remaining Estimate**:  
- ~8-10 files to refactor (existing wizard steps)
- ~5 files to update (types)
- 1 migration to generate and apply
- Testing and validation

---

## 🎯 Next Immediate Steps

1. **Generate Migration**
   - Resolve drizzle-kit prompts
   - Apply migration to database

2. **Refactor Step Components**
   - Update borrower-step → StepParty with RHF
   - Update property-step → StepAsset with conditional rendering
   - Update loan-terms-step with v2 fields

3. **Integrate FormProvider**
   - Wrap loan-wizard in FormProvider
   - Add Step 0 to wizard flow
   - Update step navigation logic

4. **Test End-to-End**
   - Create each loan type
   - Verify data persists correctly
   - Test forecast generation

---

## 💡 Key Architecture Decisions

**Backward Compatibility**
- Kept v1 wizard at `/api/v1/loans/wizard`
- Added v2 at `/api/v1/loans/v2`
- Kept deprecated fields (loanAmount, interestRate) with data
- Both old and new columns populated during transition

**Hybrid State Management**
- React Hook Form: Form validation, field-level errors
- Zustand: Step navigation, draft persistence
- localStorage: Auto-save for draft recovery

**Conditional Validation**
- Zod schema uses discriminated unions
- Runtime validation based on loan_category
- Required fields adapt to selected category

**AI Integration Points**
- Forecast stub ready for Phase 4 ML models
- Clean interface (ForecastInput → ForecastOutput)
- Extensible for additional AI features

---

## 🔧 Technical Notes

**JSONB Fields**
- `properties.photos` - Array of {key, url}
- `collateral.drawSchedule` - Array of draw objects
- Drizzle: Use `.$type<T>()` for type safety

**Enum Additions**
- New payment enums must be in database first
- Drizzle generates as Postgres ENUMs
- TypeScript enums derived from schema

**Fee Basis Points**
- Stored as integers (100 BPS = 1%)
- UI shows percentage, stores BPS
- Range: 0-5000 (0-50%)

**Date Handling**
- All timestamps use `{ withTimezone: true }`
- ISO strings in forms, Date objects in DB
- Timezone-aware for international use

---

**Foundation is solid. Ready to complete wizard refactoring and testing.**

