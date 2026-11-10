export function hasActiveUserFilters(
  filters: { searchName: string; searchEmail: string; role: string; status: string },
): boolean {
  return Boolean(filters.searchName || filters.searchEmail || filters.role || filters.status);
}
