import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useFilter } from "#/hooks/useFilter.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import { showErrorToast } from "#/hooks/useToastHelpers.ts";
import type { CrudPageConfig, CrudPageState, ID } from "#/types";
import { TOAST_MESSAGES } from "#/configs/constants";

export function useCrudPage<
  T extends { id: ID },
  CreatePayload,
  UpdatePayload,
  FilterState extends object,
>(
  config: CrudPageConfig<T, CreatePayload, UpdatePayload, FilterState>,
) {
  const {
    service,
    initialFilters,
    filterConfigs,
    extraPredicate,
    fallbackError = TOAST_MESSAGES.FETCH_ERROR,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
  } = config;

  const { addToast } = useToast();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const { data, loading, error, refresh } = useAsyncData<T[]>({
    fetcher: (signal) => service.getAll(undefined, signal),
    deps: [],
    fallbackError,
  });

  const filteredData = useFilter({
    data,
    filters,
    filterConfigs,
    extraPredicate,
  });

  const { kind, target, open, openWithTarget, setTarget, close, isOpen } =
    useModalState<T>();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = useCallback(
    async (values: CreatePayload) => {
      try {
        const result = await service.create(values);
        close();
        if (onCreateSuccess) {
          onCreateSuccess(result);
        } else {
          addToast(TOAST_MESSAGES.CREATE_SUCCESS, "success");
        }

        refresh();
      } catch (err) {
        showErrorToast(
          addToast,
          err instanceof Error ? err.message : TOAST_MESSAGES.CREATE_ERROR,
        );
      }
    },
    [service, addToast, refresh, close, onCreateSuccess],
  );

  const handleUpdate = useCallback(
    async (values: UpdatePayload) => {
      if (!target) return;
      try {
        const result = await service.update(target.id, values);
        close();
        if (onUpdateSuccess) {
          onUpdateSuccess(result);
        } else {
          addToast(TOAST_MESSAGES.UPDATE_SUCCESS, "success");
        }

        refresh();
      } catch (err) {
        showErrorToast(
          addToast,
          err instanceof Error ? err.message : TOAST_MESSAGES.UPDATE_ERROR,
        );
      }
    },
    [service, addToast, refresh, close, target, onUpdateSuccess],
  );

  const handleDelete = useCallback(
    async () => {
      if (!target) return;
      try {
        setIsDeleting(true);
        await service.delete(target.id);
        close();
        if (onDeleteSuccess) {
          onDeleteSuccess(target.id);
        } else {
          addToast(TOAST_MESSAGES.DELETE_SUCCESS, "success");
        }

        refresh();
      } catch (err) {
        showErrorToast(
          addToast,
          err instanceof Error ? err.message : TOAST_MESSAGES.DELETE_ERROR,
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [service, addToast, refresh, close, target, onDeleteSuccess],
  );

  const handleOpenCreate = useCallback(() => {
    open("create");
  }, [open]);

  const handleOpenEdit = useCallback(
    (item: T) => {
      openWithTarget("edit", item);
    },
    [openWithTarget],
  );

  const handleOpenDelete = useCallback(
    (item: T) => {
      openWithTarget("delete", item);
    },
    [openWithTarget],
  );

  const modal = useMemo(
    () => ({ kind, target, open, openWithTarget, setTarget, close, isOpen }),
    [kind, target, open, openWithTarget, setTarget, close, isOpen],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const modals = useMemo(
    () => ({
      create: modal.isOpen("create"),
      edit: modal.isOpen("edit"),
      delete: modal.isOpen("delete"),
      target: modal.target,
      kind: modal.kind,
    }),
    [modal],
  );

  const actions = useMemo(
    () => ({
      modal,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      isDeleting,
    }),
    [
      modal,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      isDeleting,
    ],
  );

  return {
    state: {
      data,
      loading,
      error,
      filters,
      filteredData,
      refresh,
      setFilters,
      resetFilters,
    } as CrudPageState<T, FilterState>,
    modals,
    actions,
  };
}
