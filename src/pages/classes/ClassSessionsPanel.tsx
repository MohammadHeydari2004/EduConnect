import EmptyState from "#/components/common/EmptyState.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import { useToast } from "#/hooks/useToast.ts";
import { showErrorToast } from "#/hooks/useToastHelpers.ts";
import SessionForm from "#/pages/classes/SessionForm.tsx";
import { sessionService } from "#/services/session.ts";
import type { ClassItem, Session } from "#/types";
import { formatDate } from "#/utils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ClassSessionsPanelProps {
  sessions: Session[];
  classItem: ClassItem;
  classId: string;
  canManage: boolean;
  onSessionsChanged?: () => void;
}

function ClassSessionsPanel({
  sessions,
  classItem,
  classId,
  canManage,
  onSessionsChanged,
}: ClassSessionsPanelProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEditSessions = canManage && classItem.status !== "inactive";

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [sessions],
  );

  const confirmDelete = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await sessionService.delete(deletingSession.id);
      addToast("جلسه با موفقیت حذف شد.", "success");
      setDeletingSession(null);
      onSessionsChanged?.();
    } catch (err) {
      showErrorToast(
        addToast,
        err instanceof Error ? err.message : "حذف جلسه با خطا مواجه شد.",
      );
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
        {canEditSessions && (
          <Button
            onClick={() => setIsAddingSession(true)}
            className="w-full sm:w-auto"
          >
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
          {sortedSessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="sm:flex sm:gap-6 sm:items-center">
                <div className="font-medium text-gray-800 max-sm:py-2">
                  {s.title}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(s.date)}
                </div>
                {s.description && (
                  <div className=" text-xs text-gray-500 max-sm:py-2">
                    {s.description}
                  </div>
                )}
              </div>
              <div className="sm:flex sm:flex-row  sm:items-center sm:gap-2 flex flex-col gap-2 max-sm:pt-4">
                {canEditSessions && (
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
          onSuccess={(message) => {
            addToast(message, "success");
            setEditingSession(null);
            onSessionsChanged?.();
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}
      {isAddingSession && (
        <SessionForm
          key={`session-form-add-${classId}`}
          classId={classId}
          onClose={() => setIsAddingSession(false)}
          onSuccess={(message) => {
            addToast(message, "success");
            setIsAddingSession(false);
            onSessionsChanged?.();
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
