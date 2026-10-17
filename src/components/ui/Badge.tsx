import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "blue" | "green" | "red" | "gray" | "yellow";
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-2 text-xs font-medium items-center gap-1 ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
