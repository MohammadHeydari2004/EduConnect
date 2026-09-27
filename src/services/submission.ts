import { baseApi } from "#/services/api/baseApi.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/submissions";

export const submissionService = {
  getAll: () => baseApi.getAll<Submission>(endpoint),

  getByAssignment: (assignmentId: ID) =>
    baseApi.getAll<Submission>(endpoint, { assignmentId }),

  getByStudent: (studentId: ID) =>
    baseApi.getAll<Submission>(endpoint, { studentId }),

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

  delete: (id: ID) => baseApi.delete(endpoint, id),
};
