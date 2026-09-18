import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem, ClassStatus } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClassForm from "./ClassForm";

export default function ClassesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "">("");
  const [teacherFilter, setTeacherFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] =
    useState<ClassItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const canManageClass = (c: ClassItem) => {
    if (isAdmin) return true;
    if (currentUser?.role === "teacher") return c.teacherId === currentUser.id;
    return false;
  };

  const fetchData = async () => {
    try {
      const [classesData, usersData] = await Promise.all([
        classService.getAll(),
        userService.getAll(),
      ]);
      setClasses(classesData);
      setUsers(usersData);
    } catch {
      setError("دریافت اطلاعات با خطا مواجه شد.");
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
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter ? c.status === statusFilter : true;
      const matchesTeacher = teacherFilter
        ? c.teacherId === teacherFilter
        : true;
      return matchesSearch && matchesStatus && matchesTeacher;
    });
  }, [classes, search, statusFilter, teacherFilter, isAdmin, currentUser]);

  const confirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    try {
      if (statusChangeTarget.status === "active") {
        await classService.deactivate(statusChangeTarget.id);
        addToast(`کلاس "${statusChangeTarget.title}" غیرفعال شد.`, "success");
      } else {
        await classService.activate(statusChangeTarget.id);
        addToast(`کلاس "${statusChangeTarget.title}" فعال شد.`, "success");
      }
      setStatusChangeTarget(null);
      await fetchData();
    } catch {
      addToast("تغییر وضعیت کلاس ناموفق بود.", "error");
      setStatusChangeTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await classService.delete(deleteTarget.id);
      addToast(`کلاس "${deleteTarget.title}" با موفقیت حذف شد.`, "success");
      setDeleteTarget(null);
      await fetchData();
    } catch {
      addToast("حذف کلاس ناموفق بود.", "error");
      setDeleteTarget(null);
    }
  };

  const getTeacherName = (teacherId: ID | null | undefined) => {
    if (teacherId === null || teacherId === undefined) return "—";
    return users.find((u) => u.id === teacherId)?.name ?? "—";
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

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4 md:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          label="جستجو"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="عنوان کلاس"
        />
        <Select
          label="وضعیت"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClassStatus | "")}
          options={[
            { label: "همه وضعیت‌ها", value: "" },
            { label: "فعال", value: "active" },
            { label: "غیرفعال", value: "inactive" },
          ]}
        />
        {isAdmin && (
          <Select
            label="استاد"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            options={[
              { label: "همه اساتید", value: "" },
              ...teachers.map((t) => ({ label: t.name, value: t.id })),
            ]}
          />
        )}
        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setTeacherFilter("");
            }}
          >
            پاک‌کردن فیلترها
          </Button>
        </div>
      </div>

      <Card title="لیست کلاس‌ها">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
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
          <Table
            getRowKey={(c) => c.id}
            columns={[
              {
                key: "title",
                title: "عنوان",
                render: (c) => (
                  <button
                    onClick={() => navigate(`/classes/${c.id}`)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {c.title || "(بدون عنوان)"}
                  </button>
                ),
              },
              {
                key: "teacherId",
                title: "استاد",
                render: (c) => getTeacherName(c.teacherId),
              },
              {
                key: "capacity",
                title: "ظرفیت",
                render: (c) => (
                  <span>
                    {(c.studentIds || []).length}/{c.capacity || 0}
                  </span>
                ),
              },
              {
                key: "status",
                title: "وضعیت",
                render: (c) => <StatusChip status={c.status || "inactive"} />,
              },
              {
                key: "actions",
                title: "عملیات",
                render: (c) => (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/classes/${c.id}`)}
                    >
                      جزئیات
                    </Button>
                    {canManageClass(c) && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditing(c);
                            setShowForm(true);
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setStatusChangeTarget(c)}
                        >
                          {c.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeleteTarget(c)}
                        >
                          حذف
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            data={filteredClasses}
            renderMobileCard={(c) => (
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/classes/${c.id}`)}
                    className="text-base font-bold text-blue-600 hover:underline"
                  >
                    {c.title || "(بدون عنوان)"}
                  </button>
                  <StatusChip status={c.status || "inactive"} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span>
                    <span className="text-gray-500">استاد:</span>{" "}
                    {getTeacherName(c.teacherId)}
                  </span>
                  <span>
                    <span className="text-gray-500">ظرفیت:</span>{" "}
                    {(c.studentIds || []).length}/{c.capacity || 0}
                  </span>
                </div>
              </div>
            )}
            renderMobileActions={(c) => (
              <>
                <button
                  onClick={() => navigate(`/classes/${c.id}`)}
                  className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                >
                  جزئیات
                </button>
                {canManageClass(c) && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(c);
                        setShowForm(true);
                      }}
                      className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => setStatusChangeTarget(c)}
                      className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {c.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="w-full rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </>
                )}
              </>
            )}
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