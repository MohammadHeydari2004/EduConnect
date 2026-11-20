import type { AttendanceStatus, RecordStatus, SubmissionStatus } from "#/types";
import { ATTENDANCE_LABELS } from "#/configs/constants";
import {
  ClockIcon,
  CloseIcon,
  CheckIcon,
  HourglassIcon,
  SendIcon,
  StarIcon,
} from "#/components/common/icons";

type StatusType = RecordStatus | AttendanceStatus | SubmissionStatus;

interface StatusChipProps {
  status: StatusType | undefined;
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

const statusConfig: Record<StatusType, StatusConfig> = {
  active: {
    label: "فعال",
    className: "bg-green-50 text-green-700 ring-green-600/20",
    Icon: CheckIcon,
  },
  inactive: {
    label: "غیرفعال",
    className: "bg-gray-50 text-gray-700 ring-gray-600/20",
    Icon: CloseIcon,
  },
  present: {
    label: ATTENDANCE_LABELS.present,
    className: "bg-green-50 text-green-700 ring-green-600/20",
    Icon: CheckIcon,
  },
  absent: {
    label: ATTENDANCE_LABELS.absent,
    className: "bg-red-50 text-red-700 ring-red-600/20",
    Icon: CloseIcon,
  },
  late: {
    label: ATTENDANCE_LABELS.late,
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    Icon: ClockIcon,
  },
  submitted: {
    label: "ارسال شده",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Icon: SendIcon,
  },
  graded: {
    label: "نمره داده شده",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Icon: StarIcon,
  },
  pending: {
    label: "در انتظار",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    Icon: HourglassIcon,
  },
  returned: {
    label: "برگشتی",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
    Icon: SendIcon,
  },
};

function StatusChip({ status, className = "", fallbackLabel }: StatusChipProps) {
  const config: StatusConfig | undefined = status ? statusConfig[status] : undefined;
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
