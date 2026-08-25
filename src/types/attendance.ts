import type { AttendanceStatus, ID } from "#/types/common.ts";

export interface Attendance {
  id: ID;
  classId: ID;
  sessionId: ID;
  studentId: ID;
  status: AttendanceStatus;
}
