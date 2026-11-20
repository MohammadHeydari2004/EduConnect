import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import {
  createExactMatchFilter,
  createStringContainsFilter,
} from "#/hooks/useFilter.ts";
import { userService } from "#/services/user.ts";
import type {
  CreateUserPayload,
  FilterConfig,
  ID,
  UpdateUserPayload,
  User,
  UserFilters as UserFiltersType,
} from "#/types";
import { TOAST_MESSAGES } from "#/configs/constants";
import { showErrorToast } from "#/hooks/useToastHelpers.ts";
import { useCallback, useMemo, useRef, useState } from "react";

const initialFilters: UserFiltersType = {
  searchName: "",
  searchEmail: "",
  role: "",
  status: "",
};

function preventSelfAction(
  currentUserId: string | undefined,
  targetId: string,
  message: string,
  addToast: (message: string, type: "success" | "error" | "info") => void,
): boolean {
  if (currentUserId === targetId) {
    addToast(message, "error");
    return true;
  }
  return false;
}

export function useUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [statusModal, setStatusModal] = useState<{
    target: User | null;
  }>({ target: null });
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const togglingUserIdsRef = useRef<Set<ID>>(new Set());

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
      getAll: userService.getAll,
      getById: userService.getById,
      create: userService.create,
      update: userService.update,
      delete: userService.delete,
    },
    initialFilters,
    filterConfigs,
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
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
      if (preventSelfAction(currentUser?.id, user.id, TOAST_MESSAGES.PREVENT_SELF_EDIT, addToast)) {
        return;
      }
      crud.actions.handleOpenEdit(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleOpenDelete = useCallback(
    (user: User) => {
      if (preventSelfAction(currentUser?.id, user.id, TOAST_MESSAGES.PREVENT_SELF_DELETE, addToast)) {
        return;
      }
      crud.actions.handleOpenDelete(user);
    },
    [crud.actions, currentUser, addToast],
  );

  const handleOpenStatus = useCallback(
    (user: User) => {
      if (!currentUser) return;
      if (preventSelfAction(currentUser.id, user.id, TOAST_MESSAGES.PREVENT_SELF_STATUS, addToast)) {
        return;
      }
      setStatusModal({ target: user });
    },
    [currentUser, addToast],
  );

  const handleCloseStatus = useCallback(() => {
    setStatusModal({ target: null });
  }, []);

  const handleToggleStatus = useCallback(
    async (user: User) => {
      if (togglingUserIdsRef.current.has(user.id)) return;
      togglingUserIdsRef.current.add(user.id);
      setIsStatusChanging(true);
      try {
        await userService.toggleStatus(user.id);
        addToast(TOAST_MESSAGES.USER_STATUS_SUCCESS, "success");
        crud.state.refresh();
        setStatusModal({ target: null });
      } catch (err) {
        showErrorToast(
          addToast,
          err instanceof Error ? err.message : TOAST_MESSAGES.USER_STATUS_ERROR,
        );
        setStatusModal({ target: null });
      } finally {
        togglingUserIdsRef.current.delete(user.id);
        setIsStatusChanging(false);
      }
    },
    [addToast, crud.state.refresh],
  );

  const handleView = useCallback(
    (user: User) => {
      crud.actions.modal.openWithTarget("details", user);
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
    userModal: crud.actions.modal,
    isDeleting: crud.actions.isDeleting,
    handleCreate: crud.actions.handleCreate,
    handleOpenEdit,
    handleUpdate: crud.actions.handleUpdate,
    handleOpenDelete,
    handleDelete: crud.actions.handleDelete,
    statusModal,
    isStatusChanging,
    handleOpenStatus,
    handleCloseStatus,
    handleToggleStatus,
    handleView,
  };
}
