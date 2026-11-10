import {
  FieldWrapper,
  useField,
} from "#/components/ui/FieldWrapper.tsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | undefined;
  error?: string | undefined;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      className = "",
      id: propId,
      required,
      disabled,
      readOnly,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const { id, errorId, describedBy } = useField({ id: propId, error });

    const stateClasses = disabled
      ? "cursor-not-allowed bg-gray-100 text-gray-500"
      : readOnly
        ? "cursor-text bg-gray-50 text-gray-700"
        : "bg-white text-gray-900";
    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100";

    return (
      <div className="flex flex-col gap-1.5">
        <FieldWrapper
          label={label}
          required={required}
          htmlFor={id}
          error={error}
          errorId={errorId}
        />
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy ?? describedBy}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus:ring-2 ${borderClasses} ${stateClasses} ${className}`}
          {...props}
        />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
