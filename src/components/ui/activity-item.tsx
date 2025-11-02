"use client";

import { DollarSign, CheckCircle, FileText } from "lucide-react";

interface ActivityItemProps {
  icon: "dollar" | "check" | "file";
  title: string;
  subtitle: string;
  amount: string;
  time: string;
}

const icons = {
  dollar: DollarSign,
  check: CheckCircle,
  file: FileText,
};

export function ActivityItem({ icon, title, subtitle, amount, time }: ActivityItemProps) {
  const Icon = icons[icon];

  return (
    <div className="flex gap-3">
      <div className="mt-1">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-foreground font-medium">{amount}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}



