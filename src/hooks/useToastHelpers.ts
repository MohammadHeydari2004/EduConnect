export function showErrorToast(
  addToast: (message: string, type: "error") => void,
  message: string,
): void {
  addToast(message, "error");
}