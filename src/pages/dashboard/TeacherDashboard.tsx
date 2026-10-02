import Card from "#/components/ui/Card.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import { formatDate, formatRelativeTime } from "#/utils/formatDate.ts";
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
import type { DashboardData } from "./DashboardContainer";

interface ChartDataItem {
  name: string;
  "نمره داده شده": number;
  "در انتظار بررسی": number;
  totalSubmissions: number;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: ChartDataItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const firstItem = payload[0];
    if (firstItem && firstItem.payload) {
      const data = firstItem.payload;
      const graded = data["نمره داده شده"];
      const total = data.totalSubmissions;
      const progressPercent =
        total > 0 ? ((graded / total) * 100).toFixed(0) : "0";

      return (
        <div className="min-w-50 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
          <p className="mb-2 border-b pb-1 font-bold text-gray-800">
            {data.name}
          </p>
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4 py-0.5"
            >
              <span
                style={{ color: entry.color }}
                className="flex items-center gap-1.5 font-medium"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {entry.name}
              </span>
              <span className="font-bold text-gray-700">{entry.value}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <span className="font-medium text-gray-600">پیشرفت تصحیح:</span>
            <span className="font-bold text-blue-600">{progressPercent}%</span>
          </div>
        </div>
      );
    }
  }
  return null;
}

interface Props {
  data: DashboardData;
  currentUser: User;
}

export default function TeacherDashboard({ data, currentUser }: Props) {
  const { classes, assignments, submissions, sessions, announcements } = data;

  const myClasses = useMemo(
    () => classes.filter((c) => c.teacherId === currentUser.id),
    [classes, currentUser.id],
  );

  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIdSet.has(a.classId)),
    [assignments, myClassIdSet],
  );

  const myAssignmentIdSet = useMemo(
    () => new Set(myAssignments.map((a) => a.id)),
    [myAssignments],
  );

  const mySubmissions = useMemo(
    () => submissions.filter((s) => myAssignmentIdSet.has(s.assignmentId)),
    [submissions, myAssignmentIdSet],
  );

  const mySessions = useMemo(
    () => sessions.filter((s) => myClassIdSet.has(s.classId)),
    [sessions, myClassIdSet],
  );

  const myAnnouncements = useMemo(
    () => announcements.filter((a) => a.authorId === currentUser.id),
    [announcements, currentUser.id],
  );

  const ungradedCount = useMemo(
    () => mySubmissions.filter((s) => s.status !== "graded").length,
    [mySubmissions],
  );

  const chartData = useMemo(() => {
    const assignmentClassMap = new Map<string, string>();
    assignments.forEach((a) => {
      if (myClassIdSet.has(a.classId)) {
        assignmentClassMap.set(a.id, a.classId);
      }
    });

    const classStats = new Map<string, { graded: number; total: number }>();
    myClasses.forEach((c) => classStats.set(c.id, { graded: 0, total: 0 }));

    submissions.forEach((s) => {
      const classId = assignmentClassMap.get(s.assignmentId);
      if (classId && classStats.has(classId)) {
        const stats = classStats.get(classId)!;
        stats.total++;
        if (s.status === "graded") stats.graded++;
      }
    });

    return myClasses.map((c) => {
      const stats = classStats.get(c.id) || { graded: 0, total: 0 };
      return {
        name: c.title,
        "نمره داده شده": stats.graded,
        "در انتظار بررسی": stats.total - stats.graded,
        totalSubmissions: stats.total,
      };
    });
  }, [myClasses, assignments, submissions, myClassIdSet]);

  const recentSessions = useMemo(() => {
    return [...mySessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [mySessions]);

  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const chartSummary = useMemo(() => {
    if (chartData.every((d) => d.totalSubmissions === 0))
      return "هنوز پاسخی برای تکالیف ثبت نشده است.";
    return `وضعیت تصحیح تکالیف: ${chartData.map((d) => `${d.name} (${d["نمره داده شده"]} تصحیح شده از ${d.totalSubmissions})`).join("، ")}`;
  }, [chartData]);

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
            <div className="h-96" role="img" aria-label={chartSummary}>
              <span className="sr-only">{chartSummary}</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                    interval={0}
                    height={80}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: "20px", fontSize: "13px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="نمره داده شده"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="در انتظار بررسی"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="آخرین جلسات کلاس‌ها">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-500">جلسه‌ای ثبت نشده است.</p>
          ) : (
            <Table
              getRowKey={(s) => s.id}
              columns={[
                { key: "title", title: "عنوان جلسه", render: (s) => s.title },
                {
                  key: "date",
                  title: "تاریخ",
                  render: (s) => (
                    <span title={formatDate(s.date)}>
                      {formatRelativeTime(s.date)}
                    </span>
                  ),
                },
                {
                  key: "classId",
                  title: "کلاس",
                  render: (s) => classMap.get(s.classId)?.title || "نامشخص",
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
