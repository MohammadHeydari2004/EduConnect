import Card from "#/components/ui/Card.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardData } from "./DashboardContainer";

const ATTENDANCE_COLORS: Record<string, string> = {
  حاضر: "#16a34a", // green-600
  "با تأخیر": "#ca8a04", // yellow-600
  غایب: "#dc2626", // red-600
};

const FALLBACK_COLOR = "#8884d8";

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: ChartDataItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomAttendanceTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    if (data) {
      const itemColor = data.color ?? "#333";
      const value = data.value ?? 0;
      const percentage = data.payload?.percentage ?? 0;
      const name = data.payload?.name ?? data.name ?? "";

      return (
        <div className="min-w-40 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
          <p
            style={{ color: itemColor }}
            className="mb-2 border-b pb-1 font-bold"
          >
            {name}
          </p>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-gray-600">تعداد جلسات:</span>
            <span className="font-bold text-gray-800">{value}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-gray-600">درصد:</span>
            <span className="font-bold text-gray-800">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
  }
  return null;
}

interface LegendPayloadEntry {
  value: string;
  color?: string;
  payload?: {
    name?: string;
  };
}

interface CustomLegendProps {
  payload?: LegendPayloadEntry[];
}

function CustomAttendanceLegend({ payload }: CustomLegendProps) {
  if (payload) {
    return (
      <ul className="mt-2 flex flex-wrap justify-center gap-4">
        {payload.map((entry, index) => {
          const entryName = entry.payload?.name ?? entry.value ?? "";
          const entryColor = entry.color ?? "#8884d8";

          return (
            <li
              key={`item-${index}`}
              className="flex items-center gap-1.5 text-sm"
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: entryColor }}
              ></span>
              <span className="font-medium text-gray-700">{entryName}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  return null;
}

interface Props {
  data: DashboardData;
  currentUser: User;
}

export default function StudentDashboard({ data, currentUser }: Props) {
  const { classes, assignments, submissions, attendances, announcements } =
    data;

  const myClasses = useMemo(
    () => classes.filter((c) => c.studentIds.includes(currentUser.id)),
    [classes, currentUser],
  );
  const myClassIds = myClasses.map((c) => c.id);

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIds.includes(a.classId)),
    [assignments, myClassIds],
  );
  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.studentId === currentUser.id),
    [submissions, currentUser],
  );

  const pendingAssignments = myAssignments.filter(
    (a) => !mySubmissions.some((s) => s.assignmentId === a.id),
  ).length;

  const myAttendances = useMemo(
    () => attendances.filter((a) => a.studentId === currentUser.id),
    [attendances, currentUser],
  );

  const attendanceStats = useMemo(() => {
    const present = myAttendances.filter((a) => a.status === "present").length;
    const late = myAttendances.filter((a) => a.status === "late").length;
    const absent = myAttendances.filter((a) => a.status === "absent").length;
    const total = myAttendances.length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;
    return { present, late, absent, total, percentage };
  }, [myAttendances]);

  const totalAttendance =
    attendanceStats.present + attendanceStats.late + attendanceStats.absent;

  const attendanceChartData = [
    {
      name: "حاضر",
      value: attendanceStats.present,
      percentage:
        totalAttendance > 0
          ? (attendanceStats.present / totalAttendance) * 100
          : 0,
    },
    {
      name: "با تأخیر",
      value: attendanceStats.late,
      percentage:
        totalAttendance > 0
          ? (attendanceStats.late / totalAttendance) * 100
          : 0,
    },
    {
      name: "غایب",
      value: attendanceStats.absent,
      percentage:
        totalAttendance > 0
          ? (attendanceStats.absent / totalAttendance) * 100
          : 0,
    },
  ].filter((item) => item.value > 0);

  const relevantAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        if (a.classId === "0") {
          const roles = a.targetRoles ?? ["admin", "teacher", "student"];
          return roles.includes(currentUser.role);
        }
        const targetClass = classes.find((c) => c.id === a.classId);
        if (!targetClass) return false;
        const audience = a.targetAudience ?? "students";
        const isStudentInClass = targetClass.studentIds.includes(
          currentUser.id,
        );
        return (
          (audience === "students" || audience === "both") && isStudentInClass
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [announcements, classes, currentUser]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کلاس‌های من"
          value={myClasses.length}
          color="text-blue-600"
        />
        <StatCard
          title="تکالیف در انتظار ارسال"
          value={pendingAssignments}
          color="text-yellow-600"
        />
        <StatCard
          title="درصد حضور و غیاب"
          value={`${attendanceStats.percentage.toFixed(1)}%`}
          color={
            attendanceStats.percentage >= 75 ? "text-green-600" : "text-red-600"
          }
        />
        <StatCard
          title="کل جلسات ثبت‌شده"
          value={attendanceStats.total}
          color="text-gray-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="نمودار وضعیت حضور و غیاب">
          {attendanceChartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500">
              هنوز رکورد حضور و غیابی ثبت نشده است.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={attendanceChartData}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={80}
                    fill={FALLBACK_COLOR}
                    dataKey="value"
                  >
                    {attendanceChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={ATTENDANCE_COLORS[entry.name] ?? FALLBACK_COLOR}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomAttendanceTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={<CustomAttendanceLegend />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="آخرین اطلاعیه‌های مرتبط">
          {relevantAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-500">اطلاعیه‌ای وجود ندارد.</p>
          ) : (
            <div className="space-y-3">
              {relevantAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{ann.title}</h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
