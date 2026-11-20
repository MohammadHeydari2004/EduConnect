import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { createExactMatchFilter } from "#/hooks/useFilter.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type {
  Announcement,
  AnnouncementPayload,
  ClassItem,
  FilterConfig,
  ID,
  User,
  UserRole,
} from "#/types";
import {
  getUserNameFromMap,
  isAnnouncementVisibleTo,
} from "#/utils";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID, TOAST_MESSAGES } from "#/configs/constants";
import { useAnnouncementPermissions } from "#/hooks/useAnnouncementPermissions";
import { showErrorToast } from "#/hooks/useToastHelpers.ts";
import { useCallback, useMemo, useState } from "react";

interface AnnouncementsPageData {
  classes: ClassItem[];
  users: User[];
}

interface AnnouncementFilters {
  authorId: string;
  classId: string;
  targetRole: "" | UserRole;
  readStatus: "read" | "unread" | "all";
}

const initialFilters: AnnouncementFilters = {
  authorId: "",
  classId: "",
  targetRole: "",
  readStatus: "all",
};

function fetchAnnouncementsPageData(signal?: AbortSignal): Promise<AnnouncementsPageData> {
  return Promise.all([
    classService.getAll(undefined, signal),
    userService.getAll(undefined, signal),
  ]).then(([classes, users]) => ({
    classes,
    users,
  }));
}

export function useAnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

const { data, loading: pageLoading, error: pageError } = useAsyncData<AnnouncementsPageData>({
    fetcher: (signal) => fetchAnnouncementsPageData(signal),
    deps: [],
    fallbackError: TOAST_MESSAGES.ANNOUNCEMENT_FETCH_ERROR,
  });

  const classes = data?.classes ?? [];
  const users = data?.users ?? [];

  const viewModal = useModalState<Announcement>();
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const permissions = useAnnouncementPermissions(currentUser, classMap);

  const formClasses = useMemo(() => {
    if (permissions.isAdmin) return classes;
    if (permissions.isTeacher && currentUser)
      return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, permissions.isAdmin, permissions.isTeacher, currentUser]);

  const getAuthorName = useCallback(
    (userId: ID) => getUserNameFromMap(userMap, userId),
    [userMap],
  );
  const getClassName = useCallback(
    (classId: ID) =>
      classId === GLOBAL_ANNOUNCEMENT_CLASS_ID
        ? "عمومی (همه)"
        : (classMap.get(classId)?.title ?? "نامشخص"),
    [classMap],
  );

  const filterConfigs = useMemo<FilterConfig<Announcement>[]>(
    () => [
      createExactMatchFilter<Announcement>("authorId", (a) => a.authorId),
      {
        filterKey: "classId",
        matches: (announcement: Announcement, value) => {
          if (!value || value === "") return true;
          if (value === "global") return announcement.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID;
          return announcement.classId === value;
        },
      },
      {
        filterKey: "targetRole",
        matches: (announcement: Announcement, value) => {
          if (!value || value === "") return true;
          if (announcement.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
            const roles = announcement.targetRoles ?? [];
            return roles.includes(value as UserRole);
          } else {
            const audience = announcement.targetAudience ?? "students";
            if (value === "admin") return false;
            if (value === "teacher") return audience === "teacher" || audience === "both";
            if (value === "student") return audience === "students" || audience === "both";
            return true;
          }
        },
      },
      {
        filterKey: "readStatus",
        matches: (announcement: Announcement, value) => {
          if (!value || value === "all" || !currentUser) return true;
          const isSeen = (announcement.seenBy ?? []).includes(currentUser.id);
          if (value === "read") return isSeen;
          if (value === "unread") return !isSeen;
          return true;
        },
      },
    ],
    [currentUser],
  );

  const extraPredicate = useCallback(
    (announcement: Announcement) => {
      if (!currentUser) return false;
      return isAnnouncementVisibleTo(currentUser, announcement, classMap);
    },
    [currentUser, classMap],
  );

const crud = useCrudPage<Announcement, AnnouncementPayload, AnnouncementPayload, AnnouncementFilters>({
    service: {
      getAll: announcementService.getAll,
      getById: announcementService.getById,
      create: announcementService.create,
      update: announcementService.update,
      delete: announcementService.delete,
    },
    initialFilters,
    filterConfigs,
    extraPredicate: currentUser ? extraPredicate : () => false,
    fallbackError: TOAST_MESSAGES.ANNOUNCEMENT_FETCH_ERROR,
  });

  const handleCloseView = useCallback(() => {
    viewModal.close();
  }, [viewModal.close]);

  const handleMarkAsSeen = useCallback(async () => {
    const viewingItem = viewModal.target;
    if (!viewingItem || !currentUser || isMarkingSeen) return;

    if (announcementService.isSeenBy(viewingItem, currentUser.id)) {
      viewModal.close();
      return;
    }

    setIsMarkingSeen(true);
    try {
      await announcementService.markAsSeen(viewingItem.id, currentUser.id);
      viewModal.close();
      addToast(TOAST_MESSAGES.ANNOUNCEMENT_SEEN_SUCCESS, "success");
      crud.state.refresh();
    } catch (err) {
      showErrorToast(
        addToast,
        err instanceof Error ? err.message : TOAST_MESSAGES.ANNOUNCEMENT_SEEN_ERROR,
      );
    } finally {
      setIsMarkingSeen(false);
    }
  }, [viewModal.target, viewModal.close, currentUser, isMarkingSeen, addToast, crud.state.refresh]);

  const canMarkAsSeen = useCallback(
    (announcement: Announcement) =>
      Boolean(currentUser && !announcementService.isSeenBy(announcement, currentUser.id)),
    [currentUser],
  );

  return {
    currentUser,
    canCreate: permissions.canCreate,
    loading: pageLoading || crud.state.loading,
    error: pageError || crud.state.error,
    classes,
    users,
    formClasses,
    filteredAnnouncements: crud.state.filteredData,
    filters: crud.state.filters,
    setFilters: crud.state.setFilters,
    resetFilters: crud.state.resetFilters,
    getAuthorName,
    getClassName,
    formModal: crud.actions.modal,
    viewModal,
    isMarkingSeen,
    isDeleting: crud.actions.isDeleting,
    handleCloseView,
    handleMarkAsSeen,
    handleDelete: crud.actions.handleDelete,
    canManageItem: permissions.canManageItem,
    canViewItem: permissions.canViewItem,
    canMarkAsSeen,
    refresh: crud.state.refresh,
  };
}
