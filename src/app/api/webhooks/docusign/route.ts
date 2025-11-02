import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter } from "@/integrations/signature/docusign.adapter";

/**
 * DocuSign Webhook Handler
 * 
 * Processes webhook events from DocuSign and updates signature status.
 * Publishes events to EventBus for downstream processing.
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature (DocuSign provides HMAC signature)
    // TODO: Implement signature verification
    // const signature = request.headers.get("X-DocuSign-Signature");
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

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

    if (!envelopeId) {
      return NextResponse.json(
        { error: "Missing envelopeId" },
        { status: 400 }
      );
    }

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
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[DocuSign Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (DocuSign Connect verification)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const challenge = query.get("challenge");

  // DocuSign Connect sends a challenge parameter for verification
  if (challenge) {
    return NextResponse.json({ challenge }, { status: 200 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}


