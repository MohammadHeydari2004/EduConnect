import type { ClassItem } from "#/types/class.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";

export interface OwnedCollections {
  classes: ClassItem[];
  assignments: Assignment[];
  submissions: Submission[];
}

/**
 * Filters the given collections down to records owned by `user` (a teacher
 * owns classes via `teacherId`; a student owns them via `studentIds`).
 * Returns the filtered sets plus the id-sets needed for downstream lookups.
 */
export function filterCollectionsByOwnership(
  user: User,
  classes: ClassItem[],
  assignments: Assignment[],
  submissions: Submission[],
): OwnedCollections & { classIdSet: Set<string>; assignmentIdSet: Set<string> } {
  const isTeacher = user.role === "teacher";
  const ownedClasses = classes.filter((c) =>
    isTeacher ? c.teacherId === user.id : (c.studentIds || []).includes(user.id),
  );
  const classIdSet = new Set(ownedClasses.map((c) => c.id));
  const ownedAssignments = isTeacher
    ? assignments.filter((a) => classIdSet.has(a.classId))
    : assignments.filter((a) => classIdSet.has(a.classId));
  const assignmentIdSet = new Set(ownedAssignments.map((a) => a.id));
  const ownedSubmissions = isTeacher
    ? submissions.filter((s) => assignmentIdSet.has(s.assignmentId))
    : submissions.filter((s) => s.studentId === user.id);

  return {
    classes: ownedClasses,
    assignments: ownedAssignments,
    submissions: ownedSubmissions,
    classIdSet,
    assignmentIdSet,
  };
}
