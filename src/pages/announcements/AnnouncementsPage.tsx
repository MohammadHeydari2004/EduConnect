import { useEffect, useMemo, useState } from "react";
import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import Modal from "#/components/ui/Modal.tsx";
import { useAuth } from "#/context/AuthContext.ts";
import { announcementService } from "#/services/modules/announcementService.ts";
import { classService } from "#/services/modules/classService.ts";
import { userService } from "#/services/modules/userService.ts";
import { formatDate } from "#/utils/formatDate.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import type { ID } from "#/types/common.ts";
import AnnouncementForm from "./AnnouncementForm";

export default function AnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [viewingItem, setViewingItem] = useState<Announcement | null>(null);

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const canCreate = isAdmin || isTeacher;

  const canManageItem = (item: Announcement) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "teacher") return item.authorId === currentUser.id;
    return false;
  };

  const fetchData = async () => {
    try {
      const [a, c, u] = await Promise.all([
        announcementService.getAll(),
        classService.getAll(),
        userService.getAll(),
      ]);
      setAnnouncements(
        a.sort(
          (x, y) =>
            new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
        ),
      );
      setClasses(c);
      setUsers(u);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      if (!ignore) await fetchData();
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const formClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher && currentUser)
      return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, isAdmin, isTeacher, currentUser]);

  const filteredAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements.filter((a) => {
      if (currentUser.role === "admin") return true;
      if (a.classId === "0") {
        const roles = a.targetRoles ?? ["admin", "teacher", "student"];
        return roles.includes(currentUser.role);
      }

      const targetClass = classes.find((c) => c.id === a.classId);
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

      if (a.authorId === currentUser.id) return true;

      return false;
    });
  }, [announcements, classes, currentUser]);
  const getAuthorName = (authorId: ID) =>
    users.find((u) => u.id === authorId)?.name ?? "نامشخص";
  const getClassName = (classId: ID) =>
    classId === "0"
      ? "همه (عمومی)"
      : (classes.find((c) => c.id === classId)?.title ?? "نامشخص");

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
    if (currentUser && !announcementService.isSeenBy(item, currentUser.id)) {
      await announcementService.markAsSeen(item.id, currentUser.id);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, seenBy: [...(a.seenBy ?? []), currentUser.id] }
            : a,
        ),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await announcementService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error(err);
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
            return (
              <Card key={item.id}>
                <div className="flex h-full flex-col">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3
                      className={`text-lg font-semibold ${isSeen ? "text-gray-600" : "text-blue-700"}`}
                    >
                      {item.title}
                      {isSeen ? (
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"
                          title="خوانده شده"
                        ></span>
                      ) : (
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500"
                          title="خوانده نشده"
                        ></span>
                      )}
                    </h3>
                  </div>
                  <p className="mb-1 text-xs text-gray-500">
                    مخاطب: {getClassName(item.classId)}
                  </p>
                  <p className="mb-1 text-xs text-gray-500">
                    دسترسی: {getTargetDescription(item)}
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    نویسنده: {getAuthorName(item.authorId)} | تاریخ:{" "}
                    {formatDate(item.createdAt)}
                  </p>
                  <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-700">
                    {item.content}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleView(item)}
                    >
                      مشاهده
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
            <p className="whitespace-pre-wrap leading-relaxed">
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
