"use client";

import { CheckCircle, DollarSign, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const recentActivities = [
  {
    id: 1,
    icon: DollarSign,
    type: "funding",
    title: "Loan Funded",
    subtitle: "123 Main St, Denver CO",
    amount: 450000,
    date: "2 hours ago",
    color: "bg-green-500",
  },
  {
    id: 2,
    icon: CheckCircle,
    type: "payment",
    title: "Payment Received",
    subtitle: "456 Oak Ave, Austin TX",
    amount: 12500,
    date: "5 hours ago",
    color: "bg-blue-500",
  },
  {
    id: 3,
    icon: FileText,
    type: "draw",
    title: "Draw Approved",
    subtitle: "789 Pine Rd, Seattle WA",
    amount: 75000,
    date: "1 day ago",
    color: "bg-purple-500",
  },
  {
    id: 4,
    icon: CheckCircle,
    type: "payment",
    title: "Payment Received",
    subtitle: "321 Elm St, Miami FL",
    amount: 8900,
    date: "2 days ago",
    color: "bg-blue-500",
  },
];

export function RecentActivity() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest fundings, payments, and draw approvals.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}>
                <activity.icon className="size-5 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-xs">{activity.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {formatCurrency(activity.amount, { noDecimals: true })}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
