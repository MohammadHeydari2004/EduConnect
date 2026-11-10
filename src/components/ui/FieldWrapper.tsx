import { useId } from "react";

export function buildAriaDescribedBy(
  errorId?: string | undefined,
  descId?: string | undefined,
): string | undefined {
  const ids = [errorId, descId].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export interface UseFieldOptions {
  id?: string | undefined;
  error?: string | undefined;
  descId?: string | undefined;
}

export interface UseFieldResult {
  id: string;
  errorId: string | undefined;
  describedBy: string | undefined;
}

export function useField({
  id: propId,
  error,
  descId,
}: UseFieldOptions = {}): UseFieldResult {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  return { id, errorId, describedBy: buildAriaDescribedBy(errorId, descId) };
}

export function FieldWrapper({
  label,
  required,
  htmlFor,
  error,
  errorId,
}: {
  label?: string | undefined;
  required?: boolean | undefined;
  htmlFor: string;
  error?: string | undefined;
  errorId?: string | undefined;
}) {
  return (
    <>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="me-1 text-red-500 px-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {error && (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </>
  );
}
