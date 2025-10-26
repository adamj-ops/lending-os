export type LienPosition = "1st" | "2nd" | "subordinate";

export interface DrawScheduleItem {
  n: number;
  amount: number;
  note?: string;
}

export interface Collateral {
  id: string;
  loanId: string;
  lienPosition: LienPosition | null;
  description: string | null;
  drawSchedule: DrawScheduleItem[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollateralDTO {
  loanId: string;
  lienPosition?: LienPosition;
  description?: string;
  drawSchedule?: DrawScheduleItem[];
}

export interface UpdateCollateralDTO {
  lienPosition?: LienPosition;
  description?: string;
  drawSchedule?: DrawScheduleItem[];
}

