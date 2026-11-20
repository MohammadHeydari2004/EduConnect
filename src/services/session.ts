import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type { Attendance, ID, Session, SessionFormValues } from "#/types";

const endpoint = API_ENDPOINTS.SESSIONS;
const attendanceEndpoint = API_ENDPOINTS.ATTENDANCE;

export const sessionService = {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => baseApi.getAll<Session>(endpoint, params, signal),
  getByClass: (classId: ID, signal?: AbortSignal) =>
    baseApi.getAll<Session>(endpoint, { classId }, signal),

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
    await baseApi.deleteDependents<Attendance>(
      attendanceEndpoint,
      { sessionId: id },
      "حضور و غیاب",
    );
    await baseApi.delete(endpoint, id);
  },
};
