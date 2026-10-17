import Card from "#/components/ui/Card.tsx";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
  description?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  color = "text-blue-600",
  description,
  className = "",
}: StatCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("fa-IR") : value;

  return (
    <Card className={className}>
      <div
        className="flex flex-col items-center"
        role="group"
        aria-label={`${title}: ${formattedValue}`}
      >
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className={`mt-2 text-3xl font-bold ${color}`}>
          {formattedValue}
        </span>
        {description && (
          <span className="mt-1 text-xs text-gray-400">{description}</span>
        )}
      </div>
    </Card>
  );
}
