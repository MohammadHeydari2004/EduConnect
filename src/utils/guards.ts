import { ALL_ROLES } from "#/configs/constants";
import type { RecordStatus, User, UserRole } from "#/types";

const VALID_STATUSES: RecordStatus[] = ["active", "inactive"];

export function isValidUser(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) return false;
  const u = obj as Record<string, unknown>;
  return (
    typeof u["id"] === "string" &&
    typeof u["name"] === "string" &&
    typeof u["email"] === "string" &&
    typeof u["role"] === "string" &&
    ALL_ROLES.includes(u["role"] as UserRole) &&
    typeof u["status"] === "string" &&
    VALID_STATUSES.includes(u["status"] as RecordStatus)
  );
}