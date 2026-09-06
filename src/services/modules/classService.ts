import { baseApi } from "#/services/api/baseApi.ts";
import type { ClassItem, ClassFormValues } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";

const endpoint = "/classes";

export const classService = {
  getAll: () => baseApi.getAll<ClassItem>(endpoint),
  getById: (id: ID) => baseApi.getById<ClassItem>(endpoint, id),
  create: (data: ClassFormValues) =>
    baseApi.create<ClassItem>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),
  update: (id: ID, data: Partial<ClassFormValues>) =>
    baseApi.update<ClassItem>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  delete: (id: ID) => baseApi.delete(endpoint, id),
  deactivate: (id: ID) =>
    baseApi.update<ClassItem>(endpoint, id, {
      status: "inactive",
      updatedAt: new Date().toISOString(),
    }),
  activate: (id: ID) =>
    baseApi.update<ClassItem>(endpoint, id, {
      status: "active",
      updatedAt: new Date().toISOString(),
    }),
};
