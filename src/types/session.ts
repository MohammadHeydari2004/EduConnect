import type { ID, Optional } from "./common";

export interface Session {
  readonly id: ID;
  readonly classId: ID;
  title: string;
  description: Optional<string>;
  date: string;
  readonly createdAt: Optional<string>;
  readonly updatedAt?: Optional<string>;
}

export interface SessionFormValues {
  title: string;
  classId: ID;
  date: string;
  description: Optional<string>;
}
