import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { useMemo } from "react";

export function useAssignmentsPageData() {
  const usersAsync = useAsyncData<User[]>({
    fetcher: (signal) => userService.getAll(undefined, signal),
    deps: [],
    fallbackError: "دریافت لیست کاربران با خطا مواجه شد.",
  });

  const submissionsAsync = useAsyncData<Submission[]>({
    fetcher: (signal) => submissionService.getAll(undefined, signal),
    deps: [],
    fallbackError: "دریافت لیست ارسال‌ها با خطا مواجه شد.",
  });

  const classesAsync = useAsyncData<ClassItem[]>({
    fetcher: () => classService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کلاس‌ها با خطا مواجه شد.",
  });

  const users = usersAsync.data ?? [];
  const submissions = submissionsAsync.data ?? [];
  const classes = classesAsync.data ?? [];

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const gradingStatsMap = useMemo(() => {
    const map = new Map<ID, { graded: number; total: number }>();
    for (const sub of submissions) {
      
      const hasContent = sub.content && sub.content.trim().length > 0;
      if (!hasContent) continue;
      
      const stats = map.get(sub.assignmentId) ?? { graded: 0, total: 0 };
      stats.total++;
      if (sub.status === "graded") stats.graded++;
      map.set(sub.assignmentId, stats);
    }
    return map;
  }, [submissions]);

  return {
    users,
    submissions,
    classes,
    userMap,
    classMap,
    gradingStatsMap,
    loading:
      usersAsync.loading ||
      submissionsAsync.loading ||
      classesAsync.loading,
    error:
      usersAsync.error ||
      submissionsAsync.error ||
      classesAsync.error,
    refreshSubmissions: submissionsAsync.refresh,
  };
}
