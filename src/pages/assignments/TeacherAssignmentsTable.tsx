import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import Table from "#/components/ui/Table.tsx";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import { formatDate } from "#/utils/formatDate.ts";
import {
  getDeadlineBadgeLabel,
  getDeadlineBadgeVariant,
  getDeadlineColor,
  getDeadlineColorClass,
} from "#/utils/tableHelpers.ts";
import { useCallback } from "react";

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
  const renderMobileCard = useCallback(
    (a: Assignment) => {
      const stats = gradingStats.get(a.id) || { graded: 0, total: 0 };
      const deadlineColor = getDeadlineColor(a.deadline);
      return (
        <div className="space-y-2 text-right">
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold text-gray-800 w-34">
              {a.title}
            </span>
            {canManage(a) && (
              <span className="text-xs text-gray-500">
                {stats.graded}/{stats.total} نمره
              </span>
            )}
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
            <p className="line-clamp-2 text-xs text-gray-500">
              {a.description}
            </p>
          )}
          <div
            className={`inline-flex items-center gap-2 text-sm ${getDeadlineColorClass(deadlineColor)}`}
          >
            <span className="text-gray-500">ددلاین: </span>{" "}
            <span className="font-medium">{formatDate(a.deadline)}</span>
            <Badge variant={getDeadlineBadgeVariant(deadlineColor)}>
              {getDeadlineBadgeLabel(deadlineColor)}
            </Badge>
          </div>
        </div>
      );
    },
    [gradingStats, canManage, getClassName, getTeacherName],
  );

  const renderMobileActions = useCallback(
    (a: Assignment) => {
      return (
        <>
          {canManage(a) && (
            <>
              <MenuItem label="ویرایش" onAction={() => onEdit(a)} />
              <MenuItem
                label="مشاهده پاسخ‌ها"
                onAction={() => onViewSubmissions(a.id)}
              />
              <MenuItem label="حذف" danger onAction={() => onDelete(a)} />
            </>
          )}
        </>
      );
    },
    [canManage, onEdit, onViewSubmissions, onDelete],
  );

  return (
    <Table
      getRowKey={(a) => a.id}
      getRowLabel={(a) => a.title}
      columns={[
        {
          key: "title",
          title: "عنوان",
          width: "24%",
          render: (a) => (
            <div className="px-1" title={a.title}>
              {a.title}
            </div>
          ),
        },
        {
          key: "className",
          title: "کلاس",
          width: "9.5%",
          render: (a) => getClassName(a.classId),
        },
        {
          key: "description",
          title: "توضیحات",
          width: "14.5%",
          render: (a) => (
            <div className="truncate px-1" title={a.description}>
              {a.description}
            </div>
          ),
        },
        {
          key: "deadline",
          title: "ددلاین",
          width: "11.5%",
          render: (a) => {
            const deadlineColor = getDeadlineColor(a.deadline);
            return (
              <span className="inline-flex flex-col items-center gap-2">
                <span
                  className={getDeadlineColorClass(deadlineColor)}
                  font-medium
                >
                  {formatDate(a.deadline)}
                </span>
                <Badge variant={getDeadlineBadgeVariant(deadlineColor)}>
                  {getDeadlineBadgeLabel(deadlineColor)}
                </Badge>
              </span>
            );
          },
        },
        {
          key: "teacher",
          title: "استاد",
          width: "9.5%",
          render: (a) => getTeacherName(a.teacherId),
        },
        {
          key: "status",
          title: "وضعیت تصحیح",
          width: "7.5%",
          render: (a) => {
            if (canManage(a)) {
              const stats = gradingStats.get(a.id) || {
                graded: 0,
                total: 0,
              };
              return (
                <span className="text-sm text-gray-600">
                  {stats.graded}/{stats.total} نمره داده شده
                </span>
              );
            }
            return <span className="text-gray-500">—</span>;
          },
        },
        {
          key: "actions",
          title: "عملیات",
          width: "23.5%",
          render: (a) => {
            return (
              <div className="flex flex-wrap justify-center gap-2">
                {canManage(a) && (
                  <>
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
                  </>
                )}
              </div>
            );
          },
        },
      ]}
      data={data}
      renderMobileCard={renderMobileCard}
      renderMobileActions={renderMobileActions}
    />
  );
}