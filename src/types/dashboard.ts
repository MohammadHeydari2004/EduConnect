import type { User } from "#/types/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { Announcement } from "#/types/announcement.ts";

/**
 * Shared dashboard data shape used by all role-specific dashboards.
 * Kept in a separate file to avoid circular imports and provide a single source of truth.
 */
export interface DashboardData {
  users: User[];
  classes: ClassItem[];
  sessions: Session[];
  assignments: Assignment[];
  submissions: Submission[];
  attendances: Attendance[];
  announcements: Announcement[];
}

/**
 * Empty dashboard data for initialization/fallback.
 */
export const EMPTY_DASHBOARD_DATA: DashboardData = {
  users: [],
  classes: [],
  sessions: [],
  assignments: [],
  submissions: [],
  attendances: [],
  announcements: [],
};