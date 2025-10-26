export interface Borrower {
  id: string;
  organizationId: string;
  
  // Borrower type (v2)
  type: "individual" | "entity";
  
  // Individual fields (optional for entities)
  firstName: string | null;
  lastName: string | null;
  
  // Entity fields (optional for individuals)
  name: string | null; // For entities
  
  // Common fields
  email: string;
  phone: string | null;
  address: string | null;
  
  // Additional fields
  creditScore: number | null;
  taxIdEncrypted: string | null; // Encrypted SSN/EIN (v2)
  
  // Backward compatibility
  companyName: string | null; // Deprecated: use name for entities
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBorrowerDTO {
  organizationId: string;
  type: "individual" | "entity";
  firstName?: string;
  lastName?: string;
  name?: string; // For entities
  email: string;
  phone?: string;
  address?: string;
  creditScore?: number;
  taxId?: string; // Will be encrypted
  companyName?: string; // Deprecated
}

export interface UpdateBorrowerDTO {
  type?: "individual" | "entity";
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string;
  phone?: string | null;
  address?: string | null;
  creditScore?: number | null;
  taxIdEncrypted?: string | null;
  companyName?: string | null; // Deprecated
}

export enum DocumentType {
  ID = "id",
  TAX_RETURN = "tax_return",
  BANK_STATEMENT = "bank_statement",
  OTHER = "other",
}

export interface BorrowerDocument {
  id: string;
  borrowerId: string;
  documentType: DocumentType;
  fileUrl: string;
  uploadedAt: Date;
}

