import EmptyState from "#/components/common/EmptyState.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import Table from "#/components/ui/Table.tsx";
import { attendanceService } from "#/services/attendance.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useMemo } from "react";

interface StudentAttendanceViewProps {
  attendances: Attendance[];
  sessionMap: Map<string, Session>;
  classMap: Map<string, ClassItem>;
  currentUser: User;
}

export default function StudentAttendanceView({
  attendances,
  sessionMap,
  classMap,
  currentUser,
}: StudentAttendanceViewProps) {
  const studentView = useMemo(() => {
    const myAttendances = attendances.filter(
      (a) => a.studentId === currentUser.id,
    );
    const stats = attendanceService.calculateStudentStats(myAttendances);
    const sessionDetails = myAttendances.map((a) => {
      const session = sessionMap.get(a.sessionId);
      const cls = classMap.get(a.classId);
      return {
        ...a,
        sessionTitle: session?.title || "—",
        sessionDate: session?.date || "—",
        classTitle: cls?.title || "—",
      };
    });
    return { ...stats, sessionDetails };
  }, [attendances, sessionMap, classMap, currentUser]);

  const progressPercent = studentView.percentage;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="کل جلسات ثبت‌شده"
          value={studentView.total}
          color="text-gray-800"
        />
        <StatCard
          title="حاضر"
          value={studentView.present}
          color="text-green-600"
        />
        <StatCard
          title="با تأخیر"
          value={studentView.late}
          color="text-yellow-600"
        />
        <StatCard
          title="غایب"
          value={studentView.absent}
          color="text-red-600"
        />
        <StatCard
          title="درصد حضور"
          value={`${studentView.percentage.toFixed(1)}%`}
          color="text-blue-600"
        />
      </div>
      <Card title="نوار پیشرفت حضور">
        <div
          className="h-4 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label="درصد حضور"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {studentView.attended} جلسه از {studentView.total} جلسه (حاضر + با تأخیر
          به‌عنوان «حاضر» محاسبه می‌شود).
        </p>
      </Card>
      <Card title="جزئیات جلسات">
        {studentView.sessionDetails.length === 0 ? (
          <EmptyState
            title="هنوز جلسه‌ای ثبت نشده"
            description="هیچ رکورد حضور و غیابی برای شما ثبت نشده است."
          />
        ) : (
          <Table
            getRowKey={(item) => item.id}
            columns={[
              {
                key: "classTitle",
                title: "کلاس",
                width: "30%",
                render: (item) => item.classTitle,
              },
              {
                key: "sessionTitle",
                title: "جلسه",
                width: "30%",
                render: (item) => item.sessionTitle,
              },
              {
                key: "sessionDate",
                title: "تاریخ",
                width: "20%",
                render: (item) => formatDate(item.sessionDate),
              },
              {
                key: "status",
                title: "وضعیت",
                width: "20%",
                render: (item) => <StatusChip status={item.status} />,
              },
            ]}
            data={studentView.sessionDetails}
            renderMobileCard={(item) => (
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-gray-800">
                    {item.sessionTitle}
                  </span>
                  <StatusChip status={item.status} />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-500">کلاس: </span>{" "}
                  {item.classTitle}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-500">تاریخ: </span>{" "}
                  {formatDate(item.sessionDate)}
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </>
  );
}
