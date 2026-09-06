import { baseApi } from "#/services/api/baseApi.ts";
import type { Announcement } from "#/types/announcement.ts";
import type { ID } from "#/types/common.ts";

const endpoint = "/announcements";

export const announcementService = {
  getAll: () => baseApi.getAll<Announcement>(endpoint),
  getById: (id: ID) => baseApi.getById<Announcement>(endpoint, id),
  create: (data: Omit<Announcement, "id" | "createdAt" | "seenBy">) =>
    baseApi.create<Announcement>(endpoint, {
      ...data,
      seenBy: [],
      createdAt: new Date().toISOString(),
    }),
  update: (id: ID, data: Partial<Announcement>) =>
    baseApi.update<Announcement>(endpoint, id, data),
  delete: (id: ID) => baseApi.delete(endpoint, id),
  markAsSeen: async (id: ID, userId: ID) => {
    const announcement = await baseApi.getById<Announcement>(endpoint, id);
    const seenBy = announcement.seenBy ?? [];
    if (!seenBy.some((uid) => String(uid) === String(userId))) {
      await baseApi.update<Announcement>(endpoint, id, {
        seenBy: [...seenBy, userId],
      });
    }
  },
  resetSeenBy: async (id: ID) => {
    await baseApi.update<Announcement>(endpoint, id, { seenBy: [] });
  },
  isSeenBy: (announcement: Announcement, userId: ID) => {
    return (announcement.seenBy ?? []).some(
      (uid) => String(uid) === String(userId),
    );
  },
};
