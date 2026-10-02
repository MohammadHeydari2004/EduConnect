import axios, { type AxiosError } from "axios";

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

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

if (import.meta.env.VITE_APP_ENV === "development") {
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log(
        `🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data || config.params,
      );
      return config;
    },
    (error) => Promise.reject(error),
  );
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_APP_ENV === "development") {
      console.log(
        `✅ [API Response] ${response.status} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    let userMessage = "خطای ناشناخته‌ای در ارتباط با سرور رخ داد.";

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      userMessage =
        "زمان درخواست به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید.";
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      userMessage =
        "سرور در دسترس نیست. لطفاً از اجرای json-server مطمئن شوید.";
    } else if (error.response) {
      const status = error.response.status;
      const serverMessage =
        error.response.data?.message || error.response.data?.error;

      if (serverMessage) {
        userMessage = serverMessage;
      } else if (status === 404) {
        userMessage = "منبع موردنظر در سرور یافت نشد.";
      } else if (status === 500) {
        userMessage = "خطای داخلی سرور رخ داد. لطفاً بعداً تلاش کنید.";
      } else if (status === 400) {
        userMessage = "درخواست ارسال‌شده نامعتبر است.";
      } else if (status === 401) {
        userMessage = "دسترسی غیرمجاز. لطفاً مجدداً وارد حساب کاربری شوید.";
      } else if (status === 403) {
        userMessage = "شما مجوز انجام این عملیات را ندارید.";
      }
    }

    if (import.meta.env.VITE_APP_ENV === "development") {
      console.error(`❌ [API Error] ${error.config?.url}:`, userMessage, error);
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
