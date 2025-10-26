import { create } from "zustand";
import type { LoanStatus } from "@/types/loan";
import type { UploadedFile } from "@/components/ui/file-upload";

export enum LoanPurpose {
  PURCHASE = "purchase",
  REFINANCE = "refinance",
  CONSTRUCTION = "construction",
}

export interface BorrowerData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  creditScore?: number;
}

export interface PropertyData {
  id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType?: string;
  purchasePrice?: number;
}

export interface LenderData {
  id?: string;
  name?: string;
  entityType?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface WizardState {
  // Step 1: Loan Type
  loanPurpose: LoanPurpose | null;
  estimatedAmount: number | null;
  propertyType: string | null;

  // Step 2: Borrower
  borrower: BorrowerData | null;
  isNewBorrower: boolean;

  // Step 3: Property
  property: PropertyData | null;
  isNewProperty: boolean;

  // Step 4: Lender
  lender: LenderData | null;
  isNewLender: boolean;

  // Step 5: Loan Terms
  loanAmount: number | null;
  interestRate: number | null;
  termMonths: number | null;
  fundedDate: Date | null;
  maturityDate: Date | null;

  // Step 6: Documents
  documents: UploadedFile[];

  // Actions
  setLoanType: (purpose: LoanPurpose, amount: number, propertyType: string) => void;
  setBorrower: (borrower: BorrowerData, isNew: boolean) => void;
  setProperty: (property: PropertyData, isNew: boolean) => void;
  setLender: (lender: LenderData, isNew: boolean) => void;
  setLoanTerms: (
    amount: number,
    rate: number,
    term: number,
    fundedDate: Date | null,
    maturityDate: Date | null
  ) => void;
  setDocuments: (documents: UploadedFile[]) => void;
  reset: () => void;
}

const initialState = {
  loanPurpose: null,
  estimatedAmount: null,
  propertyType: null,
  borrower: null,
  isNewBorrower: false,
  property: null,
  isNewProperty: false,
  lender: null,
  isNewLender: false,
  loanAmount: null,
  interestRate: null,
  termMonths: null,
  fundedDate: null,
  maturityDate: null,
  documents: [],
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setLoanType: (purpose, amount, propertyType) =>
    set({
      loanPurpose: purpose,
      estimatedAmount: amount,
      propertyType,
    }),

  setBorrower: (borrower, isNew) =>
    set({
      borrower,
      isNewBorrower: isNew,
    }),

  setProperty: (property, isNew) =>
    set({
      property,
      isNewProperty: isNew,
    }),

  setLender: (lender, isNew) =>
    set({
      lender,
      isNewLender: isNew,
    }),

  setLoanTerms: (amount, rate, term, fundedDate, maturityDate) =>
    set({
      loanAmount: amount,
      interestRate: rate,
      termMonths: term,
      fundedDate,
      maturityDate,
    }),

  setDocuments: (documents) =>
    set({ documents }),

  reset: () => set(initialState),
}));

