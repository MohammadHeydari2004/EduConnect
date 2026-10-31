import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { useToast } from "#/hooks/useToast.ts";
import {
  validateSubmissionForm,
  type SubmissionFormErrors,
} from "#/pages/assignments/validators.ts";
import { submissionService } from "#/services/submission.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useMemo, useState } from "react";

interface Props {
  assignmentId: ID;
  studentId: ID;
  existingSubmission: Submission | null;
  deadline: string;
  onClose: () => void;
  onSuccess: (submission: Submission) => void;
}

export default function SubmissionForm({
  assignmentId,
  studentId,
  existingSubmission,
  deadline,
  onClose,
  onSuccess,
}: Props) {
  const [content, setContent] = useState(existingSubmission?.content ?? "");
  const [errors, setErrors] = useState<SubmissionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const isDeadlinePassed = useMemo(
    () => new Date() > new Date(deadline),
    [deadline],
  );

  const isReadOnly =
    isDeadlinePassed || existingSubmission?.status === "graded";

  const isReturned = existingSubmission?.status === "returned";

  const handleSubmit = async () => {
    const validationErrors = validateSubmissionForm(
      { content },
      isDeadlinePassed,
    );
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      let result: Submission;

      if (existingSubmission) {
        result = await submissionService.update(existingSubmission.id, {
          content: content.trim(),
          status: "submitted",
        });
        addToast("پاسخ شما با موفقیت ویرایش شد.", "success");
      } else {
        result = await submissionService.create({
          assignmentId,
          studentId,
          content: content.trim(),
          status: "submitted",
        });
        addToast("پاسخ شما با موفقیت ارسال شد.", "success");
      }
      onSuccess(result);
    } catch (err) {
      const message = getErrorMessage(
        err,
        "خطا در ذخیره پاسخ. لطفاً دوباره تلاش کنید.",
      );
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        isReturned
          ? "پاسخ مجدد"
          : existingSubmission
            ? "ویرایش پاسخ"
            : "ارسال پاسخ"
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        {isDeadlinePassed && (
          <div
            className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
            role="alert"
          >
            مهلت ارسال این تکلیف به پایان رسیده است.
          </div>
        )}

        {existingSubmission?.status === "graded" && (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="alert"
          >
            این پاسخ نمره داده شده است و امکان ویرایش آن وجود ندارد.
          </div>
        )}

        {isReturned && (
          <div
            className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
            role="alert"
          >
            این پاسخ توسط استاد برگشت داده شده است. لطفاً پاسخ خود را اصلاح و
            مجدداً ارسال کنید.
          </div>
        )}

        {existingSubmission && (
          <p className="text-xs text-gray-500">
            تاریخ ارسال اولیه: {formatDate(existingSubmission.submittedAt)}
          </p>
        )}

        <Textarea
          label="پاسخ شما"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content || errors.form) {
              setErrors((prev) => ({
                ...prev,
                content: "",
                form: "",
              }));
            }
          }}
          error={errors.content}
          placeholder="پاسخ خود را اینجا بنویسید یا لینک فایل را قرار دهید..."
          rows={6}
          readOnly={isReadOnly}
          required={!isReadOnly}
        />

        {errors.form && (
          <p className="text-sm text-red-600" role="alert">
            {errors.form}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {isReadOnly ? "بستن" : "انصراف"}
          </Button>

          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "ذخیره پاسخ"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
