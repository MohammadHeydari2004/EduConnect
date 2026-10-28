import Card from "#/components/ui/Card.tsx";
import ChartLegend from "#/components/ui/ChartLegend.tsx";
import ChartTooltip, {
  defaultChartLabel,
  type ChartPayloadEntry,
} from "#/components/ui/ChartTooltip.tsx";
import EmptyState from "#/components/common/EmptyState.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import { ATTENDANCE_LABELS } from "#/components/ui/StatusChip.tsx";
import type { DashboardData } from "#/types/dashboard.ts";
import { attendanceService } from "#/services/attendance.ts";
import type { User } from "#/types/user.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import { formatDate, formatRelativeTime } from "#/utils/formatDate.ts";
import { isAnnouncementVisibleTo } from "#/utils/announcementVisibility.ts";
import { useStudentDashboardData } from "#/utils/dashboardData.ts";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ATTENDANCE_COLORS: Record<string, string> = {
  present: "#16a34a",
  late: "#ca8a04",
  absent: "#dc2626",
};

const FALLBACK_COLOR = "#8884d8";

interface Props {
  data: DashboardData;
  currentUser: User;
}

export default function StudentDashboard({ data, currentUser }: Props) {
  const {
    myClasses,
    myAttendances,
    pendingAssignments,
    myAssignments,
    mySubmissions,
    classMap,
  } = useStudentDashboardData(data, currentUser);

  const attendanceStats = useMemo(
    () => attendanceService.calculateStudentStats(myAttendances),
    [myAttendances],
  );

  const attendanceChartData = useMemo(() => {
    const total =
      attendanceStats.present + attendanceStats.late + attendanceStats.absent;

    const items: Array<{ key: string; value: number }> = [
      { key: "present", value: attendanceStats.present },
      { key: "late", value: attendanceStats.late },
      { key: "absent", value: attendanceStats.absent },
    ];

    return items
      .filter((item) => item.value > 0)
      .map(({ key, value }) => ({
        key,
        name: ATTENDANCE_LABELS[key as AttendanceStatus] ?? key,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }));
  }, [attendanceStats]);

  const upcomingAssignments = useMemo(() => {
    const submittedIds = new Set(mySubmissions.map((s) => s.assignmentId));
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return myAssignments
      .filter((a) => {
        if (submittedIds.has(a.id)) return false;
        const deadline = new Date(a.deadline);
        return deadline >= now && deadline <= threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [myAssignments, mySubmissions]);

  const relevantAnnouncements = useMemo(() => {
    return data.announcements
      .filter((a) => isAnnouncementVisibleTo(currentUser, a, classMap))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [data.announcements, currentUser, classMap]);

  const chartSummary = `وضعیت حضور و غیاب: ${attendanceChartData.map((d) => `${d.name} ${d.value} جلسه`).join("، ")}`;

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
            <div className="h-72" role="img" aria-label={chartSummary}>
              <span className="sr-only">{chartSummary}</span>
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
                        key={`cell-${entry.key}`}
                        fill={ATTENDANCE_COLORS[entry.key] ?? FALLBACK_COLOR}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltip>
                        {(first: ChartPayloadEntry) => {
                          const itemColor = first.color ?? "#333";
                          const value =
                            typeof first.value === "number"
                              ? first.value
                              : 0;
                          const percentage =
                            ((first.payload as { percentage?: number } | undefined)
                              ?.percentage ?? 0) as number;
                          const name =
                            ((first.payload as { name?: string } | undefined)
                              ?.name ?? first.name) as string;
                          return (
                            <div className="min-w-40">
                              <p
                                style={{ color: itemColor }}
                                className="mb-2 border-b pb-1 font-bold"
                              >
                                {name}
                              </p>
                              <div className="flex items-center justify-between gap-4 py-0.5">
                                <span className="text-gray-600">
                                  تعداد جلسات:
                                </span>
                                <span className="font-bold text-gray-800">
                                  {value}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 py-0.5">
                                <span className="text-gray-600">درصد:</span>
                                <span className="font-bold text-gray-800">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      </ChartTooltip>
                    }
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={
                      <ChartLegend resolveLabel={defaultChartLabel} />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="تکالیف نزدیک به ددلاین">
          {upcomingAssignments.length === 0 ? (
            <EmptyState
              title="تکلیفی در آستانه ددلاین نیست"
              description="شما برای ۳ روز آینده تکلیف ارسال نشده‌ای ندارید."
            />
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const deadline = new Date(assignment.deadline);
                const now = new Date();
                const diffHours = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
                const isUrgent = diffHours <= 24;
                
                return (
                  <div
                    key={assignment.id}
                    className={`rounded-lg border p-3 ${isUrgent ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {assignment.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          کلاس: {classMap.get(assignment.classId)?.title ?? "نامشخص"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-medium ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                          {diffHours <= 0
                            ? "مهلت تمام شده"
                            : diffHours < 24
                            ? `${diffHours} ساعت باقی‌مانده`
                            : `${Math.ceil(diffHours / 24)} روز باقی‌مانده`}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(assignment.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

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
  );
}