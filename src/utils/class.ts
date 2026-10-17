import type { ClassItem, ClassStatus } from "#/types/class.ts";

/**
 * Returns the effective status of a class, defaulting to `"inactive"` when the
 * optional `status` field is missing (e.g. legacy seed data).
 */
export function getEffectiveStatus(cls: ClassItem): ClassStatus {
  return cls.status || "inactive";
}
