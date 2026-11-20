import Card from "#/components/ui/Card.tsx";
import ChartLegend from "#/components/ui/ChartLegend.tsx";
import ChartTooltip from "#/components/ui/ChartTooltip.tsx";
import { defaultChartLabel, type ChartPayloadEntry } from "#/utils";
import type { ReactNode } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieChartItem {
  name: string;
  value: number;
  key?: string;
}

interface PieChartCardProps {
  title: string;
  data: PieChartItem[];
  emptyText: string;
  chartSummary: string;
  unit: string;
  getColor: (entry: PieChartItem, index: number) => string;
  tooltip: (
    first: ChartPayloadEntry,
    all: ChartPayloadEntry[],
  ) => ReactNode;
  heightClass?: "h-64" | "h-72";
}

export default function PieChartCard({
  title,
  data,
  emptyText,
  chartSummary,
  unit,
  getColor,
  tooltip,
  heightClass = "h-64",
}: PieChartCardProps) {
  return (
    <Card title={title}>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          {emptyText}
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-2">
            {data.map((entry, index) => (
              <div
                key={entry.key ?? index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{entry.name}</span>
                <span className="font-medium text-gray-900">
                  {entry.value} {unit}
                </span>
              </div>
            ))}
          </div>
          <div
            className={`hidden sm:block ${heightClass}`}
            role="group"
            aria-label={chartSummary}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.key ?? index}`}
                      fill={getColor(entry, index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip>{tooltip}</ChartTooltip>}
                  contentStyle={{ direction: "rtl", textAlign: "right" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={<ChartLegend resolveLabel={defaultChartLabel} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}