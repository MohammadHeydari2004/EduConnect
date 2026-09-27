import type {
  AttendanceStatus,
  RecordStatus,
  SubmissionStatus,
} from "#/types/common.ts";

type StatusType = RecordStatus | AttendanceStatus | SubmissionStatus;

interface StatusChipProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  className: string;
  icon: string;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  active: {
    label: "فعال",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    icon: "✓",
  },
  inactive: {
    label: "غیرفعال",
    className: "bg-gray-50 text-gray-700 ring-gray-600/20",
    icon: "✗",
  },
  present: {
    label: "حاضر",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    icon: "✓",
  },
  absent: {
    label: "غایب",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    icon: "✗",
  },
  late: {
    label: "با تأخیر",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    icon: "⏱",
  },
  submitted: {
    label: "ارسال شده",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: "📤",
  },
  graded: {
    label: "نمره داده شده",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: "★",
  },
  pending: {
    label: "در انتظار",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    icon: "⏳",
  },
};

function StatusChip({
  status,
  className = "",
  showIcon = true,
}: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <span
      role="status"
      title={config.label}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset ${config.className} ${className}`}
    >
      {showIcon && (
        <span aria-hidden="true" className="text-[10px] leading-none">
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default StatusChip;
