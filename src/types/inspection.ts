export interface Inspection {
  id: string;
  drawId: string;
  inspectionType: InspectionType;
  inspectorName?: string;
  scheduledDate?: string | null;
  completedDate?: string | null;
  findings?: string;
  photos?: string[];
  status: InspectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInspectionDTO {
  drawId: string;
  inspectionType: InspectionType;
  inspectorName?: string;
  scheduledDate?: string;
  findings?: string;
  photos?: string[];
}

export interface UpdateInspectionDTO {
  inspectionType?: InspectionType;
  inspectorName?: string;
  scheduledDate?: string;
  completedDate?: string;
  findings?: string;
  photos?: string[];
  status?: InspectionStatus;
}

// Import types from the canonical source (database schema)
import {
  InspectionStatusValues,
  InspectionTypeValues,
  type InspectionStatus,
  type InspectionType,
} from '@/db/schema/draws';
export type { InspectionStatus, InspectionType };
