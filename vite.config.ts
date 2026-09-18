import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ✅ استفاده از تابع برای رفع خطای TypeScript و جداسازی چانک‌ها
        manualChunks(id) {
          // بررسی تمام ماژول‌های داخل node_modules
          if (id.includes("node_modules")) {
            // جداسازی کتابخانه‌های اصلی React در یک چانک اختصاصی
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router-dom/")
            ) {
              return "react-vendor";
            }
            // سایر کتابخانه‌های خارجی در یک چانک عمومی قرار می‌گیرند
            return "vendor";
          }
        },
      },
    },
  },
});
