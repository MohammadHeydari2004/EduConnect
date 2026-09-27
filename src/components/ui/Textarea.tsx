import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      description,
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
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={
            [errorId, descId].filter(Boolean).join(" ") || undefined
          }
          required={required}
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus:ring-2 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"} ${props.disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : props.readOnly ? "cursor-text bg-gray-50 text-gray-700" : "bg-white text-gray-900"} ${className}`}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export default Textarea;
