import { announcementService } from "#/services/announcement.ts";
import { baseApi } from "#/services/api/baseApi.ts";
import { assignmentService } from "#/services/assignment.ts";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type {
  Announcement,
  Attendance,
  CascadeReport,
  CascadeResult,
  ClassItem,
  ID,
  Submission,
} from "#/types";

interface HasId {
  id: ID;
}

interface CascadeProcessConfig<T extends HasId> {
  entityLabel: string;
  actionLabel: string;
  fetchItems: () => Promise<T[]>;
  filter?: (item: T) => boolean;
  processItem: (item: T) => Promise<void>;
}

async function cascadeProcess<T extends HasId>(
  config: CascadeProcessConfig<T>,
): Promise<CascadeResult> {
  const errors: string[] = [];
  try {
    const items = await config.fetchItems();
    const filtered = config.filter ? items.filter(config.filter) : items;

    await Promise.all(
      filtered.map(async (item) => {
        try {
          await config.processItem(item);
        } catch (err) {
          errors.push(
            `${config.actionLabel} ${config.entityLabel} با id ${item.id} با خطا مواجه شد: ${
              err instanceof Error ? err.message : "خطای نامشخص"
            }`,
          );
        }
      }),
    );

    return {
      entityType: config.entityLabel,
      success: errors.length === 0,
      errors,
    };
  } catch (err) {
    return {
      entityType: config.entityLabel,
      success: false,
      errors: [
        `دریافت ${config.entityLabel} با خطا مواجه شد: ${
          err instanceof Error ? err.message : "خطای نامشخص"
        }`,
      ],
    };
  }
}

async function removeUserFromAnnouncementSeenBy(
  userId: ID,
): Promise<CascadeResult> {
  return cascadeProcess<{ id: ID; seenBy?: ID[] }>({
    entityLabel: "اطلاعیه‌ها",
    actionLabel: "به‌روزرسانی",
    fetchItems: () =>
      baseApi.getAll<{ id: ID; seenBy?: ID[] }>(API_ENDPOINTS.ANNOUNCEMENTS),
    filter: (item) => (item.seenBy ?? []).includes(userId),
    processItem: async (item) => {
      const seenBy = (item.seenBy ?? []).filter((uid) => uid !== userId);
      await announcementService.update(item.id, { seenBy });
    },
  });
}

async function removeUserFromClassRolls(
  userId: ID,
): Promise<CascadeResult> {
  return cascadeProcess<ClassItem>({
    entityLabel: "کلاس‌ها",
    actionLabel: "به‌روزرسانی",
    fetchItems: () => classService.getAll(),
    filter: (cls) => (cls.studentIds ?? []).includes(userId),
    processItem: async (item) => {
      const studentIds = (item.studentIds ?? []).filter(
        (sid) => sid !== userId,
      );
      await classService.update(item.id, { studentIds });
    },
  });
}

export async function removeStudentsFromClassCascade(
  classId: ID,
  studentIds: ID[],
): Promise<CascadeReport> {
  const results: CascadeResult[] = [];
  const studentIdsSet = new Set(studentIds);

  const attendanceResult = await cascadeProcess<Attendance>({
    entityLabel: "حضور و غیاب",
    actionLabel: "حذف",
    fetchItems: () =>
      baseApi.getAll<Attendance>(API_ENDPOINTS.ATTENDANCE, { classId }),
    filter: (a) => studentIdsSet.has(a.studentId),
    processItem: (a) => attendanceService.delete(a.id),
  });
  results.push(attendanceResult);

  const submissionResult = await cascadeProcess<Submission>({
    entityLabel: "ارسال‌ها",
    actionLabel: "حذف",
    fetchItems: async () => {
      const assignments = await assignmentService.getByClass(classId);
      const nested = await Promise.all(
        assignments.map((a) => submissionService.getByAssignment(a.id)),
      );
      return nested.flat();
    },
    filter: (s) => studentIdsSet.has(s.studentId),
    processItem: (s) => submissionService.delete(s.id),
  });
  results.push(submissionResult);

  return {
    overallSuccess: results.every((r) => r.success),
    results,
  };
}

export async function cascadeDeleteUserData(
  userId: ID,
): Promise<CascadeReport> {
  const results: CascadeResult[] = [];

  const seenByResult = await removeUserFromAnnouncementSeenBy(userId);
  results.push(seenByResult);

  const rollsResult = await removeUserFromClassRolls(userId);
  results.push(rollsResult);

  const cascadeResults = await Promise.all([
    cascadeProcess<ClassItem>({
      entityLabel: "کلاس‌ها",
      actionLabel: "حذف",
      fetchItems: () => classService.getAll({ teacherId: userId }),
      processItem: (item) => classService.delete(item.id),
    }),
    cascadeProcess<Attendance>({
      entityLabel: "حضور و غیاب",
      actionLabel: "حذف",
      fetchItems: () => attendanceService.getAll({ studentId: userId }),
      processItem: (item) => attendanceService.delete(item.id),
    }),
    cascadeProcess<Submission>({
      entityLabel: "ارسال‌ها",
      actionLabel: "حذف",
      fetchItems: () => submissionService.getAll({ studentId: userId }),
      processItem: (item) => submissionService.delete(item.id),
    }),
    cascadeProcess<Announcement>({
      entityLabel: "اطلاعیه‌ها",
      actionLabel: "حذف",
      fetchItems: () => announcementService.getAll({ authorId: userId }),
      processItem: (item) => announcementService.delete(item.id),
    }),
  ]);
  results.push(...cascadeResults);

  const overallSuccess = results.every((r) => r.success);

  return {
    overallSuccess,
    results,
  };
}