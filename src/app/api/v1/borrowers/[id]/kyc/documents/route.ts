import { NextRequest } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { PersonaAdapter, createPersonaAdapter } from "@/integrations/kyc/persona.adapter";
import { withRequestLogging } from "@/lib/api-logger";
import { created, notFound, badRequest, serverError } from "@/lib/api-response";

/**
 * KYC Document Upload API
 * 
 * POST /api/v1/borrowers/:id/kyc/documents - Upload documents
 */

export const POST = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: borrowerId } = await params;
    const formData = await request.formData();

    const verificationId = formData.get("verificationId") as string;
    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;

    if (!verificationId || !documentType || !file) return badRequest("Missing required fields: verificationId, documentType, file");

    // Get verification
    const verification = await KYCService.getVerification(verificationId);
    if (!verification || verification.borrowerId !== borrowerId) return notFound("Verification not found");

    // TODO: Upload file to S3 and get URL
    // For now, use placeholder
    const s3Key = `kyc/${verificationId}/${file.name}`;
    const fileUrl = `https://s3.amazonaws.com/bucket/${s3Key}`;

    // Upload document to Persona
    const adapter = createPersonaAdapter({
      apiKey: process.env.PERSONA_API_KEY || "",
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await adapter.uploadDocument(verification.verificationId, {
      type: documentType,
      content: fileBuffer,
      filename: file.name,
    });

    // Save document record
    const document = await KYCService.uploadDocument({
      verificationId,
      documentType,
      s3Key,
      fileUrl,
    });

    return created({ id: document.id, documentType: document.documentType, fileUrl: document.fileUrl });
  } catch (error) {
    console.error("[KYC Documents API] Error:", error);
    return serverError("Failed to upload document");
  }
});

