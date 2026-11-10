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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const RELATIVE_TIME_THRESHOLDS = [
  {
    max: 60,
    unit: MS_PER_MINUTE,
    format: (v: number) => `${v} دقیقه پیش`,
  },
  {
    max: 24,
    unit: MS_PER_HOUR,
    format: (v: number) => `${v} ساعت پیش`,
  },
  {
    max: 7,
    unit: MS_PER_DAY,
    format: (v: number) => `${v} روز پیش`,
  },
] as const;

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

  for (const threshold of RELATIVE_TIME_THRESHOLDS) {
    const value = Math.floor(diffMs / threshold.unit);
    if (value < threshold.max) {
      return threshold.format(value);
    }
  }

  return formatDate(dateObj);
};

function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  try {
    let dateObj: Date;
    if (typeof date === "string" && DATE_ONLY.test(date)) {
      const parts = date.split("-");
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      dateObj = new Date(y, m - 1, d);
    } else {
      dateObj = typeof date === "string" ? new Date(date) : date;
    }
    if (isNaN(dateObj.getTime())) return null;
    return dateObj;
  } catch {
    return null;
  }
}

export const isDateBeforeToday = (date: string | Date): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
};
