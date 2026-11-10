import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";

export function getUserNameFromMap(
  userMap: Map<ID, User>,
  userId: ID | null | undefined,
): string {
  if (userId === null || userId === undefined) return "\u2014";
  return userMap.get(userId)?.name ?? "\u2014";
}

export function getClassNameFromMap(
  classMap: Map<ID, ClassItem>,
  classId: ID | null | undefined,
): string {
  if (classId === null || classId === undefined) return "\u2014";
  return classMap.get(classId)?.title ?? "\u2014";
}

export function getUserEmailFromMap(
  userMap: Map<ID, User>,
  userId: ID | null | undefined,
): string {
  if (userId === null || userId === undefined) return "\u2014";
  return userMap.get(userId)?.email ?? "\u2014";
}
