import { useMapById } from "#/hooks/useMapById.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import type { UserRole } from "#/types/common.ts";
import { isAnnouncementVisibleTo } from "#/utils/announcementVisibility.ts";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants";
import { useMemo } from "react";

interface AnnouncementFilters {
  authorId?: string;
  classId?: string;
  targetRole?: "" | UserRole;
  readStatus?: "read" | "unread" | "all";
}

interface UseFilteredAnnouncementsProps {
  announcements: Announcement[];
  classes: ClassItem[];
  currentUser: User | null;
  filters: AnnouncementFilters;
}

export function useFilteredAnnouncements({
  announcements,
  classes,
  currentUser,
  filters,
}: UseFilteredAnnouncementsProps) {
  const classMap = useMapById(classes);

  const filteredAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements
      .filter((a) => isAnnouncementVisibleTo(currentUser, a, classMap))
      .filter((a) => {
        if (filters.authorId && a.authorId !== filters.authorId) return false;
        if (filters.classId) {
          if (filters.classId === "global" && a.classId !== GLOBAL_ANNOUNCEMENT_CLASS_ID) return false;
          if (filters.classId !== "global" && a.classId !== filters.classId) return false;
        }
        if (filters.targetRole) {
          if (a.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
            const roles = a.targetRoles ?? [];
            if (!roles.includes(filters.targetRole)) return false;
          } else {
            const audience = a.targetAudience ?? "students";
            if (filters.targetRole === "teacher" && audience === "students") return false;
            if (filters.targetRole === "student" && audience === "teacher") return false;
          }
        }
        if (filters.readStatus && currentUser) {
          const isSeen = a.seenBy.includes(currentUser.id);
          if (filters.readStatus === "read" && !isSeen) return false;
          if (filters.readStatus === "unread" && isSeen) return false;
        }
        return true;
      });
  }, [announcements, classMap, currentUser, filters]);

  return filteredAnnouncements;
}
