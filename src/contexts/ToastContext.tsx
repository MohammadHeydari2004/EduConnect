import { createContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
ToastContext.displayName = "ToastContext";

export default ToastContext;
