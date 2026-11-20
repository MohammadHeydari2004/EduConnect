import Badge from "#/components/ui/Badge.tsx";
import { getCapacityVariant } from "#/utils";
import type { ClassItem } from "#/types";

interface ClassCapacityBadgeProps {
  classItem: ClassItem;
}

export default function ClassCapacityBadge({
  classItem,
}: ClassCapacityBadgeProps) {
  const studentCount = (classItem.studentIds || []).length;
  const capacity = classItem.capacity || 0;
  return (
    <Badge variant={getCapacityVariant(studentCount, capacity)}>
      {studentCount}/{capacity}
    </Badge>
  );
}
