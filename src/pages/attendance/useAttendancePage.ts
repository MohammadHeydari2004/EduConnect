import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useMapById } from "#/hooks/useMapById.ts";
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
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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

export function useAttendancePage() {
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

const selectedClassId = searchParams.get("classId") ?? "";
  const selectedSessionId = searchParams.get("sessionId") ?? "";

  const [draftAttendanceMap, setDraftAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const initializedSessionRef = useRef<string | null>(null);

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

  const classes = pageData?.classes ?? [];
  const users = pageData?.users ?? [];
  const sessions = pageData?.sessions ?? [];
  const attendances = pageData?.attendances ?? [];

  const classMap = useMapById(classes);

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

  useEffect(() => {
    if (!selectedSessionId) {
      setDraftAttendanceMap({});
      initializedSessionRef.current = null;
      return;
    }

    // Only initialize if we have attendance data loaded (not loading and attendances exist)
    // or if we're switching to a different session
    const hasAttendanceData = attendances.length > 0;
    const isNewSession = initializedSessionRef.current !== selectedSessionId;

    // Use functional update to check current draft state without adding to deps
    if (isNewSession) {
      setDraftAttendanceMap(sessionAttendances);
      initializedSessionRef.current = selectedSessionId;
    } else if (hasAttendanceData) {
      setDraftAttendanceMap((prev) => {
        if (Object.keys(prev).length === 0) {
          return sessionAttendances;
        }
        return prev;
      });
    }
  }, [selectedSessionId, sessionAttendances, attendances.length]);

  const availableClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher) return classes.filter((c) => c.teacherId === currentUser?.id);
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

  const handleStatusChange = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setDraftAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    },
    [],
  );

  const setAllStatus = useCallback(
    (status: AttendanceStatus) => {
      const newMap: Record<string, AttendanceStatus> = {};
      classStudents.forEach((s) => {
        newMap[s.id] = status;
      });
      setDraftAttendanceMap(newMap);
    },
    [classStudents],
  );

  const handleMarkAllPresent = useCallback(() => setAllStatus("present"), [setAllStatus]);
  const handleMarkAllAbsent = useCallback(() => setAllStatus("absent"), [setAllStatus]);

  const handleSave = useCallback(async () => {
    if (!selectedSessionId || !selectedClassId) return;
    setIsSaving(true);
    try {
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
  }, [selectedSessionId, selectedClassId, classStudents, draftAttendanceMap, refresh, addToast]);

  const handleClassChange = useCallback((newClassId: string) => {
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
  }, [setSearchParams]);

  const handleSessionChange = useCallback((newSessionId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSessionId) {
        next.set("sessionId", newSessionId);
      } else {
        next.delete("sessionId");
      }
      return next;
    });
  }, [setSearchParams]);

  return {
    currentUser,
    isAdmin,
    isTeacher,
    isStudent,
    loading,
    error,
    selectedClassId,
    selectedSessionId,
    availableClasses,
    availableSessions,
    classStudents,
    sessionAttendances,
    draftAttendanceMap,
    isSaving,
    handleClassChange,
    handleSessionChange,
    handleStatusChange,
    handleMarkAllPresent,
    handleMarkAllAbsent,
    handleSave,
  };
}