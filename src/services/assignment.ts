import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type { Assignment, ID, Submission } from "#/types";

const endpoint = API_ENDPOINTS.ASSIGNMENTS;
const submissionEndpoint = API_ENDPOINTS.SUBMISSIONS;

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
    await baseApi.nullifyDependents<Submission>(
      submissionEndpoint,
      { assignmentId: id },
      "assignmentId",
      "تسليم",
    );
    await baseApi.delete(endpoint, id);
  },
};
