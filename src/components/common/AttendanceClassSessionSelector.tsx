import Card from "#/components/ui/Card.tsx";
import Select from "#/components/ui/Select.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import { formatDate } from "#/utils/formatDate.ts";

interface AttendanceClassSessionSelectorProps {
  classes: ClassItem[];
  sessions: Session[];
  selectedClassId: string;
  selectedSessionId: string;
  onClassChange: (newClassId: string) => void;
  onSessionChange: (newSessionId: string) => void;
}

export default function AttendanceClassSessionSelector({
  classes,
  sessions,
  selectedClassId,
  selectedSessionId,
  onClassChange,
  onSessionChange,
}: AttendanceClassSessionSelectorProps) {
  return (
    <Card title="ثبت حضور و غیاب">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="کلاس"
          value={selectedClassId}
          onChange={(e) => onClassChange(e.target.value)}
          options={[
            { label: "انتخاب کلاس...", value: "" },
            ...classes.map((c) => ({
              label: c.title || "(بدون عنوان)",
              value: c.id,
            })),
          ]}
        />
        <Select
          label="جلسه"
          value={selectedSessionId}
          onChange={(e) => onSessionChange(e.target.value)}
          disabled={!selectedClassId}
          options={[
            { label: "انتخاب جلسه...", value: "" },
            ...sessions.map((s) => ({
              label: `${s.title} - ${formatDate(s.date)}`,
              value: s.id,
            })),
          ]}
        />
      </div>
    </Card>
  );
}
