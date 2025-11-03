"use client";

import { useMemo } from "react";
import { IconTrendingUp, IconTrendingDown, IconCurrencyDollar, IconCalendar, IconPercentage, IconAlertCircle } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LoanBalance {
  originalPrincipal: number;
  currentBalance: number;
  totalPaid: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalFeesPaid: number;
  paymentsScheduled: number;
  paymentsMade: number;
  paymentsLate: number;
  paymentsMissed: number;
  nextPaymentDate?: Date | string;
  nextPaymentAmount?: number;
  daysUntilNextPayment?: number;
  isDelinquent?: boolean;
}

interface BalanceSummaryCardsProps {
  balance: LoanBalance;
  className?: string;
}

export function BalanceSummaryCards({
  balance,
  className,
}: BalanceSummaryCardsProps) {
  // Calculate derived metrics
  const metrics = useMemo(() => {
    const principalPaidPercent =
      (balance.totalPrincipalPaid / balance.originalPrincipal) * 100;
    const paymentCompletionPercent =
      (balance.paymentsMade / balance.paymentsScheduled) * 100;
    const avgPaymentAmount =
      balance.paymentsMade > 0 ? balance.totalPaid / balance.paymentsMade : 0;
    const principalToInterestRatio =
      balance.totalInterestPaid > 0
        ? balance.totalPrincipalPaid / balance.totalInterestPaid
        : 0;

    return {
      principalPaidPercent: principalPaidPercent.toFixed(1),
      paymentCompletionPercent: paymentCompletionPercent.toFixed(1),
      avgPaymentAmount,
      principalToInterestRatio: principalToInterestRatio.toFixed(2),
    };
  }, [balance]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {/* Current Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${balance.currentBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            of ${balance.originalPrincipal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            original
          </p>
          <div className="mt-2 flex items-center gap-2">
            <IconTrendingDown size={20} stroke={2} className="h-4 w-4 text-brand-success" />
            <span className="text-sm font-medium text-brand-success">
              {metrics.principalPaidPercent}% paid down
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Paid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <IconTrendingUp size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${balance.totalPaid.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Principal:</span>
              <span className="font-medium">
                ${balance.totalPrincipalPaid.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest:</span>
              <span className="font-medium">
                ${balance.totalInterestPaid.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {balance.totalFeesPaid > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fees:</span>
                <span className="font-medium">
                  ${balance.totalFeesPaid.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
          <IconPercentage size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balance.paymentsMade}/{balance.paymentsScheduled}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.paymentCompletionPercent}% complete
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {balance.paymentsLate > 0 && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                {balance.paymentsLate} late
              </Badge>
            )}
            {balance.paymentsMissed > 0 && (
              <Badge variant="secondary" className="bg-brand-danger/10 text-red-700">
                {balance.paymentsMissed} missed
              </Badge>
            )}
            {balance.isDelinquent && (
              <Badge variant="secondary" className="bg-brand-danger/10 text-red-700">
                Delinquent
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Payment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          <IconCalendar size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {balance.nextPaymentDate && balance.nextPaymentAmount ? (
            <>
              <div className="text-2xl font-bold">
                ${balance.nextPaymentAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Due{" "}
                {new Date(balance.nextPaymentDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {balance.daysUntilNextPayment !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  {balance.daysUntilNextPayment < 0 ? (
                    <>
                      <IconAlertCircle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />
                      <span className="text-sm font-medium text-brand-danger">
                        {Math.abs(balance.daysUntilNextPayment)} days overdue
                      </span>
                    </>
                  ) : balance.daysUntilNextPayment <= 7 ? (
                    <>
                      <IconAlertCircle size={20} stroke={2} className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">
                        Due in {balance.daysUntilNextPayment} days
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      In {balance.daysUntilNextPayment} days
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <p className="text-xs text-muted-foreground">No upcoming payment</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats Row (optional - can be hidden by default) */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Payment Analytics</CardTitle>
          <CardDescription>Additional payment insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Average Payment</p>
              <p className="text-lg font-bold">
                ${metrics.avgPaymentAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Principal/Interest Ratio
              </p>
              <p className="text-lg font-bold">{metrics.principalToInterestRatio}:1</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
              <p className="text-lg font-bold">
                {balance.paymentsMade > 0
                  ? (
                      ((balance.paymentsMade - balance.paymentsLate - balance.paymentsMissed) /
                        balance.paymentsMade) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining Payments</p>
              <p className="text-lg font-bold">
                {balance.paymentsScheduled - balance.paymentsMade}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
