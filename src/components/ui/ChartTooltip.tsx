import type { ReactNode } from "react";

/** A single entry recharts hands to a custom `content`/legend. */
export interface ChartPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  /** Injected by recharts. */
  active?: boolean;
  payload?: ChartPayloadEntry[];
  className?: string;
  /** Renders the inner content for the active tooltip. */
  children: (
    first: ChartPayloadEntry,
    all: ChartPayloadEntry[],
  ) => ReactNode;
}

/**
 * Shared chrome + guard for recharts custom tooltips. Each dashboard keeps its
 * own inner content via `children`, but the repeated `if (active && payload)`
 * check and outer box live in one place now.
 */
export function ChartTooltip({
  active,
  payload,
  className = "",
  children,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0];
  if (!first) return null;
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg ${className}`}
    >
      {children(first, payload)}
    </div>
  );
}

/** Shared label resolver: falls back through entry fields in priority order. */
export function defaultChartLabel(entry: ChartPayloadEntry): string {
  return String(
    entry.name ??
      (entry.payload?.name as string | undefined) ??
      entry.value ??
      "",
  );
}

export default ChartTooltip;
