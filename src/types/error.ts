type ErrorCategory =
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