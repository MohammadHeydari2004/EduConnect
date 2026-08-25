import type { CreateUserPayload, UpdateUserPayload } from "#/types/user.ts";

export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  form?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateUser(values: CreateUserPayload): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "نام الزامی است.";
  } else if (values.name.trim().length < 3) {
    errors.name = "نام باید حداقل 3 کاراکتر باشد.";
  }

  if (!values.email.trim()) {
    errors.email = "ایمیل الزامی است.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "فرمت ایمیل معتبر نیست.";
  }

  if (!values.password.trim()) {
    errors.password = "رمز عبور الزامی است.";
  } else if (values.password.trim().length < 6) {
    errors.password = "رمز عبور باید حداقل 6 کاراکتر باشد.";
  }

  if (!values.role) {
    errors.role = "نقش الزامی است.";
  }

  if (!values.status) {
    errors.status = "وضعیت الزامی است.";
  }

  return errors;
}

export function validateUpdateUser(values: UpdateUserPayload): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "نام الزامی است.";
  } else if (values.name.trim().length < 3) {
    errors.name = "نام باید حداقل 3 کاراکتر باشد.";
  }

  if (!values.email.trim()) {
    errors.email = "ایمیل الزامی است.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "فرمت ایمیل معتبر نیست.";
  }

  if (!values.role) {
    errors.role = "نقش الزامی است.";
  }

  if (!values.status) {
    errors.status = "وضعیت الزامی است.";
  }

  return errors;
}
