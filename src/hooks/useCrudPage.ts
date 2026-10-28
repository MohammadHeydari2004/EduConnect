import { useCallback, useState } from "react";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useFilter, type FilterConfig } from "#/hooks/useFilter.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import { getErrorMessage } from "#/utils/error.ts";
import type { ID } from "#/types/common.ts";

export interface CrudService<T, CreatePayload, UpdatePayload> {
  getAll: () => Promise<T[]>;
  getById: (id: ID) => Promise<T>;
  create: (data: CreatePayload) => Promise<T>;
  update: (id: ID, data: UpdatePayload) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

export interface CrudPageConfig<T extends { id: ID }, CreatePayload, UpdatePayload, FilterState extends Record<string, any>> {
  service: CrudService<T, CreatePayload, UpdatePayload>;
  initialFilters: FilterState;
  filterConfigs: FilterConfig<T>[];
  extraPredicate?: (item: T) => boolean;
  fallbackError?: string;
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: (id: ID) => void;
  canManage?: (item: T) => boolean;
}

export interface CrudPageState<T extends { id: ID }, FilterState> {
  data: T[] | null;
  loading: boolean;
  error: string;
  filters: FilterState;
  filteredData: T[];
  refresh: () => void;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
}

export interface CrudPageActions<T extends { id: ID }, CreatePayload, UpdatePayload> {
  createModal: ReturnType<typeof useModalState<T>>;
  handleCreate: (values: CreatePayload) => Promise<void>;
  handleUpdate: (values: UpdatePayload) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: T) => void;
  handleOpenDelete: (item: T) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useCrudPage<T extends { id: ID }, CreatePayload, UpdatePayload, FilterState extends Record<string, any>>(
  config: CrudPageConfig<T, CreatePayload, UpdatePayload, FilterState>,
) {
  const {
    service,
    initialFilters,
    filterConfigs,
    extraPredicate,
    fallbackError = "دریافت لیست با خطا مواجه شد.",
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    canManage,
  } = config;

  const { addToast } = useToast();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const { data, loading, error, refresh } = useAsyncData<T[]>({
    fetcher: () => service.getAll(),
    deps: [],
    fallbackError,
  });

  const filteredData = useFilter({
    data,
    filters,
    filterConfigs,
    extraPredicate,
  });

  const modal = useModalState<T>();

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = useCallback(
    async (values: CreatePayload) => {
      try {
        setIsCreating(true);
        const result = await service.create(values);
        addToast("با موفقیت ایجاد شد.", "success");
        onCreateSuccess?.(result);
        refresh();
        modal.close();
      } catch (err) {
        addToast(getErrorMessage(err, "ایجاد با خطا مواجه شد."), "error");
      } finally {
        setIsCreating(false);
      }
    },
    [service, addToast, refresh, modal, onCreateSuccess],
  );

  const handleUpdate = useCallback(
    async (values: UpdatePayload) => {
      const target = modal.target;
      if (!target) return;
      try {
        setIsUpdating(true);
        const result = await service.update(target.id, values);
        addToast("با موفقیت ویرایش شد.", "success");
        onUpdateSuccess?.(result);
        refresh();
        modal.close();
      } catch (err) {
        addToast(getErrorMessage(err, "ویرایش با خطا مواجه شد."), "error");
      } finally {
        setIsUpdating(false);
      }
    },
    [service, addToast, refresh, modal, onUpdateSuccess],
  );

  const handleDelete = useCallback(
    async () => {
      const target = modal.target;
      if (!target) return;
      try {
        setIsDeleting(true);
        await service.delete(target.id);
        addToast("با موفقیت حذف شد.", "success");
        onDeleteSuccess?.(target.id);
        refresh();
        modal.close();
      } catch (err) {
        addToast(getErrorMessage(err, "حذف با خطا مواجه شد."), "error");
      } finally {
        setIsDeleting(false);
      }
    },
    [service, addToast, refresh, modal, onDeleteSuccess],
  );

  const handleOpenCreate = useCallback(() => {
    modal.open("create");
  }, [modal]);

  const handleOpenEdit = useCallback(
    (item: T) => {
      modal.openWithTarget("edit", item);
    },
    [modal],
  );

  const handleOpenDelete = useCallback(
    (item: T) => {
      modal.openWithTarget("delete", item);
    },
    [modal],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

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
    modals: {
      create: modal.isOpen("create"),
      edit: modal.isOpen("edit"),
      delete: modal.isOpen("delete"),
      target: modal.target,
      kind: modal.kind,
    },
    actions: {
      createModal: modal,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      isCreating,
      isUpdating,
      isDeleting,
    } as CrudPageActions<T, CreatePayload, UpdatePayload>,
    canManage,
  };
}