import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/submissions";

export const submissionService = {
  getAll: (params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
    baseApi.getAll<Submission>(endpoint, params, signal),

  getByAssignment: (assignmentId: ID, signal?: AbortSignal) =>
    baseApi.getAll<Submission>(endpoint, { assignmentId }, signal),

  create: (data: Omit<Submission, "id" | "submittedAt">) =>
    baseApi.create<Submission>(endpoint, {
      ...data,
      submittedAt: new Date().toISOString(),
    }),

  update: (id: ID, data: Partial<Submission>) =>
    baseApi.update<Submission>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: (id: ID) => safeDelete((deleteId: ID) => baseApi.delete(endpoint, deleteId), id, endpoint),
};
