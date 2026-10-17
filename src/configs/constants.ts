import type { UserRole } from "#/types/common.ts";

const PREFIX = import.meta.env.VITE_STORAGE_PREFIX ?? "educonnect_";

export const STORAGE_KEYS = {
  authUser: `${PREFIX}auth_user`,
} as const;

/** Sentinel `classId` that marks an announcement as global (not tied to a class). */
export const GLOBAL_ANNOUNCEMENT_CLASS_ID = "0";

/** Every role that can log in and use the app. */
export const ALL_ROLES: UserRole[] = ["admin", "teacher", "student"];

/** Roles that may manage classes/assignments (used by the sidebar + route guards). */
export const TEACHER_AND_ABOVE_ROLES: UserRole[] = ["admin", "teacher"];

/** Roles that can view assignments (teacher and student only, not admin). */
export const TEACHER_AND_STUDENT_ROLES: UserRole[] = ["teacher", "student"];

/** Admin-only features (user management). */
export const ADMIN_ROLES: UserRole[] = ["admin"];

/** Default audience roles for a global announcement (all roles). */
export const DEFAULT_TARGET_ROLES: UserRole[] = [...ALL_ROLES];

export const DEFAULT_CLASS_CAPACITY = 10;

/** Maximum grade a teacher can assign to a submission. */
export const MAX_ASSIGNMENT_GRADE = 20;

/** Timeout for API requests (ms). */
export const API_REQUEST_TIMEOUT_MS = 10000;

/** Capacity thresholds for class enrollment visualization. */
export const CAPACITY_THRESHOLDS = {
  /** At or over 100% capacity (ratio >= 1). */
  OVER_CAPACITY: 1,
  /** At or over 80% capacity (ratio >= 0.8). */
  NEAR_CAPACITY: 0.8,
} as const;

/** Chart color palette for consistent data visualization. */
export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#6b7280", // gray
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
] as const;

export const MAX_CLASS_CAPACITY = 1000;
export const MAX_CLASS_DESCRIPTION_LENGTH = 500;
