import type { ClassItem, ClassStatus } from "#/types";

export function getEffectiveStatus(cls: ClassItem): ClassStatus {
  return cls.status || "inactive";
}
