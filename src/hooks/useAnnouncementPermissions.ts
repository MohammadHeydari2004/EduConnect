import { isAdmin, isTeacher, isUserInTargetAudience } from "#/utils";
import type { Announcement, ClassItem, ID, User } from "#/types";
import { useCallback } from "react";

export function useAnnouncementPermissions(
  currentUser: User | null | undefined,
  classMap: Map<ID, ClassItem>,
) {
  const canManageItem = useCallback(
    (item: Announcement) => {
      if (!currentUser) return false;
      if (isAdmin(currentUser)) return true;
      if (isTeacher(currentUser))
        return item.authorId === currentUser.id;
      return false;
    },
    [currentUser],
  );

  const canViewItem = useCallback(
    (item: Announcement) => {
      if (!currentUser) return false;
      return isUserInTargetAudience(currentUser, item, classMap);
    },
    [currentUser, classMap],
  );

  const canCreate = isAdmin(currentUser) || isTeacher(currentUser);

  return {
    isAdmin: isAdmin(currentUser),
    isTeacher: isTeacher(currentUser),
    canManageItem,
    canViewItem,
    canCreate,
  };
}
