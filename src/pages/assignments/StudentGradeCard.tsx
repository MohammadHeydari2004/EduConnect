import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { MAX_ASSIGNMENT_GRADE } from "#/configs/constants";
import type { StudentSubmissionStatus } from "#/hooks/useSubmissionsPage";
import type { ID, Submission } from "#/types";
import { formatDate } from "#/utils";

interface StudentGradeCardProps {
  studentStatus: StudentSubmissionStatus;
  savingId: ID | null;
  grading: Record<ID, { grade: string; feedback: string }>;
  handleGradeChange: (
    submissionId: ID,
    field: "grade" | "feedback",
    value: string,
  ) => void;
  handleSaveGrade: (studentStatus: StudentSubmissionStatus) => Promise<void>;
  handleReturnSubmission: (submission: Submission) => Promise<void>;
  getUserEmail: (userId: ID) => string;
}

export default function StudentGradeCard({
  studentStatus,
  savingId,
  grading,
  handleGradeChange,
  handleSaveGrade,
  handleReturnSubmission,
  getUserEmail,
}: StudentGradeCardProps) {
  const { student, submission, isLate, isMissing, canGrade } = studentStatus;
  const isCurrentlySaving = savingId === student.id;
  const currentGrade = submission ? (grading[submission.id]?.grade ?? "") : "0";
  const currentFeedback = submission
    ? (grading[submission.id]?.feedback ?? "")
    : "تکلیف در مهلت ارسال نشده است.";

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="sm:flex-row sm:items-center sm:gap-2 flex flex-col gap-3 pb-2 items-start">
              <span className="font-semibold text-gray-800">
                {student.name}
              </span>
              {isMissing ? (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
                  تحویل داده نشده
                </span>
              ) : submission?.status === "graded" ? (
                <StatusChip status="graded" />
              ) : submission?.status === "returned" ? (
                <StatusChip status="returned" />
              ) : submission?.status === "pending" ? (
                <StatusChip status="pending" />
              ) : submission ? (
                <StatusChip status="submitted" />
              ) : null}
              {isLate && submission && (
                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs">
                  تحویل با تأخیر
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {getUserEmail(student.id)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {submission && (
              <span className="text-gray-500">
                ارسال در: {formatDate(submission.submittedAt)}
              </span>
            )}
            {isMissing && (
              <span className="text-gray-500">پاسخی ارسال نشده</span>
            )}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm font-medium text-gray-700">
            پاسخ دانشجو:
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm break-all whitespace-pre-wrap text-gray-800">
            {submission?.content || (
              <span className="text-gray-400">
                بدون محتوا (پاسخ ارسال نشده)
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Input
              label={`نمره (0 تا ${MAX_ASSIGNMENT_GRADE})`}
              type="number"
              min="0"
              max={MAX_ASSIGNMENT_GRADE}
              step="0.5"
              value={isMissing && !submission ? "0" : currentGrade}
              onChange={(e) =>
                handleGradeChange(
                  submission?.id ?? student.id,
                  "grade",
                  e.target.value,
                )
              }
              placeholder="مثلاً: 18.5"
              disabled={isMissing || !canGrade}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="بازخورد استاد (توضیحات نمره)"
              value={currentFeedback}
              onChange={(e) =>
                handleGradeChange(
                  submission?.id ?? student.id,
                  "feedback",
                  e.target.value,
                )
              }
              placeholder="توضیحات و نکات مربوط به پاسخ دانشجو را اینجا بنویسید..."
              rows={3}
              disabled={isMissing || !canGrade}
            />
          </div>
        </div>
        <div className=" flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-gray-100 sm:pt-3">
          <div className="text-xs text-gray-500" aria-live="polite">
            {isMissing ? (
              <span className="text-gray-500">
                مهلت گذشته، پاسخی ارسال نشده - نمره ۰
              </span>
            ) : submission?.status === "graded" &&
              typeof submission.grade === "number" ? (
              `آخرین نمره ثبت‌شده: ${submission.grade}/${MAX_ASSIGNMENT_GRADE}`
            ) : (
              "هنوز نمره‌ای ثبت نشده است"
            )}
          </div>
          <div className="flex gap-2">
            {canGrade && (
              <Button
                onClick={() => handleSaveGrade(studentStatus)}
                disabled={isCurrentlySaving}
              >
                {isCurrentlySaving
                  ? "در حال ذخیره..."
                  : submission?.status === "graded"
                    ? "به‌روزرسانی نمره"
                    : "ثبت نمره"}
              </Button>
            )}
            {isMissing && !submission && (
              <Button
                onClick={() => handleSaveGrade(studentStatus)}
                disabled={isCurrentlySaving}
              >
                {isCurrentlySaving ? "در حال ذخیره..." : "ثبت نمره ۰ (خودکار)"}
              </Button>
            )}
            {submission?.status === "graded" && (
              <Button
                variant="danger"
                onClick={() => handleReturnSubmission(submission)}
                disabled={isCurrentlySaving}
              >
                بازگشت برای اصلاح
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
