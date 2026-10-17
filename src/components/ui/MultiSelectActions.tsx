import type { MultiSelectOption } from "./MultiSelectTypes.ts";

interface MultiSelectActionsProps {
  options: MultiSelectOption[];
  filteredOptions: MultiSelectOption[];
  selectedIds: string[];
  searchTerm: string;
  onSelectAll: () => void;
  onSelectFiltered: () => void;
  onDeselectAll: () => void;
}

export function MultiSelectActions({
  options,
  filteredOptions,
  selectedIds,
  searchTerm,
  onSelectAll,
  onSelectFiltered,
  onDeselectAll,
}: MultiSelectActionsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
      <button
        type="button"
        onClick={onSelectAll}
        disabled={options.length === 0}
        className="text-xs font-medium text-blue-600 transition hover:text-blue-800 disabled:text-gray-400"
      >
        انتخاب همه ({options.length})
      </button>
      {searchTerm && filteredOptions.length > 0 && (
        <button
          type="button"
          onClick={onSelectFiltered}
          className="text-xs font-medium text-green-600 transition hover:text-green-800"
        >
          انتخاب نتایج جستجو ({filteredOptions.length})
        </button>
      )}
      <button
        type="button"
        onClick={onDeselectAll}
        disabled={selectedIds.length === 0}
        className="text-xs font-medium text-red-600 transition hover:text-red-800 disabled:text-gray-400"
      >
        حذف همه
      </button>
    </div>
  );
}