import type { ID, Maybe, RecordStatus, BaseFormErrors } from "#/types/common.ts";

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

export interface ClassFiltersValues {
  search: string;
  statusFilter: ClassStatus | "";
  teacherFilter: string;
}

export interface ClassFormErrors extends BaseFormErrors {
  teacherId?: string | undefined;
  capacity?: string | undefined;
  studentIds?: string | undefined;
  description?: string | undefined;
}
