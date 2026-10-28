import { useAuth } from "#/contexts/AuthContext.ts";
import type { ToastType } from "#/contexts/ToastContext.tsx";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import { userService } from "#/services/user.ts";
import type { ID } from "#/types/common.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters as UserFiltersType,
} from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { useCallback, useMemo, useRef } from "react";

const initialFilters: UserFiltersType = {
  searchName: "",
  searchEmail: "",
  role: "",
  status: "",
};

function preventSelfAction(
  currentUserId: string | undefined,
  targetId: string,
  actionName: string,
  addToast: (message: string, type: ToastType) => void,
): boolean {
  if (currentUserId === targetId) {
    addToast(
      `شما نمی‌توانید ${actionName} حساب کاربری خودتان را ${actionName === "حذف" ? "کنید" : "تغییر دهید"}.`,
      "error",
    );
    return true;
  }
  return false;
}

export function useUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const viewModal = useModalState<User>();

  // Ref to store the user ID being deleted, avoiding stale closure issues
  const deleteTargetRef = useRef<ID | null>(null);

  // Ref to store the user ID being updated, avoiding stale closure issues
  const updateTargetRef = useRef<ID | null>(null);

  const filterConfigs = useMemo<
    import("#/hooks/useFilter.ts").FilterConfig<User>[]
  >(
    () => [
      {
        filterKey: "searchName",
        matches: (user: User, value) =>
          value
            ? user.name.toLowerCase().includes(String(value).toLowerCase())
            : true,
      },
      {
        filterKey: "searchEmail",
        matches: (user: User, value) =>
          value
            ? user.email.toLowerCase().includes(String(value).toLowerCase())
            : true,
      },
      {
        filterKey: "role",
        matches: (user: User, value) => (value ? user.role === value : true),
      },
      {
        filterKey: "status",
        matches: (user: User, value) => (value ? user.status === value : true),
      },
    ],
    [],
  );

  const crud = useCrudPage<
    User,
    CreateUserPayload,
    UpdateUserPayload,
    UserFiltersType
  >({
    service: {
      getAll: () => userService.getAll(),
      getById: (id: ID) => userService.getById(id),
      create: (data: CreateUserPayload) => userService.create(data),
      update: (id: ID, data: UpdateUserPayload) => userService.update(id, data),
      delete: (id: ID) => userService.delete(id),
    },
    initialFilters,
    filterConfigs,
    fallbackError: "دریافت لیست کاربران با خطا مواجه شد.",
    canManage: () => true,
    onCreateSuccess: () => {
      addToast("کاربر با موفقیت ایجاد شد.", "success");
    },
    onUpdateSuccess: () => {
      addToast("اطلاعات کاربر با موفقیت ویرایش شد.", "success");
    },
    onDeleteSuccess: () => {
      addToast("کاربر با موفقیت حذف شد.", "success");
    },
  });

  const handleOpenEdit = useCallback(
    (user: User) => {
      if (preventSelfAction(currentUser?.id, user.id, "ویرایش", addToast)) {
        return;
      }
      // Store the target ID in ref to avoid stale closure in handleUpdate
      updateTargetRef.current = user.id;
      crud.actions.handleOpenEdit(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleOpenDelete = useCallback(
    (user: User) => {
      if (preventSelfAction(currentUser?.id, user.id, "حذف", addToast)) {
        return;
      }
      // Store the target ID in ref to avoid stale closure in handleDelete
      deleteTargetRef.current = user.id;
      crud.actions.handleOpenDelete(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleDelete = useCallback(async () => {
    const targetId = deleteTargetRef.current;
    if (!targetId || !currentUser) return;
    if (preventSelfAction(currentUser.id, targetId, "حذف", addToast)) {
      crud.actions.createModal.close();
      deleteTargetRef.current = null;
      return;
    }
    await crud.actions.handleDelete();
    deleteTargetRef.current = null;
  }, [crud.actions, currentUser, addToast]);

  const handleUpdate = useCallback(
    async (values: UpdateUserPayload) => {
      const targetId = updateTargetRef.current;
      if (!targetId) return;
      if (
        preventSelfAction(currentUser?.id, targetId, "غیرفعال کردن", addToast)
      ) {
        return;
      }
      await crud.actions.handleUpdate(values);
      updateTargetRef.current = null;
    },
    [crud.actions, currentUser, addToast],
  );

  const handleToggleStatus = useCallback(
    async (user: User) => {
      if (!currentUser) return;
      if (preventSelfAction(currentUser.id, user.id, "تغییر وضعیت", addToast)) {
        return;
      }
      try {
        await userService.toggleStatus(user.id);
        addToast("وضعیت کاربر با موفقیت تغییر کرد.", "success");
        crud.state.refresh();
      } catch (err) {
        addToast(
          getErrorMessage(err, "تغییر وضعیت کاربر ناموفق بود."),
          "error",
        );
      }
    },
    [currentUser, addToast, crud.state.refresh],
  );

  const handleView = useCallback(
    (user: User) => {
      viewModal.openWithTarget("details", user);
    },
    [viewModal],
  );

  return {
    currentUser,
    loading: crud.state.loading,
    error: crud.state.error,
    filters: crud.state.filters,
    setFilters: crud.state.setFilters,
    resetFilters: crud.state.resetFilters,
    filteredUsers: crud.state.filteredData,
    userModal: crud.actions.createModal,
    viewModal,
    isDeleting: crud.actions.isDeleting,
    isTogglingStatus: false,
    handleCreate: crud.actions.handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleOpenDelete,
    handleDelete,
    handleToggleStatus,
    handleView,
  };
}
