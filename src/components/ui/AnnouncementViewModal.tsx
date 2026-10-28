import Button from "#/components/ui/Button.tsx";
import Modal from "#/components/ui/Modal.tsx";
import type { Announcement } from "#/types/announcement.ts";

interface AnnouncementViewModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  getClassName: (classId: string) => string;
  getTargetDescription: (item: Announcement) => string;
  getAuthorName: (authorId: string) => string;
  formatDateTime: (date: string) => string;
  formatRelativeTime: (date: string) => string;
  onClose: () => void;
  onMarkAsSeen: () => void;
  isMarkingSeen: boolean;
  canMarkAsSeen: boolean;
}

export function AnnouncementViewModal({
  isOpen,
  announcement,
  getClassName,
  getTargetDescription,
  getAuthorName,
  formatDateTime,
  formatRelativeTime,
  onClose,
  onMarkAsSeen,
  isMarkingSeen,
  canMarkAsSeen,
}: AnnouncementViewModalProps) {
  if (!isOpen || !announcement) return null;

  return (
    <Modal isOpen={true} title={announcement.title} onClose={onClose}>
      <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm text-gray-700">
        <p>
          <span className="font-semibold">مخاطب:</span>{" "}
          {getClassName(announcement.classId)}
        </p>
        <p>
          <span className="font-semibold">دسترسی:</span>{" "}
          {getTargetDescription(announcement)}
        </p>
        <p>
          <span className="font-semibold">نویسنده:</span>{" "}
          {getAuthorName(announcement.authorId)}
        </p>
        <p title={formatDateTime(announcement.createdAt)}>
          <span className="font-semibold">تاریخ:</span>{" "}
          {formatRelativeTime(announcement.createdAt)}
        </p>
        <hr className="my-2" />
        <p className="leading-relaxed whitespace-pre-wrap">
          {announcement.content}
        </p>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isMarkingSeen}>
            بستن
          </Button>
          {canMarkAsSeen && (
            <Button onClick={onMarkAsSeen} isLoading={isMarkingSeen}>
              خوانده شد
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}