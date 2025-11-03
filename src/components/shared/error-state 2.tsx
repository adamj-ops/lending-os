"use client";

import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
  fullPage?: boolean;
  showCard?: boolean;
}

/**
 * ErrorState - Consistent error display with retry functionality
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="Failed to load data"
 *   message="Could not fetch loans"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorState({
  title = "Error Loading Data",
  message,
  error,
  onRetry,
  className,
  fullPage = false,
  showCard = true,
}: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : error) || "An unexpected error occurred";

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      fullPage ? "min-h-[400px] p-8" : "py-8",
      className
    )}>
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <IconAlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

      <p className="mb-4 max-w-md text-sm text-muted-foreground">{errorMessage}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <IconRefresh className="mr-2 h-4 w-4" />
          Try Again
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
