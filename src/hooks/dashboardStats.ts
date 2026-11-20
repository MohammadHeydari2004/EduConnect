import { useMemo } from "react";
import { buildChartSummary, buildGradingStats, getRecentItems } from "#/utils";
import type { Assignment, ClassItem, Session, Submission } from "#/types";

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

    const classStats = buildGradingStats(submissions, (s) => {
      const classId = assignmentClassMap.get(s.assignmentId);
      return classId && myClassIdSet.has(classId) ? classId : undefined;
    });

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
    () => getRecentItems(sessions, 5, (s) => new Date(s.date).getTime()),
    [sessions],
  );
}

export function useChartSummary(
  chartData: { name: string; totalSubmissions: number; graded: number }[],
): string {
  return useMemo(() => {
    if (chartData.every((d) => d.totalSubmissions === 0))
      return "هنوز پاسخی برای تکالیف ثبت نشده است.";
    return buildChartSummary(
      "وضعیت تصحیح تکالیف",
      chartData,
      (d) => `${d.name} (${d.graded} تصحیح شده از ${d.totalSubmissions})`,
    );
  }, [chartData]);
}