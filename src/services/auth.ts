
import { baseApi } from "#/services/api/baseApi.ts";
import { API_ENDPOINTS } from "#/configs/constants";
import type { LoginPayload, User, UserWithPassword } from "#/types";
import { normalizeEmail, removePassword } from "#/utils";

export async function loginUser(payload: LoginPayload): Promise<User> {
  const email = normalizeEmail(payload.email);
  const password = payload.password;
  const invalidCredentials = "ایمیل یا رمز عبور نادرست است.";

  if (!email || !password) {
    throw new Error(invalidCredentials);
  }

  const users = await baseApi.getAll<UserWithPassword>(API_ENDPOINTS.USERS, {
    email,
  });

  if (!users || users.length === 0) {
    throw new Error(invalidCredentials);
  }

  const user = users[0]!;
  if (user.password !== password) {
    throw new Error(invalidCredentials);
  }

  if (user.status !== "active") {
    throw new Error("این حساب کاربری غیرفعال است. با مدیر سیستم تماس بگیرید.");
  }

  return removePassword(user);
}
