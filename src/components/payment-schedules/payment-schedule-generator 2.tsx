"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PaymentSchedule } from "@/types/payment";

interface PaymentScheduleGeneratorProps {
  loanId: string;
  onScheduleGenerated?: (schedule: PaymentSchedule) => void;
}

export function PaymentScheduleGenerator({ loanId, onScheduleGenerated }: PaymentScheduleGeneratorProps) {
  // TODO: Implement PaymentScheduleGenerator component (stub for build)
  return (
    <div>
      <p className="text-muted-foreground">PaymentScheduleGenerator component - TODO: Implement</p>
    </div>
  );
}

