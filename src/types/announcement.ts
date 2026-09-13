import type { ID, UserRole } from "#/types/common.ts";

export type TargetAudience = "students" | "teacher" | "both";

export interface Announcement {
  id: ID;
  title: string;
  content: string;
  classId: ID;
  authorId: ID;
  createdAt: string;
  seenBy: ID[];
  targetRoles?: UserRole[];
  targetAudience?: TargetAudience;
}
