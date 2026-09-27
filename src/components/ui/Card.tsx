import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

function Card({
  children,
  title,
  actions,
  footer,
  className = "",
  bodyClassName = "",
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      <div className={noPadding ? "" : `p-5 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="rounded-b-xl border-t border-gray-100 bg-gray-50/50 px-5 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
