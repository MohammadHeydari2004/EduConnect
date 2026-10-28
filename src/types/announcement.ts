import type { ID, Maybe, UserRole } from "#/types/common.ts";

export type TargetAudience = "students" | "teacher" | "both";

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
