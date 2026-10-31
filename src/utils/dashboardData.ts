import { useMemo } from "react";
import type { ClassItem } from "#/types/class.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { Session } from "#/types/session.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { User } from "#/types/user.ts";
import { useMapById } from "#/hooks/useMapById.ts";

interface FilteredData {
  myClasses: ClassItem[];
  myClassIdSet: Set<string>;
  myAssignments: Assignment[];
  mySubmissions: Submission[];
  mySessions: Session[];
  myAnnouncements: Announcement[];
  classMap: Map<string, ClassItem>;
}

export function useTeacherDashboardData(
  data: {
    classes: ClassItem[];
    assignments: Assignment[];
    submissions: Submission[];
    sessions: Session[];
    announcements: Announcement[];
  },
  currentUser: User,
): FilteredData {
  const { classes, assignments, submissions, sessions, announcements } = data;

  const myClasses = useMemo(
    () => classes.filter((c) => c.teacherId === currentUser.id),
    [classes, currentUser.id],
  );

  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIdSet.has(a.classId)),
    [assignments, myClassIdSet],
  );

  const myAssignmentIdSet = useMemo(
    () => new Set(myAssignments.map((a) => a.id)),
    [myAssignments],
  );

  const mySubmissions = useMemo(
    () => submissions.filter((s) => myAssignmentIdSet.has(s.assignmentId)),
    [submissions, myAssignmentIdSet],
  );

  const mySessions = useMemo(
    () => sessions.filter((s) => myClassIdSet.has(s.classId)),
    [sessions, myClassIdSet],
  );

  const myAnnouncements = useMemo(
    () => announcements.filter((a) => a.authorId === currentUser.id),
    [announcements, currentUser.id],
  );

  const classMap = useMapById(classes);

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
  data: {
    classes: ClassItem[];
    assignments: Assignment[];
    submissions: Submission[];
    attendances: Attendance[];
    announcements: Announcement[];
  },
  currentUser: User,
): FilteredData & {
  myAttendances: Attendance[];
  pendingAssignments: number;
} {
  const { classes, assignments, submissions, attendances } = data;

  const myClasses = useMemo(
    () => classes.filter((c) => (c.studentIds || []).includes(currentUser.id)),
    [classes, currentUser.id],
  );

  const myClassIdSet = useMemo(
    () => new Set(myClasses.map((c) => c.id)),
    [myClasses],
  );

  const myAssignments = useMemo(
    () => assignments.filter((a) => myClassIdSet.has(a.classId)),
    [assignments, myClassIdSet],
  );

  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.studentId === currentUser.id),
    [submissions, currentUser.id],
  );

  const submittedAssignmentIds = useMemo(
    () => new Set(mySubmissions.map((s) => s.assignmentId)),
    [mySubmissions],
  );

  const pendingAssignments = myAssignments.filter(
    (a) => !submittedAssignmentIds.has(a.id),
  ).length;

  const myAttendances = useMemo(
    () => attendances.filter((a) => a.studentId === currentUser.id),
    [attendances, currentUser.id],
  );

  const mySessions: Session[] = useMemo(() => [], []);
  const myAnnouncements: Announcement[] = useMemo(() => [], []);
  const classMap = useMapById(classes);

  return {
    myClasses,
    myClassIdSet,
    myAssignments,
    mySubmissions,
    mySessions,
    myAnnouncements,
    classMap,
    myAttendances,
    pendingAssignments,
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

export function useChartSummary(chartData: { name: string; totalSubmissions: number; graded: number }[]) {
  return useMemo(() => {
    if (chartData.every((d) => d.totalSubmissions === 0))
      return "هنوز پاسخی برای تکالیف ثبت نشده است.";
    return `وضعیت تصحیح تکالیف: ${chartData.map((d) => `${d.name} (${d.graded} تصحیح شده از ${d.totalSubmissions})`).join("، ")}`;
  }, [chartData]);
}