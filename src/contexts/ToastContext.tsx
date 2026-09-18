import type { ReactNode } from "react";
import { createContext, useCallback, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-100 flex w-80 flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between rounded-lg border p-4 shadow-lg transition-all duration-300 ${toast.type === "success" ? "border-green-200 bg-green-50 text-green-800" : toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : toast.type === "warning" ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}
          >
            <p className="text-sm leading-relaxed font-medium">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="mr-3 text-gray-500 transition hover:text-gray-700"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
