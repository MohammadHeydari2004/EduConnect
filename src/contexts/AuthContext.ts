import type { AuthContextType } from "#/types/auth.ts";
import { createContext, useContext } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
