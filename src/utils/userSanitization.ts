import type { User, UserWithPassword } from "#/types/user.ts";

export function removePassword(user: UserWithPassword): User {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
