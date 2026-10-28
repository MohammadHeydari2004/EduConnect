import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { formatDate } from "#/utils/formatDate.ts";
import {
  getDeadlineBadgeLabel,
  getDeadlineBadgeVariant,
  getDeadlineColor,
  getDeadlineColorClass,
  getSubmissionPreview,
  isAssignmentExpired,
} from "#/utils/tableHelpers.ts";
import { useCallback } from "react";

interface StudentAssignmentsTableProps {
  data: Assignment[];
  getSubmission: (assignmentId: ID) => Submission | undefined;
  gradingStats: Map<ID, { graded: number; total: number }>;
  getClassName: (classId: ID) => string;
  getTeacherName: (teacherId: ID) => string;
  onOpenSubmissionForm: (assignment: Assignment) => void;
}

export default function StudentAssignmentsTable({
  data,
  getSubmission,
  gradingStats,
  getClassName,
  getTeacherName,
  onOpenSubmissionForm,
}: StudentAssignmentsTableProps) {
  const renderMobileCard = useCallback(
    (a: Assignment) => {
      const sub = getSubmission(a.id);
      const isGraded = sub?.status === "graded";
      const isReturned = sub?.status === "returned";
      const deadlineColor = getDeadlineColor(a.deadline);
      return (
        <div className="space-y-2 text-right">
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold text-gray-800 w-34">
              {a.title}
            </span>
            {sub ? (
              <StatusChip status={sub.status} />
            ) : (
              <Badge variant="gray">ارسال نشده</Badge>
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
          {isGraded && sub?.grade !== undefined && (
            <div className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
              نمره: {sub.grade}
            </div>
          )}
          {isReturned && (
            <div className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
              پاسخ برگشتی - لطفاً مجدداً ارسال کنید
            </div>
          )}
        </div>
      );
    },
    [getSubmission, gradingStats, getClassName, getTeacherName],
  );

  const renderMobileActions = useCallback(
    (a: Assignment) => {
      const sub = getSubmission(a.id);
      const isGraded = sub?.status === "graded";
      const isReturned = sub?.status === "returned";
      const isExpired = isAssignmentExpired(a);
      return (
        <>
          {!sub ? (
            <MenuItem
              label="ارسال پاسخ"
              onAction={() => onOpenSubmissionForm(a)}
              disabled={isExpired}
            />
          ) : isReturned ? (
            <MenuItem
              label="پاسخ مجدد"
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
      );
    },
    [getSubmission, onOpenSubmissionForm],
  );

  return (
    <Table
      getRowKey={(a) => a.id}
      getRowLabel={(a) => a.title}
      columns={[
        {
          key: "title",
          title: "عنوان",
          width: "15%",
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
          width: "10%",
          render: (a) => (
            <div className="truncate px-1" title={a.description}>
              {a.description}
            </div>
          ),
        },
        {
          key: "deadline",
          title: "ددلاین",
          width: "8%",
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
          width: "8%",
          render: (a) => getTeacherName(a.teacherId),
        },
        {
          key: "status",
          title: "وضعیت",
          width: "18%",
          render: (a) => {
            const sub = getSubmission(a.id);
            if (sub) {
              if (sub.status === "graded") {
                return (
                  <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                    <StatusChip status={sub.status} />
                    {sub.grade !== undefined && <span>نمره: {sub.grade}</span>}
                  </span>
                );
              }
              if (sub.status === "returned") {
                return (
                  <span className="inline-flex items-center gap-1 text-orange-700 font-medium">
                    <StatusChip status={sub.status} />
                    <span>برگشتی - نیاز به اصلاح</span>
                  </span>
                );
              }
              if (sub.status === "late") {
                return (
                  <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                    <StatusChip status={sub.status} />
                    <span>منتظر پاسخ استاد (با تأخیر)</span>
                  </span>
                );
              }
              if (sub.status === "pending") {
                return (
                  <span className="inline-flex items-center gap-1 text-yellow-700 font-medium">
                    <StatusChip status={sub.status} />
                    <span>در انتظار بررسی</span>
                  </span>
                );
              }
              // submitted
              return (
                <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                  <StatusChip status={sub.status} />
                  <span>منتظر پاسخ استاد</span>
                </span>
              );
            }
            return <span className="text-gray-500">ارسال نشده</span>;
          },
        },
        {
          key: "actions",
          title: "عملیات",
          width: "10%",
          render: (a) => {
            const sub = getSubmission(a.id);
            const isGraded = sub?.status === "graded";
            const isReturned = sub?.status === "returned";
            const isExpired = isAssignmentExpired(a);
            return (
              <div className="flex flex-wrap justify-center gap-2">
                {!sub ? (
                  <Button
                    variant="secondary"
                    onClick={() => onOpenSubmissionForm(a)}
                    disabled={isExpired}
                  >
                    ارسال پاسخ
                  </Button>
                ) : isReturned ? (
                  <Button
                    variant="secondary"
                    onClick={() => onOpenSubmissionForm(a)}
                    disabled={isExpired}
                  >
                    پاسخ مجدد
                  </Button>
                ) : !isGraded ? (
                  <span className="py-2 px-3 text-xs text-blue-700 font-medium">
                    منتظر پاسخ استاد
                  </span>
                ) : (
                  <span className="py-2 text-xs text-gray-500">
                    نمره نهایی شده ({sub.grade})
                  </span>
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
