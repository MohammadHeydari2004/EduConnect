import type { ID, BaseFormErrors, Maybe, SubmissionStatus } from "#/types/common.ts";

export interface Submission {
  readonly id: ID;
  readonly assignmentId: ID;
  readonly studentId: ID;
  content: string;
  readonly submittedAt: string;
  status: SubmissionStatus;
  grade?: number | null;
  feedback?: Maybe<string>;
  readonly updatedAt?: string | null;
}

export interface SubmissionFormErrors extends BaseFormErrors {
  content?: string;
  form?: string;
}

export interface NewSubmissionDraft {
  assignmentId: ID;
}
