import { WarningIcon } from "#/components/common/icons";
import type { ReactNode } from "react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { logger } from "#/utils/logger.ts";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <WarningIcon className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-800">
          خطای غیرمنتظره در رندر
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          متأسفانه مشکلی در بارگذاری برنامه رخ داده است. می‌توانید دوباره
          تلاش کنید.
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
  resetKeys?: unknown[] | undefined;
}

function ErrorBoundaryWrapper({
  children,
  resetKeys,
}: ErrorBoundaryWrapperProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      {...(resetKeys !== undefined ? { resetKeys } : {})}
      onError={(error, errorInfo) => {
        logger.error("ErrorBoundary caught an error", {
          error: error instanceof Error ? error.stack ?? error.message : String(error),
          errorInfo,
        });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundaryWrapper;
