import { NextRequest, NextResponse } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { verifyHmac } from "@/lib/webhook-signature";

/**
 * Persona Webhook Handler
 * 
 * Processes webhook events from Persona and updates KYC verification status.
 * Publishes events to EventBus for downstream processing.
 */

export const POST = withRequestLogging(async (request: NextRequest) => {
  try {
    const raw = await request.text();
    const payload = JSON.parse(raw);

    // Verify webhook signature (Persona provides HMAC signature)
    // TODO: Implement signature verification
    const personaSecret = process.env.PERSONA_WEBHOOK_SECRET;
    const signature = request.headers.get("x-persona-signature") || request.headers.get("X-Persona-Signature");
    if (personaSecret && signature) {
      const valid = verifyHmac({ secret: personaSecret, payload: raw, signature });
      if (!valid) return unauthorized("Invalid signature");
    }

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

    if (!inquiryId) return badRequest("Missing inquiryId");

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
    return ok({ status: "success" });
  } catch (error) {
    console.error("[Persona Webhook] Error:", error);
    return serverError("Webhook processing failed");
  }
});

// GET endpoint for webhook verification
export const GET = withRequestLogging(async (request: NextRequest) => NextResponse.json({ status: "ok" }, { status: 200 }));
