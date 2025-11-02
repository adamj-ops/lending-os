import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "@/db/client";
import {
  inspections,
  draws,
  InspectionStatusValues as InspectionStatus,
  DrawStatusValues as DrawStatus,
} from "@/db/schema";
import type {
  Inspection,
  CreateInspectionDTO,
  UpdateInspectionDTO,
  CompleteInspectionDTO,
  ScheduleInspectionDTO,
  PhotoData,
  OfflineData,
  SyncResult,
} from "@/types/draw";

export class InspectionService {
  // ============ CRUD OPERATIONS ============

  /**
   * Create a new inspection
   */
  static async createInspection(data: CreateInspectionDTO): Promise<Inspection> {
    const [inspection] = await db
      .insert(inspections)
      .values({
        drawId: data.drawId,
        inspectionType: data.inspectionType,
        inspectorName: data.inspectorName,
        inspectorContact: data.inspectorContact || null,
        inspectionLocation: data.inspectionLocation || null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().split('T')[0] : null,
        status: InspectionStatus.SCHEDULED,
        safetyCompliant: true,
        photos: JSON.stringify([]),
        signatures: JSON.stringify([]),
      })
      .returning();

    return {
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    } as Inspection;
  }

  /**
   * Get inspection by ID
   */
  static async getInspection(id: string): Promise<Inspection | null> {
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, id));

    if (!inspection) {
      return null;
    }

    return {
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    } as Inspection;
  }

  /**
   * Update inspection
   */
  static async updateInspection(
    id: string,
    data: UpdateInspectionDTO
  ): Promise<Inspection> {
    const [inspection] = await db
      .update(inspections)
      .set({
        status: data.status,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().split('T')[0] : undefined,
        inspectionLocation: data.inspectionLocation,
        updatedAt: new Date(),
      })
      .where(eq(inspections.id, id))
      .returning();

    return {
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    } as Inspection;
  }

  /**
   * Delete inspection
   */
  static async deleteInspection(id: string): Promise<boolean> {
    await db.delete(inspections).where(eq(inspections.id, id));
    return true;
  }

  // ============ DRAW-SPECIFIC OPERATIONS ============

  /**
   * Get all inspections for a draw
   */
  static async getDrawInspections(drawId: string): Promise<Inspection[]> {
    const result = await db
      .select()
      .from(inspections)
      .where(eq(inspections.drawId, drawId))
      .orderBy(desc(inspections.scheduledDate));

    return result.map((inspection) => ({
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    })) as Inspection[];
  }

  /**
   * Schedule an inspection for a draw
   */
  static async scheduleInspection(
    drawId: string,
    data: ScheduleInspectionDTO
  ): Promise<Inspection> {
    return this.createInspection({
      drawId,
      inspectionType: data.inspectionType,
      inspectorName: data.inspectorName,
      inspectorContact: data.inspectorContact,
      scheduledDate: data.scheduledDate,
      inspectionLocation: data.inspectionLocation,
    });
  }

  // ============ INSPECTION WORKFLOW ============

  /**
   * Start an inspection (mark as in progress)
   */
  static async startInspection(
    inspectionId: string,
    inspectorId: string
  ): Promise<Inspection> {
    return this.updateInspection(inspectionId, {
      status: InspectionStatus.IN_PROGRESS,
    });
  }

  /**
   * Complete an inspection
   */
  static async completeInspection(
    inspectionId: string,
    data: CompleteInspectionDTO
  ): Promise<Inspection> {
    const [inspection] = await db
      .update(inspections)
      .set({
        status: InspectionStatus.COMPLETED,
        workCompletionPercentage: data.workCompletionPercentage,
        qualityRating: data.qualityRating,
        safetyCompliant: data.safetyCompliant,
        findings: data.findings || null,
        recommendations: data.recommendations || null,
        photos: JSON.stringify(data.photos || []),
        signatures: JSON.stringify(data.signatures || []),
        weatherConditions: data.weatherConditions || null,
        equipmentUsed: data.equipmentUsed || null,
        inspectionDurationMinutes: data.inspectionDurationMinutes || null,
        completedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(eq(inspections.id, inspectionId))
      .returning();

    // Update draw status to inspected
    const [currentInspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, inspectionId));

    if (currentInspection) {
      const currentDate = new Date().toISOString().split('T')[0];
      await db
        .update(draws)
        .set({
          status: DrawStatus.INSPECTED,
          inspectedBy: inspectionId,
          inspectionDate: currentDate,
        })
        .where(eq(draws.id, currentInspection.drawId));
    }

    return {
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    } as Inspection;
  }

  /**
   * Mark inspection as failed
   */
  static async failInspection(
    inspectionId: string,
    reason: string
  ): Promise<Inspection> {
    const [inspection] = await db
      .update(inspections)
      .set({
        status: InspectionStatus.FAILED,
        findings: reason,
        updatedAt: new Date(),
      })
      .where(eq(inspections.id, inspectionId))
      .returning();

    return {
      ...inspection,
      photos: JSON.parse(inspection.photos || "[]"),
      signatures: JSON.parse(inspection.signatures || "[]"),
    } as Inspection;
  }

  // ============ PHOTO MANAGEMENT ============

  /**
   * Add photo to inspection
   */
  static async addInspectionPhoto(
    inspectionId: string,
    photo: PhotoData
  ): Promise<void> {
    const inspection = await this.getInspection(inspectionId);

    if (!inspection) {
      throw new Error("Inspection not found");
    }

    const photos = inspection.photos || [];
    photos.push(photo);

    await db
      .update(inspections)
      .set({
        photos: JSON.stringify(photos),
        updatedAt: new Date(),
      })
      .where(eq(inspections.id, inspectionId));
  }

  /**
   * Get inspection photos
   */
  static async getInspectionPhotos(inspectionId: string): Promise<PhotoData[]> {
    const inspection = await this.getInspection(inspectionId);

    if (!inspection) {
      return [];
    }

    return inspection.photos || [];
  }

  // ============ MOBILE/PWA OPERATIONS ============

  /**
   * Sync offline inspections
   */
  static async syncOfflineInspections(inspectorId: string): Promise<SyncResult> {
    // This would be implemented to sync offline data from the mobile app
    // For now, return a basic structure
    return {
      success: true,
      syncedInspections: 0,
      failedInspections: 0,
      errors: [],
    };
  }

  /**
   * Get offline inspection data for mobile app
   */
  static async getOfflineInspectionData(inspectorId: string): Promise<OfflineData> {
    // Get all pending inspections for this inspector
    const pendingInspections = await db
      .select()
      .from(inspections)
      .where(
        and(
          eq(inspections.status, InspectionStatus.SCHEDULED),
          eq(inspections.inspectorName, inspectorId) // Simplified - would use proper user lookup
        )
      );

    // Get related draws
    const drawIds = pendingInspections.map((i) => i.drawId);
    const relatedDraws = drawIds.length > 0 
      ? await db.select().from(draws).where(inArray(draws.id, drawIds))
      : [];

    return {
      inspections: pendingInspections.map((inspection) => ({
        ...inspection,
        photos: JSON.parse(inspection.photos || "[]"),
        signatures: JSON.parse(inspection.signatures || "[]"),
      })) as Inspection[],
      draws: relatedDraws as any[],
      syncedAt: new Date(),
    };
  }
}

