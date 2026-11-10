import { FieldWrapper, useField } from "#/components/ui/FieldWrapper.tsx";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  error?: string | undefined;
  suffix?: ReactNode;
  compact?: boolean | undefined;
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
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const { id, errorId, describedBy } = useField({ id: propId, error });

    const paddingClasses = compact ? "px-3 py-1.5" : "px-3 py-2";
    const suffixPadding = suffix ? "px-8" : "";

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
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy ?? describedBy}
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
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center">
              {suffix}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
