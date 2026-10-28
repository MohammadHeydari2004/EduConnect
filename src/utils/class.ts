import type { ClassItem, ClassStatus } from "#/types/class.ts";

export function getEffectiveStatus(cls: ClassItem): ClassStatus {
  return cls.status || "inactive";
}
