"use client";

import { IconInbox, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
  fullPage?: boolean;
  showCard?: boolean;
}

/**
 * EmptyState - Consistent empty state display with optional action
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No loans found"
 *   message="Get started by creating your first loan"
 *   action={{
 *     label: "Create Loan",
 *     onClick: () => setShowDialog(true),
 *   }}
 * />
 * ```
 */
export function EmptyState({
  title = "No data available",
  message = "There's nothing to show here yet",
  icon,
  action,
  className,
  fullPage = false,
  showCard = true,
}: EmptyStateProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      fullPage ? "min-h-[400px] p-8" : "py-8",
      className
    )}>
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon || <IconInbox className="h-8 w-8 text-muted-foreground" />}
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

      <p className="mb-4 max-w-md text-sm text-muted-foreground">{message}</p>

      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.icon || <IconPlus className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className={cn(fullPage && "border-0 shadow-none")}>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
