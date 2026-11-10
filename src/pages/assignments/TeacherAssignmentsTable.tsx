import Button from "#/components/ui/Button.tsx";
import { DeadlineBadge } from "#/components/ui/DeadlineBadge.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import Table from "#/components/ui/Table.tsx";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";

interface TeacherAssignmentsTableProps {
  data: Assignment[];
  canManage: (assignment: Assignment) => boolean;
  gradingStats: Map<ID, { graded: number; total: number }>;
  getClassName: (classId: ID) => string;
  getTeacherName: (teacherId: ID) => string;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onViewSubmissions: (assignmentId: ID) => void;
}

export default function TeacherAssignmentsTable({
  data,
  canManage,
  gradingStats,
  getClassName,
  getTeacherName,
  onEdit,
  onDelete,
  onViewSubmissions,
}: TeacherAssignmentsTableProps) {
  const renderMobileCard = (a: Assignment) => {
    const stats = gradingStats.get(a.id) || { graded: 0, total: 0 };
    return (
      <div className="space-y-2 text-right">
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-gray-800 w-34">
            {a.title}
          </span>
          <span className="text-xs text-gray-500">
            {stats.graded}/{stats.total} نمره
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-500">کلاس: </span>{" "}
          {getClassName(a.classId)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-500">استاد: </span>{" "}
          {getTeacherName(a.teacherId)}
        </div>
        {a.description && (
          <p className="line-clamp-2 text-xs text-gray-500">{a.description}</p>
        )}
        <DeadlineBadge deadline={a.deadline} />
      </div>
    );
  };

  const hasManageableItems = data.some(canManage);

  const renderMobileActions = (a: Assignment) => {
    if (!hasManageableItems || !canManage(a)) return null;
    return (
      <>
        <MenuItem label="ویرایش" onAction={() => onEdit(a)} />
        <MenuItem
          label="مشاهده پاسخ‌ها"
          onAction={() => onViewSubmissions(a.id)}
        />
        <MenuItem label="حذف" danger onAction={() => onDelete(a)} />
      </>
    );
  };

  const columns = [
    {
      key: "title",
      title: "عنوان",
      width: hasManageableItems ? "24%" : "28%",
      render: (a: Assignment) => (
        <div className="px-1" title={a.title}>
          {a.title}
        </div>
      ),
    },
    {
      key: "className",
      title: "کلاس",
      width: hasManageableItems ? "9.5%" : "14%",
      render: (a: Assignment) => getClassName(a.classId),
    },
    {
      key: "description",
      title: "توضیحات",
      width: hasManageableItems ? "14.5%" : "16%",
      render: (a: Assignment) => (
        <div className="truncate px-1" title={a.description}>
          {a.description}
        </div>
      ),
    },
    {
      key: "deadline",
      title: "ددلاین",
      width: hasManageableItems ? "11.5%" : "12%",
      render: (a: Assignment) => <DeadlineBadge deadline={a.deadline} />,
    },
    {
      key: "teacher",
      title: "استاد",
      width: hasManageableItems ? "9.5%" : "12%",
      render: (a: Assignment) => getTeacherName(a.teacherId),
    },
    {
      key: "status",
      title: "وضعیت تصحیح",
      width: hasManageableItems ? "7.5%" : "18%",
      render: (a: Assignment) => {
        const stats = gradingStats.get(a.id) || {
          graded: 0,
          total: 0,
        };
        return (
          <span className="text-sm text-gray-600">
            {stats.graded}/{stats.total} نمره داده شده
          </span>
        );
      },
    },
    ...(hasManageableItems
      ? [
          {
            key: "actions",
            title: "عملیات",
            width: "23.5%",
            render: (a: Assignment) => (
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => onEdit(a)}>
                  ویرایش
                </Button>
                <Button variant="danger" onClick={() => onDelete(a)}>
                  حذف
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onViewSubmissions(a.id)}
                >
                  پاسخ‌ها
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      getRowKey={(a) => a.id}
      getRowLabel={(a) => a.title}
      columns={columns}
      data={data}
      renderMobileCard={renderMobileCard}
      renderMobileActions={renderMobileActions}
    />
  );
}
