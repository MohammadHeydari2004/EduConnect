import EmptyState from "#/components/common/EmptyState.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import Input from "#/components/ui/Input.tsx";
import Select from "#/components/ui/Select.tsx";
import AssignmentForm from "#/pages/assignments/AssignmentForm.tsx";
import TeacherAssignmentsTable from "#/pages/assignments/TeacherAssignmentsTable.tsx";
import { useTeacherAssignmentsPage } from "#/pages/assignments/useTeacherAssignmentsPage";

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
    canManageAssignment,
  } = useTeacherAssignmentsPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف"}
        </h1>
        {(isAdmin || isTeacher) && (
          <Button onClick={handleOpenCreate}>ایجاد تکلیف جدید</Button>
        )}
      </div>

      {!isClassPage && (
        <Card className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <Input
              label="جستجوی عنوان"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="جستجو..."
            />
            {!isClassPage && (
              <Select
                label="کلاس"
                value={filters.classId}
                onChange={(e) =>
                  setFilters({ ...filters, classId: e.target.value })
                }
                options={[
                  { value: "", label: "همه کلاس‌ها" },
                  ...myClasses.map((c) => ({
                    value: c.id,
                    label: c.title || "(بدون عنوان)",
                  })),
                ]}
              />
            )}
            <Select
              label="وضعیت"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as "" | "active" | "expired",
                })
              }
              options={[
                { value: "", label: "همه" },
                { value: "active", label: "فعال" },
                { value: "expired", label: "منقضی شده" },
              ]}
            />
            {(filters.search || filters.classId || filters.status) && (
              <Button
                variant="secondary"
                className="mt-2"
                onClick={resetFilters}
              >
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </Card>
      )}

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="تکلیفی وجود ندارد"
          description="تکلیفی برای نمایش موجود نیست."
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
