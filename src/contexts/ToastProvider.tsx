import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Toast, ToastContext, type ToastType } from "./ToastContext";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4000);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        role="log"
        aria-live="polite"
        aria-label="اعلان‌های سیستم"
        className="pointer-events-none fixed top-4 right-4 z-100 flex w-80 flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ${toast.type === "success" ? "border-green-200 bg-green-50 text-green-800" : toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : toast.type === "warning" ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}
          >
            <p className="flex-1 text-sm leading-relaxed font-medium">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-500 transition hover:text-gray-700"
              aria-label="بستن اعلان"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
