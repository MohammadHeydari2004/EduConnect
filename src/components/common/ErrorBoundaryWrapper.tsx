import type { ReactNode } from "react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            aria-hidden="true"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-800">
          خطای غیرمنتظره در رندر
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          متأسفانه مشکلی در بارگذاری برنامه رخ داده است. لطفاً صفحه را مجدداً
          بارگذاری کنید.
        </p>

        {import.meta.env.DEV && error ? (
          <pre
            dir="ltr"
            className="mb-6 max-h-32 overflow-y-auto rounded-lg bg-gray-100 p-3 text-left text-xs text-red-600"
          >
            {error instanceof Error
              ? error.stack || error.message
              : String(error)}
          </pre>
        ) : null}

        <button
          onClick={resetErrorBoundary}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  resetKeys?: unknown[];
}

function ErrorBoundaryWrapper({
  children,
  resetKeys,
}: ErrorBoundaryWrapperProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={resetKeys}
      onError={(error, errorInfo) => {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundaryWrapper;
