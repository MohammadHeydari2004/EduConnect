import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { useNavigate } from "react-router-dom";

interface ClassTableProps {
  classes: ClassItem[];
  users: User[];
  canManageClass: (c: ClassItem) => boolean;
  onEdit: (c: ClassItem) => void;
  onToggleStatus: (c: ClassItem) => void;
  onDelete: (c: ClassItem) => void;
}

function getCapacityVariant(
  currentCount: number,
  capacity: number,
): "green" | "yellow" | "red" {
  if (capacity <= 0) return "green";
  const ratio = currentCount / capacity;
  if (ratio >= 1) return "red";
  if (ratio >= 0.8) return "yellow";
  return "green";
}

function ClassTable({
  classes,
  users,
  canManageClass,
  onEdit,
  onToggleStatus,
  onDelete,
}: ClassTableProps) {
  const navigate = useNavigate();

  const userMap = new Map<ID, User>();
  users.forEach((u) => userMap.set(u.id, u));

  const getTeacherName = (teacherId: ID | null | undefined): string => {
    if (teacherId === null || teacherId === undefined) return "—";
    return userMap.get(teacherId)?.name ?? "—";
  };

  return (
    <Table
      getRowKey={(c) => c.id}
      columns={[
        {
          key: "title",
          title: "عنوان",
          render: (c) => (
            <button
              onClick={() => navigate(`/classes/${c.id}`)}
              className="font-medium text-blue-600 hover:underline"
            >
              {c.title || "(بدون عنوان)"}
            </button>
          ),
        },
        {
          key: "teacherId",
          title: "استاد",
          render: (c) => getTeacherName(c.teacherId),
        },
        {
          key: "capacity",
          title: "ظرفیت",
          render: (c) => {
            const studentCount = (c.studentIds || []).length;
            const capacity = c.capacity || 0;
            return (
              <Badge variant={getCapacityVariant(studentCount, capacity)}>
                {studentCount}/{capacity}
              </Badge>
            );
          },
        },
        {
          key: "status",
          title: "وضعیت",
          render: (c) => <StatusChip status={c.status || "inactive"} />,
        },
        {
          key: "actions",
          title: "عملیات",
          render: (c) => (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/classes/${c.id}`)}
              >
                جزئیات
              </Button>
              {canManageClass(c) && (
                <>
                  <Button variant="secondary" onClick={() => onEdit(c)}>
                    ویرایش
                  </Button>
                  <Button variant="secondary" onClick={() => onToggleStatus(c)}>
                    {c.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(c)}>
                    حذف
                  </Button>
                </>
              )}
            </div>
          ),
        },
      ]}
      data={classes}
      renderMobileCard={(c) => {
        const studentCount = (c.studentIds || []).length;
        const capacity = c.capacity || 0;
        return (
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(`/classes/${c.id}`)}
                className="text-base font-bold text-blue-600 hover:underline"
              >
                {c.title || "(بدون عنوان)"}
              </button>
              <StatusChip status={c.status || "inactive"} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>
                <span className="text-gray-500">استاد:</span>{" "}
                {getTeacherName(c.teacherId)}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-gray-500">ظرفیت:</span>{" "}
                <Badge variant={getCapacityVariant(studentCount, capacity)}>
                  {studentCount}/{capacity}
                </Badge>
              </span>
            </div>
          </div>
        );
      }}
      renderMobileActions={(c) => (
        <>
          <button
            onClick={() => navigate(`/classes/${c.id}`)}
            className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
          >
            جزئیات
          </button>
          {canManageClass(c) && (
            <>
              <button
                onClick={() => onEdit(c)}
                className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
              >
                ویرایش
              </button>
              <button
                onClick={() => onToggleStatus(c)}
                className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
              >
                {c.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
              </button>
              <button
                onClick={() => onDelete(c)}
                className="w-full rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
              >
                حذف
              </button>
            </>
          )}
        </>
      )}
    />
  );
}

export default ClassTable;
