import {
  type Toast,
  ToastContext,
  type ToastType,
} from "#/contexts/ToastContext.ts";
import type { ApiErrorInfo } from "#/types";
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
const TOAST_DURATION_MS = 4000;

const createToastId = (): string =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const stopTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const removeToast = useCallback(
    (id: string) => {
      stopTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [stopTimer],
  );

  const startTimer = useCallback(
    (id: string) => {
      stopTimer(id);
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        removeToast(id);
      }, TOAST_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast, stopTimer],
  );

  const addToast = useCallback(
    (message: string, type: ToastType = "info", errorInfo?: ApiErrorInfo) => {
      const id = createToastId();
      setToasts((prev) => {
        const next = [...prev, { id, message, type, ...(errorInfo !== undefined ? { errorInfo } : {}) }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      startTimer(id);
    },
    [startTimer],
  );

  const showErrorWithInfo = useCallback(
    (message: string, errorInfo?: ApiErrorInfo) => {
      addToast(message, "error", errorInfo);
    },
    [addToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    for (const id of timersRef.current.keys()) {
      if (!toasts.some((toast) => toast.id === id)) {
        stopTimer(id);
      }
    }
  }, [toasts, stopTimer]);

  return (
    <ToastContext.Provider value={{ addToast, showErrorWithInfo }}>
      {children}
      <div className="pointer-events-none fixed top-4 start-4 z-100 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            tabIndex={0}
            onMouseEnter={() => stopTimer(toast.id)}
            onMouseLeave={() => startTimer(toast.id)}
            onFocus={() => stopTimer(toast.id)}
            onBlur={() => startTimer(toast.id)}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg ${VARIANT_CLASSES[toast.type]}`}
          >
            <div className="flex-1">
              <p className="text-sm leading-relaxed font-medium">
                {toast.message}
              </p>
              {toast.errorInfo && (
                <p className="mt-1 text-xs opacity-70">
                  {toast.errorInfo.status ? `(status ${toast.errorInfo.status})` : ""}
                  {toast.errorInfo.code ? ` · کد: ${toast.errorInfo.code}` : ""}
                </p>
              )}
            </div>
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
