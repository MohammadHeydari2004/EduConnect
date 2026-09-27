import type { RecordStatus, UserRole } from "#/types/common.ts";

export const getRoleLabel = (role: UserRole | string): string => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "استاد";
    case "student":
      return "دانشجو";
    default:
      return role;
  }
};

export const getStatusLabel = (status: RecordStatus | string): string => {
  switch (status) {
    case "active":
      return "فعال";
    case "inactive":
      return "غیرفعال";
    default:
      return status;
  }
};
