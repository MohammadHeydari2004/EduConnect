
import { baseApi } from "#/services/api/baseApi.ts";
import type { LoginPayload } from "#/types/auth.ts";
import type { User, UserWithPassword } from "#/types/user.ts";
import { removePassword } from "#/utils/userSanitization.ts";

export async function loginUser(payload: LoginPayload): Promise<User> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    throw new Error("لطفاً ایمیل و رمز عبور را وارد کنید.");
  }

  const users = await baseApi.getAll<UserWithPassword>("/users", { email });

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
