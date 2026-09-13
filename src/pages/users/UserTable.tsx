import Button from "#/components/ui/Button.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { User } from "#/types/user.ts";
import type { ID } from "#/types/common.ts";

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
          render: (user) => <span className="capitalize">{user.role}</span>,
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
            <div className="flex flex-wrap gap-2">
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
    />
  );
}

export default UserTable;
