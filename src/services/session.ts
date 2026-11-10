import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ID } from "#/types/common.ts";
import type { Session, SessionFormValues } from "#/types/session.ts";

const endpoint = "/sessions";
const attendanceEndpoint = "/attendance";

export const sessionService = {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => baseApi.getAll<Session>(endpoint, params, signal),
  getById: (id: ID) => baseApi.getById<Session>(endpoint, id),
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
    const attendances = await baseApi.getAll<Attendance>(
      attendanceEndpoint,
      { sessionId: id },
    );

    await Promise.all(
      attendances.map(async (a) => {
        try {
          await baseApi.update(attendanceEndpoint, a.id, {
            sessionId: null,
          });
        } catch (err) {
          throw new Error(
            `حذف وابستگی حضور و غیاب با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );

    await safeDelete(
      (deleteId: ID) => baseApi.delete(endpoint, deleteId),
      id,
      endpoint,
    );
  },
};
