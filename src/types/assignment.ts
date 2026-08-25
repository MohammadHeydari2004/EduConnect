import type { ID } from "#/types/common.ts";

export interface Assignment {
  id: ID;
  title: string;
  description: string;
  classId: ID;
  teacherId: ID;
  deadline: string;
}
