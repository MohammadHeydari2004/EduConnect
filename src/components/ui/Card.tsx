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
      className={`rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}
    >
      {title && (
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}

      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export default Card;
