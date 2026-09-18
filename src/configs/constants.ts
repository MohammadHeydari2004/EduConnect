const PREFIX = import.meta.env.VITE_STORAGE_PREFIX || "educonnect_";

export const STORAGE_KEYS = {
  authUser: `${PREFIX}auth_user`,
  theme: `${PREFIX}theme`,
  language: `${PREFIX}language`,
};
