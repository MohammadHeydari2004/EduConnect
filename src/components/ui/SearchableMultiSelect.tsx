import { useClickOutside } from "#/hooks/useClickOutside.ts";
import { useId, useMemo, useRef, useState } from "react";
import type { ID } from "#/types/common.ts";
import type { MultiSelectOption } from "#/types/hooks.ts";
import { MultiSelectTrigger } from "#/components/ui/MultiSelectTrigger.tsx";
import { MultiSelectDropdown } from "#/components/ui/MultiSelectDropdown.tsx";

export interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: ID[];
  onChange: (ids: ID[]) => void;
  placeholder?: string;
  label?: string;
  error?: string | undefined;
  searchPlaceholder?: string;
  openDirection?: "down" | "up";
  disabled?: boolean;
}

export default function SearchableMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "انتخاب کنید...",
  label,
  error,
  searchPlaceholder = "جستجو...",
  openDirection = "down",
  disabled = false,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const errorId = error ? `${labelId}-error` : undefined;
  const listboxId = `${labelId}-listbox`;

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
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (isOpen) setSearchTerm("");
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      if (!isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          if (next >= filteredOptions.length) return 0;
          return next;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          if (next < 0) return filteredOptions.length - 1;
          return next;
        });
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
        event.preventDefault();
        if (activeIndex >= 0) {
          const option = filteredOptions[activeIndex];
          if (option) {
            handleToggleOption(option.id);
          }
        } else if (filteredOptions.length === 1 && filteredOptions[0]) {
          handleToggleOption(filteredOptions[0].id);
        }
        break;
      }
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
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

      <div onKeyDown={handleTriggerKeyDown}>
        <MultiSelectTrigger
          ref={triggerRef}
          selectedOptions={selectedOptions}
          isOpen={isOpen}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          onClick={toggleDropdown}
          onRemoveChip={handleRemoveSelected}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
        />
      </div>

      <MultiSelectDropdown
        isOpen={isOpen}
        openDirection={openDirection}
        listboxId={listboxId}
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
      />

      {error && (
        <span
          id={errorId}
          className="mt-1 block text-xs text-red-600"
        >
          {error}
        </span>
      )}
    </div>
  );
}
