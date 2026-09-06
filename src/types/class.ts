import type { ID } from "./common";

export type ClassStatus = "active" | "inactive";

export interface ClassItem {
  id: ID;
  title: string;
  teacherId: ID | null;
  studentIds: ID[];
  capacity: number;
  status: ClassStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassFormValues {
  title: string;
  teacherId: ID | null;
  studentIds: ID[];
  capacity: number;
  status: ClassStatus;
  description?: string;
}
