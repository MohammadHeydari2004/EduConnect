import { baseApi } from "#/services/api/baseApi.ts";
import { assignmentService } from "#/services/assignment.ts";
import { sessionService } from "#/services/session.ts";
import type { ClassFormValues, ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";

const endpoint = "/classes";

export const classService = {
  getAll: () => baseApi.getAll<ClassItem>(endpoint),
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

  // Cascade delete: sessions (which in turn delete their attendance records)
  // and assignments (which delete their submissions) are removed through their
  // own services so the cascade logic lives in one place per entity.
  delete: async (id: ID) => {
    const [relatedSessions, relatedAssignments] = await Promise.all([
      sessionService.getByClass(id),
      assignmentService.getByClass(id),
    ]);
    await Promise.all([
      ...relatedSessions.map((s) => sessionService.delete(s.id)),
      ...relatedAssignments.map((a) => assignmentService.delete(a.id)),
    ]);

    await baseApi.delete(endpoint, id);
  },

  setStatus: (id: ID, status: "active" | "inactive") =>
    baseApi.update<ClassItem>(endpoint, id, {
      status,
      updatedAt: new Date().toISOString(),
    }),
};
