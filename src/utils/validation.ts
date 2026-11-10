export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateName = (value: string | undefined): string | undefined => {
  if (!value || !value.trim()) return "نام الزامی است.";
  const trimmed = value.trim();
  if (trimmed.length < 3) return "نام باید حداقل ۳ کاراکتر باشد.";
  if (trimmed.length > 50) return "نام نباید بیشتر از ۵۰ کاراکتر باشد.";
  return undefined;
};

export const validateEmail = (value: string | undefined): string | undefined => {
  if (!value || !value.trim()) return "ایمیل الزامی است.";
  const trimmed = value.trim();
  if (!emailRegex.test(trimmed)) return "فرمت ایمیل معتبر نیست.";
  if (trimmed.length > 100) return "ایمیل نباید بیشتر از ۱۰۰ کاراکتر باشد.";
  return undefined;
};

export const validatePassword = (value: string | undefined): string | undefined => {
  if (!value) return "رمز عبور الزامی است.";
  if (value.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (value.length > 128) return "رمز عبور نباید بیشتر از ۱۲۸ کاراکتر باشد.";
  return undefined;
};
