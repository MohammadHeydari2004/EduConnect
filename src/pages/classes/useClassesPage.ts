import { useAuth } from "#/contexts/AuthContext.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import {
  createExactMatchFilter,
  createStringContainsFilter,
} from "#/hooks/useFilter.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import { classService } from "#/services/class.ts";
import { userService } from "#/services/user.ts";
import type { ClassFormValues, ClassItem, ClassStatus } from "#/types/class.ts";
import type { User } from "#/types/user.ts";
import { TOAST_MESSAGES } from "#/configs/constants";
import { isAdmin, isTeacher } from "#/utils/roleUtils.ts";
import { useCallback, useMemo, useState } from "react";

interface ClassFiltersValues {
  search: string;
  statusFilter: ClassStatus | "";
  teacherFilter: string;
  [key: string]: string | ClassStatus | "";
}

const initialFilters: ClassFiltersValues = {
  search: "",
  statusFilter: "",
  teacherFilter: "",
};

export function useClassesPage() {
  const { user: currentUser } = useAuth();

  const isAdminUser = isAdmin(currentUser);
  const isTeacherUser = isTeacher(currentUser);

  const {
    data: users,
    loading: usersLoading,
    error: usersError,
  } = useAsyncData<User[]>({
    fetcher: () => userService.getAll(),
    deps: [],
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
  });

  const teachers = useMemo(
    () =>
      users?.filter((u) => u.role === "teacher" && u.status === "active") ?? [],
    [users],
  );

  const crud = useCrudPage<
    ClassItem,
    ClassFormValues,
    Partial<ClassFormValues>,
    ClassFiltersValues
  >({
    service: {
      getAll: classService.getAll,
      getById: classService.getById,
      create: classService.create,
      update: (id: string, data: Partial<ClassFormValues>) =>
        classService.update(id, data),
      delete: classService.delete,
    },
    initialFilters,
    filterConfigs: [
      createStringContainsFilter<ClassItem>("search", (cls) => cls.title || ""),
      createExactMatchFilter<ClassItem>("statusFilter", (cls) => cls.status),
      createExactMatchFilter<ClassItem>(
        "teacherFilter",
        (cls) => cls.teacherId,
      ),
    ],
    extraPredicate: (cls: ClassItem) => {
      if (!isAdminUser && isTeacherUser) {
        return cls.teacherId === currentUser?.id;
      }
      return true;
    },
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
    canManage: () => isAdminUser,
  });

  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const { addToast } = useToast();

  const statusModal = useModalState<ClassItem>();

  const confirmStatusChange = useCallback(async () => {
    const target = statusModal.target;
    if (!target) return;
    setIsStatusChanging(true);
    try {
      const newStatus: ClassStatus =
        target.status === "active" ? "inactive" : "active";

      if (newStatus === "inactive") {
        await classService.setStatus(target.id, "inactive");
        addToast(
          TOAST_MESSAGES.CLASS_STATUS_SUCCESS.replace("{title}", target.title ?? "").replace("{action}", "غیرفعال"),
          "success",
        );
      } else {
        await classService.setStatus(target.id, "active");
        addToast(
          TOAST_MESSAGES.CLASS_STATUS_SUCCESS.replace("{title}", target.title ?? "").replace("{action}", "فعال"),
          "success",
        );
      }
      crud.state.refresh();
      statusModal.close();
    } catch {
      addToast(TOAST_MESSAGES.CLASS_STATUS_ERROR, "error");
      statusModal.close();
    } finally {
      setIsStatusChanging(false);
    }
  }, [statusModal.target, crud.state.refresh, statusModal, addToast]);

  const handleOpenStatus = useCallback(
    (cls: ClassItem) => {
      statusModal.openWithTarget("status", cls);
    },
    [statusModal],
  );

  const modals = {
    isOpen: (kind: string) => {
      if (kind === "status") return statusModal.isOpen("status");
      if (kind === "create") return crud.modals.create;
      if (kind === "edit") return crud.modals.edit;
      if (kind === "delete") return crud.modals.delete;
      return false;
    },
    target: statusModal.isOpen("status")
      ? statusModal.target
      : crud.modals.target,
    createModal: {
      close: () => {
        crud.actions.createModal.close();
        statusModal.close();
      },
      openWithTarget: (kind: string, target: ClassItem) => {
        if (kind === "status") {
          statusModal.openWithTarget("status", target);
        } else {
          crud.actions.createModal.openWithTarget(kind, target);
        }
      },
    },
  };

  return {
    currentUser,
    isAdmin: isAdminUser,
    teachers,
    users,
    usersLoading,
    usersError,
    loading: crud.state.loading || usersLoading,
    error: crud.state.error || usersError,
    filters: crud.state.filters,
    setFilters: crud.state.setFilters,
    resetFilters: crud.state.resetFilters,
    filteredClasses: crud.state.filteredData,
    modals,
    isStatusChanging,
    confirmStatusChange,
    handleOpenCreate: crud.actions.handleOpenCreate,
    handleOpenEdit: crud.actions.handleOpenEdit,
    handleOpenDelete: crud.actions.handleOpenDelete,
    handleDelete: crud.actions.handleDelete,
    handleOpenStatus,
    isCreating: crud.actions.isCreating,
    isUpdating: crud.actions.isUpdating,
    isDeleting: crud.actions.isDeleting,
    canManageClass: (_cls: ClassItem) => isAdminUser,
    refresh: crud.state.refresh,
  };
}

export type { ClassFiltersValues };
