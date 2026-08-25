export interface Session {
  id: number;
  classId: number;
  title: string;
  description?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionFormValues {
  title: string;
  classId: number;
  date: string;
  description?: string;
}
