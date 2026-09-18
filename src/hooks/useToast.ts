import ToastContext from "#/contexts/ToastContext.tsx";
import { useContext } from "react";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
