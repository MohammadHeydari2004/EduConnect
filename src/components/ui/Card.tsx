import type { ReactNode } from "react";

type CardTitleLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  headingLevel?: CardTitleLevel;
  className?: string;
  noPadding?: boolean;
  overflow?: "hidden" | "visible";
}

function Card({
  children,
  title,
  headingLevel,
  className = "",
  noPadding = false,
  overflow = "visible",
}: CardProps) {
  const level: CardTitleLevel = headingLevel ?? "h2";
  const TitleTag = level;
  const overflowClass = overflow === "hidden" ? "overflow-hidden" : "overflow-visible";
  return (
    <div
      className={`${overflowClass} rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}
    >
      {title && (
        <div className="border-b border-gray-100 px-5 py-4">
          <TitleTag className="text-lg font-semibold text-gray-800">{title}</TitleTag>
        </div>
      )}

      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export default Card;
