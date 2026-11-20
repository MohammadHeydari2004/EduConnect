import { validateLength } from "#/utils/validation.ts";
import type { TitleRule } from "#/types";

export function validateTitle(
  value: string,
  rule: TitleRule = {},
): string | null {
  const { titleLabel = "", min = 3, max } = rule;
  const label = titleLabel ? `عنوان ${titleLabel}` : "عنوان";
  const error =
    max === undefined
      ? validateLength(value, label, { min })
      : validateLength(value, label, { min, max });
  return error ?? null;
}