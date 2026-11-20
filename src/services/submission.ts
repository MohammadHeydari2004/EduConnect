import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type { ID, Submission } from "#/types";

const endpoint = API_ENDPOINTS.SUBMISSIONS;

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

  delete: (id: ID) => baseApi.delete(endpoint, id),
};
