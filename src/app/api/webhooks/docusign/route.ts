import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter } from "@/integrations/signature/docusign.adapter";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { verifyHmac } from "@/lib/webhook-signature";

/**
 * DocuSign Webhook Handler
 * 
 * Processes webhook events from DocuSign and updates signature status.
 * Publishes events to EventBus for downstream processing.
 */

export const POST = withRequestLogging(async (request: NextRequest) => {
  try {
    const raw = await request.text();
    const payload = JSON.parse(raw);

    // Verify webhook signature (DocuSign provides HMAC signature)
    // TODO: Implement signature verification
    const dsSecret = process.env.DOCUSIGN_WEBHOOK_SECRET;
    const signature = request.headers.get('x-docusign-signature-1') || request.headers.get('X-DocuSign-Signature-1');
    if (dsSecret && signature) {
      const valid = verifyHmac({ secret: dsSecret, payload: raw, signature });
      if (!valid) return unauthorized('Invalid signature');
    }

    // Parse DocuSign webhook payload
    // DocuSign sends webhooks in Connect format:
    // {
    //   event: "envelope-sent" | "envelope-delivered" | "envelope-signed" | "envelope-completed" | "envelope-declined" | "envelope-voided",
    //   data: {
    //     envelopeId: string,
    //     status: string,
    //     ...
    //   }
    // }

    const event = payload.event || payload.data?.event;
    const envelopeId = payload.data?.envelopeId || payload.envelopeId;

    if (!envelopeId) return badRequest("Missing envelopeId");

    // Map DocuSign events to our internal events
    const eventMap: Record<string, string> = {
      "envelope-sent": "envelope.sent",
      "envelope-delivered": "envelope.viewed",
      "envelope-signed": "envelope.signed",
      "envelope-completed": "envelope.completed",
      "envelope-declined": "envelope.declined",
      "envelope-voided": "envelope.voided",
    };

    const mappedEvent = eventMap[event] || event;

    // Process webhook with SignatureService
    await SignatureService.handleWebhook(envelopeId, mappedEvent, payload.data || payload);

    // Return success to DocuSign
    return ok({ status: "success" });
  } catch (error) {
    console.error("[DocuSign Webhook] Error:", error);
    return serverError("Webhook processing failed");
  }
});

// GET endpoint for webhook verification (DocuSign Connect verification)
export const GET = withRequestLogging(async (request: NextRequest) => {
  const query = request.nextUrl.searchParams;
  const challenge = query.get("challenge");
  if (challenge) return NextResponse.json({ challenge }, { status: 200 });
  return NextResponse.json({ status: "ok" }, { status: 200 });
});
