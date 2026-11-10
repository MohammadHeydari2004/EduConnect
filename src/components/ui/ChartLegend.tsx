import { CHART_COLORS } from "#/configs/constants/chartConstants.ts";
import {
  defaultChartLabel,
  getChartEntryColor,
  getChartEntryKey,
  type ChartPayloadEntry,
} from "#/utils/chart.ts";

interface ChartLegendProps {
  payload?: ChartPayloadEntry[];
  resolveLabel?: (
    entry: ChartPayloadEntry,
    index: number,
  ) => string;
}

export function ChartLegend({ payload, resolveLabel }: ChartLegendProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-4">
      {payload.map((entry, index) => {
        const label = resolveLabel
          ? resolveLabel(entry, index)
          : defaultChartLabel(entry);
        const fallback = CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0] ?? "#3b82f6";
        const color = getChartEntryColor(entry, fallback);
        const key = getChartEntryKey(entry, index);
        return (
          <li key={key} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="font-medium text-gray-700">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default ChartLegend;
