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

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum InspectionType {
  QUALITY = 'quality',
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  PROGRESS = 'progress',
  FINAL = 'final',
  OTHER = 'other',
}
