import { ADMIN_ROLES, TEACHER_ROLES } from "#/configs/constants";
import type { Maybe, User, UserRole } from "#/types";

type RoleLike = Maybe<User> | UserRole;

function getRole(user: RoleLike): UserRole | null {
  if (typeof user === "string") return user;
  return user?.role ?? null;
}

export function isAdmin(user: RoleLike): boolean {
  const role = getRole(user);
  return role ? ADMIN_ROLES.includes(role) : false;
}

export function isTeacher(user: RoleLike): boolean {
  const role = getRole(user);
  return role ? TEACHER_ROLES.includes(role) : false;
}