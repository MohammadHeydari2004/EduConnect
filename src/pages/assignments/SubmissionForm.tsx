import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { submissionService } from "#/services/submission.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useState } from "react";
import { validateSubmissionForm } from "./validators";

interface Props {
  isOpen: boolean;
  assignmentId: ID;
  studentId: ID;
  existingSubmission?: Submission | null;
  deadline?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function SubmissionForm({
  isOpen,
  assignmentId,
  studentId,
  existingSubmission,
  deadline,
  onClose,
  onSuccess,
}: Props) {
  const [content, setContent] = useState(existingSubmission?.content ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDeadlinePassed =
    deadline && !existingSubmission ? new Date() > new Date(deadline) : false;
  const deadlineLabel = deadline ? formatDate(deadline) : null;

  const handleSubmit = async () => {
    const validationErrors = validateSubmissionForm(
      { content },
      isDeadlinePassed,
    );

    if (validationErrors.content) {
      setError(validationErrors.content);
      return;
    }
    if (validationErrors.form) {
      setError(validationErrors.form);
      return;
    }

    try {
      setIsSubmitting(true);
      if (existingSubmission) {
        await submissionService.update(existingSubmission.id, { content });
        onSuccess("پاسخ شما با موفقیت ویرایش شد.");
      } else {
        await submissionService.create({
          assignmentId,
          studentId,
          content: content.trim(),
          status: "submitted",
        });
        onSuccess("پاسخ شما با موفقیت ارسال شد.");
      }
    } catch {
      setError("خطا در ثبت پاسخ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={existingSubmission ? "ویرایش پاسخ" : "ارسال پاسخ"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {deadlineLabel && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${isDeadlinePassed ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}
          >
            {isDeadlinePassed
              ? `مهلت ارسال به پایان رسیده است (${deadlineLabel})`
              : `مهلت ارسال: ${deadlineLabel}`}
          </div>
        )}
        <Textarea
          label="پاسخ شما (متن، لینک یا آدرس GitHub)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="پاسخ خود را وارد کنید..."
          disabled={isDeadlinePassed}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isDeadlinePassed}
          >
            {isSubmitting
              ? "در حال ارسال..."
              : isDeadlinePassed
                ? "مهلت به پایان رسیده"
                : existingSubmission
                  ? "به‌روزرسانی"
                  : "ارسال"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
