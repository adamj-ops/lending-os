export enum EntityType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
  FUND = "fund",
  IRA = "ira", // v2 addition
}

export interface Lender {
  id: string;
  organizationId: string;
  name: string;
  entityType: EntityType;
  contactEmail: string;
  contactPhone: string | null; // v2 addition
  totalCommitted: string;
  totalDeployed: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLenderDTO {
  organizationId: string;
  name: string;
  entityType: EntityType | "individual" | "company" | "fund" | "ira";
  contactEmail: string;
  contactPhone?: string; // v2 addition
  totalCommitted?: number | string;
  totalDeployed?: number | string;
}

export interface UpdateLenderDTO {
  name?: string;
  entityType?: EntityType | "individual" | "company" | "fund" | "ira";
  contactEmail?: string;
  contactPhone?: string | null; // v2 addition
  totalCommitted?: number | string;
  totalDeployed?: number | string;
}

