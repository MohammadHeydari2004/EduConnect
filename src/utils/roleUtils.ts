import type { Maybe } from "#/types/common.ts";
import type { UserRole } from "#/types/common.ts";
import type { User } from "#/types/user.ts";

export function hasRole(user: Maybe<User>, role: UserRole): boolean {
  return user?.role === role;
}

export function isAdmin(user: Maybe<User>): boolean {
  return hasRole(user, "admin");
}

export function isTeacher(user: Maybe<User>): boolean {
  return hasRole(user, "teacher");
}

export function isStudent(user: Maybe<User>): boolean {
  return hasRole(user, "student");
}
