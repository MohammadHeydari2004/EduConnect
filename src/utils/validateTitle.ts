export interface TitleRule {
  /** Noun for the required-message, e.g. "کلاس" → "عنوان کلاس الزامی است." */
  titleLabel?: string;
  /** Minimum length (default 3). */
  min?: number;
  /** Maximum length; omit to skip the max check. */
  max?: number;
}

/**
 * Single source for the "title" validation that was previously duplicated
 * across class / session / announcement / assignment validators.
 * Returns the error message, or `null` when valid.
 */
export function validateTitle(
  value: string,
  rule: TitleRule = {},
): string | null {
  const { titleLabel = "", min = 3, max } = rule;
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return titleLabel
      ? `عنوان ${titleLabel} الزامی است.`
      : "عنوان الزامی است.";
  }
  if (trimmed.length < min) {
    return `عنوان باید حداقل ${min} کاراکتر باشد.`;
  }
  if (typeof max === "number" && trimmed.length > max) {
    return `عنوان نباید بیشتر از ${max} کاراکتر باشد.`;
  }
  return null;
}
