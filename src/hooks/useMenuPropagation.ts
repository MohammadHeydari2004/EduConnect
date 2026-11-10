import { createContext, use } from "react";

export const MenuCloseContext = createContext<(() => void) | null>(null);

export function useMenuClose() {
  return use(MenuCloseContext);
}
