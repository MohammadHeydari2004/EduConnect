import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  description?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      description,
      placeholder,
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
    const descId = description ? `${id}-desc` : undefined;

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
            aria-describedby={
              [errorId, descId].filter(Boolean).join(" ") || undefined
            }
            required={required}
            className={`w-full appearance-none rounded-lg border px-3 py-2 pl-8 text-sm transition-colors outline-none focus:ring-2 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"} ${props.disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-white text-gray-900"} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
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
            <svg
              className="h-4 w-4 text-gray-400"
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
        </div>

        {error && (
          <span id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}

        {!error && description && (
          <span id={descId} className="text-xs text-gray-500">
            {description}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
