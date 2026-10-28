import EmptyState from "#/components/common/EmptyState.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "#/hooks/useToast.ts";
import SessionForm from "#/pages/classes/SessionForm.tsx";
import { sessionService } from "#/services/session.ts";
import { getErrorMessage } from "#/utils/error.ts";

interface ClassSessionsPanelProps {
  sessions: Session[];
  classItem: ClassItem;
  classId: string;
  canManage: boolean;
  onAddSession: () => void;
  onSessionChange?: (sessions: Session[]) => void;
}

function ClassSessionsPanel({
  sessions,
  classItem,
  classId,
  canManage,
  onAddSession,
  onSessionChange,
}: ClassSessionsPanelProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await sessionService.delete(deletingSession.id);
      addToast("جلسه با موفقیت حذف شد.", "success");
      setDeletingSession(null);
      onSessionChange?.(sessions.filter((s) => s.id !== deletingSession.id));
    } catch (err) {
      addToast(getErrorMessage(err, "حذف جلسه با خطا مواجه شد."), "error");
      setDeletingSession(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
                      <>
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
                        <Button
                          variant="secondary"
                          onClick={() => setEditingSession(s)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeletingSession(s)}
                        >
                          حذف
                        </Button>
                      </>
                    )}
                </div>
              </div>
            ))}
        </div>
      )}
      {editingSession && (
        <SessionForm
          key={`session-form-edit-${editingSession.id}`}
          classId={classId}
          initialData={editingSession}
          onClose={() => setEditingSession(null)}
          onSuccess={(message, updatedSession) => {
            addToast(message, "success");
            setEditingSession(null);
            onSessionChange?.(
              sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
            );
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}
      <ConfirmDialog
        isOpen={!!deletingSession}
        title="حذف جلسه"
        message={`آیا از حذف جلسه "${deletingSession?.title ?? ""}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        onClose={() => setDeletingSession(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </Card>
  );
}

export default ClassSessionsPanel;
