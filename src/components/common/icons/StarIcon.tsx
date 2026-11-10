import type { IconProps } from "./types.ts";

export function StarIcon({ className = "h-3 w-3" }: IconProps) {
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
        d="M11.05 3.77a1 1 0 011.9 0l1.4 4.3a1 1 0 00.95.7l4.6.34a1 1 0 01.58 1.8l-3.7 2.7a1 1 0 00-.36 1.1l1.3 4.4a1 1 0 01-1.5 1.1l-3.85-2.8a1 1 0 00-1.2 0l-3.85 2.8a1 1 0 01-1.5-1.1l1.3-4.4a1 1 0 00-.36-1.1l-3.7-2.7a1 1 0 01.58-1.8l4.6-.34a1 1 0 00.95-.7z"
      />
    </svg>
  );
}


