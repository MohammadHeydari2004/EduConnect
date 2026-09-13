import { baseApi } from "#/services/api/baseApi.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "#/types/user.ts";
import type { ID, RecordStatus, UserRole } from "#/types/common.ts";

const endpoint = "/users";

async function getAllUsers(): Promise<User[]> {
  return baseApi.getAll<User>(endpoint);
}

async function getUserById(id: ID): Promise<User> {
  return baseApi.getById<User>(endpoint, id);
}

async function ensureEmailIsUnique(
  email: string,
  excludeUserId?: ID,
): Promise<void> {
  const users = await getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const duplicate = users.find(
    (user) =>
      user.email.trim().toLowerCase() === normalizedEmail &&
      user.id !== excludeUserId,
  );
  if (duplicate) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }
}

async function getAdminUsers(): Promise<User[]> {
  const users = await getAllUsers();
  return users.filter((user) => user.role === "admin");
}

async function ensureNotLastAdmin(userId: ID): Promise<void> {
  const users = await getAllUsers();
  const targetUser = users.find((user) => user.id === userId);
  if (!targetUser) throw new Error("کاربر موردنظر پیدا نشد.");
  if (targetUser.role !== "admin") return;

  const adminUsers = users.filter((user) => user.role === "admin");
  if (adminUsers.length <= 1) {
    throw new Error("امکان حذف یا تغییر آخرین مدیر سیستم وجود ندارد.");
  }
}

async function ensureNotLastAdminIfDeactivating(user: User): Promise<void> {
  if (user.role !== "admin" || user.status === "inactive") return;
  const admins = await getAdminUsers();
  const activeAdmins = admins.filter((admin) => admin.status === "active");
  if (activeAdmins.length <= 1) {
    throw new Error("امکان غیرفعال‌سازی آخرین مدیر سیستم وجود ندارد.");
  }
}

export const userService = {
  getAll: getAllUsers,
  getById: getUserById,
  async create(data: CreateUserPayload): Promise<User> {
    await ensureEmailIsUnique(data.email);
    const payload: Omit<User, "id"> = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      status: data.status,
    };
    return baseApi.create<User>(endpoint, payload);
  },
  async update(id: ID, data: UpdateUserPayload): Promise<User> {
    await ensureEmailIsUnique(data.email, id);
    const existingUser = await getUserById(id);

    if (existingUser.role === "admin" && data.role !== "admin") {
      await ensureNotLastAdmin(id);
    }
    if (
      existingUser.role === "admin" &&
      existingUser.status === "active" &&
      data.status === "inactive"
    ) {
      await ensureNotLastAdminIfDeactivating(existingUser);
    }

    const payload: User = {
      ...existingUser,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: data.status,
    };
    return baseApi.update<User>(endpoint, id, payload);
  },
  async delete(id: ID): Promise<void> {
    await ensureNotLastAdmin(id);
    await baseApi.delete(endpoint, id);
  },
  async toggleStatus(id: ID): Promise<User> {
    const user = await getUserById(id);
    await ensureNotLastAdminIfDeactivating(user);
    const nextStatus: RecordStatus =
      user.status === "active" ? "inactive" : "active";
    return baseApi.update<User>(endpoint, id, { ...user, status: nextStatus });
  },
  async changeRole(id: ID, role: UserRole): Promise<User> {
    const user = await getUserById(id);
    if (user.role === "admin" && role !== "admin") await ensureNotLastAdmin(id);
    return baseApi.update<User>(endpoint, id, { ...user, role });
  },
  getAdminUsers,
};
