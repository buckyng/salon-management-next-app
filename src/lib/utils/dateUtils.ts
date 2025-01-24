import { endOfDay, parse, startOfDay } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';

const timeZone = 'America/Toronto';

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
    timeZone,
  }); // Adjusts to local timezone and formats as HH:MM
  return localTime;
};

export const getCurrentLocalDate = () => {
  const now = new Date();
  const zonedDate = toZonedTime(now, timeZone);
  return format(zonedDate, 'yyyy-MM-dd', { timeZone });
};

// Parse the date as a local date
export const getStartOfDay = (date: string): Date => {
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date()); // Parse as local date
  return startOfDay(parsedDate); // Start of day in local time
};

export const getEndOfDay = (date: string): Date => {
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date()); // Parse as local date
  return endOfDay(parsedDate); // End of day in local time
};
