import Loading from "#/components/common/Loading.tsx";
import { EmptyListState } from "#/components/ui/EmptyListState.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Card from "#/components/ui/Card.tsx";
import {
  assignmentFilterConfigs,
  initialAssignmentFilters,
  TOAST_MESSAGES,
} from "#/configs/constants";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useAssignmentsPageData } from "#/hooks/useAssignmentsPageData";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { useFilter } from "#/hooks/useFilter.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import AssignmentFilterCard from "#/components/common/AssignmentFilterCard.tsx";
import StudentAssignmentsTable from "#/pages/assignments/StudentAssignmentsTable.tsx";
import SubmissionForm from "#/pages/assignments/SubmissionForm";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment, AssignmentFilters } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { NewSubmissionDraft, Submission } from "#/types/submission.ts";
import {
  getClassNameFromMap,
  getUserNameFromMap,
} from "#/utils/nameHelpers.ts";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentAssignmentsPage() {
  const submissionModal = useModalState<Submission | NewSubmissionDraft>();

  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const {
    classes,
    submissions,
    userMap,
    classMap,
    loading,
    error,
    refreshSubmissions,
  } = useAssignmentsPageData();

  const isStudent = currentUser?.role === "student";
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  const [filters, setFilters] = useState<AssignmentFilters>(
    initialAssignmentFilters,
  );

  const {
    data: assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useAsyncData<Assignment[]>({
    fetcher: (signal) => assignmentService.getAll(undefined, signal),
    deps: [],
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
  });

  const filteredAssignments = useFilter({
    data: assignments,
    filters,
    filterConfigs: assignmentFilterConfigs,
    extraPredicate: (assignment: Assignment) => {
      if (isClassPage && classId && assignment.classId !== classId)
        return false;
      if (isStudent && currentUser) {
        const cls = classMap.get(assignment.classId);
        if (!cls || !(cls.studentIds || []).includes(currentUser.id))
          return false;
      }
      return true;
    },
  });

  const assignmentMap = useMapById(assignments ?? []);

  const submissionMap = useMemo(() => {
    const map = new Map<ID, Submission>();
    submissions.forEach((s: Submission) => {
      if (s.studentId === currentUser?.id) {
        map.set(s.assignmentId, s);
      }
    });
    return map;
  }, [submissions, currentUser?.id]);

  const getSubmissionForUser = useCallback(
    (assignmentId: ID) => submissionMap.get(assignmentId),
    [submissionMap],
  );

  const getTeacherName = (userId: ID) => getUserNameFromMap(userMap, userId);
  const getClassName = (classId: ID) => getClassNameFromMap(classMap, classId);

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isStudent)
      return classes.filter((c) =>
        (c.studentIds || []).includes(currentUser.id),
      );
    return [];
  }, [classes, currentUser, isStudent]);

  const handleOpenSubmissionForm = (assignment: Assignment) => {
    const isExpired = new Date() > new Date(assignment.deadline);
    if (isExpired) {
      addToast("مهلت ارسال این تکلیف به پایان رسیده است.", "error");
      return;
    }
    const existing = getSubmissionForUser(assignment.id);
    const target: Submission | NewSubmissionDraft = existing
      ? existing
      : { assignmentId: assignment.id };
    submissionModal.setTarget(target);
    submissionModal.open("form");
  };

  const handleSubmissionFormClose = useCallback(() => {
    submissionModal.close();
  }, [submissionModal]);

  const handleSubmissionSuccess = useCallback(() => {
    handleSubmissionFormClose();
    refreshSubmissions();
  }, [handleSubmissionFormClose, refreshSubmissions]);

  const submissionFormProps = useMemo(() => {
    if (!submissionModal.isOpen("form") || !currentUser) return null;
    const target = submissionModal.target;
    const assignmentId = target?.assignmentId ?? "";
    const existingSubmission = target && "id" in target && target.id ? target : null;
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
  }, [
    submissionModal,
    currentUser,
    assignmentMap,
    handleSubmissionFormClose,
    handleSubmissionSuccess,
  ]);

  if (loading || assignmentsLoading) return <Loading />;
  if (error || assignmentsError)
    return <ErrorAlert message={error || assignmentsError} />;

  const hasActiveFilters = Boolean(
    filters.search || filters.classId || filters.status,
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف من"}
        </h1>
      </div>

      {!isClassPage && (
        <AssignmentFilterCard
          filters={filters}
          onChange={(next) => setFilters({ ...filters, ...next })}
          onReset={() => setFilters(initialAssignmentFilters)}
          classes={myClasses}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {filteredAssignments.length === 0 ? (
        <EmptyListState
          items={filteredAssignments}
          emptyTitle="تکلیفی وجود ندارد"
          emptyDescription="تکلیفی برای نمایش موجود نیست."
          notFoundTitle="تکلیفی وجود ندارد"
          notFoundDescription="تکلیفی برای نمایش موجود نیست."
        />
      ) : (
        <Card noPadding={true}>
          <StudentAssignmentsTable
            data={filteredAssignments}
            getSubmission={getSubmissionForUser}
            getClassName={getClassName}
            getTeacherName={getTeacherName}
            onOpenSubmissionForm={handleOpenSubmissionForm}
          />
        </Card>
      )}

      {submissionFormProps && <SubmissionForm {...submissionFormProps} />}
    </div>
  );
}
