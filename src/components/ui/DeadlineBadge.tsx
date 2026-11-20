import Badge from "#/components/ui/Badge.tsx";
import { formatDate, getDeadlineBadgeLabel, getDeadlineColor, getDeadlineColorClass } from "#/utils";

interface DeadlineBadgeProps {
  deadline: string;
}

export function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const deadlineColor = getDeadlineColor(deadline);
  return (
    <span
      className="inline-flex flex-col items-center gap-2"
      aria-label={`${formatDate(deadline)}، ${getDeadlineBadgeLabel(deadlineColor)}`}
    >
      <span className={`font-medium ${getDeadlineColorClass(deadlineColor)}`}>
        {formatDate(deadline)}
      </span>
      <Badge variant={deadlineColor}>
        {getDeadlineBadgeLabel(deadlineColor)}
      </Badge>
    </span>
  );
}