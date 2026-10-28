import type { UserRole } from "#/types/common.ts";

export const ALL_ROLES: UserRole[] = ["admin", "teacher", "student"];

export const TEACHER_AND_ABOVE_ROLES: UserRole[] = ["admin", "teacher"];

export const TEACHER_ROLES: UserRole[] = ["teacher"];

export const STUDENT_ROLES: UserRole[] = ["student"];

export const TEACHER_AND_STUDENT_ROLES: UserRole[] = ["teacher", "student"];

export const ADMIN_ROLES: UserRole[] = ["admin"];

export const DEFAULT_TARGET_ROLES: UserRole[] = [...ALL_ROLES];