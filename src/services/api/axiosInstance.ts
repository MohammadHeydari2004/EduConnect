import axios, { type AxiosError } from "axios";
import { API_REQUEST_TIMEOUT_MS } from "#/configs/constants.ts";
import { logger } from "#/utils/logger.ts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4003";

export class ApiError extends Error {
  public readonly userMessage: string;
  public readonly status?: number;
  public readonly code?: string;
  public readonly url?: string;
  public readonly serverData?: unknown;
  public readonly originalError: unknown;

  constructor(options: {
    userMessage: string;
    originalError: unknown;
    status?: number;
    code?: string;
    url?: string;
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

const STATUS_MESSAGES: Record<number, string> = {
  400: "درخواست ارسال‌شده نامعتبر است.",
  401: "اعتبار احراز هوایی منقضی شده است. لطفاً دوباره وارد شوید.",
  403: "دسترسی به این منبع مجاز نیست.",
  404: "منبع موردنظر در سرور یافت نشد.",
  409: "تضادی در وضعیت منبع رخ داده است.",
  500: "خطای داخلی سرور رخ داد. لطفاً بعدا‌ً تلاش کنید.",
  503: "سرور در حال حاضر در دسترس نیست.",
};

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
    STATUS_MESSAGES[error.response.status] ??
    "خطای ناشناخته‌ای در ارتباط با سرور رخ داد."
  );
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_REQUEST_TIMEOUT_MS,
});

if (import.meta.env.VITE_APP_ENV === "development") {
  axiosInstance.interceptors.request.use(
    (config) => {
      logger.debug("API Request", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        data: config.data || config.params,
      });
      return config;
    },
    (error) => Promise.reject(error),
  );
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_APP_ENV === "development") {
      logger.info("API Response", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const userMessage = resolveUserMessage(error);

    if (import.meta.env.VITE_APP_ENV === "development") {
      logger.error("API Error", {
        url: error.config?.url,
        message: userMessage,
        error,
      });
    }

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
