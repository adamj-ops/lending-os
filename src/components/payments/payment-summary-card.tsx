"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentSummary } from "@/types/payment";

interface PaymentSummaryCardProps {
  summary: PaymentSummary;
  onPaymentAction?: (paymentId: string) => void;
}

export function PaymentSummaryCard({ summary, onPaymentAction }: PaymentSummaryCardProps) {
  // TODO: Implement PaymentSummaryCard component (stub for build)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">PaymentSummaryCard component - TODO: Implement</p>
      </CardContent>
    </Card>
  );
}

