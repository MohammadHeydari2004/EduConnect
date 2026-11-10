import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import Select from "#/components/ui/Select.tsx";
import Button from "#/components/ui/Button.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { AssignmentFilters } from "#/types/assignment.ts";

interface AssignmentFilterCardProps {
  filters: AssignmentFilters;
  onChange: (filters: AssignmentFilters) => void;
  onReset: () => void;
  classes: ClassItem[];
  hasActiveFilters: boolean;
}

export default function AssignmentFilterCard({
  filters,
  onChange,
  onReset,
  classes,
  hasActiveFilters,
}: AssignmentFilterCardProps) {
  return (
    <Card className="mb-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <Input
          label="جستجوی عنوان"
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value })
          }
          placeholder="جستجو..."
        />
        <Select
          label="کلاس"
          value={filters.classId}
          onChange={(e) =>
            onChange({ ...filters, classId: e.target.value })
          }
          options={[
            { value: "", label: "همه کلاس‌ها" },
            ...classes.map((c) => ({
              value: c.id,
              label: c.title || "(بدون عنوان)",
            })),
          ]}
        />
        <Select
          label="وضعیت"
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as "" | "active" | "expired",
            })
          }
          options={[
            { value: "", label: "همه" },
            { value: "active", label: "فعال" },
            { value: "expired", label: "منقضی شده" },
          ]}
        />
        {hasActiveFilters && (
          <Button
            variant="secondary"
            className="mt-2"
            onClick={onReset}
          >
            پاک کردن فیلترها
          </Button>
        )}
      </div>
    </Card>
  );
}
