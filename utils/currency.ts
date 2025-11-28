const toCompactString = (num: number) => {
  const digits = num >= 10 ? 1 : 2;
  const factor = digits === 1 ? 10 : 100;
  const truncated = Math.floor(num * factor) / factor;
  const fixed = truncated.toFixed(digits);
  return fixed.replace(/\.?0+$/, '');
};

export const formatCompactCurrency = (value: number): string => {
  const sign = value < 0 ? '-' : '';
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    const compact = toCompactString(absValue / 1e9);
    return `${sign}$${compact}B`;
  }
  if (absValue >= 1e6) {
    const compact = toCompactString(absValue / 1e6);
    return `${sign}$${compact}M`;
  }
  if (absValue >= 1e3) {
    const compact = toCompactString(absValue / 1e3);
    return `${sign}$${compact}K`;
  }

  const formatted = absValue.toLocaleString(undefined, {
    minimumFractionDigits: absValue < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `${sign}$${formatted}`;
};