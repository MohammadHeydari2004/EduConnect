import { useMemo } from "react";

export interface FilterConfig<T> {
  filterKey: string;
  matches: (item: T, filterValue: unknown) => boolean;
  transformFilter?: (value: unknown) => unknown;
  transformItem?: (item: T) => unknown;
}

export interface UseFilterOptions<T, F extends Record<string, unknown> = Record<string, unknown>> {
  data: T[] | undefined | null;
  filters: F;
  filterConfigs: FilterConfig<T>[];
  extraPredicate?: ((item: T) => boolean | undefined) | undefined;
}

export function useFilter<T, F extends Record<string, unknown> = Record<string, unknown>>({
  data,
  filters,
  filterConfigs,
  extraPredicate,
}: UseFilterOptions<T, F>): T[] {
  return useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      for (const config of filterConfigs) {
        const filterValue = filters[config.filterKey];
        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          continue;
        }

        const transformedFilter = config.transformFilter
          ? config.transformFilter(filterValue)
          : filterValue;
        const transformedItem = config.transformItem
          ? config.transformItem(item)
          : item;

        if (!config.matches(transformedItem as T, transformedFilter)) {
          return false;
        }
      }

      if (extraPredicate && !extraPredicate(item)) {
        return false;
      }

      return true;
    });
  }, [data, filters, filterConfigs, extraPredicate]);
}

export function createStringContainsFilter<T>(
  filterKey: string,
  getItemString: (item: T) => string
): FilterConfig<T> {
  return {
    filterKey,
    matches: (item, filterValue) =>
      getItemString(item).toLowerCase().includes(String(filterValue).toLowerCase()),
  };
}

export function createExactMatchFilter<T>(
  filterKey: string,
  getItemValue: (item: T) => unknown
): FilterConfig<T> {
  return {
    filterKey,
    matches: (item, filterValue) => getItemValue(item) === filterValue,
  };
}

export function createDateStatusFilter<T>(
  filterKey: string,
  getItemDate: (item: T) => string | Date
): FilterConfig<T> {
  return {
    filterKey,
    matches: (item, filterValue) => {
      if (!filterValue || filterValue === "") return true;
      const itemDate = new Date(getItemDate(item));
      const now = new Date();
      const isExpired = itemDate < now;
      if (filterValue === "active") return !isExpired;
      if (filterValue === "expired") return isExpired;
      return true;
    },
  };
}