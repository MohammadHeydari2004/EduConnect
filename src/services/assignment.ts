import { baseApi } from "#/services/api/baseApi.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/assignments";

export const assignmentService = {
  getAll: () => baseApi.getAll<Assignment>(endpoint),
  getById: (id: ID) => baseApi.getById<Assignment>(endpoint, id),
  getByClass: async (classId: ID): Promise<Assignment[]> => {
    const all = await baseApi.getAll<Assignment>(endpoint);
    return all.filter((a) => a.classId === classId);
  },
  create: (data: Omit<Assignment, "id">) =>
    baseApi.create<Assignment>(endpoint, data),
  update: (id: ID, data: Partial<Assignment>) => {
    return baseApi.update<Assignment>(endpoint, id, data);
  },
  delete: async (id: ID) => {
    const allSubmissions = await baseApi.getAll<Submission>("/submissions");
    const relatedSubmissions = allSubmissions.filter(
      (s) => s.assignmentId === id,
    );
    for (const sub of relatedSubmissions) {
      await baseApi.delete("/submissions", sub.id);
    }
    await baseApi.delete(endpoint, id);
  },
};
