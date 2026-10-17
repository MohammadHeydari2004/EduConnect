import { baseApi } from "#/services/api/baseApi.ts";
import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { attendanceService } from "#/services/attendance.ts";
import type { ID, RecordStatus } from "#/types/common.ts";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserWithPassword,
} from "#/types/user.ts";

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
  const normalizedEmail = email.trim().toLowerCase();
  const duplicates = await baseApi.getAll<User>(endpoint, {
    email: normalizedEmail,
  });

  const duplicate = duplicates.find((user) => user.id !== excludeUserId);
  if (duplicate) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }
}

async function getAdminUsers(): Promise<User[]> {
  return baseApi.getAll<User>(endpoint, { role: "admin" });
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

/**
 * Delete all classes owned by the user. This cascades to sessions,
 * attendance records, assignments, and submissions via their services.
 */
async function deleteRelatedClasses(userId: ID): Promise<void> {
  const classes = await classService.getAll();
  const ownedClasses = classes.filter((cls) => cls.teacherId === userId);
  await Promise.all(ownedClasses.map((cls) => classService.delete(cls.id)));
}

async function deleteRelatedAttendances(userId: ID): Promise<void> {
  const attendances = (await attendanceService.getAll()).filter(
    (attendance) => attendance.studentId === userId,
  );
  await Promise.all(
    attendances.map((attendance) => attendanceService.delete(attendance.id)),
  );
}

async function deleteRelatedSubmissions(userId: ID): Promise<void> {
  const submissions = (await submissionService.getAll()).filter(
    (submission) => submission.studentId === userId,
  );
  await Promise.all(
    submissions.map((submission) => submissionService.delete(submission.id)),
  );
}

async function deleteRelatedAnnouncements(userId: ID): Promise<void> {
  const announcements = (await announcementService.getAll()).filter(
    (announcement) => announcement.authorId === userId,
  );
  await Promise.all(
    announcements.map((announcement) =>
      announcementService.delete(announcement.id),
    ),
  );
}

/** Remove the user from the `studentIds` of every class that lists them. */
async function removeStudentFromClassRolls(userId: ID): Promise<void> {
  const classes = await classService.getAll();
  await Promise.all(
    classes
      .filter((cls) => (cls.studentIds ?? []).includes(userId))
      .map((cls) =>
        classService.update(cls.id, {
          studentIds: (cls.studentIds ?? []).filter((id) => id !== userId),
        }),
      ),
  );
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

    // Send only the changed fields; readonly fields (id/timestamps) must not
    // be PATCHed back to the server.
    return baseApi.update<User>(endpoint, id, {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: data.status,
    });
  },

  async delete(id: ID): Promise<void> {
    await ensureNotLastAdmin(id);

    await Promise.all([
      deleteRelatedClasses(id),
      deleteRelatedAttendances(id),
      deleteRelatedSubmissions(id),
      deleteRelatedAnnouncements(id),
      removeStudentFromClassRolls(id),
    ]);

    await baseApi.delete(endpoint, id);
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
