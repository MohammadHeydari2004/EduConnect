import { STORAGE_KEYS } from "#/configs/constants.ts";
import AuthContext from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { loginUser } from "#/services/auth.ts";
import type { AuthContextType, LoginPayload } from "#/types/auth.ts";
import type { User } from "#/types/user.ts";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { isValidUser } from "#/utils/guards.ts";

interface AuthProviderProps {
  children: ReactNode;
}

function getStoredUser(): User | null {
  let storedUser: string | null = null;
  try {
    storedUser = localStorage.getItem(STORAGE_KEYS.authUser);
  } catch {
    return null;
  }

  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    if (isValidUser(parsed)) {
      return parsed;
    }
  } catch {
    // ignore corrupted data
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  } catch {
    // ignore storage errors
  }

  return null;
}

function getStorageErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "QuotaExceededError":
        return "حافظه مرورگر پر است. لطفاً فضای ذخیره‌سازی را خالی کنید.";
      case "SecurityError":
        return "دسترسی به ذخیره‌سازی محلی مسدود شده است. لطفاً تنظیمات حریم خصوصی را بررسی کنید.";
      default:
        return "خطا در دسترسی به حافظه مرورگر.";
    }
  }
  return "خطای ناشناخته در ذخیره‌سازی داده‌ها.";
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const { addToast } = useToast();

  const login = useCallback(
    async (payload: LoginPayload) => {
      const loggedInUser = await loginUser(payload);
      setUser(loggedInUser);

      try {
        localStorage.setItem(
          STORAGE_KEYS.authUser,
          JSON.stringify(loggedInUser),
        );
      } catch (error) {
        addToast(getStorageErrorMessage(error), "error");
      }
    },
    [addToast],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.authUser);
    } catch (error) {
      addToast(getStorageErrorMessage(error), "error");
    }
  }, [addToast]);

  const value: Readonly<AuthContextType> = useMemo(
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
