import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import MenuItem from "#/components/ui/MenuItem.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { DeadlineBadge } from "#/components/ui/DeadlineBadge.tsx";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import { getSubmissionPreview, getAssignmentSubmissionStatus } from "#/utils/tableHelpers.ts";

interface StudentAssignmentsTableProps {
  data: Assignment[];
  getSubmission: (assignmentId: ID) => Submission | undefined;
  getClassName: (classId: ID) => string;
  getTeacherName: (teacherId: ID) => string;
  onOpenSubmissionForm: (assignment: Assignment) => void;
}

export default function StudentAssignmentsTable({
  data,
  getSubmission,
  getClassName,
  getTeacherName,
  onOpenSubmissionForm,
}: StudentAssignmentsTableProps) {
  const renderMobileCard = (a: Assignment) => {
    const { sub, isGraded, isReturned } = getAssignmentSubmissionStatus(
      a,
      getSubmission,
    );
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
    );
  };

  const renderMobileActions = (a: Assignment) => {
    const { sub, isGraded, isReturned, isExpired } = getAssignmentSubmissionStatus(
      a,
      getSubmission,
    );
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
  };

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
            const { sub } = getAssignmentSubmissionStatus(a, getSubmission);
            if (sub) {
              if (sub.status === "graded") {
                return (
                  <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                    <StatusChip status={sub.status} />
                    {typeof sub.grade === "number" && <span>نمره: {sub.grade}</span>}
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
              if (sub.status === "pending") {
                return (
                  <span className="inline-flex items-center gap-1 text-yellow-700 font-medium">
                    <StatusChip status={sub.status} />
                    <span>در انتظار بررسی</span>
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
          },
        },
        {
          key: "actions",
          title: "عملیات",
          width: "13%",
          render: (a) => {
            const { sub, isGraded, isReturned, isExpired } =
              getAssignmentSubmissionStatus(a, getSubmission);
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
