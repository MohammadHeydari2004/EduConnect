import type { UserRole } from "#/types";
export { getRoleLabel, getStatusLabel } from "#/configs/constants";

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