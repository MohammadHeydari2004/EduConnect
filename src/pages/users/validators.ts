import type { CreateUserPayload, UpdateUserPayload } from "#/types/user.ts";

export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  form?: string;
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateName = (value: string | undefined): string | true => {
  if (!value || !value.trim()) return "نام الزامی است.";
  const trimmed = value.trim();
  if (trimmed.length < 3) return "نام باید حداقل ۳ کاراکتر باشد.";
  if (trimmed.length > 50) return "نام نباید بیشتر از ۵۰ کاراکتر باشد.";
  return true;
};

export const validateEmail = (value: string | undefined): string | true => {
  if (!value || !value.trim()) return "ایمیل الزامی است.";
  const trimmed = value.trim();
  if (!emailRegex.test(trimmed)) return "فرمت ایمیل معتبر نیست.";
  if (trimmed.length > 100) return "ایمیل نباید بیشتر از ۱۰۰ کاراکتر باشد.";
  return true;
};

export const validatePassword = (value: string | undefined): string | true => {
  if (!value) return "رمز عبور الزامی است.";
  if (value.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (value.length > 128) return "رمز عبور نباید بیشتر از ۱۲۸ کاراکتر باشد.";
  return true;
};

export const validateRole = (value: string | undefined): string | true => {
  if (!value) return "نقش الزامی است.";
  if (!["admin", "teacher", "student"].includes(value)) {
    return "نقش انتخاب‌شده معتبر نیست.";
  }
  return true;
};

export const validateStatus = (value: string | undefined): string | true => {
  if (!value) return "وضعیت الزامی است.";
  if (!["active", "inactive"].includes(value)) {
    return "وضعیت انتخاب‌شده معتبر نیست.";
  }
  return true;
};

export function validateCreateUser(values: CreateUserPayload): UserFormErrors {
  const errors: UserFormErrors = {};
  const nameResult = validateName(values.name);
  const emailResult = validateEmail(values.email);
  const passwordResult = validatePassword(values.password);
  const roleResult = validateRole(values.role);
  const statusResult = validateStatus(values.status);

  if (typeof nameResult === "string") errors.name = nameResult;
  if (typeof emailResult === "string") errors.email = emailResult;
  if (typeof passwordResult === "string") errors.password = passwordResult;
  if (typeof roleResult === "string") errors.role = roleResult;
  if (typeof statusResult === "string") errors.status = statusResult;

  return errors;
}

export function validateUpdateUser(values: UpdateUserPayload): UserFormErrors {
  const errors: UserFormErrors = {};
  const nameResult = validateName(values.name);
  const emailResult = validateEmail(values.email);
  const roleResult = validateRole(values.role);
  const statusResult = validateStatus(values.status);

  if (typeof nameResult === "string") errors.name = nameResult;
  if (typeof emailResult === "string") errors.email = emailResult;
  if (typeof roleResult === "string") errors.role = roleResult;
  if (typeof statusResult === "string") errors.status = statusResult;

  return errors;
}
