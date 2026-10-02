import type { AuthContextType, AuthState } from "#/types/auth.ts";
import { createContext, useContext } from "react";

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = "AuthContext";

export default AuthContext;

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
        "Make sure your component is wrapped inside <AuthProvider> in the component tree.",
    );
  }
  return context;
}
