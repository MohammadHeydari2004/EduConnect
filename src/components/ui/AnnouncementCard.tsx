import { SeenIcon } from "#/components/common/icons";
import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import type { Announcement } from "#/types/announcement.ts";

interface AnnouncementCardProps {
  item: Announcement;
  isSeen: boolean;
  getClassName: (classId: string) => string;
  getTargetDescription: (item: Announcement) => string;
  getAuthorName: (authorId: string) => string;
  formatDateTime: (date: string) => string;
  formatRelativeTime: (date: string) => string;
  onView: () => void;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  canManage: boolean;
  canView: boolean;
}

export function AnnouncementCard({
  item,
  isSeen,
  getClassName,
  getTargetDescription,
  getAuthorName,
  formatDateTime,
  formatRelativeTime,
  onView,
  onEdit,
  onDelete,
  canManage,
  canView,
}: AnnouncementCardProps) {
  return (
    <Card key={item.id}>
      <div className="flex h-full flex-col">
        {!isSeen && (
          <div
            aria-hidden="true"
            className="-mt-5 -mr-5 mb-3 h-1 w-10 rounded-br-full rounded-bl-full bg-blue-500"
          />
        )}

        <div className="mb-2 flex items-start justify-between gap-2">
          <h3
            className={`text-lg font-semibold w-48 sm:w-56 truncate ${isSeen ? "text-gray-600" : "text-blue-700"}`}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-1">
            {isSeen ? (
              <Badge variant="green">
                <SeenIcon className="h-3 w-3" />
                خوانده شده
              </Badge>
            ) : (
              <Badge variant="blue">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600"
                  aria-hidden="true"
                ></span>
                جدید
              </Badge>
            )}
          </div>
        </div>

        <p className="mb-1 text-xs text-gray-500">
          مخاطب: {getClassName(item.classId)}
        </p>
        <p className="mb-1 text-xs text-gray-500">
          دسترسی: {getTargetDescription(item)}
        </p>
        <p
          className="mb-3 text-xs text-gray-500"
          title={formatDateTime(item.createdAt)}
        >
          نویسنده: {getAuthorName(item.authorId)} | تاریخ:{" "}
          {formatRelativeTime(item.createdAt)}
        </p>
        <p className="mb-4 line-clamp-3 grow text-sm text-gray-700">
          {item.content}
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          {canView && (
            <Button variant="secondary" onClick={onView}>
              مشاهده
            </Button>
          )}
          {canManage && (
            <>
              {onEdit && (
                <Button variant="secondary" onClick={onEdit}>
                  ویرایش
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" onClick={onDelete}>
                  حذف
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
