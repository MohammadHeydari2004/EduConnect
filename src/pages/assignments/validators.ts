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
  const title = values.title.trim();

  if (!title) {
    errors.title = "عنوان تکلیف الزامی است.";
  } else if (title.length < 3) {
    errors.title = "عنوان باید حداقل ۳ کاراکتر باشد.";
  }

  if (!values.classId) {
    errors.classId = "انتخاب کلاس الزامی است.";
  }

  if (!values.deadline) {
    errors.deadline = "تعیین ددلاین الزامی است.";
  } else {
    const selectedDate = new Date(values.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.deadline = "ددلاین نمی‌تواند در گذشته باشد.";
    }
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
