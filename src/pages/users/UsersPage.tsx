import EmptyState from "#/components/common/EmptyState.tsx";
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
    viewModal,
    isDeleting,
    handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleOpenDelete,
    handleDelete,
    handleToggleStatus,
    handleView,
  } = useUsersPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
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
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          filteredUsers === undefined || filteredUsers.length === 0 ? (
            <EmptyState
              title="کاربری ثبت نشده است"
              description="هنوز هیچ کاربری در سیستم وجود ندارد."
            />
          ) : (
            <EmptyState
              title="کاربری پیدا نشد"
              description="هیچ کاربری با فیلترهای انتخاب‌شده پیدا نشد."
            />
          )
        ) : (
          <UserTable
            users={filteredUsers}
            currentUserId={currentUser?.id}
            onView={handleView}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Card>

      {(userModal.isOpen("create") || userModal.isOpen("edit")) && (
        <UserForm
          key={userModal.kind ?? "none"}
          isOpen
          mode={userModal.kind === "edit" ? "edit" : "create"}
          user={userModal.kind === "edit" ? userModal.target : null}
          onClose={userModal.close}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      <UserDetails
        isOpen={viewModal.isOpen("details")}
        user={viewModal.target}
        onClose={viewModal.close}
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