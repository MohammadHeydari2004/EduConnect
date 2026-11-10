import Button from "#/components/ui/Button.tsx";
import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
import { ResetIcon } from "#/components/common/icons";
import type { UserFilters as UserFiltersType } from "#/types/user.ts";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "#/configs/constants";
import { hasActiveUserFilters } from "#/utils/hasActiveFilters.ts";

interface UserFiltersProps {
  filters: UserFiltersType;
  onChange: (filters: UserFiltersType) => void;
  onReset: () => void;
}

function UserFilters({ filters, onChange, onReset }: UserFiltersProps) {
  const hasActiveFilters = hasActiveUserFilters(filters);
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
            role: (() => {
              const v = e.target.value;
              return v === "admin" || v === "teacher" || v === "student" || v === "" ? v : "";
            })(),
          })
        }
        options={ROLE_FILTER_OPTIONS}
      />
      <Select
        label="وضعیت"
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: (() => {
              const v = e.target.value;
              return v === "active" || v === "inactive" || v === "" ? v : "";
            })(),
          })
        }
        options={STATUS_FILTER_OPTIONS}
      />
      {hasActiveFilters && (
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={onReset}>
            <ResetIcon className="h-4 w-4" />
            پاک‌کردن فیلترها
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserFilters;
