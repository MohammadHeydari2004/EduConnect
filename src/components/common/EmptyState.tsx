import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

function EmptyState({
  title = "داده‌ای یافت نشد",
  description = "هنوز موردی برای نمایش وجود ندارد.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-gray-700">{title}</h3>

      <p className="mb-4 max-w-sm text-sm text-gray-500">{description}</p>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
