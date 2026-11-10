import type { IconProps } from "./types.ts";

export function SendIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l7-7 3 3-7 7-3-3zM3 3l7.5 7.5"
      />
    </svg>
  );
}


