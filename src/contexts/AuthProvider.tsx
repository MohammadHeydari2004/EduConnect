import { STORAGE_KEYS } from "#/configs/constants.ts";
import { loginUser } from "#/services/auth.ts";
import type { AuthContextType, LoginPayload } from "#/types/auth.ts";
import type { DeepReadonly } from "#/types/common.ts";
import type { User } from "#/types/user.ts";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import AuthContext from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

function isValidUser(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) return false;
  const u = obj as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.name === "string" &&
    typeof u.email === "string" &&
    typeof u.role === "string" &&
    typeof u.status === "string"
  );
}

function getStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.authUser);
    if (!storedUser) return null;

    const parsed = JSON.parse(storedUser);
    if (isValidUser(parsed)) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEYS.authUser);
    return null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await loginUser(payload);
    setUser(loggedInUser);

    try {
      localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("خطا در ذخیره‌سازی اطلاعات کاربر در LocalStorage:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.authUser);
    } catch (error) {
      console.error("خطا در پاک‌سازی LocalStorage:", error);
    }
  }, []);

  // اعمال DeepReadonly برای تضمین تغییرناپذیری (Immutability) در سطح Context
  const value: DeepReadonly<AuthContextType> = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
