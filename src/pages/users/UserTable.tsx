import Button from "#/components/ui/Button.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";

interface UserTableProps {
  users: User[];
  currentUserId?: ID;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "استاد";
    case "student":
      return "دانشجو";
    default:
      return role;
  }
};

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
          <div className="text-sm text-gray-600 break-all">{user.email}</div>
          <div className="text-xs text-gray-500">
            نقش: <span className="font-medium">{getRoleLabel(user.role)}</span>
          </div>
        </div>
      )}
      renderMobileActions={(user) => (
        <>
          <button
            onClick={() => onView(user)}
            className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            جزئیات
          </button>
          <button
            onClick={() => onEdit(user)}
            className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            ویرایش
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
          </button>
          <button
            onClick={() => onDelete(user)}
            className="w-full rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
          >
            حذف
          </button>
        </>
      )}
    />
  );
}

export default UserTable;
