import { WarningIcon } from "#/components/common/icons";
import Button from "#/components/ui/Button.tsx";
import type { ReactNode } from "react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

function ErrorFallback({
  error,
  resetErrorBoundary,
  heading = "h2",
}: FallbackProps & { heading?: "h1" | "h2" | "h3" }) {
  const HeadingTag = heading;
  return (
    <div
      role="alert"
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <WarningIcon className="h-8 w-8 text-red-600" />
        </div>
        <HeadingTag className="mb-2 text-xl font-bold text-gray-800 ">
          خطای غیرمنتظره در رندر
        </HeadingTag>
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

        <Button onClick={resetErrorBoundary}>تلاش مجدد</Button>
      </div>
    </div>
  );
}

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  resetKeys?: unknown[] | undefined;
  heading?: "h1" | "h2" | "h3";
}

function ErrorBoundaryWrapper({
  children,
  resetKeys,
  heading = "h2",
}: ErrorBoundaryWrapperProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={({
        error,
        resetErrorBoundary,
      }: FallbackProps) => (
        <ErrorFallback
          error={error}
          heading={heading}
          resetErrorBoundary={resetErrorBoundary}
        />
      )}
      {...(resetKeys !== undefined ? { resetKeys } : {})}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundaryWrapper;
