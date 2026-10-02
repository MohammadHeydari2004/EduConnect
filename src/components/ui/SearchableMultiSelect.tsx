import type { ID } from "#/types/common.ts";
import { useEffect, useMemo, useRef, useState } from "react";

export interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: ID[];
  onChange: (ids: ID[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchPlaceholder?: string;
}

function SearchableMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "انتخاب کنید...",
  label,
  error,
  searchPlaceholder = "جستجو...",
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClose = () => {
      setIsOpen(false);
      setSearchTerm("");
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)),
    );
  }, [options, searchTerm]);

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedIds.includes(opt.id)),
    [options, selectedIds],
  );

  const handleToggleOption = (id: ID) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveSelected = (id: ID) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  // انتخاب تمام گزینه‌های موجود در لیست (بدون توجه به فیلتر جستجو)
  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.id));
  };

  // انتخاب فقط گزینه‌های فیلترشده (نتایج جستجوی فعلی)
  const handleSelectFiltered = () => {
    const filteredIds = filteredOptions.map((opt) => opt.id);
    const newIds = Array.from(new Set([...selectedIds, ...filteredIds]));
    onChange(newIds);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      if (prev) setSearchTerm("");
      return !prev;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}{" "}
          <span className="text-xs font-normal text-gray-500">
            ({selectedIds.length} انتخاب شده)
          </span>
        </label>
      )}

      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex min-h-10.5 w-full cursor-pointer items-center rounded-lg border ${
          error ? "border-red-500" : "border-gray-300"
        } bg-white px-3 py-2 text-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100`}
      >
        {selectedOptions.length === 0 ? (
          <div className="flex w-full items-center justify-between">
            <span className="text-gray-400">{placeholder}</span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        ) : (
          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {selectedOptions.slice(0, 5).map((opt) => (
                <span
                  key={opt.id}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelected(opt.id);
                    }}
                    className="rounded-full p-0.5 transition hover:bg-blue-100"
                    aria-label={`حذف ${opt.label}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
              {selectedOptions.length > 5 && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  +{selectedOptions.length - 5} دیگر
                </span>
              )}
            </div>
            <svg
              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </button>

      {error && (
        <span className="mt-1 block text-xs text-red-600" role="alert">
          {error}
        </span>
      )}

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <svg
                className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={options.length === 0}
                className="text-xs font-medium text-blue-600 transition hover:text-blue-800 disabled:text-gray-400"
              >
                انتخاب همه ({options.length})
              </button>
              {searchTerm && filteredOptions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectFiltered}
                  className="text-xs font-medium text-green-600 transition hover:text-green-800"
                >
                  انتخاب نتایج جستجو ({filteredOptions.length})
                </button>
              )}
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={selectedIds.length === 0}
                className="text-xs font-medium text-red-600 transition hover:text-red-800 disabled:text-gray-400"
              >
                حذف همه
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
                <svg
                  className="mb-2 h-8 w-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-gray-500">موردی یافت نشد</span>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-3 py-2.5 text-sm transition last:border-0 hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleOption(opt.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 text-right">
                      <div className="font-medium text-gray-800">
                        {opt.label}
                      </div>
                      {opt.subLabel && (
                        <div className="text-xs text-gray-500">
                          {opt.subLabel}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </label>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
            برای جستجو تایپ کنید و برای انتخاب روی گزینه کلیک کنید
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableMultiSelect;
