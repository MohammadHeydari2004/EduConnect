import type { ID } from "#/types/common.ts";
import { useClickOutside } from "#/hooks/useClickOutside.ts";
import { useId, useMemo, useRef, useState } from "react";
import { MultiSelectTrigger } from "./MultiSelectTrigger.tsx";
import { MultiSelectDropdown } from "./MultiSelectDropdown.tsx";
import type { SearchableMultiSelectProps as SearchableMultiSelectPropsType } from "./MultiSelectTypes.ts";

function SearchableMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "انتخاب کنید...",
  label,
  error,
  searchPlaceholder = "جستجو...",
  openDirection = "down",
}: SearchableMultiSelectPropsType) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const errorId = error ? `${labelId}-error` : undefined;

  useClickOutside(
    [containerRef, triggerRef, dropdownRef],
    () => {
      setIsOpen(false);
      setSearchTerm("");
    },
    isOpen,
  );

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)),
    );
  }, [options, searchTerm]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedSet.has(opt.id)),
    [options, selectedSet],
  );

  const handleToggleOption = (id: ID) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveSelected = (id: ID) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.id));
  };

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

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(filteredOptions.length - 1);
        break;
      case "Enter":
      case " ": {
        const option = filteredOptions[activeIndex];
        if (option) {
          event.preventDefault();
          handleToggleOption(option.id);
        }
        break;
      }
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef}>
      {label && (
        <label
          id={labelId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}{" "}
          <span className="text-xs font-normal text-gray-500">
            ({selectedIds.length} انتخاب شده)
          </span>
        </label>
      )}

      <MultiSelectTrigger
        ref={triggerRef}
        selectedOptions={selectedOptions}
        isOpen={isOpen}
        placeholder={placeholder}
        error={error}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        onRemoveChip={handleRemoveSelected}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      <MultiSelectDropdown
        isOpen={isOpen}
        openDirection={openDirection}
        options={options}
        filteredOptions={filteredOptions}
        selectedIds={selectedIds}
        searchTerm={searchTerm}
        searchPlaceholder={searchPlaceholder}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        searchInputRef={searchInputRef}
        listboxRef={listboxRef}
        triggerRef={triggerRef}
        dropdownRef={dropdownRef}
        onSearchChange={setSearchTerm}
        onSearchKeyDown={handleSearchKeyDown}
        onOptionClick={handleToggleOption}
        onSelectAll={handleSelectAll}
        onSelectFiltered={handleSelectFiltered}
        onDeselectAll={handleDeselectAll}
        _labelId={labelId}
        _errorId={errorId}
      />

      {error && (
        <span
          id={errorId}
          className="mt-1 block text-xs text-red-600"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}

export default SearchableMultiSelect;