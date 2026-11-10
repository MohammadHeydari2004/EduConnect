export interface ChartPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export function defaultChartLabel(entry: ChartPayloadEntry): string {
  return String(
    entry["name"] ??
      (entry.payload?.["name"] as string | undefined) ??
      entry.value ??
      "",
  );
}

export function getChartEntryKey(entry: ChartPayloadEntry, index: number): string {
  const raw =
    entry.name ??
    entry.dataKey ??
    entry.payload?.["name"] ??
    defaultChartLabel(entry);
  const key = String(raw ?? "").trim();
  return key ? `${key}-${index}` : `${index}`;
}

export function getChartEntryColor(entry: ChartPayloadEntry, fallback: string): string {
  return entry.color ?? fallback;
}
