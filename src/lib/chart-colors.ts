/**
 * Midday-inspired semantic chart colors
 * Use these instead of multiple chart-1, chart-2, etc.
 *
 * These provide semantic meaning to chart data:
 * - primary: Main metrics (revenue, principal, etc.)
 * - success: Positive trends, growth indicators
 * - error: Risk metrics, delinquency, losses
 * - warning: Alerts, pending items, cautions
 * - muted: Historical/past data for comparison
 * - neutral: Projected/forecast data
 */
export const chartColors = {
  // Primary data (neutral/main metric)
  primary: "var(--chart-primary)",

  // Semantic meanings
  success: "var(--chart-success)", // Growth, positive trends
  error: "var(--chart-error)", // Delinquency, risk
  warning: "var(--chart-warning)", // Alerts, pending

  // Supporting colors
  muted: "var(--chart-muted)", // Past/historical data
  neutral: "var(--chart-neutral)", // Projected/forecast
} as const;

export type ChartColorKey = keyof typeof chartColors;

/**
 * Get a chart color by key
 * @param key - The semantic color key
 * @returns CSS variable reference
 */
export function getChartColor(key: ChartColorKey): string {
  return chartColors[key];
}

/**
 * Legacy chart color mapping for backward compatibility
 * Maps old chart-1, chart-2 to semantic colors
 */
export const legacyChartColors = {
  "chart-1": chartColors.primary,
  "chart-2": chartColors.success,
  "chart-3": chartColors.error,
  "chart-4": chartColors.warning,
  "chart-5": chartColors.muted,
} as const;
