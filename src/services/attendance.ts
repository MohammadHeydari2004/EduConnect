import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { AttendanceStatus, ID } from "#/types/common.ts";

const endpoint = "/attendance";

export const attendanceService = {
  getAll: (params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
    baseApi.getAll<Attendance>(endpoint, params, signal),

  getBySession: (sessionId: ID, signal?: AbortSignal) =>
    baseApi.getAll<Attendance>(endpoint, { sessionId }, signal),

  saveAttendanceForSession: async (
    sessionId: ID,
    classId: ID,
    records: Array<{ studentId: ID; status: AttendanceStatus }>,
  ): Promise<Attendance[]> => {
    const existing = await attendanceService.getBySession(sessionId);
    const existingMap = new Map(existing.map((a) => [a.studentId, a]));

    const creates: Array<{ studentId: ID; status: AttendanceStatus }> = [];
    const updates: Array<{ id: ID; status: AttendanceStatus }> = [];

    for (const record of records) {
      const existingRecord = existingMap.get(record.studentId);
      if (existingRecord) {
        updates.push({ id: existingRecord.id, status: record.status });
      } else {
        creates.push(record);
      }
    }

    const results: Attendance[] = [];

    if (creates.length > 0) {
      const created = await Promise.all(
        creates.map((record) =>
          baseApi.create<Attendance>(endpoint, {
            sessionId,
            classId,
            studentId: record.studentId,
            status: record.status,
          }),
        ),
      );
      results.push(...created);
    }

    if (updates.length > 0) {
      const updated = await Promise.all(
        updates.map((update) =>
          baseApi.update<Attendance>(endpoint, update.id, { status: update.status }),
        ),
      );
      results.push(...updated);
    }

    return results;
  },

  delete: (id: ID) => safeDelete((deleteId: ID) => baseApi.delete(endpoint, deleteId), id, endpoint),

  calculateStudentStats: (attendances: Attendance[]) => {
    const present = attendances.filter((a) => a.status === "present").length;
    const late = attendances.filter((a) => a.status === "late").length;
    const absent = attendances.filter((a) => a.status === "absent").length;
    const total = attendances.length;
    const attended = present + late;
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    return { present, late, absent, total, attended, percentage };
  },
};
