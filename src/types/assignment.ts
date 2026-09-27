import type { ID } from "#/types/common.ts";

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
