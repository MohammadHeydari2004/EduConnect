import { isApiError } from "#/services/api/axiosInstance.ts";
import type { ID } from "#/types/common.ts";

const DELETE_TTL_MS = 60_000;

const pendingDeletes = new Map<string, Promise<void>>();
const completedDeletes = new Map<string, { timestamp: number }>();

function deleteKey(deleteFnName: string, id: ID): string {
  return `${deleteFnName}:${String(id)}`;
}

function isExpired(entry: { timestamp: number }): boolean {
  return Date.now() - entry.timestamp > DELETE_TTL_MS;
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of completedDeletes.entries()) {
    if (now - entry.timestamp > DELETE_TTL_MS) {
      completedDeletes.delete(key);
    }
  }
}

/**
 * یک delete را اجرا می‌کند و اگر منبع قبلاً purge شده باشد (پاسخ ۴۰۴)،
 * با تضاد (۴۰۹) مواجه شود، یا وابستگی قبلاً null شده باشد، خطا را نادیده می‌گیرد.
 * یک کلید تدیج برای جلوگیری از تلاش تکراری هم‌زمان برای همان منبع نگه می‌دارد.
 */
export async function safeDelete(
  deleteFn: (id: ID) => Promise<void>,
  id: ID,
  deleteFnName?: string,
): Promise<void> {
  const name = deleteFnName ?? deleteFn.name ?? "unknown";
  const key = deleteKey(name, id);

  cleanupExpired();

  const existing = pendingDeletes.get(key);
  if (existing) {
    await existing;
    return;
  }

  const completed = completedDeletes.get(key);
  if (completed && !isExpired(completed)) {
    return;
  }

  const promise = (async () => {
    try {
      await deleteFn(id);
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 404 || err.status === 409) {
          completedDeletes.set(key, { timestamp: Date.now() });
          return;
        }
      }
      throw err;
    }
    completedDeletes.set(key, { timestamp: Date.now() });
  })();

  pendingDeletes.set(key, promise);
  try {
    await promise;
  } finally {
    pendingDeletes.delete(key);
  }
}


