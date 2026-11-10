import { useMenuClose } from "#/hooks/useMenuPropagation.ts";
import type { ReactNode } from "react";

const BASE_CLASS =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

type MenuItemTone = "default" | "danger" | "disabled";

const TONE_CLASSES: Record<MenuItemTone, string> = {
  default: "text-gray-700 hover:bg-gray-50",
  danger: "text-red-600 hover:bg-red-50",
  disabled: "text-gray-400 cursor-not-allowed",
};

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onAction: () => void;
  ariaLabel?: string;
}

export default function MenuItem({
  label,
  icon,
  danger = false,
  disabled = false,
  onAction,
  ariaLabel,
}: MenuItemProps) {
  const close = useMenuClose();
  const tone: MenuItemTone = disabled ? "disabled" : danger ? "danger" : "default";
  const handleClick = () => {
    if (disabled) return;
    onAction();
    close?.();
  };
  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={`${BASE_CLASS} ${TONE_CLASSES[tone]}`}
      aria-label={ariaLabel}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}
