import Card from "#/components/ui/Card.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import Table from "#/components/ui/Table.tsx";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
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
    [classes, currentUser],
  );
  const myClassIds = myClasses.map((c) => c.id);

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIds.includes(a.classId)), 
    [assignments, myClassIds],
  );
  const myAssignmentIds = myAssignments.map((a) => a.id); 

  const mySubmissions = useMemo(
    () =>
      submissions.filter(
        (s) => myAssignmentIds.includes(s.assignmentId), 
      ),
    [submissions, myAssignmentIds],
  );

  const mySessions = useMemo(
    () => sessions.filter((s) => myClassIds.includes(s.classId)),
    [sessions, myClassIds],
  );

  const myAnnouncements = useMemo(
    () =>
      announcements.filter(
        (a) => a.authorId === currentUser.id, 
      ),
    [announcements, currentUser],
  );

  const ungradedCount = mySubmissions.filter(
    (s) => s.status !== "graded",
  ).length;

  const chartData = myClasses.map((c) => {
    const classAssignments = assignments.filter(
      (a) => a.classId === c.id, 
    );
    const classAssignmentIds = classAssignments.map((a) => a.id); 
    const classSubmissions = submissions.filter(
      (s) => classAssignmentIds.includes(s.assignmentId), 
    );
    const gradedSubmissions = classSubmissions.filter(
      (s) => s.status === "graded",
    );

    return {
      name: c.title,
      "نمره داده شده": gradedSubmissions.length,
      "در انتظار بررسی": classSubmissions.length - gradedSubmissions.length,
      totalSubmissions: classSubmissions.length,
    };
  });

  const recentSessions = [...mySessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
          {chartData.length === 0 ||
          chartData.every((d) => d.totalSubmissions === 0) ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500">
              هنوز پاسخی برای تکالیف ثبت نشده است.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
                    height={60}
                    axisLine={false}
                    tickLine={false}
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
                  render: (s) => formatDate(s.date),
                },
                {
                  key: "classId",
                  title: "کلاس",
                  render: (s) =>
                    classes.find((c) => c.id === s.classId)?.title || "نامشخص", 
                },
              ]}
              data={recentSessions}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
