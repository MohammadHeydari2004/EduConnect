interface EmptyStateProps {
  title?: string;
  description?: string;
}

function EmptyState({
  title = "داده‌ای یافت نشد",
  description = "هنوز موردی برای نمایش وجود ندارد.",
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default EmptyState;
