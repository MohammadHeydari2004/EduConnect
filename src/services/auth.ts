import axiosInstance from "#/services/api/axiosInstance.ts";
import type { LoginPayload } from "#/types/auth.ts";
import type { User, UserWithPassword } from "#/types/user.ts";
import { removePassword } from "#/utils/userSanitization.ts";
import { logger } from "#/utils/logger.ts";

export async function loginUser(payload: LoginPayload): Promise<User> {
  if (import.meta.env.DEV) {
    logger.warn("SECURITY: Using development-only client-side authentication. DO NOT USE IN PRODUCTION.", {
      function: "loginUser",
      environment: import.meta.env.MODE,
    });
  }

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
