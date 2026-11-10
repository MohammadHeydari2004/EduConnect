import {
  MAX_CLASS_CAPACITY,
  MAX_CLASS_DESCRIPTION_LENGTH,
  MAX_CLASS_TITLE_LENGTH,
} from "#/configs/constants";
import type { ClassFormValues, ClassFormErrors } from "#/types/class.ts";
import { validateTitle } from "#/utils/validateTitle.ts";

export function validateClassForm(form: ClassFormValues): ClassFormErrors {
  const newErrors: ClassFormErrors = {};

  const titleError = validateTitle(form.title, {
    titleLabel: "کلاس",
    min: 3,
    max: MAX_CLASS_TITLE_LENGTH,
  });
  if (titleError) newErrors.title = titleError;

  if (!form.teacherId) {
    newErrors.teacherId = "انتخاب استاد الزامی است.";
  }

  if (form.capacity < 1) {
    newErrors.capacity = "ظرفیت باید حداقل ۱ نفر باشد.";
  } else if (form.capacity > MAX_CLASS_CAPACITY) {
    newErrors.capacity = `ظرفیت نمی‌تواند بیشتر از ${MAX_CLASS_CAPACITY} نفر باشد.`;
  }

  if (form.studentIds.length > form.capacity) {
    newErrors.studentIds = `تعداد دانشجویان (${form.studentIds.length}) بیشتر از ظرفیت (${form.capacity}) است.`;
  }

  if (form.description && form.description.length > MAX_CLASS_DESCRIPTION_LENGTH) {
    newErrors.description = `توضیحات نباید بیشتر از ${MAX_CLASS_DESCRIPTION_LENGTH} کاراکتر باشد.`;
  }

  return newErrors;
}
