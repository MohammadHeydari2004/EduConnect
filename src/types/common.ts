export type ID = string;
export type UserRole = "admin" | "teacher" | "student";
export type RecordStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "absent" | "late";
export type SubmissionStatus =
  "submitted" | "graded" | "pending" | "late" | "returned";

export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P] | null;
};

export interface TitleRule {
  titleLabel?: string;
  min?: number;
  max?: number;
}

export interface BaseFormErrors {
  title?: string;
  form?: string;
}
