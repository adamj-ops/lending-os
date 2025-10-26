export enum LoanDocumentType {
  APPLICATION = "application",
  APPRAISAL = "appraisal",
  TITLE = "title",
  INSURANCE = "insurance",
  CLOSING_DOCS = "closing_docs",
  OTHER = "other",
}

export interface LoanDocument {
  id: string;
  loanId: string;
  documentType: LoanDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: string | null;
  uploadedBy: string | null;
  uploadedAt: Date;
}

export interface CreateLoanDocumentDTO {
  loanId: string;
  documentType: LoanDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  uploadedBy?: string;
}

