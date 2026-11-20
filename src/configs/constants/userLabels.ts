import type { RecordStatus, UserRole } from "#/types";

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "استاد";
    case "student":
      return "دانشجو";
    default:
      return "نامشخص";
  }
};

export const getStatusLabel = (status: RecordStatus): string => {
  switch (status) {
    case "active":
      return "فعال";
    case "inactive":
      return "غیرفعال";
    default:
      return "نامشخص";
  }
};