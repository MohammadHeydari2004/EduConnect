import { isDateBeforeToday, validateTitle } from "#/utils";
import type { AssignmentFormErrors, ID, SubmissionFormErrors } from "#/types";

export function validateAssignmentForm(values: {
  title: string;
  deadline: string;
  classId: ID;
  originalDeadline?: string;
}): AssignmentFormErrors {
  const errors: AssignmentFormErrors = {};
  const titleError = validateTitle(values.title, {
    titleLabel: "تکلیف",
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

  return errors;
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

  return errors;
}
