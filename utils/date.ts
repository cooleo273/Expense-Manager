const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
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
