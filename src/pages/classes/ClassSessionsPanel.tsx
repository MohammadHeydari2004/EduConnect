import EmptyState from "#/components/common/EmptyState.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useNavigate } from "react-router-dom";

interface ClassSessionsPanelProps {
  sessions: Session[];
  classItem: ClassItem;
  classId: string;
  canManage: boolean;
  onAddSession: () => void;
}

function ClassSessionsPanel({
  sessions,
  classItem,
  classId,
  canManage,
  onAddSession,
}: ClassSessionsPanelProps) {
  const navigate = useNavigate();

  return (
    <Card title={`جلسات (${sessions.length})`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          لیست جلسات برگزار شده و برنامه‌ریزی شده
        </p>
        {canManage && classItem.status !== "inactive" && (
          <Button onClick={onAddSession} className="w-full sm:w-auto">
            افزودن جلسه
          </Button>
        )}
      </div>
      {sessions.length === 0 ? (
        <EmptyState
          title="جلسه‌ای ثبت نشده"
          description="هنوز جلسه‌ای برای این کلاس تعریف نشده است."
        />
      ) : (
        <div className="space-y-2">
          {[...sessions]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-gray-800">{s.title}</div>
                  {s.description && (
                    <div className="mt-1 text-xs text-gray-500">
                      {s.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm text-gray-600">
                    {formatDate(s.date)}
                  </div>
                  {canManage && classItem.status !== "inactive" && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(
                          `/attendance?classId=${classId}&sessionId=${s.id}`,
                        )
                      }
                    >
                      حضور و غیاب
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}

export default ClassSessionsPanel;
