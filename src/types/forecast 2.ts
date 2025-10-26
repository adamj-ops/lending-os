export interface ForecastInput {
  principal: number;
  rate: number;
  termMonths: number;
  category: "asset_backed" | "yield_note" | "hybrid";
  borrowerCreditScore?: number;
  loanToValue?: number;
}

export interface ForecastOutput {
  roiPct: number;
  defaultProb: number;
  efficiency: number;
  recommendedFunding?: "bank" | "escrow" | "internal";
  riskLevel?: "low" | "medium" | "high";
}

