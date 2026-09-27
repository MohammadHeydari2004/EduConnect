import Button from "#/components/ui/Button.tsx";
import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
import type { ClassStatus } from "#/types/class.ts";
import type { User } from "#/types/user.ts";

export interface ClassFiltersValues {
  search: string;
  statusFilter: ClassStatus | "";
  teacherFilter: string;
}

interface ClassFiltersProps {
  filters: ClassFiltersValues;
  teachers: User[];
  isAdmin: boolean;
  onChange: (filters: ClassFiltersValues) => void;
  onReset: () => void;
}

function ClassFilters({
  filters,
  teachers,
  isAdmin,
  onChange,
  onReset,
}: ClassFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4 md:grid-cols-2 xl:grid-cols-4">
      <SearchInput
        label="جستجو"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="عنوان کلاس"
      />
      <Select
        label="وضعیت"
        value={filters.statusFilter}
        onChange={(e) =>
          onChange({
            ...filters,
            statusFilter: e.target.value as ClassStatus | "",
          })
        }
        options={[
          { label: "همه وضعیت‌ها", value: "" },
          { label: "فعال", value: "active" },
          { label: "غیرفعال", value: "inactive" },
        ]}
      />
      {isAdmin && (
        <Select
          label="استاد"
          value={filters.teacherFilter}
          onChange={(e) =>
            onChange({ ...filters, teacherFilter: e.target.value })
          }
          options={[
            { label: "همه اساتید", value: "" },
            ...teachers.map((t) => ({ label: t.name, value: t.id })),
          ]}
        />
      )}
      <div className="flex items-end">
        <Button variant="secondary" className="w-full" onClick={onReset}>
          پاک‌کردن فیلترها
        </Button>
      </div>
    </div>
  );
}

export default ClassFilters;
