import type { Assignment, ID, Submission } from "#/types";
import { MS_PER_DAY } from "./formatDate.ts";
import { isDeadlineExpired } from "./deadline.ts";

type StatusColor = "green" | "yellow" | "red";

export const NEAR_DEADLINE_DAYS = 3;
export const NEAR_DEADLINE_HOURS = 24;

export function getDeadlineColor(deadline: string): StatusColor {
  const now = Date.now();
  const deadlineTime = new Date(deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffDays = diffMs / MS_PER_DAY;

  if (diffMs < 0) return "red";
  if (diffDays <= NEAR_DEADLINE_DAYS) return "yellow";
  return "green";
}

export function getDeadlineColorClass(color: StatusColor): string {
  switch (color) {
    case "green":
      return "text-green-600";
    case "yellow":
      return "text-yellow-600";
    case "red":
      return "text-red-600";
  }
}

export function getDeadlineBadgeLabel(color: StatusColor): string {
  switch (color) {
    case "green":
      return "وقت کافی";
    case "yellow":
      return "نزدیک ددلاین";
    case "red":
      return "منقضی شده";
  }
}

export function getSubmissionPreview(content: string, maxLength = 50): string {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + "...";
}

function isAssignmentExpired(assignment: Assignment): boolean {
  return isDeadlineExpired(assignment.deadline);
}

const CAPACITY_THRESHOLDS = {
  OVER_CAPACITY: 1,
  NEAR_CAPACITY: 0.8,
} as const;

export function getCapacityVariant(
  currentCount: number,
  capacity: number,
): StatusColor {
  if (capacity <= 0) return "red";
  const ratio = currentCount / capacity;
  if (ratio >= CAPACITY_THRESHOLDS.OVER_CAPACITY) return "red";
  if (ratio >= CAPACITY_THRESHOLDS.NEAR_CAPACITY) return "yellow";
  return "green";
}

interface AssignmentSubmissionStatus {
  sub: Submission | undefined;
  isGraded: boolean;
  isReturned: boolean;
  isExpired: boolean;
}

export function getAssignmentSubmissionStatus(
  assignment: Assignment,
  getSubmission: (assignmentId: ID) => Submission | undefined,
): AssignmentSubmissionStatus {
  const sub = getSubmission(assignment.id);
  const isGraded = sub?.status === "graded";
  const isReturned = sub?.status === "returned";
  const isExpired = isAssignmentExpired(assignment);
  return { sub, isGraded, isReturned, isExpired };
}
