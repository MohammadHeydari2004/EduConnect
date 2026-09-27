import Button from "#/components/ui/Button.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { getRoleLabel } from "#/utils/user.ts";

interface UserTableProps {
  users: User[];
  currentUserId?: ID;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

function UserTable({
  users,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserTableProps) {
  return (
    <Table
      getRowKey={(user) => user.id}
      columns={[
        {
          key: "name",
          title: "نام",
          render: (user) => (
            <div className="font-medium text-gray-800">
              {user.name}
              {user.id === currentUserId && (
                <span className="mr-2 text-xs text-blue-600">(شما)</span>
              )}
            </div>
          ),
        },
        { key: "email", title: "ایمیل" },
        {
          key: "role",
          title: "نقش",
          render: (user) => <span>{getRoleLabel(user.role)}</span>,
        },
        {
          key: "status",
          title: "وضعیت",
          render: (user) => <StatusChip status={user.status} />,
        },
        {
          key: "actions",
          title: "عملیات",
          render: (user) => (
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => onView(user)}>
                جزئیات
              </Button>
              <Button variant="secondary" onClick={() => onEdit(user)}>
                ویرایش
              </Button>
              <Button variant="secondary" onClick={() => onToggleStatus(user)}>
                {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
              </Button>
              <Button variant="danger" onClick={() => onDelete(user)}>
                حذف
              </Button>
            </div>
          ),
        },
      ]}
      data={users}
      renderMobileCard={(user) => (
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">
              {user.name}
              {user.id === currentUserId && (
                <span className="mr-2 text-xs text-blue-600">(شما)</span>
              )}
            </span>
            <StatusChip status={user.status} />
          </div>
          <div className="text-sm break-all text-gray-600">{user.email}</div>
          <div className="text-xs text-gray-500">
            نقش: <span className="font-medium">{getRoleLabel(user.role)}</span>
          </div>
        </div>
      )}
      renderMobileActions={(user) => (
        <>
          <button
            type="button"
            onClick={() => onView(user)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            جزئیات
          </button>
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            ویرایش
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  user.status === "active"
                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
            {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
            aria-label={`حذف کاربر ${user.name}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            حذف
          </button>
        </>
      )}
    />
  );
}

export default UserTable;
