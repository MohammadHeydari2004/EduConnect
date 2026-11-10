import EmptyState from "#/components/common/EmptyState.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import AttendanceClassSessionSelector from "#/components/common/AttendanceClassSessionSelector.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";

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
  const unrecordedCount = classStudents.filter(
    (s) => !attendances[s.id],
  ).length;
  const totalStudents = classStudents.length;

  return (
    <>
      <AttendanceClassSessionSelector
        classes={classes}
        sessions={sessions}
        selectedClassId={selectedClassId}
        selectedSessionId={selectedSessionId}
        onClassChange={onClassChange}
        onSessionChange={onSessionChange}
      />
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
              {unrecordedCount > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">{unrecordedCount}</div>
                  <div className="text-sm text-gray-600">ثبت‌نشده</div>
                </div>
              )}
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
                    width: "25%",
                    render: (student) => {
                      const status = attendances[student.id];
                      if (!status) {
                        return (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                            ثبت‌نشده
                          </span>
                        );
                      }
                      return <StatusChip status={status} />;
                    },
                  },
                ]}
                data={classStudents}
                  renderMobileCard={(student) => {
                    const status = attendances[student.id];
                    return (
                      <div className="space-y-3 text-right">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-gray-800">
                            {student.name}
                          </span>
                          {!status ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                              ثبت‌نشده
                            </span>
                          ) : (
                            <StatusChip status={status} />
                          )}
                        </div>
                        <div className="text-sm break-all text-gray-600">
                          {student.email}
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