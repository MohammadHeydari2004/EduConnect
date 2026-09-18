import axiosInstance from "#/services/api/axiosInstance.ts";
import type { LoginPayload } from "#/types/auth.ts";
import type { User } from "#/types/user.ts";

export async function loginUser(payload: LoginPayload): Promise<User> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();

  if (!email || !password) {
    throw new Error("لطفاً ایمیل و رمز عبور را وارد کنید.");
  }

  const response = await axiosInstance.get<User[]>("/users", {
    params: { email },
  });

  const user = response.data[0];

  if (!user) {
    throw new Error("هیچ حساب کاربری با این ایمیل یافت نشد.");
  }

  if (user.password !== password) {
    throw new Error("رمز عبور وارد شده صحیح نیست.");
  }

  if (user.status !== "active") {
    throw new Error("این حساب کاربری غیرفعال است. با مدیر سیستم تماس بگیرید.");
  }

  return user;
}
