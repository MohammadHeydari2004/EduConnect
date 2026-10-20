import { ChevronDownIcon, CloseIcon } from "#/components/common/icons";
import type { ID } from "#/types/common.ts";
import type { MultiSelectOption } from "./MultiSelectTypes.ts";
import type { HTMLAttributes, Ref } from "react";
import { forwardRef, useRef } from "react";

interface MultiSelectTriggerProps extends HTMLAttributes<HTMLDivElement> {
  selectedOptions: MultiSelectOption[];
  isOpen: boolean;
  placeholder: string;
  error?: string;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onRemoveChip: (id: ID) => void;
  triggerRef?: Ref<HTMLDivElement>;
}

const MAX_VISIBLE_CHIPS = 5;

export const MultiSelectTrigger = forwardRef<HTMLDivElement, MultiSelectTriggerProps>(
  (
    {
      selectedOptions,
      isOpen,
      placeholder,
      error,
      onClick,
      onKeyDown,
      onRemoveChip,
      triggerRef,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      "aria-expanded": ariaExpanded,
      "aria-haspopup": ariaHaspopup,
      ...rest
    },
    ref,
  ) => {
    const triggerElementRef = useRef<HTMLDivElement>(null);
    const combinedRef = (el: HTMLDivElement | null) => {
      triggerElementRef.current = el;
      if (typeof triggerRef === "function") triggerRef(el);
      else if (triggerRef && typeof triggerRef === "object") triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref && typeof ref === "object") ref.current = el;
    };

    return (
      <div className="relative">
        <div
          ref={combinedRef}
          tabIndex={0}
          onClick={onClick}
          onKeyDown={onKeyDown}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHaspopup}
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          {...rest}
          className={`flex min-h-10.5 w-full cursor-pointer items-center rounded-lg border ${
            error ? "border-red-500" : "border-gray-300"
          } bg-white px-3 py-2 text-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100`}
        >
          {selectedOptions.length === 0 ? (
            <div className="flex w-full items-center justify-between">
              <span className="text-gray-400">{placeholder}</span>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          ) : (
            <div className="flex w-full items-center gap-2">
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {selectedOptions.slice(0, MAX_VISIBLE_CHIPS).map((opt) => (
                  <span
                    key={opt.id}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {opt.label}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveChip(opt.id);
                        }}
                        className="rounded-full p-0.5 transition hover:bg-blue-100"
                        aria-label={`حذف ${opt.label}`}
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {selectedOptions.length > MAX_VISIBLE_CHIPS && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    +{selectedOptions.length - MAX_VISIBLE_CHIPS} دیگر
                  </span>
                )}
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);