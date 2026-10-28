import { announcementService } from "#/services/announcement.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { attendanceService } from "#/services/attendance.ts";
import type { ID } from "#/types/common.ts";

export async function cascadeDeleteUserClasses(userId: ID): Promise<void> {
  const classes = await classService.getAll();
  const ownedClasses = classes.filter((cls) => cls.teacherId === userId);
  await Promise.all(ownedClasses.map((cls) => classService.delete(cls.id)));
}

export async function cascadeDeleteUserAttendances(userId: ID): Promise<void> {
  const attendances = (await attendanceService.getAll()).filter(
    (attendance) => attendance.studentId === userId,
  );
  await Promise.all(
    attendances.map((attendance) => attendanceService.delete(attendance.id)),
  );
}

export async function cascadeDeleteUserSubmissions(userId: ID): Promise<void> {
  const submissions = (await submissionService.getAll()).filter(
    (submission) => submission.studentId === userId,
  );
  await Promise.all(
    submissions.map((submission) => submissionService.delete(submission.id)),
  );
}

export async function cascadeDeleteUserAnnouncements(userId: ID): Promise<void> {
  const announcements = (await announcementService.getAll()).filter(
    (announcement) => announcement.authorId === userId,
  );
  await Promise.all(
    announcements.map((announcement) => announcementService.delete(announcement.id)),
  );
}

export async function removeUserFromClassRolls(userId: ID): Promise<void> {
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

export async function cascadeDeleteUserData(userId: ID): Promise<void> {
  await Promise.all([
    cascadeDeleteUserClasses(userId),
    cascadeDeleteUserAttendances(userId),
    cascadeDeleteUserSubmissions(userId),
    cascadeDeleteUserAnnouncements(userId),
    removeUserFromClassRolls(userId),
  ]);
}