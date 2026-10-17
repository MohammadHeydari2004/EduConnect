import type { ID, Maybe, RecordStatus } from "#/types/common.ts";

export type ClassStatus = RecordStatus;

export interface ClassItem {
  readonly id: ID;
  title: string;
  teacherId: Maybe<ID>;
  studentIds: ID[];
  capacity: number;
  status: ClassStatus;
  description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface ClassFormValues {
  title: string;
  teacherId: Maybe<ID>;
  studentIds: ID[];
  capacity: number;
  status: ClassStatus;
  description?: string;
}
