import type { Submission } from "#/types";

export interface GradingStats {
  graded: number;
  total: number;
}

export function buildGradingStats<TKey extends string | number>(
  submissions: Submission[],
  keyFn: (submission: Submission) => TKey | undefined,
): Map<TKey, GradingStats> {
  const map = new Map<TKey, GradingStats>();
  for (const sub of submissions) {
    const hasContent = sub.content && sub.content.trim().length > 0;
    if (!hasContent) continue;
    const key = keyFn(sub);
    if (key === undefined) continue;
    const stats = map.get(key) ?? { graded: 0, total: 0 };
    stats.total++;
    if (sub.status === "graded") stats.graded++;
    map.set(key, stats);
  }
  return map;
}