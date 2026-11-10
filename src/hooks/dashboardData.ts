import { useMemo } from "react";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { announcementService } from "#/services/announcement.ts";
import { assignmentService } from "#/services/assignment.ts";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { Session } from "#/types/session.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import type { DashboardData } from "#/types/dashboard.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { EMPTY_DASHBOARD_DATA } from "#/configs/constants/dashboardConstants.ts";

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

export function getSubmittedAssignmentIds(
  submissions: Submission[],
): Set<string> {
  return new Set(submissions.map((s) => s.assignmentId));
}

export function getPendingAssignments(
  assignments: Assignment[],
  submittedAssignmentIds: Set<string>,
): Assignment[] {
  return assignments.filter((a) => !submittedAssignmentIds.has(a.id));
}

export function countPendingAssignments(
  assignments: Assignment[],
  submittedAssignmentIds: Set<string>,
): number {
  return getPendingAssignments(assignments, submittedAssignmentIds).length;
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

  const myClasses = classes.filter((c) => c.teacherId === userId);

  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );

  const myAssignments = assignments.filter((a) => myClassIdSet.has(a.classId));
  const myAssignmentIds = new Set(myAssignments.map((a) => a.id));
  const mySubmissions = submissions.filter((s) =>
    myAssignmentIds.has(s.assignmentId),
  );
  const mySessions = sessions.filter((s) => myClassIdSet.has(s.classId));
  const myAnnouncements = announcements.filter((a) => a.authorId === userId);

  const classMap = useMapById(myClasses);

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

  const myClasses = classes.filter((c) => (c.studentIds || []).includes(userId));

  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );

  const myAssignments = assignments.filter((a) => myClassIdSet.has(a.classId));
  const mySubmissions = submissions.filter((s) => s.studentId === userId);

  const submittedAssignmentIds = useMemo(
    () => getSubmittedAssignmentIds(mySubmissions),
    [mySubmissions],
  );

  const pendingAssignments = useMemo(
    () => countPendingAssignments(myAssignments, submittedAssignmentIds),
    [myAssignments, submittedAssignmentIds],
  );

  const myAttendances = attendances.filter((a) => a.studentId === userId);

  const classMap = useMapById(myClasses);

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

export function useGradingStats(
  myClasses: ClassItem[],
  assignments: Assignment[],
  submissions: Submission[],
  myClassIdSet: Set<string>,
) {
  return useMemo(() => {
    const assignmentClassMap = new Map<string, string>();
    for (const a of assignments) {
      if (myClassIdSet.has(a.classId)) {
        assignmentClassMap.set(a.id, a.classId);
      }
    }

    const classStats = submissions.reduce((acc, s) => {
      
      const hasContent = s.content && s.content.trim().length > 0;
      if (!hasContent) return acc;
      
      const classId = assignmentClassMap.get(s.assignmentId);
      if (classId && myClassIdSet.has(classId)) {
        const stats = acc.get(classId) ?? { graded: 0, total: 0 };
        stats.total++;
        if (s.status === "graded") stats.graded++;
        acc.set(classId, stats);
      }
      return acc;
    }, new Map<string, { graded: number; total: number }>());

    myClasses.forEach((c) => {
      if (!classStats.has(c.id)) {
        classStats.set(c.id, { graded: 0, total: 0 });
      }
    });

    return myClasses.map((c) => {
      const stats = classStats.get(c.id)!;
      return {
        name: c.title,
        graded: stats.graded,
        pending: stats.total - stats.graded,
        totalSubmissions: stats.total,
      };
    });
  }, [myClasses, assignments, submissions, myClassIdSet]);
}

export function useRecentSessions(sessions: Session[]): Session[] {
  return useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [sessions],
  );
}

export function useChartSummary(
  chartData: { name: string; totalSubmissions: number; graded: number }[],
): string {
  return useMemo(() => {
    if (chartData.every((d) => d.totalSubmissions === 0))
      return "هنوز پاسخی برای تکالیف ثبت نشده است.";
    return `وضعیت تصحیح تکالیف: ${chartData.map((d) => `${d.name} (${d.graded} تصحیح شده از ${d.totalSubmissions})`).join("، ")}`;
  }, [chartData]);
}

async function fetchRawDashboardData(): Promise<DashboardData> {
  const [users, classes, sessions, assignments, submissions, attendances, announcements] =
    await Promise.all([
      userService.getAll(),
      classService.getAll(),
      sessionService.getAll(),
      assignmentService.getAll(),
      submissionService.getAll(),
      attendanceService.getAll(),
      announcementService.getAll(),
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
  const fetcher = useMemo(() => {
    if (!user) return () => Promise.resolve(EMPTY_DASHBOARD_DATA);
    return fetchRawDashboardData;
  }, [user]);

  const { data, loading, error } = useAsyncData<DashboardData>({
    fetcher,
    deps: [user?.id],
    fallbackError: "خطا در بارگذاری داده‌های داشبورد.",
  });

  return {
    data: data ?? EMPTY_DASHBOARD_DATA,
    loading,
    error,
  };
}
