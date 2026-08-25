import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
}

function Card({ children, title }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default Card;
