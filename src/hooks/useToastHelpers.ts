import type { ApiErrorInfo } from "#/services/error.ts";
import type { ToastType } from "#/contexts/ToastContext.tsx";

const CATEGORY_TOAST_TYPE: Record<ApiErrorInfo["category"], ToastType> = {
  NETWORK: "error",
  TIMEOUT: "error",
  AUTH: "error",
  NOT_FOUND: "info",
  VALIDATION: "warning",
  SERVER: "error",
  UNKNOWN: "error",
};

export function showErrorToast(
  addToast: (message: string, type: "error") => void,
  message: string,
): void {
  addToast(message, "error");
}

export function showErrorToastWithInfo(
  addToast: (message: string, type?: ToastType, errorInfo?: ApiErrorInfo) => void,
  errorInfo: ApiErrorInfo,
  fallbackMessage?: string,
): void {
  const type = CATEGORY_TOAST_TYPE[errorInfo.category];
  addToast(fallbackMessage ?? errorInfo.userMessage, type, errorInfo);
}

export function showErrorToastWithCategory(
  addToast: (message: string, type: ToastType) => void,
  category: ApiErrorInfo["category"],
  message: string,
): void {
  const type = CATEGORY_TOAST_TYPE[category];
  addToast(message, type);
}
