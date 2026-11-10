import { ChevronDownIcon } from "#/components/common/icons";
import { FieldWrapper, useField } from "#/components/ui/FieldWrapper.tsx";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | undefined;
  options: Option[];
  error?: string | undefined;
  compact?: boolean | undefined;
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
      disabled,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const { id, errorId, describedBy } = useField({ id: propId, error });

    const stateClasses = disabled
      ? "cursor-not-allowed bg-gray-100 text-gray-500"
      : "bg-white text-gray-900";
    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100";
    const paddingClasses = compact ? "px-3 py-1.5 pr-8" : "px-3 py-2 pr-8";

    return (
      <div className="flex flex-col gap-1.5">
        <FieldWrapper
          label={label}
          required={required}
          htmlFor={id}
          error={error}
          errorId={errorId}
        />

        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy ?? describedBy}
            required={required}
            disabled={disabled}
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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
