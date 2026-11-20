import { validateTitle } from "#/utils";
import { MAX_CLASS_TITLE_LENGTH } from "#/configs/constants";
import type { AnnouncementFormErrors } from "#/types";

export function validateAnnouncementForm(values: {
  title: string;
  content: string;
}): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};
  const titleError = validateTitle(values.title, {
    titleLabel: "اطلاعیه",
    max: MAX_CLASS_TITLE_LENGTH,
  });
  if (titleError) errors.title = titleError;

  if (!values.content.trim()) {
    errors.content = "محتوای اطلاعیه الزامی است.";
  } else if (values.content.trim().length < 10) {
    errors.content = "محتوا باید حداقل ۱۰ کاراکتر باشد.";
  }

  return errors;
}
