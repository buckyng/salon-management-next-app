import { EnrichedTurn } from '../types';

export function sortByKey<T>(
  data: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    // Handle null or undefined values explicitly
    if (valueA == null || valueB == null) {
      if (valueA == null && valueB == null) return 0;
      return valueA == null
        ? order === 'asc'
          ? -1
          : 1
        : order === 'asc'
        ? 1
        : -1;
    }

    // Convert symbol keys to strings, if necessary
    const valA =
      typeof valueA === 'string'
        ? new Date(valueA).getTime()
        : (valueA as number);
    const valB =
      typeof valueB === 'string'
        ? new Date(valueB).getTime()
        : (valueB as number);

    return order === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });
}

export function sortTurns(a: EnrichedTurn, b: EnrichedTurn) {
  // 1) incomplete (completed=false) come first
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }

  // 2) within incomplete group: oldest→newest
  if (!a.completed) {
    return (
      new Date(a.created_at!).getTime() -
      new Date(b.created_at!).getTime()
    );
  }

  // 3) within completed group: newest→oldest
  return (
    new Date(b.created_at!).getTime() -
    new Date(a.created_at!).getTime()
  );
}
