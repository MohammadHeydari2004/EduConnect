import type { RecordStatus, UserRole } from "#/types/common.ts";

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "استاد";
    case "student":
      return "دانشجو";
  }
};

export const getRoleVariant = (role: UserRole): "blue" | "green" | "gray" => {
  switch (role) {
    case "admin":
      return "blue";
    case "teacher":
      return "green";
    default:
      return "gray";
  }
};

export const getStatusLabel = (status: RecordStatus): string => {
  switch (status) {
    case "active":
      return "فعال";
    case "inactive":
      return "غیرفعال";
  }
};
