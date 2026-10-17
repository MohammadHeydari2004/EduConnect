import type { ChartPayloadEntry } from "#/components/ui/ChartTooltip.tsx";

interface ChartLegendProps {
  /** Injected by recharts `content`. */
  payload?: ChartPayloadEntry[];
  /** Resolve the visible label for an entry. Defaults to `value` then nested name. */
  resolveLabel?: (
    entry: ChartPayloadEntry,
    index: number,
  ) => string;
}

/**
 * Shared recharts legend. Each dashboard supplies how to read the label from a
 * payload entry (the field differs: role, attendance status, etc.).
 */
export function ChartLegend({ payload, resolveLabel }: ChartLegendProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-4">
      {payload.map((entry, index) => {
        // Prefer the entry's label (name / payload.name); fall back to the raw
        // value only when no label exists. `entry.value` on a dataKey chart is
        // the numeric value, not the label, so it must be last resort.
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
