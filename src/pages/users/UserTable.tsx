import {
  BanIcon,
  CheckCircleIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
} from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ID, User } from "#/types";
import { getRoleLabel, getStatusLabel } from "#/utils";

interface UserTableProps {
  users: User[];
  currentUserId?: ID | undefined;
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
  const getStatusToggleLabel = (user: User) =>
    user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی";

  const youIndicator = (user: User) =>
    user.id === currentUserId ? (
      <span className="ms-1 text-xs text-blue-600">(شما)</span>
    ) : null;

  return (
    <Table
      getRowKey={(user) => user.id}
      getRowLabel={(user) => user.name}
      columns={[
        {
          key: "name",
          title: "نام",
          width: "18.5%",
          render: (user) => (
            <div
              className="font-medium text-gray-800 truncate px-1"
              title={user.name}
            >
              {user.name}
              {youIndicator(user)}
            </div>
          ),
        },
        {
          key: "email",
          title: "ایمیل",
          width: "18.5%",
          render: (user) => (
            <div className="truncate px-1" title={user.email}>
              {user.email}
            </div>
          ),
        },
        {
          key: "role",
          title: "نقش",
          width: "7.5%",
          render: (user) => <span>{getRoleLabel(user.role)}</span>,
        },
        {
          key: "status",
          title: "وضعیت",
          width: "13%",
          render: (user) => (
            <StatusChip status={user.status} />
          ),
        },
        {
          key: "actions",
          title: "عملیات",
          width: "42.5%",
          render: (user) => (
            <div className="w-full flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => onView(user)}>
                جزئیات
              </Button>
              <Button variant="secondary" onClick={() => onEdit(user)}>
                ویرایش
              </Button>
              <Button variant="secondary" onClick={() => onToggleStatus(user)}>
                {getStatusToggleLabel(user)}
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
              {youIndicator(user)}
            </span>
            <StatusChip status={user.status} />
          </div>
          <div className="text-sm break-all text-gray-600">{user.email}</div>
          <div className="text-xs text-gray-500">
            نقش: <span className="font-medium">{getRoleLabel(user.role)}</span>
          </div>
          <div className="text-xs text-gray-500">
            وضعیت:{" "}
            <span className="font-medium">{getStatusLabel(user.status)}</span>
          </div>
        </div>
      )}
      renderMobileActions={(user) => (
        <>
          <MenuItem
            label="جزئیات"
            icon={<EyeIcon />}
            onAction={() => onView(user)}
          />
          <MenuItem
            label="ویرایش"
            icon={<EditIcon />}
            onAction={() => onEdit(user)}
          />
          <MenuItem
            label={getStatusToggleLabel(user)}
            icon={user.status === "active" ? <BanIcon /> : <CheckCircleIcon />}
            onAction={() => onToggleStatus(user)}
          />
          <MenuItem
            label="حذف"
            icon={<TrashIcon />}
            danger
            ariaLabel={`حذف کاربر ${user.name}`}
            onAction={() => onDelete(user)}
          />
        </>
      )}
    />
  );
}

export default UserTable;
