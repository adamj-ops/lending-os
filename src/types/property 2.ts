export enum PropertyType {
  SINGLE_FAMILY = "single_family",
  MULTI_FAMILY = "multi_family",
  COMMERCIAL = "commercial",
  LAND = "land",
}

export interface Property {
  id: string;
  organizationId: string; // v2 addition
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: PropertyType;
  purchasePrice: string;
  appraisedValue: string | null;
  appraisalDate: Date | null;
  
  // v2 additions
  occupancy: "owner_occupied" | "tenant_occupied" | "vacant" | null;
  estimatedValue: string | null;
  rehabBudget: string | null;
  photos: Array<{ key: string; url?: string }> | null; // JSONB
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDTO {
  organizationId: string; // v2 addition
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: PropertyType;
  purchasePrice: number | string;
  appraisedValue?: number | string;
  appraisalDate?: Date;
  
  // v2 additions
  occupancy?: "owner_occupied" | "tenant_occupied" | "vacant";
  estimatedValue?: number | string;
  rehabBudget?: number | string;
  photos?: Array<{ key: string; url?: string }>;
}

export interface UpdatePropertyDTO {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType?: PropertyType;
  purchasePrice?: number | string;
  appraisedValue?: number | string | null;
  appraisalDate?: Date | null;
  
  // v2 additions
  occupancy?: "owner_occupied" | "tenant_occupied" | "vacant" | null;
  estimatedValue?: number | string | null;
  rehabBudget?: number | string | null;
  photos?: Array<{ key: string; url?: string }> | null;
}

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  fileUrl: string;
  caption: string | null;
  uploadedAt: Date;
}

