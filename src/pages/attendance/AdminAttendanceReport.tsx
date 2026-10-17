import EmptyState from "#/components/common/EmptyState.tsx";
import Card from "#/components/ui/Card.tsx";
import Select from "#/components/ui/Select.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";

interface AdminAttendanceReportProps {
  classes: ClassItem[];
  sessions: Session[];
  classStudents: User[];
  selectedClassId: string;
  selectedSessionId: string;
  attendances: Record<string, AttendanceStatus>;
  onClassChange: (newClassId: string) => void;
  onSessionChange: (newSessionId: string) => void;
}

const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "حاضر",
  late: "با تأخیر",
  absent: "غایب",
};

export default function AdminAttendanceReport({
  classes,
  sessions,
  classStudents,
  selectedClassId,
  selectedSessionId,
  attendances,
  onClassChange,
  onSessionChange,
}: AdminAttendanceReportProps) {
  const presentCount = classStudents.filter(
    (s) => attendances[s.id] === "present",
  ).length;
  const lateCount = classStudents.filter(
    (s) => attendances[s.id] === "late",
  ).length;
  const absentCount = classStudents.filter(
    (s) => attendances[s.id] === "absent",
  ).length;
  const totalStudents = classStudents.length;

  return (
    <>
      <Card title="گزارش حضور و غیاب">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="کلاس"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            options={[
              { label: "انتخاب کلاس...", value: "" },
              ...classes.map((c) => ({
                label: c.title || "(بدون عنوان)",
                value: c.id,
              })),
            ]}
          />
          <Select
            label="جلسه"
            value={selectedSessionId}
            onChange={(e) => onSessionChange(e.target.value)}
            disabled={!selectedClassId}
            options={[
              { label: "انتخاب جلسه...", value: "" },
              ...sessions.map((s) => ({
                label: `${s.title} - ${formatDate(s.date)}`,
                value: s.id,
              })),
            ]}
          />
        </div>
      </Card>
      {selectedSessionId && (
        <>
          <Card title="خلاصه جلسه">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{totalStudents}</div>
                <div className="text-sm text-blue-600">کل دانشجویان</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                <div className="text-sm text-green-600">حاضر</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{lateCount}</div>
                <div className="text-sm text-amber-600">با تأخیر</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                <div className="text-sm text-red-600">غایب</div>
              </div>
            </div>
          </Card>
          <Card title="لیست دانشجویان">
            {classStudents.length === 0 ? (
              <EmptyState
                title="دانشجویی در این کلاس ثبت نشده"
                description="لطفاً ابتدا دانشجویان را به کلاس اضافه کنید."
              />
            ) : (
              <Table
                getRowKey={(student) => student.id}
                columns={[
                  {
                    key: "name",
                    title: "نام",
                    width: "30%",
                    render: (student) => (
                      <span className="font-medium text-gray-800">
                        {student.name}
                      </span>
                    ),
                  },
                  {
                    key: "email",
                    title: "ایمیل",
                    width: "35%",
                    render: (student) => (
                      <span className="text-sm text-gray-600 break-all">
                        {student.email}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    title: "وضعیت حضور",
                    width: "20%",
                    render: (student) => {
                      const status = attendances[student.id] ?? "present";
                      return (
                        <StatusChip status={status} />
                      );
                    },
                  },
                  {
                    key: "statusLabel",
                    title: "برچسب",
                    width: "15%",
                    render: (student) => {
                      const status = attendances[student.id] ?? "present";
                      return (
                        <span className="text-sm font-medium text-gray-700">
                          {ATTENDANCE_STATUS_LABELS[status]}
                        </span>
                      );
                    },
                  },
                ]}
                data={classStudents}
                renderMobileCard={(student) => {
                  const status = attendances[student.id] ?? "present";
                  return (
                    <div className="space-y-3 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-800">
                          {student.name}
                        </span>
                        <StatusChip status={status} />
                      </div>
                      <div className="text-sm break-all text-gray-600">
                        {student.email}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {ATTENDANCE_STATUS_LABELS[status]}
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </Card>
        </>
      )}
    </>
  );
}