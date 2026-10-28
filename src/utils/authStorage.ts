import { STORAGE_KEYS } from "#/configs/constants";
import { logger } from "#/utils/logger.ts";
import { isValidUser } from "#/utils/guards.ts";
import type { User } from "#/types/user.ts";

export function getStoredUser(): User | null {
  let storedUser: string | null = null;
  try {
    storedUser = localStorage.getItem(STORAGE_KEYS.authUser);
  } catch (error) {
    logger.error("Failed to read auth user from localStorage", { error });
    return null;
  }

  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    if (isValidUser(parsed)) {
      return parsed;
    }
  } catch (error) {
    logger.error("Failed to parse stored auth user", { error });
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  } catch (error) {
    logger.error("Failed to remove corrupted auth user from localStorage", { error });
  }

  return null;
}

export function getStorageErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "QuotaExceededError":
        return "حافظه مرورگر پر است. لطفاً فضای ذخیره‌سازی را خالی کنید.";
      case "SecurityError":
        return "دسترسی به ذخیره‌سازی محلی مسدود شده است. لطفاً تنظیمات حریم خصوصی را بررسی کنید.";
      default:
        return "خطا در دسترسی به حافظه مرورگر.";
    }
  }
  return "خطای ناشناخته در ذخیره‌سازی داده‌ها.";
}