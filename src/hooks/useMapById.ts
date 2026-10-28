import { useMemo } from "react";
import type { ID } from "#/types/common.ts";

export function useMapById<T extends { id: ID }>(items: T[]): Map<ID, T> {
  return useMemo(() => {
    const map = new Map<ID, T>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);
}
