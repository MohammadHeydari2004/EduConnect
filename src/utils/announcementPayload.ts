import type {
  AnnouncementPayload,
  ClassItem,
  ID,
  SelectOption,
  TargetAudience,
  UserRole,
} from "#/types";
import { GLOBAL_ANNOUNCEMENT_CLASS_ID } from "#/configs/constants/classConstants.ts";
import { DEFAULT_TARGET_AUDIENCE } from "#/configs/constants/announcementConstants.ts";

interface BuildAnnouncementPayloadOptions {
  title: string;
  content: string;
  classId: string;
  authorId: ID;
  isAdmin: boolean;
  targetRoles: UserRole[];
  targetAudience: TargetAudience;
}

export function buildAnnouncementPayload({
  title,
  content,
  classId,
  authorId,
  isAdmin,
  targetRoles,
  targetAudience,
}: BuildAnnouncementPayloadOptions): AnnouncementPayload {
  const basePayload = { title, content, classId, authorId };

  if (isAdmin) {
    if (classId === GLOBAL_ANNOUNCEMENT_CLASS_ID) {
      return { ...basePayload, targetRoles, targetAudience: null };
    }
    return { ...basePayload, targetAudience, targetRoles: null };
  }

  return {
    ...basePayload,
    targetAudience: DEFAULT_TARGET_AUDIENCE,
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
): SelectOption<string>[] {
  return isAdmin
    ? [
        { label: "همه (عمومی)", value: GLOBAL_ANNOUNCEMENT_CLASS_ID },
        ...classes.map((c) => ({ label: c.title, value: c.id })),
      ]
    : classes.map((c) => ({ label: c.title, value: c.id }));
}