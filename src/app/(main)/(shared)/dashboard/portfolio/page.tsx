import { LoanSummary } from "./_components/loan-summary";
import { DelinquencySummary } from "./_components/delinquency-summary";
import { PortfolioOverview } from "./_components/portfolio-overview";
import { RecentActivity } from "./_components/recent-activity";
import { ApprovalTrendCard, MonthlyMetricsChart, RiskDistributionPie } from '@/components/charts';

export default function Page() {
  return (
    <div className="space-y-4">
      {/* Existing Dashboard */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <LoanSummary />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex-1">
            <PortfolioOverview />
          </div>
          <div className="grid flex-1 grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2">
            <DelinquencySummary />
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* New Colosseum Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ApprovalTrendCard />
        <MonthlyMetricsChart />
        <RiskDistributionPie />
      </div>
    </div>
  );
}
