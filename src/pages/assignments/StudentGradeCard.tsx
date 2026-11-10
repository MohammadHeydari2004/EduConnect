import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import type { StudentSubmissionStatus } from "#/pages/assignments/useSubmissionsPage.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { formatDate } from "#/utils/formatDate.ts";

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
  maxAssignmentGrade: number;
}

export default function StudentGradeCard({
  studentStatus,
  savingId,
  grading,
  handleGradeChange,
  handleSaveGrade,
  handleReturnSubmission,
  getUserEmail,
  maxAssignmentGrade,
}: StudentGradeCardProps) {
  const { student, submission, isLate, isMissing, isAutoGraded, canGrade } =
    studentStatus;
  const isCurrentlySaving = savingId === student.id;
  const currentGrade = submission ? (grading[submission.id]?.grade ?? "") : "0";
  const currentFeedback = submission
    ? (grading[submission.id]?.feedback ?? "")
    : "تکلیف در مهلت ارسال نشده است.";

  return (
    <Card key={student.id}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">
                {student.name}
              </span>
              {isAutoGraded && <StatusChip status="graded" />}
              {submission?.status === "graded" && !isAutoGraded && (
                <StatusChip status="graded" />
              )}
              {submission?.status === "returned" && (
                <StatusChip status="returned" />
              )}
              {submission?.status === "pending" && (
                <StatusChip status="pending" />
              )}
              {submission?.status === "submitted" && !isLate && !isMissing && (
                <StatusChip status="submitted" />
              )}
              {isLate && submission && (
                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs">
                  تحویل با تأخیر
                </span>
              )}
              {isMissing && (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
                  تحویل داده نشده
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {getUserEmail(student.id)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isLate && submission && (
              <span className="text-red-600">ارسال با تأخیر</span>
            )}
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
              label={`نمره (0 تا ${maxAssignmentGrade})`}
              type="number"
              min="0"
              max={maxAssignmentGrade}
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
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-500" aria-live="polite">
            {isAutoGraded ? (
              <>
                <span className="text-gray-600">نمره خودکار: </span>
                <span className="font-bold text-red-600">
                  0/{maxAssignmentGrade}
                </span>
                <span className="text-gray-500 ms-2">
                  (مهلت گذشته، پاسخی ارسال نشده)
                </span>
              </>
            ) : isMissing ? (
              <span className="text-gray-500">
                مهلت گذشته، پاسخی ارسال نشده - نمره ۰
              </span>
            ) : submission?.status === "graded" &&
              typeof submission.grade === "number" ? (
              `آخرین نمره ثبت‌شده: ${submission.grade}/${maxAssignmentGrade}`
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
            {submission?.status === "graded" && !isAutoGraded && (
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
