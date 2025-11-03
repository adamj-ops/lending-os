"use client";

import { LoadingSpinner } from "./loading-spinner";
import { ErrorState } from "./error-state";
import { EmptyState } from "./empty-state";
import type { ReactNode } from "react";

export interface PageLoaderProps {
  isLoading?: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  children: ReactNode;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  fullPage?: boolean;
}

/**
 * PageLoader - Handles loading, error, and empty states for pages/sections
 *
 * This component wraps your content and automatically displays:
 * - Loading spinner when isLoading=true
 * - Error state when error is present
 * - Empty state when isEmpty=true
 * - Children when data is loaded and available
 *
 * @example
 * ```tsx
 * <PageLoader
 *   isLoading={isLoading}
 *   error={error}
 *   isEmpty={loans.length === 0}
 *   emptyTitle="No loans found"
 *   emptyAction={{ label: "Create Loan", onClick: openDialog }}
 *   onRetry={refetch}
 * >
 *   <LoanList loans={loans} />
 * </PageLoader>
 * ```
 */
export function PageLoader({
  isLoading,
  error,
  isEmpty,
  children,
  loadingLabel,
  emptyTitle,
  emptyMessage,
  emptyAction,
  onRetry,
  fullPage = false,
}: PageLoaderProps) {
  if (isLoading) {
    return (
      <LoadingSpinner
        size="lg"
        label={loadingLabel}
        fullScreen={fullPage}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        fullPage={fullPage}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        fullPage={fullPage}
      />
    );
  }

  return <>{children}</>;
}
