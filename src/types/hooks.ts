import type { ID } from "#/types/common.ts";

export interface FilterConfig<T> {
  filterKey: string;
  matches: (item: T, filterValue: unknown) => boolean;
}

export interface UseFilterOptions<
  T,
  F extends object = Record<string, unknown>,
> {
  data: T[] | undefined | null;
  filters: F;
  filterConfigs: FilterConfig<T>[];
  extraPredicate?: ((item: T) => boolean | undefined) | undefined;
}

export interface CrudService<T, CreatePayload, UpdatePayload> {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => Promise<T[]>;
  getById: (id: ID) => Promise<T>;
  create: (data: CreatePayload) => Promise<T>;
  update: (id: ID, data: UpdatePayload) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

export interface CrudPageConfig<
  T extends { id: ID },
  CreatePayload,
  UpdatePayload,
  FilterState extends object,
> {
  service: CrudService<T, CreatePayload, UpdatePayload>;
  initialFilters: FilterState;
  filterConfigs: FilterConfig<T>[];
  extraPredicate?: (item: T) => boolean | undefined;
  fallbackError?: string;
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: (id: ID) => void;
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
