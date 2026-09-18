import { baseApi } from "#/services/api/baseApi.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/submissions";

export const submissionService = {
  getAll: () => baseApi.getAll<Submission>(endpoint),
  getByAssignment: async (assignmentId: ID): Promise<Submission[]> => {
    const all = await baseApi.getAll<Submission>(endpoint);
    return all.filter((s) => s.assignmentId === assignmentId);
  },
  getByStudent: async (studentId: ID): Promise<Submission[]> => {
    const all = await baseApi.getAll<Submission>(endpoint);
    return all.filter((s) => s.studentId === studentId);
  },
  create: async (
    data: Omit<Submission, "id" | "submittedAt">,
  ): Promise<Submission> => {
    const payload = {
      ...data,
      submittedAt: new Date().toISOString(),
    };
    return baseApi.create<Submission>(endpoint, payload);
  },
  update: (id: ID, data: Partial<Submission>) =>
    baseApi.update<Submission>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  delete: (id: ID) => baseApi.delete(endpoint, id),
};
