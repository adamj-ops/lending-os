import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { eventIngest } from "@/db/schema/analytics";
import { desc, gt, sql, and } from "drizzle-orm";
import { requireOrganization } from "@/lib/clerk-server";
import { ok, serverError } from "@/lib/api-response";
import { withRequestLogging } from "@/lib/api-logger";

export const revalidate = 0; // No caching for real-time events

export const GET = withRequestLogging(async (req: NextRequest) => {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Filter events by organization context
    // Events store organizationId in payload. Filter by checking payload JSONB.
    // Note: This is a simple text search - for production, consider storing organizationId in a separate column
    const conditions: any[] = [];
    
    if (session.organizationId) {
      conditions.push(sql`${eventIngest.payload}::text LIKE ${'%"organizationId":"' + session.organizationId + '"%'}`);
    }
    
    if (since) {
      conditions.push(gt(eventIngest.occurredAt, new Date(since)));
    }

    const query = db.select().from(eventIngest);
    const events = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query
    )
      .orderBy(desc(eventIngest.occurredAt))
      .limit(Math.min(limit, 100)); // Cap at 100 for safety

    return ok({
      events,
      timestamp: new Date().toISOString(),
      count: events.length
    });
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return serverError("Failed to fetch recent events", error instanceof Error ? error.message : String(error));
  }
});
