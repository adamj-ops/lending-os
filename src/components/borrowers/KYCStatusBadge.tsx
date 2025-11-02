"use client";

import { Badge } from "@/components/ui/badge";
import { IconShieldCheck, IconShieldX, IconClock } from "@tabler/icons-react";

interface KYCStatusBadgeProps {
  status?: "pending" | "in_progress" | "approved" | "rejected" | "requires_review" | string | null;
  showIcon?: boolean;
}

export function KYCStatusBadge({ status, showIcon = true }: KYCStatusBadgeProps) {
  // Default to "pending" if status is null or undefined
  const safeStatus = (status || "pending") as "pending" | "in_progress" | "approved" | "rejected" | "requires_review";
  const config = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: IconClock,
    },
    in_progress: {
      label: "In Progress",
      variant: "info" as const,
      icon: IconClock,
    },
    approved: {
      label: "Approved",
      variant: "success" as const,
      icon: IconShieldCheck,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
      icon: IconShieldX,
    },
    requires_review: {
      label: "Review Required",
      variant: "warning" as const,
      icon: IconClock,
    },
  };

  const { label, variant, icon: Icon } = config[safeStatus];

  return (
    <Badge variant={variant}>
      {showIcon && <Icon size={14} className="mr-1" />}
      {label}
    </Badge>
  );
}

