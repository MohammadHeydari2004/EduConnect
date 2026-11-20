import { ALL_ROLES } from "#/configs/constants/roles.ts";
import { getRoleLabel, getStatusLabel } from "#/configs/constants/userLabels.ts";
import type { RecordStatus, SelectOption, UserRole } from "#/types";

export const FORM_PLACEHOLDERS = {
  ASSIGNMENT_TITLE: "مثلاً: تمرین اول",
  ASSIGNMENT_DESCRIPTION: "توضیحات مختصر درباره تکلیف...",
  ANNOUNCEMENT_TITLE: "عنوان اطلاعیه",
  ANNOUNCEMENT_CONTENT: "متن اطلاعیه...",
} as const;

export const ROLE_FORM_OPTIONS: readonly SelectOption<UserRole>[] = ALL_ROLES.map(
  (role) => ({ label: getRoleLabel(role), value: role }),
);

export const ROLE_FILTER_OPTIONS: readonly SelectOption<UserRole | "">[] = [
  { label: "همه نقش‌ها", value: "" },
  ...ROLE_FORM_OPTIONS,
];

export const STATUS_FORM_OPTIONS: readonly SelectOption<RecordStatus>[] = [
  { label: getStatusLabel("active"), value: "active" },
  { label: getStatusLabel("inactive"), value: "inactive" },
];

export const STATUS_FILTER_OPTIONS: readonly SelectOption<RecordStatus | "">[] = [
  { label: "همه وضعیت‌ها", value: "" },
  ...STATUS_FORM_OPTIONS,
];