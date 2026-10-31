import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import {
  createExactMatchFilter,
  createStringContainsFilter,
  type FilterConfig,
} from "#/hooks/useFilter.ts";
import { userService } from "#/services/user.ts";
import type { ID } from "#/types/common.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters as UserFiltersType,
} from "#/types/user.ts";
import { TOAST_MESSAGES } from "#/configs/constants";
import { isAdmin } from "#/utils/roleUtils.ts";
import { useCallback, useMemo } from "react";

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
  addToast: (message: string, type: "success" | "error" | "info") => void,
): boolean {
  if (currentUserId === targetId) {
    addToast(
      TOAST_MESSAGES.PREVENT_SELF_ACTION(actionName),
      "error",
    );
    return true;
  }
  return false;
}

export function useUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const filterConfigs = useMemo<FilterConfig<User>[]>(
    () => [
      createStringContainsFilter<User>("searchName", (user) => user.name),
      createStringContainsFilter<User>("searchEmail", (user) => user.email),
      createExactMatchFilter<User>("role", (user) => user.role),
      createExactMatchFilter<User>("status", (user) => user.status),
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
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
    canManage: () => isAdmin(currentUser),
    onCreateSuccess: () => {
      addToast(TOAST_MESSAGES.USER_CREATE_SUCCESS, "success");
    },
    onUpdateSuccess: () => {
      addToast(TOAST_MESSAGES.USER_UPDATE_SUCCESS, "success");
    },
    onDeleteSuccess: () => {
      addToast(TOAST_MESSAGES.USER_DELETE_SUCCESS, "success");
    },
  });

  const handleOpenEdit = useCallback(
    (user: User) => {
      if (preventSelfAction(currentUser?.id, user.id, "ویرایش", addToast)) {
        return;
      }
      crud.actions.handleOpenEdit(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleOpenDelete = useCallback(
    (user: User) => {
      if (preventSelfAction(currentUser?.id, user.id, "حذف", addToast)) {
        return;
      }
      crud.actions.handleOpenDelete(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleDelete = useCallback(async () => {
    if (!currentUser) return;
    await crud.actions.handleDelete();
  }, [crud.actions, currentUser]);

  const handleUpdate = useCallback(
    async (values: UpdateUserPayload) => {
      if (!currentUser) return;
      await crud.actions.handleUpdate(values);
    },
    [crud.actions, currentUser],
  );

  const handleToggleStatus = useCallback(
    async (user: User) => {
      if (!currentUser) return;
      if (preventSelfAction(currentUser.id, user.id, "تغییر وضعیت", addToast)) {
        return;
      }
      try {
        await userService.toggleStatus(user.id);
        addToast(TOAST_MESSAGES.USER_STATUS_SUCCESS, "success");
        crud.state.refresh();
      } catch {
        addToast(TOAST_MESSAGES.USER_STATUS_ERROR, "error");
      }
    },
    [currentUser, addToast, crud.state.refresh],
  );

  const handleView = useCallback(
    (user: User) => {
      crud.actions.createModal.openWithTarget("details", user);
    },
    [crud.actions],
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
    viewModal: crud.actions.createModal,
    isDeleting: crud.actions.isDeleting,
    handleCreate: crud.actions.handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleOpenDelete,
    handleDelete,
    handleToggleStatus,
    handleView,
  };
}
