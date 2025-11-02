import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { eventIngest } from "@/db/schema/analytics";
import { desc, eq, and, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { requireOrganization } from "@/lib/clerk-server";

export const revalidate = 0; // No caching for real-time events

export async function GET(req: NextRequest) {
  try {
    const session = await requireOrganization();
    
    // Ensure organization context is available
    if (!session.organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const domain = url.searchParams.get("domain") || undefined;
    const eventType = url.searchParams.get("eventType") || undefined;

    // Build where conditions
    const conditions: SQL[] = [];
    
    // Filter by organizationId from payload (events store organizationId in payload JSONB)
    // Note: Some events may have organizationId in payload.organizationId or payload.organization_id
    // We check both to handle different event schemas
    conditions.push(
      sql`(
        ${eventIngest.payload}->>'organizationId' = ${session.organizationId}::text
        OR ${eventIngest.payload}->>'organization_id' = ${session.organizationId}::text
      )`
    );
    
    if (domain) {
      conditions.push(eq(eventIngest.domain, domain));
    }
    if (eventType) {
      conditions.push(eq(eventIngest.eventType, eventType));
    }

    const baseQuery = db
      .select()
      .from(eventIngest);

    const events = await (conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery
    )
      .orderBy(desc(eventIngest.occurredAt))
      .limit(limit);

    return NextResponse.json({
      events: events.map(event => ({
        id: event.id,
        eventId: event.eventId,
        eventType: event.eventType,
        domain: event.domain,
        aggregateId: event.aggregateId,
        payload: event.payload,
        occurredAt: event.occurredAt,
        ingestedAt: event.ingestedAt,
      })),
      count: events.length,
    });
  } catch (err: any) {
    // Handle authentication errors
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch events", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireOrganization();
    
    // Ensure organization context is available
    if (!session.organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { eventType, domain, aggregateId, eventId, payload } = body;

    if (!eventType || !domain || !aggregateId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields: eventType, domain, aggregateId, eventId" },
        { status: 400 }
      );
    }

    // Ensure payload includes organizationId for filtering
    const enrichedPayload = {
      ...(payload || {}),
      organizationId: session.organizationId,
    };

    const event = await db.insert(eventIngest).values({
      eventId,
      eventType,
      domain,
      aggregateId,
      payload: enrichedPayload,
      occurredAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      event: event[0],
    });
  } catch (err: any) {
    // Handle authentication errors
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create event", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
