interface LoadingProps {
  text?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

function Loading({
  text = "در حال بارگذاری...",
  size = "md",
  className = "",
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-10";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClasses} ${className}`}
    >
      <svg
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      {text && (
        <p
          className={`mt-3 font-medium text-gray-600 ${textSizeClasses[size]}`}
        >
          {text}
        </p>
      )}
      {!text && <span className="sr-only">در حال بارگذاری...</span>}
    </div>
  );
}

export default Loading;
