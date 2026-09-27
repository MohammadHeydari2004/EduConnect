import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import Modal from "#/components/ui/Modal.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { formatDate, formatDateTime } from "#/utils/formatDate.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { useFilteredAnnouncements } from "./useFilteredAnnouncements";

export default function AnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [viewingItem, setViewingItem] = useState<Announcement | null>(null);
  const [markingSeenId, setMarkingSeenId] = useState<ID | null>(null);

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

  const fetchData = useCallback(async () => {
    try {
      const [a, c, u] = await Promise.all([
        announcementService.getAll(),
        classService.getAll(),
        userService.getAll(),
      ]);
      setAnnouncements(
        [...a].sort(
          (x, y) =>
            new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
        ),
      );
      setClasses(c);
      setUsers(u);
    } catch (err) {
      console.error(err);
      addToast("خطا در بارگذاری اطلاعیه‌ها.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      if (!ignore) await fetchData();
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const formClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher && currentUser)
      return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, isAdmin, isTeacher, currentUser]);

  const filteredAnnouncements = useFilteredAnnouncements({
    announcements,
    classes,
    currentUser,
  });
  const getAuthorName = useCallback(
    (authorId: ID) => users.find((u) => u.id === authorId)?.name ?? "نامشخص",
    [users],
  );

  const getClassName = useCallback(
    (classId: ID) =>
      classId === "0"
        ? "همه (عمومی)"
        : (classes.find((c) => c.id === classId)?.title ?? "نامشخص"),
    [classes],
  );

  const getTargetDescription = (item: Announcement) => {
    if (item.classId === "0") {
      const roles = item.targetRoles ?? ["admin", "teacher", "student"];
      return roles
        .map((r) =>
          r === "admin" ? "مدیر" : r === "teacher" ? "استاد" : "دانشجو",
        )
        .join("، ");
    }
    const audience = item.targetAudience ?? "students";
    if (audience === "teacher") return "استاد کلاس";
    if (audience === "students") return "دانشجویان کلاس";
    return "دانشجویان و استاد کلاس";
  };

  const handleView = async (item: Announcement) => {
    setViewingItem(item);

    if (!currentUser || announcementService.isSeenBy(item, currentUser.id)) {
      return;
    }

    setMarkingSeenId(item.id);
    try {
      await announcementService.markAsSeen(item.id, currentUser.id);

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, seenBy: [...(a.seenBy ?? []), currentUser.id] }
            : a,
        ),
      );
    } catch (err) {
      console.error("خطا در علامت‌گذاری به عنوان دیده‌شده:", err);
      addToast("خطا در ثبت وضعیت مشاهده. لطفاً دوباره تلاش کنید.", "warning");
    } finally {
      setMarkingSeenId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await announcementService.delete(deleteTarget.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast("اطلاعیه با موفقیت حذف شد.", "success");
    } catch (err) {
      console.error(err);
      addToast("حذف اطلاعیه ناموفق بود.", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          اطلاعیه‌ها
        </h1>
        {canCreate && (
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            ایجاد اطلاعیه جدید
          </Button>
        )}
      </div>

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
            const isMarking = markingSeenId === item.id;

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
                      className={`text-lg font-semibold ${isSeen ? "text-gray-600" : "text-blue-700"}`}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {isSeen ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                          title="خوانده شده"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          خوانده شده
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                          title="خوانده نشده"
                        >
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600"
                            aria-hidden="true"
                          ></span>
                          جدید
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-1 text-xs text-gray-500">
                    مخاطب: {getClassName(item.classId)}
                  </p>
                  <p className="mb-1 text-xs text-gray-500">
                    دسترسی: {getTargetDescription(item)}
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    نویسنده: {getAuthorName(item.authorId)} | تاریخ:{" "}
                    {formatDateTime(item.createdAt)}
                  </p>
                  <p className="mb-4 line-clamp-3 grow text-sm text-gray-700">
                    {item.content}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleView(item)}
                      disabled={isMarking}
                    >
                      {isMarking ? "در حال ثبت..." : "مشاهده"}
                    </Button>
                    {canManageItem(item) && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingItem(item);
                            setIsFormOpen(true);
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeleteTarget(item)}
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

      <AnnouncementForm
        key={`announcement-form-${editingItem?.id ?? "new"}-${isFormOpen}`}
        isOpen={isFormOpen}
        initialData={editingItem}
        classes={formClasses}
        authorId={currentUser?.id ?? ""}
        userRole={currentUser?.role ?? "student"}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          fetchData();
        }}
      />

      <Modal
        isOpen={!!viewingItem}
        title={viewingItem?.title ?? ""}
        onClose={() => setViewingItem(null)}
      >
        {viewingItem && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">مخاطب:</span>{" "}
              {getClassName(viewingItem.classId)}
            </p>
            <p>
              <span className="font-semibold">دسترسی:</span>{" "}
              {getTargetDescription(viewingItem)}
            </p>
            <p>
              <span className="font-semibold">نویسنده:</span>{" "}
              {getAuthorName(viewingItem.authorId)}
            </p>
            <p>
              <span className="font-semibold">تاریخ:</span>{" "}
              {formatDate(viewingItem.createdAt)}
            </p>
            <hr className="my-2" />
            <p className="leading-relaxed whitespace-pre-wrap">
              {viewingItem.content}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف اطلاعیه"
        message={`آیا از حذف اطلاعیه "${deleteTarget?.title ?? ""}" مطمئن هستید؟`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
