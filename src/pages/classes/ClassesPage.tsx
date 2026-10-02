import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem, ClassStatus } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import ClassFilters, { type ClassFiltersValues } from "./ClassFilters";
import ClassForm from "./ClassForm";
import ClassTable from "./ClassTable";

const initialFilters: ClassFiltersValues = {
  search: "",
  statusFilter: "",
  teacherFilter: "",
};

export default function ClassesPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ClassFiltersValues>(initialFilters);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] =
    useState<ClassItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const canManageClass = useCallback(
    (c: ClassItem) => {
      if (isAdmin) return true;
      if (currentUser?.role === "teacher")
        return c.teacherId === currentUser.id;
      return false;
    },
    [isAdmin, currentUser],
  );

  const fetchData = useCallback(async () => {
    try {
      const [classesData, usersData] = await Promise.all([
        classService.getAll(),
        userService.getAll(),
      ]);
      setClasses(classesData);
      setUsers(usersData);
      setError("");
    } catch (err) {
      const msg = isApiError(err)
        ? err.userMessage
        : "دریافت اطلاعات با خطا مواجه شد.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher"),
    [users],
  );

  const filteredClasses = useMemo(() => {
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

  const confirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    try {
      const newStatus: ClassStatus =
        statusChangeTarget.status === "active" ? "inactive" : "active";

      if (newStatus === "inactive") {
        await classService.deactivate(statusChangeTarget.id);
        addToast(`کلاس "${statusChangeTarget.title}" غیرفعال شد.`, "success");
      } else {
        await classService.activate(statusChangeTarget.id);
        addToast(`کلاس "${statusChangeTarget.title}" فعال شد.`, "success");
      }
      setClasses((prev) =>
        prev.map((c) =>
          c.id === statusChangeTarget.id ? { ...c, status: newStatus } : c,
        ),
      );
      setStatusChangeTarget(null);
    } catch (err) {
      const message = isApiError(err)
        ? err.userMessage
        : "تغییر وضعیت کلاس ناموفق بود.";
      addToast(message, "error");
      setStatusChangeTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await classService.delete(deleteTarget.id);
      addToast(`کلاس "${deleteTarget.title}" با موفقیت حذف شد.`, "success");
      setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const message = isApiError(err)
        ? err.userMessage
        : "حذف کلاس ناموفق بود.";
      addToast(message, "error");
      setDeleteTarget(null);
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
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
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
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        ) : classes.length === 0 ? (
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
            users={users}
            canManageClass={canManageClass}
            onEdit={(c) => {
              setEditing(c);
              setShowForm(true);
            }}
            onToggleStatus={setStatusChangeTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      {showForm && (
        <ClassForm
          key={`class-form-${editing?.id ?? "new"}-${showForm}`}
          users={users}
          initialData={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={(message) => {
            addToast(message, "success");
            setShowForm(false);
            setEditing(null);
            fetchData();
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!statusChangeTarget}
        title={
          statusChangeTarget?.status === "active"
            ? "غیرفعال کردن کلاس"
            : "فعال کردن کلاس"
        }
        message={
          statusChangeTarget?.status === "active"
            ? `آیا از غیرفعال کردن کلاس "${statusChangeTarget?.title ?? ""}" مطمئن هستید؟`
            : `آیا از فعال کردن کلاس "${statusChangeTarget?.title ?? ""}" مطمئن هستید؟`
        }
        onClose={() => setStatusChangeTarget(null)}
        onConfirm={confirmStatusChange}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف کلاس"
        message={`آیا از حذف کامل کلاس "${deleteTarget?.title ?? ""}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
