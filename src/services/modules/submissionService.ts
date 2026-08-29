import { baseApi } from "#/services/api/baseApi.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/submissions";

export const submissionService = {
  getAll: () => baseApi.getAll<Submission>(endpoint),
  getByAssignment: async (
    assignmentId: number | string,
  ): Promise<Submission[]> => {
    const all = await baseApi.getAll<Submission>(endpoint);
    return all.filter((s) => String(s.assignmentId) === String(assignmentId));
  },
  getByStudent: async (studentId: number | string): Promise<Submission[]> => {
    const all = await baseApi.getAll<Submission>(endpoint);
    return all.filter((s) => String(s.studentId) === String(studentId));
  },
  create: async (
    data: Omit<Submission, "id" | "submittedAt">,
  ): Promise<Submission> => {
    const payload = {
      ...data,
      assignmentId: Number(data.assignmentId),
      studentId: Number(data.studentId),
      submittedAt: new Date().toISOString(),
    };
    return baseApi.create<Submission>(endpoint, payload);
  },
  update: (id: number | string, data: Partial<Submission>) =>
    baseApi.update<Submission>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  delete: (id: number | string) => baseApi.delete(endpoint, id),
};
