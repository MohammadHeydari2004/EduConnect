import { isApiError } from "#/services/api/axiosInstance.ts";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isApiError(err)) return err.userMessage;
  if (err instanceof Error) return err.message;
  return fallback;
}
