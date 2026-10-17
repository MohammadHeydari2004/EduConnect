import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import Input from "#/components/ui/Input.tsx";
import Select from "#/components/ui/Select.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useModalState } from "#/hooks/useModalState.ts";
import { useToast } from "#/hooks/useToast.ts";
import AssignmentForm from "#/pages/assignments/AssignmentForm.tsx";
import AssignmentsTable from "#/pages/assignments/AssignmentsTable.tsx";
import SubmissionForm from "#/pages/assignments/SubmissionForm";
import { useAssignmentsPageData } from "#/pages/assignments/useAssignmentsPageData.ts";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "#/utils/error.ts";

export default function AssignmentsPage() {
  const assignmentModal = useModalState<Assignment>();
  const submissionModal = useModalState<Submission>();
  const [isDeleting, setIsDeleting] = useState(false);

  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
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
    refreshAssignments,
  } = useAssignmentsPageData();

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    classId: "",
    status: "" as "" | "active" | "expired",
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
  }, [submissions, currentUser?.id]); // Only depend on currentUser.id, not the whole object

  const canManageAssignment = useCallback(
    (a: Assignment) => {
      if (isAdmin) return true;
      if (isTeacher) return a.teacherId === currentUser?.id;
      return false;
    },
    [isAdmin, isTeacher, currentUser?.id],
  );

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

  const handleViewSubmissions = (assignmentId: ID) =>
    navigate(`/assignments/${assignmentId}/submissions`);

  const handleOpenSubmissionForm = (assignment: Assignment) => {
    const isExpired = new Date() > new Date(assignment.deadline);
    if (isExpired) {
      addToast("مهلت ارسال این تکلیف به پایان رسیده است.", "error");
      return;
    }
    submissionModal.setTarget({ assignmentId: assignment.id, ...getSubmissionForUser(assignment.id) } as Submission);
    submissionModal.open("form");
  };

  const handleAssignmentFormClose = () => {
    assignmentModal.close();
  };

  const handleSubmissionFormClose = () => {
    submissionModal.close();
  };

  const handleAssignmentSuccess = () => {
    handleAssignmentFormClose();
    refreshAssignments();
  };

  const handleSubmissionSuccess = () => {
    handleSubmissionFormClose();
    refreshSubmissions();
  };

  const handleDeleteAssignment = async () => {
    const target = assignmentModal.target;
    if (!target) return;
    setIsDeleting(true);
    try {
      await assignmentService.delete(target.id);
      refreshAssignments();
      assignmentModal.close();
      addToast("تکلیف با موفقیت حذف شد.", "success");
    } catch (err) {
      // Action failures must not clobber the loaded list: report via toast and
      // keep the page intact (the `error` state is reserved for the initial fetch).
      addToast(getErrorMessage(err, "حذف تکلیف با خطا مواجه شد."), "error");
      assignmentModal.close();
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a: Assignment) => {
      if (isClassPage && classId && a.classId !== classId) return false;
      if (filters.classId && a.classId !== filters.classId) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!a.title.toLowerCase().includes(searchLower)) return false;
      }
      if (filters.status) {
        const isExpired = new Date() > new Date(a.deadline);
        if (filters.status === "active" && isExpired) return false;
        if (filters.status === "expired" && !isExpired) return false;
      }
      if (isStudent) {
        const cls = classMap.get(a.classId);
        if (!cls || !(cls.studentIds || []).includes(currentUser?.id ?? ""))
          return false;
      } else if (isTeacher) {
        const cls = classMap.get(a.classId);
        if (!cls || cls.teacherId !== currentUser?.id) return false;
      }
      return true;
    });
  }, [
    assignments,
    isClassPage,
    classId,
    isStudent,
    isTeacher,
    classMap,
    currentUser,
    filters,
  ]);

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return classes;
    if (isTeacher) return classes.filter((c) => c.teacherId === currentUser.id);
    if (isStudent)
      return classes.filter((c) =>
        (c.studentIds || []).includes(currentUser.id),
      );
    return [];
  }, [classes, currentUser, isAdmin, isTeacher, isStudent]);

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
  if (error)
    return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف"}
        </h1>
        {(isAdmin || isTeacher) && (
          <Button onClick={() => assignmentModal.open("create")}>
            ایجاد تکلیف جدید
          </Button>
        )}
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
          <AssignmentsTable
            data={filteredAssignments}
            isStudent={isStudent}
            canManage={canManageAssignment}
            getSubmission={getSubmissionForUser}
            gradingStats={gradingStatsMap}
            getClassName={getClassName}
            getTeacherName={getTeacherName}
            onOpenSubmissionForm={handleOpenSubmissionForm}
            onEdit={(a) => assignmentModal.openWithTarget("edit", a)}
            onDelete={(a) => assignmentModal.openWithTarget("delete", a)}
            onViewSubmissions={handleViewSubmissions}
          />
        </Card>
      )}

      {(assignmentModal.isOpen("create") || assignmentModal.isOpen("edit")) && (
        <AssignmentForm
          initialData={assignmentModal.target}
          availableClasses={myClasses}
          teacherId={currentUser?.id ?? ""}
          isAdmin={isAdmin}
          onClose={handleAssignmentFormClose}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {submissionFormProps && (
        <SubmissionForm {...submissionFormProps} />
      )}

      <ConfirmDialog
        isOpen={assignmentModal.isOpen("delete")}
        title="حذف تکلیف"
        message={`آیا از حذف تکلیف "${assignmentModal.target?.title}" مطمئن هستید؟`}
        onClose={handleAssignmentFormClose}
        onConfirm={handleDeleteAssignment}
        isLoading={isDeleting}
      />
    </div>
  );
}
