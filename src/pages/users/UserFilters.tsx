import Button from "#/components/ui/Button.tsx";
import SearchInput from "#/components/ui/SearchInput.tsx";
import Select from "#/components/ui/Select.tsx";
import { ResetIcon } from "#/components/common/icons";
import type { UserFilters as UserFiltersType } from "#/types";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "#/configs/constants";
import { hasActiveFilters, selectValue } from "#/utils";

interface UserFiltersProps {
  filters: UserFiltersType;
  onChange: (filters: UserFiltersType) => void;
  onReset: () => void;
}

function UserFilters({ filters, onChange, onReset }: UserFiltersProps) {
  const hasActive = hasActiveFilters(filters);
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
            role: selectValue(e.target.value, ["admin", "teacher", "student", ""], ""),
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
            status: selectValue(e.target.value, ["active", "inactive", ""], ""),
          })
        }
        options={STATUS_FILTER_OPTIONS}
      />
      {hasActive && (
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
