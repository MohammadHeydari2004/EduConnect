import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type {
  Announcement,
  Assignment,
  Attendance,
  ClassFormValues,
  ClassItem,
  ID,
  Session,
} from "#/types";

const endpoint = API_ENDPOINTS.CLASSES;
const sessionEndpoint = API_ENDPOINTS.SESSIONS;
const assignmentEndpoint = API_ENDPOINTS.ASSIGNMENTS;
const announcementEndpoint = API_ENDPOINTS.ANNOUNCEMENTS;
const attendanceEndpoint = API_ENDPOINTS.ATTENDANCE;

async function nullDependents(id: ID): Promise<void> {
  await Promise.all([
    baseApi.nullifyDependents<Session>(
      sessionEndpoint,
      { classId: id },
      "classId",
      "نشست",
    ),
    baseApi.nullifyDependents<Assignment>(
      assignmentEndpoint,
      { classId: id },
      "classId",
      "تسليم",
    ),
    baseApi.nullifyDependents<Announcement>(
      announcementEndpoint,
      { classId: id },
      "classId",
      "اعلان",
    ),
    baseApi.nullifyDependents<Attendance>(
      attendanceEndpoint,
      { classId: id },
      "classId",
      "حضور و غیاب",
    ),
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
    await baseApi.delete(endpoint, id);
  },

  setStatus: (id: ID, status: "active" | "inactive") =>
    baseApi.update<ClassItem>(endpoint, id, {
      status,
      updatedAt: new Date().toISOString(),
    }),
};
