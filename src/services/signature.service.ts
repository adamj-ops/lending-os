import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { documentSignatures, documentTemplates } from "@/db/schema";
import { eventBus } from "@/lib/events";

/**
 * Signature Service
 * 
 * Manages e-signature workflows for loan agreements, PPMs, subscription docs, and compliance disclosures.
 */

export interface CreateEnvelopeDTO {
  organizationId: string;
  documentType: "loan_agreement" | "ppm" | "subscription_agreement" | "compliance_disclosure" | "other";
  documentId?: string;
  loanId?: string;
  fundId?: string;
  signers: Array<{
    email: string;
    name: string;
    role: string;
    order?: number;
  }>;
  templateId?: string;
  provider?: "docusign" | "dropbox_sign";
}

export interface UpdateSignatureStatusDTO {
  status: "draft" | "sent" | "viewed" | "signed" | "completed" | "declined" | "voided";
  signedAt?: Date;
  viewedAt?: Date;
  completedAt?: Date;
  signedDocumentUrl?: string;
}

export interface SignatureRecord {
  id: string;
  organizationId: string;
  documentType: string;
  documentId: string | null;
  loanId: string | null;
  fundId: string | null;
  provider: string;
  envelopeId: string;
  status: string;
  signers: any;
  sentAt: Date | null;
  viewedAt: Date | null;
  signedAt: Date | null;
  completedAt: Date | null;
  documentUrl: string | null;
  signedDocumentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SignatureService {
  /**
   * Create a signature envelope
   * This creates the database record. The actual envelope creation happens in the adapter.
   */
  static async createEnvelope(data: CreateEnvelopeDTO): Promise<SignatureRecord> {
    const [signature] = await db
      .insert(documentSignatures)
      .values({
        organizationId: data.organizationId,
        documentType: data.documentType,
        documentId: data.documentId || null,
        loanId: data.loanId || null,
        fundId: data.fundId || null,
        provider: data.provider || "docusign",
        envelopeId: "", // Will be set after adapter creates envelope
        status: "draft",
        signers: data.signers as any,
      })
      .returning();

    return signature as SignatureRecord;
  }

  /**
   * Update envelope ID after adapter creates it
   */
  static async updateEnvelopeId(signatureId: string, envelopeId: string): Promise<SignatureRecord> {
    const [signature] = await db
      .update(documentSignatures)
      .set({
        envelopeId,
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(documentSignatures.id, signatureId))
      .returning();

    return signature as SignatureRecord;
  }

  /**
   * Update signature status
   */
  static async updateStatus(
    signatureId: string,
    data: UpdateSignatureStatusDTO
  ): Promise<SignatureRecord> {
    const updateData: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.viewedAt) updateData.viewedAt = data.viewedAt;
    if (data.signedAt) updateData.signedAt = data.signedAt;
    if (data.completedAt) updateData.completedAt = data.completedAt;
    if (data.signedDocumentUrl) updateData.signedDocumentUrl = data.signedDocumentUrl;

    const [signature] = await db
      .update(documentSignatures)
      .set(updateData)
      .where(eq(documentSignatures.id, signatureId))
      .returning();

    // Publish event based on status
    await SignatureService.publishStatusEvent(signature as SignatureRecord, data.status);

    return signature as SignatureRecord;
  }

  /**
   * Get signature by ID
   */
  static async getSignature(id: string): Promise<SignatureRecord | null> {
    const [signature] = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.id, id));

    return signature ? (signature as SignatureRecord) : null;
  }

  /**
   * Get signature by envelope ID
   */
  static async getSignatureByEnvelopeId(envelopeId: string): Promise<SignatureRecord | null> {
    const [signature] = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.envelopeId, envelopeId));

    return signature ? (signature as SignatureRecord) : null;
  }

  /**
   * Get signatures for a loan
   */
  static async getSignaturesByLoanId(loanId: string): Promise<SignatureRecord[]> {
    const signatures = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.loanId, loanId))
      .orderBy(desc(documentSignatures.createdAt));

    return signatures as SignatureRecord[];
  }

  /**
   * Get signatures for a fund
   */
  static async getSignaturesByFundId(fundId: string): Promise<SignatureRecord[]> {
    const signatures = await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.fundId, fundId))
      .orderBy(desc(documentSignatures.createdAt));

    return signatures as SignatureRecord[];
  }

  /**
   * Get document template by ID
   */
  static async getTemplate(id: string): Promise<any | null> {
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, id));

    return template || null;
  }

  /**
   * Get templates by type
   */
  static async getTemplatesByType(
    organizationId: string,
    type: string
  ): Promise<any[]> {
    const templates = await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.organizationId, organizationId),
          eq(documentTemplates.type, type as any),
          eq(documentTemplates.isActive, "true")
        )
      );

    return templates;
  }

  /**
   * Publish status event to EventBus
   */
  private static async publishStatusEvent(
    signature: SignatureRecord,
    status: string
  ): Promise<void> {
    const eventTypeMap: Record<string, string> = {
      sent: "Document.Sent",
      viewed: "Document.Viewed",
      signed: "Document.Signed",
      completed: "Document.Completed",
      declined: "Document.Declined",
      voided: "Document.Voided",
    };

    const eventType = eventTypeMap[status];
    if (!eventType) return;

    await eventBus.publish({
      eventType,
      domain: "Compliance",
      aggregateType: "DocumentSignature",
      aggregateId: signature.id,
      payload: {
        signatureId: signature.id,
        envelopeId: signature.envelopeId,
        documentType: signature.documentType,
        documentId: signature.documentId,
        loanId: signature.loanId,
        fundId: signature.fundId,
        status: signature.status,
        completedAt: signature.completedAt,
      },
    });
  }

  /**
   * Handle webhook payload from signature provider
   */
  static async handleWebhook(
    envelopeId: string,
    event: string,
    payload: any
  ): Promise<void> {
    const signature = await SignatureService.getSignatureByEnvelopeId(envelopeId);
    if (!signature) {
      throw new Error(`Signature not found for envelope ID: ${envelopeId}`);
    }

    // Map provider events to our status
    const statusMap: Record<string, string> = {
      "envelope.sent": "sent",
      "envelope.viewed": "viewed",
      "envelope.signed": "signed",
      "envelope.completed": "completed",
      "envelope.declined": "declined",
      "envelope.voided": "voided",
    };

    const newStatus = statusMap[event];
    if (!newStatus) return;

    const updateData: UpdateSignatureStatusDTO = {
      status: newStatus as any,
    };

    // Extract timing information from payload
    if (payload.viewedAt) updateData.viewedAt = new Date(payload.viewedAt);
    if (payload.signedAt) updateData.signedAt = new Date(payload.signedAt);
    if (payload.completedAt) updateData.completedAt = new Date(payload.completedAt);
    if (payload.signedDocumentUrl) updateData.signedDocumentUrl = payload.signedDocumentUrl;

    await SignatureService.updateStatus(signature.id, updateData);
  }
}

