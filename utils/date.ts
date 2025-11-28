const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const endOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
};

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const differenceInCalendarDays = (a: Date, b: Date) => {
  const startA = startOfDay(a).getTime();
  const startB = startOfDay(b).getTime();
  return Math.round((startA - startB) / DAY_IN_MS);
};

export const formatFriendlyDate = (date: Date, locale?: string) => {
  const today = new Date();
  const diff = differenceInCalendarDays(today, date);

  if (diff === 0) {
    return 'Today';
  }
  if (diff === 1) {
    return 'Yesterday';
  }
  if (diff === -1) {
    return 'Tomorrow';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (date.getFullYear() !== today.getFullYear() || Math.abs(diff) >= 180) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString(locale ?? undefined, options);
};

export const normalizeRange = (range: { start: Date; end: Date }) => ({
  start: startOfDay(range.start),
  end: endOfDay(range.end),
});

export const getCurrentWeekRange = () => {
  const today = startOfDay(new Date());
  const start = new Date(today);
  const weekday = (start.getDay() + 6) % 7; // Monday as first day
  start.setDate(start.getDate() - weekday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end: endOfDay(end) };
};

export const getCurrentMonthRange = () => {
  const today = new Date();
  const start = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  return { start, end };
};

export const getCurrentYearRange = () => {
  const today = new Date();
  const start = startOfDay(new Date(today.getFullYear(), 0, 1));
  const end = endOfDay(new Date(today.getFullYear(), 11, 31));
  return { start, end };
};

export const getRelativePeriodLabel = (range: { start: Date; end: Date } | null) => {
  if (!range) {
    return 'All Time';
  }

  const normalized = normalizeRange(range);
  const week = getCurrentWeekRange();
  const month = getCurrentMonthRange();
  const year = getCurrentYearRange();

  if (isSameDay(normalized.start, week.start) && isSameDay(normalized.end, week.end)) {
    return 'This Week';
  }
  if (isSameDay(normalized.start, month.start) && isSameDay(normalized.end, month.end)) {
    return 'This Month';
  }
  if (isSameDay(normalized.start, year.start) && isSameDay(normalized.end, year.end)) {
    return 'This Year';
  }

  return null;
};
