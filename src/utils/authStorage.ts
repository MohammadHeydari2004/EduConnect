import { STORAGE_KEYS } from "#/configs/constants";
import { isValidUser } from "#/utils/guards.ts";
import type { User } from "#/types/user.ts";

const STORAGE_ERROR_MESSAGES = {
  QuotaExceededError:
    "حافظه مرورگر پر است. لطفاً فضای ذخیره‌سازی را خالی کنید.",
  SecurityError:
    "دسترسی به ذخیره‌سازی محلی مسدود شده است. لطفاً تنظیمات حریم خصوصی را بررسی کنید.",
  default: "خطا در دسترسی به حافظه مرورگر.",
  unknown: "خطای ناشناخته در ذخیره‌سازی داده‌ها.",
} as const;

export function getStoredUser(): User | null {
  let storedUser: string | null = null;
  try {
    storedUser = localStorage.getItem(STORAGE_KEYS.authUser);
  } catch {
    return null;
  }

  if (!storedUser) return null;

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(storedUser);
  } catch {
    parsed = null;
  }

  if (isValidUser(parsed)) {
    return parsed;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  } catch {
    return null;
  }

  return null;
}

export function getStorageErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    return STORAGE_ERROR_MESSAGES[error.name as keyof typeof STORAGE_ERROR_MESSAGES] ?? STORAGE_ERROR_MESSAGES.default;
  }
  return STORAGE_ERROR_MESSAGES.unknown;
}

export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
  } catch (error) {
    throw new Error(getStorageErrorMessage(error));
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  } catch (error) {
    throw new Error(getStorageErrorMessage(error));
  }
}
