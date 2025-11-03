"use client";

import { IconAlertCircle } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const delinquencyData = [
  {
    id: 1,
    label: "Current (0-30)",
    count: 18,
    total: 24,
    color: "bg-green-500",
  },
  {
    id: 2,
    label: "Past Due (31-60)",
    count: 4,
    total: 24,
    color: "bg-brand-accent",
  },
  {
    id: 3,
    label: "Delinquent (60+)",
    count: 2,
    total: 24,
    color: "bg-orange-500",
  },
  {
    id: 4,
    label: "Default",
    count: 0,
    total: 24,
    color: "bg-brand-danger",
  },
];

export function DelinquencySummary() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconAlertCircle size={20} stroke={2} className="size-5" />
          <CardTitle>Delinquency Status</CardTitle>
        </div>
        <CardDescription>Track loan payment status and aging.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {delinquencyData.map((item) => {
            const percentage = (item.count / item.total) * 100;
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums">
                    {item.count} / {item.total}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
