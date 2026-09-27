import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import { useMemo } from "react";

interface UseFilteredAnnouncementsProps {
  announcements: Announcement[];
  classes: ClassItem[];
  currentUser: User | null;
}

export function useFilteredAnnouncements({
  announcements,
  classes,
  currentUser,
}: UseFilteredAnnouncementsProps) {
  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const filteredAnnouncements = useMemo(() => {
    if (!currentUser) return [];

    return announcements.filter((a) => {
      if (currentUser.role === "admin") return true;
      if (a.authorId === currentUser.id) return true;
      if (a.classId === "0") {
        const roles = a.targetRoles ?? ["admin", "teacher", "student"];
        return roles.includes(currentUser.role);
      }
      const targetClass = classMap.get(a.classId);
      if (!targetClass) return false;

      const audience = a.targetAudience ?? "students";
      const isTeacherOfThisClass = targetClass.teacherId === currentUser.id;
      const isStudentInThisClass = (targetClass.studentIds || []).includes(
        currentUser.id,
      );

      if (audience === "teacher") return isTeacherOfThisClass;
      if (audience === "students") return isStudentInThisClass;
      if (audience === "both")
        return isTeacherOfThisClass || isStudentInThisClass;

      return false;
    });
  }, [announcements, classMap, currentUser]);

  return filteredAnnouncements;
}
