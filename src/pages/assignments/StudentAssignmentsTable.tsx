import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import { DeadlineBadge } from "#/components/ui/DeadlineBadge.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { Assignment, ID, Submission } from "#/types";
import { getAssignmentSubmissionStatus, getSubmissionPreview } from "#/utils";
import { useMemo } from "react";

interface StudentAssignmentsTableProps {
  data: Assignment[];
  getSubmission: (assignmentId: ID) => Submission | undefined;
  getClassName: (classId: ID) => string;
  getTeacherName: (teacherId: ID) => string;
  onOpenSubmissionForm: (assignment: Assignment) => void;
}

type SubmissionStatusResult = ReturnType<typeof getAssignmentSubmissionStatus>;

export default function StudentAssignmentsTable({
  data,
  getSubmission,
  getClassName,
  getTeacherName,
  onOpenSubmissionForm,
}: StudentAssignmentsTableProps) {
  const statusMap = useMemo(
    () =>
      new Map<ID, SubmissionStatusResult>(
        data.map((a) => [
          a.id,
          getAssignmentSubmissionStatus(a, getSubmission),
        ]),
      ),
    [data, getSubmission],
  );

  const getStatus = (a: Assignment): SubmissionStatusResult =>
    statusMap.get(a.id)!;

  const renderSubmissionAction = (a: Assignment, kind: "button" | "menu") => {
    const { sub, isGraded, isReturned, isExpired } = getStatus(a);
    const openForm = () => onOpenSubmissionForm(a);
    if (!sub || isReturned) {
      const label = !sub ? "ارسال پاسخ" : "پاسخ مجدد";
      return kind === "button" ? (
        <Button variant="secondary" onClick={openForm} disabled={isExpired}>
          {label}
        </Button>
      ) : (
        <MenuItem label={label} onAction={openForm} disabled={isExpired} />
      );
    }
    if (!isGraded) {
      const label = "منتظر پاسخ استاد";
      return kind === "button" ? (
        <span className="py-2 px-3 text-xs text-blue-700 font-medium">
          {label}
        </span>
      ) : (
        <div className="w-full rounded-md px-3 py-2 text-right text-sm text-blue-700 font-medium">
          {label}
        </div>
      );
    }
    const label = `نمره نهایی شده (${sub.grade})`;
    return kind === "button" ? (
      <span className="py-2 text-xs text-gray-500">{label}</span>
    ) : (
      <div className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-400">
        {label}
      </div>
    );
  };

  const renderMobileCard = (a: Assignment) => {
    const { sub, isGraded, isReturned } = getStatus(a);
    return (
      <div className="space-y-2 text-right">
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-gray-800 w-64">
            {a.title}
          </span>
          {sub ? (
            <StatusChip status={sub.status} />
          ) : (
            <Badge variant="gray">ارسال نشده</Badge>
          )}
        </div>
        <div className="flex flex-col items-start gap-4">
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
          <DeadlineBadge deadline={a.deadline} />
          {isGraded && typeof sub?.grade === "number" && (
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
      </div>
    );
  };

  const renderMobileActions = (a: Assignment) =>
    renderSubmissionAction(a, "menu");

  return (
    <Table
      getRowKey={(a) => a.id}
      getRowLabel={(a) => a.title}
      columns={[
        {
          key: "title",
          title: "عنوان",
          width: "19%",
          render: (a) => (
            <div className="px-1" title={a.title}>
              {a.title}
            </div>
          ),
        },
        {
          key: "className",
          title: "کلاس",
          width: "12.5%",
          render: (a) => getClassName(a.classId),
        },
        {
          key: "description",
          title: "توضیحات",
          width: "12.5%",
          render: (a) => (
            <div className="truncate px-1" title={a.description}>
              {a.description}
            </div>
          ),
        },
        {
          key: "deadline",
          title: "ددلاین",
          width: "10%",
          render: (a) => <DeadlineBadge deadline={a.deadline} />,
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
          width: "23%",
          render: (a) => {
            const { sub } = getStatus(a);
            if (!sub) return <span className="text-gray-500">ارسال نشده</span>;
            if (sub.status === "graded") {
              return (
                <span className="inline-flex items-center gap-1">
                  <StatusChip status={sub.status} />
                  {typeof sub.grade === "number" && (
                    <span className="text-sm font-medium text-gray-700">
                      نمره: {sub.grade}
                    </span>
                  )}
                </span>
              );
            }
            return <StatusChip status={sub.status} />;
          },
        },
        {
          key: "actions",
          title: "عملیات",
          width: "13%",
          render: (a) => (
            <div className="flex flex-wrap justify-center gap-2">
              {renderSubmissionAction(a, "button")}
            </div>
          ),
        },
      ]}
      data={data}
      renderMobileCard={renderMobileCard}
      renderMobileActions={renderMobileActions}
    />
  );
}
