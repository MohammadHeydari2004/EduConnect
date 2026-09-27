import Button from "#/components/ui/Button.tsx";
import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
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
          { label: "مدیر", value: "admin" },
          { label: "استاد", value: "teacher" },
          { label: "دانشجو", value: "student" },
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
          { label: "فعال", value: "active" },
          { label: "غیرفعال", value: "inactive" },
        ]}
      />
      <div className="flex items-end">
        <Button variant="secondary" className="w-full" onClick={onReset}>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          پاک‌کردن فیلترها
        </Button>
      </div>
    </div>
  );
}

export default UserFilters;
