import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import AssignmentForm from "#/pages/assignments/AssignmentForm.tsx";
import TeacherAssignmentsTable from "#/pages/assignments/TeacherAssignmentsTable.tsx";
import { useTeacherAssignmentsPage } from "#/pages/assignments/useTeacherAssignmentsPage";
import AssignmentFilterCard from "#/components/common/AssignmentFilterCard.tsx";
import type { Assignment } from "#/types/assignment.ts";
import { EmptyListState } from "#/components/ui/EmptyListState.tsx";

export default function TeacherAssignmentsPage() {
  const {
    currentUser,
    isAdmin,
    isTeacher,
    isClassPage,
    classId,
    myClasses,
    gradingStatsMap,
    filters,
    setFilters,
    resetFilters,
    filteredAssignments,
    assignmentsLoading,
    assignmentModal,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleDelete,
    handleViewSubmissions,
    getTeacherName,
    getClassName,
    handleAssignmentFormClose,
    handleAssignmentSuccess,
  } = useTeacherAssignmentsPage();

  const hasActiveFilters = Boolean(
    filters.search || filters.classId || filters.status,
  );

  const canManageAssignment = (a: Assignment) => {
    if (!currentUser) return false;
    return currentUser.role === "teacher" && a.teacherId === currentUser.id;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف"}
        </h1>
        {isTeacher && (
          <Button onClick={handleOpenCreate}>ایجاد تکلیف جدید</Button>
        )}
      </div>

      {!isClassPage && (
        <AssignmentFilterCard
          filters={filters}
          onChange={(next) => setFilters({ ...filters, ...next })}
          onReset={resetFilters}
          classes={myClasses}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {assignmentsLoading ? (
        <div className="py-10 text-center text-sm text-gray-500">در حال بارگذاری...</div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyListState
          items={filteredAssignments}
          emptyTitle="تکلیفی وجود ندارد"
          emptyDescription="تکلیفی برای نمایش موجود نیست."
          notFoundTitle="تکلیفی وجود ندارد"
          notFoundDescription="تکلیفی برای نمایش موجود نیست."
        />
      ) : (
        <Card noPadding={true}>
          <TeacherAssignmentsTable
            data={filteredAssignments}
            canManage={canManageAssignment}
            gradingStats={gradingStatsMap}
            getClassName={getClassName}
            getTeacherName={getTeacherName}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
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

      <ConfirmDialog
        isOpen={assignmentModal.isOpen("delete")}
        title="حذف تکلیف"
        message={`آیا از حذف تکلیف "${assignmentModal.target?.title}" مطمئن هستید؟`}
        onClose={handleAssignmentFormClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
