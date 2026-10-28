import type { Announcement, TargetAudience } from "#/types/announcement.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID, UserRole } from "#/types/common.ts";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants";

export type AnnouncementPayload = Omit<
  Announcement,
  "id" | "createdAt" | "seenBy"
>;

interface BuildAnnouncementPayloadOptions {
  title: string;
  content: string;
  classId: string;
  authorId: ID;
  isAdmin: boolean;
  targetRoles: UserRole[];
  targetAudience: TargetAudience;
  classOptions: { value: string }[];
}

export function buildAnnouncementPayload({
  title,
  content,
  classId,
  authorId,
  isAdmin,
  targetRoles,
  targetAudience,
  classOptions,
}: BuildAnnouncementPayloadOptions): AnnouncementPayload {
  const validClassIds = classOptions.map((o) => o.value);
  const finalClassId = validClassIds.includes(classId)
    ? classId
    : classOptions[0]?.value ?? GLOBAL_ANNOUNCEMENT_CLASS_ID;

  const basePayload = { title, content, classId: finalClassId, authorId };

  if (isAdmin) {
    if (finalClassId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
      return { ...basePayload, targetRoles, targetAudience: null };
    }
    return { ...basePayload, targetAudience, targetRoles: null };
  }

  return {
    ...basePayload,
    targetAudience: "students",
    targetRoles: null,
  };
}

export function validateGlobalAnnouncementRoles(
  isAdmin: boolean,
  classId: string,
  targetRoles: UserRole[]
): string | null {
  if (
    isAdmin &&
    classId === GLOBAL_ANNOUNCEMENT_CLASS_ID &&
    targetRoles.length === 0
  ) {
    return "حداقل یک نقش را برای اطلاعیه گلوبال انتخاب کنید.";
  }
  return null;
}

export function getAnnouncementClassOptions(
  isAdmin: boolean,
  classes: ClassItem[]
): { label: string; value: string }[] {
  return isAdmin
    ? [
        { label: "همه (عمومی)", value: GLOBAL_ANNOUNCEMENT_CLASS_ID },
        ...classes.map((c) => ({ label: c.title, value: c.id })),
      ]
    : classes.map((c) => ({ label: c.title, value: c.id }));
}