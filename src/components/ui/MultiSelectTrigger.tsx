import { ChevronDownIcon } from "#/components/common/icons";
import { forwardRef, useId } from "react";
import type { ID } from "#/types/common.ts";

const MAX_VISIBLE_CHIPS = 5;

interface MultiSelectTriggerProps {
  selectedOptions: Array<{ id: string; label: string; subLabel?: string }>;
  isOpen: boolean;
  placeholder: string;
  error?: string | undefined;
  onClick: () => void;
  onRemoveChip?: (id: ID) => void;
  "aria-labelledby"?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-invalid"?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  "aria-expanded"?: boolean | undefined;
  "aria-haspopup"?: "listbox" | undefined;
  "aria-controls"?: string | undefined;
  disabled?: boolean;
}

export const MultiSelectTrigger = forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
  (
    {
      selectedOptions,
      isOpen,
      placeholder,
      error,
      onClick,
      onRemoveChip,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      "aria-expanded": ariaExpanded,
      "aria-haspopup": ariaHaspopup,
      "aria-controls": ariaControls,
      disabled = false,
    },
    ref,
  ) => {
    const chipsContainerId = useId();
    const controlsId = ariaControls ?? chipsContainerId;
    return (
      <div className="relative">
        <button
          type="button"
          ref={ref}
          onClick={onClick}
          disabled={disabled}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHaspopup}
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          aria-controls={controlsId}
          className={`flex min-h-10.5 w-full cursor-pointer items-center rounded-lg border ${
            error ? "border-red-500" : "border-gray-300"
          } bg-white px-3 py-2 text-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {selectedOptions.length === 0 ? (
            <span className="flex w-full items-center justify-between">
              <span className="text-gray-400">{placeholder}</span>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </span>
          ) : (
            <span id={chipsContainerId} className="flex w-full items-center gap-2">
              <span className="flex flex-1 flex-wrap items-center gap-1.5">
                {selectedOptions.slice(0, MAX_VISIBLE_CHIPS).map((opt) => (
                  <span
                    key={opt.id}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {opt.label}
                    {onRemoveChip ? (
                      <button
                        type="button"
                        aria-label={`حذف کردن ${opt.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemoveChip(opt.id);
                        }}
                        className="ms-0.5 inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <svg viewBox="0 0 8 8" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    ) : null}
                  </span>
                ))}
                {selectedOptions.length > MAX_VISIBLE_CHIPS && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    +{selectedOptions.length - MAX_VISIBLE_CHIPS} دیگر
                  </span>
                )}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </span>
          )}
        </button>
      </div>
    );
  },
);

MultiSelectTrigger.displayName = "MultiSelectTrigger";
