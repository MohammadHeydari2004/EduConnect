import { baseApi } from "#/services/api/baseApi.ts";
import type { Session, SessionFormValues } from "#/types/session.ts";
import type { ID } from "#/types/common.ts";

const endpoint = "/sessions";

export const sessionService = {
  getAll: () => baseApi.getAll<Session>(endpoint),
  getById: (id: ID) => baseApi.getById<Session>(endpoint, id),
  create: (data: SessionFormValues) =>
    baseApi.create<Session>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),
  update: (id: ID, data: Partial<SessionFormValues>) =>
    baseApi.update<Session>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  delete: (id: ID) => baseApi.delete(endpoint, id),
};
