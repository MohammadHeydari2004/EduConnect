import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

interface UseFieldErrorsResult<T extends object> {
  errors: T;
  setErrors: Dispatch<SetStateAction<T>>;
  clearError: (field: keyof T) => void;
}

export function useFieldErrors<T extends object>(): UseFieldErrorsResult<T> {
  const [errors, setErrors] = useState<T>({} as T);

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: undefined } as T;
    });
  }, []);

  return { errors, setErrors, clearError };
}
