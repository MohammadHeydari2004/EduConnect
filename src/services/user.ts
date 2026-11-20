import { baseApi } from "#/services/api/baseApi.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
import { cascadeDeleteUserData } from "#/services/cascadeDelete.ts";
import { API_ENDPOINTS, EMAIL_ALREADY_REGISTERED } from "#/configs/constants";
import type {
  CreateUserPayload,
  DeepPartial,
  ID,
  RecordStatus,
  UpdateUserPayload,
  User,
  UserWithPassword,
} from "#/types";
import { normalizeEmail } from "#/utils";

const endpoint = API_ENDPOINTS.USERS;

async function ensureEmailIsUnique(
  email: string,
  excludeUserId?: ID,
): Promise<void> {
  const duplicates = await baseApi.getAll<User>(endpoint, {
    email: normalizeEmail(email),
  });

  const duplicate = duplicates.find((user) => user.id !== excludeUserId);
  if (duplicate) {
    throw new Error(`این ایمیل ${EMAIL_ALREADY_REGISTERED} است.`);
  }
}

async function getAdminUsers(signal?: AbortSignal): Promise<User[]> {
  return baseApi.getAll<User>(endpoint, { role: "admin" }, signal);
}

async function ensureNotLastAdmin(
  userId: ID,
  onlyActive = false,
): Promise<void> {
  const targetUser = await baseApi.getById<User>(endpoint, userId);
  if (!targetUser) throw new Error("کاربر موردنظر پیدا نشد.");
  if (targetUser.role !== "admin") return;
  if (onlyActive && targetUser.status === "inactive") return;

  const adminUsers = await getAdminUsers();
  const adminCount = onlyActive
    ? adminUsers.filter((admin) => admin.status === "active").length
    : adminUsers.length;
  if (adminCount <= 1) {
    throw new Error(
      onlyActive
        ? "امکان غیرفعال‌سازی آخرین مدیر سیستم وجود ندارد."
        : "امکان حذف یا تغییر آخرین مدیر سیستم وجود ندارد.",
    );
  }
}

export const userService = {
  getAll: (
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => baseApi.getAll<User>(endpoint, params, signal),
  getById: (id: ID) => baseApi.getById<User>(endpoint, id),

  async create(data: CreateUserPayload): Promise<User> {
    await ensureEmailIsUnique(data.email);
    const payload: Omit<UserWithPassword, "id"> = {
      name: data.name.trim(),
      email: normalizeEmail(data.email),
      password: data.password,
      role: data.role,
      status: data.status,
    };
    return baseApi.create<User>(endpoint, payload);
  },

  async update(id: ID, data: UpdateUserPayload): Promise<User> {
    const existingUser = await baseApi.getById<User>(endpoint, id);

    if (data.email) {
      await ensureEmailIsUnique(data.email, id);
    }

    const role = data.role ?? existingUser.role;
    const status = data.status ?? existingUser.status;

    if (existingUser.role === "admin" && role !== "admin") {
      await ensureNotLastAdmin(id);
    }
    if (
      existingUser.role === "admin" &&
      existingUser.status === "active" &&
      status === "inactive"
    ) {
      await ensureNotLastAdmin(id, true);
    }

    const updateData: DeepPartial<User> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = normalizeEmail(data.email);
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;

    return baseApi.update<User>(endpoint, id, updateData);
  },

  async delete(id: ID): Promise<void> {
    await ensureNotLastAdmin(id);

    try {
      const report = await cascadeDeleteUserData(id);
      if (!report.overallSuccess) {
        throw new Error(report.results.flatMap((r) => r.errors).join("; "));
      }

      await baseApi.delete(endpoint, id);
    } catch (err) {
      if (isApiError(err)) throw err;
      throw new Error(
        `حذف کاربر با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
      );
    }
  },

  async toggleStatus(id: ID): Promise<User> {
    const user = await baseApi.getById<User>(endpoint, id);
    await ensureNotLastAdmin(id, true);
    const nextStatus: RecordStatus =
      user.status === "active" ? "inactive" : "active";
    return baseApi.update<User>(endpoint, id, {
      status: nextStatus,
    });
  },
};