import { buildAriaDescribedBy } from "#/utils/accessibility.ts";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "#/components/common/icons";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string | undefined;
  compact?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      compact = false,
      className = "",
      id: propId,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;

    const errorId = error ? `${id}-error` : undefined;

    const stateClasses = props.disabled
      ? "cursor-not-allowed bg-gray-100 text-gray-500"
      : "bg-white text-gray-900";
    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100";
    const paddingClasses = compact ? "px-3 py-1.5" : "px-3 py-2";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="mr-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={buildAriaDescribedBy(errorId)}
            required={required}
            className={`w-full appearance-none rounded-lg border ${paddingClasses} pl-8 text-sm transition-colors outline-none focus:ring-2 ${borderClasses} ${stateClasses} ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {error && (
          <span id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
