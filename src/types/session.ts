import type { BaseFormErrors, ID } from "#/types/common.ts";

export interface Session {
  readonly id: ID;
  readonly classId: ID;
  title: string;
  description?: string;
  date: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export type SessionFormValues = Omit<
  Session,
  "id" | "createdAt" | "updatedAt"
>;

export interface SessionFormErrors extends BaseFormErrors {
  date?: string | undefined;
  description?: string | undefined;
}
