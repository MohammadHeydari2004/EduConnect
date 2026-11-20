import type { UserRole } from "#/types";

export const ALL_ROLES: readonly UserRole[] = ["admin", "teacher", "student"];

export const TEACHER_AND_ABOVE_ROLES: readonly UserRole[] = ["admin", "teacher"];

export const STUDENT_ROLES: readonly UserRole[] = ["student"];

export const ADMIN_ROLES: readonly UserRole[] = ["admin"];

export const TEACHER_ROLES: readonly UserRole[] = ["teacher"];