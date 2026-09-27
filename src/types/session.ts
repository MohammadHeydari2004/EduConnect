import type { ID } from "./common";

export interface Session {
  readonly id: ID;
  readonly classId: ID;
  title: string;
  description?: string;
  date: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface SessionFormValues {
  title: string;
  classId: ID;
  date: string;
  description?: string;
}
