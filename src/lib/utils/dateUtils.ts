export const formatToLocalDateTime = (utcDate: string | null): string => {
  if (!utcDate) return 'N/A';
  const localDate = new Date(utcDate).toLocaleString(); // Adjusts to local timezone
  return localDate;
};

export const formatToLocalTime = (utcDate: string | null): string => {
  if (!utcDate) return 'N/A';
  const localTime = new Date(utcDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }); // Adjusts to local timezone and formats as HH:MM
  return localTime;
};
