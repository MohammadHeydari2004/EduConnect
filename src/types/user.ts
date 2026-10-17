import type { ID, RecordStatus, UserRole } from "#/types/common.ts";

export interface User {
  readonly id: ID;
  name: string;
  email: string;
  role: UserRole;
  status: RecordStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Raw user record as returned by the API, which includes the plaintext
 * password field. Always pass it through `removePassword` before storing or
 * displaying a `User`.
 */
export interface UserWithPassword extends User {
  password?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: RecordStatus;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  status: RecordStatus;
}

export interface UserFilters {
  searchName: string;
  searchEmail: string;
  role: "" | UserRole;
  status: "" | RecordStatus;
}
