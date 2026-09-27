/**
 * فرمت‌دهی تاریخ به صورت شمسی (بدون ساعت)
 * @example formatDate("2025-03-15T10:00:00.000Z") => "۱۴۰۴/۰۱/۲۵"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "—";
    return dateObj.toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
};

/**
 * فرمت‌دهی تاریخ و ساعت به صورت شمسی
 * @example formatDateTime("2025-03-15T10:30:00.000Z") => "۱۴۰۴/۰۱/۲۵ - ۱۰:۳۰"
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "—";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "—";

    const datePart = dateObj.toLocaleDateString("fa-IR");
    const timePart = dateObj.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} - ${timePart}`;
  } catch {
    return "—";
  }
};

/**
 * فرمت‌دهی نسبی زمان (مثلاً "۲ ساعت پیش")
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "—";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "لحظاتی پیش";
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;

    return formatDate(dateObj);
  } catch {
    return "—";
  }
};
