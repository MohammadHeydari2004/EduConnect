export type ErrorCategory =
  | "NETWORK"
  | "TIMEOUT"
  | "AUTH"
  | "NOT_FOUND"
  | "VALIDATION"
  | "SERVER"
  | "UNKNOWN";

export interface ApiErrorInfo {
  category: ErrorCategory;
  userMessage: string;
  status?: number;
  code?: string;
  url?: string;
  serverData?: unknown;
  originalError: unknown;
  isRetryable: boolean;
}

export interface ErrorHandlerConfig {
  defaultUserMessage?: string;
  fallbackCategory?: ErrorCategory;
  retryableCategories?: ErrorCategory[];
  toastTypeByCategory?: Record<ErrorCategory, "success" | "error" | "info" | "warning">;
}
