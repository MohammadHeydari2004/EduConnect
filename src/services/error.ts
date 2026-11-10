import { isApiError } from "#/services/api/axiosInstance.ts";
import { HTTP_STATUS_MESSAGES } from "#/configs/constants";
import type { ApiErrorInfo, ErrorCategory } from "#/types/error.ts";

export type { ErrorCategory, ApiErrorInfo };

const STATUS_CATEGORIES: Record<number, ErrorCategory> = {
  400: "VALIDATION",
  401: "AUTH",
  403: "AUTH",
  404: "NOT_FOUND",
  409: "SERVER",
  500: "SERVER",
  503: "SERVER",
};

const STATUS_MESSAGES: Record<number, { message: string; category: ErrorCategory }> = Object.fromEntries(
  Object.entries(HTTP_STATUS_MESSAGES).map(([status, message]) => [
    Number(status),
    { message, category: STATUS_CATEGORIES[Number(status)] ?? "UNKNOWN" },
  ]),
);

const RETRYABLE_CATEGORIES: ErrorCategory[] = ["NETWORK", "TIMEOUT", "SERVER"];

type AxiosLike = {
  code?: string;
  response?: { status?: number; data?: unknown };
  config?: { url?: string };
};

function buildInfo(
  category: ErrorCategory,
  userMessage: string,
  axiosLike: AxiosLike | null,
  originalError: unknown,
  status?: number,
): ApiErrorInfo {
  const info: ApiErrorInfo = {
    category,
    userMessage,
    originalError,
    isRetryable: RETRYABLE_CATEGORIES.includes(category),
  };
  if (status !== undefined) {
    info.status = status;
  }
  if (axiosLike?.code !== undefined) {
    info.code = axiosLike.code;
  }
  if (axiosLike?.config?.url !== undefined) {
    info.url = axiosLike.config.url;
  }
  if (axiosLike?.response?.data !== undefined) {
    info.serverData = axiosLike.response.data;
  }
  return info;
}

function classifyAxiosError(error: AxiosLike): ApiErrorInfo {
  if (error.code === "ECONNABORTED") {
    return buildInfo(
      "TIMEOUT",
      "زمان درخواست به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید.",
      error,
      error,
    );
  }

  if (error.code === "ERR_NETWORK" || !error.response) {
    return buildInfo(
      "NETWORK",
      "سرور در دسترس نیست. لطفاً از اجرای json-server مطمئن شوید.",
      error,
      error,
    );
  }

  const status = error.response?.status;
  const entry = status ? STATUS_MESSAGES[status] : undefined;
  const category = entry?.category ?? "UNKNOWN";
  const serverMessage =
    error.response?.data && typeof error.response.data === "object"
      ? (error.response.data as { message?: string; error?: string }).message ||
        (error.response.data as { message?: string; error?: string }).error
      : undefined;

  return buildInfo(
    category,
    serverMessage ?? entry?.message ?? "خطای ناشناخته‌ای در ارتباط با سرور رخ داد.",
    error,
    error,
    status,
  );
}

function classifyGenericError(err: unknown): ApiErrorInfo {
  const originalError = err instanceof Error ? err : new Error(String(err));
  return buildInfo(
    "UNKNOWN",
    originalError.message || "خطای ناشناخته‌ای رخ داد.",
    null,
    originalError,
  );
}

export function classifyError(err: unknown): ApiErrorInfo {
  if (isApiError(err)) {
    const axiosLike = err.originalError as AxiosLike | undefined;
    const info = axiosLike
      ? classifyAxiosError(axiosLike)
      : buildInfo("UNKNOWN", err.userMessage, null, err.originalError);
    info.userMessage = err.userMessage;
    if (err.status !== undefined) {
      info.status = err.status;
    }
    if (err.code !== undefined) {
      info.code = err.code;
    }
    if (err.url !== undefined) {
      info.url = err.url;
    }
    if (err.serverData !== undefined) {
      info.serverData = err.serverData;
    }
    info.isRetryable = isRetryableError(info);
    return info;
  }

  if (err instanceof Error) {
    const axiosLike = err as AxiosLike;
    if (axiosLike.code || axiosLike.response) {
      return classifyAxiosError(axiosLike);
    }
    return classifyGenericError(err);
  }

  return classifyGenericError(err);
}

export function isRetryableError(info: ApiErrorInfo): boolean {
  return RETRYABLE_CATEGORIES.includes(info.category);
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return classifyError(err).userMessage || fallback;
}
