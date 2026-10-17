import type { ID } from "#/types/common.ts";

export interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}

export interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: ID[];
  onChange: (ids: ID[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchPlaceholder?: string;
  /** Which side of the trigger the list opens on (default: down). */
  openDirection?: "down" | "up";
}