import { baseApi } from "#/services/api/baseApi.ts";
import type { Session, SessionFormValues } from "#/types/session.ts";

const endpoint = "/sessions";

export const sessionService = {
  getAll: () => baseApi.getAll<Session>(endpoint),

  getById: (id: number) => baseApi.getById<Session>(endpoint, id),

  create: (data: SessionFormValues) =>
    baseApi.create<Session>(endpoint, {
      ...data,
      createdAt: new Date().toISOString(),
    }),

  update: (id: number, data: Partial<SessionFormValues>) =>
    baseApi.update<Session>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: (id: number) => baseApi.delete(endpoint, id),
};
