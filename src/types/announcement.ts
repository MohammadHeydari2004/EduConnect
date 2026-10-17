import type { ID, Maybe, UserRole } from "#/types/common.ts";

export type TargetAudience = "students" | "teacher" | "both";

/**
 * Targeting fields may be absent (undefined) in seed data or null when the
 * announcement uses the other targeting mode.
 */
export interface Announcement {
  readonly id: ID;
  title: string;
  content: string;
  classId: ID;
  readonly authorId: ID;
  readonly createdAt: string;
  readonly updatedAt?: string;
  seenBy: ID[];
  targetRoles: Maybe<UserRole[]>;
  targetAudience: Maybe<TargetAudience>;
}
