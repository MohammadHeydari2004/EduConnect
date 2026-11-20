import EmptyState from "#/components/common/EmptyState.tsx";
import { CheckCircleIcon, BanIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Select from "#/components/ui/Select.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { studentNameEmailColumns } from "#/pages/attendance/attendanceColumns.tsx";
import AttendanceClassSessionSelector from "#/components/common/AttendanceClassSessionSelector.tsx";
import type { AttendanceStatus, ClassItem, Session, User } from "#/types";
import { selectValue } from "#/utils";
import { ATTENDANCE_LABELS } from "#/configs/constants";

const ATTENDANCE_STATUS_OPTIONS: Array<{
  label: string;
  value: AttendanceStatus;
}> = [
  { label: ATTENDANCE_LABELS.present, value: "present" },
  { label: ATTENDANCE_LABELS.late, value: "late" },
  { label: ATTENDANCE_LABELS.absent, value: "absent" },
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
      <AttendanceClassSessionSelector
        classes={classes}
        sessions={sessions}
        selectedClassId={selectedClassId}
        selectedSessionId={selectedSessionId}
        onClassChange={onClassChange}
        onSessionChange={onSessionChange}
      />
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
                  ...studentNameEmailColumns("35%", "40%"),
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
                            selectValue(
                              e.target.value,
                              ["present", "late", "absent"],
                              "present",
                            ),
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
                            selectValue(
                              e.target.value,
                              ["present", "late", "absent"],
                              "present",
                            ),
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
