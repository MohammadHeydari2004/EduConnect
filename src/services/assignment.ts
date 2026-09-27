import { baseApi } from "#/services/api/baseApi.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/assignments";

export const assignmentService = {
  getAll: () => baseApi.getAll<Assignment>(endpoint),
  getById: (id: ID) => baseApi.getById<Assignment>(endpoint, id),
  getByClass: (classId: ID) =>
    baseApi.getAll<Assignment>(endpoint, { classId }),

  create: (data: Omit<Assignment, "id">) =>
    baseApi.create<Assignment>(endpoint, data),

  update: (id: ID, data: Partial<Assignment>) =>
    baseApi.update<Assignment>(endpoint, id, data),

  delete: async (id: ID) => {
    const relatedSubmissions = await baseApi.getAll<Submission>(
      "/submissions",
      { assignmentId: id },
    );
    await Promise.all(
      relatedSubmissions.map((sub) => baseApi.delete("/submissions", sub.id)),
    );

    await baseApi.delete(endpoint, id);
  },
};
