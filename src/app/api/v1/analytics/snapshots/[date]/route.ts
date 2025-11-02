import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  fundSnapshots,
  loanSnapshots,
  paymentSnapshots,
  inspectionSnapshots,
} from "@/db/schema";
import { AnalyticsService } from "@/services/analytics.service";
import { requireOrganization } from "@/lib/clerk-server";

export const revalidate = 300; // ISR for 5 minutes

/**
 * GET /api/v1/analytics/snapshots/[date]
 * 
 * Get comprehensive snapshot data for a specific date
 * Supports query parameters for filtering by entity types
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const session = await requireOrganization();
    const { date } = await params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const includeFunds = url.searchParams.get("includeFunds") !== "false";
    const includeLoans = url.searchParams.get("includeLoans") !== "false";
    const includePayments = url.searchParams.get("includePayments") !== "false";
    const includeInspections = url.searchParams.get("includeInspections") !== "false";

    // Fetch snapshot data for the specified date
    const [fundSnapshot, loanSnapshot, paymentSnapshot, inspectionSnapshot] = await Promise.all([
      includeFunds
        ? db
            .select()
            .from(fundSnapshots)
            .where(eq(fundSnapshots.snapshotDate, date))
            .limit(1)
            .then((rows) => rows[0] || null)
        : Promise.resolve(null),
      includeLoans
        ? db
            .select()
            .from(loanSnapshots)
            .where(eq(loanSnapshots.snapshotDate, date))
            .limit(1)
            .then((rows) => rows[0] || null)
        : Promise.resolve(null),
      includePayments
        ? db
            .select()
            .from(paymentSnapshots)
            .where(eq(paymentSnapshots.snapshotDate, date))
            .limit(1)
            .then((rows) => rows[0] || null)
        : Promise.resolve(null),
      includeInspections
        ? db
            .select()
            .from(inspectionSnapshots)
            .where(eq(inspectionSnapshots.snapshotDate, date))
            .limit(1)
            .then((rows) => rows[0] || null)
        : Promise.resolve(null),
    ]);

    // Get historical trend data (30 days before and after)
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 30);

    const [fundTrends, loanTrends, paymentTrends, inspectionTrends] = await Promise.all([
      includeFunds
        ? AnalyticsService.getFundKpis({
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10),
          })
        : Promise.resolve([]),
      includeLoans
        ? AnalyticsService.getLoanKpis({
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10),
          })
        : Promise.resolve([]),
      includePayments
        ? AnalyticsService.getCollectionsKpis({
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10),
          })
        : Promise.resolve([]),
      includeInspections
        ? AnalyticsService.getInspectionKpis({
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10),
          })
        : Promise.resolve([]),
    ]);

    const payload = {
      snapshotDate: date,
      snapshots: {
        fund: fundSnapshot,
        loan: loanSnapshot,
        payment: paymentSnapshot,
        inspection: inspectionSnapshot,
      },
      trends: {
        fund: fundTrends,
        loan: loanTrends,
        payment: paymentTrends,
        inspection: inspectionTrends,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        "X-Cache-Tags": `analytics:snapshots:${date},analytics:*`,
      },
    });
  } catch (err: any) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load snapshot data", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

