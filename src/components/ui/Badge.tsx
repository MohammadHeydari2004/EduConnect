import type { ReactNode } from "react";

export type BadgeVariant = "blue" | "green" | "red" | "gray" | "yellow";
export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5",
  md: "px-2.5 py-1",
  lg: "px-3 py-1.5",
};

const FONT_WEIGHT_CLASSES: Record<NonNullable<BadgeProps["fontWeight"]>, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

function Badge({
  children,
  variant = "gray",
  size = "md",
  className = "",
  fontWeight = "medium",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full text-xs items-center gap-1 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${FONT_WEIGHT_CLASSES[fontWeight]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
