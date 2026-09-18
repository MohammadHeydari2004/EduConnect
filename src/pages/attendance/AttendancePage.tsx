import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Select from "#/components/ui/Select.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { userService } from "#/services/user.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ClassItem } from "#/types/class.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function AttendancePage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>(
    searchParams.get("classId") || "",
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    searchParams.get("sessionId") || "",
  );
  const [draftAttendanceMap, setDraftAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [prevSessionId, setPrevSessionId] = useState(selectedSessionId);
  const [prevAttendancesLength, setPrevAttendancesLength] = useState(
    attendances.length,
  );

  if (prevSessionId !== selectedSessionId) {
    setPrevSessionId(selectedSessionId);
    if (!selectedSessionId) {
      setDraftAttendanceMap({});
    } else {
      const sessionAttendances = attendances.filter(
        (a) => a.sessionId === selectedSessionId,
      );
      const map: Record<string, AttendanceStatus> = {};
      for (const a of sessionAttendances) {
        map[a.studentId] = a.status;
      }
      setDraftAttendanceMap(map);
    }
  } else if (
    prevAttendancesLength !== attendances.length &&
    selectedSessionId
  ) {
    setPrevAttendancesLength(attendances.length);
    const sessionAttendances = attendances.filter(
      (a) => a.sessionId === selectedSessionId,
    );
    const map: Record<string, AttendanceStatus> = {};
    for (const a of sessionAttendances) {
      map[a.studentId] = a.status;
    }
    setDraftAttendanceMap(map);
  }

  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";
  const canManage = isAdmin || isTeacher;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, u, s, a] = await Promise.all([
          classService.getAll(),
          userService.getAll(),
          sessionService.getAll(),
          attendanceService.getAll(),
        ]);
        if (!cancelled) {
          setClasses(c);
          setUsers(u);
          setSessions(s);
          setAttendances(a);
        }
      } catch {
        if (!cancelled) setError("دریافت اطلاعات با خطا مواجه شد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher)
      return classes.filter((c) => c.teacherId === currentUser?.id);
    return [];
  }, [classes, isAdmin, isTeacher, currentUser]);

  const availableSessions = useMemo(() => {
    if (!selectedClassId) return [];
    return sessions
      .filter((s) => s.classId === selectedClassId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return [];
    return users.filter((u) => (cls.studentIds || []).includes(u.id));
  }, [classes, users, selectedClassId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedSessionId || !selectedClassId) return;
    setIsSaving(true);
    try {
      const records = classStudents.map((student) => ({
        studentId: student.id,
        status: draftAttendanceMap[student.id] || "absent",
      }));
      await attendanceService.saveAttendanceForSession(
        selectedSessionId,
        selectedClassId,
        records,
      );
      const updated = await attendanceService.getAll();
      setAttendances(updated);
      addToast("حضور و غیاب با موفقیت ذخیره شد.", "success");
    } catch {
      addToast("ذخیره حضور و غیاب با خطا مواجه شد.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const studentView = useMemo(() => {
    if (!isStudent || !currentUser) return null;
    const myAttendances = attendances.filter(
      (a) => a.studentId === currentUser.id,
    );
    const stats = attendanceService.calculateStudentStats(myAttendances);
    const sessionDetails = myAttendances.map((a) => {
      const session = sessions.find((s) => s.id === a.sessionId);
      const cls = classes.find((c) => c.id === a.classId);
      return {
        ...a,
        sessionTitle: session?.title || "—",
        sessionDate: session?.date || "—",
        classTitle: cls?.title || "—",
      };
    });
    return { ...stats, sessionDetails };
  }, [attendances, sessions, classes, isStudent, currentUser]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
        حضور و غیاب
      </h1>
      {isStudent && studentView ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Card title="کل جلسات ثبت‌شده">
              <div className="text-2xl font-bold text-gray-800">
                {studentView.total}
              </div>
            </Card>
            <Card title="حاضر">
              <div className="text-2xl font-bold text-green-600">
                {studentView.present}
              </div>
            </Card>
            <Card title="با تأخیر">
              <div className="text-2xl font-bold text-yellow-600">
                {studentView.late}
              </div>
            </Card>
            <Card title="غایب">
              <div className="text-2xl font-bold text-red-600">
                {studentView.absent}
              </div>
            </Card>
            <Card title="درصد حضور">
              <div className="text-2xl font-bold text-blue-600">
                {studentView.percentage.toFixed(1)}%
              </div>
            </Card>
          </div>
          <Card title="نوار پیشرفت حضور">
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(studentView.percentage, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {studentView.attended} جلسه از {studentView.total} جلسه (present +
              late به‌عنوان «حاضر» محاسبه می‌شود).
            </p>
          </Card>
          <Card title="جزئیات جلسات">
            {studentView.sessionDetails.length === 0 ? (
              <EmptyState
                title="هنوز جلسه‌ای ثبت نشده"
                description="هیچ رکورد حضور و غیابی برای شما ثبت نشده است."
              />
            ) : (
              <div className="-mx-5 overflow-x-auto sm:mx-0">
                <Table
                  getRowKey={(item) => item.id}
                  columns={[
                    {
                      key: "classTitle",
                      title: "کلاس",
                      render: (item) => item.classTitle,
                    },
                    {
                      key: "sessionTitle",
                      title: "جلسه",
                      render: (item) => item.sessionTitle,
                    },
                    {
                      key: "sessionDate",
                      title: "تاریخ",
                      render: (item) => item.sessionDate,
                    },
                    {
                      key: "status",
                      title: "وضعیت",
                      render: (item) => <StatusChip status={item.status} />,
                    },
                  ]}
                  data={studentView.sessionDetails}
                />
              </div>
            )}
          </Card>
        </>
      ) : canManage ? (
        <>
          <Card title="ثبت حضور و غیاب">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="کلاس"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSessionId("");
                }}
                options={[
                  { label: "انتخاب کلاس...", value: "" },
                  ...availableClasses.map((c) => ({
                    label: c.title || "(بدون عنوان)",
                    value: c.id,
                  })),
                ]}
              />
              <Select
                label="جلسه"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={!selectedClassId}
                options={[
                  { label: "انتخاب جلسه...", value: "" },
                  ...availableSessions.map((s) => ({
                    label: `${s.title} - ${s.date}`,
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
                  <div className="-mx-5 overflow-x-auto sm:mx-0">
                    <Table
                      getRowKey={(student) => student.id}
                      columns={[
                        {
                          key: "name",
                          title: "نام",
                          render: (student) => (
                            <span className="font-medium text-gray-800">
                              {student.name}
                            </span>
                          ),
                        },
                        {
                          key: "email",
                          title: "ایمیل",
                          render: (student) => (
                            <span className="text-sm text-gray-600">
                              {student.email}
                            </span>
                          ),
                        },
                        {
                          key: "status",
                          title: "وضعیت حضور",
                          render: (student) => (
                            <select
                              value={draftAttendanceMap[student.id] || "absent"}
                              onChange={(e) =>
                                handleStatusChange(
                                  student.id,
                                  e.target.value as AttendanceStatus,
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-hidden focus:border-blue-500"
                            >
                              <option value="present">حاضر</option>
                              <option value="late">با تأخیر</option>
                              <option value="absent">غایب</option>
                            </select>
                          ),
                        },
                      ]}
                      data={classStudents}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "در حال ذخیره..." : "ذخیره حضور و غیاب"}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </>
      ) : (
        <EmptyState
          title="دسترسی محدود"
          description="شما دسترسی به این بخش ندارید."
        />
      )}
    </div>
  );
}
