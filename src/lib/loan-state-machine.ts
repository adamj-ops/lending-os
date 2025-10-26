import { LoanStatus } from "@/types/loan";

export const VALID_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  [LoanStatus.DRAFT]: [LoanStatus.SUBMITTED, LoanStatus.REJECTED],
  [LoanStatus.SUBMITTED]: [LoanStatus.VERIFICATION, LoanStatus.DRAFT, LoanStatus.REJECTED],
  [LoanStatus.VERIFICATION]: [LoanStatus.UNDERWRITING, LoanStatus.SUBMITTED, LoanStatus.REJECTED],
  [LoanStatus.UNDERWRITING]: [LoanStatus.APPROVED, LoanStatus.VERIFICATION, LoanStatus.REJECTED],
  [LoanStatus.APPROVED]: [LoanStatus.CLOSING, LoanStatus.UNDERWRITING],
  [LoanStatus.CLOSING]: [LoanStatus.FUNDED, LoanStatus.APPROVED],
  [LoanStatus.FUNDED]: [], // Terminal state
  [LoanStatus.REJECTED]: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function canTransition(from: LoanStatus, to: LoanStatus): boolean {
  const allowedTransitions = VALID_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

/**
 * Get all possible next states for a given status
 */
export function getNextStates(current: LoanStatus): LoanStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

/**
 * Get a human-readable label for a status
 */
export function getStatusLabel(status: LoanStatus): string {
  const labels: Record<LoanStatus, string> = {
    [LoanStatus.DRAFT]: "Draft",
    [LoanStatus.SUBMITTED]: "Submitted",
    [LoanStatus.VERIFICATION]: "Verification",
    [LoanStatus.UNDERWRITING]: "Underwriting",
    [LoanStatus.APPROVED]: "Approved",
    [LoanStatus.CLOSING]: "Closing",
    [LoanStatus.FUNDED]: "Funded",
    [LoanStatus.REJECTED]: "Rejected",
  };
  return labels[status];
}

/**
 * Get color variant for status badge
 */
export function getStatusVariant(status: LoanStatus): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<LoanStatus, "default" | "secondary" | "destructive" | "outline"> = {
    [LoanStatus.DRAFT]: "secondary",
    [LoanStatus.SUBMITTED]: "outline",
    [LoanStatus.VERIFICATION]: "outline",
    [LoanStatus.UNDERWRITING]: "outline",
    [LoanStatus.APPROVED]: "default",
    [LoanStatus.CLOSING]: "default",
    [LoanStatus.FUNDED]: "default",
    [LoanStatus.REJECTED]: "destructive",
  };
  return variants[status];
}

