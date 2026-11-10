import { SearchIcon } from "#/components/common/icons";
import { createPortal } from "react-dom";
import { usePortalPosition } from "#/hooks/usePortalPosition.ts";
import { useEffect, useMemo, useRef } from "react";
import { MultiSelectActions } from "#/components/ui/MultiSelectActions.tsx";
import { MultiSelectEmpty } from "#/components/ui/MultiSelectEmpty.tsx";
import { MultiSelectOptionComponent } from "#/components/ui/MultiSelectOption.tsx";
import type { ID } from "#/types/common.ts";
import type { MultiSelectOption } from "#/types/hooks.ts";

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
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  listboxId: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onOptionClick: (id: ID) => void;
  onSelectAll: () => void;
  onSelectFiltered: () => void;
  onDeselectAll: () => void;
  onActiveIndexChange?: (index: number) => void;
}

const MENU_DEFAULT_HEIGHT = 320;

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
  listboxId,
  onSearchChange,
  onSearchKeyDown,
  onOptionClick,
  onSelectAll,
  onSelectFiltered,
  onDeselectAll,
  onActiveIndexChange,
}: MultiSelectDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const position = usePortalPosition({
    triggerRef: triggerRef,
    menuRef: dropdownRef,
    defaultWidth: 280,
    defaultHeight: MENU_DEFAULT_HEIGHT,
    viewportPadding: 8,
    openDirection,
  });

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!isOpen) {
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

  const activeOptionId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  if (!isOpen) return null;

  const viewportH =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const maxH = Math.min(384, Math.max(200, viewportH - 32));

  return createPortal(
    <div
      ref={(el) => {
        (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        maxWidth: "calc(100vw - 16px)",
        maxHeight: maxH,
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
            aria-controls={listboxId}
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
        id={listboxId}
        className="max-h-56 overflow-y-auto"
        role="listbox"
        aria-multiselectable="true"
      >
        {filteredOptions.length === 0 ? (
          <MultiSelectEmpty />
        ) : (
          filteredOptions.map((opt, index) => {
            const isSelected = selectedIdsSet.has(opt.id);
            const isActive = index === activeIndex;
            return (
              <MultiSelectOptionComponent
                key={opt.id}
                id={`${listboxId}-option-${index}`}
                option={opt}
                isSelected={isSelected}
                isActive={isActive}
                onClick={() => {
                  onOptionClick(opt.id);
                  if (onActiveIndexChange) onActiveIndexChange(index);
                }}
                aria-selected={isSelected}
                data-active={isActive ? "true" : "false"}
              />
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        برای جستجو تایپ کنید و برای انتخاب روی گزینه کلیک کنید یا Enter بزنید
      </div>
    </div>,
    document.body,
  );
}
