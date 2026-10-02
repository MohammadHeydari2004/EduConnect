export type ID = string;
export type UserRole = "admin" | "teacher" | "student";
export type RecordStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "absent" | "late";
export type SubmissionStatus = "submitted" | "graded" | "pending";

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;
