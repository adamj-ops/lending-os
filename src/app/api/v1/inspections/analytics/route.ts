import { NextRequest } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";
import { requireOrganization } from "@/lib/clerk-server";
import { ok, serverError, badRequest } from "@/lib/api-response";
import { withRequestLogging } from "@/lib/api-logger";
import { z } from "zod";
import { parseQuery } from "@/lib/validation";

export const revalidate = 300; // ISR for 5 minutes

export const GET = withRequestLogging(async (req: NextRequest) => {
  try {
    const session = await requireOrganization();
    const url = new URL(req.url);
    const q = parseQuery(
      z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        loanIds: z.string().optional(),
        propertyIds: z.string().optional(),
        statuses: z.string().optional(),
        fundIds: z.string().optional(),
      }),
      url.searchParams
    );
    if (!q.success) return badRequest(q.message);
    const start = q.data.start || undefined;
    const end = q.data.end || undefined;
    const loanIds = q.data.loanIds?.split(",").filter(Boolean) || undefined;
    const propertyIds = q.data.propertyIds?.split(",").filter(Boolean) || undefined;
    const statuses = q.data.statuses?.split(",").filter(Boolean) || undefined;
    const fundIds = q.data.fundIds?.split(",").filter(Boolean) || undefined;

    // Filter analytics by organizationId from session
    // Note: Snapshots are global aggregates; proper filtering requires recomputing snapshots per org
    const rows = await AnalyticsService.getInspectionKpis({ 
      start, 
      end, 
      loanIds, 
      propertyIds, 
      statuses, 
      fundIds,
      organizationId: session.organizationId 
    });
    const latest = rows.length > 0 ? rows[rows.length - 1] : null;

    const payload = {
      kpis: latest
        ? {
            snapshotDate: latest.snapshotDate,
            scheduledCount: latest.scheduledCount,
            completedCount: latest.completedCount,
            avgCompletionHours: latest.avgCompletionHours,
          }
        : {
            snapshotDate: null,
            scheduledCount: 0,
            completedCount: 0,
            avgCompletionHours: null,
          },
      series: rows,
    };

    return ok(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        "X-Cache-Tags": "analytics:inspections,analytics:*",
      },
    });
  } catch (err: any) {
    return serverError("Failed to load inspection analytics", err?.message || String(err));
  }
});
