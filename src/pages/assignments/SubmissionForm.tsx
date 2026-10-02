import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { isApiError } from "#/services/api/axiosInstance.ts";
import { submissionService } from "#/services/submission.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useId, useState } from "react";
import { validateSubmissionForm } from "./validators";

interface Props {
  isOpen: boolean;
  assignmentId: ID;
  studentId: ID;
  existingSubmission?: Submission | null;
  deadline?: string;
  onClose: () => void;
  onSuccess: (message: string, submission: Submission) => void;
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
  const textareaId = useId();
  const errorId = `${textareaId}-error`;

  const [content, setContent] = useState(existingSubmission?.content ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false;
  const deadlineLabel = deadline ? formatDate(deadline) : null;
  const isReadOnly = isDeadlinePassed && !!existingSubmission;
  const isBlocked = isDeadlinePassed && !existingSubmission;

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
      let result: Submission;

      if (existingSubmission) {
        result = await submissionService.update(existingSubmission.id, {
          content: content.trim(),
        });
        onSuccess("پاسخ شما با موفقیت ویرایش شد.", result);
      } else {
        result = await submissionService.create({
          assignmentId,
          studentId,
          content: content.trim(),
          status: "submitted",
        });
        onSuccess("پاسخ شما با موفقیت ارسال شد.", result);
      }
    } catch (err) {
      // استفاده از isApiError برای مدیریت هوشمند خطاها
      const message = isApiError(err)
        ? err.userMessage
        : "خطا در ثبت پاسخ. لطفاً دوباره تلاش کنید.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setError("مرورگر شما از قابلیت کپی خودکار پشتیبانی نمی‌کند.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={
        isReadOnly
          ? "مشاهده پاسخ ارسال‌شده"
          : existingSubmission
            ? "ویرایش پاسخ"
            : "ارسال پاسخ"
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        {deadlineLabel && (
          <>
            {isBlocked && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      مهلت ارسال به پایان رسیده است
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      شما پاسخی ارسال نکرده‌اید و دیگر امکان ارسال وجود ندارد.
                      (مهلت: {deadlineLabel})
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isReadOnly && (
              <div
                className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                role="status"
              >
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      مهلت ویرایش به پایان رسیده است
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      شما قبلاً پاسخی ارسال کرده‌اید، اما به دلیل پایان مهلت (
                      {deadlineLabel}) امکان ویرایش وجود ندارد. پاسخ شما در زیر
                      قابل مشاهده و کپی است.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!isDeadlinePassed && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                مهلت ارسال:{" "}
                <span className="font-semibold">{deadlineLabel}</span>
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-gray-700"
            >
              {isReadOnly
                ? "پاسخ ارسال‌شده شما (فقط خواندنی)"
                : "پاسخ شما (متن، لینک یا آدرس GitHub)"}
            </label>
            {isReadOnly && content && (
              <button
                type="button"
                onClick={handleCopyContent}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                disabled={isCopied}
              >
                {isCopied ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-600">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    کپی پاسخ
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            id={textareaId}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            rows={6}
            placeholder={
              isBlocked ? "پاسخی ارسال نشده است..." : "پاسخ خود را وارد کنید..."
            }
            readOnly={isReadOnly || isBlocked}
            disabled={isBlocked}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus:ring-2 ${isReadOnly ? "cursor-text border-amber-300 bg-amber-50/50 text-gray-800 focus:ring-amber-100" : isBlocked ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400" : error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}`}
          />
        </div>

        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {existingSubmission?.status === "graded" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-green-800">
                نمره نهایی: {existingSubmission.grade}/20
              </span>
              <StatusChip status="graded" />
            </div>
            {existingSubmission.feedback && (
              <div className="mt-2 border-t border-green-200 pt-2">
                <p className="mb-1 text-xs font-medium text-green-700">
                  بازخورد استاد:
                </p>
                <p className="text-sm whitespace-pre-wrap text-green-800">
                  {existingSubmission.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {isReadOnly ? "بستن" : "انصراف"}
          </Button>
          {!isReadOnly && !isBlocked && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "در حال ارسال..."
                : existingSubmission
                  ? "به‌روزرسانی"
                  : "ارسال"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
