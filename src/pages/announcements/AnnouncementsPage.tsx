import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Select from "#/components/ui/Select.tsx";
import AnnouncementForm from "#/pages/announcements/AnnouncementForm.tsx";
import { AnnouncementCard } from "#/components/ui/AnnouncementCard.tsx";
import { AnnouncementViewModal } from "#/components/ui/AnnouncementViewModal.tsx";
import { announcementService } from "#/services/announcement.ts";
import { useAnnouncementsPage } from "#/pages/announcements/useAnnouncementsPage.ts";

export default function AnnouncementsPage() {
  const {
    currentUser,
    canCreate,
    loading,
    error,
    classes,
    users,
    formClasses,
    filteredAnnouncements,
    filters,
    setFilters,
    resetFilters,
    getAuthorName,
    getClassName,
    getTargetDescription,
    formModal,
    crudModal,
    viewModal,
    isMarkingSeen,
    isDeleting,
    handleCloseView,
    handleMarkAsSeen,
    handleDelete,
    canManageItem,
    canViewItem,
    formatDateTime,
    formatRelativeTime,
    refresh,
  } = useAnnouncementsPage();

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!currentUser) return <EmptyState title="دسترسی محدود" description="شما دسترسی به این بخش ندارید." />;

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
                targetRole: e.target.value as "" | "admin" | "teacher" | "student",
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
            onClick={resetFilters}
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
            const canView = canViewItem(item);

            return (
              <AnnouncementCard
                key={item.id}
                item={item}
                isSeen={isSeen}
                getClassName={getClassName}
                getTargetDescription={getTargetDescription}
                getAuthorName={getAuthorName}
                formatDateTime={formatDateTime}
                formatRelativeTime={formatRelativeTime}
                onView={() => viewModal.openWithTarget("view", item)}
                onEdit={canManageItem(item) ? () => formModal.openWithTarget("edit", item) : undefined}
                onDelete={canManageItem(item) ? () => crudModal.openWithTarget("delete", item) : undefined}
                canManage={canManageItem(item)}
                canView={canView}
              />
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

      <AnnouncementViewModal
        isOpen={viewModal.isOpen("view")}
        announcement={viewModal.target}
        getClassName={getClassName}
        getTargetDescription={getTargetDescription}
        getAuthorName={getAuthorName}
        formatDateTime={formatDateTime}
        formatRelativeTime={formatRelativeTime}
        onClose={handleCloseView}
        onMarkAsSeen={handleMarkAsSeen}
        isMarkingSeen={isMarkingSeen}
        canMarkAsSeen={!!currentUser && !!viewModal.target && !announcementService.isSeenBy(viewModal.target, currentUser.id)}
      />

      <ConfirmDialog
        isOpen={crudModal.isOpen("delete")}
        title="حذف اطلاعیه"
        message={`آیا از حذف اطلاعیه "${crudModal.target?.title ?? ""}" مطمئن هستید؟`}
        onClose={crudModal.close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}