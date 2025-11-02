import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";
import { requireOrganization } from "@/lib/clerk-server";

export const revalidate = 300; // ISR for 5 minutes

export async function GET(req: NextRequest) {
  try {
    const session = await requireOrganization();
    const url = new URL(req.url);
    const start = url.searchParams.get("start") || undefined;
    const end = url.searchParams.get("end") || undefined;
    const loanIds = url.searchParams.get("loanIds")?.split(",").filter(Boolean) || undefined;
    const propertyIds = url.searchParams.get("propertyIds")?.split(",").filter(Boolean) || undefined;
    const statuses = url.searchParams.get("statuses")?.split(",").filter(Boolean) || undefined;
    const fundIds = url.searchParams.get("fundIds")?.split(",").filter(Boolean) || undefined;

    // Filter analytics by organizationId from session
    const rows = await AnalyticsService.getCollectionsKpis({ 
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
            amountReceived: latest.amountReceived,
            amountScheduled: latest.amountScheduled,
            lateCount: latest.lateCount,
            avgCollectionDays: latest.avgCollectionDays,
          }
        : {
            snapshotDate: null,
            amountReceived: "0",
            amountScheduled: "0",
            lateCount: 0,
            avgCollectionDays: null,
          },
      series: rows,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        "X-Cache-Tags": "analytics:payments,analytics:*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load payment analytics", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

