"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { forecastLoan, calculateLTV } from "@/lib/ai/forecast";
import type { CreateLoanFormData, ForecastOutput } from "../types";

export function StepForecast() {
  const { watch } = useFormContext<CreateLoanFormData>();
  const formData = watch();
  const [forecast, setForecast] = useState<ForecastOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateForecast();
  }, []);

  const generateForecast = async () => {
    setIsLoading(true);
    try {
      const terms = formData.terms;
      if (!terms) {
        setIsLoading(false);
        return;
      }

      // Calculate LTV for asset-backed loans
      let ltv: number | undefined;
      if (formData.loanCategory === "asset_backed" && formData.property) {
        const propertyValue =
          formData.property.appraisedValue ||
          formData.property.estimatedValue ||
          formData.property.purchasePrice ||
          0;
        if (propertyValue > 0) {
          ltv = calculateLTV(terms.principal, propertyValue);
        }
      }

      // Get borrower credit score (only for asset-backed and hybrid)
      let borrowerCreditScore: number | undefined;
      if ("borrower" in formData && formData.borrower) {
        borrowerCreditScore = formData.borrower.creditScore;
      }

      const result = await forecastLoan({
        principal: terms.principal,
        rate: terms.rate,
        termMonths: terms.termMonths,
        category: formData.loanCategory || "asset_backed",
        borrowerCreditScore,
        loanToValue: ltv,
      });

      setForecast(result);
    } catch (error) {
      console.error("Forecast error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  const getRiskBadgeColor = (level?: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 size-6 text-primary" />
        <div>
          <h2 className="mb-2 text-2xl font-bold">AI Risk & Forecast Analysis</h2>
          <p className="text-muted-foreground">
            Automated risk assessment and projected returns for this loan
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : forecast ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Projected Return
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">ROI Percentage</span>
                  <span className="text-2xl font-bold">{forecast.roiPct.toFixed(2)}%</span>
                </div>
                <Progress value={Math.min(forecast.roiPct, 100)} className="h-3" />
              </div>

              {formData.terms && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">Est. Total Return</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(
                        formData.terms.principal * (forecast.roiPct / 100)
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">Term Length</p>
                    <p className="text-lg font-semibold">
                      {formData.terms.termMonths} months
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Default Probability</span>
                  <span className="text-2xl font-bold">{formatPercent(forecast.defaultProb)}</span>
                </div>
                <Progress
                  value={forecast.defaultProb * 100}
                  className="h-3"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge className={getRiskBadgeColor(forecast.riskLevel)}>
                  {forecast.riskLevel?.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5" />
                Yield Efficiency Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Efficiency Rating</span>
                  <span className="text-3xl font-bold">{forecast.efficiency.toFixed(1)}/100</span>
                </div>
                <Progress value={forecast.efficiency} className="h-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Based on risk-adjusted returns and loan characteristics
                </p>
              </div>

              {forecast.recommendedFunding && (
                <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
                  <p className="text-sm font-medium">Recommended Funding Source</p>
                  <p className="mt-1 text-lg font-semibold capitalize">
                    {forecast.recommendedFunding}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg border border-muted-foreground/20 bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This analysis is generated using heuristic models. Phase 4 will integrate
              ML-based risk assessment with historical data, market conditions, and borrower behavior patterns.
            </p>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Unable to generate forecast. Please complete all required fields.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

