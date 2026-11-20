import { useMemo } from "react";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { announcementService } from "#/services/announcement.ts";
import { assignmentService } from "#/services/assignment.ts";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import { EMPTY_DASHBOARD_DATA } from "#/configs/constants";
import type {
  Announcement,
  Assignment,
  Attendance,
  ClassItem,
  DashboardData,
  ID,
  Session,
  Submission,
  User,
} from "#/types";

interface TeacherFilteredData {
  myClasses: ClassItem[];
  myClassIdSet: Set<string>;
  myAssignments: Assignment[];
  mySubmissions: Submission[];
  mySessions: Session[];
  myAnnouncements: Announcement[];
  classMap: Map<string, ClassItem>;
}

interface StudentFilteredData {
  myClasses: ClassItem[];
  myClassIdSet: Set<string>;
  myAssignments: Assignment[];
  mySubmissions: Submission[];
  classMap: Map<string, ClassItem>;
  myAttendances: Attendance[];
  pendingAssignments: number;
  submittedAssignmentIds: Set<string>;
}

function filterMyClasses(
  classes: ClassItem[],
  userId: ID,
  role: "teacher" | "student",
): ClassItem[] {
  return role === "teacher"
    ? classes.filter((c) => c.teacherId === userId)
    : classes.filter((c) => (c.studentIds || []).includes(userId));
}

function useMyClassDerivations(myClasses: ClassItem[]) {
  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );
  const classMap = useMapById(myClasses);
  return { myClassIdSet, classMap };
}

function getSubmittedAssignmentIds(
  submissions: Submission[],
): Set<string> {
  return new Set(submissions.map((s) => s.assignmentId));
}

function getPendingAssignments(
  assignments: Assignment[],
  submittedAssignmentIds: Set<string>,
): Assignment[] {
  return assignments.filter((a) => !submittedAssignmentIds.has(a.id));
}

export function useTeacherDashboardData(
  userId: ID,
  data: {
    classes: ClassItem[];
    assignments: Assignment[];
    submissions: Submission[];
    sessions: Session[];
    announcements: Announcement[];
  },
): TeacherFilteredData {
  const { classes, assignments, submissions, sessions, announcements } = data;

  const myClasses = useMemo(
    () => filterMyClasses(classes, userId, "teacher"),
    [classes, userId],
  );

  const { myClassIdSet, classMap } = useMyClassDerivations(myClasses);

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIdSet.has(a.classId)),
    [assignments, myClassIdSet],
  );

  const mySubmissions = useMemo(() => {
    const myAssignmentIds = new Set(myAssignments.map((a) => a.id));
    return submissions.filter((s) => myAssignmentIds.has(s.assignmentId));
  }, [submissions, myAssignments]);

  const mySessions = useMemo(
    () => sessions.filter((s) => myClassIdSet.has(s.classId)),
    [sessions, myClassIdSet],
  );

  const myAnnouncements = useMemo(
    () => announcements.filter((a) => a.authorId === userId),
    [announcements, userId],
  );

  return {
    myClasses,
    myClassIdSet,
    myAssignments,
    mySubmissions,
    mySessions,
    myAnnouncements,
    classMap,
  };
}

export function useStudentDashboardData(
  userId: ID,
  data: {
    classes: ClassItem[];
    assignments: Assignment[];
    submissions: Submission[];
    attendances: Attendance[];
    announcements: Announcement[];
  },
): StudentFilteredData {
  const { classes, assignments, submissions, attendances } = data;

  const myClasses = useMemo(
    () => filterMyClasses(classes, userId, "student"),
    [classes, userId],
  );

  const { myClassIdSet, classMap } = useMyClassDerivations(myClasses);

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIdSet.has(a.classId)),
    [assignments, myClassIdSet],
  );

  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.studentId === userId),
    [submissions, userId],
  );

  const submittedAssignmentIds = useMemo(
    () => getSubmittedAssignmentIds(mySubmissions),
    [mySubmissions],
  );

  const pendingAssignments = useMemo(
    () => getPendingAssignments(myAssignments, submittedAssignmentIds).length,
    [myAssignments, submittedAssignmentIds],
  );

  const myAttendances = useMemo(
    () => attendances.filter((a) => a.studentId === userId),
    [attendances, userId],
  );

  return {
    myClasses,
    myClassIdSet,
    myAssignments,
    mySubmissions,
    classMap,
    myAttendances,
    pendingAssignments,
    submittedAssignmentIds,
  };
}

async function fetchRawDashboardData(
  role: User["role"],
  signal?: AbortSignal,
): Promise<DashboardData> {
  const isAdminRole = role === "admin";
  const isStudentRole = role === "student";

  const [users, classes, sessions, assignments, submissions, attendances, announcements] =
    await Promise.all([
      isAdminRole
        ? userService.getAll(undefined, signal)
        : Promise.resolve<User[]>([]),
      classService.getAll(undefined, signal),
      isStudentRole
        ? Promise.resolve<Session[]>([])
        : sessionService.getAll(undefined, signal),
      assignmentService.getAll(undefined, signal),
      isAdminRole
        ? Promise.resolve<Submission[]>([])
        : submissionService.getAll(undefined, signal),
      isStudentRole
        ? attendanceService.getAll(undefined, signal)
        : Promise.resolve<Attendance[]>([]),
      isAdminRole
        ? Promise.resolve<Announcement[]>([])
        : announcementService.getAll(undefined, signal),
    ]);
  return {
    users,
    classes,
    sessions,
    assignments,
    submissions,
    attendances,
    announcements,
  };
}

interface UseDashboardDataResult {
  data: DashboardData;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(
  user: User | null | undefined,
): UseDashboardDataResult {
  const role = user?.role;

  const fetcher = useMemo(() => {
    if (!role) return () => Promise.resolve(EMPTY_DASHBOARD_DATA);
    return (signal?: AbortSignal) => fetchRawDashboardData(role, signal);
  }, [role]);

  const { data, loading, error } = useAsyncData<DashboardData>({
    fetcher,
    deps: [user?.id, role],
    fallbackError: "خطا در بارگذاری داده‌های داشبورد.",
  });

  return {
    data: data ?? EMPTY_DASHBOARD_DATA,
    loading,
    error,
  };
}