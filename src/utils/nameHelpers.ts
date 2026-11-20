import type { ClassItem, ID, User } from "#/types";

function getLabelFromMap<T extends { id: ID }>(
  map: Map<ID, T>,
  id: ID | null | undefined,
  getLabel: (item: T) => string,
): string {
  if (id === null || id === undefined) return "\u2014";
  const item = map.get(id);
  return item ? getLabel(item) : "\u2014";
}

export function getUserNameFromMap(
  userMap: Map<ID, User>,
  userId: ID | null | undefined,
): string {
  return getLabelFromMap(userMap, userId, (user) => user.name);
}

export function getClassNameFromMap(
  classMap: Map<ID, ClassItem>,
  classId: ID | null | undefined,
): string {
  return getLabelFromMap(classMap, classId, (cls) => cls.title);
}

export function getUserEmailFromMap(
  userMap: Map<ID, User>,
  userId: ID | null | undefined,
): string {
  return getLabelFromMap(userMap, userId, (user) => user.email);
}