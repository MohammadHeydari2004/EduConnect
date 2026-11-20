import type { SessionFormErrors, SessionFormValues } from "#/types";
import { validateTitle } from "#/utils";
import {
  MAX_CLASS_DESCRIPTION_LENGTH,
  MAX_CLASS_TITLE_LENGTH,
} from "#/configs/constants";

export function validateSessionForm(
  values: SessionFormValues,
): SessionFormErrors {
  const newErrors: SessionFormErrors = {};

  const titleError = validateTitle(values.title, {
    titleLabel: "جلسه",
    max: MAX_CLASS_TITLE_LENGTH,
  });
  if (titleError) newErrors.title = titleError;

  if (!values.date) {
    newErrors.date = "تاریخ جلسه الزامی است.";
  } else {
    const dateObj = new Date(values.date);
    if (isNaN(dateObj.getTime())) {
      newErrors.date = "تاریخ وارد شده معتبر نیست.";
    }
  }

  if (values.description && values.description.length > MAX_CLASS_DESCRIPTION_LENGTH) {
    newErrors.description = `توضیحات نباید بیشتر از ${MAX_CLASS_DESCRIPTION_LENGTH} کاراکتر باشد.`;
  }

  if (!values.classId) {
    newErrors.form = "شناسه کلاس نامعتبر است. لطفاً صفحه را رفرش کنید.";
  }

  return newErrors;
}
