import { baseApi } from "#/services/api/baseApi.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ID } from "#/types/common.ts";
import type { Session, SessionFormValues } from "#/types/session.ts";

const endpoint = "/sessions";

export const sessionService = {
  getAll: () => baseApi.getAll<Session>(endpoint),
  getById: (id: ID) => baseApi.getById<Session>(endpoint, id),
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
    const attendances = await baseApi.getAll<Attendance>("/attendance");
    for (const a of attendances.filter((att) => att.sessionId === id)) {
      await baseApi.delete("/attendance", a.id);
    }
    await baseApi.delete(endpoint, id);
  },
};
