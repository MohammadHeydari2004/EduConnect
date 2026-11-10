import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import { useSubmissionsPage } from "#/pages/assignments/useSubmissionsPage.ts";
import StudentGradeCard from "#/pages/assignments/StudentGradeCard.tsx";
import { MAX_ASSIGNMENT_GRADE } from "#/configs/constants";
import { formatDate } from "#/utils/formatDate.ts";
import { useNavigate } from "react-router-dom";

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const {
    assignment,
    studentStatuses,
    loading,
    error,
    gradedCount,
    isDeadlinePassed,
    getUserEmail,
    getClassName,
    grading,
    savingId,
    handleGradeChange,
    handleSaveGrade,
    handleReturnSubmission,
  } = useSubmissionsPage();

  if (loading) return <Loading />;

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/assignments")}
          >
            → بازگشت
          </Button>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
            پاسخ‌های تکلیف: {assignment?.title}
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          تعداد کل دانشجوها: <span className="font-bold">{studentStatuses.length}</span>
        </div>
      </div>

      {assignment && (
        <Card title="اطلاعات تکلیف">
          <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span className="text-gray-500">کلاس:</span>{" "}
              <span className="font-medium">
                {getClassName(assignment.classId)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ددلاین:</span>{" "}
              <span
                className={`font-medium ${isDeadlinePassed ? "text-red-600" : ""}`}
              >
                {formatDate(assignment.deadline)}
                {isDeadlinePassed && (
                  <span className="me-1 text-xs">(منقضی شده)</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">تسلیم‌شده:</span>{" "}
              <span className="font-medium">
                {studentStatuses.filter((s) => s.submission).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">تصحیح‌شده:</span>{" "}
              <span className="font-medium text-green-600">{gradedCount}</span>
            </div>
          </div>
          {assignment.description && (
            <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-700">
              <span className="font-medium">توضیحات:</span>{" "}
              {assignment.description}
            </div>
          )}
        </Card>
      )}

      {studentStatuses.length === 0 ? (
        <EmptyState
          title="دانشجویی در این کلاس نیست"
          description="هنوز دانشجو به این کلاس اضافه نشده است."
        />
      ) : (
        <div className="grid gap-4">
          {studentStatuses.map((studentStatus) => (
            <StudentGradeCard
              key={studentStatus.student.id}
              studentStatus={studentStatus}
              savingId={savingId}
              grading={grading}
              handleGradeChange={handleGradeChange}
              handleSaveGrade={handleSaveGrade}
              handleReturnSubmission={handleReturnSubmission}
              getUserEmail={getUserEmail}
              maxAssignmentGrade={MAX_ASSIGNMENT_GRADE}
            />
          ))}
        </div>
      )}
    </div>
  );
}