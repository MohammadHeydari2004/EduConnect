import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import StudentAttendanceView from "#/pages/attendance/StudentAttendanceView.tsx";
import TeacherAttendanceForm from "#/pages/attendance/TeacherAttendanceForm.tsx";
import AdminAttendanceReport from "#/pages/attendance/AdminAttendanceReport.tsx";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { userService } from "#/services/user.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ClassItem } from "#/types/class.ts";
import type { AttendanceStatus } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface AttendancePageData {
  classes: ClassItem[];
  users: User[];
  sessions: Session[];
  attendances: Attendance[];
}

function fetchAttendancePageData(): Promise<AttendancePageData> {
  return Promise.all([
    classService.getAll(),
    userService.getAll(),
    sessionService.getAll(),
    attendanceService.getAll(),
  ]).then(([classes, users, sessions, attendances]) => ({
    classes,
    users,
    sessions,
    attendances,
  }));
}

export default function AttendancePage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: pageData, loading, error, refresh } = useAsyncData<
    AttendancePageData
  >({
    fetcher: fetchAttendancePageData,
    deps: [],
    fallbackError: "دریافت اطلاعات با خطا مواجه شد.",
  });

  // `searchParams` is the single source of truth for the selected class/session
  // (previously duplicated in two `useState`s that could drift out of sync).
  const selectedClassId = searchParams.get("classId") ?? "";
  const selectedSessionId = searchParams.get("sessionId") ?? "";

  const [draftAttendanceMap, setDraftAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

  const classes = pageData?.classes ?? [];
  const users = pageData?.users ?? [];
  const sessions = pageData?.sessions ?? [];
  const attendances = pageData?.attendances ?? [];

  const sessionMap = useMapById(sessions);
  const classMap = useMapById(classes);

  useEffect(() => {
    if (!selectedSessionId) {
      setDraftAttendanceMap({});
      return;
    }

    const sessionAttendances = attendances.filter(
      (a) => a.sessionId === selectedSessionId,
    );
    const map: Record<string, AttendanceStatus> = {};
    for (const a of sessionAttendances) {
      map[a.studentId] = a.status;
    }
    setDraftAttendanceMap(map);
  }, [selectedSessionId, attendances]);

const availableClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher)
      return classes.filter((c) => c.teacherId === currentUser?.id);
    return [];
  }, [classes, isAdmin, isTeacher, currentUser]);

  // For admin, include all sessions for reporting
  const availableSessions = useMemo(() => {
    if (!selectedClassId) return [];
    return sessions
      .filter((s) => s.classId === selectedClassId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, selectedClassId]);

  // Build attendance map for the selected session
  const sessionAttendances = useMemo(() => {
    if (!selectedSessionId) return {};
    const map: Record<string, AttendanceStatus> = {};
    for (const a of attendances) {
      if (a.sessionId === selectedSessionId) {
        map[a.studentId] = a.status;
      }
    }
    return map;
  }, [attendances, selectedSessionId]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const cls = classMap.get(selectedClassId);
    if (!cls) return [];
    const studentIdSet = new Set(cls.studentIds || []);
    return users.filter((u) => studentIdSet.has(u.id));
  }, [classMap, users, selectedClassId]);

  // Teacher-specific handlers
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
      // Students without an explicit entry default to "present", so opening a
      // session and saving it does not silently mark the whole class absent.
      const records = classStudents.map((student) => ({
        studentId: student.id,
        status: draftAttendanceMap[student.id] ?? "present",
      }));
       await attendanceService.saveAttendanceForSession(
          selectedSessionId,
          selectedClassId,
          records,
        );
      refresh();

      addToast("حضور و غیاب با موفقیت ذخیره شد.", "success");
    } catch (err) {
      addToast(getErrorMessage(err, "ذخیره حضور و غیاب با خطا مواجه شد."), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClassChange = (newClassId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newClassId) {
        next.set("classId", newClassId);
      } else {
        next.delete("classId");
      }
      next.delete("sessionId");
      return next;
    });
  };

  const handleSessionChange = (newSessionId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSessionId) {
        next.set("sessionId", newSessionId);
      } else {
        next.delete("sessionId");
      }
      return next;
    });
  };

  if (loading) return <Loading />;
  if (error)
    return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
        حضور و غیاب
      </h1>
      {isStudent && currentUser ? (
        <StudentAttendanceView
          attendances={attendances}
          sessionMap={sessionMap}
          classMap={classMap}
          currentUser={currentUser}
        />
      ) : isAdmin ? (
        <AdminAttendanceReport
          classes={availableClasses}
          sessions={availableSessions}
          classStudents={classStudents}
          selectedClassId={selectedClassId}
          selectedSessionId={selectedSessionId}
          attendances={sessionAttendances}
          onClassChange={handleClassChange}
          onSessionChange={handleSessionChange}
        />
      ) : isTeacher ? (
        <TeacherAttendanceForm
          data={{
            classes: availableClasses,
            sessions: availableSessions,
            classStudents,
            selectedClassId,
            selectedSessionId,
            draftAttendanceMap,
            isSaving,
          }}
          handlers={{
            onClassChange: handleClassChange,
            onSessionChange: handleSessionChange,
            onStatusChange: handleStatusChange,
            onMarkAllPresent: handleMarkAllPresent,
            onMarkAllAbsent: handleMarkAllAbsent,
            onSave: handleSave,
          }}
        />
      ) : (
        <EmptyState
          title="دسترسی محدود"
          description="شما دسترسی به این بخش ندارید."
        />
      )}
    </div>
  );
}
