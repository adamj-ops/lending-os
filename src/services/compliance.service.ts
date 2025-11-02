import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "@/db/client";
import {
  complianceFilings,
  licenses,
  auditLogs,
  complianceRules,
} from "@/db/schema";
import { eventBus } from "@/lib/events";

/**
 * Compliance Service
 * 
 * Manages compliance filings, licenses, audit logs, and compliance rules.
 */

export interface CreateFilingDTO {
  organizationId: string;
  filingType: string;
  filingName: string;
  description?: string;
  dueDate: Date;
  documentId?: string;
}

export interface TrackLicenseDTO {
  organizationId: string;
  licenseType: string;
  licenseNumber: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  notes?: string;
}

export interface UpdateFilingDTO {
  filingType?: string;
  filingName?: string;
  description?: string | null;
  dueDate?: Date;
  status?: string;
  documentId?: string | null;
  notes?: string | null;
}

export interface UpdateLicenseDTO {
  licenseType?: string;
  licenseNumber?: string;
  issuer?: string;
  issueDate?: Date;
  expirationDate?: Date;
  status?: string;
  notes?: string | null;
}

export interface CreateAuditLogDTO {
  organizationId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  userId?: string;
  action: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface FilingFilters {
  status?: string;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  limit?: number;
  offset?: number;
}

export interface LicenseFilters {
  status?: string;
  expirationDateStart?: Date;
  expirationDateEnd?: Date;
  limit?: number;
  offset?: number;
}

export interface FilingRecord {
  id: string;
  organizationId: string;
  filingType: string;
  filingName: string;
  description: string | null;
  dueDate: Date;
  submittedDate: Date | null;
  status: string;
  documentId: string | null;
  filingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseRecord {
  id: string;
  organizationId: string;
  licenseType: string;
  licenseNumber: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogRecord {
  id: string;
  organizationId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  action: string;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

export class ComplianceService {
  /**
   * Create a filing record
   */
  static async createFiling(data: CreateFilingDTO): Promise<FilingRecord> {
    const [filing] = await db
      .insert(complianceFilings)
      .values({
        organizationId: data.organizationId,
        filingType: data.filingType,
        filingName: data.filingName,
        description: data.description || null,
        dueDate: data.dueDate,
        documentId: data.documentId || null,
        status: "pending",
      })
      .returning();

    // Publish event if filing is due soon
    const daysUntilDue = Math.ceil(
      (data.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 30) {
      await eventBus.publish({
        eventType: "Filing.Due",
        domain: "Compliance",
        aggregateType: "ComplianceFiling",
        aggregateId: filing.id,
        payload: {
          filingId: filing.id,
          organizationId: data.organizationId,
          filingType: data.filingType,
          dueDate: data.dueDate,
          daysUntilDue,
        },
      });
    }

    return filing as FilingRecord;
  }

  /**
   * Get upcoming filings
   */
  static async getUpcomingFilings(
    organizationId: string,
    days: number = 30
  ): Promise<FilingRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const filings = await db
      .select()
      .from(complianceFilings)
      .where(
        and(
          eq(complianceFilings.organizationId, organizationId),
          eq(complianceFilings.status, "pending"),
          lte(complianceFilings.dueDate, cutoffDate),
          gte(complianceFilings.dueDate, new Date())
        )
      )
      .orderBy(complianceFilings.dueDate);

    return filings as FilingRecord[];
  }

  /**
   * Submit a filing
   */
  static async submitFiling(
    filingId: string,
    organizationId: string,
    submittedDate: Date,
    filingNumber?: string
  ): Promise<FilingRecord> {
    // Verify filing exists and belongs to organization
    const currentFiling = await this.getFilingById(filingId, organizationId);
    if (!currentFiling) {
      throw new Error("Filing not found");
    }

    const [filing] = await db
      .update(complianceFilings)
      .set({
        status: "submitted",
        submittedDate,
        filingNumber: filingNumber || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(complianceFilings.id, filingId),
          eq(complianceFilings.organizationId, organizationId)
        )
      )
      .returning();

    if (!filing) {
      throw new Error("Filing not found");
    }

    // Publish event
    await eventBus.publish({
      eventType: "Filing.Submitted",
      domain: "Compliance",
      aggregateType: "ComplianceFiling",
      aggregateId: filingId,
      payload: {
        filingId,
        organizationId: currentFiling.organizationId,
        filingType: currentFiling.filingType,
        submittedDate,
      },
    });

    return filing as FilingRecord;
  }

  /**
   * Track a license
   */
  static async trackLicense(data: TrackLicenseDTO): Promise<LicenseRecord> {
    // Determine status based on expiration date
    const now = new Date();
    const status = data.expirationDate < now ? "expired" : "active";

    const [license] = await db
      .insert(licenses)
      .values({
        organizationId: data.organizationId,
        licenseType: data.licenseType,
        licenseNumber: data.licenseNumber,
        issuer: data.issuer,
        issueDate: data.issueDate,
        expirationDate: data.expirationDate,
        status,
        notes: data.notes || null,
      })
      .returning();

    // Publish event if license is expiring soon
    const daysUntilExpiration = Math.ceil(
      (data.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiration <= 90 && daysUntilExpiration > 0) {
      await eventBus.publish({
        eventType: "License.Expiring",
        domain: "Compliance",
        aggregateType: "License",
        aggregateId: license.id,
        payload: {
          licenseId: license.id,
          organizationId: data.organizationId,
          licenseType: data.licenseType,
          expirationDate: data.expirationDate,
          daysUntilExpiration,
        },
      });
    }

    return license as LicenseRecord;
  }

  /**
   * Get expiring licenses
   */
  static async getExpiringLicenses(
    organizationId: string,
    days: number = 90
  ): Promise<LicenseRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const licensesList = await db
      .select()
      .from(licenses)
      .where(
        and(
          eq(licenses.organizationId, organizationId),
          eq(licenses.status, "active"),
          lte(licenses.expirationDate, cutoffDate),
          gte(licenses.expirationDate, new Date())
        )
      )
      .orderBy(licenses.expirationDate);

    return licensesList as LicenseRecord[];
  }

  /**
   * Create audit log entry
   */
  static async createAuditLog(data: CreateAuditLogDTO): Promise<AuditLogRecord> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values({
        organizationId: data.organizationId,
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId || null,
        action: data.action,
        changes: data.changes || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      })
      .returning();

    // Publish event
    await eventBus.publish({
      eventType: "Audit.Created",
      domain: "Compliance",
      aggregateType: "AuditLog",
      aggregateId: auditLog.id,
      payload: {
        auditLogId: auditLog.id,
        organizationId: data.organizationId,
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
      },
    });

    return auditLog as AuditLogRecord;
  }

  /**
   * Query audit logs
   */
  static async queryAuditLog(filters: {
    organizationId: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogRecord[]> {
    const conditions = [eq(auditLogs.organizationId, filters.organizationId)];

    if (filters.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogs.entityId, filters.entityId));
    }
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.startDate) {
      conditions.push(gte(auditLogs.timestamp, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(auditLogs.timestamp, filters.endDate));
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return logs as AuditLogRecord[];
  }

  /**
   * Get licenses for organization
   */
  static async getLicenses(organizationId: string): Promise<LicenseRecord[]> {
    const licensesList = await db
      .select()
      .from(licenses)
      .where(eq(licenses.organizationId, organizationId))
      .orderBy(desc(licenses.expirationDate));

    return licensesList as LicenseRecord[];
  }

  /**
   * Get filings for organization with optional filters
   */
  static async getFilings(
    organizationId: string,
    filters?: FilingFilters
  ): Promise<FilingRecord[]> {
    const conditions = [eq(complianceFilings.organizationId, organizationId)];

    // Apply filters
    if (filters?.status) {
      conditions.push(eq(complianceFilings.status, filters.status));
    }
    if (filters?.dueDateStart) {
      conditions.push(gte(complianceFilings.dueDate, filters.dueDateStart));
    }
    if (filters?.dueDateEnd) {
      conditions.push(lte(complianceFilings.dueDate, filters.dueDateEnd));
    }

    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    const filings = await db
      .select()
      .from(complianceFilings)
      .where(and(...conditions))
      .orderBy(complianceFilings.dueDate)
      .limit(limit)
      .offset(offset);

    return filings as FilingRecord[];
  }

  /**
   * Get single filing by ID with org ownership check
   */
  static async getFilingById(
    id: string,
    organizationId: string
  ): Promise<FilingRecord | null> {
    const [filing] = await db
      .select()
      .from(complianceFilings)
      .where(
        and(
          eq(complianceFilings.id, id),
          eq(complianceFilings.organizationId, organizationId)
        )
      );

    return filing ? (filing as FilingRecord) : null;
  }

  /**
   * Update filing with org check and status transition validation
   */
  static async updateFiling(
    id: string,
    organizationId: string,
    data: UpdateFilingDTO
  ): Promise<FilingRecord> {
    // Get current filing
    const currentFiling = await this.getFilingById(id, organizationId);
    if (!currentFiling) {
      throw new Error("Filing not found");
    }

    // Validate status transitions if status is being updated
    if (data.status && data.status !== currentFiling.status) {
      this.validateFilingStatusTransition(currentFiling.status, data.status);
    }

    // Update filing
    const [filing] = await db
      .update(complianceFilings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(complianceFilings.id, id),
          eq(complianceFilings.organizationId, organizationId)
        )
      )
      .returning();

    if (!filing) {
      throw new Error("Filing not found");
    }

    // Publish event if status changed
    if (data.status && data.status !== currentFiling.status) {
      await eventBus.publish({
        eventType: "Filing.StatusChanged",
        domain: "Compliance",
        aggregateType: "ComplianceFiling",
        aggregateId: id,
        payload: {
          filingId: id,
          organizationId,
          previousStatus: currentFiling.status,
          newStatus: data.status,
        },
      });
    }

    return filing as FilingRecord;
  }

  /**
   * Validate filing status transitions
   * pending → submitted → accepted/rejected (no backward transitions)
   */
  private static validateFilingStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      pending: ["submitted"],
      submitted: ["accepted", "rejected"],
      accepted: [],
      rejected: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Get licenses for organization with optional filters
   */
  static async getLicenses(
    organizationId: string,
    filters?: LicenseFilters
  ): Promise<LicenseRecord[]> {
    const conditions = [eq(licenses.organizationId, organizationId)];

    // Apply filters
    if (filters?.status) {
      conditions.push(eq(licenses.status, filters.status));
    }
    if (filters?.expirationDateStart) {
      conditions.push(gte(licenses.expirationDate, filters.expirationDateStart));
    }
    if (filters?.expirationDateEnd) {
      conditions.push(lte(licenses.expirationDate, filters.expirationDateEnd));
    }

    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    const licensesList = await db
      .select()
      .from(licenses)
      .where(and(...conditions))
      .orderBy(desc(licenses.expirationDate))
      .limit(limit)
      .offset(offset);

    return licensesList as LicenseRecord[];
  }

  /**
   * Get single license by ID with org ownership check
   */
  static async getLicenseById(
    id: string,
    organizationId: string
  ): Promise<LicenseRecord | null> {
    const [license] = await db
      .select()
      .from(licenses)
      .where(
        and(
          eq(licenses.id, id),
          eq(licenses.organizationId, organizationId)
        )
      );

    return license ? (license as LicenseRecord) : null;
  }

  /**
   * Update license with org check and status transition validation
   */
  static async updateLicense(
    id: string,
    organizationId: string,
    data: UpdateLicenseDTO
  ): Promise<LicenseRecord> {
    // Get current license
    const currentLicense = await this.getLicenseById(id, organizationId);
    if (!currentLicense) {
      throw new Error("License not found");
    }

    // Validate status transitions if status is being updated
    if (data.status && data.status !== currentLicense.status) {
      this.validateLicenseStatusTransition(currentLicense.status, data.status);
    }

    // Update license
    const [license] = await db
      .update(licenses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(licenses.id, id),
          eq(licenses.organizationId, organizationId)
        )
      )
      .returning();

    if (!license) {
      throw new Error("License not found");
    }

    // Publish event if status changed
    if (data.status && data.status !== currentLicense.status) {
      await eventBus.publish({
        eventType: "License.StatusChanged",
        domain: "Compliance",
        aggregateType: "License",
        aggregateId: id,
        payload: {
          licenseId: id,
          organizationId,
          previousStatus: currentLicense.status,
          newStatus: data.status,
        },
      });
    }

    return license as LicenseRecord;
  }

  /**
   * Validate license status transitions
   * active → expired/pending/revoked, pending → active, expired → active
   */
  private static validateLicenseStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      active: ["expired", "pending", "revoked"],
      expired: ["active"],
      pending: ["active"],
      revoked: [], // Revoked licenses cannot be reactivated
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
