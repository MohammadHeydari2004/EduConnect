import { useCallback, useMemo, useState, type ReactNode } from "react";

import { STORAGE_KEYS } from "#/configs/constants.ts";
import { loginUser } from "#/services/auth.ts";
import type { LoginPayload } from "#/types/auth.ts";
import type { User } from "#/types/user.ts";
import AuthContext from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(STORAGE_KEYS.authUser);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await loginUser(payload);
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.authUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
