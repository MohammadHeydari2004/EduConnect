import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassFormValues, ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Session } from "#/types/session.ts";

const endpoint = "/classes";
const sessionEndpoint = "/sessions";
const assignmentEndpoint = "/assignments";
const announcementEndpoint = "/announcements";
const attendanceEndpoint = "/attendance";

async function nullDependents(id: ID): Promise<void> {
  const [sessions, assignments, announcements, attendances] =
    await Promise.all([
      baseApi.getAll<Session>(sessionEndpoint, { classId: id }),
      baseApi.getAll<Assignment>(assignmentEndpoint, { classId: id }),
      baseApi.getAll<Announcement>(announcementEndpoint, { classId: id }),
      baseApi.getAll<Attendance>(attendanceEndpoint, { classId: id }),
    ]);

  await Promise.all([
    ...sessions.map(async (s) => {
      try {
        await baseApi.update(sessionEndpoint, s.id, { classId: null });
      } catch (err) {
        throw new Error(
          `حذف وابستگی نشست با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
        );
      }
    }),
    ...assignments.map(async (a) => {
      try {
        await baseApi.update(assignmentEndpoint, a.id, {
          classId: null,
        });
      } catch (err) {
        throw new Error(
          `حذف وابستگی تسليم با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
        );
      }
    }),
    ...announcements.map(async (a) => {
      try {
        await baseApi.update(announcementEndpoint, a.id, {
          classId: null,
        });
      } catch (err) {
        throw new Error(
          `حذف وابستگی اعلان با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
        );
      }
    }),
    ...attendances.map(async (a) => {
      try {
        await baseApi.update(attendanceEndpoint, a.id, {
          classId: null,
        });
      } catch (err) {
        throw new Error(
          `حذف وابستگی حضور و غیاب با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
        );
      }
    }),
  ]);
}

export const classService = {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => baseApi.getAll<ClassItem>(endpoint, params, signal),
  getById: (id: ID) => baseApi.getById<ClassItem>(endpoint, id),

  create: (data: ClassFormValues) =>
    baseApi.create<ClassItem>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),

  update: (id: ID, data: Partial<ClassFormValues>) =>
    baseApi.update<ClassItem>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: async (id: ID) => {
    await nullDependents(id);
    await safeDelete(
      (deleteId: ID) => baseApi.delete(endpoint, deleteId),
      id,
      endpoint,
    );
  },

  setStatus: (id: ID, status: "active" | "inactive") =>
    baseApi.update<ClassItem>(endpoint, id, {
      status,
      updatedAt: new Date().toISOString(),
    }),
};
