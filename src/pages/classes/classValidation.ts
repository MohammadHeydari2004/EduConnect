import type { ClassFormValues } from "#/types/class.ts";

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
