import { RouterErrorBoundary } from "#/components/common/RouterErrorBoundary";
import AuthProvider from "#/contexts/AuthProvider";
import { ToastProvider } from "#/contexts/ToastProvider";
import AppRoutes from "#/routes/AppRoutes";
import "#/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "عنصر root در صفحه یافت نشد. لطفاً فایل index.html را بررسی کنید.",
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouterErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </RouterErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
