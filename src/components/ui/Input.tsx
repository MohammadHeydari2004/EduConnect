import { buildAriaDescribedBy } from "#/utils/accessibility.ts";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
  compact?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      suffix,
      compact = false,
      className = "",
      id: propId,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = error ? `${id}-error` : undefined;

    const paddingClasses = compact ? "px-3 py-1.5" : "px-3 py-2";
    const suffixPadding = suffix ? "pl-10" : "";

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
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={buildAriaDescribedBy(errorId)}
            required={required}
            disabled={disabled}
            className={`w-full rounded-lg border ${paddingClasses} text-sm transition-colors outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
            } ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-white text-gray-900"} ${suffixPadding} ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute top-1/2 left-2 -translate-y-1/2 flex items-center justify-center">
              {suffix}
            </div>
          )}
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

Input.displayName = "Input";

export default Input;
