export type GlobalAnnouncementClassId = string & { readonly brand: unique symbol };

export const GLOBAL_ANNOUNCEMENT_CLASS_ID = "0" as GlobalAnnouncementClassId;

export const DEFAULT_CLASS_CAPACITY = 10;

export const MAX_CLASS_CAPACITY = 1000;

export const MAX_CLASS_DESCRIPTION_LENGTH = 500;
