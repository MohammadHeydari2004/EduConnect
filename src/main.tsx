import App from "#/App";
import { RouterErrorBoundary } from "#/components/common/RouterErrorBoundary";
import ScrollToTop from "#/components/common/ScrollToTop";
import AuthProvider from "#/contexts/AuthProvider";
import "#/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "عنصر root در صفحه یافت نشد. لطفاً فایل index.html را بررسی کنید.",
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <RouterErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </RouterErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
