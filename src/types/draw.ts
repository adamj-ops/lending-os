/**
 * Draw Type System for Lending OS
 * Comprehensive types for construction draw management
 */

// ============ ENUMS ============
// Import from canonical source (database schema)
import {
  DrawStatusValues,
  InspectionStatusValues,
  InspectionTypeValues,
  type DrawStatus,
  type InspectionStatus,
  type InspectionType,
} from '@/db/schema/draws';
export type { DrawStatus, InspectionStatus, InspectionType };

// Enum-like value objects for ergonomics in the rest of the app
// ============ BASE TYPES ============

export interface Draw {
  id: string;
  loanId: string;
  
  // Draw Details
  drawNumber: number;
  amountRequested: string;
  amountApproved: string | null;
  amountDisbursed: string | null;
  
  // Work Description
  workDescription: string;
  budgetLineItem: string | null;
  contractorName: string | null;
  contractorContact: string | null;
  
  // Status & Workflow
  status: DrawStatus;
  requestedBy: string | null;
  approvedBy: string | null;
  inspectedBy: string | null;
  
  // Dates (Drizzle date fields return strings)
  requestedDate: string | null;
  approvedDate: string | null;
  inspectionDate: string | null;
  disbursedDate: string | null;
  
  // Metadata
  notes: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  id: string;
  drawId: string;
  
  // Inspection Details
  inspectionType: InspectionType;
  status: InspectionStatus;
  
  // Inspector & Location
  inspectorName: string;
  inspectorContact: string | null;
  inspectionLocation: string | null;
  
  // Results
  workCompletionPercentage: number | null;
  qualityRating: number | null; // 1-5
  safetyCompliant: boolean;
  
  // Findings
  findings: string | null;
  recommendations: string | null;
  photos: PhotoData[];
  signatures: SignatureData[];
  
  // Timing (Drizzle date fields return strings)
  scheduledDate: string | null;
  completedDate: string | null;
  inspectionDurationMinutes: number | null;
  
  // Metadata
  weatherConditions: string | null;
  equipmentUsed: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawSchedule {
  id: string;
  loanId: string;
  
  // Schedule Details
  totalDraws: number;
  totalBudget: string;
  scheduleData: DrawScheduleItem[];
  
  // Status
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
}

export interface DrawScheduleItem {
  drawNumber: number;
  description: string;
  budgetAmount: string;
  scheduledDate: string; // ISO date string
  dependencies?: number[]; // Draw numbers that must be completed first
}

export interface PhotoData {
  url: string;
  caption?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  fileSize?: number;
}

export interface SignatureData {
  signerName: string;
  signatureUrl: string;
  timestamp: string;
  role?: string; // e.g., "Inspector", "Contractor", "Borrower"
}

// ============ DTO TYPES ============

export interface CreateDrawDTO {
  loanId: string;
  amountRequested: number;
  workDescription: string;
  budgetLineItem?: string;
  contractorName?: string;
  contractorContact?: string;
  notes?: string;
  requestedBy?: string;
}

export interface UpdateDrawDTO {
  amountRequested?: number;
  workDescription?: string;
  budgetLineItem?: string;
  contractorName?: string;
  contractorContact?: string;
  notes?: string;
}

export interface ApproveDrawDTO {
  amountApproved: number;
  approvedBy: string;
  notes?: string;
}

export interface RejectDrawDTO {
  rejectedBy: string;
  rejectionReason: string;
}

export interface DisburseDrawDTO {
  amountDisbursed: number;
  disbursedBy: string;
  notes?: string;
}

export interface CreateInspectionDTO {
  drawId: string;
  inspectionType: InspectionType;
  inspectorName: string;
  inspectorContact?: string;
  inspectionLocation?: string;
  scheduledDate?: string | Date;
}

export interface UpdateInspectionDTO {
  status?: InspectionStatus;
  scheduledDate?: string | Date;
  inspectionLocation?: string;
  notes?: string;
}

export interface CompleteInspectionDTO {
  workCompletionPercentage: number;
  qualityRating: number; // 1-5
  safetyCompliant: boolean;
  findings?: string;
  recommendations?: string;
  photos?: PhotoData[];
  signatures?: SignatureData[];
  weatherConditions?: string;
  equipmentUsed?: string;
  inspectionDurationMinutes?: number;
}

export interface ScheduleInspectionDTO {
  inspectionType: InspectionType;
  inspectorName: string;
  inspectorContact?: string;
  scheduledDate: string | Date;
  inspectionLocation?: string;
}

export interface DrawFilters {
  status?: DrawStatus;
  contractor?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

// ============ RESPONSE TYPES ============

export interface DrawHistory {
  draws: Draw[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: DrawSummary;
}

export interface DrawSummary {
  totalRequested: string;
  totalApproved: string;
  totalDisbursed: string;
  remainingBudget: string;
  drawsCount: number;
  pendingDraws: number;
}

export interface BudgetStatus {
  totalBudget: string;
  totalRequested: string;
  totalApproved: string;
  totalDisbursed: string;
  remainingBudget: string;
  percentageUsed: number;
  lineItems: BudgetLineItem[];
}

export interface BudgetLineItem {
  name: string;
  budgetAmount: string;
  spentAmount: string;
  remainingAmount: string;
  percentageUsed: number;
}

// ============ MOBILE/PWA TYPES ============

export interface OfflineData {
  inspections: Inspection[];
  draws: Draw[];
  syncedAt: Date;
}

export interface SyncResult {
  success: boolean;
  syncedInspections: number;
  failedInspections: number;
  errors: string[];
}

// ============ WITH RELATIONS ============

export interface DrawWithInspections extends Draw {
  inspections?: Inspection[];
}

export interface DrawWithLoan extends Draw {
  loan?: {
    id: string;
    principal: string;
    propertyAddress: string;
  };
}

export interface InspectionWithDraw extends Inspection {
  draw?: {
    id: string;
    drawNumber: number;
    workDescription: string;
    amountRequested: string;
  };
}
