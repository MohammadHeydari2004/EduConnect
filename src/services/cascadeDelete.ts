import { announcementService } from "#/services/announcement.ts";
import { attendanceService } from "#/services/attendance.ts";
import { assignmentService } from "#/services/assignment.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { safeDelete } from "#/services/api/safeDelete.ts";
import { baseApi } from "#/services/api/baseApi.ts";
import type { CascadeReport, CascadeResult } from "#/types/cascade.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Attendance } from "#/types/attendance.ts";

interface HasId {
  id: ID;
}

interface CascadeDeleteConfig<T extends HasId> {
  endpoint: string;
  getAll: (params?: Record<string, string>) => Promise<T[]>;
  delete: (id: ID) => Promise<void>;
  filter?: (item: T, userId: ID) => boolean;
  serverFilterKey?: string;
}

async function cascadeDeleteByFilter<T extends HasId>(
  userId: ID,
  config: CascadeDeleteConfig<T>,
): Promise<CascadeResult> {
  const errors: string[] = [];
  try {
    const params = config.serverFilterKey
      ? { [config.serverFilterKey]: userId }
      : undefined;
    const items = await baseApi.getAll<T>(config.endpoint, params);
    const filtered = config.filter
      ? items.filter((item) => config.filter!(item, userId))
      : items;

    await Promise.all(
      filtered.map(async (item) => {
        try {
          await safeDelete(config.delete, item.id, config.endpoint);
        } catch (err) {
          errors.push(
            `حذف ${config.endpoint} با id ${item.id} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );

    return {
      entityType: config.endpoint,
      success: errors.length === 0,
      errors,
    };
  } catch (err) {
    return {
      entityType: config.endpoint,
      success: false,
      errors: [
        `دریافت ${config.endpoint} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
      ],
    };
  }
}

export async function cascadeDeleteUserClasses(userId: ID): Promise<CascadeResult> {
  return cascadeDeleteByFilter(userId, {
    endpoint: "/classes",
    getAll: classService.getAll,
    delete: classService.delete,
    serverFilterKey: "teacherId",
  });
}

export async function cascadeDeleteUserAttendances(userId: ID): Promise<CascadeResult> {
  return cascadeDeleteByFilter(userId, {
    endpoint: "/attendance",
    getAll: attendanceService.getAll,
    delete: attendanceService.delete,
    serverFilterKey: "studentId",
  });
}

export async function cascadeDeleteUserSubmissions(userId: ID): Promise<CascadeResult> {
  return cascadeDeleteByFilter(userId, {
    endpoint: "/submissions",
    getAll: submissionService.getAll,
    delete: submissionService.delete,
    serverFilterKey: "studentId",
  });
}

export async function cascadeDeleteUserAnnouncements(
  userId: ID,
): Promise<CascadeResult> {
  return cascadeDeleteByFilter(userId, {
    endpoint: "/announcements",
    getAll: announcementService.getAll,
    delete: announcementService.delete,
    serverFilterKey: "authorId",
  });
}

async function cascadeUpdateArrayField(
  userId: ID,
  config: {
    endpoint: string;
    getAll: () => Promise<HasId[]>;
    filter: (item: HasId) => boolean;
    getArray: (item: HasId) => ID[];
    setArray: (id: ID, value: ID[]) => Promise<void>;
  },
): Promise<CascadeResult> {
  const errors: string[] = [];
  try {
    const items = await config.getAll();
    const filtered = items.filter(config.filter);

    await Promise.all(
      filtered.map(async (item) => {
        try {
          const currentValue = config.getArray(item);
          if (!currentValue.includes(userId)) return;
          const newValue = currentValue.filter((uid) => uid !== userId);
          await config.setArray(item.id, newValue);
        } catch (err) {
          errors.push(
            `به‌روزرسانی ${config.endpoint} با id ${item.id} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );

    return {
      entityType: config.endpoint,
      success: errors.length === 0,
      errors,
    };
  } catch (err) {
    return {
      entityType: config.endpoint,
      success: false,
      errors: [
        `دریافت ${config.endpoint} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
      ],
    };
  }
}
export async function removeUserFromAnnouncementSeenBy(
  userId: ID,
): Promise<CascadeResult> {
  return cascadeUpdateArrayField(userId, {
    endpoint: "/announcements.seenBy",
    getAll: () =>
      baseApi.getAll<{ id: ID; seenBy?: ID[] }>("/announcements"),
    filter: (item) => (item as { seenBy?: ID[] }).seenBy?.includes(userId) ?? false,
    getArray: (item) => (item as { seenBy?: ID[] }).seenBy ?? [],
    setArray: async (id, value) => {
      await announcementService.update(id, { seenBy: value });
    },
  });
}

export async function removeUserFromClassRolls(userId: ID): Promise<CascadeResult> {
  return cascadeUpdateArrayField(userId, {
    endpoint: "/classes.studentIds",
    getAll: () => baseApi.getAll<ClassItem>("/classes"),
    filter: (cls) => (cls as ClassItem).studentIds?.includes(userId) ?? false,
    getArray: (cls) => (cls as ClassItem).studentIds ?? [],
    setArray: async (id, value) => {
      await classService.update(id, { studentIds: value });
    },
  });
}

export async function removeStudentsFromClassCascade(
  classId: ID,
  studentIds: ID[],
): Promise<CascadeReport> {
  const results: CascadeResult[] = [];
  const studentIdsSet = new Set(studentIds);

  // حذف rekordهای حضور و غیاب دانش‌آموزان حذف‌شده در این کلاس
  const attendanceErrors: string[] = [];
  try {
    const attendances = await baseApi.getAll<Attendance>("/attendance", {
      classId,
    });
    const attendanceToDelete = attendances.filter((a) =>
      studentIdsSet.has(a.studentId),
    );
    await Promise.all(
      attendanceToDelete.map(async (a) => {
        try {
          await attendanceService.delete(a.id);
        } catch (err) {
          attendanceErrors.push(
            `حذف حضور و غیاب با id ${a.id} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );
  } catch (err) {
    attendanceErrors.push(
      `دریافت حضور و غیاب کلاس با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
    );
  }
  results.push({
    entityType: "/attendance",
    success: attendanceErrors.length === 0,
    errors: attendanceErrors,
  });

  // حذف ارسال‌های دانش‌آموزان حذف‌شده در تکالیف این کلاس
  const submissionErrors: string[] = [];
  try {
    const assignments = await assignmentService.getByClass(classId);
    const submissionsToDelete: ID[] = [];
    for (const assignment of assignments) {
      const subs = await submissionService.getByAssignment(assignment.id);
      for (const s of subs) {
        if (studentIdsSet.has(s.studentId)) {
          submissionsToDelete.push(s.id);
        }
      }
    }
    await Promise.all(
      submissionsToDelete.map(async (id) => {
        try {
          await submissionService.delete(id);
        } catch (err) {
          submissionErrors.push(
            `حذف ارسال با id ${id} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
          );
        }
      }),
    );
  } catch (err) {
    submissionErrors.push(
      `دریافت/حذف ارسال‌های کلاس با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای نامشخص"}`,
    );
  }
  results.push({
    entityType: "/submissions",
    success: submissionErrors.length === 0,
    errors: submissionErrors,
  });

  return {
    overallSuccess: results.every((r) => r.success),
    results,
  };
}

export async function cascadeDeleteUserData(userId: ID): Promise<CascadeReport> {
  const results: CascadeResult[] = [];

  const seenByResult = await removeUserFromAnnouncementSeenBy(userId);
  results.push(seenByResult);

  const rollsResult = await removeUserFromClassRolls(userId);
  results.push(rollsResult);

  const cascadeResults = await Promise.all([
    cascadeDeleteUserClasses(userId),
    cascadeDeleteUserAttendances(userId),
    cascadeDeleteUserSubmissions(userId),
    cascadeDeleteUserAnnouncements(userId),
  ]);
  results.push(...cascadeResults);

  const overallSuccess = results.every((r) => r.success);

  return {
    overallSuccess,
    results,
  };
}
