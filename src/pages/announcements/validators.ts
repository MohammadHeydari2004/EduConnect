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
  if (!values.title.trim() || !values.content.trim()) {
    errors.form = "عنوان و محتوا الزامی است.";
  }
  return errors;
}
