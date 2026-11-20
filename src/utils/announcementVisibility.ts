import { ALL_ROLES } from "#/configs/constants/roles.ts";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants/classConstants.ts";
import { DEFAULT_TARGET_AUDIENCE } from "#/configs/constants/announcementConstants.ts";
import { getRoleLabel } from "#/configs/constants/userLabels.ts";
import type { Announcement, ClassItem, User } from "#/types";

export function getTargetDescription(item: Announcement): string {
  if (item.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
    const roles = item.targetRoles ?? ALL_ROLES;
    return roles.map((r) => getRoleLabel(r)).join("، ");
  }
  const audience = item.targetAudience ?? DEFAULT_TARGET_AUDIENCE;
  if (audience === "teacher") return "استاد کلاس";
  if (audience === "students") return "دانشجویان کلاس";
  return "دانشجویان و استاد کلاس";
}

export function isAnnouncementVisibleTo(
  user: User,
  announcement: Announcement,
  classMap: Map<string, ClassItem>,
): boolean {
  if (user.role === "admin") return true;
  if (announcement.authorId === user.id) return true;

  return isUserInTargetAudience(user, announcement, classMap);
}

export function isUserInTargetAudience(
  user: User,
  announcement: Announcement,
  classMap: Map<string, ClassItem>,
): boolean {
  if (announcement.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
    const roles = announcement.targetRoles?.length
      ? announcement.targetRoles
      : ALL_ROLES;
    return roles.includes(user.role);
  }

  const targetClass = classMap.get(announcement.classId);
  if (!targetClass) return false;

  const audience = announcement.targetAudience ?? DEFAULT_TARGET_AUDIENCE;
  const isTeacherOfThisClass = targetClass.teacherId === user.id;
  const isStudentInThisClass = (targetClass.studentIds || []).includes(user.id);

  const audienceCheck: Record<string, boolean> = {
    teacher: isTeacherOfThisClass,
    students: isStudentInThisClass,
    both: isTeacherOfThisClass || isStudentInThisClass,
  };

  return audienceCheck[audience] ?? false;
}