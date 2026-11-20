export function hasActiveFilters(filters: object): boolean {
  return Object.values(filters).some((value) => Boolean(value));
}