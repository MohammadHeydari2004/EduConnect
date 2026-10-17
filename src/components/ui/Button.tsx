import Spinner from "#/components/ui/Spinner.tsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "danger-light";
  isLoading?: boolean;
}

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  success: "bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-400",
  "danger-light": "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-400",
};

const DISABLED_CLASSES = "opacity-50 cursor-not-allowed pointer-events-none";

function buildClassName(
  variant: ButtonProps["variant"],
  disabled: boolean,
  className: string,
): string {
  const parts = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant ?? "primary"],
    disabled ? DISABLED_CLASSES : "",
    className,
  ];
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={buildClassName(variant, isDisabled, className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export default Button;
