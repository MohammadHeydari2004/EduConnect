export type ClassStatus = "active" | "inactive";

export interface ClassItem {
  id: number;
  title: string;
  teacherId: number | null;
  studentIds: number[];
  capacity: number;
  status: ClassStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassFormValues {
  title: string;
  teacherId: number | null;
  studentIds: number[];
  capacity: number;
  status: ClassStatus;
  description?: string;
}
