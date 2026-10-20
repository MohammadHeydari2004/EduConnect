import { useMemo } from "react";

export interface FilterConfig<T> {
  /**
   * Field name in the filter state
   */
  filterKey: string;
  /**
   * Function to check if an item matches the filter value
   * Receives (item, filterValue) and returns boolean
   */
  matches: (item: T, filterValue: unknown) => boolean;
  /**
   * Optional: transform filter value before comparison (e.g., toLowerCase)
   */
  transformFilter?: (value: unknown) => unknown;
  /**
   * Optional: transform item value before comparison
   */
  transformItem?: (item: T) => unknown;
}

export interface UseFilterOptions<T, F extends Record<string, any> = Record<string, any>> {
  /** The data array to filter */
  data: T[] | undefined | null;
  /** Current filter state */
  filters: F;
  /** Configuration for each filter field */
  filterConfigs: FilterConfig<T>[];
  /** Optional: additional predicate that runs after all filters (e.g., role-based access) */
  extraPredicate?: (item: T) => boolean;
}

/**
 * Generic hook for filtering arrays based on filter state.
 * Replaces repetitive useMemo filter logic across pages.
 *
 * @example
 * ```tsx
 * const filteredUsers = useFilter({
 *   data: users,
 *   filters,
 *   filterConfigs: [
 *     { filterKey: 'searchName', matches: (user, v) => user.name.toLowerCase().includes(String(v).toLowerCase()) },
 *     { filterKey: 'searchEmail', matches: (user, v) => user.email.toLowerCase().includes(String(v).toLowerCase()) },
 *     { filterKey: 'role', matches: (user, v) => v ? user.role === v : true },
 *     { filterKey: 'status', matches: (user, v) => v ? user.status === v : true },
 *   ],
 * });
 */
export function useFilter<T, F extends Record<string, any> = Record<string, any>>({
  data,
  filters,
  filterConfigs,
  extraPredicate,
}: UseFilterOptions<T, F>): T[] {
  return useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      // Apply all configured filters
      for (const config of filterConfigs) {
        const filterValue = filters[config.filterKey];
        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          continue; // Skip empty filters
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

      // Apply extra predicate (e.g., role-based access)
      if (extraPredicate && !extraPredicate(item)) {
        return false;
      }

      return true;
    });
  }, [data, filters, filterConfigs, extraPredicate]);
}

/**
 * Helper to create a string contains filter (case-insensitive)
 */
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

/**
 * Helper to create an exact match filter
 */
export function createExactMatchFilter<T>(
  filterKey: string,
  getItemValue: (item: T) => unknown
): FilterConfig<T> {
  return {
    filterKey,
    matches: (item, filterValue) => getItemValue(item) === filterValue,
  };
}

/**
 * Helper to create a status filter (active/expired based on date)
 */
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