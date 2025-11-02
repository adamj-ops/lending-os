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
    // Note: Snapshots are global aggregates; proper filtering requires recomputing snapshots per org
    const rows = await AnalyticsService.getLoanKpis({ 
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
            activeCount: latest.activeCount,
            delinquentCount: latest.delinquentCount,
            avgLtv: latest.avgLtv,
            totalPrincipal: latest.totalPrincipal,
            interestAccrued: latest.interestAccrued,
          }
        : {
            snapshotDate: null,
            activeCount: 0,
            delinquentCount: 0,
            avgLtv: null,
            totalPrincipal: "0",
            interestAccrued: "0",
          },
      series: rows,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        "X-Cache-Tags": "analytics:loans,analytics:*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load loan analytics", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

