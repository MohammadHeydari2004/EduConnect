import Card from "#/components/ui/Card.tsx";
import type { BadgeVariant } from "#/components/ui/Badge.tsx";

const TONE_CLASSES: Record<BadgeVariant | "purple" | "gray", string> = {
  blue: "text-blue-600",
  green: "text-green-600",
  red: "text-red-600",
  gray: "text-gray-600",
  yellow: "text-yellow-600",
  purple: "text-purple-600",
};

export type StatCardTone = keyof typeof TONE_CLASSES;

export type StatCardColor =
  | "text-blue-600"
  | "text-green-600"
  | "text-red-600"
  | "text-gray-600"
  | "text-yellow-600"
  | "text-purple-600"
  | "text-gray-800";

const COLOR_CLASS_SET = new Set<string>([
  "text-blue-600",
  "text-green-600",
  "text-red-600",
  "text-gray-600",
  "text-yellow-600",
  "text-purple-600",
  "text-gray-800",
]);

interface StatCardProps {
  title: string;
  value: string | number;
  tone?: StatCardTone;
  color?: StatCardColor;
  description?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  tone,
  color,
  description,
  className = "",
}: StatCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("fa-IR") : value;

  const colorClass = color && COLOR_CLASS_SET.has(color) ? color : tone ? TONE_CLASSES[tone] : TONE_CLASSES.blue;

  return (
    <Card className={className}>
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className={`mt-2 text-3xl font-bold ${colorClass}`}>
          {formattedValue}
        </span>
        {description && (
          <span className="mt-1 text-xs text-gray-400">{description}</span>
        )}
      </div>
    </Card>
  );
}
