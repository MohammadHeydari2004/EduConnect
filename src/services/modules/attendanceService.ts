import { baseApi } from "#/services/api/baseApi.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { AttendanceStatus, ID } from "#/types/common.ts";

const endpoint = "/attendance";

export const attendanceService = {
  getAll: () => baseApi.getAll<Attendance>(endpoint),
  getBySession: async (sessionId: ID): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => a.sessionId === sessionId);
  },
  getByStudent: async (studentId: ID): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => a.studentId === studentId);
  },
  getByClass: async (classId: ID): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => a.classId === classId);
  },
  saveAttendanceForSession: async (
    sessionId: ID,
    classId: ID,
    records: Array<{ studentId: ID; status: AttendanceStatus }>,
  ): Promise<Attendance[]> => {
    const existing = await attendanceService.getBySession(sessionId);
    const results: Attendance[] = [];
    for (const record of records) {
      const existingRecord = existing.find(
        (a) => a.studentId === record.studentId,
      );
      if (existingRecord) {
        const updated = await baseApi.update<Attendance>(
          endpoint,
          existingRecord.id,
          { status: record.status },
        );
        results.push(updated);
      } else {
        const created = await baseApi.create<Attendance>(endpoint, {
          sessionId,
          classId,
          studentId: record.studentId,
          status: record.status,
        } as Omit<Attendance, "id">);
        results.push(created);
      }
    }
    return results;
  },
  updateStatus: async (
    id: ID,
    status: AttendanceStatus,
  ): Promise<Attendance> => {
    return baseApi.update<Attendance>(endpoint, id, { status });
  },
  delete: (id: ID) => baseApi.delete(endpoint, id),
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
