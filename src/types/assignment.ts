import type { ID, BaseFormErrors } from "#/types/common.ts";

export interface Assignment {
  readonly id: ID;
  title: string;
  description: string;
  classId: ID;
  readonly teacherId: ID;
  deadline: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export type CreateAssignmentPayload = Omit<
  Assignment,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAssignmentPayload = Partial<Assignment>;

export type AssignmentFilters = {
  search: string;
  classId: string;
  status: "active" | "expired" | "";
};

export interface AssignmentFormErrors extends BaseFormErrors {
  deadline?: string;
  classId?: string;
}
