import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { type FilterConfig } from "#/hooks/useFilter.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { isAnnouncementVisibleTo } from "#/utils/announcementVisibility.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { formatDateTime, formatRelativeTime } from "#/utils/formatDate.ts";
import { logger } from "#/utils/logger.ts";
import { getRoleLabel } from "#/utils/user.ts";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants";
import { useCallback, useMemo, useState } from "react";

interface AnnouncementsPageData {
  announcements: Announcement[];
  classes: ClassItem[];
  users: User[];
}

function fetchAnnouncementsPageData(): Promise<AnnouncementsPageData> {
  return Promise.all([
    announcementService.getAll(),
    classService.getAll(),
    userService.getAll(),
  ]).then(([announcements, classes, users]) => ({
    announcements: [...announcements].sort(
      (x, y) =>
        new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
    ),
    classes,
    users,
  }));
}

type AnnouncementPayload = Omit<Announcement, "id" | "createdAt" | "seenBy">;

export function useAnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const { data, loading, error, refresh } = useAsyncData<AnnouncementsPageData>({
    fetcher: fetchAnnouncementsPageData,
    deps: [],
    fallbackError: "خطا در بارگذاری اطلاعیه‌ها.",
  });

  const announcements = data?.announcements ?? [];
  const classes = data?.classes ?? [];
  const users = data?.users ?? [];

  const viewModal = useModalState<Announcement>();
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const canCreate = isAdmin || isTeacher;

  const canManageItem = useCallback(
    (item: Announcement) => {
      if (!currentUser) return false;
      if (currentUser.role === "admin") return true;
      if (currentUser.role === "teacher")
        return item.authorId === currentUser.id;
      return false;
    },
    [currentUser],
  );

  interface AnnouncementFilters {
    authorId: string;
    classId: string;
    targetRole: "" | UserRole;
    readStatus: "read" | "unread" | "all";
    [key: string]: string | UserRole | "" | "read" | "unread" | "all";
  }

  const initialFilters: AnnouncementFilters = {
    authorId: "",
    classId: "",
    targetRole: "",
    readStatus: "all",
  };

  const formClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher && currentUser)
      return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, isAdmin, isTeacher, currentUser]);

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const filterConfigs = useMemo<FilterConfig<Announcement>[]>(
    () => [
      {
        filterKey: "authorId",
        matches: (announcement: Announcement, value) =>
          value ? announcement.authorId === value : true,
      },
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
            if (value === "teacher" && audience === "students") return false;
            if (value === "student" && audience === "teacher") return false;
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
    (announcement: Announcement) =>
      isAnnouncementVisibleTo(currentUser!, announcement, classMap),
    [currentUser, classMap],
  );

  const crud = useCrudPage<Announcement, AnnouncementPayload, AnnouncementPayload, AnnouncementFilters>({
    service: {
      getAll: () => announcementService.getAll(),
      getById: (id: ID) => announcementService.getById(id),
      create: (data: AnnouncementPayload) => announcementService.create(data),
      update: (id: ID, data: AnnouncementPayload) =>
        announcementService.update(id, data).then((updated) =>
          announcementService.resetSeenBy(updated.id),
        ),
      delete: (id: ID) => announcementService.delete(id),
    },
    initialFilters,
    filterConfigs,
    extraPredicate: currentUser ? extraPredicate : () => false,
    fallbackError: "خطا در بارگذاری اطلاعیه‌ها.",
    canManage: canManageItem,
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
      addToast("اطلاعیه به‌عنوان خوانده‌شده ثبت شد.", "success");
      refresh();
    } catch (err) {
      logger.error("Failed to mark announcement as seen", {
        error: getErrorMessage(err, "ثبت خواندن اطلاعیه ناموفق بود."),
      });
      addToast(getErrorMessage(err, "ثبت خواندن اطلاعیه ناموفق بود."), "error");
    } finally {
      setIsMarkingSeen(false);
    }
  }, [viewModal, currentUser, isMarkingSeen, addToast, refresh]);

  const getAuthorName = useCallback(
    (authorId: ID) => userMap.get(authorId)?.name ?? "نامشخص",
    [userMap],
  );

  const getClassName = useCallback(
    (classId: ID) =>
      classId === GLOBAL_ANNOUNCEMENT_CLASS_ID
        ? "همه (عمومی)"
        : (classMap.get(classId)?.title ?? "نامشخص"),
    [classMap],
  );

  const getTargetDescription = useCallback(
    (item: Announcement) => {
      if (item.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
        const roles = item.targetRoles ?? ["admin", "teacher", "student"];
        return roles.map((r) => getRoleLabel(r)).join("، ");
      }
      const audience = item.targetAudience ?? "students";
      if (audience === "teacher") return "استاد کلاس";
      if (audience === "students") return "دانشجویان کلاس";
      return "دانشجویان و استاد کلاس";
    },
    [],
  );

  return {
    currentUser,
    isAdmin,
    isTeacher,
    canCreate,
    loading,
    error,
    announcements,
    classes,
    users,
    formClasses,
    filteredAnnouncements: crud.state.filteredData,
    filters: crud.state.filters,
    setFilters: crud.state.setFilters,
    resetFilters: crud.state.resetFilters,
    getAuthorName,
    getClassName,
    getTargetDescription,
    formModal: crud.actions.createModal,
    viewModal,
    deleteModal: crud.actions.createModal,
    isMarkingSeen,
    isDeleting: crud.actions.isDeleting,
    handleCloseView,
    handleMarkAsSeen,
    handleDelete: crud.actions.handleDelete,
    canManageItem,
    formatDateTime,
    formatRelativeTime,
  };
}