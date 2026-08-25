import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
import Button from "#/components/ui/Button.tsx";
import type { UserFilters as UserFiltersType } from "#/types/user.ts";

interface UserFiltersProps {
  filters: UserFiltersType;
  onChange: (filters: UserFiltersType) => void;
  onReset: () => void;
}

function UserFilters({ filters, onChange, onReset }: UserFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
      <SearchInput
        label="جستجو بر اساس نام"
        value={filters.searchName}
        onChange={(e) => onChange({ ...filters, searchName: e.target.value })}
        placeholder="نام کاربر"
      />
      <SearchInput
        label="جستجو بر اساس ایمیل"
        value={filters.searchEmail}
        onChange={(e) => onChange({ ...filters, searchEmail: e.target.value })}
        placeholder="ایمیل کاربر"
      />
      <Select
        label="نقش"
        value={filters.role}
        onChange={(e) =>
          onChange({
            ...filters,
            role: e.target.value as UserFiltersType["role"],
          })
        }
        options={[
          { label: "همه نقش‌ها", value: "" },
          { label: "Admin", value: "admin" },
          { label: "Teacher", value: "teacher" },
          { label: "Student", value: "student" },
        ]}
      />
      <Select
        label="وضعیت"
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as UserFiltersType["status"],
          })
        }
        options={[
          { label: "همه وضعیت‌ها", value: "" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]}
      />
      <div className="flex items-end">
        <Button variant="secondary" className="w-full" onClick={onReset}>
          پاک‌کردن فیلترها
        </Button>
      </div>
    </div>
  );
}

export default UserFilters;
