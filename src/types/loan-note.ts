export interface LoanNote {
  id: string;
  loanId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoanNoteDTO {
  loanId: string;
  content: string;
  createdBy: string;
}

export interface UpdateLoanNoteDTO {
  content: string;
}

