import type { ID, SubmissionStatus } from "#/types/common.ts";

export interface Submission {
  id: ID;
  assignmentId: ID;
  studentId: ID;
  content: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade?: number | null;
  feedback?: string | null;
  updatedAt?: string;
}
