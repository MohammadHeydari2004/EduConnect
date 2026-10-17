import { validateTitle } from "#/utils/validateTitle.ts";

export interface AnnouncementFormErrors {
  title?: string;
  content?: string;
  form?: string;
}

export function validateAnnouncementForm(values: {
  title: string;
  content: string;
}): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};
  const titleError = validateTitle(values.title, {
    titleLabel: "اطلاعیه",
    min: 3,
    max: 100,
  });
  if (titleError) errors.title = titleError;

  if (!values.content.trim()) {
    errors.content = "محتوای اطلاعیه الزامی است.";
  } else if (values.content.trim().length < 10) {
    errors.content = "محتوا باید حداقل ۱۰ کاراکتر باشد.";
  }

  if (errors.title || errors.content) {
    errors.form = "لطفاً خطاهای فرم را برطرف کنید.";
  }

  return errors;
}
