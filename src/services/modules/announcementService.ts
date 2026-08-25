import { baseApi } from "#/services/api/baseApi.ts";
import type { Announcement } from "#/types/announcement.ts";

const endpoint = "/announcements";

export const announcementService = {
  getAll: () => baseApi.getAll<Announcement>(endpoint),

  getById: (id: number) => baseApi.getById<Announcement>(endpoint, id),

  create: (data: Omit<Announcement, "id" | "createdAt" | "seenBy">) =>
    baseApi.create<Announcement>(endpoint, {
      ...data,
      seenBy: [],
      createdAt: new Date().toISOString(),
    }),

  update: (id: number, data: Partial<Announcement>) =>
    baseApi.update<Announcement>(endpoint, id, data),

  delete: (id: number) => baseApi.delete(endpoint, id),

  markAsSeen: async (id: number, userId: number) => {
    const announcement = await baseApi.getById<Announcement>(endpoint, id);
    if (!announcement.seenBy?.includes(userId)) {
      await baseApi.update<Announcement>(endpoint, id, {
        seenBy: [...(announcement.seenBy ?? []), userId],
      });
    }
  },

  resetSeenBy: async (id: number) => {
    await baseApi.update<Announcement>(endpoint, id, { seenBy: [] });
  },

  isSeenBy: (announcement: Announcement, userId: number) => {
    return announcement.seenBy?.includes(userId) ?? false;
  },
};
