import { z } from "zod";

// ============ LOAN CATEGORIES ============

export const LoanCategorySchema = z.enum(["asset_backed", "yield_note", "hybrid"]);

export const BorrowerTypeSchema = z.enum(["individual", "entity"]);

export const LenderTypeSchema = z.enum(["individual", "fund", "ira", "company"]);

export const InvestmentTypeSchema = z.enum([
  "fixed_yield",
  "revenue_share",
  "profit_participation",
  "custom",
]);

// ============ BASE TERMS (Common to all loan types) ============

export const BaseTermsSchema = z.object({
  principal: z.coerce.number().positive("Principal must be greater than 0"),
  rate: z.coerce.number().min(0, "Rate must be 0 or greater").max(100, "Rate cannot exceed 100%"),
  termMonths: z.coerce.number().int().positive("Term must be at least 1 month"),
  paymentType: z.enum(["interest_only", "amortized"]),
  paymentFrequency: z.enum(["monthly", "quarterly", "maturity"]),
  originationFeeBps: z.coerce.number().int().min(0).max(5000).optional(),
  lateFeeBps: z.coerce.number().int().min(0).max(5000).optional(),
  defaultInterestBps: z.coerce.number().int().min(0).max(5000).optional(),
  escrowEnabled: z.boolean().optional().default(false),
});

// ============ ASSET-BACKED SCHEMA ============

export const AssetBackedBorrowerSchema = z.object({
  id: z.string().uuid().optional(), // Existing borrower
  type: BorrowerTypeSchema,
  // For individual
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  // For entity
  name: z.string().min(1).optional(),
  // Common
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditScore: z.coerce.number().int().min(300).max(850).optional(),
  taxId: z.string().optional(), // Will be encrypted
}).refine(
  (data) => {
    // If type is individual, require firstName and lastName
    if (data.type === "individual") {
      return data.firstName && data.lastName;
    }
    // If type is entity, require name
    if (data.type === "entity") {
      return data.name;
    }
    return true;
  },
  {
    message: "Individual borrowers require firstName and lastName. Entity borrowers require name.",
  }
);

export const AssetBackedPropertySchema = z.object({
  id: z.string().uuid().optional(), // Existing property
  address: z.string().min(3, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().optional(),
  propertyType: z.enum(["single_family", "multi_family", "commercial", "land"]),
  occupancy: z.enum(["owner_occupied", "tenant_occupied", "vacant"]).optional(),
  estimatedValue: z.coerce.number().positive().optional(),
  purchasePrice: z.coerce.number().positive("Purchase price is required"),
  appraisedValue: z.coerce.number().positive().optional(),
  appraisalDate: z.string().optional(), // ISO date
  rehabBudget: z.coerce.number().min(0).optional(),
  photos: z.array(z.object({ key: z.string(), url: z.string().optional() })).optional(),
});

export const AssetBackedSchema = z.object({
  borrower: AssetBackedBorrowerSchema,
  property: AssetBackedPropertySchema,
});

// ============ YIELD NOTE SCHEMA ============

export const YieldNoteLenderSchema = z.object({
  id: z.string().uuid().optional(), // Existing lender
  name: z.string().min(1, "Lender name is required"),
  type: LenderTypeSchema,
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
});

export const YieldNoteInvestmentSchema = z.object({
  investmentType: InvestmentTypeSchema,
  committedAmount: z.coerce.number().positive("Committed amount must be greater than 0"),
  returnRate: z.coerce.number().min(0).max(100, "Return rate cannot exceed 100%"),
  compounding: z.enum(["simple", "compound"]).default("simple"),
  startDate: z.string(), // ISO date
  maturityDate: z.string(), // ISO date
  paymentFrequency: z.enum(["monthly", "quarterly", "maturity"]),
});

export const YieldNoteSchema = z.object({
  lender: YieldNoteLenderSchema,
  investment: YieldNoteInvestmentSchema,
});

// ============ HYBRID SCHEMA ============

export const HybridSchema = z.object({
  borrower: AssetBackedBorrowerSchema.optional(),
  lender: YieldNoteLenderSchema.optional(),
  property: AssetBackedPropertySchema.optional(),
  capitalPoolId: z.string().uuid().optional(),
  targetYieldMin: z.coerce.number().min(0).max(100).optional(),
  targetYieldMax: z.coerce.number().min(0).max(100).optional(),
  collateralStatus: z.enum(["assigned", "tbd", "pending"]).default("tbd"),
});

// ============ COLLATERAL & FUNDING ============

export const CollateralSchema = z.object({
  lienPosition: z.enum(["1st", "2nd", "subordinate"]).optional(),
  description: z.string().optional(),
  drawSchedule: z
    .array(
      z.object({
        n: z.number().int().positive(),
        amount: z.number().positive(),
        note: z.string().optional(),
      })
    )
    .optional(),
});

export const ParticipationSplitSchema = z.object({
  lenderId: z.string().uuid(),
  percentage: z.number().min(0).max(100),
  amount: z.number().positive(),
});

export const FundingStructureSchema = z.object({
  fundingSource: z.enum(["bank", "escrow", "internal"]).optional(),
  participationSplits: z.array(ParticipationSplitSchema).optional(),
  escrowBalance: z.number().min(0).optional(),
});

// ============ STEP SCHEMAS ============

export const Step0Schema = z.object({
  loanCategory: LoanCategorySchema,
});

export const Step1PartySchema = z.discriminatedUnion("loanCategory", [
  z.object({
    loanCategory: z.literal("asset_backed"),
    borrower: AssetBackedBorrowerSchema,
  }),
  z.object({
    loanCategory: z.literal("yield_note"),
    lender: YieldNoteLenderSchema,
  }),
  z.object({
    loanCategory: z.literal("hybrid"),
    borrower: AssetBackedBorrowerSchema.optional(),
    lender: YieldNoteLenderSchema.optional(),
  }),
]);

export const Step2AssetSchema = z.discriminatedUnion("loanCategory", [
  z.object({
    loanCategory: z.literal("asset_backed"),
    property: AssetBackedPropertySchema,
  }),
  z.object({
    loanCategory: z.literal("yield_note"),
    investment: YieldNoteInvestmentSchema,
  }),
  z.object({
    loanCategory: z.literal("hybrid"),
    property: AssetBackedPropertySchema.optional(),
    investment: YieldNoteInvestmentSchema.optional(),
  }),
]);

export const Step3TermsSchema = BaseTermsSchema;

export const Step4DocumentsSchema = z.object({
  documents: z.array(
    z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
      key: z.string(),
    })
  ),
});

export const Step5CollateralSchema = z.object({
  collateral: CollateralSchema.optional(),
  funding: FundingStructureSchema.optional(),
});

// ============ COMPLETE LOAN SCHEMA ============

export const CreateLoanSchema = z.object({
  // Step 0
  loanCategory: LoanCategorySchema,
  
  // Step 1 - Party (conditional)
  borrower: AssetBackedBorrowerSchema.optional(),
  lender: YieldNoteLenderSchema.optional(),
  
  // Step 2 - Asset/Capital (conditional)
  property: AssetBackedPropertySchema.optional(),
  investment: YieldNoteInvestmentSchema.optional(),
  
  // Step 3 - Terms (required for all)
  terms: BaseTermsSchema,
  
  // Step 4 - Documents
  documents: z.array(z.any()).optional(),
  
  // Step 5 - Collateral & Funding (conditional)
  collateral: CollateralSchema.optional(),
  funding: FundingStructureSchema.optional(),
  
  // Step 6 - AI Forecast (Phase 4 - optional)
  skipForecast: z.boolean().optional(),
}).refine(
  (data) => {
    // Asset-backed requires borrower and property
    if (data.loanCategory === "asset_backed") {
      return data.borrower && data.property;
    }
    // Yield note requires lender and investment
    if (data.loanCategory === "yield_note") {
      return data.lender && data.investment;
    }
    // Hybrid requires at least one party
    if (data.loanCategory === "hybrid") {
      return data.borrower || data.lender;
    }
    return true;
  },
  {
    message: "Missing required fields for selected loan category",
  }
);

// Export types
export type LoanCategory = z.infer<typeof LoanCategorySchema>;
export type BaseTerms = z.infer<typeof BaseTermsSchema>;
export type AssetBackedData = z.infer<typeof AssetBackedSchema>;
export type YieldNoteData = z.infer<typeof YieldNoteSchema>;
export type HybridData = z.infer<typeof HybridSchema>;
export type CreateLoanFormData = z.infer<typeof CreateLoanSchema>;

