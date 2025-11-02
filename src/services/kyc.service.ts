import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { kycVerifications, kycDocuments, borrowers } from "@/db/schema";
import { eventBus } from "@/lib/events";

/**
 * KYC Service
 * 
 * Manages KYC/AML verification workflows for borrowers and investors.
 */

export interface InitiateVerificationDTO {
  borrowerId: string;
  userId?: string;
  organizationId: string;
  provider?: "persona" | "onfido" | "sumsub";
}

export interface UploadDocumentDTO {
  verificationId: string;
  documentType: string;
  s3Key: string;
  fileUrl: string;
  providerDocumentId?: string;
}

export interface VerificationRecord {
  id: string;
  organizationId: string;
  borrowerId: string | null;
  userId: string | null;
  provider: string;
  verificationId: string;
  status: string;
  submittedAt: Date;
  completedAt: Date | null;
  result: any;
  reviewNotes: string | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class KYCService {
  /**
   * Initiate KYC verification
   */
  static async initiateVerification(data: InitiateVerificationDTO): Promise<VerificationRecord> {
    // Get borrower information
    const borrower = await db
      .select()
      .from(borrowers)
      .where(eq(borrowers.id, data.borrowerId))
      .limit(1);

    if (!borrower.length) {
      throw new Error(`Borrower ${data.borrowerId} not found`);
    }

    // Create verification record
    const [verification] = await db
      .insert(kycVerifications)
      .values({
        organizationId: data.organizationId,
        borrowerId: data.borrowerId,
        userId: data.userId || null,
        provider: data.provider || "persona",
        verificationId: "", // Will be set after adapter creates verification
        status: "pending",
      })
      .returning();

    // Update borrower KYC status
    await db
      .update(borrowers)
      .set({
        kycStatus: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(borrowers.id, data.borrowerId));

    // Publish event
    await eventBus.publish({
      
      eventVersion: "1.0",
aggregateType: "KYCVerification",
      aggregateId: verification.id,
      payload: {
        verificationId: verification.id,
        borrowerId: data.borrowerId,
        organizationId: data.organizationId,
        provider: data.provider || "persona",
      },
    });

    return verification as VerificationRecord;
  }

  /**
   * Update verification ID after adapter creates it
   */
  static async updateVerificationId(
    verificationId: string,
    providerVerificationId: string
  ): Promise<VerificationRecord> {
    const [verification] = await db
      .update(kycVerifications)
      .set({
        verificationId: providerVerificationId,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(kycVerifications.id, verificationId))
      .returning();

    return verification as VerificationRecord;
  }

  /**
   * Update verification status
   */
  static async updateStatus(
    verificationId: string,
    status: "pending" | "in_progress" | "approved" | "rejected" | "requires_review",
    result?: any,
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<VerificationRecord> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (result) updateData.result = result;
    if (status === "approved" || status === "rejected" || status === "requires_review") {
      updateData.completedAt = new Date();
    }
    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;

    const [verification] = await db
      .update(kycVerifications)
      .set(updateData)
      .where(eq(kycVerifications.id, verificationId))
      .returning();

    // Update borrower KYC status
    if (verification.borrowerId) {
      await db
        .update(borrowers)
        .set({
          kycStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(borrowers.id, verification.borrowerId));
    }

    // Publish event based on status
    await KYCService.publishStatusEvent(verification as VerificationRecord, status);

    return verification as VerificationRecord;
  }

  /**
   * Get verification by ID
   */
  static async getVerification(id: string): Promise<VerificationRecord | null> {
    const [verification] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.id, id));

    return verification ? (verification as VerificationRecord) : null;
  }

  /**
   * Get verification by provider verification ID
   */
  static async getVerificationByProviderId(
    providerVerificationId: string
  ): Promise<VerificationRecord | null> {
    const [verification] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.verificationId, providerVerificationId));

    return verification ? (verification as VerificationRecord) : null;
  }

  /**
   * Get verifications for a borrower
   */
  static async getVerificationsByBorrowerId(borrowerId: string): Promise<VerificationRecord[]> {
    const verifications = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.borrowerId, borrowerId))
      .orderBy(desc(kycVerifications.submittedAt));

    return verifications as VerificationRecord[];
  }

  /**
   * Upload document for verification
   */
  static async uploadDocument(data: UploadDocumentDTO): Promise<any> {
    const [document] = await db
      .insert(kycDocuments)
      .values({
        verificationId: data.verificationId,
        documentType: data.documentType,
        s3Key: data.s3Key,
        fileUrl: data.fileUrl,
        providerDocumentId: data.providerDocumentId || null,
      })
      .returning();

    // Publish event
    await eventBus.publish({
      
      eventVersion: "1.0",
aggregateType: "KYCVerification",
      aggregateId: data.verificationId,
      payload: {
        verificationId: data.verificationId,
        documentId: document.id,
        documentType: data.documentType,
      },
    });

    return document;
  }

  /**
   * Get documents for a verification
   */
  static async getDocuments(verificationId: string): Promise<any[]> {
    const documents = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.verificationId, verificationId));

    return documents;
  }

  /**
   * Approve verification manually (for edge cases)
   */
  static async approveManually(
    verificationId: string,
    reviewedBy: string,
    reason: string
  ): Promise<VerificationRecord> {
    return await KYCService.updateStatus(
      verificationId,
      "approved",
      { manualApproval: true, reason },
      reason,
      reviewedBy
    );
  }

  /**
   * Publish status event to EventBus
   */
  private static async publishStatusEvent(
    verification: VerificationRecord,
    status: string
  ): Promise<void> {
    const eventTypeMap: Record<string, string> = {
      approved: "KYC.Approved",
      rejected: "KYC.Rejected",
      requires_review: "KYC.RequiresReview",
    };

    const eventType = eventTypeMap[status];
    if (!eventType) return;

    await eventBus.publish({
      eventType,
      aggregateType: "KYCVerification",
      aggregateId: verification.id,
      payload: {
        verificationId: verification.id,
        borrowerId: verification.borrowerId,
        organizationId: verification.organizationId,
        status: verification.status,
        provider: verification.provider,
        completedAt: verification.completedAt,
      },
    });
  }

  /**
   * Handle webhook payload from KYC provider
   */
  static async handleWebhook(
    providerVerificationId: string,
    event: string,
    payload: any
  ): Promise<void> {
    const verification = await KYCService.getVerificationByProviderId(providerVerificationId);
    if (!verification) {
      throw new Error(`Verification not found for provider ID: ${providerVerificationId}`);
    }

    // Map provider events to our status
    const statusMap: Record<string, string> = {
      "verification.created": "in_progress",
      "verification.approved": "approved",
      "verification.rejected": "rejected",
      "verification.pending_review": "requires_review",
    };

    const newStatus = statusMap[event];
    if (!newStatus) return;

    await KYCService.updateStatus(
      verification.id,
      newStatus as any,
      payload.result || payload
    );
  }
}

