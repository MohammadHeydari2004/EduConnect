export function buildAriaDescribedBy(
  errorId?: string,
  descId?: string,
): string | undefined {
  const ids = [errorId, descId].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}
