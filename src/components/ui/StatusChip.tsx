import type {
  AttendanceStatus,
  RecordStatus,
  SubmissionStatus,
} from "#/types/common.ts";

type StatusType = RecordStatus | AttendanceStatus | SubmissionStatus;

interface StatusChipProps {
  status: StatusType;
  className?: string;
}

type StatusIcon = "check" | "cross" | "clock" | "hourglass" | "send" | "star";

const STATUS_ICON_PATHS: Record<StatusIcon, string> = {
  check: "M5 13l4 4L19 7",
  cross: "M6 18L18 6M6 6l12 12",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  hourglass:
    "M7 4h10M7 20h10M8.5 4c0 3 .8 4.3 3.5 6-2.7 1.7-3.5 3-3.5 6M15.5 4c0 3-.8 4.3-3.5 6 2.7 1.7 3.5 3 3.5 6",
  send: "M12 19l7-7 3 3-7 7-3-3zM3 3l7.5 7.5",
  star: "M11.05 3.77a1 1 0 011.9 0l1.4 4.3a1 1 0 00.95.7l4.6.34a1 1 0 01.58 1.8l-3.7 2.7a1 1 0 00-.36 1.1l1.3 4.4a1 1 0 01-1.5 1.1l-3.85-2.8a1 1 0 00-1.2 0l-3.85 2.8a1 1 0 01-1.5-1.1l1.3-4.4a1 1 0 00-.36-1.1l-3.7-2.7a1 1 0 01.58-1.8l4.6-.34a1 1 0 00.95-.7z",
};

interface StatusConfig {
  label: string;
  className: string;
  icon: StatusIcon;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  active: {
    label: "فعال",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    icon: "check",
  },
  inactive: {
    label: "غیرفعال",
    className: "bg-gray-50 text-gray-700 ring-gray-600/20",
    icon: "cross",
  },
  present: {
    label: "حاضر",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    icon: "check",
  },
  absent: {
    label: "غایب",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    icon: "cross",
  },
  late: {
    label: "با تأخیر",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    icon: "clock",
  },
  submitted: {
    label: "ارسال شده",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: "send",
  },
  graded: {
    label: "نمره داده شده",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: "star",
  },
  pending: {
    label: "در انتظار",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    icon: "hourglass",
  },
  returned: {
    label: "برگشتی",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
    icon: "send",
  },
};
export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: statusConfig.present.label,
  late: statusConfig.late.label,
  absent: statusConfig.absent.label,
};

function StatusChip({ status, className = "" }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <span
      aria-label={config.label}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset ${config.className} ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={STATUS_ICON_PATHS[config.icon]}
        />
      </svg>
      <span>{config.label}</span>
    </span>
  );
}

export default StatusChip;
