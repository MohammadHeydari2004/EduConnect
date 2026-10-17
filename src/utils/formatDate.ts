export const formatDate = (date: string | Date | null | undefined): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return "—";
  return dateObj.toLocaleDateString("fa-IR");
};

export const formatDateTime = (
  date: string | Date | null | undefined,
): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return "—";

  const datePart = dateObj.toLocaleDateString("fa-IR");
  const timePart = dateObj.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} - ${timePart}`;
};

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export const formatRelativeTime = (
  date: string | Date | null | undefined,
): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return "—";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();

  if (diffMs < 0) return formatDate(dateObj);

  const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);
  if (diffMinutes < 1) return "لحظاتی پیش";
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  const diffHours = Math.floor(diffMs / MS_PER_HOUR);
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  const diffDays = Math.floor(diffMs / MS_PER_DAY);
  if (diffDays < 7) return `${diffDays} روز پیش`;

  return formatDate(dateObj);
};

/**
 * Parses a date in local time and returns null when it is missing or invalid.
 * Centralizes the `new Date(...) + isNaN` guard that was repeated in every
 * formatter.
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;
    return dateObj;
  } catch {
    return null;
  }
}

/**
 * تبدیل تاریخ به فرمت مناسب برای input[type="date"] (YYYY-MM-DD).
 * مقادیر بر اساس منطقه زمانی محلی گرفته می‌شوند تا یک روز اختلاف با
 * toISOString (که UTC است) پیش نیاید. در صورت نامعتبر بودن تاریخ،
 * رشته خالی برمی‌گرداند.
 */
export const toDateInputValue = (
  date: string | Date | null | undefined,
): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return "";
  const year = String(dateObj.getFullYear());
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converts a `YYYY-MM-DD` value from a date input to an ISO timestamp at the
 * end of that day (local time), for deadline storage.
 */
export const toIsoWithEndOfDay = (dateValue: string): string => {
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return "";
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    23,
    59,
    59,
    999,
  ).toISOString();
};

export const isDateBeforeToday = (date: string | Date): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
};
