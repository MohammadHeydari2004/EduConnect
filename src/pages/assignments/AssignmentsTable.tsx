import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useCallback } from "react";

interface AssignmentsTableProps {
  data: Assignment[];
  isStudent: boolean;
  canManage: (assignment: Assignment) => boolean;
  getSubmission: (assignmentId: ID) => Submission | undefined;
  gradingStats: Map<ID, { graded: number; total: number }>;
  getClassName: (classId: ID) => string;
  getTeacherName: (teacherId: ID) => string;
  onOpenSubmissionForm: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onViewSubmissions: (assignmentId: ID) => void;
}

const getDeadlineColor = (deadline: string): "green" | "yellow" | "red" => {
  const now = Date.now();
  const deadlineTime = new Date(deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "red";
  if (diffDays <= 3) return "yellow";
  return "green";
};

const getDeadlineColorClass = (color: "green" | "yellow" | "red"): string => {
  switch (color) {
    case "green":
      return "text-green-600";
    case "yellow":
      return "text-yellow-600";
    case "red":
      return "text-red-600";
  }
};

const getDeadlineBadgeVariant = (
  color: "green" | "yellow" | "red",
): "green" | "yellow" | "red" => {
  return color;
};

const getDeadlineBadgeLabel = (color: "green" | "yellow" | "red"): string => {
  switch (color) {
    case "green":
      return "وقت کافی";
    case "yellow":
      return "نزدیک ددلاین";
    case "red":
      return "منقضی شده";
  }
};

const getSubmissionPreview = (content: string, maxLength = 50): string => {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + "...";
};

export default function AssignmentsTable({
  data,
  isStudent,
  canManage,
  getSubmission,
  gradingStats,
  getClassName,
  getTeacherName,
  onOpenSubmissionForm,
  onEdit,
  onDelete,
  onViewSubmissions,
}: AssignmentsTableProps) {
  const now = Date.now();
  const isAssignmentExpired = (a: Assignment) =>
    new Date(a.deadline).getTime() < now;
  const renderMobileCard = useCallback(
    (a: Assignment) => {
      const sub = getSubmission(a.id);
      const isGraded = sub?.status === "graded";
      const stats = gradingStats.get(a.id) || { graded: 0, total: 0 };
      const deadlineColor = getDeadlineColor(a.deadline);
      return (
        <div className="space-y-2 text-right">
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold text-gray-800">{a.title}</span>
            {isStudent &&
              (sub ? (
                <StatusChip status={sub.status} />
              ) : (
                <Badge variant="gray">ارسال نشده</Badge>
              ))}
            {!isStudent && canManage(a) && (
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
          {sub && sub.content && (
            <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded line-clamp-2">
              <span className="font-medium text-gray-500">پاسخ: </span>
              {getSubmissionPreview(sub.content, 80)}
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
          {(isStudent || canManage(a)) &&
            isGraded &&
            sub?.grade !== undefined && (
              <div className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                نمره: {sub.grade}
              </div>
            )}
        </div>
      );
    },
    [
      getSubmission,
      gradingStats,
      isStudent,
      canManage,
      getClassName,
      getTeacherName,
    ],
  );

  const renderMobileActions = useCallback(
    (a: Assignment) => {
      const sub = getSubmission(a.id);
      const isGraded = sub?.status === "graded";
      const isExpired = isAssignmentExpired(a);
      return (
        <>
          {isStudent && (
            <>
              {!sub ? (
                <MenuItem
                  label="ارسال پاسخ"
                  onAction={() => onOpenSubmissionForm(a)}
                  disabled={isExpired}
                />
              ) : !isGraded ? (
                <div className="w-full rounded-md px-3 py-2 text-right text-sm text-blue-700 font-medium">
                  منتظر پاسخ استاد
                </div>
              ) : (
                <div className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-400">
                  نمره نهایی شده ({sub.grade})
                </div>
              )}
            </>
          )}
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
    [
      getSubmission,
      isStudent,
      canManage,
      onOpenSubmissionForm,
      onEdit,
      onViewSubmissions,
      onDelete,
    ],
  );

  return (
    <Table
      getRowKey={(a) => a.id}
      getRowLabel={(a) => a.title}
      columns={[
        {
          key: "title",
          title: "عنوان",
          width: "10%",
          render: (a) => (
            <div className="px-1" title={a.title}>
              {a.title}
            </div>
          ),
        },
        {
          key: "className",
          title: "کلاس",
          width: "10%",
          render: (a) => getClassName(a.classId),
        },
        {
          key: "description",
          title: "توضیحات",
          width: "25%",
          render: (a) => (
            <div className="truncate px-1" title={a.description}>
              {a.description}
            </div>
          ),
        },
        {
          key: "deadline",
          title: "ددلاین",
          width: "12%",
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
          width: "10%",
          render: (a) => getTeacherName(a.teacherId),
        },
        {
          key: "status",
          title: "وضعیت",
          width: "20%",
          render: (a) => {
            if (isStudent) {
              const sub = getSubmission(a.id);
              if (sub) {
                if (sub.status === "graded") {
                  return (
                    <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                      <StatusChip status={sub.status} />
                      {sub.grade !== undefined && (
                        <span>نمره: {sub.grade}</span>
                      )}
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                    <StatusChip status={sub.status} />
                    <span>منتظر پاسخ استاد</span>
                  </span>
                );
              }
              return <span className="text-gray-500">ارسال نشده</span>;
            }
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
          width: "20%",
          render: (a) => {
            const sub = getSubmission(a.id);
            const isGraded = sub?.status === "graded";
            const isExpired = isAssignmentExpired(a);
            return (
              <div className="flex flex-wrap justify-center gap-2">
                {isStudent &&
                  (!sub ? (
                    <Button
                      variant="secondary"
                      onClick={() => onOpenSubmissionForm(a)}
                      disabled={isExpired}
                    >
                      ارسال پاسخ
                    </Button>
                  ) : !isGraded ? (
                    <span className="py-2 px-3 text-xs text-blue-700 font-medium">
                      منتظر پاسخ استاد
                    </span>
                  ) : (
                    <span className="py-2 text-xs text-gray-500">
                      نمره نهایی شده ({sub.grade})
                    </span>
                  ))}
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
