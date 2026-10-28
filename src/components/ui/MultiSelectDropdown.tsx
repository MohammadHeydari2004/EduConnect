import { SearchIcon } from "#/components/common/icons";
import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { MultiSelectActions } from "#/components/ui/MultiSelectActions.tsx";
import { MultiSelectEmpty } from "#/components/ui/MultiSelectEmpty.tsx";
import { MultiSelectOptionComponent } from "#/components/ui/MultiSelectOption.tsx";
import type { ID } from "#/types/common.ts";

interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectDropdownProps {
  isOpen: boolean;
  openDirection: "down" | "up";
  options: MultiSelectOption[];
  filteredOptions: MultiSelectOption[];
  selectedIds: string[];
  searchTerm: string;
  searchPlaceholder: string;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  listboxRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onOptionClick: (id: ID) => void;
  onSelectAll: () => void;
  onSelectFiltered: () => void;
  onDeselectAll: () => void;
}

const MENU_DEFAULT_HEIGHT = 384;

export function MultiSelectDropdown({
  isOpen,
  openDirection,
  options,
  filteredOptions,
  selectedIds,
  searchTerm,
  searchPlaceholder,
  activeIndex,
  setActiveIndex,
  searchInputRef,
  listboxRef,
  triggerRef,
  dropdownRef,
  onSearchChange,
  onSearchKeyDown,
  onOptionClick,
  onSelectAll,
  onSelectFiltered,
  onDeselectAll,
}: MultiSelectDropdownProps) {
  const optionListId = useId();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setActiveIndex(-1);
    }
  }, [isOpen, searchInputRef, setActiveIndex]);

  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    const el = listboxRef.current.querySelector<HTMLElement>(
      `[data-active="true"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxRef]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchTerm, setActiveIndex]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const btnRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;

      const dropdownWidth = Math.max(btnRect.width, 280);
      const dropdownHeight = MENU_DEFAULT_HEIGHT;

      let left = btnRect.left;
      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }
      if (left < 8) left = 8;

      let top: number;
      if (openDirection === "up") {
        top = btnRect.top - dropdownHeight - 4;
        if (top < 4) {
          top = btnRect.bottom + 4;
        }
      } else {
        top = btnRect.bottom + 4;
        if (top + dropdownHeight > viewportHeight - 4) {
          top = btnRect.top - dropdownHeight - 4;
        }
      }

      setPosition({ top, left, width: dropdownWidth });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, openDirection, triggerRef]);

  const activeOptionId =
    activeIndex >= 0 ? `${optionListId}-option-${activeIndex}` : undefined;

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="max-h-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 60,
      }}
    >
      <div className="border-b border-gray-200 p-2">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            role="combobox"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            aria-controls={optionListId}
            aria-expanded={isOpen}
            aria-activedescendant={activeOptionId}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <SearchIcon
            className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>
        <MultiSelectActions
          options={options}
          filteredOptions={filteredOptions}
          selectedIds={selectedIds}
          searchTerm={searchTerm}
          onSelectAll={onSelectAll}
          onSelectFiltered={onSelectFiltered}
          onDeselectAll={onDeselectAll}
        />
      </div>

      <div
        ref={listboxRef}
        id={optionListId}
        className="max-h-60 overflow-y-auto"
        role="listbox"
        aria-multiselectable="true"
      >
        {filteredOptions.length === 0 ? (
          <MultiSelectEmpty />
        ) : (
          filteredOptions.map((opt, index) => {
            const isSelected = selectedIds.includes(opt.id);
            const isActive = index === activeIndex;
            return (
              <MultiSelectOptionComponent
                key={opt.id}
                id={`${optionListId}-option-${index}`}
                option={opt}
                isSelected={isSelected}
                isActive={isActive}
                onClick={() => onOptionClick(opt.id)}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                data-active={isActive ? "true" : "false"}
              />
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        برای جستجو تایپ کنید و برای انتخاب روی گزینه کلیک کنید
      </div>
    </div>,
    document.body,
  );
}