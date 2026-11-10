import { createStringContainsFilter, createExactMatchFilter, createDateStatusFilter } from "#/hooks/useFilter.ts";
import type { FilterConfig } from "#/types/hooks.ts";
import type { Assignment, AssignmentFilters } from "#/types/assignment.ts";

export const assignmentFilterConfigs: FilterConfig<Assignment>[] = [
  createStringContainsFilter<Assignment>("search", (assignment) => assignment.title),
  createExactMatchFilter<Assignment>("classId", (assignment) => assignment.classId),
  createDateStatusFilter<Assignment>("status", (assignment) => assignment.deadline),
];

export const initialAssignmentFilters: AssignmentFilters = {
  search: "",
  classId: "",
  status: "",
};
