import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";

const endpoint = "/assignments";
const submissionEndpoint = "/submissions";

export const assignmentService = {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => baseApi.getAll<Assignment>(endpoint, params, signal),
  getById: (id: ID) => baseApi.getById<Assignment>(endpoint, id),
  getByClass: (classId: ID, signal?: AbortSignal) =>
    baseApi.getAll<Assignment>(endpoint, { classId }, signal),

  create: (data: Omit<Assignment, "id" | "createdAt">) =>
    baseApi.create<Assignment>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),

  update: (id: ID, data: Partial<Assignment>) =>
    baseApi.update<Assignment>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: async (id: ID) => {
    const submissions = await baseApi.getAll<Submission>(
      submissionEndpoint,
      { assignmentId: id },
    );

    await Promise.all(
      submissions.map(async (s) => {
        try {
          await baseApi.update(submissionEndpoint, s.id, {
            assignmentId: null,
          });
        } catch (err) {
          throw new Error(
            `حذف وابستگی تسليم با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );

    await safeDelete(
      (deleteId: ID) => baseApi.delete(endpoint, deleteId),
      id,
      endpoint,
    );
  },
};
