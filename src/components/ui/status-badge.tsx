"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "current" | "past-due" | "delinquent" | "default";
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const variantMap = {
    current: "secondary" as const,
    "past-due": "outline" as const,
    delinquent: "destructive" as const,
    default: "secondary" as const,
  };

  return <Badge variant={variantMap[status]}>{children}</Badge>;
}

