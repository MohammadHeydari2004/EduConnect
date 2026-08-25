import { baseApi } from "#/services/api/baseApi.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { AttendanceStatus } from "#/types/common.ts";

const endpoint = "/attendance";

export const attendanceService = {
  getAll: () => baseApi.getAll<Attendance>(endpoint),

  getBySession: async (sessionId: number | string): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => String(a.sessionId) === String(sessionId));
  },

  getByStudent: async (studentId: number | string): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => String(a.studentId) === String(studentId));
  },

  getByClass: async (classId: number | string): Promise<Attendance[]> => {
    const all = await baseApi.getAll<Attendance>(endpoint);
    return all.filter((a) => String(a.classId) === String(classId));
  },

  saveAttendanceForSession: async (
    sessionId: number | string,
    classId: number | string,
    records: Array<{ studentId: number | string; status: AttendanceStatus }>,
  ): Promise<Attendance[]> => {
    const existing = await attendanceService.getBySession(sessionId);
    const results: Attendance[] = [];

    for (const record of records) {
      const existingRecord = existing.find(
        (a) => String(a.studentId) === String(record.studentId),
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
          sessionId: Number(sessionId),
          classId: Number(classId),
          studentId: Number(record.studentId),
          status: record.status,
        } as unknown as Omit<Attendance, "id">);
        results.push(created);
      }
    }

    return results;
  },

  updateStatus: async (
    id: number | string,
    status: AttendanceStatus,
  ): Promise<Attendance> => {
    return baseApi.update<Attendance>(endpoint, id, { status });
  },

  delete: (id: number | string) => baseApi.delete(endpoint, id),

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
