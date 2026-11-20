import type { BaseFormErrors, ID } from "#/types/common.ts";

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

export type UpdateAssignmentPayload = Partial<
  Omit<Assignment, "id" | "teacherId" | "createdAt" | "updatedAt">
>;

type AssignmentStatusFilter = "active" | "expired" | "";

export type AssignmentFilters = {
  search: string;
  classId: string;
  status: AssignmentStatusFilter;
};

export interface AssignmentFormErrors extends BaseFormErrors {
  deadline?: string;
  classId?: string;
}
