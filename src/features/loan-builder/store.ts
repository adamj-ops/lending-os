import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateLoanFormData, WizardDraft } from "./types";

interface LoanBuilderState {
  // Navigation
  step: number;
  
  // Form data (partial for in-progress wizards)
  formData: Partial<CreateLoanFormData>;
  
  // Draft management
  draftId: string | null;
  lastSaved: string | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Form data management
  patch: (data: Partial<CreateLoanFormData>) => void;
  setFormData: (data: Partial<CreateLoanFormData>) => void;
  
  // Draft management
  saveDraft: () => void;
  loadDraft: (draft: WizardDraft) => void;
  clearDraft: () => void;
  
  // Reset
  reset: () => void;
}

const DRAFT_KEY = "loan-builder-draft";
const MAX_STEP = 7; // 0-7 (Category, Party, Asset, Terms, Docs, Collateral, Forecast, Review)

export const useLoanBuilder = create<LoanBuilderState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: 0,
      formData: {},
      draftId: null,
      lastSaved: null,

      // Navigation actions
      setStep: (step) => {
        if (step >= 0 && step <= MAX_STEP) {
          set({ step });
        }
      },

      nextStep: () => {
        const { step } = get();
        if (step < MAX_STEP) {
          set({ step: step + 1 });
        }
      },

      prevStep: () => {
        const { step } = get();
        if (step > 0) {
          set({ step: step - 1 });
        }
      },

      goToStep: (step) => {
        const { step: currentStep } = get();
        // Only allow going to previous steps or current step
        if (step >= 0 && step <= currentStep && step <= MAX_STEP) {
          set({ step });
        }
      },

      // Form data actions
      patch: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      setFormData: (data) => {
        set({ formData: data });
      },

      // Draft management
      saveDraft: () => {
        const { formData, step } = get();
        const draft: WizardDraft = {
          id: get().draftId || crypto.randomUUID(),
          formData,
          currentStep: step,
          lastSaved: new Date().toISOString(),
        };

        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
          set({ draftId: draft.id, lastSaved: draft.lastSaved });
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      },

      loadDraft: (draft) => {
        set({
          formData: draft.formData,
          step: draft.currentStep,
          draftId: draft.id,
          lastSaved: draft.lastSaved,
        });
      },

      clearDraft: () => {
        try {
          localStorage.removeItem(DRAFT_KEY);
          set({ draftId: null, lastSaved: null });
        } catch (error) {
          console.error("Failed to clear draft:", error);
        }
      },

      // Reset everything
      reset: () => {
        set({
          step: 0,
          formData: {},
          draftId: null,
          lastSaved: null,
        });
      },
    }),
    {
      name: "loan-builder-storage",
      // Only persist formData and step for draft recovery
      partialize: (state) => ({
        formData: state.formData,
        step: state.step,
        draftId: state.draftId,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Helper to check if draft exists
export function hasDraft(): boolean {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return !!draft;
  } catch {
    return false;
  }
}

// Helper to get draft
export function getDraft(): WizardDraft | null {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

