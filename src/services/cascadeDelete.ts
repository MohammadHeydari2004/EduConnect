import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { attendanceService } from "#/services/attendance.ts";
import type { ID } from "#/types/common.ts";

interface HasId {
  id: ID;
}

interface CascadeDeleteConfig<T extends HasId> {
  getAll: () => Promise<T[]>;
  delete: (id: ID) => Promise<void>;
  filter: (item: T, userId: ID) => boolean;
}

async function cascadeDeleteByFilter<T extends HasId>(
  userId: ID,
  config: CascadeDeleteConfig<T>,
): Promise<void> {
  const items = await config.getAll();
  const filtered = items.filter((item) => config.filter(item, userId));
  await Promise.all(filtered.map((item) => config.delete(item.id)));
}

export async function cascadeDeleteUserClasses(userId: ID): Promise<void> {
  await cascadeDeleteByFilter(userId, {
    getAll: classService.getAll,
    delete: classService.delete,
    filter: (cls) => cls.teacherId === userId,
  });
}

export async function cascadeDeleteUserAttendances(userId: ID): Promise<void> {
  await cascadeDeleteByFilter(userId, {
    getAll: attendanceService.getAll,
    delete: attendanceService.delete,
    filter: (attendance) => attendance.studentId === userId,
  });
}

export async function cascadeDeleteUserSubmissions(userId: ID): Promise<void> {
  await cascadeDeleteByFilter(userId, {
    getAll: submissionService.getAll,
    delete: submissionService.delete,
    filter: (submission) => submission.studentId === userId,
  });
}

export async function cascadeDeleteUserAnnouncements(userId: ID): Promise<void> {
  await cascadeDeleteByFilter(userId, {
    getAll: announcementService.getAll,
    delete: announcementService.delete,
    filter: (announcement) => announcement.authorId === userId,
  });
}

export async function removeUserFromClassRolls(userId: ID): Promise<void> {
  const classes = await classService.getAll();
  const updates = classes
    .filter((cls) => (cls.studentIds ?? []).includes(userId))
    .map((cls) =>
      classService.update(cls.id, {
        studentIds: (cls.studentIds ?? []).filter((id) => id !== userId),
      }),
    );
  await Promise.all(updates);
}

export async function cascadeDeleteUserData(userId: ID): Promise<void> {
  await Promise.all([
    cascadeDeleteUserClasses(userId),
    cascadeDeleteUserAttendances(userId),
    cascadeDeleteUserSubmissions(userId),
    cascadeDeleteUserAnnouncements(userId),
    removeUserFromClassRolls(userId),
  ]);
}