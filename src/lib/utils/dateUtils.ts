export function formatToISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}


export const getLocalDateRange = (): { startOfDay: Date; endOfDay: Date } => {
  const localDate = new Date();

  const startOfDay = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    0, // Midnight start
    0,
    0,
    0
  );

  const endOfDay = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    23, // End of day
    59,
    59,
    999
  );

  return {
    startOfDay: new Date(startOfDay.toISOString()), // Convert to UTC
    endOfDay: new Date(endOfDay.toISOString()),     // Convert to UTC
  };
};
