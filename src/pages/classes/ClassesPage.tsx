import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import ClassFilters, {
  type ClassFiltersValues,
} from "#/pages/classes/ClassFilters";
import ClassForm from "#/pages/classes/ClassForm";
import ClassTable from "#/pages/classes/ClassTable";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem, ClassStatus } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useCallback, useMemo, useState } from "react";

const initialFilters: ClassFiltersValues = {
  search: "",
  statusFilter: "",
  teacherFilter: "",
};

export default function ClassesPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<ClassFiltersValues>(initialFilters);

  const classModal = useModalState<ClassItem>();

  const isAdmin = currentUser?.role === "admin";

  const canManageClass = useCallback(
    () => {
      // Only admins can manage classes (edit, delete, toggle status)
      return isAdmin;
    },
    [isAdmin],
  );

  const { data: classes, loading: classesLoading, error: classesError, refresh } = useAsyncData<ClassItem[]>({
    fetcher: () => classService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کلاس‌ها با خطا مواجه شد.",
  });

  const { data: users, loading: usersLoading, error: usersError } = useAsyncData<User[]>({
    fetcher: () => userService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کاربران با خطا مواجه شد.",
  });

  const teachers = useMemo(
    () => users?.filter((u) => u.role === "teacher") ?? [],
    [users],
  );

  const loading = classesLoading || usersLoading;
  const error = classesError || usersError;

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((c) => {
      if (!isAdmin && currentUser?.role === "teacher") {
        if (c.teacherId !== currentUser.id) return false;
      }
      const matchesSearch = (c.title || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.statusFilter
        ? c.status === filters.statusFilter
        : true;
      const matchesTeacher = filters.teacherFilter
        ? c.teacherId === filters.teacherFilter
        : true;
      return matchesSearch && matchesStatus && matchesTeacher;
    });
  }, [classes, filters, isAdmin, currentUser]);

  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmStatusChange = async () => {
    const target = classModal.target;
    if (!target) return;
    setIsStatusChanging(true);
    try {
      const newStatus: ClassStatus =
        target.status === "active" ? "inactive" : "active";

      if (newStatus === "inactive") {
        await classService.setStatus(target.id, "inactive");
        addToast(`کلاس "${target.title}" غیرفعال شد.`, "success");
      } else {
        await classService.setStatus(target.id, "active");
        addToast(`کلاس "${target.title}" فعال شد.`, "success");
      }
      refresh();
      classModal.close();
    } catch (err) {
      addToast(
        getErrorMessage(err, "تغییر وضعیت کلاس ناموفق بود."),
        "error",
      );
      classModal.close();
    } finally {
      setIsStatusChanging(false);
    }
  };

  const confirmDelete = async () => {
    const target = classModal.target;
    if (!target) return;
    setIsDeleting(true);
    try {
      await classService.delete(target.id);
      addToast(`کلاس "${target.title}" با موفقیت حذف شد.`, "success");
      refresh();
      classModal.close();
    } catch (err) {
      addToast(getErrorMessage(err, "حذف کلاس ناموفق بود."), "error");
      classModal.close();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          مدیریت کلاس‌ها
        </h1>
        {(isAdmin || currentUser?.role === "teacher") && (
          <Button
            onClick={() => classModal.open("create")}
            className="w-full sm:w-auto"
          >
            ایجاد کلاس جدید
          </Button>
        )}
      </div>

      <ClassFilters
        filters={filters}
        teachers={teachers}
        isAdmin={isAdmin}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      <Card title="لیست کلاس‌ها">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : !classes || classes.length === 0 ? (
          <EmptyState
            title="کلاسی ثبت نشده است"
            description="هنوز هیچ کلاسی در سیستم وجود ندارد."
          />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            title="کلاسی پیدا نشد"
            description="هیچ کلاسی با فیلترهای انتخاب‌شده پیدا نشد."
          />
        ) : (
          <ClassTable
            classes={filteredClasses}
            users={users ?? []}
            canManageClass={canManageClass}
            onEdit={(c) => classModal.openWithTarget("edit", c)}
            onToggleStatus={(c) => classModal.openWithTarget("status", c)}
            onDelete={(c) => classModal.openWithTarget("delete", c)}
          />
        )}
      </Card>

      {(classModal.isOpen("create") || classModal.isOpen("edit")) && (
        <ClassForm
          key={`class-form-${classModal.target?.id ?? "new"}`}
          users={users ?? []}
          initialData={classModal.target}
          onClose={classModal.close}
          onSuccess={(message) => {
            addToast(message, "success");
            classModal.close();
            refresh();
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}

      <ConfirmDialog
        isOpen={classModal.isOpen("status")}
        title={
          classModal.target?.status === "active"
            ? "غیرفعال کردن کلاس"
            : "فعال کردن کلاس"
        }
        message={
          classModal.target?.status === "active"
            ? `آیا از غیرفعال کردن کلاس "${classModal.target?.title ?? ""}" مطمئن هستید؟`
            : `آیا از فعال کردن کلاس "${classModal.target?.title ?? ""}" مطمئن هستید؟`
        }
        onClose={classModal.close}
        onConfirm={confirmStatusChange}
        isLoading={isStatusChanging}
      />

      <ConfirmDialog
        isOpen={classModal.isOpen("delete")}
        title="حذف کلاس"
        message={`آیا از حذف کامل کلاس "${classModal.target?.title ?? ""}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        onClose={classModal.close}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
