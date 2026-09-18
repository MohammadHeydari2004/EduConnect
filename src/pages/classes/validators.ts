import type { ClassFormValues } from "#/types/class.ts";
import type { SessionFormValues } from "#/types/session.ts";

export interface ClassFormErrors {
  title?: string;
  teacherId?: string;
  capacity?: string;
  students?: string;
  form?: string;
}

export function validateClassForm(form: ClassFormValues): ClassFormErrors {
  const newErrors: ClassFormErrors = {};
  if (!form.title.trim()) {
    newErrors.title = "عنوان الزامی است.";
  } else if (form.title.trim().length < 3) {
    newErrors.title = "عنوان باید حداقل 3 کاراکتر باشد.";
  }
  if (!form.teacherId) newErrors.teacherId = "انتخاب استاد الزامی است.";
  if (form.capacity < 1) newErrors.capacity = "ظرفیت باید حداقل 1 باشد.";
  if (form.studentIds.length > form.capacity) {
    newErrors.students = `تعداد دانشجویان (${form.studentIds.length}) بیشتر از ظرفیت (${form.capacity}) است.`;
  }
  return newErrors;
}

export interface SessionFormErrors {
  title?: string;
  date?: string;
  form?: string;
}

export function validateSessionForm(
  values: SessionFormValues,
): SessionFormErrors {
  const newErrors: SessionFormErrors = {};
  if (!values.title.trim()) {
    newErrors.title = "عنوان الزامی است.";
  } else if (values.title.trim().length < 3) {
    newErrors.title = "عنوان باید حداقل 3 کاراکتر باشد.";
  }
  if (!values.date) newErrors.date = "تاریخ الزامی است.";
  return newErrors;
}
