export const FORM_PLACEHOLDERS = {
  ASSIGNMENT_TITLE: "مثلاً: تمرین اول",
  ASSIGNMENT_DESCRIPTION: "توضیحات مختصر درباره تکلیف...",
  ANNOUNCEMENT_TITLE: "عنوان اطلاعیه",
  ANNOUNCEMENT_CONTENT: "متن اطلاعیه...",
} as const;

export const ROLE_FORM_OPTIONS = [
  { label: "مدیر", value: "admin" },
  { label: "استاد", value: "teacher" },
  { label: "دانشجو", value: "student" },
];

export const ROLE_FILTER_OPTIONS = [
  { label: "همه نقش‌ها", value: "" },
  ...ROLE_FORM_OPTIONS,
];

export const STATUS_FORM_OPTIONS = [
  { label: "فعال", value: "active" },
  { label: "غیرفعال", value: "inactive" },
];

export const STATUS_FILTER_OPTIONS = [
  { label: "همه وضعیت‌ها", value: "" },
  ...STATUS_FORM_OPTIONS,
];

export const EMAIL_ALREADY_REGISTERED = "قبلاً ثبت شده";

export const DIALOG_STRINGS = {
  CONFIRM_TITLE: "تأیید عملیات",
  CONFIRM_MESSAGE: "آیا از انجام این عملیات مطمئن هستید؟",
  CONFIRM_TEXT: "تأیید",
  CANCEL_TEXT: "انصراف",
  PROFILE_TITLE: "پروفایل",
} as const;
