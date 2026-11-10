import { baseApi } from "#/services/api/baseApi.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import { cascadeDeleteUserData } from "#/services/cascadeDelete.ts";
import type { ID, DeepPartial, RecordStatus } from "#/types/common.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserWithPassword,
} from "#/types/user.ts";

const endpoint = "/users";

async function getAllUsers(params?: Record<string, string | number | boolean>, signal?: AbortSignal): Promise<User[]> {
  return baseApi.getAll<User>(endpoint, params, signal);
}

async function getUserById(id: ID): Promise<User> {
  return baseApi.getById<User>(endpoint, id);
}

async function ensureEmailIsUnique(
  email: string,
  excludeUserId?: ID,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const duplicates = await baseApi.getAll<User>(endpoint, {
    email: normalizedEmail,
  });

  const duplicate = duplicates.find((user) => user.id !== excludeUserId);
  if (duplicate) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }
}

async function getAdminUsers(signal?: AbortSignal): Promise<User[]> {
  return baseApi.getAll<User>(endpoint, { role: "admin" }, signal);
}

async function ensureNotLastAdmin(userId: ID): Promise<void> {
  const targetUser = await getUserById(userId);
  if (!targetUser) throw new Error("کاربر موردنظر پیدا نشد.");
  if (targetUser.role !== "admin") return;

  const adminUsers = await getAdminUsers();
  if (adminUsers.length <= 1) {
    throw new Error("امکان حذف یا تغییر آخرین مدیر سیستم وجود ندارد.");
  }
}

async function ensureNotLastAdminIfDeactivating(user: User): Promise<void> {
  if (user.role !== "admin" || user.status === "inactive") return;
  const activeAdmins = (await getAdminUsers()).filter(
    (admin) => admin.status === "active",
  );
  if (activeAdmins.length <= 1) {
    throw new Error("امکان غیرفعال‌سازی آخرین مدیر سیستم وجود ندارد.");
  }
}

export const userService = {
  getAll: getAllUsers,
  getById: getUserById,

  async create(data: CreateUserPayload): Promise<User> {
    await ensureEmailIsUnique(data.email);
    const payload: Omit<UserWithPassword, "id"> = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      status: data.status,
    };
    return baseApi.create<User>(endpoint, payload);
  },

  async update(id: ID, data: UpdateUserPayload): Promise<User> {
    const existingUser = await getUserById(id);

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
      await ensureNotLastAdminIfDeactivating(existingUser);
    }

    const updateData: DeepPartial<User> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
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

      await safeDelete(
        (deleteId: ID) => baseApi.delete(endpoint, deleteId),
        id,
        endpoint,
      );
    } catch (err) {
      throw new Error(
        `حذف کاربر با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
      );
    }
  },

  async toggleStatus(id: ID): Promise<User> {
    const user = await getUserById(id);
    await ensureNotLastAdminIfDeactivating(user);
    const nextStatus: RecordStatus =
      user.status === "active" ? "inactive" : "active";
    return baseApi.update<User>(endpoint, id, {
      status: nextStatus,
    });
  },
};
