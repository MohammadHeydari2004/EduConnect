import Card from "#/components/ui/Card.tsx";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
  description?: string;
}

export default function StatCard({
  title,
  value,
  color = "text-blue-600",
  description,
}: StatCardProps) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
      {description && (
        <div className="mt-1 text-xs text-gray-400">{description}</div>
      )}
    </Card>
  );
}
