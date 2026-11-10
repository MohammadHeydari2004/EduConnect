import type { IconProps } from "./types.ts";

export function HourglassIcon({ className = "h-3 w-3" }: IconProps) {
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
        d="M7 4h10M7 20h10M8.5 4c0 3 .8 4.3 3.5 6-2.7 1.7-3.5 3-3.5 6M15.5 4c0 3-.8 4.3-3.5 6 2.7 1.7 3.5 3 3.5 6"
      />
    </svg>
  );
}


