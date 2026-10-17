import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

function Card({
  children,
  title,
  className = "",
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}
    >
      {title && (
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export default Card;
