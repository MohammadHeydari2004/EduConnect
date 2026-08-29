import { useState } from "react";
import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { submissionService } from "#/services/modules/submissionService.ts";
import type { Submission } from "#/types/submission.ts";

interface Props {
  isOpen: boolean;
  assignmentId: number | string;
  studentId: number | string;
  existingSubmission?: Submission | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function SubmissionForm({
  isOpen,
  assignmentId,
  studentId,
  existingSubmission,
  onClose,
  onSuccess,
}: Props) {
  const [content, setContent] = useState(existingSubmission?.content ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("پاسخ شما نمی‌تواند خالی باشد.");
      return;
    }
    try {
      setIsSubmitting(true);
      if (existingSubmission) {
        await submissionService.update(existingSubmission.id, { content });
        onSuccess("پاسخ شما با موفقیت ویرایش شد.");
      } else {
        await submissionService.create({
          assignmentId: Number(assignmentId),
          studentId: Number(studentId),
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
        <Textarea
          label="پاسخ شما (متن، لینک یا آدرس GitHub)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="پاسخ خود را وارد کنید..."
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "در حال ارسال..."
              : existingSubmission
                ? "به‌روزرسانی"
                : "ارسال"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
