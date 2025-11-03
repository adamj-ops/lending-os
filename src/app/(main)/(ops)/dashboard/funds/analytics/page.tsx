"use client";

import { IconTrendingUp, IconCurrencyDollar, IconUsers, IconChartHistogram } from "@tabler/icons-react";
import { Target, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuickStats } from "@/components/shared/dashboard-layout";
import { usePortfolioSummary } from "@/hooks/useFundAnalytics";
import { formatCurrency } from "@/lib/fund-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FundAnalyticsPage() {
  const { data: portfolio, isLoading, error } = usePortfolioSummary();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <IconChartHistogram size={20} stroke={2} className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Fund Analytics</h1>
            <p className="text-muted-foreground">Loading portfolio analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <IconChartHistogram size={20} stroke={2} className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Fund Analytics</h1>
            <p className="text-muted-foreground">Error loading analytics data</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load fund analytics. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const quickStatsData = [
    {
      label: "Total AUM",
      value: formatCurrency(portfolio.totalAUM),
      icon: <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Active Funds",
      value: `${portfolio.activeFunds} / ${portfolio.totalFunds}`,
      icon: <IconTrendingUp size={20} stroke={2} className="h-4 w-4" />,
      color: "text-brand-success bg-green-100",
    },
    {
      label: "Portfolio IRR",
      value: portfolio.portfolioIRR ? `${portfolio.portfolioIRR.toFixed(1)}%` : "N/A",
      icon: <Target className="h-4 w-4" />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Portfolio MOIC",
      value: portfolio.portfolioMOIC ? `${portfolio.portfolioMOIC.toFixed(2)}x` : "N/A",
      icon: <Award className="h-4 w-4" />,
      color: "text-brand-accent bg-yellow-100",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconChartHistogram size={20} stroke={2} className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Fund Analytics</h1>
            <p className="text-muted-foreground">Portfolio performance metrics and insights</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={quickStatsData} />

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-5 w-5" />
              Total Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Committed:</span>
                <span className="font-medium">{formatCurrency(portfolio.totalCommitted)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deployed:</span>
                <span className="font-medium">{formatCurrency(portfolio.totalDeployed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Returned:</span>
                <span className="font-medium">{formatCurrency(portfolio.totalReturned)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconUsers size={20} stroke={2} className="h-5 w-5" />
              Fund Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active:</span>
                <Badge variant="success">{portfolio.activeFunds}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total:</span>
                <Badge variant="secondary">{portfolio.totalFunds}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Closed:</span>
                <Badge variant="outline">{portfolio.totalFunds - portfolio.activeFunds}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconTrendingUp size={20} stroke={2} className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">IRR:</span>
                <span className="font-medium">
                  {portfolio.portfolioIRR ? `${portfolio.portfolioIRR.toFixed(1)}%` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MOIC:</span>
                <span className="font-medium">
                  {portfolio.portfolioMOIC ? `${portfolio.portfolioMOIC.toFixed(2)}x` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilization:</span>
                <span className="font-medium">
                  {portfolio.totalCommitted > 0
                    ? `${((portfolio.totalDeployed / portfolio.totalCommitted) * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Fund Type */}
      {portfolio.byFundType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Fund Type</CardTitle>
            <CardDescription>Aggregated metrics grouped by fund category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total AUM</TableHead>
                  <TableHead>Avg IRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.byFundType.map((type) => (
                  <TableRow key={type.fundType}>
                    <TableCell className="font-medium capitalize">{type.fundType}</TableCell>
                    <TableCell>{type.count}</TableCell>
                    <TableCell>{formatCurrency(type.totalAUM)}</TableCell>
                    <TableCell>
                      {type.avgIRR ? `${type.avgIRR.toFixed(1)}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {portfolio.topFunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Funds</CardTitle>
            <CardDescription>Funds ranked by MOIC (Multiple on Invested Capital)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>AUM</TableHead>
                  <TableHead>MOIC</TableHead>
                  <TableHead>IRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.topFunds.map((fund, index) => (
                  <TableRow key={fund.fundId}>
                    <TableCell>
                      <Badge variant={index === 0 ? "success" : index < 3 ? "warning" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{fund.fundName}</TableCell>
                    <TableCell>{formatCurrency(fund.aum)}</TableCell>
                    <TableCell>
                      {fund.moic ? `${fund.moic.toFixed(2)}x` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {fund.irr ? `${fund.irr.toFixed(1)}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

