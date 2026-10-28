import type { ChartPayloadEntry } from "#/components/ui/ChartTooltip.tsx";

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
          : String(
              entry.name ??
                (entry.payload?.name as string | undefined) ??
                entry.value ??
                "",
            );
        const color = entry.color ?? "#8884d8";
        return (
          <li key={`${index}-${label}`} className="flex items-center gap-1.5 text-sm">
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
