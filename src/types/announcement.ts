import type { ID, Maybe, UserRole, BaseFormErrors } from "#/types/common.ts";

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

export type AnnouncementPayload = Omit<
  Announcement,
  "id" | "createdAt" | "seenBy"
>;

export interface AnnouncementFormErrors extends BaseFormErrors {
  content?: string;
}
