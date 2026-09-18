import type { ID } from "#/types/common.ts";

export interface AssignmentFormErrors {
  title?: string;
  deadline?: string;
  classId?: string;
  form?: string;
}

export function validateAssignmentForm(values: {
  title: string;
  deadline: string;
  classId: ID;
}): AssignmentFormErrors {
  const errors: AssignmentFormErrors = {};
  if (!values.title.trim() || !values.deadline || !values.classId) {
    errors.form = "عنوان، ددلاین و انتخاب کلاس الزامی هستند.";
  }
  return errors;
}

export interface SubmissionFormErrors {
  content?: string;
  form?: string;
}

export function validateSubmissionForm(
  values: { content: string },
  isDeadlinePassed: boolean,
): SubmissionFormErrors {
  const errors: SubmissionFormErrors = {};
  if (!values.content.trim()) errors.content = "پاسخ شما نمی‌تواند خالی باشد.";
  if (isDeadlinePassed)
    errors.form = "مهلت ارسال این تکلیف به پایان رسیده است.";
  return errors;
}
