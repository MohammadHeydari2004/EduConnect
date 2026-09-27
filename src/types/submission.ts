import type { ID, Nullable, SubmissionStatus } from "#/types/common.ts";

export interface Submission {
  readonly id: ID;
  readonly assignmentId: ID;
  readonly studentId: ID;
  content: string;
  readonly submittedAt: string;
  status: SubmissionStatus;
  grade?: Nullable<number>;
  feedback?: Nullable<string>;
  readonly updatedAt?: string;
}
