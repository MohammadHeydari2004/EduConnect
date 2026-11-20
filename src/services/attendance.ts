import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type { Attendance, AttendanceStatus, ID } from "#/types";

const attendanceEndpoint = API_ENDPOINTS.ATTENDANCE;

export const attendanceService = {
  getAll: (params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
    baseApi.getAll<Attendance>(attendanceEndpoint, params, signal),

  getBySession: (sessionId: ID, signal?: AbortSignal) =>
    baseApi.getAll<Attendance>(attendanceEndpoint, { sessionId }, signal),

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

    const recordStudentIds = new Set(records.map((r) => r.studentId));
    const deletes = existing.filter((a) => !recordStudentIds.has(a.studentId));

    const results: Attendance[] = [];

    if (creates.length > 0) {
      const created = await Promise.all(
        creates.map((record) =>
          baseApi.create<Attendance>(attendanceEndpoint, {
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
          baseApi.update<Attendance>(attendanceEndpoint, update.id, { status: update.status }),
        ),
      );
      results.push(...updated);
    }

    if (deletes.length > 0) {
      await Promise.all(
        deletes.map((deleted) => baseApi.delete(attendanceEndpoint, deleted.id)),
      );
    }

    return results;
  },

  delete: (id: ID) => baseApi.delete(attendanceEndpoint, id),

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