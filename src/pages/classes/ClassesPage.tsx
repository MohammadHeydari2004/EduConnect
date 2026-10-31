import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import ClassFilters from "#/pages/classes/ClassFilters";
import ClassForm from "#/pages/classes/ClassForm";
import ClassTable from "#/pages/classes/ClassTable";
import { useClassesPage } from "#/pages/classes/useClassesPage";
import { useToast } from "#/hooks/useToast.ts";

export default function ClassesPage() {
  const { addToast } = useToast();
  const {
    currentUser,
    isAdmin,
    teachers,
    users,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    filteredClasses,
    modals,
    isStatusChanging,
    confirmStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleDelete,
    handleOpenStatus,
    isDeleting,
    canManageClass,
    refresh,
  } = useClassesPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          مدیریت کلاس‌ها
        </h1>
        {(isAdmin || currentUser?.role === "teacher") && (
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            ایجاد کلاس جدید
          </Button>
        )}
      </div>

      <ClassFilters
        filters={filters}
        teachers={teachers}
        isAdmin={isAdmin}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <Card title="لیست کلاس‌ها">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : !filteredClasses || filteredClasses.length === 0 ? (
          filteredClasses === undefined || filteredClasses.length === 0 ? (
            <EmptyState
              title="کلاسی ثبت نشده است"
              description="هنوز هیچ کلاسی در سیستم وجود ندارد."
            />
          ) : (
            <EmptyState
              title="کلاسی پیدا نشد"
              description="هیچ کلاسی با فیلترهای انتخاب‌شده پیدا نشد."
            />
          )
        ) : (
          <ClassTable
            classes={filteredClasses}
            users={users ?? []}
            canManageClass={canManageClass}
            onEdit={handleOpenEdit}
            onToggleStatus={handleOpenStatus}
            onDelete={handleOpenDelete}
          />
        )}
      </Card>

      {(modals.isOpen("create") || modals.isOpen("edit")) && (
        <ClassForm
          key={`class-form-${modals.target?.id ?? "new"}`}
          users={users ?? []}
          initialData={modals.target}
          onClose={modals.createModal.close}
          onSuccess={(message) => {
            addToast(message, "success");
            modals.createModal.close();
            refresh();
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}

      {modals.isOpen("status") && (
        <ConfirmDialog
          isOpen={true}
          title={
            modals.target?.status === "active"
              ? "غیرفعال کردن کلاس"
              : "فعال کردن کلاس"
          }
          message={
            modals.target?.status === "active"
              ? `آیا از غیرفعال کردن کلاس "${modals.target?.title ?? ""}" مطمئن هستید؟`
              : `آیا از فعال کردن کلاس "${modals.target?.title ?? ""}" مطمئن هستید؟`
          }
          onClose={modals.createModal.close}
          onConfirm={confirmStatusChange}
          isLoading={isStatusChanging}
        />
      )}

      <ConfirmDialog
        isOpen={modals.isOpen("delete")}
        title="حذف کلاس"
        message={`آیا از حذف کامل کلاس "${modals.target?.title ?? ""}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        onClose={modals.createModal.close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}