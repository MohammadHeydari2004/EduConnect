import type { ReactNode } from "react";

const BASE_CLASS =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50";
const DANGER_CLASS =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50";
const DISABLED_CLASS =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-gray-400 cursor-not-allowed";

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onAction: () => void;
  ariaLabel?: string;
}

/**
 * A single row inside the mobile `ActionsMenu` (Table.tsx). Centralizes the
 * styling that was copy-pasted across UserTable / ClassTable / AssignmentsPage.
 */
export default function MenuItem({
  label,
  icon,
  danger = false,
  disabled = false,
  onAction,
  ariaLabel,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onAction}
      disabled={disabled}
      className={
        disabled
          ? DISABLED_CLASS
          : danger
          ? DANGER_CLASS
          : BASE_CLASS
      }
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
