import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

export type DeadlineColor = "green" | "yellow" | "red";
export type CapacityVariant = "green" | "yellow" | "red";

export const NEAR_DEADLINE_DAYS = 3;
export const NEAR_DEADLINE_HOURS = 24;

export function getDeadlineColor(deadline: string): DeadlineColor {
  const now = Date.now();
  const deadlineTime = new Date(deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "red";
  if (diffDays <= NEAR_DEADLINE_DAYS) return "yellow";
  return "green";
}

export function getDeadlineColorClass(color: DeadlineColor): string {
  switch (color) {
    case "green":
      return "text-green-600";
    case "yellow":
      return "text-yellow-600";
    case "red":
      return "text-red-600";
  }
}

export function getDeadlineBadgeLabel(color: DeadlineColor): string {
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

export function isAssignmentExpired(assignment: Assignment): boolean {
  return new Date(assignment.deadline).getTime() < Date.now();
}

const CAPACITY_THRESHOLDS = {
  OVER_CAPACITY: 1,
  NEAR_CAPACITY: 0.8,
} as const;

export function getCapacityVariant(
  currentCount: number,
  capacity: number,
): CapacityVariant {
  if (capacity <= 0) return "red";
  const ratio = currentCount / capacity;
  if (ratio >= CAPACITY_THRESHOLDS.OVER_CAPACITY) return "red";
  if (ratio >= CAPACITY_THRESHOLDS.NEAR_CAPACITY) return "yellow";
  return "green";
}

export interface AssignmentSubmissionStatus {
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
