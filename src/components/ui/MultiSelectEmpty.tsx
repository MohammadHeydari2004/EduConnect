import { SearchOffIcon } from "#/components/common/icons";

export function MultiSelectEmpty() {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
      <SearchOffIcon className="mb-2 h-8 w-8 text-gray-300" />
      <span className="text-sm text-gray-500">موردی یافت نشد</span>
    </div>
  );
}