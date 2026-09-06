import type { ID } from "./common";

export interface Session {
  id: ID;
  classId: ID;
  title: string;
  description?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionFormValues {
  title: string;
  classId: ID;
  date: string;
  description?: string;
}
