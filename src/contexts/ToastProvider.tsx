import {
  type Toast,
  ToastContext,
  type ToastType,
} from "#/contexts/ToastContext.tsx";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const VARIANT_CLASSES: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const MAX_TOASTS = 5;

interface ToastProviderProps {
  children: ReactNode;
  /** ARIA label for the toast container (for screen readers). */
  ariaLabel?: string;
}

export function ToastProvider({ children, ariaLabel = "اعلان‌های سیستم" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4000);

      timersRef.current.add(timer);
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
        aria-label={ariaLabel}
        className="pointer-events-none fixed top-4 right-4 z-100 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ${VARIANT_CLASSES[toast.type]}`}
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
