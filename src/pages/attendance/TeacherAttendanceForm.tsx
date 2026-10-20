import EmptyState from "#/components/common/EmptyState.tsx";
import { CheckCircleIcon, BanIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Select from "#/components/ui/Select.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";

const ATTENDANCE_STATUS_OPTIONS: Array<{
  label: string;
  value: AttendanceStatus;
}> = [
  { label: "حاضر", value: "present" },
  { label: "با تأخیر", value: "late" },
  { label: "غایب", value: "absent" },
];

interface AttendanceFormData {
  classes: ClassItem[];
  sessions: Session[];
  classStudents: User[];
  selectedClassId: string;
  selectedSessionId: string;
  draftAttendanceMap: Record<string, AttendanceStatus>;
  isSaving: boolean;
}

interface AttendanceHandlers {
  onClassChange: (newClassId: string) => void;
  onSessionChange: (newSessionId: string) => void;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
  onSave: () => void;
}

interface TeacherAttendanceFormProps {
  data: AttendanceFormData;
  handlers: AttendanceHandlers;
}

export default function TeacherAttendanceForm({
  data,
  handlers,
}: TeacherAttendanceFormProps) {
  const {
    classes,
    sessions,
    classStudents,
    selectedClassId,
    selectedSessionId,
    draftAttendanceMap,
    isSaving,
  } = data;
  const {
    onClassChange,
    onSessionChange,
    onStatusChange,
    onMarkAllPresent,
    onMarkAllAbsent,
    onSave,
  } = handlers;
  return (
    <>
      <Card title="ثبت حضور و غیاب">
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
        <Card title="لیست دانشجویان">
          {classStudents.length === 0 ? (
            <EmptyState
              title="دانشجویی در این کلاس ثبت نشده"
              description="لطفاً ابتدا دانشجویان را به کلاس اضافه کنید."
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <span className="text-sm font-medium text-gray-700">
                  عملیات گروهی:
                </span>
                <Button
                  variant="success"
                  onClick={onMarkAllPresent}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  حاضر کردن همه
                </Button>
                <Button
                  variant="danger-light"
                  onClick={onMarkAllAbsent}
                >
                  <BanIcon className="h-4 w-4" />
                  غایب کردن همه
                </Button>
              </div>

              <Table
                getRowKey={(student) => student.id}
                columns={[
                  {
                    key: "name",
                    title: "نام",
                    width: "35%",
                    render: (student) => (
                      <span className="font-medium text-gray-800">
                        {student.name}
                      </span>
                    ),
                  },
                  {
                    key: "email",
                    title: "ایمیل",
                    width: "40%",
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
                    render: (student) => (
                      <Select
                        aria-label={`وضعیت حضور ${student.name}`}
                        value={draftAttendanceMap[student.id] ?? "present"}
                        onChange={(e) =>
                          onStatusChange(
                            student.id,
                            e.target.value as AttendanceStatus,
                          )
                        }
                        options={ATTENDANCE_STATUS_OPTIONS}
                        compact
                      />
                    ),
                  },
                ]}
                data={classStudents}
                renderMobileCard={(student) => {
                  const currentStatus =
                    draftAttendanceMap[student.id] ?? "present";
                  return (
                    <div className="space-y-3 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-800">
                          {student.name}
                        </span>
                        <StatusChip status={currentStatus} />
                      </div>
                      <div className="text-sm break-all text-gray-600">
                        {student.email}
                      </div>
                      <Select
                        label="وضعیت حضور"
                        value={currentStatus}
                        onChange={(e) =>
                          onStatusChange(
                            student.id,
                            e.target.value as AttendanceStatus,
                          )
                        }
                        options={ATTENDANCE_STATUS_OPTIONS}
                        compact
                      />
                    </div>
                  );
                }}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving ? "در حال ذخیره..." : "ذخیره حضور و غیاب"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
}
