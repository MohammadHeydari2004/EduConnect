import type { ClassFormValues } from "#/types/class.ts";
import type { SessionFormValues } from "#/types/session.ts";

export interface ClassFormErrors {
  title?: string;
  teacherId?: string;
  capacity?: string;
  students?: string;
  description?: string;
  form?: string;
}

export function validateClassForm(form: ClassFormValues): ClassFormErrors {
  const newErrors: ClassFormErrors = {};

  const title = form.title.trim();
  if (!title) {
    newErrors.title = "عنوان کلاس الزامی است.";
  } else if (title.length < 3) {
    newErrors.title = "عنوان باید حداقل ۳ کاراکتر باشد.";
  } else if (title.length > 100) {
    newErrors.title = "عنوان نباید بیشتر از ۱۰۰ کاراکتر باشد.";
  }

  if (!form.teacherId) {
    newErrors.teacherId = "انتخاب استاد الزامی است.";
  }

  if (form.capacity < 1) {
    newErrors.capacity = "ظرفیت باید حداقل ۱ نفر باشد.";
  } else if (form.capacity > 1000) {
    newErrors.capacity = "ظرفیت نمی‌تواند بیشتر از ۱۰۰۰ نفر باشد.";
  }

  if (form.studentIds.length > form.capacity) {
    newErrors.students = `تعداد دانشجویان (${form.studentIds.length}) بیشتر از ظرفیت (${form.capacity}) است.`;
  }

  if (form.description && form.description.length > 500) {
    newErrors.description = "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد.";
  }

  return newErrors;
}

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
