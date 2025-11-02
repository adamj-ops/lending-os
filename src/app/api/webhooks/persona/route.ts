import { NextRequest, NextResponse } from "next/server";
import { KYCService } from "@/services/kyc.service";

/**
 * Persona Webhook Handler
 * 
 * Processes webhook events from Persona and updates KYC verification status.
 * Publishes events to EventBus for downstream processing.
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature (Persona provides HMAC signature)
    // TODO: Implement signature verification
    // const signature = request.headers.get("X-Persona-Signature");
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Parse Persona webhook payload
    // Persona sends webhooks in format:
    // {
    //   "data": {
    //     "type": "event",
    //     "id": "evt_xxx",
    //     "attributes": {
    //       "name": "inquiry.started" | "inquiry.approved" | "inquiry.failed" | "inquiry.review.pending",
    //       "payload": {
    //         "data": {
    //           "id": "inq_xxx",
    //           "type": "inquiry",
    //           ...
    //         }
    //       }
    //     }
    //   }
    // }

    const eventName = payload.data?.attributes?.name || payload.event;
    const inquiryId = payload.data?.attributes?.payload?.data?.id || payload.inquiryId;

    if (!inquiryId) {
      return NextResponse.json(
        { error: "Missing inquiryId" },
        { status: 400 }
      );
    }

    // Map Persona events to our internal events
    const eventMap: Record<string, string> = {
      "inquiry.started": "verification.created",
      "inquiry.approved": "verification.approved",
      "inquiry.failed": "verification.rejected",
      "inquiry.review.pending": "verification.pending_review",
    };

    const mappedEvent = eventMap[eventName] || eventName;

    // Process webhook with KYCService
    await KYCService.handleWebhook(
      inquiryId,
      mappedEvent,
      payload.data?.attributes?.payload || payload
    );

    // Return success to Persona
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[Persona Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}


