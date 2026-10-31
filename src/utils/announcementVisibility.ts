import { DEFAULT_TARGET_ROLES, GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { User } from "#/types/user.ts";

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
      : DEFAULT_TARGET_ROLES;
    return roles.includes(user.role);
  }

  const targetClass = classMap.get(announcement.classId);
  if (!targetClass) return false;

  const audience = announcement.targetAudience ?? "students";
  const isTeacherOfThisClass = targetClass.teacherId === user.id;
  const isStudentInThisClass = (targetClass.studentIds || []).includes(user.id);

  const audienceCheck: Record<string, boolean> = {
    teacher: isTeacherOfThisClass,
    students: isStudentInThisClass,
    both: isTeacherOfThisClass || isStudentInThisClass,
  };

  return audienceCheck[audience] ?? false;
}
