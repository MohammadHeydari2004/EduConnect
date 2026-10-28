import { STORAGE_KEYS } from "#/configs/constants";
import AuthContext from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { loginUser } from "#/services/auth.ts";
import type { AuthContextType, LoginPayload } from "#/types/auth.ts";
import type { User } from "#/types/user.ts";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getStoredUser, getStorageErrorMessage } from "#/utils/authStorage.ts";

interface AuthProviderProps {
  children: ReactNode;
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
