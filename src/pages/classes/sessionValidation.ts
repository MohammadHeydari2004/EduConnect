import type { SessionFormValues } from "#/types/session.ts";

export interface SessionFormErrors {
  title?: string;
  date?: string;
  description?: string;
  form?: string;
}

export function validateSessionForm(
  values: SessionFormValues,
): SessionFormErrors {
  const newErrors: SessionFormErrors = {};

  const title = values.title.trim();
  if (!title) {
    newErrors.title = "عنوان جلسه الزامی است.";
  } else if (title.length < 3) {
    newErrors.title = "عنوان باید حداقل ۳ کاراکتر باشد.";
  } else if (title.length > 100) {
    newErrors.title = "عنوان نباید بیشتر از ۱۰۰ کاراکتر باشد.";
  }

  if (!values.date) {
    newErrors.date = "تاریخ جلسه الزامی است.";
  } else {
    const dateObj = new Date(values.date);
    if (isNaN(dateObj.getTime())) {
      newErrors.date = "تاریخ وارد شده معتبر نیست.";
    }
  }

  if (values.description && values.description.length > 500) {
    newErrors.description = "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد.";
  }

  if (!values.classId) {
    newErrors.form = "شناسه کلاس نامعتبر است. لطفاً صفحه را رفرش کنید.";
  }

  return newErrors;
}
