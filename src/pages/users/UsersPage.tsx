import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { userService } from "#/services/user.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters as UserFiltersType,
} from "#/types/user.ts";
import { useEffect, useMemo, useState } from "react";
import UserDetails from "./UserDetails";
import UserFilters from "./UserFilters";
import UserForm from "./UserForm";
import UserTable from "./UserTable";

const initialFilters: UserFiltersType = {
  searchName: "",
  searchEmail: "",
  role: "",
  status: "",
};

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFiltersType>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadUsers = async () => {
      try {
        setError("");
        const data = await userService.getAll();
        if (!ignore) setUsers(data);
      } catch {
        if (!ignore) setError("دریافت لیست کاربران با خطا مواجه شد.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadUsers();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesName = user.name
        .toLowerCase()
        .includes(filters.searchName.toLowerCase());
      const matchesEmail = user.email
        .toLowerCase()
        .includes(filters.searchEmail.toLowerCase());
      const matchesRole = filters.role ? user.role === filters.role : true;
      const matchesStatus = filters.status
        ? user.status === filters.status
        : true;
      return matchesName && matchesEmail && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleCreate = async (values: CreateUserPayload) => {
    try {
      await userService.create(values);
      addToast("کاربر با موفقیت ایجاد شد.", "success");
      setIsCreateOpen(false);
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "ایجاد کاربر ناموفق بود.",
        "error",
      );
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleUpdate = async (values: UpdateUserPayload) => {
    if (!selectedUser) return;
    if (currentUser?.id === selectedUser.id && values.status === "inactive") {
      addToast("شما نمی‌توانید حساب کاربری خودتان را غیرفعال کنید.", "error");
      return;
    }
    try {
      await userService.update(selectedUser.id, values);
      addToast("اطلاعات کاربر با موفقیت ویرایش شد.", "success");
      setIsEditOpen(false);
      setSelectedUser(null);
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "ویرایش کاربر ناموفق بود.",
        "error",
      );
    }
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser || !currentUser) return;
    if (selectedUser.id === currentUser.id) {
      addToast("شما نمی‌توانید حساب کاربری خودتان را حذف کنید.", "error");
      setIsDeleteConfirmOpen(false);
      return;
    }
    try {
      await userService.delete(selectedUser.id);
      addToast("کاربر با موفقیت حذف شد.", "success");
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "حذف کاربر ناموفق بود.",
        "error",
      );
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!currentUser) return;
    if (user.id === currentUser.id) {
      addToast("شما نمی‌توانید وضعیت حساب خودتان را تغییر دهید.", "error");
      return;
    }
    try {
      await userService.toggleStatus(user.id);
      addToast("وضعیت کاربر با موفقیت تغییر کرد.", "success");
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "تغییر وضعیت کاربر ناموفق بود.",
        "error",
      );
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          مدیریت کاربران
        </h1>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          ایجاد کاربر
        </Button>
      </div>
      <UserFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />
      <Card title="لیست کاربران">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <EmptyState
            title="کاربری ثبت نشده است"
            description="هنوز هیچ کاربری در سیستم وجود ندارد."
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="کاربری پیدا نشد"
            description="هیچ کاربری با فیلترهای انتخاب‌شده پیدا نشد."
          />
        ) : (
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <UserTable
              users={filteredUsers}
              currentUserId={currentUser?.id}
              onView={handleView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        )}
      </Card>
      <UserForm
        key={`create-${isCreateOpen}`}
        isOpen={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        onUpdate={async () => {}}
      />
      <UserForm
        key={`edit-${selectedUser?.id ?? "none"}-${isEditOpen}`}
        isOpen={isEditOpen}
        mode="edit"
        user={selectedUser}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onCreate={async () => {}}
        onUpdate={handleUpdate}
      />
      <UserDetails
        isOpen={isDetailsOpen}
        user={selectedUser}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedUser(null);
        }}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="حذف کاربر"
        message={`آیا از حذف کاربر "${selectedUser?.name ?? ""}" مطمئن هستید؟`}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default UsersPage;
