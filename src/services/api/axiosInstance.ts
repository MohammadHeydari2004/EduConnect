import axios, { type AxiosError } from "axios";
import { API_REQUEST_TIMEOUT_MS, HTTP_STATUS_MESSAGES } from "#/configs/constants";

export class ApiError extends Error {
  public readonly userMessage: string;
  public readonly status?: number | undefined;
  public readonly code?: string | undefined;
  public readonly url?: string | undefined;
  public readonly serverData?: unknown;
  public readonly originalError: unknown;

  constructor(options: {
    userMessage: string;
    originalError: unknown;
    status?: number | undefined;
    code?: string | undefined;
    url?: string | undefined;
    serverData?: unknown;
  }) {
    super(options.userMessage, { cause: options.originalError });

    this.name = "ApiError";
    this.userMessage = options.userMessage;
    this.originalError = options.originalError;
    this.status = options.status;
    this.code = options.code;
    this.url = options.url;
    this.serverData = options.serverData;

    if (options.originalError instanceof Error && options.originalError.stack) {
      this.stack = options.originalError.stack;
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function resolveUserMessage(
  error: AxiosError<{ message?: string; error?: string }>,
): string {
  if (error.code === "ECONNABORTED") {
    return "زمان درخواست به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید.";
  }

  if (error.code === "ERR_NETWORK" || !error.response) {
    return "سرور در دسترس نیست. لطفاً از اجرای json-server مطمئن شوید.";
  }

  const serverMessage =
    error.response.data?.message || error.response.data?.error;

  if (serverMessage) return serverMessage;

  return (
    HTTP_STATUS_MESSAGES[error.response.status] ??
    "خطای ناشناخته‌ای در ارتباط با سرور رخ داد."
  );
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4003",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_REQUEST_TIMEOUT_MS,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const userMessage = resolveUserMessage(error);

    return Promise.reject(
      new ApiError({
        userMessage,
        originalError: error,
        status: error.response?.status,
        code: error.code,
        url: error.config?.url,
        serverData: error.response?.data,
      }),
    );
  },
);

export default axiosInstance;
