import type { AttendanceStatus, ID } from "#/types/common.ts";

export interface Attendance {
  readonly id: ID;
  readonly classId: ID;
  readonly sessionId: ID;
  readonly studentId: ID;
  status: AttendanceStatus;
}
