import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Input from "#/components/ui/Input.tsx";
import Select from "#/components/ui/Select.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useFilter, type FilterConfig, createStringContainsFilter, createExactMatchFilter, createDateStatusFilter } from "#/hooks/useFilter.ts";
import { useToast } from "#/hooks/useToast.ts";
import StudentAssignmentsTable from "#/pages/assignments/StudentAssignmentsTable.tsx";
import SubmissionForm from "#/pages/assignments/SubmissionForm";
import { useAssignmentsPageData } from "#/pages/assignments/useAssignmentsPageData.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

interface AssignmentFilters {
  search: string;
  classId: string;
  status: "" | "active" | "expired";
  [key: string]: string;
}

export default function StudentAssignmentsPage() {
  const submissionModal = useModalState<Submission>();

  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const {
    classes,
    submissions,
    assignments,
    userMap,
    classMap,
    gradingStatsMap,
    loading,
    error,
    refreshSubmissions,
    setSubmissionsOptimistic,
  } = useAssignmentsPageData();

  const isStudent = currentUser?.role === "student";
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  const [filters, setFilters] = useState<AssignmentFilters>({
    search: "",
    classId: "",
    status: "",
  });

  const assignmentMap = useMapById(assignments);

  const submissionMap = useMemo(() => {
    const map = new Map<ID, Submission>();
    if (currentUser) {
      submissions.forEach((s: Submission) => {
        if (s.studentId === currentUser.id) {
          map.set(s.assignmentId, s);
        }
      });
    }
    return map;
  }, [submissions, currentUser?.id]);

  const getSubmissionForUser = useCallback(
    (assignmentId: ID) => submissionMap.get(assignmentId),
    [submissionMap],
  );

  const getTeacherName = useCallback(
    (teacherId: ID) => userMap.get(teacherId)?.name ?? "—",
    [userMap],
  );

  const getClassName = useCallback(
    (cId: ID) => classMap.get(cId)?.title ?? "—",
    [classMap],
  );

  const handleOpenSubmissionForm = (assignment: Assignment) => {
    const isExpired = new Date() > new Date(assignment.deadline);
    if (isExpired) {
      addToast("مهلت ارسال این تکلیف به پایان رسیده است.", "error");
      return;
    }
    submissionModal.setTarget({ assignmentId: assignment.id, ...getSubmissionForUser(assignment.id) } as Submission);
    submissionModal.open("form");
  };

  const handleSubmissionFormClose = () => {
    submissionModal.close();
  };

  const handleSubmissionSuccess = useCallback(
    (submission: Submission) => {
      handleSubmissionFormClose();
      // Optimistically update the submissions list
      setSubmissionsOptimistic((prev) => {
        const existingIndex = prev.findIndex(
          (s) => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = submission;
          return updated;
        }
        return [...prev, submission];
      });
      refreshSubmissions();
    },
    [handleSubmissionFormClose, refreshSubmissions, setSubmissionsOptimistic],
  );

  const filterConfigs = useMemo<FilterConfig<Assignment>[]>(
    () => [
      createStringContainsFilter<Assignment>("search", (assignment) => assignment.title),
      createExactMatchFilter<Assignment>("classId", (assignment) => assignment.classId),
      createDateStatusFilter<Assignment>("status", (assignment) => assignment.deadline),
    ],
    [],
  );

  const extraPredicate = useCallback(
    (assignment: Assignment) => {
      if (isClassPage && classId && assignment.classId !== classId) return false;
      if (isStudent) {
        const cls = classMap.get(assignment.classId);
        if (!cls || !(cls.studentIds || []).includes(currentUser?.id ?? "")) return false;
      }
      return true;
    },
    [isClassPage, classId, isStudent, classMap, currentUser],
  );

  const filteredAssignments = useFilter({
    data: assignments,
    filters,
    filterConfigs,
    extraPredicate,
  });

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isStudent)
      return classes.filter((c) =>
        (c.studentIds || []).includes(currentUser.id),
      );
    return [];
  }, [classes, currentUser, isStudent]);

  const submissionFormProps = useMemo(() => {
    if (!submissionModal.isOpen("form") || !currentUser) return null;
    const target = submissionModal.target;
    const assignmentId = target?.assignmentId ?? "";
    const existingSubmission = target?.id ? target : null;
    const deadline = assignmentMap.get(assignmentId)?.deadline ?? "";
    return {
      key: `submission-form-${assignmentId}`,
      assignmentId,
      studentId: currentUser.id,
      existingSubmission,
      deadline,
      onClose: handleSubmissionFormClose,
      onSuccess: handleSubmissionSuccess,
    };
  }, [submissionModal, currentUser, assignmentMap, handleSubmissionFormClose, handleSubmissionSuccess]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف من"}
        </h1>
      </div>

      {!isClassPage && (
        <Card className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="جستجوی عنوان"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="جستجو..."
            />
            {!isClassPage && (
              <Select
                label="کلاس"
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                options={[
                  { value: "", label: "همه کلاس‌ها" },
                  ...myClasses.map((c) => ({ value: c.id, label: c.title || "(بدون عنوان)" })),
                ]}
              />
            )}
            <Select
              label="وضعیت"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as "" | "active" | "expired" })}
              options={[
                { value: "", label: "همه" },
                { value: "active", label: "فعال" },
                { value: "expired", label: "منقضی شده" },
              ]}
            />
          </div>
          {(filters.search || filters.classId || filters.status) && (
            <Button
              variant="secondary"
              className="mt-2"
              onClick={() => setFilters({ search: "", classId: "", status: "" })}
            >
              پاک کردن فیلترها
            </Button>
          )}
        </Card>
      )}

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="تکلیفی وجود ندارد"
          description="تکلیفی برای نمایش موجود نیست."
        />
      ) : (
        <Card noPadding={true}>
          <StudentAssignmentsTable
            data={filteredAssignments}
            getSubmission={getSubmissionForUser}
            gradingStats={gradingStatsMap}
            getClassName={getClassName}
            getTeacherName={getTeacherName}
            onOpenSubmissionForm={handleOpenSubmissionForm}
          />
        </Card>
      )}

      {submissionFormProps && (
        <SubmissionForm {...submissionFormProps} />
      )}
    </div>
  );
}