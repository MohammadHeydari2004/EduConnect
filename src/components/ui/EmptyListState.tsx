import EmptyState from "#/components/common/EmptyState.tsx";

export interface EmptyListStateProps {
  items: unknown[] | null | undefined;
  hasActiveFilters?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  notFoundTitle: string;
  notFoundDescription: string;
}

export function EmptyListState({
  items,
  hasActiveFilters,
  emptyTitle,
  emptyDescription,
  notFoundTitle,
  notFoundDescription,
}: EmptyListStateProps) {
  if (items === undefined) return null;

  const len = items?.length ?? 0;
  if (len > 0) return null;

  const filtered = hasActiveFilters ?? false;
  const showNotFound = filtered;

  return (
    <EmptyState
      title={showNotFound ? notFoundTitle : emptyTitle}
      description={showNotFound ? notFoundDescription : emptyDescription}
    />
  );
}
