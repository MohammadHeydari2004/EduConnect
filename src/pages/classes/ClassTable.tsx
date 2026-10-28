import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useMapById } from "#/hooks/useMapById.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { getEffectiveStatus } from "#/utils/class.ts";
import { getStatusLabel } from "#/utils/user.ts";
import { getCapacityVariant } from "#/utils/tableHelpers.ts";
import { useNavigate } from "react-router-dom";

interface ClassTableProps {
  classes: ClassItem[];
  users: User[];
  canManageClass: (c: ClassItem) => boolean;
  onEdit: (c: ClassItem) => void;
  onToggleStatus: (c: ClassItem) => void;
  onDelete: (c: ClassItem) => void;
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

  const userMap = useMapById(users);

  const getTeacherName = (teacherId: ID | null | undefined): string => {
    if (teacherId === null || teacherId === undefined) return "—";
    return userMap.get(teacherId)?.name ?? "—";
  };

  const hasManageableClass = classes.some(canManageClass);

  const columns = [
    {
      key: "title",
      title: "عنوان",
      width: "15%",
      render: (c: ClassItem) => (
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
      width: "10%",
      render: (c: ClassItem) => getTeacherName(c.teacherId),
    },
    {
      key: "capacity",
      title: "ظرفیت",
      width: "5%",
      render: (c: ClassItem) => {
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
      width: "7%",
      render: (c: ClassItem) => (
        <span title={getStatusLabel(getEffectiveStatus(c))}>
          <StatusChip status={getEffectiveStatus(c)} />
        </span>
      ),
    },
    ...(hasManageableClass
      ? [
          {
            key: "actions",
            title: "عملیات",
            width: "25%",
            render: (c: ClassItem) => (
              <div className="w-full flex flex-wrap justify-center gap-2">
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
        ]
      : []),
  ];

  return (
    <Table
      getRowKey={(c) => c.id}
      getRowLabel={(c: ClassItem) => c.title || "(بدون عنوان)"}
      columns={columns}
      data={classes}
      renderMobileCard={(c: ClassItem) => {
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
              <StatusChip status={getEffectiveStatus(c)} />
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
      renderMobileActions={(c: ClassItem) => (
        <>
          <MenuItem
            label="جزئیات"
            onAction={() => navigate(`/classes/${c.id}`)}
          />
          {canManageClass(c) && (
            <>
              <MenuItem label="ویرایش" onAction={() => onEdit(c)} />
              <MenuItem
                label={c.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
                onAction={() => onToggleStatus(c)}
              />
              <MenuItem label="حذف" danger onAction={() => onDelete(c)} />
            </>
          )}
        </>
      )}
    />
  );
}

export default ClassTable;
