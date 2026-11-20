import type { AttendanceStatus } from "#/types";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غایب",
  late: "با تأخیر",
};
