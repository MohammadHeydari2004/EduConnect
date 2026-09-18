import App from "#/App.tsx";
import ErrorBoundary from "#/components/common/ErrorBoundary.tsx";
import AuthProvider from "#/contexts/AuthProvider.tsx";
import { ToastProvider } from "#/contexts/ToastContext.tsx";
import "#/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
