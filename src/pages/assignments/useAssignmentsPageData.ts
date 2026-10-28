import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { assignmentService } from "#/services/assignment.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { useCallback, useMemo } from "react";

export function useAssignmentsPageData() {
  const usersAsync = useAsyncData<User[]>({
    fetcher: () => userService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کاربران با خطا مواجه شد.",
  });

  const submissionsAsync = useAsyncData<Submission[]>({
    fetcher: () => submissionService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست ارسال‌ها با خطا مواجه شد.",
  });

  const classesAsync = useAsyncData<ClassItem[]>({
    fetcher: () => classService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کلاس‌ها با خطا مواجه شد.",
  });

  const assignmentsAsync = useAsyncData<Assignment[]>({
    fetcher: () => assignmentService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست تکالیف با خطا مواجه شد.",
  });

  const users = usersAsync.data ?? [];
  const submissions = submissionsAsync.data ?? [];
  const classes = classesAsync.data ?? [];
  const assignments = assignmentsAsync.data ?? [];

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const gradingStatsMap = useMemo(() => {
    const map = new Map<ID, { graded: number; total: number }>();
    const byAssignment = new Map<ID, Submission[]>();
    for (const sub of submissions) {
      const list = byAssignment.get(sub.assignmentId);
      if (list) list.push(sub);
      else byAssignment.set(sub.assignmentId, [sub]);
    }
    for (const a of assignments) {
      const subs = byAssignment.get(a.id) ?? [];
      map.set(a.id, {
        graded: subs.filter((s) => s.status === "graded").length,
        total: subs.length,
      });
    }
    return map;
  }, [assignments, submissions]);

  const setSubmissionsOptimistic = useCallback(
    (updater: (prev: Submission[]) => Submission[]) => {
      submissionsAsync.setData(updater);
    },
    [submissionsAsync],
  );

  return {
    users,
    submissions,
    classes,
    assignments,
    userMap,
    classMap,
    gradingStatsMap,
    loading:
      usersAsync.loading ||
      submissionsAsync.loading ||
      classesAsync.loading ||
      assignmentsAsync.loading,
    error:
      usersAsync.error ||
      submissionsAsync.error ||
      classesAsync.error ||
      assignmentsAsync.error,
    refreshSubmissions: submissionsAsync.refresh,
    refreshAssignments: assignmentsAsync.refresh,
    setSubmissionsOptimistic,
  };
}
