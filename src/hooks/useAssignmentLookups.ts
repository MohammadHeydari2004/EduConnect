import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import { TOAST_MESSAGES } from "#/configs/constants";
import { buildGradingStats } from "#/utils";
import type { ClassItem, ID, Submission, User } from "#/types";
import { useMemo } from "react";

interface AssignmentLookups {
  users: User[];
  submissions: Submission[];
  classes: ClassItem[];
}

function fetchAssignmentLookups(
  studentId?: ID,
  signal?: AbortSignal,
): Promise<AssignmentLookups> {
  return Promise.all([
    userService.getAll(undefined, signal),
    submissionService.getAll(
      studentId ? { studentId } : undefined,
      signal,
    ),
    classService.getAll(undefined, signal),
  ]).then(([users, submissions, classes]) => ({
    users,
    submissions,
    classes,
  }));
}

export function useAssignmentLookups(studentId?: ID) {
  const { data, loading, error, refresh } = useAsyncData<AssignmentLookups>({
    fetcher: (signal) => fetchAssignmentLookups(studentId, signal),
    deps: [studentId],
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
  });

  const users = data?.users ?? [];
  const submissions = data?.submissions ?? [];
  const classes = data?.classes ?? [];

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const gradingStatsMap = useMemo(
    () => buildGradingStats(submissions, (sub) => sub.assignmentId),
    [submissions],
  );

  return {
    users,
    submissions,
    classes,
    userMap,
    classMap,
    gradingStatsMap,
    loading,
    error,
    refreshLookups: refresh,
  };
}