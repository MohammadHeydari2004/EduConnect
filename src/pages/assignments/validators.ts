import type { ID } from "#/types/common.ts";
import { isDateBeforeToday } from "#/utils/formatDate.ts";
import { validateTitle } from "#/utils/validateTitle.ts";

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
  originalDeadline?: string;
}): AssignmentFormErrors {
  const errors: AssignmentFormErrors = {};
  const titleError = validateTitle(values.title, {
    titleLabel: "تکلیف",
    min: 3,
  });
  if (titleError) errors.title = titleError;

  if (!values.classId) {
    errors.classId = "انتخاب کلاس الزامی است.";
  }

  if (!values.deadline) {
    errors.deadline = "تعیین ددلاین الزامی است.";
  } else if (
    isDateBeforeToday(values.deadline) &&
    values.originalDeadline !== values.deadline
  ) {
    errors.deadline = "ددلاین نمی‌تواند در گذشته باشد.";
  }

  if (Object.keys(errors).length > 0) {
    errors.form = "لطفاً خطاهای فرم را برطرف کنید.";
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

  if (isDeadlinePassed) {
    errors.form = "مهلت ارسال این تکلیف به پایان رسیده است.";
    return errors;
  }

  if (!values.content.trim()) {
    errors.content = "پاسخ شما نمی‌تواند خالی باشد.";
  }

  if (Object.keys(errors).length > 0) {
    errors.form = "لطفاً خطاهای فرم را برطرف کنید.";
  }

  return errors;
}
