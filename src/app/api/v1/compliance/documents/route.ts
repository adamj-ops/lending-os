import { NextRequest } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";
import { withRequestLogging } from "@/lib/api-logger";
import { created, ok, badRequest, serverError, unprocessable } from "@/lib/api-response";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validation";

/**
 * Document Management API
 * 
 * POST /api/v1/compliance/documents - Generate/create document
 * GET /api/v1/compliance/documents - List documents
 */

export const POST = withRequestLogging(async (request: NextRequest) => {
  try {
    const body = await parseJsonBody(
      z.object({
        organizationId: z.string().uuid(),
        documentType: z.string().min(1),
        documentId: z.string().uuid().optional(),
        loanId: z.string().uuid().optional(),
        fundId: z.string().uuid().optional(),
        signers: z.array(z.object({ email: z.string().email(), name: z.string().min(1), role: z.string().min(1), order: z.number().int().optional() })),
        templateId: z.string().optional(),
      }),
      request
    );
    if (!body.success) return unprocessable("Invalid request body", body.issues);
    const { organizationId, documentType, documentId, loanId, fundId, signers, templateId } = body.data;

    // Create signature record
    const signature = await SignatureService.createEnvelope({
      organizationId,
      documentType,
      documentId,
      loanId,
      fundId,
      signers,
      templateId,
    });

    // Get DocuSign adapter (in production, load from config/env)
    // For now, use mock adapter
    const adapter = createDocuSignAdapter({
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || "",
      userId: process.env.DOCUSIGN_USER_ID || "",
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || "",
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || "",
    });

    // Create envelope in DocuSign
    // TODO: Load actual document content from S3 or generate from template
    const document = {
      name: `${documentType}_${signature.id}.pdf`,
      content: Buffer.from(""), // Placeholder
      fileExtension: "pdf",
    };

    const envelope = await adapter.createEnvelope(document, signers, templateId);

    // Update signature with envelope ID
    await SignatureService.updateEnvelopeId(signature.id, envelope.envelopeId);

    // Send envelope if status is "sent"
    if (envelope.status === "sent") {
      await adapter.sendEnvelope(envelope.envelopeId);
      await SignatureService.updateStatus(signature.id, { status: "sent" });
    }

    return created({ id: signature.id, envelopeId: envelope.envelopeId, status: signature.status, documentUrl: envelope.uri });
  } catch (error) {
    console.error("[Documents API] Error:", error);
    return serverError("Failed to create document signature");
  }
});

export const GET = withRequestLogging(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const loanId = searchParams.get("loanId");
    const fundId = searchParams.get("fundId");

    if (!organizationId) {
      return badRequest("Missing organizationId");
    }

    let signatures;

    if (loanId) {
      signatures = await SignatureService.getSignaturesByLoanId(loanId);
    } else if (fundId) {
      signatures = await SignatureService.getSignaturesByFundId(fundId);
    } else {
      return badRequest("Must provide loanId or fundId");
    }

    return ok({ signatures });
  } catch (error) {
    console.error("[Documents API] Error:", error);
    return serverError("Failed to fetch documents");
  }
});

