import type { ID, Maybe } from "./common";

export type ClassStatus = "active" | "inactive";

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
