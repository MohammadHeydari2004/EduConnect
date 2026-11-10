import { useMemo } from "react";
import type { FilterConfig, UseFilterOptions } from "#/types/hooks.ts";

export function useFilter<T, F extends object = Record<string, unknown>>({
  data,
  filters,
  filterConfigs,
  extraPredicate,
}: UseFilterOptions<T, F>): T[] {
  return useMemo(() => {
    if (!data) return [];

    const filtersRecord = filters as Record<string, unknown>;

    return data.filter((item) => {
      for (const config of filterConfigs) {
        const filterValue = filtersRecord[config.filterKey];
        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          continue;
        }

        if (!config.matches(item, filterValue)) {
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
