import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import UserDetails from "#/pages/users/UserDetails.tsx";
import UserFilters from "#/pages/users/UserFilters.tsx";
import UserForm from "#/pages/users/UserForm.tsx";
import UserTable from "#/pages/users/UserTable.tsx";
import { useUsersPage } from "#/pages/users/useUsersPage";
import { hasActiveUserFilters } from "#/utils/hasActiveFilters.ts";
import { EmptyListState } from "#/components/ui/EmptyListState.tsx";

export default function UsersPage() {
  const {
    currentUser,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    filteredUsers,
    userModal,
    isDeleting,
    handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleOpenDelete,
    handleDelete,
    handleToggleStatus,
    handleView,
  } = useUsersPage();
  const hasActiveFilters = hasActiveUserFilters(filters);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
          مدیریت کاربران
        </h1>
        <Button
          onClick={() => userModal.open("create")}
          className="w-full sm:w-auto"
        >
          ایجاد کاربر
        </Button>
      </div>

      <UserFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <Card title="لیست کاربران">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <>
            <EmptyListState
              items={filteredUsers}
              hasActiveFilters={hasActiveFilters}
              emptyTitle="کاربری ثبت نشده است"
              emptyDescription="هنوز هیچ کاربری در سیستم وجود ندارد."
              notFoundTitle="کاربری پیدا نشد"
              notFoundDescription="هیچ کاربری با فیلترهای انتخاب‌شده پیدا نشد."
            />
            {filteredUsers && filteredUsers.length > 0 && (
              <UserTable
                users={filteredUsers}
                currentUserId={currentUser?.id}
                onView={handleView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </>
        )}
      </Card>

      {(userModal.isOpen("create") || userModal.isOpen("edit")) && (
        <UserForm
          key={userModal.kind === "edit" ? `edit-${userModal.target?.id ?? "unknown"}` : "create"}
          isOpen
          mode={userModal.kind === "edit" ? "edit" : "create"}
          user={userModal.kind === "edit" ? userModal.target : null}
          onClose={userModal.close}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      <UserDetails
        isOpen={userModal.isOpen("details")}
        user={userModal.target}
        onClose={userModal.close}
      />

      <ConfirmDialog
        isOpen={userModal.isOpen("delete")}
        title="حذف کاربر"
        message={`آیا از حذف کاربر "${userModal.target?.name ?? ""}" مطمئن هستید؟`}
        onClose={userModal.close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}