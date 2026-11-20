export function getRecentItems<T>(
  items: readonly T[],
  count: number,
  getTime: (item: T) => number,
): T[] {
  return [...items]
    .sort((a, b) => getTime(b) - getTime(a))
    .slice(0, count);
}