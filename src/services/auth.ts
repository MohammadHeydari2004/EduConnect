import axiosInstance from "#/services/api/axiosInstance.ts";
import type { LoginPayload } from "#/types/auth.ts";
import type { User, UserWithPassword } from "#/types/user.ts";
import { removePassword } from "#/utils/userSanitization.ts";

/**
 * Login using json-server (development only).
 *
 * ⚠️ SECURITY WARNING: This implementation compares passwords client-side
 * and is INSECURE for production use. It sends the plaintext password to
 * the client for comparison against the stored password.
 *
 * In production, authentication MUST be handled server-side with:
 * - Proper password hashing (bcrypt, argon2, scrypt)
 * - A dedicated /auth/login endpoint that returns a JWT/session token
 * - Server-side password verification
 * - Secure password reset flows
 *
 * TODO: Replace with a real authentication backend before production deployment.
 */
export async function loginUser(payload: LoginPayload): Promise<User> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    throw new Error("لطفاً ایمیل و رمز عبور را وارد کنید.");
  }

  const response = await axiosInstance.get<UserWithPassword[]>("/users", {
    params: { email },
  });

  const users = response.data;

  if (!users || users.length === 0) {
    throw new Error("هیچ حساب کاربری با این ایمیل یافت نشد.");
  }

  const user = users[0]!;
  if (user.password !== password) {
    throw new Error("رمز عبور وارد شده صحیح نیست.");
  }

  if (user.status !== "active") {
    throw new Error("این حساب کاربری غیرفعال است. با مدیر سیستم تماس بگیرید.");
  }

  return removePassword(user);
}
