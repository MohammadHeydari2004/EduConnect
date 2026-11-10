import Badge from "#/components/ui/Badge.tsx";
import { formatDate } from "#/utils/formatDate.ts";
import {
  getDeadlineBadgeLabel,
  getDeadlineColor,
  getDeadlineColorClass,
} from "#/utils/tableHelpers.ts";

interface DeadlineBadgeProps {
  deadline: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
}

export function DeadlineBadge({ deadline, fontWeight = "medium" }: DeadlineBadgeProps) {
  const deadlineColor = getDeadlineColor(deadline);
  const WEIGHT_CLASS = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  } as const;
  const weightClass = WEIGHT_CLASS[fontWeight];
  return (
    <span
      className="inline-flex flex-col items-center gap-2"
      aria-label={`${formatDate(deadline)}، ${getDeadlineBadgeLabel(deadlineColor)}`}
    >
      <span className={`${getDeadlineColorClass(deadlineColor)} ${weightClass}`}>
        {formatDate(deadline)}
      </span>
      <Badge variant={deadlineColor}>
        {getDeadlineBadgeLabel(deadlineColor)}
      </Badge>
    </span>
  );
}
