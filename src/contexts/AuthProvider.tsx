import AuthContext from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { loginUser } from "#/services/auth.ts";
import type { AuthContextType, LoginPayload, User } from "#/types";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  clearStoredUser,
  getStorageErrorMessage,
  getStoredUser,
  setStoredUser,
} from "#/utils";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const { addToast } = useToast();

  const login = useCallback(
    async (payload: LoginPayload) => {
      const loggedInUser = await loginUser(payload);

      try {
        setStoredUser(loggedInUser);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : getStorageErrorMessage(error);
        addToast(message, "error");
        throw new Error(message);
      }

      setUser(loggedInUser);
    },
    [addToast],
  );

  const logout = useCallback(() => {
    try {
      clearStoredUser();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : getStorageErrorMessage(error);
      addToast(message, "error");
      return;
    }

    setUser(null);
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
