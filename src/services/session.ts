import { baseApi } from "#/services/api/baseApi.ts";
import { attendanceService } from "#/services/attendance.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ID } from "#/types/common.ts";
import type { Session, SessionFormValues } from "#/types/session.ts";

const endpoint = "/sessions";

export const sessionService = {
  getAll: () => baseApi.getAll<Session>(endpoint),
  getById: (id: ID) => baseApi.getById<Session>(endpoint, id),
  getByClass: (classId: ID) => baseApi.getAll<Session>(endpoint, { classId }),

  create: (data: SessionFormValues) =>
    baseApi.create<Session>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),

  update: (id: ID, data: Partial<SessionFormValues>) =>
    baseApi.update<Session>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: async (id: ID) => {
    const relatedAttendances = await baseApi.getAll<Attendance>("/attendance", {
      sessionId: id,
    });
    await Promise.all(
      relatedAttendances.map((a) => attendanceService.delete(a.id)),
    );

    await baseApi.delete(endpoint, id);
  },
};
