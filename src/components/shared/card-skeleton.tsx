"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
  variant?: "default" | "metric" | "table";
}

/**
 * CardSkeleton - Consistent skeleton loader for dashboard cards
 *
 * @example
 * ```tsx
 * <CardSkeleton variant="metric" />
 * <CardSkeleton variant="table" rows={5} />
 * ```
 */
export function CardSkeleton({
  className,
  showHeader = true,
  rows = 3,
  variant = "default",
}: CardSkeletonProps) {
  if (variant === "metric") {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "table") {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className={cn("h-4", i % 2 === 0 ? "w-full" : "w-3/4")} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardSkeleton - Skeleton specifically for metric cards
 */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return <CardSkeleton variant="metric" className={className} />;
}

/**
 * TableCardSkeleton - Skeleton for table/list cards
 */
export function TableCardSkeleton({ className, rows = 5 }: { className?: string; rows?: number }) {
  return <CardSkeleton variant="table" rows={rows} className={className} />;
}

/**
 * GridCardSkeletons - Multiple card skeletons in a grid
 */
export function GridCardSkeletons({
  count = 4,
  variant = "default",
  className,
}: {
  count?: number;
  variant?: "default" | "metric" | "table";
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} showHeader={false} />
      ))}
    </div>
  );
}
