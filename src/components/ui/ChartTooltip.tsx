import type { ReactNode } from "react";

export interface ChartPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  className?: string;
  children: (
    first: ChartPayloadEntry,
    all: ChartPayloadEntry[],
  ) => ReactNode;
}

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

export function defaultChartLabel(entry: ChartPayloadEntry): string {
  return String(
    entry["name"] ??
      (entry.payload?.["name"] as string | undefined) ??
      entry.value ??
      "",
  );
}

export default ChartTooltip;
