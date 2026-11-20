import type { ChartPayloadEntry } from "#/utils";

export const GRADING_CHART_LABELS: Record<string, string> = {
  graded: "نمره داده شده",
  pending: "در انتظار بررسی",
};

interface GradingRow {
  name: string;
  graded: number;
  totalSubmissions: number;
}

export function GradingTooltipContent(
  first: ChartPayloadEntry,
  all: ChartPayloadEntry[],
) {
  const row = first.payload as GradingRow | undefined;
  if (!row) return null;

  const progressPercent =
    row.totalSubmissions > 0
      ? ((row.graded / row.totalSubmissions) * 100).toFixed(0)
      : "0";

  return (
    <div className="min-w-50">
      <p className="mb-2 border-b pb-1 font-bold text-gray-800">
        {row.name}
      </p>
      {all.map((entry, index) => {
        const dataKey = String(entry.dataKey ?? "");
        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4 py-0.5"
          >
            <span
              style={{ color: entry.color }}
              className="flex items-center gap-1.5 font-medium"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: entry.color,
                }}
              />
              {GRADING_CHART_LABELS[dataKey] ?? dataKey}
            </span>
            <span className="font-bold text-gray-700">
              {String(entry.value ?? 0)}
            </span>
          </div>
        );
      })}
      <div className="mt-2 flex items-center justify-between border-t pt-2">
        <span className="font-medium text-gray-600">
          پیشرفت تصحیح:
        </span>
        <span className="font-bold text-blue-600">{progressPercent}%</span>
      </div>
    </div>
  );
}
