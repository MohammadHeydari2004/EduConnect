import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import UserDetails from "#/pages/users/UserDetails.tsx";
import UserFilters from "#/pages/users/UserFilters.tsx";
import UserForm from "#/pages/users/UserForm.tsx";
import UserTable from "#/pages/users/UserTable.tsx";
import { userService } from "#/services/user.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters as UserFiltersType,
} from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useMemo, useState } from "react";

const initialFilters: UserFiltersType = {
  searchName: "",
  searchEmail: "",
  role: "",
  status: "",
};

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState<UserFiltersType>(initialFilters);

  const userModal = useModalState<User>();

  const { data: users, loading, error, refresh: refreshUsers } =
    useAsyncData<User[]>({
      fetcher: () => userService.getAll(),
      deps: [],
      fallbackError: "دریافت لیست کاربران با خطا مواجه شد.",
    });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesName = user.name
        .toLowerCase()
        .includes(filters.searchName.toLowerCase());
      const matchesEmail = user.email
        .toLowerCase()
        .includes(filters.searchEmail.toLowerCase());
      const matchesRole = filters.role ? user.role === filters.role : true;
      const matchesStatus = filters.status ? user.status === filters.status : true;
      return matchesName && matchesEmail && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleCreate = async (values: CreateUserPayload) => {
    try {
      await userService.create(values);
      addToast("کاربر با موفقیت ایجاد شد.", "success");
      refreshUsers();
      userModal.close();
    } catch (err) {
      addToast(getErrorMessage(err, "ایجاد کاربر ناموفق بود."), "error");
    }
  };

  const handleOpenEdit = (user: User) => {
    userModal.openWithTarget("edit", user);
  };

  const handleUpdate = async (values: UpdateUserPayload) => {
    const target = userModal.target;
    if (!target) return;
    if (currentUser?.id === target.id && values.status === "inactive") {
      addToast("شما نمی‌توانید حساب کاربری خودتان را غیرفعال کنید.", "error");
      return;
    }
    try {
      await userService.update(target.id, values);
      addToast("اطلاعات کاربر با موفقیت ویرایش شد.", "success");
      refreshUsers();
      userModal.close();
    } catch (err) {
      addToast(getErrorMessage(err, "ویرایش کاربر ناموفق بود."), "error");
    }
  };

  const handleOpenDelete = (user: User) => {
    userModal.openWithTarget("delete", user);
  };

  const handleDelete = async () => {
    const target = userModal.target;
    if (!target || !currentUser) return;
    if (target.id === currentUser.id) {
      addToast("شما نمی‌توانید حساب کاربری خودتان را حذف کنید.", "error");
      userModal.close();
      return;
    }
    setIsDeleting(true);
    try {
      await userService.delete(target.id);
      addToast("کاربر با موفقیت حذف شد.", "success");
      refreshUsers();
    } catch (err) {
      addToast(getErrorMessage(err, "حذف کاربر ناموفق بود."), "error");
    } finally {
      setIsDeleting(false);
      userModal.close();
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!currentUser || isTogglingStatus) return;
    if (user.id === currentUser.id) {
      addToast("شما نمی‌توانید وضعیت حساب خودتان را تغییر دهید.", "error");
      return;
    }
    setIsTogglingStatus(true);
    try {
      await userService.toggleStatus(user.id);
      addToast("وضعیت کاربر با موفقیت تغییر کرد.", "success");
      refreshUsers();
    } catch (err) {
      addToast(getErrorMessage(err, "تغییر وضعیت کاربر ناموفق بود."), "error");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleView = (user: User) => {
    userModal.openWithTarget("details", user);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          مدیریت کاربران
        </h1>
        <Button
          onClick={() => userModal.open("create")}
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
          <ErrorAlert message={error} />
        ) : !users || users.length === 0 ? (
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
          <UserTable
            users={filteredUsers}
            currentUserId={currentUser?.id}
            onView={handleView}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Card>

      {(userModal.isOpen("create") || userModal.isOpen("edit")) && (
        <UserForm
          key={userModal.kind ?? "none"}
          isOpen
          mode={userModal.kind === "edit" ? "edit" : "create"}
          user={userModal.kind === "edit" ? userModal.target : null}
          onClose={userModal.close}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      <UserDetails
        isOpen={userModal.isOpen("details")}
        user={userModal.target}
        onClose={userModal.close}
      />

      <ConfirmDialog
        isOpen={userModal.isOpen("delete")}
        title="حذف کاربر"
        message={`آیا از حذف کاربر "${userModal.target?.name ?? ""}" مطمئن هستید؟`}
        onClose={userModal.close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default UsersPage;