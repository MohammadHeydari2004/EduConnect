import type { UserRole } from "#/types/common.ts";

export const ALL_ROLES: UserRole[] = ["admin", "teacher", "student"];

export const TEACHER_AND_ABOVE_ROLES: UserRole[] = ["admin", "teacher"];

export const STUDENT_ROLES: UserRole[] = ["student"];

export const ADMIN_ROLES: UserRole[] = ["admin"];
