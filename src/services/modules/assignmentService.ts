import { baseApi } from "#/services/api/baseApi.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/assignments";

export const assignmentService = {
  getAll: () => baseApi.getAll<Assignment>(endpoint),
  getById: (id: number | string) => baseApi.getById<Assignment>(endpoint, id),
  getByClass: async (classId: number | string): Promise<Assignment[]> => {
    const all = await baseApi.getAll<Assignment>(endpoint);
    return all.filter((a) => String(a.classId) === String(classId));
  },
  create: (data: Omit<Assignment, "id">) =>
    baseApi.create<Assignment>(endpoint, data),
  update: async (id: number | string, data: Partial<Assignment>) => {
    const updated = await baseApi.update<Assignment>(endpoint, id, data);
    const allSubmissions = await baseApi.getAll<Submission>("/submissions");
    const relatedSubmissions = allSubmissions.filter(
      (s) => String(s.assignmentId) === String(id),
    );
    for (const sub of relatedSubmissions) {
      await baseApi.delete("/submissions", sub.id);
    }
    return updated;
  },
  delete: async (id: number | string) => {
    const allSubmissions = await baseApi.getAll<Submission>("/submissions");
    const relatedSubmissions = allSubmissions.filter(
      (s) => String(s.assignmentId) === String(id),
    );
    for (const sub of relatedSubmissions) {
      await baseApi.delete("/submissions", sub.id);
    }
    await baseApi.delete(endpoint, id);
  },
};
