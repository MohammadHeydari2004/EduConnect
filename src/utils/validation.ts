export function validateLength(
  value: string | undefined,
  fieldLabel: string,
  options: { min?: number; max?: number } = {},
): string | undefined {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return `${fieldLabel} الزامی است.`;
  if (options.min !== undefined && trimmed.length < options.min)
    return `${fieldLabel} باید حداقل ${options.min.toLocaleString("fa-IR")} کاراکتر باشد.`;
  if (options.max !== undefined && trimmed.length > options.max)
    return `${fieldLabel} نباید بیشتر از ${options.max.toLocaleString("fa-IR")} کاراکتر باشد.`;
  return undefined;
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

export const validateName = (value: string | undefined): string | undefined =>
  validateLength(value, "نام", {
    min: NAME_MIN_LENGTH,
    max: NAME_MAX_LENGTH,
  });

export const validateEmail = (value: string | undefined): string | undefined => {
  if (!value || !value.trim()) return "ایمیل الزامی است.";
  const trimmed = value.trim();
  if (!emailRegex.test(trimmed)) return "فرمت ایمیل معتبر نیست.";
  if (trimmed.length > EMAIL_MAX_LENGTH)
    return `ایمیل نباید بیشتر از ${EMAIL_MAX_LENGTH.toLocaleString("fa-IR")} کاراکتر باشد.`;
  return undefined;
};

export const validatePassword = (value: string | undefined): string | undefined =>
  validateLength(value, "رمز عبور", {
    min: PASSWORD_MIN_LENGTH,
    max: PASSWORD_MAX_LENGTH,
  });