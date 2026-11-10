import type { ReactNode } from "react";
import { useId } from "react";
import type { ChartPayloadEntry } from "#/utils/chart.ts";

export type { ChartPayloadEntry } from "#/utils/chart.ts";
export { defaultChartLabel, getChartEntryKey } from "#/utils/chart.ts";

type TooltipRenderFn =
  | ((entry: ChartPayloadEntry) => ReactNode)
  | ((entry: ChartPayloadEntry, all: ChartPayloadEntry[]) => ReactNode);

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
  className?: string;
  children?: ReactNode | TooltipRenderFn;
}

export function ChartTooltip({
  active,
  payload,
  className = "",
  children,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  if (children === undefined || children === null) return null;
  const first = payload[0];
  if (!first) return null;
  const tooltipId = useId();
  const content =
    typeof children === "function"
      ? (children as TooltipRenderFn)(first, payload)
      : children;
  if (content === undefined || content === null) return null;
  return (
    <div
      id={tooltipId}
      role="tooltip"
      className={`rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg ${className}`}
    >
      {content}
    </div>
  );
}

export default ChartTooltip;
