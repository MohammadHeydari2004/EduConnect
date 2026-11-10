interface EmptyStateProps {
  title?: string;
  description?: string;
  headingLevel?: "h2" | "h3" | "h4" | "h5" | "h6";
  "aria-label"?: string;
  "aria-live"?: "polite" | "assertive";
  role?: "status" | "alert";
}

function EmptyState({
  title = "داده‌ای یافت نشد",
  description = "هنوز موردی برای نمایش وجود ندارد.",
  headingLevel,
  "aria-label": ariaLabel,
  "aria-live": ariaLive = "polite",
  role = "status",
}: EmptyStateProps) {
  const HeadingTag = headingLevel ?? "h2";
  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-label={ariaLabel}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"
    >
      <HeadingTag className="mb-2 text-base font-semibold text-gray-700">
        {title}
      </HeadingTag>
      <p className="mb-4 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default EmptyState;
