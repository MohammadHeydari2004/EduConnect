import Button from "#/components/ui/Button.tsx";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type ErrorColorVariant = "blue" | "red";

interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
  colorVariant: ErrorColorVariant;
  icon: ReactNode;
}

const COLOR_CLASSES: Record<ErrorColorVariant, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

function ErrorPage({
  code,
  title,
  message,
  colorVariant,
  icon,
}: ErrorPageProps) {
  const navigate = useNavigate();
  const colors = COLOR_CLASSES[colorVariant];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${colors.bg}`}
      >
        <span className={`h-12 w-12 ${colors.text}`}>{icon}</span>
      </div>

      <h1 className="mb-2 text-6xl font-bold text-gray-800 sm:text-7xl">
        {code}
      </h1>

      <h2 className="mb-4 text-xl font-semibold text-gray-700 sm:text-2xl">
        {title}
      </h2>

      <p className="mb-8 max-w-md text-gray-500">{message}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => navigate("/")}>
          بازگشت به صفحه اصلی
        </Button>
        <Button variant="secondary" onClick={() => window.history.back()}>
          بازگشت به صفحه قبل
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
