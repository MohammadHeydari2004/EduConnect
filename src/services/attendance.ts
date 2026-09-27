import { baseApi } from "#/services/api/baseApi.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { AttendanceStatus, ID } from "#/types/common.ts";

const endpoint = "/attendance";

export const attendanceService = {
  getAll: () => baseApi.getAll<Attendance>(endpoint),

  getBySession: (sessionId: ID) =>
    baseApi.getAll<Attendance>(endpoint, { sessionId }),

  getByStudent: (studentId: ID) =>
    baseApi.getAll<Attendance>(endpoint, { studentId }),

  getByClass: (classId: ID) =>
    baseApi.getAll<Attendance>(endpoint, { classId }),

  saveAttendanceForSession: async (
    sessionId: ID,
    classId: ID,
    records: Array<{ studentId: ID; status: AttendanceStatus }>,
  ): Promise<Attendance[]> => {
    const existing = await attendanceService.getBySession(sessionId);

    const operations = records.map(async (record) => {
      const existingRecord = existing.find(
        (a) => a.studentId === record.studentId,
      );
      if (existingRecord) {
        return baseApi.update<Attendance>(endpoint, existingRecord.id, {
          status: record.status,
        });
      } else {
        return baseApi.create<Attendance>(endpoint, {
          sessionId,
          classId,
          studentId: record.studentId,
          status: record.status,
        } as Omit<Attendance, "id">);
      }
    });

    return Promise.all(operations);
  },

  updateStatus: (id: ID, status: AttendanceStatus) =>
    baseApi.update<Attendance>(endpoint, id, { status }),

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
