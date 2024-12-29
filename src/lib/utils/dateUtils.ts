export function formatToISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
