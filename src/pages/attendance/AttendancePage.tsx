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
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [prevAttendances, setPrevAttendances] = useState(attendances);

  if (prevSessionId !== selectedSessionId || prevAttendances !== attendances) {
    setPrevSessionId(selectedSessionId);
    setPrevAttendances(attendances);

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
  }

  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";
  const canManage = isAdmin || isTeacher;
  const sessionMap = useMemo(() => {
    const map = new Map<string, Session>();
    sessions.forEach((s) => map.set(s.id, s));
    return map;
  }, [sessions]);

  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

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
    const cls = classMap.get(selectedClassId);
    if (!cls) return [];
    const studentIdSet = new Set(cls.studentIds || []);
    return users.filter((u) => studentIdSet.has(u.id));
  }, [classMap, users, selectedClassId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      newMap[s.id] = "present";
    });
    setDraftAttendanceMap(newMap);
  };

  const handleMarkAllAbsent = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      newMap[s.id] = "absent";
    });
    setDraftAttendanceMap(newMap);
  };
  const handleSave = async () => {
    if (!selectedSessionId || !selectedClassId) return;
    setIsSaving(true);
    try {
      const records = classStudents.map((student) => ({
        studentId: student.id,
        status: draftAttendanceMap[student.id] || "absent",
      }));
      const savedRecords = await attendanceService.saveAttendanceForSession(
        selectedSessionId,
        selectedClassId,
        records,
      );
      setAttendances((prev) => {
        const filtered = prev.filter((a) => a.sessionId !== selectedSessionId);
        return [...filtered, ...savedRecords];
      });

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
  }, [attendances, sessionMap, classMap, isStudent, currentUser]);
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    setSelectedSessionId("");
    setSearchParams((prev) => {
      if (newClassId) {
        prev.set("classId", newClassId);
        prev.delete("sessionId");
      } else {
        prev.delete("classId");
        prev.delete("sessionId");
      }
      return prev;
    });
  };

  const handleSessionChange = (newSessionId: string) => {
    setSelectedSessionId(newSessionId);
    setSearchParams((prev) => {
      if (newSessionId) {
        prev.set("sessionId", newSessionId);
      } else {
        prev.delete("sessionId");
      }
      return prev;
    });
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
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
                renderMobileCard={(item) => (
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-gray-800">
                        {item.sessionTitle}
                      </span>
                      <StatusChip status={item.status} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-500">کلاس:</span>{" "}
                      {item.classTitle}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-500">تاریخ:</span>{" "}
                      {item.sessionDate}
                    </div>
                  </div>
                )}
              />
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
                onChange={(e) => handleClassChange(e.target.value)}
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
                onChange={(e) => handleSessionChange(e.target.value)}
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
                  <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-gray-700">
                      عملیات گروهی:
                    </span>
                    <Button
                      variant="secondary"
                      onClick={handleMarkAllPresent}
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      ✓ حاضر کردن همه
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleMarkAllAbsent}
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      ✗ غایب کردن همه
                    </Button>
                  </div>

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
                            aria-label={`وضعیت حضور ${student.name}`}
                            value={draftAttendanceMap[student.id] || "absent"}
                            onChange={(e) =>
                              handleStatusChange(
                                student.id,
                                e.target.value as AttendanceStatus,
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="present">حاضر</option>
                            <option value="late">با تأخیر</option>
                            <option value="absent">غایب</option>
                          </select>
                        ),
                      },
                    ]}
                    data={classStudents}
                    renderMobileCard={(student) => {
                      const currentStatus =
                        draftAttendanceMap[student.id] || "absent";
                      const selectId = `attendance-${student.id}`;
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
                          <div>
                            <label
                              htmlFor={selectId}
                              className="mb-1 block text-xs font-medium text-gray-500"
                            >
                              وضعیت حضور:
                            </label>
                            <select
                              id={selectId}
                              value={currentStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  student.id,
                                  e.target.value as AttendanceStatus,
                                )
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="present">✓ حاضر</option>
                              <option value="late">⏱ با تأخیر</option>
                              <option value="absent">✗ غایب</option>
                            </select>
                          </div>
                        </div>
                      );
                    }}
                  />
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
