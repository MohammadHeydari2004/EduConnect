import { useMemo } from "react";
import type { ID } from "#/types/common.ts";

/**
 * Builds a `Map` keyed by the `id` field of each item.
 * Replaces the many inline `const map = new Map(); items.forEach(i => map.set(i.id, i))` blocks.
 */
export function useMapById<T extends { id: ID }>(items: T[]): Map<ID, T> {
  return useMemo(() => {
    const map = new Map<ID, T>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);
}
