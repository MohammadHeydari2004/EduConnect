import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

if (import.meta.env.VITE_APP_ENV === "development") {
  // تنظیمات خاص محیط توسعه (مثلاً لاگ کردن درخواست‌ها)
}

export default axiosInstance;
