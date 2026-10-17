import Card from "#/components/ui/Card.tsx";
import type { ChartPayloadEntry } from "#/components/ui/ChartTooltip.tsx";
import ChartTooltip from "#/components/ui/ChartTooltip.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import Table from "#/components/ui/Table.tsx";
import type { DashboardData } from "#/types/dashboard.ts";
import type { User } from "#/types/user.ts";
import {
  useChartSummary,
  useGradingStats,
  useRecentSessions,
  useTeacherDashboardData,
} from "#/utils/dashboardData.ts";
import { formatDate, formatRelativeTime } from "#/utils/formatDate.ts";
import { useMemo } from "react";
import { useIsMobile } from "#/hooks/useMediaQuery.ts";
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

const CHART_LABELS: Record<string, string> = {
  graded: "  نمره داده شده  ",
  pending: "  در انتظار بررسی  ",
};

interface Props {
  data: DashboardData;
  currentUser: User;
}

export default function TeacherDashboard({ data, currentUser }: Props) {
  const isMobile = useIsMobile();
  const {
    myClasses,
    myClassIdSet,
    mySubmissions,
    mySessions,
    myAnnouncements,
    classMap,
  } = useTeacherDashboardData(data, currentUser);

  const ungradedCount = useMemo(
    () => mySubmissions.filter((s) => s.status !== "graded").length,
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
          ) : (
            <>
              {/* Mobile/Tablet: Simple data cards */}
              {isMobile && (
                <div className="space-y-3" role="list" aria-label={chartSummary}>
                  {chartData.map((row) => (
                    <div
                      key={row.name}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                      role="listitem"
                    >
                      <h4 className="font-bold text-gray-800">{row.name}</h4>
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
                            : "0"}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Desktop: Chart with horizontal scroll */}
              {!isMobile && (
                <div
                  className="overflow-x-auto"
                  role="img"
                  aria-label={chartSummary}
                >
                  <span className="sr-only">{chartSummary}</span>
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
                          tick={{
                            fontSize: 12,
                            fill: "#64748b",
                            textAnchor: "middle",
                          }}
                          interval={0}
                          height={80}
                          axisLine={false}
                          tickLine={false}
                          angle={0}
                          dy={10}
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <Tooltip
                          content={
                            <ChartTooltip>
                              {(
                                first: ChartPayloadEntry,
                                all: ChartPayloadEntry[],
                              ) => {
                                const row = first.payload as
                                  (typeof chartData)[0] | undefined;
                                if (!row) return null;
                                const graded = row.graded;
                                const total = row.totalSubmissions;
                                const progressPercent =
                                  total > 0
                                    ? ((graded / total) * 100).toFixed(0)
                                    : "0";
                                return (
                                  <div className="min-w-50">
                                    <p className="mb-2 border-b pb-1 font-bold text-gray-800">
                                      {row.name}
                                    </p>
                                    {all.map((entry, index) => (
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
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          {CHART_LABELS[String(entry.dataKey)] ??
                                            entry.name}
                                        </span>
                                        <span className="font-bold text-gray-700">
                                          {String(entry.value ?? 0)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="mt-2 flex items-center justify-between border-t pt-2">
                                      <span className="font-medium text-gray-600">
                                        پیشرفت تصحیح:
                                      </span>
                                      <span className="font-bold text-blue-600">
                                        {progressPercent}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              }}
                            </ChartTooltip>
                          }
                          cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />
                        <div className="recharts-legend-custom">
                          <Legend
                            verticalAlign="top"
                            wrapperStyle={{
                              paddingBottom: "20px",
                              fontSize: "13px",
                              display: "flex",
                              gap: "24px",
                              flexWrap: "wrap",
                              justifyContent: "center",
                            }}
                            iconType="circle"
                            iconSize={14}
                            formatter={(value: string) =>
                              CHART_LABELS[value] ?? value
                            }
                          />
                        </div>
                        <Bar
                          dataKey="graded"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          barSize={24}
                        />
                        <Bar
                          dataKey="pending"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
                  render: (s) => (
                    <span title={formatDate(s.date)}>
                      {formatRelativeTime(s.date)}
                    </span>
                  ),
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
                  <div
                    className="text-sm text-gray-600"
                    title={formatDate(s.date)}
                  >
                    <span className="text-gray-500">تاریخ:</span>{" "}
                    {formatRelativeTime(s.date)}
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
