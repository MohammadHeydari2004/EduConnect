import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import type { Announcement, AnnouncementPayload } from "#/types/announcement.ts";
import type { ID } from "#/types/common.ts";

const endpoint = "/announcements";

export const announcementService = {
  getAll: (params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
    baseApi.getAll<Announcement>(endpoint, params, signal),
  getById: (id: ID) => baseApi.getById<Announcement>(endpoint, id),

  create: (data: AnnouncementPayload) =>
    baseApi.create<Announcement>(endpoint, {
      ...data,
      seenBy: [],
      createdAt: new Date().toISOString(),
    }),

  update: (id: ID, data: Partial<Announcement>) =>
    baseApi.update<Announcement>(endpoint, id, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),

  delete: (id: ID) => safeDelete((deleteId: ID) => baseApi.delete(endpoint, deleteId), id, endpoint),

  markAsSeen: async (id: ID, userId: ID) => {
    const announcement = await baseApi.getById<Announcement>(endpoint, id);
    const seenBy = announcement.seenBy ?? [];
    if (!seenBy.some((uid) => uid === userId)) {
      await baseApi.update<Announcement>(endpoint, id, {
        seenBy: [...seenBy, userId],
      });
    }
  },

  resetSeenBy: (id: ID) =>
    baseApi.update<Announcement>(endpoint, id, { seenBy: [] }),

  isSeenBy: (announcement: Announcement, userId: ID) =>
    (announcement.seenBy ?? []).some((uid) => uid === userId),
};
