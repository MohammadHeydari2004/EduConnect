import type { Assignment } from "#/types/assignment.ts";

export type BadgeVariant = "green" | "yellow" | "red";

export function getDeadlineColor(deadline: string): BadgeVariant {
  const now = Date.now();
  const deadlineTime = new Date(deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "red";
  if (diffDays <= 3) return "yellow";
  return "green";
}

export function getDeadlineColorClass(color: BadgeVariant): string {
  switch (color) {
    case "green":
      return "text-green-600";
    case "yellow":
      return "text-yellow-600";
    case "red":
      return "text-red-600";
  }
}

export function getDeadlineBadgeVariant(color: BadgeVariant): BadgeVariant {
  return color;
}

export function getDeadlineBadgeLabel(color: BadgeVariant): string {
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
): "green" | "yellow" | "red" {
  if (capacity <= 0) return "green";
  const ratio = currentCount / capacity;
  if (ratio >= CAPACITY_THRESHOLDS.OVER_CAPACITY) return "red";
  if (ratio >= CAPACITY_THRESHOLDS.NEAR_CAPACITY) return "yellow";
  return "green";
}