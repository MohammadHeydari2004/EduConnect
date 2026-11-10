import type {
  AttendanceStatus,
  RecordStatus,
  SubmissionStatus,
} from "#/types/common.ts";
import {
  ClockIcon,
  CloseIcon,
  CheckIcon,
  HourglassIcon,
  SendIcon,
  StarIcon,
} from "#/components/common/icons";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غایب",
  late: "با تأخیر",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  present: ATTENDANCE_LABELS.present,
  absent: ATTENDANCE_LABELS.absent,
  late: ATTENDANCE_LABELS.late,
  submitted: "ارسال شده",
  graded: "نمره داده شده",
  pending: "در انتظار",
  returned: "برگشتی",
};

type StatusType = RecordStatus | AttendanceStatus | SubmissionStatus;

interface StatusChipProps {
  status: StatusType;
  className?: string;
  fallbackLabel?: string;
}

type StatusIconComponent =
  | typeof CheckIcon
  | typeof CloseIcon
  | typeof ClockIcon
  | typeof HourglassIcon
  | typeof SendIcon
  | typeof StarIcon;

interface StatusConfig {
  label: string;
  className: string;
  Icon: StatusIconComponent;
}

const FALLBACK_CONFIG: StatusConfig = {
  label: "نامشخص",
  className: "bg-gray-50 text-gray-700 ring-gray-600/20",
  Icon: CloseIcon,
};

const ST_ACTIVE: StatusConfig = {
    label: STATUS_LABELS["active"] ?? "فعال",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    Icon: CheckIcon,
};
const ST_INACTIVE: StatusConfig = {
    label: STATUS_LABELS["inactive"] ?? "غیرفعال",
    className: "bg-gray-50 text-gray-700 ring-gray-600/20",
    Icon: CloseIcon,
};
const ST_PRESENT: StatusConfig = {
    label: ATTENDANCE_LABELS.present,
    className: "bg-green-50 text-green-700 ring-green-600/20",
    Icon: CheckIcon,
};
const ST_ABSENT: StatusConfig = {
    label: ATTENDANCE_LABELS.absent,
    className: "bg-red-50 text-red-700 ring-red-600/20",
    Icon: CloseIcon,
};
const ST_LATE: StatusConfig = {
    label: ATTENDANCE_LABELS.late,
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    Icon: ClockIcon,
};
const ST_SUBMITTED: StatusConfig = {
    label: STATUS_LABELS["submitted"] ?? "ارسال شده",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Icon: SendIcon,
};
const ST_GRADED: StatusConfig = {
    label: STATUS_LABELS["graded"] ?? "نمره داده شده",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Icon: StarIcon,
};
const ST_PENDING: StatusConfig = {
    label: STATUS_LABELS["pending"] ?? "در انتظار",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    Icon: HourglassIcon,
};
const ST_RETURNED: StatusConfig = {
    label: STATUS_LABELS["returned"] ?? "برگشتی",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
    Icon: SendIcon,
};

const statusConfig: Record<StatusType, StatusConfig> = {
  active: ST_ACTIVE,
  inactive: ST_INACTIVE,
  present: ST_PRESENT,
  absent: ST_ABSENT,
  late: ST_LATE,
  submitted: ST_SUBMITTED,
  graded: ST_GRADED,
  pending: ST_PENDING,
  returned: ST_RETURNED,
};

function StatusChip({ status, className = "", fallbackLabel }: StatusChipProps) {
  const config: StatusConfig | undefined = statusConfig[status];
  const resolved: StatusConfig = config ?? { ...FALLBACK_CONFIG, label: fallbackLabel ?? FALLBACK_CONFIG.label };
  const Icon = resolved.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${resolved.className} ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{resolved.label}</span>
    </span>
  );
}

export default StatusChip;
