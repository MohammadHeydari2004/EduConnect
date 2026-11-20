import Card from "#/components/ui/Card.tsx";
import ChartLegend from "#/components/ui/ChartLegend.tsx";
import ChartTooltip from "#/components/ui/ChartTooltip.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import Table from "#/components/ui/Table.tsx";
import {
  GRADING_CHART_LABELS,
  GradingTooltipContent,
} from "#/pages/dashboard/GradingTooltipContent.tsx";
import {
  useChartSummary,
  useGradingStats,
  useRecentSessions,
} from "#/hooks/dashboardStats";
import { useTeacherDashboardData } from "#/hooks/dashboardData";
import type { DashboardData, ID } from "#/types";
import { formatDate } from "#/utils";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: DashboardData;
  currentUserId: ID;
}

export default function TeacherDashboard({
  data,
  currentUserId,
}: Props) {
  const {
    myClasses,
    myClassIdSet,
    mySubmissions,
    mySessions,
    myAnnouncements,
    classMap,
  } = useTeacherDashboardData(currentUserId, data);

  const ungradedCount = useMemo(
    () =>
      mySubmissions.filter(
        (s) =>
          (s.content && s.content.trim().length > 0) &&
          s.status !== "graded",
      ).length,
    [mySubmissions],
  );

  const chartData = useGradingStats(
    myClasses,
    data.assignments,
    data.submissions,
    myClassIdSet,
  );

  const recentSessions = useRecentSessions(mySessions);

  const chartSummary = useChartSummary(chartData);
  const chartMinWidth = Math.max(600, chartData.length * 70);
  const showListFallback = chartData.length > 8;

  const renderList = () => (
    <div className="space-y-3" role="list" aria-label={chartSummary}>
      {chartData.map((row) => (
        <div
          key={row.name}
          className="rounded-lg border border-gray-200 bg-white p-4"
          role="listitem"
        >
          <h3 className="font-bold text-gray-800">{row.name}</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              نمره داده شده: {row.graded}
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              در انتظار بررسی: {row.pending}
            </span>
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
              کل: {row.totalSubmissions}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <span className="font-medium text-gray-600">پیشرفت تصحیح:</span>
            <span className="font-bold text-blue-600">
              {row.totalSubmissions > 0
                ? ((row.graded / row.totalSubmissions) * 100).toFixed(0)
                : "0"}
              %
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChart = () => (
    <div className="overflow-x-auto" aria-label={chartSummary}>
      <div style={{ minWidth: chartMinWidth }}>
        <ResponsiveContainer width="100%" height={384}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              interval={chartData.length > 6 ? 1 : 0}
              height={80}
              axisLine={false}
              tickLine={false}
              angle={chartData.length > 6 ? -30 : 0}
              textAnchor={chartData.length > 6 ? "end" : "middle"}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              content={<ChartTooltip>{GradingTooltipContent}</ChartTooltip>}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={
                <ChartLegend
                  resolveLabel={(entry) =>
                    GRADING_CHART_LABELS[String(entry.value ?? "")] ??
                    String(entry.value ?? "")
                  }
                />
              }
            />
            <Bar
              dataKey="graded"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="pending"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کلاس‌های من"
          value={myClasses.length}
          color="text-blue-600"
        />
        <StatCard
          title="پاسخ‌های نیازمند بررسی"
          value={ungradedCount}
          color="text-red-600"
          description="تکالیف تصحیح نشده"
        />
        <StatCard
          title="کل جلسات برگزار شده"
          value={mySessions.length}
          color="text-green-600"
        />
        <StatCard
          title="اطلاعیه‌های منتشرشده"
          value={myAnnouncements.length}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-flow-row gap-6">
        <Card title="وضعیت تصحیح تکالیف به تفکیک کلاس">
          {chartData.every((d) => d.totalSubmissions === 0) ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500">
              هنوز پاسخی برای تکالیف ثبت نشده است.
            </div>
          ) : showListFallback ? (
            renderList()
          ) : (
            <>
              <div className="lg:hidden">{renderList()}</div>
              <div className="hidden lg:block">{renderChart()}</div>
            </>
          )}
        </Card>

        <Card title="آخرین جلسات کلاس‌ها">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-500">جلسه‌ای ثبت نشده است.</p>
          ) : (
            <Table
              getRowKey={(s) => s.id}
              columns={[
                {
                  key: "title",
                  title: "عنوان جلسه",
                  width: "45%",
                  render: (s) => s.title,
                },
                {
                  key: "date",
                  title: "تاریخ",
                  width: "25%",
                  render: (s) => formatDate(s.date),
                },
                {
                  key: "classId",
                  title: "کلاس",
                  width: "30%",
                  render: (s) => (
                    <div className="text-center">
                      {classMap.get(s.classId)?.title || "نامشخص"}
                    </div>
                  ),
                },
              ]}
              data={recentSessions}
              renderMobileCard={(s) => (
                <div className="space-y-2 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-gray-800">
                      {s.title}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">کلاس:</span>{" "}
                    {classMap.get(s.classId)?.title || "نامشخص"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">تاریخ:</span>{" "}
                    {formatDate(s.date)}
                  </div>
                </div>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
