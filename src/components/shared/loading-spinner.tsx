"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-b-2",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
      variant: {
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
        destructive: "border-destructive",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner - Consistent loading indicator
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" label="Loading data..." />
 * <LoadingSpinner fullScreen />
 * ```
 */
export function LoadingSpinner({
  className,
  size,
  variant,
  label,
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-2", fullScreen && "h-full min-h-[400px]", className)} {...props}>
      <div className={cn(spinnerVariants({ size, variant }))} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
      {!label && <span className="sr-only">Loading...</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
