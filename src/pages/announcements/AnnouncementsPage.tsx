import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Select from "#/components/ui/Select.tsx";
import {
  DEFAULT_TARGET_ROLES,
  GLOBAL_ANNOUNCEMENT_CLASS_ID,
} from "#/configs/constants.ts";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useFilter, type FilterConfig } from "#/hooks/useFilter.ts";
import { useToast } from "#/hooks/useToast.ts";
import AnnouncementForm from "#/pages/announcements/AnnouncementForm.tsx";
import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { formatDateTime, formatRelativeTime } from "#/utils/formatDate.ts";
import { logger } from "#/utils/logger.ts";
import { getRoleLabel } from "#/utils/user.ts";
import { isAnnouncementVisibleTo } from "#/utils/announcementVisibility.ts";
import { useCallback, useMemo, useState } from "react";
import { SeenIcon } from "#/components/common/icons";

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

export default function AnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const { data, loading, error, refresh } = useAsyncData<AnnouncementsPageData>(
    {
      fetcher: fetchAnnouncementsPageData,
      deps: [],
      fallbackError: "خطا در بارگذاری اطلاعیه‌ها.",
    },
  );

  const announcements = data?.announcements ?? [];
  const classes = data?.classes ?? [];
  const users = data?.users ?? [];

  const formModal = useModalState<Announcement>();
  const viewModal = useModalState<Announcement>();
  const deleteModal = useModalState<Announcement>();
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
}

  const [filters, setFilters] = useState<AnnouncementFilters>({
    authorId: "",
    classId: "",
    targetRole: "",
    readStatus: "all",
  });

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
        matches: (announcement: Announcement, value) => (value ? announcement.authorId === value : true),
      },
      {
        filterKey: "classId",
        matches: (announcement: Announcement, value) => {
          if (!value || value === "") return true;
          if (value === "global") return announcement.classId === "0";
          return announcement.classId === value;
        },
      },
      {
        filterKey: "targetRole",
        matches: (announcement: Announcement, value) => {
          if (!value || value === "") return true;
          if (announcement.classId === "0") {
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
          const isSeen = announcement.seenBy.includes(currentUser.id);
          if (value === "read") return isSeen;
          if (value === "unread") return !isSeen;
          return true;
        },
      },
    ],
    [currentUser]
  );

  const extraPredicate = useCallback(
    (announcement: Announcement) => isAnnouncementVisibleTo(currentUser!, announcement, classMap),
    [currentUser, classMap]
  );

  const filteredAnnouncements = useFilter({
    data: announcements,
    filters,
    filterConfigs,
    extraPredicate: currentUser ? extraPredicate : () => false,
  });

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

  const getTargetDescription = (item: Announcement) => {
    if (item.classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
      const roles = item.targetRoles ?? DEFAULT_TARGET_ROLES;
      return roles.map((r) => getRoleLabel(r)).join("، ");
    }
    const audience = item.targetAudience ?? "students";
    if (audience === "teacher") return "استاد کلاس";
    if (audience === "students") return "دانشجویان کلاس";
    return "دانشجویان و استاد کلاس";
  };

  const handleCloseView = useCallback(() => {
    viewModal.close();
  }, [viewModal.close]);

  const handleMarkAsSeen = async () => {
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
  };

  const handleDelete = async () => {
    const target = deleteModal.target;
    if (!target) return;
    setIsDeleting(true);
    try {
      await announcementService.delete(target.id);
      deleteModal.close();
      addToast("اطلاعیه با موفقیت حذف شد.", "success");
      refresh();
    } catch (err) {
      logger.error("Failed to delete announcement", {
        error: getErrorMessage(err, "حذف اطلاعیه ناموفق بود."),
      });
      addToast(getErrorMessage(err, "حذف اطلاعیه ناموفق بود."), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          اطلاعیه‌ها
        </h1>
        {canCreate && (
          <Button onClick={() => formModal.open("create")}>
            ایجاد اطلاعیه جدید
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="نویسنده"
            value={filters.authorId}
            onChange={(e) =>
              setFilters({ ...filters, authorId: e.target.value })
            }
            options={[
              { value: "", label: "همه نویسندگان" },
              ...users
                .filter((u) => u.role === "admin" || u.role === "teacher")
                .map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <Select
            label="کلاس"
            value={filters.classId}
            onChange={(e) =>
              setFilters({ ...filters, classId: e.target.value })
            }
            options={[
              { value: "", label: "همه کلاس‌ها" },
              { value: "global", label: "عمومی (همه)" },
              ...classes.map((c) => ({ value: c.id, label: c.title })),
            ]}
          />
          <Select
            label="نقش مخاطب"
            value={filters.targetRole}
            onChange={(e) =>
              setFilters({
                ...filters,
                targetRole: e.target.value as "" | UserRole,
              })
            }
            options={[
              { value: "", label: "همه نقش‌ها" },
              { value: "admin", label: "مدیر" },
              { value: "teacher", label: "استاد" },
              { value: "student", label: "دانشجو" },
            ]}
          />
          <Select
            label="وضعیت خواندن"
            value={filters.readStatus}
            onChange={(e) =>
              setFilters({
                ...filters,
                readStatus: e.target.value as "read" | "unread" | "all",
              })
            }
            options={[
              { value: "all", label: "همه" },
              { value: "read", label: "خوانده شده" },
              { value: "unread", label: "خوانده نشده" },
            ]}
          />
        </div>
        {filters.authorId ||
        filters.classId ||
        filters.targetRole ||
        filters.readStatus !== "all" ? (
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() =>
              setFilters({
                authorId: "",
                classId: "",
                targetRole: "",
                readStatus: "all",
              })
            }
          >
            پاک کردن فیلترها
          </Button>
        ) : null}
      </Card>

      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="اطلاعیه‌ای وجود ندارد"
          description="هنوز هیچ اطلاعیه‌ای ثبت نشده است."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((item) => {
            const isSeen = currentUser
              ? announcementService.isSeenBy(item, currentUser.id)
              : true;

            return (
              <Card key={item.id}>
                <div className="flex h-full flex-col">
                  {!isSeen && (
                    <div
                      aria-hidden="true"
                      className="-mt-5 -mr-5 mb-3 h-1 w-10 rounded-br-full rounded-bl-full bg-blue-500"
                    ></div>
                  )}

                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3
                      className={`text-lg font-semibold w-56 truncate ${isSeen ? "text-gray-600" : "text-blue-700"}`}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {isSeen ? (
                        <Badge variant="green">
                          <SeenIcon className="h-3 w-3" />
                          خوانده شده
                        </Badge>
                      ) : (
                        <Badge variant="blue">
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600"
                            aria-hidden="true"
                          ></span>
                          جدید
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="mb-1 text-xs text-gray-500">
                    مخاطب: {getClassName(item.classId)}
                  </p>
                  <p className="mb-1 text-xs text-gray-500">
                    دسترسی: {getTargetDescription(item)}
                  </p>
                  <p
                    className="mb-3 text-xs text-gray-500"
                    title={formatDateTime(item.createdAt)}
                  >
                    نویسنده: {getAuthorName(item.authorId)} | تاریخ:{" "}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                  <p className="mb-4 line-clamp-3 grow text-sm text-gray-700">
                    {item.content}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => viewModal.openWithTarget("view", item)}
                    >
                      مشاهده
                    </Button>
                    {canManageItem(item) && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => formModal.openWithTarget("edit", item)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() =>
                            deleteModal.openWithTarget("delete", item)
                          }
                        >
                          حذف
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(formModal.isOpen("create") || formModal.isOpen("edit")) && (
        <AnnouncementForm
          key={`announcement-form-${formModal.target?.id ?? "new"}`}
          isOpen
          initialData={formModal.target}
          classes={formClasses}
          authorId={currentUser?.id ?? ""}
          userRole={currentUser?.role ?? "student"}
          onClose={formModal.close}
          onSuccess={() => {
            formModal.close();
            refresh();
          }}
        />
      )}

      <Modal
        isOpen={viewModal.isOpen("view")}
        title={viewModal.target?.title ?? ""}
        onClose={handleCloseView}
      >
        {viewModal.target && (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm text-gray-700">
            <p>
              <span className="font-semibold">مخاطب:</span>{" "}
              {getClassName(viewModal.target.classId)}
            </p>
            <p>
              <span className="font-semibold">دسترسی:</span>{" "}
              {getTargetDescription(viewModal.target)}
            </p>
            <p>
              <span className="font-semibold">نویسنده:</span>{" "}
              {getAuthorName(viewModal.target.authorId)}
            </p>
            <p title={formatDateTime(viewModal.target.createdAt)}>
              <span className="font-semibold">تاریخ:</span>{" "}
              {formatRelativeTime(viewModal.target.createdAt)}
            </p>
            <hr className="my-2" />
            <p className="leading-relaxed whitespace-pre-wrap">
              {viewModal.target.content}
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
              <Button
                variant="secondary"
                onClick={handleCloseView}
                disabled={isMarkingSeen}
              >
                بستن
              </Button>
              {currentUser &&
                !announcementService.isSeenBy(
                  viewModal.target,
                  currentUser.id,
                ) && (
                  <Button onClick={handleMarkAsSeen} isLoading={isMarkingSeen}>
                    خوانده شد
                  </Button>
                )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen("delete")}
        title="حذف اطلاعیه"
        message={`آیا از حذف اطلاعیه "${deleteModal.target?.title ?? ""}" مطمئن هستید؟`}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
