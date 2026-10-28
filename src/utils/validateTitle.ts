export interface TitleRule {
  titleLabel?: string;
  min?: number;
  max?: number;
}

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
