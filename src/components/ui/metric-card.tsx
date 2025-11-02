"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ title, value, change, trend }: MetricCardProps) {
  return (
    <Card className="card p-6 hover:shadow-md transition-shadow">
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-medium text-foreground">{value}</p>
          {change && (
            <div
              className={cn(
                "flex items-center text-sm",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
              {trend === "down" && <TrendingDown className="w-4 h-4 mr-1" />}
              {trend === "neutral" && <Minus className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



