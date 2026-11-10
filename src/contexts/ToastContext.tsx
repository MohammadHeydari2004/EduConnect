import { createContext } from "react";
import type { ApiErrorInfo } from "#/services/error.ts";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  errorInfo?: ApiErrorInfo;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, errorInfo?: ApiErrorInfo) => void;
  showErrorWithInfo: (message: string, errorInfo?: ApiErrorInfo) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
ToastContext.displayName = "ToastContext";

export default ToastContext;
