export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}